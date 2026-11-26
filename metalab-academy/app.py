"""MetaLab Academy - local-first Streamlit app. Run: ./run.sh"""
import json, os, time, datetime
from pathlib import Path
import numpy as np, pandas as pd, streamlit as st
import plotly.graph_objects as go
from metalab import curriculum, lessons, references, resources, stats as S
from metalab.store import Store, DECISIONS
from metalab.plan import WEEKS, all_tasks

st.set_page_config(page_title="MetaLab Academy", page_icon="🧪", layout="wide")
ROOT = Path(__file__).parent

@st.cache_resource
def get_store():
    return Store(os.environ.get("METALAB_DB") or str(ROOT / "data" / "metalab.sqlite"))
db = get_store()
LES = lessons.load()
PROFILE = db.profile()

PAGES = ["Home", "Onboarding", "Learning Academy", "Research Workspace", "First Paper Plan",
         "Statistics Lab", "Knowledge Universe", "Network & Collaboration", "Quality & Expert Review", "Status & Limitations"]
page = st.sidebar.radio("MetaLab Academy", PAGES, key="nav")
st.sidebar.caption("Learn. Discover. Analyze. Collaborate. Publish.")
st.sidebar.info("Early version. Only the features marked *tested* or *implemented* on the Status page work; "
                "lessons are AI-drafted and not yet expert-reviewed.")
DISCLAIM = "AI-drafted educational content; verify against primary sources. Not accredited instruction."

def project_picker(key="proj"):
    ps = db.projects()
    if not ps:
        st.info("No project yet. Create one in the Research Workspace.")
        return None
    labels = {p["id"]: f"{p['name']}  {'[TEACHING DATA]' if p['is_teaching'] else ''}" for p in ps}
    pid = st.selectbox("Project", list(labels), format_func=labels.get, key=key)
    return next(p for p in ps if p["id"] == pid)

# ------------------------------------------------------------------ HOME
if page == "Home":
    st.title("🧪 MetaLab Academy")
    c = curriculum.counts()
    done = db.completed()
    a, b, d, e = st.columns(4)
    a.metric("Modules in curriculum", c["total"]); b.metric("Lessons actually written", c["drafted"],
        help="The other modules are outlines only: title and level, no lesson.")
    d.metric("Lessons you completed", len(done)); e.metric("Projects", len(db.projects()))
    st.warning(f"Honest status: {c['drafted']} of {c['total']} modules have a lesson. The rest are visible as outlines so you can see the roadmap.")
    st.subheader("Start here")
    if not PROFILE:
        st.write("1. Go to **Onboarding** (5 minutes) to get a suggested pathway.")
    nxt = next((m for m in (3, 4, 32) if m not in done), None)
    if nxt:
        st.write(f"**Next lesson:** Module {nxt} - {LES[nxt]['title']} (open it in *Learning Academy*).")
    else:
        st.success("All three available lessons completed. More are being written - see NEXT_ACTIONS.md.")
    st.write("Then: create your project and follow the **First Paper Plan**.")
    p = [x for x in db.projects() if not x["is_teaching"]]
    if p:
        tasks = all_tasks(); dn = db.tasks_done(p[0]["id"])
        st.progress(len(dn) / len(tasks), text=f"First-paper plan: {len(dn)}/{len(tasks)} tasks ({p[0]['name']})")

# ------------------------------------------------------------ ONBOARDING
elif page == "Onboarding":
    st.title("Onboarding")
    st.caption("Stored only in a local file on this computer. Nothing is sent anywhere.")
    with st.form("onb"):
        disc = st.text_input("Academic discipline", PROFILE.get("discipline", ""))
        exp = st.select_slider("Research experience", ["none", "some", "substantial"], PROFILE.get("research_exp", "some"))
        stat = st.select_slider("Statistics experience", ["none", "basic", "intermediate", "advanced"], PROFILE.get("stats_exp", "basic"))
        code = st.select_slider("Coding experience", ["none", "basic", "intermediate", "advanced"], PROFILE.get("code_exp", "basic"))
        sr = st.select_slider("Familiarity with systematic reviews", ["none", "heard of", "read some", "done one"], PROFILE.get("sr_fam", "none"))
        ma = st.select_slider("Familiarity with meta-analysis", ["none", "heard of", "read some", "done one"], PROFILE.get("ma_fam", "none"))
        hrs = st.number_input("Study hours per week", 1, 40, int(PROFILE.get("hours", 6)))
        lang = st.selectbox("Preferred language", ["R", "Python", "Either", "None yet"], ["R", "Python", "Either", "None yet"].index(PROFILE.get("lang", "R")))
        goal = st.text_area("Research goal / intended project", PROFILE.get("goal", ""))
        path = st.selectbox("Starting pathway", ["Complete beginner", "Preclinical researcher", "Clinician", "Plant scientist", "Microbiologist",
                            "Ecologist", "Public health researcher", "Social scientist", "Education researcher", "Advanced statistician",
                            "Research librarian", "Faculty instructor", "Independent researcher"])
        if st.form_submit_button("Save profile"):
            db.set_profile(discipline=disc, research_exp=exp, stats_exp=stat, code_exp=code, sr_fam=sr, ma_fam=ma,
                           hours=hrs, lang=lang, goal=goal, pathway=path)
            st.success("Saved."); st.rerun()
    st.subheader("Diagnostic (6 questions, ungraded for access - nothing is locked)")
    DIAG = [
      ("The standard error of the mean describes...", ["Spread of individual observations", "Precision of the sample mean", "Bias of the study", "The p-value"], 1),
      ("A 95% confidence interval means...", ["95% of the data lie inside it", "Procedure captures the true value in ~95% of repeated samples", "p = 0.95", "The effect is real"], 1),
      ("A meta-analysis is...", ["Any literature review", "A statistical combination of results from several studies", "A type of clinical trial", "A reporting guideline"], 1),
      ("Larger studies in a pooled analysis typically get...", ["Less weight", "More weight (smaller variance)", "Equal weight", "Zero weight"], 1),
      ("PECO differs from PICO by using...", ["Exposure instead of Intervention", "A different outcome", "No comparator", "Only humans"], 0),
      ("In fly experiments the independent experimental unit is often...", ["Each fly regardless of vial", "The vial/cage", "The lab", "The gene"], 1)]
    ans = []
    for i, (q, o, k) in enumerate(DIAG):
        ans.append(o.index(st.radio(q, o, index=None, key=f"d{i}")) if st.session_state.get(f"d{i}") else -1)
    if st.button("Score diagnostic"):
        sc = sum(a == k for a, (_, _, k) in zip(ans, DIAG))
        st.write(f"**{sc}/6**")
        rec = "Start with Modules 3 -> 4 -> 32, using the Statistics Lab alongside." if sc < 5 else \
              "You can skim Module 3/4 and focus on Module 32 and the Workspace."
        st.info(rec + " (This is a rough self-check, not a validated test. All content stays open to you.)")
        db.set_profile(diagnostic=sc)

