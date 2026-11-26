"""Local-first SQLite store (single user now; project_id/actor columns keep the
schema multi-user-ready). The audit log is append-only: there is deliberately
no update/delete API for it, and triggers enforce this at the database level."""
from __future__ import annotations
import csv, datetime, io, json, re, sqlite3, time, hashlib
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS profile(key TEXT PRIMARY KEY, val TEXT);
CREATE TABLE IF NOT EXISTS progress(module_id INTEGER PRIMARY KEY, completed INTEGER, ts REAL);
CREATE TABLE IF NOT EXISTS quiz_attempts(id INTEGER PRIMARY KEY, module_id INT, score INT, total INT, ts REAL, answers TEXT);
CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY, module_id INT, body TEXT, ts REAL);
CREATE TABLE IF NOT EXISTS projects(id INTEGER PRIMARY KEY, name TEXT, discipline TEXT, review_type TEXT,
  is_teaching INT DEFAULT 0, question TEXT DEFAULT '{}', created REAL);
CREATE TABLE IF NOT EXISTS decisions(id INTEGER PRIMARY KEY, project_id INT, text TEXT, kind TEXT, ts REAL);
CREATE TABLE IF NOT EXISTS audit_log(id INTEGER PRIMARY KEY, ts REAL, project_id INT, actor TEXT, action TEXT, detail TEXT);
CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON audit_log BEGIN SELECT RAISE(ABORT,'audit_log is append-only'); END;
CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON audit_log BEGIN SELECT RAISE(ABORT,'audit_log is append-only'); END;
CREATE TABLE IF NOT EXISTS search_log(id INTEGER PRIMARY KEY, project_id INT, database TEXT, platform TEXT, searched_on TEXT,
  query TEXT, filters TEXT, n_results INT, n_exported INT, operator TEXT, notes TEXT, access_limits TEXT, export_file TEXT, ts REAL);
CREATE TABLE IF NOT EXISTS refs(id INTEGER PRIMARY KEY, project_id INT, title TEXT, authors TEXT, year TEXT, journal TEXT,
  doi TEXT, pmid TEXT, abstract TEXT, source TEXT, raw TEXT, dup_of INT DEFAULT NULL, dup_reason TEXT, ts REAL);
CREATE TABLE IF NOT EXISTS screening(id INTEGER PRIMARY KEY, project_id INT, ref_id INT, stage TEXT, decision TEXT,
  reason TEXT, reviewer TEXT, ts REAL);
CREATE TABLE IF NOT EXISTS plan_tasks(project_id INT, task_key TEXT, done INT, ts REAL, PRIMARY KEY(project_id, task_key));
CREATE TABLE IF NOT EXISTS extraction(id INTEGER PRIMARY KEY, project_id INT, study_id TEXT, field TEXT, reported_value TEXT,
  unit TEXT, source_doc TEXT, page TEXT, table_fig TEXT, reviewer TEXT, status TEXT, uncertainty TEXT, notes TEXT, ts REAL);
CREATE TABLE IF NOT EXISTS studies(project_id INT, study_id TEXT, label TEXT, notes TEXT, ts REAL, PRIMARY KEY(project_id, study_id));
CREATE TABLE IF NOT EXISTS reports(project_id INT, report_id TEXT, study_id TEXT, ref_id INT, relation TEXT, ts REAL, PRIMARY KEY(project_id, report_id));
CREATE TABLE IF NOT EXISTS project_forms(project_id INT PRIMARY KEY, workflow TEXT, schema TEXT, ts REAL);
CREATE TABLE IF NOT EXISTS extracted(id INTEGER PRIMARY KEY, project_id INT, study_id TEXT, report_id TEXT, experiment_id TEXT, field TEXT,
  value_raw TEXT, unit_raw TEXT, value_clean REAL, unit_clean TEXT, transform TEXT, source_doc TEXT, page TEXT, table_fig TEXT,
  reviewer TEXT, uncertainty TEXT, missing_reason TEXT, notes TEXT, verification TEXT DEFAULT 'unverified', verifier TEXT,
  supersedes INT, ts REAL);
CREATE TABLE IF NOT EXISTS effect_sizes(effect_id TEXT, project_id INT, study_id TEXT, experiment_id TEXT, measure TEXT, yi REAL, vi REAL,
  control_group_id TEXT, outcome TEXT, timepoint TEXT, group_label TEXT, source TEXT, ts REAL, PRIMARY KEY(project_id, effect_id));
CREATE TABLE IF NOT EXISTS rob(id INTEGER PRIMARY KEY, project_id INT, study_id TEXT, outcome TEXT, tool TEXT, domain TEXT, judgement TEXT,
  support TEXT, reviewer TEXT, ts REAL);
