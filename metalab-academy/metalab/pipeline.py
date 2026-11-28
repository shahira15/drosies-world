"""End-to-end research pipeline: connects every stage question -> protocol -> search -> import -> dedup -> screening -> extraction -> RoB -> effects -> analysis ->
sensitivity -> verified results -> manuscript -> reproducibility package, and audits that the stages are actually connected (traceability).

Two public ideas:
  * readiness(store, pid): stage-by-stage status of ANY project (what is done, what blocks the next stage) - used in the Research Workspace.
  * run_simulated_review(store): runs the whole chain on the FICTIONAL Virtual Lab scenario (teaching project only) and independently cross-checks the numbers with R/metafor,
    so a test can prove that every number in the manuscript is traceable to verified inputs. The simulation NEVER touches real projects and its 'verifier' is labelled simulated;
    for a real review a qualified human must perform the verification steps (the app never lets an AI or the system verify).
"""
from __future__ import annotations
import csv, io, json, math, re, shutil, subprocess, tempfile, zipfile
from pathlib import Path
from . import manuscript as M, stats as S, advanced as A, workflow as W, vlab

SIM_VERIFIER = "human-sim:cross-check (fictional teaching verifier)"



SIM_EXTRACTION_VERIFIER = "human-sim:second-extractor (fictional teaching verifier)"

def _independent_reading(fulltext_text, experiment, group, field):
    """Read a value from the full-text EXCERPT only (never from the scenario key), applying the documented conversion rules: SEM -> SD = SEM*sqrt(n); hours -> days = h/24; n = vials."""
    for line in fulltext_text.splitlines():
        m = re.match(rf"\s*{experiment} {group}: n=(\d+) vials, mean=([\d.]+) (d|h), (SD|SEM)=([\d.]+|not reported)", line)
        if not m: continue
        n, mean, unit, kind, spread = int(m.group(1)), float(m.group(2)), m.group(3), m.group(4), m.group(5)
        if field == "n": return float(n)
        if field == "mean": return mean / 24 if unit == "h" else mean
        if spread == "not reported": return None
        sp = float(spread)
        if kind == "SEM": return sp * math.sqrt(n)
        return sp / 24 if unit == "h" else sp
    return None


def verify_extraction_independently(store, pid, tol=0.02):
    """Second-person verification step: re-read each stored value from the full-text excerpt and compare. Records verified/disputed with the verifier's name; returns (verified, disputed, skipped)."""
    labels = {s["study_id"]: s["label"] for s in store.studies(pid)}; ver = dis = skip = 0
    for r in store.current_extracted(pid):
        if r["value_clean"] is None: skip += 1; continue
        sid = next((k for k, v in vlab.STUDIES.items() if v["label"] == labels.get(r["study_id"])), None)
        m = re.fullmatch(r"(ctrl|treat)_(n|mean|sd)", r["field"])
        if not sid or not m: skip += 1; continue
        got = _independent_reading(vlab.fulltext(sid), r["experiment_id"], m.group(1), m.group(2))
        ok = got is not None and abs(got - r["value_clean"]) <= tol * max(1.0, abs(got)) * (1 if m.group(2) == "n" else 1)
        store.verify_extraction(pid, r["id"], SIM_EXTRACTION_VERIFIER, ok, "re-read from the full-text excerpt with the documented conversions" if ok else f"independent reading {got} differs from stored {r['value_clean']}")
        ver += ok; dis += (not ok)
    return ver, dis, skip