# ------------------------------------------------------- LEARNING ACADEMY
elif page == "Learning Academy":
    st.title("Learning Academy")
    tab_list, tab_lesson = st.tabs(["Curriculum (84 modules)", "Open a lesson"])
    with tab_list:
        qtxt = st.text_input("Search modules")
        lvl = st.multiselect("Level", list(curriculum.LEVELS.values()))
        only = st.checkbox("Only modules with a lesson")
        rows = [m for m in curriculum.MODULES if (not qtxt or qtxt.lower() in m["title"].lower())
                and (not lvl or m["level_name"] in lvl) and (not only or m["status"] == "drafted")]
        df = pd.DataFrame([{"#": m["id"], "Module": m["title"], "Level": f"{m['level']} {m['level_name']}",
                            "Part": m["part_name"], "Status": "LESSON AVAILABLE" if m["status"] == "drafted" else "outline only",
                            "Done": "✓" if m["id"] in db.completed() else ""} for m in rows])
        st.dataframe(df, hide_index=True, width="stretch")
    with tab_lesson:
        mid = st.selectbox("Module", sorted(LES), format_func=lambda i: f"{i}. {LES[i]['title']}")
        L = LES[mid]
        st.caption(f"~{L['time_min']} min · v{L['version']} · {L['content_type']}")
        st.warning(f"Status: {L['status']}. Last verification: {L['last_verified']}")
        st.markdown("**Prerequisites:** " + "; ".join(L["prerequisites"]))
        st.markdown("**Objectives**\n" + "\n".join(f"- {o}" for o in L["objectives"]))
        st.markdown(f"**Why it matters.** {L['why']}")
        lvl_t = st.radio("Depth", ["Plain-language", "Intermediate", "Advanced"], horizontal=True)
        st.markdown({"Plain-language": L["plain"], "Intermediate": L["intermediate"], "Advanced": L["advanced"]}[lvl_t])
        if L["formulas"]:
            with st.expander("Formulas and symbols"):
                for f in L["formulas"]:
                    st.markdown(f"**{f['name']}**"); st.latex(f["tex"])
                    st.markdown(", ".join(f"`{k}` = {v}" for k, v in f["symbols"].items()))
        with st.expander("Assumptions"):
            st.markdown("\n".join(f"- {a}" for a in L["assumptions"]))
        with st.expander("Worked example", expanded=True):
            st.markdown(L["worked_example"])
        with st.expander("Examples across disciplines"):
            for d, t in L["examples"]:
                st.markdown(f"- **{d}:** {t}")
        with st.expander("Common mistakes / misconceptions / controversies"):
            st.markdown("**Mistakes**\n" + "\n".join(f"- {x}" for x in L["mistakes"]))
            st.markdown("**Misconceptions**\n" + "\n".join(f"- *{a}* - {b}" for a, b in L["misconceptions"]))
            st.markdown("**Open controversies**\n" + "\n".join(f"- {x}" for x in L["controversies"]))
        with st.expander("Decision tree"):
            for q, a in L["decision_tree"]:
                st.markdown(f"- **{q}** → {a}")
        with st.expander("Exercises"):
            st.markdown("\n".join(f"{i+1}. {x}" for i, x in enumerate(L["exercises"])))
        if L.get("coding"):
            with st.expander("Code (R and Python)"):
                st.code(L["coding"]["r"], "r"); st.code(L["coding"]["python"], "python")
        st.error("Research integrity: " + L["integrity"])
        st.markdown(L["application"])
        with st.expander("References (verified in PubMed on " + references.VERIFIED_ON + ")"):
            for k in L["further"]:
                st.markdown("- " + references.link(k))
        st.subheader("Quiz")
        with st.form(f"quiz{mid}"):
            chosen = []
            for i, q in enumerate(L["quiz"]):
                pick = st.radio(f"{i+1}. {q['q']}", q["opts"], index=None, key=f"q{mid}_{i}")
                chosen.append(q["opts"].index(pick) if pick is not None else -1)
            if st.form_submit_button("Submit"):
                key = [q["ans"] for q in L["quiz"]]
                sc = db.record_quiz(mid, chosen, key)
                st.write(f"**Score: {sc}/{len(key)}**")
                for i, q in enumerate(L["quiz"]):
                    ok = chosen[i] == q["ans"]
                    st.markdown(f"{'✅' if ok else '❌'} Q{i+1}: {q['why']}")
        best = db.best_quiz(mid)
        st.caption(f"Best score so far: {'none' if best is None else f'{best:.0%}'}")
        st.markdown("**Completion checklist**")
        for c in L["checklist"]:
            st.checkbox(c, key=f"cl{mid}{c}")
        if st.button("Mark module complete", key=f"done{mid}"):
            if (best or 0) < 0.8:
                st.error("Complete the quiz with at least 80% first (self-set standard; internal record only, not a qualification).")
            else:
                db.set_complete(mid); st.success("Recorded as an internal learning record.")
        st.markdown("**Notes**")
        n = st.text_area("Add a note", key=f"note{mid}")
        if st.button("Save note", key=f"sn{mid}") and n.strip():
            db.add_note(mid, n.strip())
        for x in db.notes(mid):
            st.caption(datetime.datetime.fromtimestamp(x["ts"]).strftime("%Y-%m-%d %H:%M")); st.write(x["body"])