CREATE TABLE IF NOT EXISTS cards(card_key TEXT PRIMARY KEY, ease REAL, interval INT, reps INT, lapses INT, due TEXT, last_reviewed REAL);
CREATE TABLE IF NOT EXISTS contacts(id INTEGER PRIMARY KEY, name TEXT, role TEXT, org TEXT, discipline TEXT, expertise TEXT, how_met TEXT, contact_ok TEXT, notes TEXT, ts REAL);
CREATE TABLE IF NOT EXISTS interactions(id INTEGER PRIMARY KEY, contact_id INT, date TEXT, kind TEXT, summary TEXT, followup_due TEXT, followup_done INT DEFAULT 0, ts REAL);
CREATE TABLE IF NOT EXISTS credit(id INTEGER PRIMARY KEY, project_id INT, person TEXT, role TEXT, note TEXT, ts REAL);
CREATE TABLE IF NOT EXISTS bookmarks(kind TEXT, ref TEXT, ts REAL, PRIMARY KEY(kind, ref));
CREATE TABLE IF NOT EXISTS dup_candidates(id INTEGER PRIMARY KEY, project_id INT, ref_a INT, ref_b INT, score REAL, reasons TEXT,
  relation TEXT, status TEXT DEFAULT 'pending', decided_by TEXT, ts REAL);