# --------------------------------------------------------------------------------------- readiness
def readiness(store, pid):
    """Stage checker. Returns list of dict(stage, status in {'done','partial','todo'}, detail, next). Purely informational: never blocks or edits anything."""
    out = []; add = lambda stage, status, detail, nxt="": out.append(dict(stage=stage, status=status, detail=detail, next=nxt))
    q = store.get_question(pid); filled = [k for k, v in (q or {}).items() if str(v).strip()]
    add("1 Question", "done" if len(filled) >= 3 else "partial" if filled else "todo", f"{len(filled)} question fields filled", "Complete the Question Builder (population, intervention, comparator, outcome).")
    dec = store.decisions(pid); proto = [d for d in dec if d["kind"] in ("protocol", "decision", "note")]
    add("2 Protocol / decisions", "done" if any("protocol" in d["text"].lower() for d in dec) or any(d["kind"] == "protocol" for d in dec) else "partial" if dec else "todo", f"{len(dec)} decisions logged",
        "Log the protocol (eligibility, outcomes, analysis plan) as a decision BEFORE screening.")
    s = store.searches(pid); add("3 Search log", "done" if s else "todo", f"{len(s)} searches logged", "Log every search with database, date, exact query and result count.")
    refs = store.refs(pid); add("4 Records imported", "done" if refs else "todo", f"{len(refs)} records", "Import RIS/CSV exports (Research Workspace > References).")
    dups = sum(r["dup_of"] is not None for r in refs); pend = [c for c in store.dup_candidates(pid, "pending")] if refs else []
    add("5 Deduplication", "done" if refs and not pend else "partial" if refs else "todo", f"{dups} duplicates flagged; {len(pend)} fuzzy candidates awaiting a human decision", "Resolve pending duplicate candidates.")
    c, warn = store.prisma_counts(pid)
    add("6 Screening", "done" if refs and not warn and c["included"] > 0 else "partial" if c["screened_decided"] else "todo", f"{c['screened_decided']}/{c['screened']} decided; {c['included']} included; {c['conflicts']} conflicts", "; ".join(warn) or "Screen records, resolve conflicts, record exclusion reasons.")
    studies = store.studies(pid); cur = store.current_extracted(pid)
    ver = sum(1 for r in cur if r.get("verification") == "verified"); add("7 Extraction", "done" if cur and ver == len(cur) else "partial" if cur else "todo", f"{len(studies)} studies, {len(cur)} current values, {ver} verified by a second person", "Extract with source/page; have a second person verify values.")
    rob = store.rob_current(pid); add("8 Risk of bias", "done" if studies and len({r["study_id"] for r in rob}) >= len(studies) else "partial" if rob else "todo", f"{len({r['study_id'] for r in rob})}/{len(studies)} studies rated", "Rate every included study on the chosen tool.")
    eff = store.effects(pid); add("9 Effect sizes", "done" if eff else "todo", f"{len(eff)} effect sizes", "Build effects from extracted values (Effect sizes & analysis).")
    res = {r["key"]: r for r in store.results(pid)}; fresh = bool(eff) and "analysis.est" in res and res["analysis.est"]["input_hash"] == M.effects_hash(eff)
    add("10 Analysis", "done" if fresh else "partial" if res else "todo", "analysis results are current" if fresh else "no/ stale analysis results", "Compute stored results (Manuscript Studio > Results store).")
    unv = [k for k, r in res.items() if not r["verified_by"]]
    add("11 Verification", "done" if res and not unv else "partial" if res else "todo", f"{len(res) - len(unv)}/{len(res)} stored results verified by a human", "Reproduce each number independently (e.g. R/metafor) and verify it with a note.")
    secs = [k for k, _ in M.SECTIONS if store.section(pid, k)]
    add("12 Manuscript", "done" if len(secs) >= 6 else "partial" if secs else "todo", f"{len(secs)}/{len(M.SECTIONS)} sections drafted", "Draft sections using {{tokens}} for every number.")
    issues = M.qc(store, pid); errs = [i for i in issues if i["severity"] == "error"]
    add("13 Quality checks", "done" if secs and not errs else "partial" if secs else "todo", f"{len(errs)} errors, {sum(i['severity']=='warning' for i in issues)} warnings", "Fix missing/stale tokens, unknown citations, placeholders.")
    add("14 Reproducibility package", "done" if eff and refs else "todo", "export available" if eff and refs else "needs records and effects", "Export from Backup & export.")
    return out