# ---------------------------------------------------- RESEARCH WORKSPACE
elif page == "Research Workspace":
    st.title("Research Workspace")
    t = st.tabs(["Projects", "Question Builder", "Search Log", "References & Dedup", "Screening", "PRISMA", "Extraction", "Risk of bias", "Effect sizes & analysis", "Decisions", "Audit log", "Backup & export"])
    with t[0]:
        with st.form("np"):
            nm = st.text_input("Project name"); dc = st.text_input("Discipline")
            rt = st.selectbox("Review type", ["Systematic review", "Systematic review + meta-analysis", "Scoping review", "Umbrella review", "Evidence map", "Rapid review", "Living review", "Other"])
            teach = st.checkbox("This is a TEACHING project (practice data; never mixed with real research)")
            if st.form_submit_button("Create project"):
                try:
                    db.create_project(nm, dc, rt, teach); st.success("Created."); st.rerun()
                except ValueError as e:
                    st.error(str(e))
        for p in db.projects():
            st.markdown(f"- **{p['name']}** - {p['review_type']} - {p['discipline']} {'*(teaching)*' if p['is_teaching'] else ''}")
    with t[1]:
        p = project_picker("pq")
        if p:
            q0 = db.get_question(p["id"])
            fw = st.selectbox("Framework", ["PICO", "PECO", "PCC (scoping)"], key="fw")
            labels = {"PICO": ["Population", "Intervention", "Comparator", "Outcome (primary)", "Outcome (secondary)", "Study design", "Unit of analysis"],
                      "PECO": ["Population", "Exposure", "Comparator", "Outcome (primary)", "Outcome (secondary)", "Study design", "Unit of analysis"],
                      "PCC (scoping)": ["Population", "Concept", "Context", "Study design / sources", "Unit of analysis"]}[fw]
            vals = {l: st.text_area(l, q0.get(l, ""), height=70, key=f"qb{l}{fw}") for l in labels}
            vals["_status"] = st.selectbox("Status", ["provisional", "novelty checked", "protocol-approved"], index=0)
            if st.button("Save question"):
                db.save_question(p["id"], vals); st.success("Saved")
            miss = [l for l in labels if not vals[l].strip()]
            if miss:
                st.warning("Not yet defined: " + ", ".join(miss) + ". A question with undefined elements is not reviewable (Module 4).")
            else:
                st.success("All elements filled. Completeness is not quality - check Module 4 critique questions.")
    with t[2]:
        p = project_picker("ps")
        if p:
            st.caption("Record searches YOU ran. This app does not query databases, so it can never claim a search happened by itself.")
            with st.form("sl"):
                c1, c2, c3 = st.columns(3)
                dbn = c1.text_input("Database"); plat = c2.text_input("Platform/interface"); dt = c3.date_input("Date searched")
                qy = st.text_area("Exact query (copy-paste)"); fl = st.text_input("Filters/limits")
                n1, n2 = st.columns(2); nr = n1.number_input("Results", 0); ne = n2.number_input("Exported", 0)
                op = st.text_input("Searcher", "me"); nt = st.text_input("Notes / access limitations")
                if st.form_submit_button("Log search"):
                    try:
                        db.log_search(p["id"], dbn, plat, str(dt), qy, fl, int(nr), int(ne), op, nt); st.success("Logged")
                    except ValueError as e:
                        st.error(str(e))
            sdf = pd.DataFrame(db.searches(p["id"]))
            if len(sdf):
                st.dataframe(sdf.drop(columns=["project_id", "ts"]), hide_index=True, width="stretch")
                st.download_button("Download search log (CSV)", db.to_csv(db.searches(p["id"])), "search_log.csv")
    with t[3]:
        p = project_picker("pr")
        if p:
            up = st.file_uploader("Import RIS or PubMed NBIB export", type=["ris", "txt", "nbib"])
            pasted = st.text_area("...or paste records", height=100)
            if st.button("Import"):
                txt = up.getvalue().decode("utf-8", "ignore") if up else pasted
                try:
                    n = db.import_refs(p["id"], txt, up.name if up else "pasted"); st.success(f"Imported {n} records (originals preserved).")
                except ValueError as e:
                    st.error(str(e))
            if st.button("Run exact-match deduplication"):
                st.info(f"{db.deduplicate(p['id'])} records marked as duplicates. Review them below; every merge is reversible. Fuzzy matching is not implemented.")
            rs = db.refs(p["id"])
            if rs:
                st.dataframe(pd.DataFrame(rs)[["id", "title", "authors", "year", "doi", "pmid", "dup_of", "dup_reason"]], hide_index=True, width="stretch")
                dups = [r for r in rs if r["dup_of"]]
                if dups:
                    rid = st.selectbox("Undo duplicate flag for record", [d["id"] for d in dups])
                    if st.button("Undo"):
                        db.undo_duplicate(rid, p["id"]); st.rerun()
            st.markdown("**Fuzzy duplicate candidates (human confirmation required; nothing is merged automatically)**")
            thr = st.slider("Title-similarity threshold", 0.80, 0.99, 0.88, 0.01)
            if st.button("Find fuzzy candidates"):
                st.info(f"{db.find_dup_candidates(p['id'], thr)} new candidate pairs found.")
            byid = {r["id"]: r for r in db.refs(p["id"])}
            for cnd in db.dup_candidates(p["id"], "pending"):
                ra, rb = byid[cnd["ref_a"]], byid[cnd["ref_b"]]
                with st.container(border=True):
                    st.markdown(f"**{cnd['relation']}** · score {cnd['score']} · {cnd['reasons']}")
                    st.markdown(f"A (#{ra['id']}): {ra['title']} - {ra['authors']} ({ra['year']}) {ra['journal']} {ra['doi']}  \nB (#{rb['id']}): {rb['title']} - {rb['authors']} ({rb['year']}) {rb['journal']} {rb['doi']}")
                    c1, c2 = st.columns(2)
                    if c1.button("Confirm: B duplicates A", key=f"cf{cnd['id']}"): db.decide_dup(p["id"], cnd["id"], True); st.rerun()
                    if c2.button("Reject (distinct)", key=f"rj{cnd['id']}"): db.decide_dup(p["id"], cnd["id"], False); st.rerun()
                    st.caption("Preprint vs published article and multiple reports of one study need judgement: link them as reports of one study in Extraction rather than discarding information.")
    with t[4]:
        p = project_picker("pscr")
        if p:
            rs = db.refs(p["id"], include_dups=False)
            reviewer = st.text_input("Reviewer label (human only)", "human:self")
            stage = st.radio("Stage", ["title_abstract", "full_text"], horizontal=True)
            st.caption("Single-reviewer screening is a documented limitation, not equivalent to independent duplicate screening. AI cannot be recorded as a reviewer.")
            done = {r_id for (r_id, rev) in db.latest_decisions(p["id"], stage) if rev == reviewer}
            todo = [r for r in rs if r["id"] not in done]
            if not rs:
                st.info("Import references first.")
            elif not todo:
                st.success(f"All {len(rs)} records have a {stage} decision from {reviewer}.")
            else:
                r = todo[0]
                st.markdown(f"**{r['title']}**  \n{r['authors']} ({r['year']}) · {r['journal']}  \nDOI: {r['doi'] or '-'} · PMID: {r['pmid'] or '-'}")
                st.write(r["abstract"] or "*(no abstract in record)*")
                dec = st.selectbox("Decision", DECISIONS); why = st.text_input("Reason (required for full-text exclusion)")
                if st.button("Record decision"):
                    try:
                        db.screen(p["id"], r["id"], stage, dec, why, reviewer); st.rerun()
                    except ValueError as e:
                        st.error(str(e))
                st.caption(f"{len(todo)} remaining")
        if p:
            from metalab import workflow as WF
            with st.expander("Inter-reviewer agreement (Cohen's kappa)"):
                revs = sorted({k[1] for k in db.latest_decisions(p["id"], stage)})
                if len(revs) < 2: st.caption("Needs two human reviewers with decisions on the same records (use different reviewer labels).")
                else:
                    r1 = st.selectbox("Reviewer 1", revs, key="k1"); r2 = st.selectbox("Reviewer 2", [r for r in revs if r != r1], key="k2")
                    L = db.latest_decisions(p["id"], stage); both = sorted({i for (i, r) in L if r == r1} & {i for (i, r) in L if r == r2})
                    if both:
                        res = WF.cohens_kappa([L[(i, r1)]["decision"] for i in both], [L[(i, r2)]["decision"] for i in both])
                        kap = res["kappa"]; kap_txt = "undefined" if kap is None else f"{kap:.3f}"
                        st.write(f"n = {res['n']} · agreement = {res['po']:.1%} · kappa = {kap_txt}")
                        st.caption("Kappa depends on prevalence/marginals; report percent agreement too. Benchmarks (Landis & Koch) are conventions. Conflicts must be resolved by discussion/third reviewer, then recorded.")
    with t[5]:
        p = project_picker("pp")
        if p:
            c, w = db.prisma_counts(p["id"])
            st.table(pd.DataFrame({"Item": ["Records identified", "Duplicates removed", "Records screened (unique)", "Excluded at title/abstract",
                                            "Reports sought for full text", "Excluded at full text", "Studies/reports included"],
                                   "n": [c["identified"], c["duplicates_removed"], c["screened"], c["excluded_title_abstract"],
                                         c["reports_sought"], c["excluded_full_text"], c["included"]]}))
            if c["exclusion_reasons"]:
                st.write("Full-text exclusion reasons:", c["exclusion_reasons"])
            for x in w: st.warning(x)
            if not w and c["identified"]: st.success("Counts are internally consistent.")
            st.caption("Counts are derived only from stored records; 'records', 'reports' and 'studies' are distinct in PRISMA 2020 (link reports to studies in Extraction).")
            from metalab import workflow as WF
            svg = WF.prisma_svg(c)
            import streamlit.components.v1 as components
            components.html(svg, height=480 + 16 * max(1, len(c["exclusion_reasons"])))
            st.download_button("Download flow diagram (SVG)", svg, "prisma_flow.svg", "image/svg+xml")
            st.caption("PNG/PDF export not yet implemented; open the SVG in a browser/Inkscape. Simplified template: databases only; 'reports not retrieved' not tracked.")
    with t[6]:
        from metalab import workflows as WFS, workflow as WF
        p = project_picker("pe")
        if p:
            wf, schema = db.get_form(p["id"])
            if not wf:
                st.info("Choose a review workflow to create the extraction form. Different review types need different forms.")
                key = st.selectbox("Workflow", list(WFS.WORKFLOWS), format_func=lambda k: WFS.WORKFLOWS[k]["label"])
                w = WFS.WORKFLOWS[key]
                st.markdown(f"**Effect measures:** {', '.join(w['effect_measures'])}  \n**Suggested appraisal tools:** {', '.join(w['rob']) or 'none required'}  \n**Reporting guideline:** {w['guideline']}")
                for x in w["warnings"]: st.warning(x)
                if st.button("Use this form"): db.set_form(p["id"], key, w["fields"]); st.rerun()
            else:
                st.caption(f"Workflow: {WFS.WORKFLOWS[wf]['label']} - extraction form has {len(schema)} fields. (Form can be reset by re-selecting in the database; custom fields: edit `metalab/workflows.py`.)")
                c1, c2 = st.columns(2)
                with c1:
                    lbl = st.text_input("New study label (e.g. 'Smith 2020')")
                    if st.button("Create study ID") and lbl.strip(): st.success(db.new_study(p["id"], lbl.strip())); st.rerun()
                studies = db.studies(p["id"])
                if not studies: st.stop()
                sid = c2.selectbox("Study", [x["study_id"] for x in studies], format_func=lambda i: f"{i} - {next(x['label'] for x in studies if x['study_id'] == i)}")
                refs_ = db.refs(p["id"], include_dups=False)
                with st.expander("Link a report (reference) to this study"):
                    rid = st.selectbox("Reference", [r["id"] for r in refs_], format_func=lambda i: next(r["title"][:80] for r in refs_ if r["id"] == i)) if refs_ else None
                    rel = st.selectbox("Relation", ["primary report", "secondary report (same study)", "preprint of published report", "conference abstract", "protocol/registry entry", "supplement"])
                    if refs_ and st.button("Link report"): st.success(db.link_report(p["id"], sid, rid, rel))
                    for r_ in [r for r in db.reports(p["id"]) if r["study_id"] == sid]: st.caption(f"{r_['report_id']} · ref {r_['ref_id']} · {r_['relation']}")
                st.markdown("**Enter a value** (every value needs a source; estimates need a method note; missing is not zero)")
                with st.form("ex", clear_on_submit=True):
                    f1, f2, f3 = st.columns(3)
                    field = f1.selectbox("Field", [x["name"] for x in schema]); exp = f2.text_input("Experiment ID", "E1"); rev = f3.text_input("Extractor (human)", "human:self")
                    v1, v2, v3 = st.columns(3)
                    val = v1.text_input("Value as reported"); unit = v2.text_input("Unit"); unc = v3.selectbox("Value type", ["reported", "calculated", "estimated", "reconstructed", "imputed"])
                    s1, s2, s3 = st.columns(3)
                    src = s1.text_input("Source document"); pg = s2.text_input("Page"); tf = s3.text_input("Table/figure")
                    mr = st.text_input("If missing: reason"); nt = st.text_input("Notes / method for non-reported values")
                    if st.form_submit_button("Save value"):
                        try: db.extract(p["id"], sid, field, val, unit, src, pg, tf, rev, exp, None, unc, mr, nt); st.success("Saved (previous values, if any, are kept as history).")
                        except ValueError as e: st.error(str(e))
                rows = db.current_extracted(p["id"])
                if rows:
                    st.dataframe(pd.DataFrame(rows)[["id", "study_id", "experiment_id", "field", "value_raw", "unit_raw", "uncertainty", "source_doc", "page", "table_fig", "reviewer", "verification", "verifier", "missing_reason"]], hide_index=True, width="stretch")
                    v1, v2, v3 = st.columns(3)
                    vid = v1.selectbox("Verify value id", [r["id"] for r in rows]); vby = v2.text_input("Verifier (different person)", "human:B"); agree = v3.radio("Verifier agrees with source?", ["yes", "no"], horizontal=True)
                    if st.button("Record verification"):
                        try: db.verify_extraction(p["id"], vid, vby, agree == "yes"); st.rerun()
                        except ValueError as e: st.error(str(e))
                    issues = WF.validate_extraction(rows)
                    st.markdown(f"**Automated checks** ({len(issues)} prompts for human review)")
                    for i in issues: (st.error if i["severity"] == "error" else st.warning if i["severity"] == "warning" else st.info)(f"{i['study']}/{i['experiment']}/{i['field']}: {i['message']}")
    with t[7]:
        from metalab import rob_tools as RT
        import plotly.express as px
        p = project_picker("pr2")
        if p and db.studies(p["id"]):
            tool = st.selectbox("Tool", list(RT.TOOLS), format_func=lambda k: RT.TOOLS[k]["name"]); T = RT.TOOLS[tool]
            st.markdown(f"**Designed for:** {T['design']}")
            st.info(T["note"] + " Only domain names are stored; use the official tool's guidance (check licence). Reporting guidelines (ARRIVE/CONSORT) are not risk-of-bias tools.")
            if T["ref"]: st.markdown("Source: " + references.link(T["ref"]))
            sid = st.selectbox("Study", [x["study_id"] for x in db.studies(p["id"])], key="robs")
            with st.form("rb", clear_on_submit=True):
                dom = st.selectbox("Domain", T["domains"]); jd = st.radio("Judgement", T["judgements"], horizontal=True)
                sup = st.text_area("Supporting quote / rationale (required)"); rv = st.text_input("Reviewer (human)", "human:self")
                if st.form_submit_button("Save judgement"):
                    try: db.rate_rob(p["id"], sid, tool, dom, jd, sup, rv); st.success("Saved")
                    except ValueError as e: st.error(str(e))
            cur = [r for r in db.rob_current(p["id"]) if r["tool"] == tool]
            if cur:
                df = pd.DataFrame(cur)
                if df["reviewer"].nunique() > 1: rvw = st.selectbox("Show reviewer", sorted(df["reviewer"].unique())); df = df[df["reviewer"] == rvw]
                col = {"low": "#2e8b57", "unclear": "#e0b100", "some concerns": "#e0b100", "moderate": "#e0b100", "high": "#c0392b", "serious": "#c0392b", "critical": "#7b1f1f", "no information": "#9aa5b1"}
                mat = df.pivot_table(index="study_id", columns="domain", values="judgement", aggfunc="last")
                fig = px.imshow([[list(col).index(x) if isinstance(x, str) else None for x in row] for row in mat.values], x=list(mat.columns), y=list(mat.index),
                                color_continuous_scale=[(0, "#2e8b57"), (0.5, "#e0b100"), (1, "#c0392b")], aspect="auto", title="Risk-of-bias traffic lights (hover for judgement)")
                fig.update_traces(text=mat.values, texttemplate="%{text}", hovertemplate="%{y} · %{x}: %{text}<extra></extra>"); fig.update_coloraxes(showscale=False)
                st.plotly_chart(fig, width="stretch")
                summ = df.groupby(["domain", "judgement"]).size().reset_index(name="n")
                st.plotly_chart(px.bar(summ, x="domain", y="n", color="judgement", color_discrete_map=col, title="Domain summary"), width="stretch")
                st.caption("Text labels are in the cells for colour-blind accessibility. Unclear/no information is not 'low'.")
            revs = sorted({r["reviewer"] for r in db.rob_current(p["id"]) if r["tool"] == tool})
            if len(revs) >= 2:
                from metalab import workflow as WF
                cur_all = db.rob_current(p["id"]); r1, r2 = revs[:2]
                d1 = {(r["study_id"], r["domain"]): r["judgement"] for r in cur_all if r["tool"] == tool and r["reviewer"] == r1}
                d2 = {(r["study_id"], r["domain"]): r["judgement"] for r in cur_all if r["tool"] == tool and r["reviewer"] == r2}
                common = sorted(set(d1) & set(d2))
                if common:
                    k = WF.cohens_kappa([d1[i] for i in common], [d2[i] for i in common]); st.write(f"Reviewer agreement {r1} vs {r2}: {k['po']:.0%} over {k['n']} domains" + ("" if k["kappa"] is None else f", kappa {k['kappa']:.2f}"))
                    for i in common:
                        if d1[i] != d2[i]: st.warning(f"Disagreement {i}: {r1}={d1[i]} / {r2}={d2[i]} - resolve by discussion and record")
        else:
            st.info("Create studies in the Extraction tab first.")
    with t[8]:
        from metalab import workflow as WF
        p = project_picker("pa")
        if p:
            rows = db.current_extracted(p["id"])
            meas = st.selectbox("Effect measure", ["SMD", "MD", "lnRR", "lnOR", "lnRR_binary"]); vt = st.radio("SMD variance", ["LS", "borenstein"], horizontal=True)
            eff, skipped = WF.build_effects(rows, meas, vt)
            for s_ in skipped: st.warning(f"Skipped {s_[0]}/{s_[1]}: {s_[2]} (never imputed)")
            if eff:
                st.dataframe(pd.DataFrame(eff), hide_index=True, width="stretch")
                sh = [e for e in eff if e["control_group_id"]]
                from collections import Counter
                for (sid_, cid_), n_ in Counter((e["study_id"], e["control_group_id"]) for e in sh).items():
                    if n_ > 1: st.error(f"Study {sid_}: {n_} effect sizes share control '{cid_}' -> dependent. The simple model assumes independence; do not pool naively.")
                if st.button("Save as analysis dataset (replaces nothing; adds new effect IDs)"):
                    for e in eff: db.save_effect(p["id"], e["study_id"], e["experiment_id"], e["measure"], e["yi"], e["vi"], e["control_group_id"], e["outcome"], e["timepoint"], e["group_label"], "built from extraction")
                    st.success("Saved with stable effect IDs")
            saved = db.effects(p["id"])
            if saved:
                st.markdown("**Saved analysis dataset**"); st.dataframe(pd.DataFrame(saved), hide_index=True, width="stretch")
                ex_ = pd.DataFrame(saved)
                if len(ex_) >= 2:
                    try:
                        r = S.meta_analyze(ex_["yi"].to_numpy(), ex_["vi"].to_numpy(), "random", "REML", hksj=True)
                        st.write(f"Quick look (REML + HKSJ): pooled {r.est:.3f} [{r.ci[0]:.3f}, {r.ci[1]:.3f}], tau² {r.tau2:.3f}, k = {r.k}. Use the Statistics Lab for the pre-specified analysis; this is a convenience view only.")
                        for n_ in r.notes: st.warning(n_)
                    except (ValueError, S.ConvergenceError) as e: st.error(str(e))
            st.markdown("**Statistical analysis plan template**")
            from metalab import workflows as WFS
            wfk = db.get_form(p["id"])[0]
            st.download_button("Download SAP draft (Markdown)", WF.sap_markdown(WFS.WORKFLOWS[wfk]["label"] if wfk else "unspecified", meas), "SAP_draft.md")
    with t[9]:
        p = project_picker("pd")
        if p:
            k = st.selectbox("Type", ["decision", "protocol deviation", "amendment"])
            txt = st.text_area("Describe the decision and why")
            if st.button("Log") and txt.strip():
                db.add_decision(p["id"], txt, k); st.rerun()
            for d in db.decisions(p["id"]):
                st.markdown(f"**{d['kind']}** · {datetime.datetime.fromtimestamp(d['ts']):%Y-%m-%d %H:%M} - {d['text']}")
    with t[10]:
        rows = db.audit_rows()
        st.caption("Append-only (enforced by database triggers).")
        if rows:
            df = pd.DataFrame(rows); df["ts"] = pd.to_datetime(df["ts"], unit="s")
            st.dataframe(df, hide_index=True, width="stretch")
    with t[11]:
        st.download_button("Full backup (JSON)", db.backup_json(), "metalab_backup.json")
        up = st.file_uploader("Restore from backup (REPLACES current data except the audit log)", type="json")
        if up and st.button("Restore"):
            try:
                db.restore_json(up.getvalue().decode()); st.success("Restored")
            except Exception as e:
                st.error(f"Restore failed: {e}")
        p = project_picker("pb")
        if p:
            from metalab import workflow as WF
            st.download_button("Reproducibility package (ZIP: all stages, R script, SAP draft, PRISMA, audit log, SHA-256 manifest)", WF.export_package(db, p["id"], p["name"]), f"{p['name']}_package.zip")
            st.download_button("References (CSV)", db.to_csv(db.refs(p["id"])), "references.csv")
            st.download_button("Audit log (CSV)", db.to_csv(db.audit_rows(p["id"])), "audit.csv")