"""
DECISIONS = ["include", "exclude", "uncertain", "awaiting_full_text", "needs_translation", "needs_author_clarification"]
STAGES = ["title_abstract", "full_text"]


class Store:
    def __init__(self, path="data/metalab.sqlite"):
        if path != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.path = path
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SCHEMA)
        self.db.commit()

    # ------------------------------------------------------------------ util
    def q(self, sql, args=()):
        return [dict(r) for r in self.db.execute(sql, args).fetchall()]

    def x(self, sql, args=()):
        cur = self.db.execute(sql, args); self.db.commit(); return cur.lastrowid

    def audit(self, action, detail="", project_id=None, actor="user"):
        self.x("INSERT INTO audit_log(ts,project_id,actor,action,detail) VALUES(?,?,?,?,?)",
               (time.time(), project_id, actor, action, detail))

    # --------------------------------------------------------------- profile
    def set_profile(self, **kw):
        for k, v in kw.items():
            self.x("INSERT INTO profile(key,val) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET val=excluded.val",
                   (k, json.dumps(v)))
        self.audit("profile_updated", ",".join(kw))

    def profile(self):
        return {r["key"]: json.loads(r["val"]) for r in self.q("SELECT * FROM profile")}

    # -------------------------------------------------------------- progress
    def set_complete(self, module_id, done=True):
        self.x("INSERT INTO progress VALUES(?,?,?) ON CONFLICT(module_id) DO UPDATE SET completed=excluded.completed, ts=excluded.ts",
               (module_id, int(done), time.time()))

    def completed(self):
        return {r["module_id"] for r in self.q("SELECT module_id FROM progress WHERE completed=1")}

    def record_quiz(self, module_id, answers, key):
        score = sum(a == k for a, k in zip(answers, key))
        self.x("INSERT INTO quiz_attempts(module_id,score,total,ts,answers) VALUES(?,?,?,?,?)",
               (module_id, score, len(key), time.time(), json.dumps(answers)))
        return score

    def best_quiz(self, module_id):
        r = self.q("SELECT MAX(1.0*score/total) AS b FROM quiz_attempts WHERE module_id=?", (module_id,))
        return r[0]["b"]

    def add_note(self, module_id, body):
        self.x("INSERT INTO notes(module_id,body,ts) VALUES(?,?,?)", (module_id, body, time.time()))

    def notes(self, module_id=None):
        if module_id is None:
            return self.q("SELECT * FROM notes ORDER BY ts DESC")
        return self.q("SELECT * FROM notes WHERE module_id=? ORDER BY ts DESC", (module_id,))

    # -------------------------------------------------------------- projects
    def create_project(self, name, discipline, review_type, is_teaching=False):
        if not name.strip():
            raise ValueError("Project name required.")
        pid = self.x("INSERT INTO projects(name,discipline,review_type,is_teaching,created) VALUES(?,?,?,?,?)",
                     (name.strip(), discipline, review_type, int(is_teaching), time.time()))
        self.audit("project_created", f"{name} [{review_type}] teaching={is_teaching}", pid)
        return pid

    def projects(self):
        return self.q("SELECT * FROM projects ORDER BY created DESC")

    def save_question(self, pid, question: dict):
        self.x("UPDATE projects SET question=? WHERE id=?", (json.dumps(question), pid))
        self.audit("question_saved", json.dumps(question)[:500], pid)

    def get_question(self, pid):
        r = self.q("SELECT question FROM projects WHERE id=?", (pid,))
        return json.loads(r[0]["question"]) if r else {}

    def add_decision(self, pid, text, kind="decision"):
        self.x("INSERT INTO decisions(project_id,text,kind,ts) VALUES(?,?,?,?)", (pid, text, kind, time.time()))
        self.audit("decision_logged", f"[{kind}] {text}", pid)

    def decisions(self, pid):
        return self.q("SELECT * FROM decisions WHERE project_id=? ORDER BY ts DESC", (pid,))

    def audit_rows(self, pid=None):
        if pid is None:
            return self.q("SELECT * FROM audit_log ORDER BY id DESC")
        return self.q("SELECT * FROM audit_log WHERE project_id=? ORDER BY id DESC", (pid,))

    # ---------------------------------------------------------------- search
    def log_search(self, pid, database, platform, searched_on, query, filters, n_results,
                   n_exported, operator, notes="", access_limits="", export_file=""):
        if not query.strip() or not database.strip() or not searched_on.strip():
            raise ValueError("Database, date and exact query are required to log a search.")
        sid = self.x("INSERT INTO search_log(project_id,database,platform,searched_on,query,filters,n_results,n_exported,operator,notes,access_limits,export_file,ts) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
                     (pid, database, platform, searched_on, query, filters, n_results, n_exported, operator, notes, access_limits, export_file, time.time()))
        self.audit("search_logged", f"{database} {searched_on} results={n_results}", pid)
        return sid

    def searches(self, pid):
        return self.q("SELECT * FROM search_log WHERE project_id=? ORDER BY id", (pid,))

    # ------------------------------------------------------------ references
    def import_refs(self, pid, text, filename="pasted"):
        recs = parse_ris(text) if "TY  -" in text else parse_pubmed_nbib(text) if "PMID- " in text else []
        if not recs:
            raise ValueError("No records recognised. Supported: RIS (TY  -) and PubMed NBIB/MEDLINE (PMID- ).")
        for r in recs:
            self.x("INSERT INTO refs(project_id,title,authors,year,journal,doi,pmid,abstract,source,raw,ts) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                   (pid, r["title"], r["authors"], r["year"], r["journal"], r["doi"], r["pmid"], r["abstract"],
                    filename, r["raw"], time.time()))
        sha = hashlib.sha256(text.encode()).hexdigest()[:16]
        self.audit("references_imported", f"{len(recs)} records from {filename} sha256:{sha}", pid)
        return len(recs)

    def refs(self, pid, include_dups=True):
        sql = "SELECT * FROM refs WHERE project_id=?" + ("" if include_dups else " AND dup_of IS NULL") + " ORDER BY id"
        return self.q(sql, (pid,))

    def deduplicate(self, pid):
        """Mark later records as duplicates of the first (keeps ALL originals; reversible)."""
        seen_doi, seen_pmid, seen_title, n = {}, {}, {}, 0
        for r in self.refs(pid):
            if r["dup_of"] is not None:
                continue
            keys = [("doi", norm_doi(r["doi"]), seen_doi), ("pmid", (r["pmid"] or "").strip(), seen_pmid),
                    ("title+year", norm_title(r["title"]) + "|" + (r["year"] or ""), seen_title)]
            hit = None
            for name, k, d in keys:
                if k and k not in ("|", "") and not k.startswith("|") and k in d:
                    hit = (d[k], name); break
            if hit:
                self.x("UPDATE refs SET dup_of=?, dup_reason=? WHERE id=?", (hit[0], hit[1], r["id"])); n += 1
            else:
                for name, k, d in keys:
                    if k and not k.startswith("|"):
                        d.setdefault(k, r["id"])
        self.audit("deduplicated", f"{n} records marked duplicate (exact DOI/PMID/title+year; fuzzy matching NOT implemented)", pid)
        return n

    def undo_duplicate(self, ref_id, pid=None):
        self.x("UPDATE refs SET dup_of=NULL, dup_reason=NULL WHERE id=?", (ref_id,))
        self.audit("duplicate_reverted", f"ref {ref_id}", pid)

    # ------------------------------------------------------------- screening
    def screen(self, pid, ref_id, stage, decision, reason="", reviewer="human:self"):
        if stage not in STAGES or decision not in DECISIONS:
            raise ValueError("Invalid stage or decision.")
        if stage == "full_text" and decision == "exclude" and not reason.strip():
            raise ValueError("Full-text exclusions require a documented reason.")
        if reviewer.lower().startswith(("ai", "llm", "model")):
            raise ValueError("AI output cannot be recorded as an independent reviewer decision. Record AI suggestions in notes and have a human decide.")
        self.x("INSERT INTO screening(project_id,ref_id,stage,decision,reason,reviewer,ts) VALUES(?,?,?,?,?,?,?)",
               (pid, ref_id, stage, decision, reason, reviewer, time.time()))
        self.audit("screened", f"ref {ref_id} {stage}={decision} {reason}", pid, actor=reviewer)

    def latest_decisions(self, pid, stage):
        rows = self.q("SELECT * FROM screening WHERE project_id=? AND stage=? ORDER BY id", (pid, stage))
        last = {}
        for r in rows:
            last[(r["ref_id"], r["reviewer"])] = r
        return last

    def prisma_counts(self, pid):
        """Counts derived strictly from stored records; returns (counts, warnings)."""
        refs = self.refs(pid)
        ident = len(refs); dups = sum(r["dup_of"] is not None for r in refs)
        uniq = {r["id"] for r in refs if r["dup_of"] is None}
        def final(stage):
            d = {}
            for (rid, rev), r in self.latest_decisions(pid, stage).items():
                d.setdefault(rid, []).append(r)
            return d
        ta, ft = final("title_abstract"), final("full_text")
        def status(lst):  # single-reviewer: last decision; multi: all must agree else conflict
            ds = {x["decision"] for x in lst}
            return ds.pop() if len(ds) == 1 else "conflict"
        ta_s = {i: status(v) for i, v in ta.items() if i in uniq}
        ft_s = {i: status(v) for i, v in ft.items() if i in uniq}
        excl_ta = sum(v == "exclude" for v in ta_s.values())
        sought = len(ft_s)
        excl_ft = [i for i, v in ft_s.items() if v == "exclude"]
        reasons = {}
        for i in excl_ft:
            for r in ft[i]:
                if r["decision"] == "exclude":
                    reasons[r["reason"].strip()] = reasons.get(r["reason"].strip(), 0) + 1
                    break
        included = sum(v == "include" for v in ft_s.values())
        c = dict(identified=ident, duplicates_removed=dups, screened=len(uniq), screened_decided=len(ta_s),
                 excluded_title_abstract=excl_ta, reports_sought=sought, excluded_full_text=len(excl_ft),
                 exclusion_reasons=reasons, included=included,
                 conflicts=sum(v == "conflict" for v in list(ta_s.values()) + list(ft_s.values())))
        w = []
        if len(ta_s) < len(uniq):
            w.append(f"{len(uniq) - len(ta_s)} unique records have no title/abstract decision yet.")
        if any(i not in {k for k, v in ta_s.items() if v in ("include", "uncertain", "awaiting_full_text", "needs_translation", "needs_author_clarification")} for i in ft_s):
            w.append("Some records at full-text stage were not advanced (include/uncertain) at title/abstract stage.")
        if c["conflicts"]:
            w.append(f"{c['conflicts']} unresolved reviewer conflicts.")
        if sum(reasons.values()) != c["excluded_full_text"]:
            w.append("Some full-text exclusions lack a recorded reason.")
        if included + c["excluded_full_text"] != sought:
            w.append("Full-text records not yet finally decided (include/exclude): "
                     f"{sought - included - c['excluded_full_text']}.")
        return c, w

    # ------------------------------------------------------------- plan tasks
    def set_task(self, pid, key, done):
        self.x("INSERT INTO plan_tasks VALUES(?,?,?,?) ON CONFLICT(project_id,task_key) DO UPDATE SET done=excluded.done, ts=excluded.ts",
               (pid, key, int(done), time.time()))
        self.audit("plan_task", f"{key}={'done' if done else 'open'}", pid)

    def tasks_done(self, pid):
        return {r["task_key"] for r in self.q("SELECT task_key FROM plan_tasks WHERE project_id=? AND done=1", (pid,))}

    # -------------------------------------------------------- identifiers
    def new_study(self, pid, label, notes=""):
        n = self.q("SELECT COUNT(*) c FROM studies WHERE project_id=?", (pid,))[0]["c"] + 1
        sid = f"S{n:03d}"
        self.x("INSERT INTO studies VALUES(?,?,?,?,?)", (pid, sid, label, notes, time.time()))
        self.audit("study_created", f"{sid} {label}", pid); return sid

    def studies(self, pid):
        return self.q("SELECT * FROM studies WHERE project_id=? ORDER BY study_id", (pid,))

    def link_report(self, pid, study_id, ref_id=None, relation="primary report"):
        n = self.q("SELECT COUNT(*) c FROM reports WHERE project_id=? AND study_id=?", (pid, study_id))[0]["c"] + 1
        rid = f"{study_id}-R{n}"
        self.x("INSERT INTO reports VALUES(?,?,?,?,?,?)", (pid, rid, study_id, ref_id, relation, time.time()))
        self.audit("report_linked", f"{rid} ref={ref_id} ({relation})", pid); return rid

    def reports(self, pid):
        return self.q("SELECT * FROM reports WHERE project_id=? ORDER BY report_id", (pid,))

    # ---------------------------------------------------------- forms
    def set_form(self, pid, workflow, schema):
        self.x("INSERT INTO project_forms VALUES(?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET workflow=excluded.workflow, schema=excluded.schema, ts=excluded.ts",
               (pid, workflow, json.dumps(schema), time.time()))
        self.audit("extraction_form_set", f"workflow={workflow} fields={len(schema)}", pid)

    def get_form(self, pid):
        r = self.q("SELECT * FROM project_forms WHERE project_id=?", (pid,))
        return (r[0]["workflow"], json.loads(r[0]["schema"])) if r else (None, [])

    # -------------------------------------------------------- extraction
    def extract(self, pid, study_id, field, value_raw, unit_raw="", source_doc="", page="", table_fig="", reviewer="human:self",
                experiment_id="E1", report_id=None, uncertainty="reported", missing_reason="", notes="", value_clean=None, unit_clean=None, transform="none"):
        """Append-only: a correction is a NEW row that supersedes the old one; raw history is never overwritten."""
        if reviewer.lower().startswith(("ai", "llm", "model")):
            raise ValueError("AI output cannot be recorded as a human extractor. Record suggestions in notes; a human must enter the value.")
        if uncertainty not in ("reported", "estimated", "reconstructed", "imputed", "calculated"):
            raise ValueError("uncertainty must be reported/estimated/reconstructed/imputed/calculated")
        if str(value_raw).strip() == "" and not missing_reason.strip():
            raise ValueError("Empty value requires a missing_reason (missing is not zero).")
        if uncertainty != "reported" and not notes.strip():
            raise ValueError("Non-reported values (estimated/reconstructed/imputed/calculated) require a note describing the method.")
        if not source_doc.strip() and str(value_raw).strip() != "":
            raise ValueError("Every extracted value needs a source document (and ideally page/table).")
        prev = self.q("SELECT id FROM extracted WHERE project_id=? AND study_id=? AND experiment_id=? AND field=? ORDER BY id DESC LIMIT 1", (pid, study_id, experiment_id, field))
        if value_clean is None and str(value_raw).strip() != "":
            try: value_clean = float(str(value_raw).replace(",", ""))
            except ValueError: value_clean = None
        eid = self.x("INSERT INTO extracted(project_id,study_id,report_id,experiment_id,field,value_raw,unit_raw,value_clean,unit_clean,transform,source_doc,page,table_fig,reviewer,uncertainty,missing_reason,notes,supersedes,ts) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                     (pid, study_id, report_id, experiment_id, field, str(value_raw), unit_raw, value_clean, unit_clean or unit_raw, transform, source_doc, page, table_fig, reviewer, uncertainty, missing_reason, notes, prev[0]["id"] if prev else None, time.time()))
        self.audit("value_extracted", f"{study_id}/{experiment_id}/{field}={value_raw} {unit_raw} [{uncertainty}]", pid, actor=reviewer); return eid

    def verify_extraction(self, pid, extracted_id, verifier, agrees, note=""):
        r = self.q("SELECT * FROM extracted WHERE id=? AND project_id=?", (extracted_id, pid))
        if not r: raise ValueError("No such extracted value.")
        if verifier == r[0]["reviewer"]:
            raise ValueError("Verification must be by a different person than the extractor (self-verification is not independent).")
        if verifier.lower().startswith(("ai", "llm", "model")):
            raise ValueError("AI cannot verify extracted data.")
        self.x("UPDATE extracted SET verification=?, verifier=? WHERE id=?", ("verified" if agrees else "disputed", verifier, extracted_id))
        self.audit("extraction_verified" if agrees else "extraction_disputed", f"id {extracted_id} {note}", pid, actor=verifier)

    def current_extracted(self, pid):
        rows = self.q("SELECT * FROM extracted WHERE project_id=? ORDER BY id", (pid,))
        sup = {r["supersedes"] for r in rows if r["supersedes"]}
        return [r for r in rows if r["id"] not in sup]

    def extraction_history(self, pid, study_id, experiment_id, field):
        return self.q("SELECT * FROM extracted WHERE project_id=? AND study_id=? AND experiment_id=? AND field=? ORDER BY id", (pid, study_id, experiment_id, field))

    def save_effect(self, pid, study_id, experiment_id, measure, yi, vi, control_group_id="", outcome="", timepoint="", group_label="", source=""):
        n = self.q("SELECT COUNT(*) c FROM effect_sizes WHERE project_id=?", (pid,))[0]["c"] + 1
        eid = f"{study_id}-{experiment_id}-ES{n}"
        self.x("INSERT INTO effect_sizes VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", (eid, pid, study_id, experiment_id, measure, yi, vi, control_group_id, outcome, timepoint, group_label, source, time.time()))
        self.audit("effect_size_saved", f"{eid} {measure} yi={yi:.4g} vi={vi:.4g}", pid); return eid

    def effects(self, pid):
        return self.q("SELECT * FROM effect_sizes WHERE project_id=? ORDER BY effect_id", (pid,))

    # ------------------------------------------------------ risk of bias
    def rate_rob(self, pid, study_id, tool, domain, judgement, support, reviewer="human:self", outcome="overall"):
        from .rob_tools import TOOLS
        if reviewer.lower().startswith(("ai", "llm", "model")):
            raise ValueError("AI cannot be recorded as a risk-of-bias reviewer.")
        t = TOOLS.get(tool)
        if not t or domain not in t["domains"] and tool != "CUSTOM":
            raise ValueError("Unknown tool/domain.")
        if judgement not in t["judgements"]:
            raise ValueError(f"Judgement must be one of {t['judgements']}.")
        if not support.strip():
            raise ValueError("A supporting quote/rationale is required for every judgement.")
        self.x("INSERT INTO rob(project_id,study_id,outcome,tool,domain,judgement,support,reviewer,ts) VALUES(?,?,?,?,?,?,?,?,?)", (pid, study_id, outcome, tool, domain, judgement, support, reviewer, time.time()))
        self.audit("rob_rated", f"{study_id} {tool}/{domain}={judgement}", pid, actor=reviewer)

    def rob_current(self, pid, reviewer=None):
        rows = self.q("SELECT * FROM rob WHERE project_id=? ORDER BY id", (pid,))
        last = {}
        for r in rows:
            last[(r["study_id"], r["outcome"], r["tool"], r["domain"], r["reviewer"])] = r
        out = list(last.values())
        return [r for r in out if reviewer is None or r["reviewer"] == reviewer]

    # ------------------------------------------------- fuzzy dedup (human)
    def find_dup_candidates(self, pid, threshold=0.88):
        from .workflow import fuzzy_pairs
        refs = [r for r in self.refs(pid) if r["dup_of"] is None]
        existing = {(c["ref_a"], c["ref_b"]) for c in self.q("SELECT ref_a, ref_b FROM dup_candidates WHERE project_id=?", (pid,))}
        n = 0
        for a, b, score, reasons, relation in fuzzy_pairs(refs, threshold):
            if (a, b) in existing: continue
            self.x("INSERT INTO dup_candidates(project_id,ref_a,ref_b,score,reasons,relation,ts) VALUES(?,?,?,?,?,?,?)", (pid, a, b, round(score, 3), reasons, relation, time.time())); n += 1
        self.audit("fuzzy_dedup_candidates", f"{n} new candidate pairs (threshold {threshold}); NOTHING merged until a human confirms", pid); return n

    def decide_dup(self, pid, cand_id, confirm, decided_by="human:self"):
        if decided_by.lower().startswith(("ai", "llm", "model")):
            raise ValueError("Duplicate decisions must be made by a human.")
        c = self.q("SELECT * FROM dup_candidates WHERE id=? AND project_id=?", (cand_id, pid))
        if not c: raise ValueError("No such candidate.")
        c = c[0]
        self.x("UPDATE dup_candidates SET status=?, decided_by=?, ts=? WHERE id=?", ("confirmed" if confirm else "rejected", decided_by, time.time(), cand_id))
        if confirm:
            self.x("UPDATE refs SET dup_of=?, dup_reason=? WHERE id=?", (c["ref_a"], f"fuzzy ({c['relation']}; score {c['score']}) confirmed by {decided_by}", c["ref_b"]))
        self.audit("dup_confirmed" if confirm else "dup_rejected", f"pair {c['ref_a']}-{c['ref_b']} score {c['score']}", pid, actor=decided_by)

    def dup_candidates(self, pid, status=None):
        sql = "SELECT * FROM dup_candidates WHERE project_id=?" + (" AND status=?" if status else "") + " ORDER BY score DESC"
        return self.q(sql, (pid, status) if status else (pid,))

    # ------------------------------------------------- flashcards / bookmarks
    def card_review(self, key, quality, today=None):
        from .learning import sm2
        today = today or datetime.date.today()
        r = self.q("SELECT * FROM cards WHERE card_key=?", (key,))
        ease, interval, reps, lapses = (r[0]["ease"], r[0]["interval"], r[0]["reps"], r[0]["lapses"]) if r else (2.5, 0, 0, 0)
        ease, interval, reps, lapsed = sm2(ease, interval, reps, quality)
        due = (today + datetime.timedelta(days=interval)).isoformat()
        self.x("INSERT INTO cards VALUES(?,?,?,?,?,?,?) ON CONFLICT(card_key) DO UPDATE SET ease=excluded.ease, interval=excluded.interval, reps=excluded.reps, lapses=excluded.lapses, due=excluded.due, last_reviewed=excluded.last_reviewed",
               (key, ease, interval, reps, lapses + int(lapsed), due, time.time()))
        return due

    def cards_due(self, all_keys, today=None):
        """Keys never seen (new) + keys whose due date has arrived, oldest-due first."""
        today = (today or datetime.date.today()).isoformat()
        seen = {r["card_key"]: r["due"] for r in self.q("SELECT card_key, due FROM cards")}
        due = sorted([k for k in all_keys if k in seen and seen[k] <= today], key=lambda k: seen[k])
        new = [k for k in all_keys if k not in seen]
        return due, new

    def toggle_bookmark(self, kind, ref):
        if self.q("SELECT 1 FROM bookmarks WHERE kind=? AND ref=?", (kind, str(ref))):
            self.x("DELETE FROM bookmarks WHERE kind=? AND ref=?", (kind, str(ref))); return False
        self.x("INSERT INTO bookmarks VALUES(?,?,?)", (kind, str(ref), time.time())); return True

    def bookmarks(self):
        return self.q("SELECT * FROM bookmarks ORDER BY ts DESC")

    # ------------------------------------------- local collaborator manager
    def add_contact(self, name, role="", org="", discipline="", expertise="", how_met="", contact_ok="", notes=""):
        """Contacts are people YOU add manually (stored only in this local file). Nothing is ever sent to them by the app."""
        if not name.strip(): raise ValueError("Name required.")
        cid = self.x("INSERT INTO contacts(name,role,org,discipline,expertise,how_met,contact_ok,notes,ts) VALUES(?,?,?,?,?,?,?,?,?)", (name.strip(), role, org, discipline, expertise, how_met, contact_ok, notes, time.time()))
        self.audit("contact_added", f"contact {cid} (details not logged)"); return cid

    def contacts(self): return self.q("SELECT * FROM contacts ORDER BY name")

    def delete_contact(self, cid):
        self.x("DELETE FROM interactions WHERE contact_id=?", (cid,)); self.x("DELETE FROM contacts WHERE id=?", (cid,)); self.audit("contact_deleted", f"contact {cid}")

    def log_interaction(self, contact_id, date, kind, summary, followup_due=""):
        if not self.q("SELECT 1 FROM contacts WHERE id=?", (contact_id,)): raise ValueError("No such contact.")
        return self.x("INSERT INTO interactions(contact_id,date,kind,summary,followup_due,ts) VALUES(?,?,?,?,?,?)", (contact_id, date, kind, summary, followup_due, time.time()))

    def interactions(self, contact_id=None):
        return self.q("SELECT * FROM interactions" + (" WHERE contact_id=?" if contact_id else "") + " ORDER BY date DESC", (contact_id,) if contact_id else ())

    def followups_due(self, today=None):
        today = (today or datetime.date.today()).isoformat()
        return self.q("SELECT i.*, c.name FROM interactions i JOIN contacts c ON c.id=i.contact_id WHERE i.followup_due!='' AND i.followup_due<=? AND i.followup_done=0 ORDER BY i.followup_due", (today,))

    def complete_followup(self, interaction_id): self.x("UPDATE interactions SET followup_done=1 WHERE id=?", (interaction_id,))

    def add_credit(self, pid, person, role, note=""):
        from .templates_lib import CREDIT_ROLES
        if role not in CREDIT_ROLES: raise ValueError("Role must be one of the 14 CRediT roles.")
        if not note.strip(): raise ValueError("Describe the substantive contribution (CRediT roles describe what was actually done).")
        self.x("INSERT INTO credit(project_id,person,role,note,ts) VALUES(?,?,?,?,?)", (pid, person, role, note, time.time()))
        self.audit("credit_recorded", f"{person}: {role}", pid)

    def credits(self, pid): return self.q("SELECT * FROM credit WHERE project_id=? ORDER BY person, role", (pid,))

    # ----------------------------------------------------------- export/backup
    def backup_json(self):
        tables = ["profile","progress","quiz_attempts","notes","projects","decisions","audit_log","search_log","refs","screening","plan_tasks","extraction","studies","reports","project_forms","extracted","effect_sizes","rob","dup_candidates","cards","bookmarks","contacts","interactions","credit"]
        return json.dumps({"format": "metalab-backup", "version": 1,
                           "tables": {t: self.q(f"SELECT * FROM {t}") for t in tables}}, indent=1)

    def restore_json(self, text):
        d = json.loads(text)
        if d.get("format") != "metalab-backup":
            raise ValueError("Not a MetaLab backup file.")
        cur = self.db.cursor()
        for t in ("profile","progress","quiz_attempts","notes","projects","decisions","search_log","refs","screening","plan_tasks","extraction","studies","reports","project_forms","extracted","effect_sizes","rob","dup_candidates","cards","bookmarks","contacts","interactions","credit"):
            cur.execute(f"DELETE FROM {t}")
            valid = {r[1] for r in cur.execute(f"PRAGMA table_info({t})")}
            for row in d["tables"].get(t, []):
                if not set(row) <= valid:
                    self.db.rollback()
                    raise ValueError(f"Backup has unknown columns for table {t}; refusing to restore.")
                cols = ",".join(row); ph = ",".join("?" * len(row))
                cur.execute(f"INSERT INTO {t}({cols}) VALUES({ph})", tuple(row.values()))
        self.db.commit()
        self.audit("backup_restored", f"{sum(len(v) for v in d['tables'].values())} rows")

    @staticmethod
    def to_csv(rows):
        if not rows:
            return ""
        s = io.StringIO(); w = csv.DictWriter(s, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
        return s.getvalue()


# ----------------------------------------------------------------- parsers
def norm_doi(d):
    d = (d or "").lower().strip()
    return re.sub(r"^(https?://(dx\.)?doi\.org/|doi:)", "", d)


def norm_title(t):
    return re.sub(r"[^a-z0-9]", "", (t or "").lower())


def parse_ris(text):
    recs, cur = [], None
    for line in text.splitlines():
        m = re.match(r"^([A-Z][A-Z0-9])  - ?(.*)$", line)
        if not m:
            continue
        tag, val = m.groups()
        if tag == "TY":
            cur = {"title": "", "authors": [], "year": "", "journal": "", "doi": "", "pmid": "", "abstract": "", "raw": []}
        if cur is None:
            continue
        cur["raw"].append(line)
        if tag in ("TI", "T1"): cur["title"] = val.strip()
        elif tag in ("AU", "A1"): cur["authors"].append(val.strip())
        elif tag in ("PY", "Y1"): cur["year"] = val.strip()[:4]
        elif tag in ("JO", "JF", "T2", "JA"): cur["journal"] = cur["journal"] or val.strip()
        elif tag == "DO": cur["doi"] = val.strip()
        elif tag in ("AB", "N2"): cur["abstract"] = val.strip()
        elif tag == "AN" and val.strip().isdigit(): cur["pmid"] = val.strip()
        elif tag == "ER":
            cur["authors"] = "; ".join(cur["authors"]); cur["raw"] = "\n".join(cur["raw"]); recs.append(cur); cur = None
    return recs


def parse_pubmed_nbib(text):
    recs = []
    for block in re.split(r"\n\s*\n", text.strip()):
        if "PMID- " not in block:
            continue
        f = {}
        last = None
        for line in block.splitlines():
            m = re.match(r"^([A-Z]{2,4})\s*- (.*)$", line)
            if m:
                last = m.group(1); f.setdefault(last, []).append(m.group(2).strip())
            elif last and line.startswith("      "):
                f[last][-1] += " " + line.strip()
        doi = ""
        for a in f.get("AID", []) + f.get("LID", []):
            if "[doi]" in a: doi = a.replace("[doi]", "").strip()
        recs.append(dict(title=" ".join(f.get("TI", [""])), authors="; ".join(f.get("AU", [])),
                         year=(f.get("DP", [""])[0] or "")[:4], journal=(f.get("JT", [""])[0]),
                         doi=doi, pmid=f.get("PMID", [""])[0], abstract=" ".join(f.get("AB", [])), raw=block))
    return recs