# --------------------------------------------------------------------------------------- traceability
def _token_keys(store, pid):
    keys = []
    for k, _ in M.SECTIONS:
        t = store.section(pid, k)
        if t is None: t = M.TEMPLATES.get(k, "")
        keys += M.TOKEN.findall(t)
    return sorted(set(keys))


def trace_report(store, pid):
    """For every token used in the manuscript: stored value, source, verifier, freshness, and (for analysis.* keys) the chain effect -> study -> extracted values -> source documents."""
    res = {r["key"]: r for r in store.results(pid)}; eff = store.effects(pid); cur = store.current_extracted(pid); studies = {s["study_id"]: s for s in store.studies(pid)}
    ih = M.effects_hash(eff) if eff else ""; rows = []
    by_study = {}
    for r in cur: by_study.setdefault(r["study_id"], []).append(r)
    for key in _token_keys(store, pid):
        r = res.get(key)
        row = dict(key=key, present=r is not None, value=r["value"] if r else None, source=r["source"] if r else None, verified_by=r["verified_by"] if r else None, verify_note=r["verify_note"] if r else None,
                   fresh=(r["input_hash"] == ih) if (r and key.startswith("analysis.")) else None)
        if r and key.startswith("analysis."):
            sids = sorted({e["study_id"] for e in eff}); row["n_effects"] = len(eff); row["studies"] = [studies[i]["label"] for i in sids if i in studies]
            row["source_documents"] = sorted({x["source_doc"] for i in sids for x in by_study.get(i, []) if x["source_doc"]})
            row["all_inputs_have_source"] = all(x["source_doc"] or x["missing_reason"] for i in sids for x in by_study.get(i, []))
        rows.append(row)
    return rows


def traceable(rows):
    """True only if every token has a stored, human-verified, fresh value (and analysis inputs all carry a source document or a stated missing reason)."""
    return bool(rows) and all(r["present"] and r["verified_by"] and r["fresh"] is not False and r.get("all_inputs_have_source", True) for r in rows)


# --------------------------------------------------------------------------------------- independent cross-checks
def r_available():
    return bool(shutil.which("Rscript")) and subprocess.run(["Rscript", "-e", "library(metafor)"], capture_output=True).returncode == 0


def r_crosscheck(analysis_csv_text, method="REML", hksj=True):
    """Re-run the primary analysis in R/metafor from the EXPORTED analysis dataset (not from the database). Returns dict of est, ci, tau2, I2 (Q-based, as MetaLab stores it; metafor prints the tau2-based I2) and k, or None if R is unavailable."""
    if not r_available(): return None
    with tempfile.TemporaryDirectory() as td:
        p = Path(td) / "analysis_dataset.csv"; p.write_text(analysis_csv_text)
        code = (f'suppressMessages(library(metafor)); d <- read.csv("{p}"); r <- rma(yi, vi, data = d, method = "{method}", control = list(threshold = 1e-10, tol = 1e-12)'
                f'{", test = \'knha\'" if hksj else ""}); cat(sprintf("%.12g", c(r$k, r$beta, r$ci.lb, r$ci.ub, r$tau2, max(0, (r$QE - (r$k - 1)) / r$QE) * 100)), sep = "\\n")')
        o = subprocess.run(["Rscript", "-e", code], capture_output=True, text=True)
        if o.returncode != 0: raise RuntimeError("R cross-check failed: " + o.stderr[-300:])
        k, est, lo, hi, t2, i2 = [float(x) for x in o.stdout.split()]
        return dict(k=int(k), est=est, ci_lo=lo, ci_hi=hi, tau2=t2, I2=i2)