# ------------------------------------------------------ FIRST PAPER PLAN
elif page == "First Paper Plan":
    from metalab.milestones import M as MILESTONES
    from metalab import topic_scan as TS
    st.title("My First Meta-Analysis Paper")
    st.markdown("Work **one milestone at a time**. Each has: what to learn, why, a demonstration, practice, a task for your real research, a quality checklist, a deliverable and the next step. "
                "You never need the whole academy first - only the linked lessons. Rigor is never traded for the deadline; extend freely.")
    p = project_picker("fp")
    t_ms, t_scan, t_wk = st.tabs(["Milestones", "Topic Explorer (real PubMed scan)", "16-week task view"])
    with t_ms:
        if not p:
            st.stop()
        if p["is_teaching"]:
            st.warning("Teaching project: progress here does not count toward a real paper.")
        dn = db.tasks_done(p["id"])
        def ms_done(m): return all(f"ms{m['id']}_qc{i}" in dn for i in range(len(m["qc"])))
        finished = [m["id"] for m in MILESTONES if ms_done(m)]
        cur = next((m for m in MILESTONES if not ms_done(m)), None)
        st.progress(len(finished) / len(MILESTONES), text=f"{len(finished)}/{len(MILESTONES)} milestones complete")
        if cur: st.info(f"**You are on Milestone {cur['id']}: {cur['name']}** (suggested weeks {cur['weeks']})")
        for m in MILESTONES:
            tag = "✅" if ms_done(m) else ("▶️" if cur and m["id"] == cur["id"] else "○")
            with st.expander(f"{tag} Milestone {m['id']}: {m['name']}  (weeks {m['weeks']})", expanded=bool(cur and m["id"] == cur["id"])):
                st.markdown(f"**1. What to learn:** {m['learn']}\n\n**2. Why:** {m['why']}\n\n**3. Practical demonstration:** {m['demo']}\n\n"
                            f"**4. Practice exercise:** {m['practice']}\n\n**5. Task for YOUR research:** {m['task']}")
                lk = [f"Module {i} ({'lesson available' if i in LES else 'outline only'})" for i in m["modules"]]
                st.caption("Lessons: " + "; ".join(lk) + f" · Tool: {m['tool']}")
                st.markdown("**6. Quality-control checklist** (tick only when truly satisfied)")
                for i, q in enumerate(m["qc"]):
                    k = f"ms{m['id']}_qc{i}"
                    v = st.checkbox(q, value=k in dn, key=f"{p['id']}{k}")
                    if v != (k in dn):
                        db.set_task(p["id"], k, v); st.rerun()
                st.markdown(f"**7. Deliverable:** {m['deliverable']}  \n**8. Next step:** {m['next']}")
    with t_scan:
        st.warning(f"**Preliminary signals, not decisions.** Every count was returned by {TS.DB} on {TS.DATE}: one database, auto-translated queries, no screening. "
                   "Zero review hits does NOT prove novelty; a large primary literature does NOT prove usable data. You choose the topic.")
        st.subheader("Candidate topics and open questions")
        for c in TS.CANDIDATES:
            with st.expander(f"{c['id']}. {c['title']}"):
                st.markdown(f"**Why it may be interesting:** {c['why_interesting']}")
                if c["concerns"]: st.markdown("**Concerns:**\n" + "\n".join(f"- {x}" for x in c["concerns"]))
                st.markdown(f"**Likely design:** {c['likely_design']}  \n**Evidence (search ids):** {', '.join(c['signals'])}")
                st.markdown("**Next steps:**\n" + "\n".join(f"- {x}" for x in c["next_steps"]))
        st.subheader("Self-assessment rubric (your judgement, not mine)")
        st.caption("Score each criterion 0-2 for your top candidates after doing Milestone 3. A total is only a conversation starter.")
        for r in TS.RUBRIC: st.markdown(f"- {r}")
        st.subheader("The searches (exact queries)")
        sdf = pd.DataFrame(TS.SEARCHES, columns=["id", "topic", "purpose", "query", "PubMed total", "interpretation"])
        st.dataframe(sdf, hide_index=True, width="stretch")
        st.download_button("Download scan (CSV)", sdf.to_csv(index=False), "topic_scan_pubmed_2026-11-26.csv")
        st.info("Teaching points: S18 shows PubMed translating 'STEM' into plant stems; S0a/S0b show zero hits from over-specified queries; S12 shows that Drosophila SR/MAs exist, so the format is accepted but each topic must still be checked.")
    with t_wk:
        if not p:
            st.stop()
        dn = db.tasks_done(p["id"]); tasks = all_tasks()
        st.progress(len([t for t in tasks if t[3] in dn]) / len(tasks), text="16-week default tasks (alternate view of the same journey)")
        catch = st.checkbox("Catch-up mode: show only unfinished weeks")
        for w, title, phase, ts in WEEKS:
            if catch and all(k in dn for k, *_ in ts): continue
            with st.expander(f"Week {w}: {title}"):
                for k, label, mins, kind in ts:
                    v = st.checkbox(f"{'🚧 GATE: ' if kind == 'gate' else ''}{label} · ~{mins} min", value=k in dn, key=f"t{p['id']}{k}")
                    if v != (k in dn):
                        db.set_task(p["id"], k, v); st.rerun()

# -------------------------------------------------------- STATISTICS LAB
elif page == "Statistics Lab":
    st.title("Statistics Lab")
    st.caption("All data here are SIMULATED or published example data and are clearly labelled. Never mixed with project data.")
    tabs = st.tabs(["SD vs SE & CIs (simulation)", "Meta-analysis", "Subgroups & meta-regression", "Effect-size calculators"])
    with tabs[0]:
        st.markdown("**Mechanism.** The SD describes spread of individuals and does not shrink with n; the SE = SD/√n describes precision of the mean and does. "
                    "A 95% CI procedure captures the true mean in ~95% of repeated experiments.")
        mu = st.number_input("True mean", value=10.0); sg = st.number_input("True SD", value=2.0, min_value=0.1)
        n = st.slider("Sample size n for CI demo", 3, 200, 10); seed = st.number_input("Random seed", value=1, step=1)
        res = S.simulate_sd_vs_se(mu, sg, [3, 5, 10, 30, 100, 300], reps=1500, seed=int(seed))
        dfr = pd.DataFrame(res, columns=["n", "mean sample SD", "mean SE", "empirical SD of sample means"])
        st.dataframe(dfr, hide_index=True, width="stretch")
        fig = go.Figure()
        fig.add_scatter(x=dfr["n"], y=dfr["mean sample SD"], name="SD (stays ≈ σ)")
        fig.add_scatter(x=dfr["n"], y=dfr["mean SE"], name="SE (shrinks)")
        fig.update_layout(xaxis_type="log", xaxis_title="n", yaxis_title="value", title="SIMULATED data")
        st.plotly_chart(fig, width="stretch")
        cov, lo, hi = S.ci_coverage(mu, sg, n, reps=3000, seed=int(seed))
        st.metric(f"Empirical coverage of 95% t-intervals (n={n}, 3000 simulations)", f"{cov:.1%}")
        f2 = go.Figure()
        for i, (a, b) in enumerate(zip(lo, hi)):
            f2.add_scatter(x=[a, b], y=[i, i], mode="lines", line=dict(color="crimson" if not (a <= mu <= b) else "gray"), showlegend=False)
        f2.add_vline(x=mu); f2.update_layout(title="First 50 simulated CIs (red misses the true mean)", yaxis_visible=False)
        st.plotly_chart(f2, width="stretch")
        st.markdown("**Interpretation questions:** (1) Why does the SD column not shrink? (2) What would coverage be if you used 1.96 instead of the t-quantile at n=5? "
                    "*Simplification:* normal data, independent observations.")
        st.code("set.seed(1); x <- replicate(1500, sd(rnorm(10, 10, 2)))  # SD stays ~2\nmean(x)", "r")
    with tabs[1]:
        src = st.radio("Data", ["Teaching example (3 studies, lesson 32)", "BCG vaccine trials (Colditz 1994; metafor's dat.bcg) - published example data", "Enter my own"], key="msrc")
        if src.startswith("Teaching"):
            d = pd.DataFrame({"study": ["A", "B", "C"], "yi": [0.2, 0.5, 0.8], "vi": [0.04, 0.04, 0.16]})
        elif src.startswith("BCG"):
            from metalab.datasets import BCG
            ys, vs = zip(*[S.log_risk_ratio(a, a + b, c, c + dd) for a, b, c, dd in BCG])
            d = pd.DataFrame({"study": [f"Trial {i+1}" for i in range(13)], "yi": ys, "vi": vs})
            st.caption("Effect = log risk ratio computed here from 2x2 counts. " + references.link("colditz1994"))
        else:
            d = pd.DataFrame({"study": ["S1", "S2", "S3"], "yi": [0.0, 0.0, 0.0], "vi": [0.1, 0.1, 0.1]})
        d = st.data_editor(d, num_rows="dynamic", key="meta_ed" + src[:4])
        c1, c2, c3, c4 = st.columns(4)
        model = c1.selectbox("Model", ["random", "common"]); meth = c2.selectbox("τ² estimator", ["REML", "PM", "DL"])
        hk = c3.checkbox("Hartung-Knapp (HKSJ)"); ex = c4.checkbox("Back-transform exp()")
        pim = st.radio("Prediction-interval convention", ["riley", "metafor"], horizontal=True,
                       help="riley: t with k-2 df (Riley 2011). metafor: z (or t with k-1 df when HKSJ), as R's metafor::predict.")
        dd = d.dropna()
        try:
            r = S.meta_analyze(dd["yi"].to_numpy(float), dd["vi"].to_numpy(float), model, meth, hksj=hk, pi_method=pim)
            f = (lambda x: float(np.exp(x))) if ex else (lambda x: x)
            m = st.columns(5)
            m[0].metric("Pooled", f"{f(r.est):.4f}"); m[1].metric("95% CI", f"{f(r.ci[0]):.3f} to {f(r.ci[1]):.3f}")
            m[2].metric("τ²", f"{r.tau2:.4f}"); m[3].metric("I² (Q-based)", f"{r.I2:.1f}%", help=f"Higgins & Thompson: (Q-df)/Q. R's metafor prints a τ²-based I² instead: {r.I2_tau:.1f}%."); m[4].metric("Q (df)", f"{r.Q:.2f} ({r.Q_df})")
            st.caption(f"τ²-based I² (as printed by R metafor): {r.I2_tau:.2f}% · H² (τ²-based): {r.H2_tau:.2f}. Both are legitimate; always state which you report.")
            if r.pred_int: st.write(f"**95% prediction interval:** {f(r.pred_int[0]):.3f} to {f(r.pred_int[1]):.3f}")
            for n_ in r.notes: st.warning(n_)
            fig = go.Figure()
            yy = list(range(len(dd), 0, -1))
            se = np.sqrt(dd["vi"].to_numpy(float)); y = dd["yi"].to_numpy(float)
            fig.add_scatter(x=[f(a) for a in y], y=yy, mode="markers", marker=dict(size=6 + 0.6 * r.weights, symbol="square"),
                            error_x=dict(type="data", symmetric=False, array=[f(a + 1.96 * s) - f(a) for a, s in zip(y, se)],
                                         arrayminus=[f(a) - f(a - 1.96 * s) for a, s in zip(y, se)]),
                            text=list(dd["study"]), hovertemplate="%{text}<br>%{x:.3f}<extra></extra>", name="studies")
            fig.add_scatter(x=[f(r.ci[0]), f(r.est), f(r.ci[1]), f(r.est)], y=[0, 0.25, 0, -0.25], fill="toself", mode="lines", name="pooled")
            fig.add_vline(x=1.0 if ex else 0.0, line_dash="dash")
            fig.update_layout(yaxis=dict(tickvals=yy + [0], ticktext=list(dd["study"]) + ["Pooled"]), title="Forest plot (marker size ∝ weight)", xaxis_title="exp(effect)" if ex else "effect")
            st.plotly_chart(fig, width="stretch")
            st.dataframe(pd.DataFrame({"study": dd["study"], "yi": y, "vi": dd["vi"], "weight %": r.weights}), hide_index=True)
            with st.expander("Leave-one-out"):
                st.dataframe(pd.DataFrame(S.leave_one_out(y, dd["vi"].to_numpy(float), model=model, method=meth, hksj=hk),
                                          columns=["omitted index", "est", "ci_lo", "ci_hi", "tau2", "I2"]), hide_index=True)
            st.markdown(f"**Method:** inverse-variance, {'common-effect' if model=='common' else f'random-effects ({meth}'+(', HKSJ)' if hk else ')')}. "
                        "Assumes independent studies on the same scale with accurate variances. Heterogeneity statistics from few studies are imprecise. "
                        + references.link("borenstein2010"))
            st.code(S.r_code_meta(meth, hk), "r")
            st.caption("Implementation tested against hand calculations and reference values; confirm with R/metafor before publication use (see Status page).")
        except ValueError as e:
            st.error(str(e))
    with tabs[2]:
        st.markdown("**Subgroups & meta-regression** (validated against R/metafor on documented datasets - see VALIDATION.md). "
                    "Moderators must be **pre-specified**; with few studies results are unstable. *Significant in one subgroup but not another does NOT show a subgroup difference.*")
        ex_ = st.radio("Data", ["BCG trials: log RR with allocation method / absolute latitude (published example data)", "Enter my own"], key="msr")
        if ex_.startswith("BCG"):
            from metalab.datasets import BCG, BCG_MODERATORS
            ys_, vs_ = zip(*[S.log_risk_ratio(a_, a_ + b_, c_, c_ + d_, cc=0.5) for a_, b_, c_, d_ in BCG])
            dm = pd.DataFrame({"study": [f"Trial {i+1}" for i in range(13)], "yi": ys_, "vi": vs_, **BCG_MODERATORS})
        else:
            dm = pd.DataFrame({"study": ["S1", "S2", "S3", "S4", "S5", "S6"], "yi": [0.1, 0.3, 0.2, 0.6, 0.5, 0.7],
                               "vi": [0.05] * 6, "group": ["a", "a", "a", "b", "b", "b"], "x": [1.0, 2, 3, 4, 5, 6]})
        dm = st.data_editor(dm, num_rows="dynamic", key="subreg" + ex_[:3])
        mode = st.radio("Analysis", ["Subgroup (categorical)", "Meta-regression (continuous/categorical moderators)"], horizontal=True)
        mcol = st.multiselect("Moderator column(s)", [c for c in dm.columns if c not in ("study", "yi", "vi")])
        meth2 = st.selectbox("τ² estimator", ["REML", "PM", "DL"], key="m2"); hk2 = st.checkbox("Hartung-Knapp", key="hk2")
        try:
            dd2 = dm.dropna(subset=["yi", "vi"] + mcol)
            if len(dm) != len(dd2): st.warning(f"{len(dm) - len(dd2)} row(s) with missing values were dropped: {list(dm.index.difference(dd2.index))}")
            if mcol:
                y2, v2 = dd2["yi"].to_numpy(float), dd2["vi"].to_numpy(float)
                if mode.startswith("Subgroup"):
                    res = S.subgroup_analysis(y2, v2, dd2[mcol[0]].tolist(), "random", meth2, hk2)
                    rows = [dict(group=g, k=(r.k if hasattr(r, "k") else r["k"]), est=(r.est if hasattr(r, "est") else r["est"]),
                                 se=(r.se if hasattr(r, "se") else r["se"]), tau2=getattr(r, "tau2", float("nan"))) for g, r in res["groups"].items()]
                    st.dataframe(pd.DataFrame(rows), hide_index=True)
                    st.write(f"**Between-subgroup Q = {res['Q_between']:.3f}, df = {res['Q_between_df']}, p = {res['Q_between_p']:.4f}** (separate τ² per subgroup)")
                    if "moderator_test" in res:
                        mt = res["moderator_test"]; st.write(f"Common-τ² moderator test (metafor-style): QM = {mt.QM:.3f}, df = {mt.QM_df}, p = {mt.QM_p:.4f}")
                        for n_ in mt.notes: st.warning(n_)
                else:
                    X_, names_ = S.design_matrix(**{c: dd2[c].tolist() for c in mcol})
                    rr = S.meta_regression(y2, v2, X_, names_, meth2, hk2)
                    st.dataframe(pd.DataFrame({"coef": rr.names, "estimate": rr.beta, "se": rr.se, "stat": rr.stat, "p": rr.p,
                                               "ci_lb": rr.ci[:, 0], "ci_ub": rr.ci[:, 1]}), hide_index=True)
                    st.write(f"QM = {rr.QM:.3f} (df {rr.QM_df}), p = {rr.QM_p:.4f} · residual τ² = {rr.tau2:.4f} · R² = {rr.R2:.1f}% · QE = {rr.QE:.2f} (df {rr.QE_df}) · I² (τ²-based) = {rr.I2_tau:.1f}%")
                    for n_ in rr.notes: st.warning(n_)
                    st.caption("R² is relative to the intercept-only τ² and is itself very imprecise with few studies. Meta-regression is observational across studies (ecological/confounding bias).")
            else:
                st.info("Choose at least one moderator column.")
        except (ValueError, S.ConvergenceError) as e:
            st.error(str(e))
    with tabs[3]:
        calc = st.selectbox("Calculator", ["Hedges' g / Cohen's d", "Mean difference", "Log response ratio", "Risk ratio (log)", "Odds ratio (log)", "Risk difference", "Fisher's z", "SD <-> SE", "SE from CI", "Combine two groups"])
        try:
            if calc.startswith("Hedges"):
                a = st.columns(6); v = [a[0].number_input("m1", value=10.0), a[1].number_input("sd1", value=2.0), a[2].number_input("n1", value=20),
                                        a[3].number_input("m2", value=8.0), a[4].number_input("sd2", value=2.0), a[5].number_input("n2", value=20)]
                h = st.checkbox("Apply small-sample correction (Hedges' g)", True)
                vt = st.radio("Variance formula", ["LS", "borenstein"], horizontal=True, help="LS = Hedges & Olkin (R metafor default); borenstein = J^2 x Var(d). They differ by up to ~8% at tiny n.")
                g, var, j = S.smd(v[0], v[1], v[2], v[3], v[4], v[5], h, vt)
                st.metric("g" if h else "d", f"{g:.4f}"); st.write(f"Variance {var:.5f}, SE {var**.5:.4f}, J = {j:.4f}")
                st.latex(r"d=\frac{m_1-m_2}{S_p},\ S_p=\sqrt{\frac{(n_1-1)sd_1^2+(n_2-1)sd_2^2}{n_1+n_2-2}},\ J=\frac{\Gamma(df/2)}{\sqrt{df/2}\,\Gamma((df-1)/2)},\ g=Jd")
                st.caption("Assumes similar SDs in both groups and independent observations (units!). Direction: positive = group 1 higher.")
                st.code("library(metafor)\nescalc(measure='SMD', m1i=10, sd1i=2, n1i=20, m2i=8, sd2i=2, n2i=20)", "r")
            elif calc == "Mean difference":
                a = st.columns(6); v = [a[0].number_input("m1", value=10.0), a[1].number_input("sd1", value=2.0), a[2].number_input("n1", value=20),
                                        a[3].number_input("m2", value=8.0), a[4].number_input("sd2", value=2.0), a[5].number_input("n2", value=20)]
                e, var = S.mean_difference(*v); st.metric("MD", f"{e:.4f}"); st.write(f"Variance {var:.5f}")
                st.code("escalc(measure='MD', m1i=10, sd1i=2, n1i=20, m2i=8, sd2i=2, n2i=20)", "r")
            elif calc.startswith("Log response"):
                a = st.columns(6); v = [a[0].number_input("m1", value=12.0), a[1].number_input("sd1", value=3.0), a[2].number_input("n1", value=10),
                                        a[3].number_input("m2", value=10.0), a[4].number_input("sd2", value=2.0), a[5].number_input("n2", value=10)]
                e, var = S.log_response_ratio(*v); st.metric("lnRR", f"{e:.4f}"); st.write(f"Variance {var:.5f}; ratio = {np.exp(e):.3f}")
                st.caption("Requires positive ratio-scale means; not valid for data that can be zero/negative or interval-scaled.")
                st.code("escalc(measure='ROM', m1i=12, sd1i=3, n1i=10, m2i=10, sd2i=2, n2i=10)", "r")
            elif calc in ("Risk ratio (log)", "Odds ratio (log)", "Risk difference"):
                a = st.columns(4); ev1 = a[0].number_input("events, group 1", value=10); n1 = a[1].number_input("n, group 1", value=50)
                ev2 = a[2].number_input("events, group 2", value=5); n2 = a[3].number_input("n, group 2", value=50)
                cc = st.number_input("Continuity correction (applied only if a zero cell)", 0.0, 1.0, 0.5)
                if calc.startswith("Risk ratio"): e, var = S.log_risk_ratio(ev1, n1, ev2, n2, cc); st.metric("ln RR", f"{e:.4f}"); st.write(f"RR = {np.exp(e):.3f}, variance {var:.5f}")
                elif calc.startswith("Odds"): e, var = S.log_odds_ratio(ev1, n1, ev2, n2, cc); st.metric("ln OR", f"{e:.4f}"); st.write(f"OR = {np.exp(e):.3f}, variance {var:.5f}")
                else: e, var = S.risk_difference(ev1, n1, ev2, n2); st.metric("RD", f"{e:.4f}"); st.write(f"variance {var:.5f}")
                st.caption("Zero cells: corrections are a sensitivity-analysis topic (Module 48, outline only); prefer rare-event methods.")
                st.code("escalc(measure='RR', ai=10, n1i=50, ci=5, n2i=50)   # or 'OR', 'RD'", "r")
            elif calc == "Fisher's z":
                r_ = st.number_input("r", -0.999, 0.999, 0.5); n_ = st.number_input("n", 4, 100000, 30)
                z, var = S.fisher_z(r_, int(n_)); st.metric("z", f"{z:.4f}"); st.write(f"variance {var:.5f}")
                st.code(f"escalc(measure='ZCOR', ri={r_}, ni={n_})", "r")
            elif calc == "SD <-> SE":
                v = st.number_input("value", 0.0, value=1.0); n_ = st.number_input("n", 1, 100000, 25)
                st.write(f"SE → SD: {S.sd_from_se(v, int(n_)):.4f} · SD → SE: {S.se_from_sd(v, int(n_)):.4f}")
            elif calc == "SE from CI":
                lo = st.number_input("lower", value=0.4); hi = st.number_input("upper", value=1.6); n_ = st.number_input("n (0 = use normal approx.)", 0, 100000, 0)
                st.metric("SE", f"{S.se_from_ci(lo, hi, int(n_) or None):.4f}")
                st.caption("Only valid for symmetric CIs on the analysis scale. For ratio measures, take logs of the limits first. Uses t(n−1) if n is given (small samples).")
            else:
                a = st.columns(6); v = [a[0].number_input("n1", value=12), a[1].number_input("mean1", value=5.0), a[2].number_input("sd1", value=2.0),
                                        a[3].number_input("n2", value=30), a[4].number_input("mean2", value=7.0), a[5].number_input("sd2", value=3.0)]
                n, m, sd = S.combine_groups(*v); st.write(f"Combined n = {n}, mean = {m:.4f}, SD = {sd:.4f}")
                st.caption("Cochrane Handbook formula; treats groups as independent subsamples of one population.")
        except ValueError as e:
            st.error(str(e))