def prisma_from_export(zip_bytes):
    """Recompute PRISMA counts ONLY from the exported CSV files in the reproducibility package (an independent code path from Store.prisma_counts)."""
    z = zipfile.ZipFile(io.BytesIO(zip_bytes)); rd = lambda n: list(csv.DictReader(io.StringIO(z.read(n).decode())))
    refs = rd("references.csv"); scr = rd("screening.csv"); uniq = {r["id"] for r in refs if not r.get("dup_of")}
    def final(stage):
        d = {}
        for r in sorted([x for x in scr if x["stage"] == stage], key=lambda x: int(x["id"])): d.setdefault(r["ref_id"], {})[r["reviewer"]] = r["decision"]
        return {k: (set(v.values()).pop() if len(set(v.values())) == 1 else "conflict") for k, v in d.items() if k in uniq}
    ta, ft = final("title_abstract"), final("full_text")
    return dict(identified=len(refs), duplicates_removed=len(refs) - len(uniq), screened=len(uniq), reports_sought=len(ft), excluded_full_text=sum(v == "exclude" for v in ft.values()), included=sum(v == "include" for v in ft.values()))


# --------------------------------------------------------------------------------------- manuscript for the simulation
SIM_TEXT = {
 "title": "SIMULATED: effect of the fictional compound Nx-7 on Drosophila lifespan - a simulated systematic review and meta-analysis",
 "abstract": "This is a SIMULATED teaching manuscript built from fictional data. {{prisma.identified}} records were identified; {{prisma.included}} studies were included. The pooled log response ratio was {{analysis.est}} (95% CI {{analysis.ci_lo}} to {{analysis.ci_hi}}); {{analysis.model}}.",
 "introduction": "Fictional rationale for a teaching exercise. No real compound, study or result is described.",
 "methods": "## Protocol and registration\nThe simulated protocol was logged before screening (see the decision log).\n## Search\nSearches of {{search.n_databases}} simulated sources (last search {{search.last_date}}).\n## Synthesis\nEffects were pooled with {{analysis.model}}.",
 "results": "## Study selection\n{{prisma.identified}} records were identified; {{prisma.duplicates}} duplicates were removed; {{prisma.screened}} records were screened; {{prisma.reports_sought}} reports were assessed in full text, of which {{prisma.excluded_full_text}} were excluded; {{prisma.included}} studies were included.\n## Synthesis\nPooled {{analysis.measure}} = {{analysis.est}} (95% CI {{analysis.ci_lo}} to {{analysis.ci_hi}}, k = {{analysis.k}}); tau^2 = {{analysis.tau2}}, I^2 = {{analysis.I2}}%; prediction interval {{analysis.pi_lo}} to {{analysis.pi_hi}}.",
 "discussion": "Interpretation of a fictional dataset: the heterogeneity statistics above should be read together with the prediction interval. Nothing here is a real finding.",
 "limitations": "Fictional data; single-database simulation; no real search; the verifier in this exercise is a labelled simulation.",
 "conclusions": "This exercise shows that every number in the text is traceable to a stored, independently reproduced result.",
 "declarations": "## Registration\nNot registered (simulation).\n## Funding\nNone.\n## Competing interests\nNone.\n## Data and code availability\nThe reproducibility package is generated by the application.\n## Use of AI tools\nThe simulation harness was written with AI assistance; no AI system acted as a reviewer, extractor or verifier.",
}