# ------------------------------------------------------ KNOWLEDGE UNIVERSE
elif page == "Knowledge Universe":
    st.title("Knowledge Universe")
    t1, t2 = st.tabs(["Verified references (PubMed)", "Resources (links NOT yet verified)"])
    with t1:
        st.caption(f"Each entry's title, authors, journal and DOI were checked against {references.SOURCE} on {references.VERIFIED_ON}.")
        for k in references.REFS: st.markdown("- " + references.link(k))
    with t2:
        st.warning("These are well-known official sources entered from author knowledge. Links, versions, licences, costs and availability have NOT been verified; check the official site before relying on them.")
        f = st.text_input("Filter")
        rows = [r for r in resources.RESOURCES if not f or f.lower() in json.dumps(r).lower()]
        st.dataframe(pd.DataFrame([{**{k: r[k] for k in ("title", "org", "type", "topic", "level", "discipline", "url", "why")},
                                   "modules": ", ".join(map(str, r["modules"])), "verified_on": "not verified"} for r in rows]),
                     hide_index=True, width="stretch", column_config={"url": st.column_config.LinkColumn("url")})

# --------------------------------------------------------------- NETWORK
elif page == "Network & Collaboration":
    st.title("Network & Collaboration")
    st.info("There are no users, profiles, posts, matches or opportunities on this platform. Community features need authentication, moderation and hosting and are NOT built. "
            "Below: a directory of real external organisations (unverified links) and outreach templates for use in your own email.")
    st.dataframe(pd.DataFrame(resources.ORGS)[["name", "focus", "url", "membership", "cost"]], hide_index=True, width="stretch",
                 column_config={"url": st.column_config.LinkColumn("url")})
    T = {"Request an independent screening reviewer": "Subject: Request for independent screening support - [topic]\n\nDear [Name],\n\nI am conducting a [review type] on [question]. I am looking for a colleague to independently screen [n] records against pre-specified criteria (about [hours] hours). Contribution would be [acknowledgement/co-authorship if ICMJE criteria are met - to be agreed in writing before work begins]. Can we discuss?\n\nBest,\n[Your name]",
         "Contact a study author for missing data": "Subject: Data query about [Title, year]\n\nDear Dr [Name],\n\nI am conducting a systematic review of [topic]. Your study reports [outcome] but not [missing item, e.g. SD/n per group]. Could you share it, or tell us where it is reported? We will cite your help and describe how the data were used. This is not a request to change any results.\n\nThank you,\n[Your name]",
         "Request statistical advice": "Subject: Methodological question on a planned meta-analysis\n\nDear [Name],\n\nI plan to pool [effect measure] from about [k] [designs]. My concerns: [dependence, units, heterogeneity]. Could we spend [time] reviewing my analysis plan? I will send it in advance.\n\nBest,\n[Your name]",
         "Request mentorship": "Subject: Mentorship request - evidence synthesis\n\nDear [Name],\n\nI am a [career stage] in [field] starting my first meta-analysis ([topic]). I admire your work on [specific]. Would you be open to a [30-minute] conversation or occasional feedback? I understand if you lack capacity.\n\nBest,\n[Your name]"}
    k = st.selectbox("Template", list(T)); st.text_area("Edit and send yourself (the platform never contacts anyone)", T[k], height=220)
    st.caption("Authorship must follow your institution/journal criteria (e.g. ICMJE): substantive contribution only; do not offer authorship in exchange for favours.")

# ------------------------------------------------------ QUALITY / EXPERT REVIEW
elif page == "Quality & Expert Review":
    from metalab import claims as CL, expert as EX
    st.title("Quality & Expert Review")
    sm = CL.summary()
    st.metric("Claims tracked", sm["total"]); c1, c2, c3, c4 = st.columns(4)
    c1.metric("Directly supported (abstract/software)", sm["supported"]); c2.metric("Partial", sm["partial"])
    c3.metric("Unverified", sm["unverified"]); c4.metric("Human-expert reviewed", sm["human_reviewed"])
    st.warning("Nothing in MetaLab is expert-reviewed yet. 'Supported' means the source's abstract (or software output) directly supports the claim - not that a qualified human checked the lesson.")
    t1, t2, t3 = st.tabs(["Claim register", "Correction history", "Expert review packages"])
    with t1:
        st.dataframe(pd.DataFrame(CL.CLAIMS).drop(columns=["verified_on"]), hide_index=True, width="stretch")
    with t2:
        st.caption("Every error found so far is kept here, including ones the verification tools caught.")
        st.dataframe(pd.DataFrame(CL.CORRECTIONS), hide_index=True, width="stretch")
    with t3:
        pk = EX.available(); sel = st.selectbox("Package", list(pk))
        md = pk[sel](); st.download_button("Download package (Markdown)", md, file_name=sel.split(":")[0].replace(" ", "_") + "_review_package.md")
        with st.expander("Preview"): st.markdown(md)

# ----------------------------------------------------------------- STATUS
else:
    st.title("Status & Limitations")
    F = json.load(open(ROOT / "features.json"))
    st.caption(F["_note"])
    st.dataframe(pd.DataFrame(F["features"]).fillna(""), hide_index=True, width="stretch")
    c = curriculum.counts()
    st.markdown(f"**Curriculum:** {c['total']} modules registered; **{c['drafted']} have lessons**; {c['outline']} are outlines only.")
    st.markdown("See `KNOWN_LIMITATIONS.md`, `TESTING_REPORT.md`, `PROJECT_STATUS.md` in the project folder.")