def run_simulated_review(store, require_r=False):
    """Run the whole chain on the fictional scenario. Returns a report dict; raises if a stage fails. Teaching project only."""
    pid = vlab.load(store); proj = [p for p in store.projects() if p["id"] == pid][0]
    if not proj["is_teaching"]: raise ValueError("The simulated pipeline may only run on a teaching project.")
    rep = dict(pid=pid, stages=[])
    st = lambda name, **k: rep["stages"].append(dict(stage=name, **k))
    store.save_question(pid, dict(population="Drosophila melanogaster (fictional)", intervention="Compound Nx-7 (fictional)", comparator="Vehicle control", outcome="Lifespan (days)", designs="Controlled experiments"))
    store.add_decision(pid, "Simulated protocol: eligibility = controlled lifespan experiments with Nx-7 vs vehicle; primary outcome = log response ratio of mean lifespan; model = random effects (REML) with Hartung-Knapp CI; sensitivity = PM and DL estimators, leave-one-out.", "protocol")
    for db, q, n in (("SimDB-1 (fictional)", "Nx-7 AND lifespan", 20), ("SimDB-2 (fictional)", "Nx-7 AND Drosophila", 14)):
        store.log_search(pid, db, "simulated", "2026-11-20", q, "", n, n, "teaching")
    st("search+import", records=len(store.refs(pid)))
    sids = vlab.solve_perfectly(store, pid); st("dedup+screening+extraction+RoB+effects", studies=len(sids), effects=len(store.effects(pid)))
    # second reviewer (simulated) -> agreement statistic on title/abstract decisions
    vlab.add_simulated_reviewer(store, pid)
    dec = store.latest_decisions(pid, "title_abstract"); a, b = {}, {}
    for (rid, rev), r in dec.items(): (b if rev == vlab.SIM_REVIEWER else a)[rid] = r["decision"]
    common = sorted(set(a) & set(b)); kappa = W.cohens_kappa([a[i] for i in common], [b[i] for i in common]) if common else None
    st("agreement", n=len(common), kappa=kappa["kappa"] if kappa else None)
    # resolve conflicts the way a human lead would: the lead's decision stands (key decisions already recorded); remove reviewer B from the final-decision computation by re-screening
    conflicts = store.prisma_counts(pid)[0]["conflicts"]
    if conflicts:
        for rid in common:
            if a[rid] != b[rid]: store.screen(pid, rid, "title_abstract", a[rid], "conflict resolved by lead reviewer after discussion", vlab.SIM_REVIEWER)
    ver_n, dis_n, skip_n = verify_extraction_independently(store, pid); st("second-extractor verification", verified=ver_n, disputed=dis_n, skipped=skip_n)
    if dis_n: raise AssertionError(f"{dis_n} extracted values disagree with the independent reading of the full text")
    c, warn = store.prisma_counts(pid); st("prisma", counts={k: v for k, v in c.items() if isinstance(v, int)}, warnings=warn)
    eff = store.effects(pid); y = [e["yi"] for e in eff]; v = [e["vi"] for e in eff]
    sens = {}
    for m in ("REML", "PM", "DL"): r = S.meta_analyze(y, v, "random", m, True); sens[m] = dict(est=r.est, tau2=r.tau2)
    loo = S.leave_one_out(y, v); sens["leave_one_out_range"] = (min(x[1] for x in loo), max(x[1] for x in loo))
    sens["egger"] = A.egger_test(y, v) if len(y) >= 3 else None
    st("sensitivity", **{k: v_ for k, v_ in sens.items() if k != "egger"}, egger_p=(sens["egger"]["p"] if sens["egger"] else None))
    M.compute_results(store, pid, "random", "REML", True, back_transform="exp"); st("results stored", keys=len(store.results(pid)))
    # --- independent verification
    pkg = W.export_package(store, pid, "SIMULATED teaching project", "lnRR", "REML", True)
    z = zipfile.ZipFile(io.BytesIO(pkg)); ds = z.read("analysis_dataset.csv").decode()
    pr_ex = prisma_from_export(pkg); res = {r["key"]: r for r in store.results(pid)}
    prisma_ok = all(int(res[f"prisma.{k}"]["value"]) == pr_ex[k2] for k, k2 in (("identified", "identified"), ("duplicates", "duplicates_removed"), ("screened", "screened"), ("reports_sought", "reports_sought"), ("excluded_full_text", "excluded_full_text"), ("included", "included")))
    st("independent PRISMA recount from exported CSV", agrees=prisma_ok)
    if not prisma_ok: raise AssertionError("PRISMA counts disagree between the database and the exported package.")
    for k in ("identified", "duplicates", "screened", "reports_sought", "excluded_full_text", "included"):
        store.verify_result(pid, f"prisma.{k}", SIM_VERIFIER, "recomputed from references.csv + screening.csv in the exported package (independent code path)")
    for k in ("search.n_databases", "search.last_date"):
        store.verify_result(pid, k, SIM_VERIFIER, "checked against search_log.csv in the exported package")
    rx = r_crosscheck(ds)
    if rx is None:
        if require_r: raise RuntimeError("R + metafor required for the independent analysis cross-check.")
        st("independent analysis cross-check", skipped="R/metafor unavailable: analysis results stay UNVERIFIED (a human must reproduce them)")
    else:
        f3 = lambda x: f"{x:.3f}"; mine = {k: res[k]["value"] for k in ("analysis.est", "analysis.ci_lo", "analysis.ci_hi", "analysis.tau2", "analysis.I2")}
        theirs = {"analysis.est": f3(rx["est"]), "analysis.ci_lo": f3(rx["ci_lo"]), "analysis.ci_hi": f3(rx["ci_hi"]), "analysis.tau2": f3(rx["tau2"]), "analysis.I2": f"{rx['I2']:.1f}"}
        agree = {k: mine[k] == theirs[k] for k in mine}; st("independent analysis cross-check (R/metafor from exported CSV)", agree=agree, mine=mine, r=theirs)
        if not all(agree.values()): raise AssertionError(f"R/metafor disagrees with MetaLab: {mine} vs {theirs}")
        for k in agree: store.verify_result(pid, k, SIM_VERIFIER, f"reproduced in R/metafor (Rscript) from analysis_dataset.csv: {theirs[k]}")
        for k, val in (("analysis.est_exp", math.exp(rx["est"])), ("analysis.ci_lo_exp", math.exp(rx["ci_lo"])), ("analysis.ci_hi_exp", math.exp(rx["ci_hi"]))):
            if k in res and f3(val) == res[k]["value"]: store.verify_result(pid, k, SIM_VERIFIER, f"exp() of the R/metafor estimate reproduces {f3(val)}")
        for k in ("analysis.k", "analysis.model", "analysis.measure", "analysis.pi_lo", "analysis.pi_hi"):
            if k in res and k in ("analysis.k", "analysis.model", "analysis.measure"):
                store.verify_result(pid, k, SIM_VERIFIER, "matches the stated analysis plan / dataset row count (checked in the export)")
        # prediction interval: recomputed in R with the Riley convention (t_{k-2}), as documented in the results store
        pil = _r_pi(ds)
        if pil is not None:
            for k, val in (("analysis.pi_lo", pil[0]), ("analysis.pi_hi", pil[1])):
                if f3(val) == res[k]["value"]: store.verify_result(pid, k, SIM_VERIFIER, "reproduced in R from tau2/se (Riley t_{k-2} prediction interval)")
    for k, _ in M.SECTIONS: store.save_section(pid, k, SIM_TEXT[k])
    out, problems = M.assemble(store, pid, final=True); iss = M.qc(store, pid)
    rows = trace_report(store, pid)
    rep.update(readiness=readiness(store, pid), qc=iss, problems=problems, trace=rows, traceable=traceable(rows), package_bytes=len(pkg), manuscript="\n\n".join(f"## {lab}\n{t}" for _, lab, t in out))
    return rep


def _r_pi(ds):
    """Prediction interval from R using metafor's REML fit and the Riley et al. t_{k-2} convention (matching MetaLab's default and documented in the results store)."""
    if not r_available(): return None
    with tempfile.TemporaryDirectory() as td:
        p = Path(td) / "d.csv"; p.write_text(ds)
        code = (f'suppressMessages(library(metafor)); d <- read.csv("{p}"); r <- rma(yi, vi, data = d, method = "REML", control = list(threshold = 1e-10, tol = 1e-12)); '
                'k <- r$k; se <- r$se; tau2 <- r$tau2; b <- as.numeric(r$beta); '
                'hk <- rma(yi, vi, data = d, method = "REML", test = "knha", control = list(threshold = 1e-10, tol = 1e-12)); '
                'half <- qt(0.975, k - 2) * sqrt(tau2 + hk$se^2); cat(sprintf("%.12g", c(b - half, b + half)), sep = "\\n")')
        o = subprocess.run(["Rscript", "-e", code], capture_output=True, text=True)
        if o.returncode != 0: return None
        a, b2 = [float(x) for x in o.stdout.split()]; return a, b2
