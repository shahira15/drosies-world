"""MetaLab Academy - local-first Streamlit app. Run: ./run.sh"""
import json, os, time, datetime
from pathlib import Path
import numpy as np, pandas as pd, streamlit as st
import plotly.graph_objects as go
from metalab import curriculum, lessons, references, resources, learning as LRN, vlab, coding as CODE, manuscript as MS, verification as VER, assessments as AS, stats as S
from metalab.store import Store, DECISIONS
from metalab.plan import WEEKS, all_tasks

st.set_page_config(page_title="MetaLab Academy", page_icon="🧪", layout="wide")
# Accessibility styling (static CSS only): stronger caption contrast, always-visible keyboard focus ring, smaller h2 (we use real h2 headings), reduced motion.
st.markdown("""<style>
[data-testid="stCaptionContainer"], [data-testid="stCaptionContainer"] *, .stCaption, small { color: #3d434d !important; opacity: 1 !important; }
*:focus-visible { outline: 3px solid #0b5fff !important; outline-offset: 2px !important; }
h2 { font-size: 1.6rem !important; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
</style>""", unsafe_allow_html=True)
ROOT = Path(__file__).parent

@st.cache_resource
def get_store():
    return Store(os.environ.get("METALAB_DB") or str(ROOT / "data" / "metalab.sqlite"))
db = get_store()
LES = lessons.load()
PROFILE = db.profile()

PAGES = ["Home", "Onboarding", "Learning Academy", "Practice", "Coding Lab", "Virtual Lab", "Method Wizard", "Research Workspace", "Manuscript Studio", "First Paper Plan",
         "Statistics Lab", "Knowledge Universe", "Network & Collaboration", "Quality & Expert Review", "Status & Limitations"]
with st.sidebar.expander("🔎 Search everything", expanded=False):
    uq = st.text_input("Lessons, formulas, glossary, resources, claims, calculators...", key="usearch")
    if uq:
        for d in LRN.search(uq, 8):
            st.markdown(f"**{d['title']}**  \n*{d['type']}* · open **{d['where']}**")
        if not LRN.search(uq, 1): st.caption("No matches. Try another word.")
AREAS = {"Home": "Start", "Onboarding": "Learn", "Learning Academy": "Learn", "Practice": "Learn", "Coding Lab": "Learn", "Virtual Lab": "Learn", "Method Wizard": "Learn",
         "First Paper Plan": "Research", "Research Workspace": "Research", "Manuscript Studio": "Research", "Statistics Lab": "Research",
         "Knowledge Universe": "Library & people", "Network & Collaboration": "Library & people", "Quality & Expert Review": "Trust", "Status & Limitations": "Trust"}
ICONS = {"Start": "🏠", "Learn": "📚", "Research": "🔬", "Library & people": "🌐", "Trust": "✅"}
def goto(p): st.session_state["nav"] = p
page = st.sidebar.radio("MetaLab Academy", PAGES, key="nav", format_func=lambda p: f"{ICONS[AREAS[p]]} {p}")
st.caption(f"{ICONS[AREAS[page]]} {AREAS[page]}  ›  {page}")
st.sidebar.markdown("<p style='color:#3d434d;font-size:0.85rem'>Learn. Discover. Analyze. Collaborate. Publish.</p>", unsafe_allow_html=True)
st.sidebar.info("v0.3 · local-first · no accounts, no network calls. Lessons are AI-drafted, not expert-reviewed; statistics are benchmarked vs R/metafor but not expert-validated. See Status & Limitations.")
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
    from metalab.milestones import M as MILESTONES
    st.title("🧪 MetaLab Academy")
    c = curriculum.counts(); done = db.completed()
    a, b, d, e = st.columns(4)
    a.metric("Modules registered", c["total"], help=f"{c['specified']} from the specification + {c['proposed']} proposed")
    b.metric("Lessons actually written", c["drafted"], help="The other modules are outlines only: title and level, no lesson.")
    d.metric("Lessons you completed", len(done)); e.metric("Real projects", len([p for p in db.projects() if not p["is_teaching"]]))
    st.warning(f"Honest status: {c['drafted']} of {c['total']} modules have a lesson (AI-drafted, not yet expert-reviewed). The rest are outlines so you can see the roadmap.")
    st.header("Your next actions")
    if not PROFILE: st.markdown("1. **Onboarding** (5 minutes): tell the academy about you - nothing leaves this computer.")
    core = [i for i in LRN.CORE_PATH if i in LES]
    nxt = next((i for i in core if i not in done), None)
    real = [p for p in db.projects() if not p["is_teaching"]]
    if nxt: st.markdown(f"**Learn:** Module {nxt} - {LES[nxt]['title']} (~{LES[nxt]['time_min']} min) → *Learning Academy → Open a lesson*")
    else: st.success("You have completed every written core-pathway lesson. More are in development.")
    if real:
        dn = db.tasks_done(real[0]["id"])
        cur = next((m for m in MILESTONES if not all(f"ms{m['id']}_qc{i}" in dn for i in range(len(m["qc"])))), None)
        if cur: st.markdown(f"**Research:** Milestone {cur['id']} - {cur['name']} → *First Paper Plan* (task: {cur['task']})")
        st.progress(sum(all(f"ms{m['id']}_qc{i}" in dn for i in range(len(m["qc"]))) for m in MILESTONES) / len(MILESTONES), text=f"First-paper milestones ({real[0]['name']})")
    else:
        st.markdown("**Research:** create your real project in *Research Workspace → Projects*, then follow the *First Paper Plan* (start with the Topic Explorer).")
    sims = [p for p in db.projects() if p["is_teaching"]]
    due, new = db.cards_due([x["key"] for x in LRN.cards()])
    st.markdown(f"**Practice:** {len(due)} flashcards due · {len(new)} new · {'simulated review created' if sims else 'try the Virtual Lab before using real data'}")
    bms = db.bookmarks()
    if bms: st.caption("Bookmarks: " + ", ".join(f"{b_['kind']} {b_['ref']}" for b_ in bms[:6]))
    st.header("The research journey")
    st.caption("Steps: Learn · Practise (Virtual Lab) · Plan (First Paper Plan) · Review = search, screen, extract, appraise (Research Workspace) · Analyse · Write · Check quality. Each button opens the tool that supports it. You never need every lesson first - follow the First Paper Plan one milestone at a time.")
    steps = [("1 Learn", "Learning Academy"), ("2 Practise", "Virtual Lab"), ("3 Plan", "First Paper Plan"), ("4 Review", "Research Workspace"), ("5 Analyse", "Statistics Lab"), ("6 Write", "Manuscript Studio"), ("7 Check", "Quality & Expert Review")]
    jc = st.columns(len(steps))
    for c_, (lab, p_) in zip(jc, steps): c_.button(lab, key=f"jr_{p_}", on_click=goto, args=(p_,), help=f"Open {p_}")
    st.info("Tip: use **🔎 Search everything** in the sidebar to find lessons, formulas, glossary terms, resources, calculators and claims. The **Method Wizard** suggests what to learn for your design (with its assumptions).")

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
    st.header("Diagnostic (6 questions, ungraded for access - nothing is locked)")
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
    tab_path, tab_list, tab_lesson = st.tabs(["Pathways", "Curriculum", "Open a lesson"])
    with tab_path:
        st.markdown("**You never need all modules before starting research.** The *core pathway* takes a first-time researcher to a first primary analysis; extensions and specialist pathways are optional. Everything stays open to you.")
        c = curriculum.counts(); st.caption(f"{c['drafted']} of {c['total']} registered modules ({c['specified']} specified + {c['proposed']} proposed) have lessons.")
        def show(title, ids):
            rows = LRN.pathway(ids); done_ = db.completed()
            st.markdown(f"**{title}** - {sum(r['available'] for r in rows)}/{len(rows)} lessons written · {sum(r['minutes'] or 0 for r in rows)} min of written content")
            st.dataframe(pd.DataFrame([{"Module": r["id"], "Title": r["title"], "Lesson": "available" if r["available"] else "outline only (not yet written)", "Minutes": r["minutes"], "Done": "✓" if r["id"] in done_ else ""} for r in rows]), hide_index=True, width="stretch")
        pp = AS.personal_pathway(PROFILE)
        st.markdown("**My pathway** (from your Onboarding profile; you can combine any tracks)")
        if PROFILE and pp["tracks"]: st.write("Suggested discipline tracks: " + ", ".join(pp["tracks"]))
        else: st.caption("Complete Onboarding (discipline/goals) to get discipline tracks, or pick tracks below.")
        for n_ in pp["notes"]: st.caption(n_)
        chosen = st.multiselect("Tracks to combine", list(AS.DISCIPLINE_TRACKS), default=pp["tracks"])
        ids_ = list(LRN.CORE_PATH); [ids_.append(m) for t_ in chosen for m in AS.DISCIPLINE_TRACKS[t_]["extra"] if m not in ids_]
        show("My combined pathway", ids_)
        st.download_button("Download study-notes bundle for this pathway (ZIP of Markdown)", AS.notes_bundle(ids_), "metalab_pathway_notes.zip")
        st.caption("Only written lessons are included; outline-only modules are listed as missing in the README inside the ZIP. Practice → Assessments tests the written ones.")
        show("Core pathway: first-time researcher (to your first primary analysis)", LRN.CORE_PATH)
        show("Core extensions (writing, certainty, protocol details)", LRN.CORE_EXTENSIONS)
        sp = st.selectbox("Optional specialist pathway", list(LRN.SPECIALIST)); show(sp, LRN.SPECIALIST[sp])
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
        bm = any(b["kind"] == "lesson" and b["ref"] == str(mid) for b in db.bookmarks())
        if st.button(("★ Bookmarked" if bm else "☆ Bookmark this lesson"), key=f"bm{mid}"): db.toggle_bookmark("lesson", mid); st.rerun()
        d1, d2 = st.columns(2)
        d1.download_button("Download study notes (Markdown)", LRN.lesson_notes(mid), f"module_{mid}_notes.md")
        d2.download_button("Download formula cheat sheet (all lessons)", LRN.cheat_sheet(), "metalab_cheat_sheet.md")
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
        st.header("Quiz")
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

# ------------------------------------------------------------------ PRACTICE
elif page == "Practice":
    st.title("Practice")
    t1, t2, t3, t4 = st.tabs(["Flashcards (spaced repetition)", "Glossary", "Bookmarks & goals", "Assessments"])
    with t1:
        allc = {c["key"]: c for c in LRN.cards()}
        due, new = db.cards_due(list(allc))
        st.caption("Scheduling uses a simple SM-2-style heuristic (not a validated learning model). Active recall: try to answer BEFORE revealing.")
        st.write(f"**Due now: {len(due)} · New: {len(new)}**")
        queue = due + new[:5]
        if not queue: st.success("Nothing due. Come back later.")
        else:
            key = queue[0]; c = allc[key]
            st.markdown(f"## {c['front']}")
            if st.toggle("Reveal answer", key=f"rv{key}"):
                st.info(c["back"] + (f"  \n(Module {c['module']})" if c["module"] else ""))
                q = st.radio("How well did you recall it?", [0, 1, 2, 3, 4, 5], index=None, horizontal=True, key=f"q{key}",
                             format_func=lambda i: {0: "0 blank", 1: "1 wrong", 2: "2 wrong, familiar", 3: "3 hard", 4: "4 good", 5: "5 easy"}[i])
                if q is not None and st.button("Save and next"):
                    nd = db.card_review(key, q); st.toast(f"Next review: {nd}"); st.rerun()
    with t2:
        gq = st.text_input("Search glossary")
        for v in LRN.glossary_search(gq):
            st.markdown(f"**{v['term']}** - {v['definition']}" + (f"  *(Module {v['module']})*" if v["module"] else ""))
    with t3:
        bms = db.bookmarks(); st.markdown("**Bookmarks**")
        for b in bms: st.write(f"{b['kind']}: {b['ref']}")
        if not bms: st.caption("Bookmark lessons from the Learning Academy.")
        goal = st.number_input("Weekly goal (lessons completed)", 0, 14, int(PROFILE.get("weekly_goal", 1)))
        if st.button("Save weekly goal"): db.set_profile(weekly_goal=int(goal)); st.success("Saved")
        done_ = db.completed(); st.progress(min(1.0, len(done_) / max(int(goal), 1)) if goal else 0.0, text=f"{len(done_)} lessons completed in total (goal counts per week; resets are manual)")

    with t4:
        st.markdown("**Mastery assessments** built from the lessons' quizzes (AI-drafted questions, not psychometrically validated; internal self-assessment only, not a qualification). Mastery = 80%+.")
        writ = sorted(LES)
        mode = st.radio("Exam scope", ["Chosen modules", "A discipline/core pathway"], horizontal=True)
        if mode == "Chosen modules":
            mods = st.multiselect("Modules (written lessons only)", writ, default=writ[:3], format_func=lambda i: f"{i}. {LES[i]['title'][:60]}")
        else:
            tr = st.selectbox("Pathway", ["Core first-researcher path"] + list(AS.DISCIPLINE_TRACKS)); ids = LRN.CORE_PATH if tr.startswith("Core") else AS.DISCIPLINE_TRACKS[tr]["core"] + AS.DISCIPLINE_TRACKS[tr]["extra"]
            mods = [m for m in ids if m in LES]; st.caption(f"{len(mods)} of {len(ids)} pathway modules have lessons; the others cannot be examined yet.")
        npm = st.slider("Questions per module", 1, 6, 3); seed = st.number_input("Exam seed (same seed = same exam)", 1, 9999, 1)
        if mods:
            qs = AS.exam(mods, npm, int(seed)); st.write(f"**{len(qs)} questions**")
            with st.form(f"exam_{seed}_{npm}_{len(mods)}"):
                picks = [st.radio(f"{i+1}. (Module {q['module']}) {q['q']}", q["opts"], index=None, key=f"ex{seed}{q['qid']}") for i, q in enumerate(qs)]
                if st.form_submit_button("Submit exam"):
                    ans = [q["opts"].index(p_) if p_ is not None else None for q, p_ in zip(qs, picks)]; res = AS.score(qs, ans)
                    st.success(f"Score {res['correct']}/{res['total']} ({res['pct']:.0%}) - " + ("mastery level reached" if res["mastery"] else "below mastery: review the modules listed")) if res["mastery"] else st.warning(f"Score {res['correct']}/{res['total']} ({res['pct']:.0%}) - below 80%: review modules {res['weak_modules']}")
                    for m_, (k_, n_) in sorted(res["by_module"].items()): st.write(f"Module {m_}: {k_}/{n_}")
                    for m_ in res["by_module"]:
                        ix = [i for i, q in enumerate(qs) if q["module"] == m_]; db.record_quiz(m_, [ans[i] if ans[i] is not None else -1 for i in ix], [qs[i]["ans"] for i in ix])
                    for f_ in AS.feedback(qs, ans):
                        st.markdown(f"{'✅' if f_['correct'] else '❌'} Module {f_['module']}: right answer **{f_['right']}** - {f_['why']}")
        else: st.info("Pick at least one module with a written lesson.")

# --------------------------------------------------------------- CODING LAB
elif page == "Coding Lab":
    st.title("Coding Lab")
    st.warning("Your code runs in a separate process on **this computer** with a time limit and CPU/memory limits, in a temporary folder. This is **not a security sandbox**: it has your user's privileges. Only run code you understand.")
    passed = set(PROFILE.get("coding_passed", []))
    st.progress(len(passed) / len(CODE.T), text=f"{len(passed)}/{len(CODE.T)} tutorials passed")
    langs = st.radio("Language", ["python", "r"], horizontal=True, format_func=lambda x: {"python": "Python", "r": "R (needs Rscript + metafor)"}[x])
    tl = [t for t in CODE.T if t["lang"] == langs]
    tid = st.selectbox("Tutorial", [t["id"] for t in tl], format_func=lambda i: f"{'✓ ' if i in passed else ''}{CODE.BY_ID[i]['title']} (Module {CODE.BY_ID[i]['module']})")
    t = CODE.BY_ID[tid]
    st.markdown(f"**Goal:** {t['goal']}")
    code = st.text_area("Your code (replace the `None`/`NULL` placeholders)", t["starter"], height=320, key=f"code_{tid}")
    c1, c2 = st.columns(2)
    if c1.button("Run and check", type="primary", key=f"run_{tid}"):
        r = CODE.run(t, code)
        if r["ok"]:
            st.success("All hidden checks passed.")
            passed.add(tid); db.set_profile(coding_passed=sorted(passed))
        else:
            st.error("Not yet:"); st.code(r["error"] or "failed")
        if r["stdout"]: st.text(r["stdout"])
    if c2.button("Reset to starter", key=f"rs_{tid}"): st.session_state.pop(f"code_{tid}", None); st.rerun()
    with st.expander("Hints"):
        for h in t["hints"]: st.markdown("- " + h)
    with st.expander("Reference solution (try first!)"):
        st.code(t["solution"], t["lang"])
    st.caption("Tutorials are checked against the benchmarked statistics engine; the reference solutions run in the automated tests.")

# -------------------------------------------------------------- VIRTUAL LAB
elif page == "Virtual Lab":
    from metalab import scenarios as SC
    st.title("Virtual Research Laboratory")
    st.error(f"**{vlab.BANNER}.** All compounds, trials, journals, authors, studies and numbers are FICTIONAL. Each simulation lives in a separate teaching project and is never mixed with real projects.")
    st.markdown("Complete an entire systematic review before touching real data: import → deduplicate → screen (with a simulated second reviewer and conflicts) → extract (with planted errors) → appraise risk of bias → compute effect sizes → check your work. Choose a discipline:")
    class _Pre:   # adapter for the original preclinical simulation
        id = "preclinical"; discipline = "Preclinical"; intro = "Drosophila lifespan, vial-level units, SEM, hours, shared controls, missing SD."; workflow = "preclinical"; measure = "lnRR"; rob_tool = "SYRCLE"
        studies = vlab.STUDIES; planted = vlab.planted_errors()
        load = staticmethod(vlab.load); fulltext = staticmethod(vlab.fulltext); grade = staticmethod(vlab.grade); add_simulated_reviewer = staticmethod(vlab.add_simulated_reviewer); title = "Nx-7 and Drosophila lifespan"
    scen = {"preclinical": _Pre, **SC.ALL}
    sk = st.selectbox("Scenario", list(scen), format_func=lambda k: f"{scen[k].discipline}: {scen[k].title}")
    sc = scen[sk]; st.markdown(f"**{sc.discipline} scenario.** {sc.intro}  \nSuggested workflow in the Extraction tab: *{sc.workflow}* · effect measure: *{sc.measure}* · appraisal tool: *{sc.rob_tool}*")
    if st.button("Create / open this simulated project"):
        pid = sc.load(db); st.success(f"Simulated project ready (id {pid}). Choose it in the Research Workspace project picker.")
    name_part = f"[{sc.discipline}]" if sk != "preclinical" else "SIMULATED review: Nx-7"
    sims = [p for p in db.projects() if p["is_teaching"] and p["name"].startswith("SIMULATED") and (name_part in p["name"] or (sk == "preclinical" and "Nx-7" in p["name"]))]
    if sims:
        pid = sims[0]["id"]
        tabs = st.tabs(["Guide", "Full-text excerpts", "Simulated reviewer", "Check my work"])
        with tabs[0]:
            st.markdown("1. **Research Workspace → References**: records are imported; run deduplication.  2. **Screening**: title/abstract then full text (exclusions need reasons).  3. **Extraction**: create studies named like the labels in the excerpts (e.g. `SIM-S101 Alvarez 2018`), choose the workflow above and enter values with source/page/table. Watch for traps!  4. **Risk of bias** with the listed tool.  5. **Effect sizes & analysis**: build the measure and save.  6. Return to *Check my work*.")
            with st.expander("Spoilers: the planted problems (open only after trying)"):
                for e in sc.planted: st.markdown("- " + e)
        with tabs[1]:
            for sid in list(sc.studies) + (["SIM-S006"] if sk == "preclinical" else []):
                with st.expander(sid): st.code(sc.fulltext(sid))
        with tabs[2]:
            st.caption("Adds decisions from a FICTIONAL second reviewer who disagrees with the key on some records so you can practise conflict resolution and kappa (Screening tab).")
            if st.button("Add simulated reviewer B decisions"):
                try: st.success(f"{sc.add_simulated_reviewer(db, pid)} simulated decisions added")
                except ValueError as e_: st.error(str(e_))
        with tabs[3]:
            for k_, (score, fb) in sc.grade(db, pid).items():
                st.progress(score, text=f"{k_}: {score:.0%}")
                for f_ in fb[:6]: st.caption("• " + f_)
            st.caption("Feedback shows what to re-check, including what to do about missing data. Scores are for practice only.")

# ------------------------------------------------------------- METHOD WIZARD
elif page == "Method Wizard":
    st.title("Method-selection wizard")
    st.warning("Rule-based prompts with explicit assumptions. **Not a substitute for scientific judgement or statistical advice.** They tell you what to read and discuss, and what MetaLab cannot do.")
    c1, c2 = st.columns(2)
    design = c1.selectbox("Main study design of the evidence", ["randomised experiments", "observational", "diagnostic accuracy", "qualitative", "mixed/other"])
    outcome = c2.selectbox("Outcome type", ["continuous (same scale)", "continuous (different scales)", "continuous ratio-scale, positive (e.g. lifespan, biomass)", "binary", "count / rate", "time-to-event", "correlation", "proportion / prevalence"])
    c3, c4, c5 = st.columns(3)
    k = c3.number_input("Expected number of studies (k)", 0, 500, 8)
    dep = c4.selectbox("Dependence among effect sizes", ["none", "shared control", "multiple outcomes/time points", "clustered labs/sites", "multiple species/phylogeny"])
    obj = c5.selectbox("Objective", ["estimate an effect", "explore heterogeneity", "map the evidence"])
    comp = st.checkbox("Studies estimate comparable quantities (same construct/direction/scale)", True)
    w = LRN.wizard(design, outcome, int(k), dep, obj, comp)
    st.header("Suggested direction"); st.markdown("**Review type:** " + "; ".join(w["review_types"]))
    st.markdown("**Effect measure(s):** " + "; ".join(w["measures"]))
    if w["models"]: st.markdown("**Analytic options:**\n" + "\n".join(f"- {m}" for m in w["models"]))
    for c_ in w["cautions"]: st.warning(c_)
    for n_ in w["not_supported"]: st.error("Not supported by MetaLab: " + n_)
    st.markdown("**Learn first:** " + ", ".join(f"Module {i} ({'lesson available' if i in LES else 'outline only'})" for i in w["lessons"]))
    with st.expander("Assumptions behind this suggestion"):
        for a_ in w["assumptions"]: st.markdown("- " + a_)

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
        st.download_button("Full backup (JSON, includes personal notes/contacts)", db.backup_json(), "metalab_backup.json")
        st.download_button("Shareable backup (JSON, WITHOUT contacts/profile/notes)", db.backup_json(include_personal=False), "metalab_backup_no_personal.json")
        up = st.file_uploader("Restore from backup (REPLACES current data except the audit log)", type="json")
        if up and st.button("Restore"):
            try:
                db.restore_json(up.getvalue().decode()); st.success("Restored")
            except Exception as e:
                st.error(f"Restore failed: {e}")
        p = project_picker("pb")
        if p:
            with st.expander("Delete this project (irreversible)"):
                nm_ = st.text_input("Type the exact project name to confirm", key="delname")
                if st.button("Delete project permanently"):
                    try: db.delete_project(p["id"], nm_); st.success("Deleted."); st.rerun()
                    except ValueError as e_: st.error(str(e_))
            from metalab import workflow as WF
            st.download_button("Reproducibility package (ZIP: all stages, R script, SAP draft, PRISMA, audit log, SHA-256 manifest)", WF.export_package(db, p["id"], p["name"]), f"{p['name']}_package.zip")
            st.download_button("References (CSV)", db.to_csv(db.refs(p["id"])), "references.csv")
            st.download_button("Audit log (CSV)", db.to_csv(db.audit_rows(p["id"])), "audit.csv")

# --------------------------------------------------------- MANUSCRIPT STUDIO
elif page == "Manuscript Studio":
    st.title("Manuscript Studio")
    st.info("A living manuscript tied to your stored outputs. Numbers appear only through `{{tokens}}` that resolve to **human-verified** results; anything unverified, stale or missing stays visibly flagged. Nothing is invented, and the studio never submits anything.")
    p = project_picker("ms")
    if p:
        if p["is_teaching"]: st.warning("Teaching project: do not use this for a real manuscript.")
        t_ed, t_res, t_qc, t_claims, t_chk, t_fig, t_exp = st.tabs(["Write", "Results store & verification", "Quality checks", "Claims", "PRISMA 2020 checklist", "Tables & figures", "Export"])
        with t_ed:
            key = st.selectbox("Section", [k for k, _ in MS.SECTIONS], format_func=lambda k: dict(MS.SECTIONS)[k])
            cur = db.section(p["id"], key); txt = st.text_area("Text (Markdown). Tokens: {{analysis.est}}, {{prisma.included}}, ... Citations: [@refKEY] for verified registry keys or [@ref<ID>] for project references.", cur if cur is not None else MS.TEMPLATES[key], height=320, key=f"ms_{p['id']}_{key}")
            c1, c2 = st.columns(2)
            if c1.button("Save section (new version)"): db.save_section(p["id"], key, txt); st.success("Saved (previous versions kept).")
            prev, pr = MS.render(db, p["id"], txt, final=False)
            with st.expander("Preview with current results (unverified values are marked)", expanded=True): st.markdown(prev)
            hist = db.section_history(p["id"], key)
            if hist: st.caption(f"{len(hist)} saved version(s); latest {datetime.datetime.fromtimestamp(hist[0]['ts']):%Y-%m-%d %H:%M}")
            st.caption("AI drafting assistance (if you use any) must be edited and owned by you, verified against sources, and disclosed per the journal's policy in Declarations.")
        with t_res:
            st.caption("Compute traceable values from your stored PRISMA counts, Search Log and saved effect sizes (Research Workspace → Effect sizes & analysis).")
            c1, c2, c3 = st.columns(3); mdl = c1.selectbox("Model", ["random", "common"]); est_ = c2.selectbox("τ² estimator", ["REML", "PM", "DL"]); hk = c3.checkbox("Hartung-Knapp CI", True)
            bt = st.checkbox("Also store exp()-transformed estimate (for ln ratios)")
            if st.button("Compute / refresh results"):
                try: st.success(f"{len(MS.compute_results(db, p['id'], mdl, est_, hk, 'exp' if bt else None))} values stored. Changed values lose their verification.")
                except (ValueError, S.ConvergenceError) as e_: st.error(str(e_))
            rs = db.results(p["id"])
            if rs:
                st.dataframe(pd.DataFrame([{"key": r["key"], "value": r["value"], "verified": "✓ " + r["verified_by"] if r["verified_by"] else "NO", "source": r["source"], "how verified": r["verify_note"] or ""} for r in rs]), hide_index=True, width="stretch")
                with st.form("vr"):
                    k1, k2, k3 = st.columns(3); kk = k1.selectbox("Result", [r["key"] for r in rs]); who = k2.text_input("Verifier (human)", "human:self"); how = k3.text_input("How you verified it (required)")
                    if st.form_submit_button("Mark verified"):
                        try: db.verify_result(p["id"], kk, who, how); st.rerun()
                        except ValueError as e_: st.error(str(e_))
                st.caption("Verify by reproducing the number independently, e.g. run the generated R code (Export) in R/metafor and compare. A value you did not check should not be verified.")
            else: st.info("No results stored yet.")
        with t_qc:
            issues = MS.qc(db, p["id"])
            for i in issues: (st.error if i["severity"] == "error" else st.warning if i["severity"] == "warning" else st.info)(f"[{i['check']}] {i['message']}")
            if not issues: st.success("No prompts. (Automated checks are prompts for human review, not guarantees.)")
        with t_claims:
            cl = st.text_input("Add a claim you make in the manuscript that needs evidence")
            if st.button("Add claim") and cl.strip(): db.add_ms_claim(p["id"], cl.strip()); st.rerun()
            for c_ in db.ms_claims(p["id"]):
                col1, col2 = st.columns([3, 2]); col1.write(("✅ " if c_["status"] == "resolved" else "⚠️ ") + c_["claim"] + (f"  → evidence: {c_['evidence_key']}" if c_["evidence_key"] else ""))
                if c_["status"] != "resolved":
                    ev = col2.text_input("Evidence key (result key or verified reference key)", key=f"ev{c_['id']}")
                    if col2.button("Resolve", key=f"rc{c_['id']}"):
                        try: db.resolve_ms_claim(c_["id"], ev); st.rerun()
                        except ValueError as e_: st.error(str(e_))
        with t_chk:
            st.caption("Short paraphrased item labels; use the official PRISMA 2020 checklist for exact wording (Page et al. 2021). Mark where each item is reported, or 'not applicable' with a reason.")
            cur = db.checklist(p["id"]); done = sum(1 for it in MS.PRISMA_ITEMS if cur.get(it, {}).get("status") in ("reported", "not applicable")); st.progress(done / 27, text=f"{done}/27")
            for it in MS.PRISMA_ITEMS:
                r_ = cur.get(it, {"location": "", "status": "open"})
                c1, c2, c3 = st.columns([3, 2, 2]); c1.write(it); loc = c2.text_input("Location / reason", r_["location"], key=f"loc{p['id']}{it}", label_visibility="collapsed"); stt = c3.selectbox("Status", ["open", "reported", "not applicable"], ["open", "reported", "not applicable"].index(r_["status"]), key=f"st{p['id']}{it}", label_visibility="collapsed")
                if (loc, stt) != (r_["location"], r_["status"]): db.set_checklist(p["id"], it, loc, stt)
        with t_fig:
            tbl = MS.study_table(db, p["id"]); st.markdown("**Study characteristics (from verified extraction records)**")
            if tbl: st.dataframe(pd.DataFrame(tbl), hide_index=True, width="stretch"); st.download_button("Download table (CSV)", db.to_csv(tbl), "study_characteristics.csv")
            else: st.info("Extract data first.")
            eff = db.effects(p["id"])
            if len(eff) >= 2:
                r_ = S.meta_analyze([e["yi"] for e in eff], [e["vi"] for e in eff], "random", "REML", True); bt = "exp" if eff[0]["measure"] in ("lnRR", "lnOR", "lnRR_binary") else None
                svg = MS.forest_svg([e["effect_id"] for e in eff], [e["yi"] for e in eff], [e["vi"] for e in eff], r_.est, r_.ci, "Forest plot", eff[0]["measure"], bt)
                import streamlit.components.v1 as components; components.html(svg, height=120 + 30 * len(eff)); st.download_button("Download forest plot (SVG)", svg, "forest.svg", "image/svg+xml")
                st.caption("Plot shows REML + Hartung-Knapp pooled estimate; the plot is not a verified result until you verify the numbers.")
        with t_exp:
            final = st.checkbox("Final export (only verified values render; otherwise flagged)", True)
            md, pr = MS.to_markdown(db, p["id"], final)
            if pr: st.warning(f"{len(pr)} unresolved value(s): the export carries a DRAFT banner.")
            st.download_button("Markdown", md, "manuscript.md"); st.download_button("Quarto (.qmd)", MS.to_quarto(db, p["id"], final)[0], "manuscript.qmd")
            st.download_button("LaTeX (.tex)", MS.to_latex(db, p["id"], final)[0], "manuscript.tex"); st.download_button("Word (.docx)", MS.to_docx(db, p["id"], final)[0], "manuscript.docx")
            st.caption("PDF export is not implemented (render the Quarto or LaTeX file yourself). Reproducibility ZIP: Research Workspace → Backup & export.")

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
        st.warning(f"**Preliminary signals, not decisions.** Every count was returned by {TS.DB} (S1-S18 on {TS.DATE}; S19-S30 on {TS.EXT_DATE}): one database, auto-translated queries, no screening. "
                   "Zero review hits does NOT prove novelty; a large primary literature does NOT prove usable data. You choose the topic.")
        st.header("Candidate topics and open questions")
        for c in TS.CANDIDATES:
            with st.expander(f"{c['id']}. {c['title']}"):
                st.markdown(f"**Why it may be interesting:** {c['why_interesting']}")
                if c["concerns"]: st.markdown("**Concerns:**\n" + "\n".join(f"- {x}" for x in c["concerns"]))
                st.markdown(f"**Likely design:** {c['likely_design']}  \n**Evidence (search ids):** {', '.join(c['signals'])}")
                st.markdown("**Next steps:**\n" + "\n".join(f"- {x}" for x in c["next_steps"]))
        st.header("Self-assessment rubric (your judgement, not mine)")
        st.caption("Score each criterion 0-2 for your top candidates after doing Milestone 3. A total is only a conversation starter.")
        for r in TS.RUBRIC: st.markdown(f"- {r}")
        st.header("The searches (exact queries)")
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
    tabs = st.tabs(["SD vs SE & CIs (simulation)", "Meta-analysis", "Subgroups & meta-regression", "Effect-size calculators", "Advanced methods", "Advanced methods II (v0.4)"])
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

    with tabs[4]:
        from metalab import advanced as AD
        import plotly.express as px
        st.markdown("**Advanced methods - each benchmarked against R/metafor 4.4.0** (see VALIDATION.md). Several need specialist judgement: use them with a methodologist, and pre-specify.")
        sub = st.selectbox("Method", ["Mantel-Haenszel / Peto (binary, sparse data)", "Small-study effects: funnel plot, Egger, Begg", "Cumulative meta-analysis", "tau² confidence interval (Q-profile)", "Influence diagnostics", "Three-level model + cluster-robust variance", "Rates, prevalence & design effect"])
        if sub.startswith("Mantel"):
            from metalab.datasets import BCG
            st.caption("Cells: a,b = treated events/non-events; c,d = control events/non-events. MH/Peto use uncorrected tables (valid with zero cells); the 0.5 correction only affects the per-study effects behind Q. MH assumes one common effect. Peto is biased with large effects/unbalanced arms.")
            tab = st.data_editor(pd.DataFrame(BCG, columns=["a", "b", "c", "d"]), num_rows="dynamic", key="mhed")
            m_ = st.radio("Measure", ["OR", "RR", "RD"], horizontal=True)
            try:
                r_ = AD.mantel_haenszel(tab["a"], tab["b"], tab["c"], tab["d"], m_); ex_ = m_ != "RD"
                st.write(f"**MH {m_}:** {np.exp(r_['est']) if ex_ else r_['est']:.4f} (95% CI {np.exp(r_['ci'][0]) if ex_ else r_['ci'][0]:.4f} to {np.exp(r_['ci'][1]) if ex_ else r_['ci'][1]:.4f}) · Q = {r_['Q']:.2f} (df {r_['Q_df']}) · k = {r_['k']}")
                if m_ == "OR":
                    p_ = AD.peto_or(tab["a"], tab["b"], tab["c"], tab["d"]); st.write(f"**Peto OR:** {np.exp(p_['est']):.4f} ({np.exp(p_['ci'][0]):.4f} to {np.exp(p_['ci'][1]):.4f})")
                st.code(f'library(metafor)\nrma.mh(ai=a, bi=b, ci=c, di=d, measure="{m_}", data=dat, add=1/2, to="only0", drop00=TRUE)' + ('\nrma.peto(ai=a, bi=b, ci=c, di=d, data=dat)' if m_ == "OR" else ""), "r")
            except (ValueError, KeyError) as e: st.error(str(e))
        elif sub.startswith("Small-study"):
            from metalab.datasets import BCG
            ys_, vs_ = zip(*[S.log_risk_ratio(a_, a_ + b_, c_, c_ + d_, cc=0.5) for a_, b_, c_, d_ in BCG]); dd_ = st.data_editor(pd.DataFrame({"yi": ys_, "vi": vs_}), num_rows="dynamic", key="funnel")
            try:
                y_, v_ = dd_["yi"].to_numpy(float), dd_["vi"].to_numpy(float); pooled = S.meta_analyze(y_, v_, "common").est; se_ = np.sqrt(v_)
                fg = go.Figure(); fg.add_scatter(x=y_, y=se_, mode="markers", name="studies"); sx = np.linspace(0, se_.max() * 1.05, 20)
                fg.add_scatter(x=pooled - 1.96 * sx, y=sx, mode="lines", line=dict(dash="dash"), name="pseudo 95% limits"); fg.add_scatter(x=pooled + 1.96 * sx, y=sx, mode="lines", line=dict(dash="dash"), showlegend=False)
                fg.update_yaxes(autorange="reversed", title="standard error"); fg.update_layout(title="Funnel plot (common-effect centre)", xaxis_title="effect size"); st.plotly_chart(fg, width="stretch")
                eg = AD.egger_test(y_, v_); bg = AD.begg_test(y_, v_)
                st.write(f"**Egger:** intercept {eg['intercept']:.3f}, t = {eg['t']:.3f} (df {eg['df']}), p = {eg['p']:.3f} · **Begg:** tau = {bg['tau']:.3f}, p = {bg['p']:.3f}")
                if "warning" in eg: st.warning(eg["warning"])
                st.warning("Funnel-plot asymmetry does NOT prove publication bias (heterogeneity, chance, true small-study differences, or the effect measure itself can cause it). With k<10 these tests have little power. Trim-and-fill, selection models and PET-PEESE are not implemented.")
            except (ValueError, S.ConvergenceError) as e: st.error(str(e))
        elif sub.startswith("Cumulative"):
            st.caption("Order must be pre-specified (e.g. year). This is descriptive; it is not a stopping rule (trial sequential analysis is not implemented).")
            ex_ = pd.DataFrame({"year": [1985, 1986, 1987, 1988, 1989, 1990], "yi": [0.1, 0.3, 0.2, 0.5, 0.35, 0.4], "vi": [0.08, 0.06, 0.05, 0.04, 0.03, 0.03]}); cd_ = st.data_editor(ex_.sort_values("year"), num_rows="dynamic", key="cum")
            try:
                cd_ = cd_.sort_values("year"); rows_ = AD.cumulative(cd_["yi"].to_numpy(float), cd_["vi"].to_numpy(float))
                fg = go.Figure(); fg.add_scatter(x=cd_["year"], y=[r["est"] for r in rows_], error_y=dict(type="data", symmetric=False, array=[r["ci"][1] - r["est"] for r in rows_], arrayminus=[r["est"] - r["ci"][0] for r in rows_]), mode="markers+lines")
                fg.update_layout(title="Cumulative pooled estimate (REML) after each study", xaxis_title="year", yaxis_title="effect"); st.plotly_chart(fg, width="stretch")
            except (ValueError, S.ConvergenceError) as e: st.error(str(e))
        elif sub.startswith("tau"):
            from metalab.datasets import BCG
            ys_, vs_ = zip(*[S.log_risk_ratio(a_, a_ + b_, c_, c_ + d_, cc=0.5) for a_, b_, c_, d_ in BCG]); r_ = AD.tau2_ci_qprofile(ys_, vs_); pt = S.meta_analyze(ys_, vs_)
            st.write(f"BCG trials (log RR): REML τ² = {pt.tau2:.3f}; **Q-profile 95% CI for τ²: {r_['tau2'][0]:.3f} to {r_['tau2'][1]:.3f}**; I² CI {r_['I2'][0]:.1f}% to {r_['I2'][1]:.1f}%")
            st.caption("Heterogeneity estimates are far less certain than their point values suggest (Veroniki 2016 recommends the Q-profile interval). Paste your own data in the Meta-analysis tab for the point estimates.")
        elif sub.startswith("Influence"):
            from metalab.datasets import BCG
            ys_, vs_ = zip(*[S.log_risk_ratio(a_, a_ + b_, c_, c_ + d_, cc=0.5) for a_, b_, c_, d_ in BCG]); rows_ = AD.influence_diagnostics(ys_, vs_)
            df_ = pd.DataFrame(rows_); df_["study"] = [f"Trial {i+1}" for i in df_["i"]]; st.dataframe(df_[["study", "rstudent", "cook", "hat", "weight_pct", "tau2_del"]], hide_index=True)
            st.warning("Large |rstudent| or Cook's distance is a prompt to investigate (data error? different population?), NOT a reason to delete a study. Do not remove studies to change significance.")
        elif sub.startswith("Three"):
            from metalab.datasets import KON_YI, KON_VI, KON_DISTRICT
            st.caption("Konstantopoulos (2011) multisite trials: 56 school effects in 11 districts (published example data, metadat). Model: effect = overall mean + district effect + school effect + sampling error (diagonal V).")
            try:
                fit = AD.multilevel_meta(KON_YI, KON_VI, KON_DISTRICT); rb = AD.robust_cr1(fit)
                st.write(f"Overall mean = {fit['beta'][0]:.4f} (model SE {fit['se'][0]:.4f}); between-district variance = {fit['sigma2_cluster']:.4f}; within-district (school) variance = {fit['sigma2_effect']:.4f}; REML log-lik = {fit['loglik_reml']:.3f}")
                st.write(f"Cluster-robust (CR1) SE = {rb['se'][0]:.4f}, t({rb['df']}) p = {rb['p'][0]:.4f}, 95% CI {rb['ci'][0][0]:.3f} to {rb['ci'][1][0]:.3f}")
                for w_ in [fit["warning"]] if fit["warning"] else []: st.warning(w_)
                st.warning("Not covered: shared-control covariance (needs a full V matrix), CR2/Satterthwaite small-sample correction (clubSandwich), meta-regression in multilevel models, Bayesian/GLMM. With few clusters CR1 can be anti-conservative.")
                st.code('library(metafor)\nres <- rma.mv(yi, vi, random = ~ 1 | district/school, data = dat.konstantopoulos2011, method = "REML")\nrobust(res, cluster = district, clubSandwich = FALSE)', "r")
            except (ValueError, S.ConvergenceError) as e: st.error(str(e))
        else:
            c1, c2, c3 = st.columns(3)
            x1 = c1.number_input("events group 1", 0, value=10); t1 = c1.number_input("person-time group 1", 0.1, value=100.0); x2 = c2.number_input("events group 2", 0, value=15); t2 = c2.number_input("person-time group 2", 0.1, value=110.0)
            try: y_, v_ = AD.log_irr(x1, t1, x2, t2); st.write(f"ln IRR = {y_:.4f} (IRR {np.exp(y_):.3f}), variance {v_:.4f}")
            except ValueError as e: st.error(str(e))
            xs = c3.number_input("events (prevalence)", 0, value=12); ns = c3.number_input("n (prevalence)", 1, value=80)
            try:
                for m_ in ("PR", "PLO", "PFT", "PAS"): y_, v_ = AD.proportion_es(int(xs), int(ns), m_); st.write(f"{m_}: {y_:.4f} (variance {v_:.5f})")
                st.caption("Freeman-Tukey back-transformation depends on one 'n' and can mislead; logit/GLMM approaches are often preferred (not implemented here).")
            except ValueError as e: st.error(str(e))
            m_c = st.number_input("cluster size m", 1, value=10); icc = st.number_input("ICC", 0.0, 1.0, 0.1); st.write(f"Design effect = {AD.design_effect(int(m_c), icc):.2f}; effective n = n / DEFF (equal clusters only)")
    with tabs[5]:
        from metalab import advanced2 as AD2, datasets as DS
        st.markdown("**Advanced methods II - benchmarked against R/metafor 4.4.0, clubSandwich and base R where noted (see VALIDATION.md).** They need specialist judgement; several are *sensitivity analyses*, not corrections. Nothing here is expert-reviewed. Methods whose dedicated R package could not be installed in the build environment (netmeta, mada, bayesmeta, dosresmeta, selection models) were benchmarked against metafor `rma.mv` or independent numerical integration instead - re-run the R workflow in the lesson before relying on them.")
        sub2 = st.selectbox("Method", ["Trim-and-fill (sensitivity only)", "PET / PEESE", "Cluster-robust CR2 (few clusters)", "Network meta-analysis (Hasselblad smoking data)", "Bivariate DTA meta-analysis (synthetic data)", "Multivariate meta-analysis (Berkey data)", "Bayesian random-effects (prior sensitivity)", "Power & number of studies", "Rare events: continuity-correction sensitivity", "Survival: log HR from published results"], key="adv2")
        from metalab.datasets import BCG
        bcg_y, bcg_v = zip(*[S.log_risk_ratio(a_, a_ + b_, c_, c_ + d_, cc=0.5) for a_, b_, c_, d_ in BCG])
        try:
            if sub2.startswith("Trim"):
                dd_ = st.data_editor(pd.DataFrame({"yi": bcg_y, "vi": bcg_v}), num_rows="dynamic", key="tf_ed"); est_ = st.radio("Estimator", ["L0", "R0", "Q0"], horizontal=True)
                r_ = AD2.trim_fill(dd_["yi"].to_numpy(float), dd_["vi"].to_numpy(float), est_)
                st.write(f"Missing studies imputed (k0) = **{r_['k0']}** on the {r_['side']} side · adjusted estimate {r_['est']:.4f} (95% CI {r_['ci'][0]:.4f} to {r_['ci'][1]:.4f}) vs unadjusted {r_['est_unadjusted']:.4f} ({r_['ci_unadjusted'][0]:.4f} to {r_['ci_unadjusted'][1]:.4f})")
                fg = go.Figure(); fg.add_scatter(x=dd_["yi"], y=np.sqrt(dd_["vi"]), mode="markers", name="observed"); fg.add_scatter(x=r_["filled_y"], y=np.sqrt(r_["filled_v"]), mode="markers", marker=dict(symbol="circle-open", size=11), name="imputed (filled)")
                fg.update_yaxes(autorange="reversed", title="standard error"); fg.update_layout(xaxis_title="effect size", title="Funnel plot with trim-and-fill"); st.plotly_chart(fg, width="stretch")
                for n_ in r_["notes"]: st.warning(n_)
                st.code("library(metafor)\nres <- rma(yi, vi, data = dat, method = 'REML')\ntrimfill(res, estimator = 'L0')", "r")
            elif sub2.startswith("PET"):
                dd_ = st.data_editor(pd.DataFrame({"yi": bcg_y, "vi": bcg_v}), num_rows="dynamic", key="pp_ed"); r_ = AD2.pet_peese(dd_["yi"].to_numpy(float), dd_["vi"].to_numpy(float))
                st.dataframe(pd.DataFrame([{"model": m_.upper(), "intercept (bias-adjusted effect)": r_[m_]["coef"][0], "SE": r_[m_]["se"][0], "p": r_[m_]["p"][0], "slope": r_[m_]["coef"][1], "slope p": r_[m_]["p"][1]} for m_ in ("pet", "peese")]), hide_index=True); st.warning(r_["warning"])
                st.code("pet <- lm(yi ~ sqrt(vi), data = dat, weights = 1/vi)\npeese <- lm(yi ~ vi, data = dat, weights = 1/vi)", "r")
            elif sub2.startswith("Cluster"):
                from metalab.datasets import KON_YI, KON_VI, KON_DISTRICT
                r_ = AD2.multilevel_cr2(KON_YI, KON_VI, KON_DISTRICT); f_ = r_["fit"]
                st.write(f"Konstantopoulos (2011) example, 11 districts. Mean = {f_['beta'][0]:.4f}; model-based SE {f_['se'][0]:.4f}; **CR2 SE {r_['se'][0]:.4f}, Satterthwaite df = {r_['df'][0]:.2f}, p = {r_['p'][0]:.4f}**")
                for w_ in r_["warnings"]: st.warning(w_)
                st.caption("Check: the CR2/Satterthwaite step reproduces clubSandwich::coef_test(vcov='CR2') on the same fitted covariance (see tests).")
                st.code("library(clubSandwich)\nres <- rma.mv(yi, vi, random = ~ 1 | district/school, data = dat.konstantopoulos2011)\ncoef_test(res, vcov = 'CR2', cluster = dat.konstantopoulos2011$district)", "r")
            elif sub2.startswith("Network"):
                ar_ = DS.HASSELBLAD; st_ = [a[0] for a in ar_]; tr_ = [a[1] for a in ar_]; x_ = np.array([a[2] for a in ar_], float); n_ = np.array([a[3] for a in ar_], float)
                mdl = st.radio("Model", ["random", "common"], horizontal=True); ref_ = st.selectbox("Reference treatment", ["no_contact", "ind_counseling", "grp_counseling", "self_help"])
                r_ = AD2.nma(st_, tr_, np.log((x_ + .5) / (n_ - x_ + .5)), 1 / (x_ + .5) + 1 / (n_ - x_ + .5), reference=ref_, model=mdl)
                T_ = r_["treatments"]; lg = pd.DataFrame(np.exp(r_["league"]), index=T_, columns=T_).round(3); st.markdown("**League table: odds ratio of ROW vs COLUMN** (cessation; >1 favours the row treatment)"); st.dataframe(lg)
                st.write(f"tau² = {r_['tau2']:.4f} · global Q = {r_['Q']:.1f} (df {r_['Q_df']}, p = {r_['Q_p']:.3g}) · P-scores: " + ", ".join(f"{k}: {v:.2f}" for k, v in r_["pscore"].items()))
                for w_ in r_["warnings"]: st.warning(w_)
                st.code("library(netmeta)  # run on your own machine - not available in the build sandbox\npw <- pairwise(treat = trt, event = xi, n = ni, studlab = study, data = dat, sm = 'OR')\nnm <- netmeta(pw, reference.group = 'no_contact', common = FALSE)\nnetsplit(nm); decomp.design(nm)", "r")
            elif sub2.startswith("Bivariate"):
                t_ = DS.DTA_SYNTHETIC; r_ = AD2.dta_bivariate([x[0] for x in t_], [x[1] for x in t_], [x[2] for x in t_], [x[3] for x in t_])
                st.warning("SYNTHETIC teaching data - not real studies.")
                st.write(f"Summary sensitivity **{r_['sens']:.3f}** ({r_['sens_ci'][0]:.3f}-{r_['sens_ci'][1]:.3f}) · specificity **{r_['spec']:.3f}** ({r_['spec_ci'][0]:.3f}-{r_['spec_ci'][1]:.3f}) · DOR {r_['dor']:.1f} · LR+ {r_['lr_pos']:.2f} · LR- {r_['lr_neg']:.3f} · between-study correlation (logit scale) {r_['rho']:.2f}")
                for w_ in r_["warnings"]: st.warning(w_)
                st.code("library(mada)  # run locally\nfit <- reitsma(dat)  # data frame with TP, FN, FP, TN\nsummary(fit)", "r")
            elif sub2.startswith("Multivariate"):
                yy = np.array(DS.BERKEY_YI); oc = np.array([0 if o == "AL" else 1 for o in DS.BERKEY_OUTCOME]); r_ = AD2.multivariate_meta(yy, {int(k): np.array(v) for k, v in DS.BERKEY_V.items()}, oc, np.array(DS.BERKEY_TRIAL), 2)
                st.write(f"Berkey et al. (1998): pooled AL change {r_['beta'][0]:.4f} (SE {r_['se'][0]:.4f}); PD change {r_['beta'][1]:.4f} (SE {r_['se'][1]:.4f}); tau² = {r_['tau2'][0]:.4f}, {r_['tau2'][1]:.4f}; between-trial correlation {r_['rho']:.3f}")
                for w_ in r_["warnings"]: st.warning(w_)
                st.code("rma.mv(yi, V, mods = ~ 0 + outcome, random = ~ outcome | trial, struct = 'UN', data = dat.berkey1998)", "r")
            elif sub2.startswith("Bayesian"):
                pr = st.radio("Prior on tau", ["halfnormal", "halfcauchy"], horizontal=True); sc = st.slider("Prior scale", 0.05, 2.0, 0.5, 0.05)
                r_ = AD2.bayes_meta(bcg_y, bcg_v, pr, sc)
                st.write(f"BCG log RR: posterior mean mu {r_['mu_mean']:.3f} (95% CrI {r_['mu_ci'][0]:.3f} to {r_['mu_ci'][1]:.3f}); tau median {r_['tau_median']:.3f} (95% CrI {r_['tau_ci'][0]:.3f} to {r_['tau_ci'][1]:.3f})"); st.warning(r_["warning"])
                st.code("library(bayesmeta)  # run locally\nbayesmeta(y = yi, sigma = sqrt(vi), mu.prior.mean = 0, mu.prior.sd = 4, tau.prior = function(t) dhalfnormal(t, scale = 0.5))", "r")
            elif sub2.startswith("Power"):
                c1, c2, c3, c4 = st.columns(4); th = c1.number_input("True effect (e.g. SMD)", value=0.3); n1 = c2.number_input("n per group per study", 2, value=30); tau2 = c3.number_input("tau² (assumed known)", 0.0, value=0.02); k = c4.number_input("Number of studies", 1, value=10)
                vt = AD2.smd_variance(n1, n1, th); st.write(f"Typical SMD variance {vt:.4f}; power with k = {int(k)}: **{AD2.power_meta(th, vt, int(k), tau2):.3f}**; studies needed for 80% power: **{AD2.k_for_power(th, vt, tau2)}**; Q-test power for this tau²: {AD2.power_Q_test(int(k), vt, tau2):.3f}")
                st.warning("Assumes equal-sized studies, a KNOWN tau² and a normal approximation. Realised power is lower when tau² is estimated (especially with Hartung-Knapp and few studies). Post-hoc power from an observed effect is meaningless and not offered.")
            elif sub2.startswith("Rare"):
                st.caption("BCG trial tables used for illustration. Rare-event data: sparse zero cells make the continuity correction drive the result - compare, and prefer Mantel-Haenszel/Peto or a binomial GLMM (R workflow in the lesson).")
                a_, b_, c_, d_ = zip(*DS.BCG); r_ = AD2.cc_sensitivity(a_, b_, c_, d_, st.radio("Measure", ["OR", "RR"], horizontal=True)); st.dataframe(pd.DataFrame([{"correction": k, **v} for k, v in r_.items()]), hide_index=True)
            else:
                c1, c2, c3 = st.columns(3); hr = c1.number_input("HR", 0.01, value=0.80); lo = c2.number_input("lower 95% limit", 0.001, value=0.64); hi = c3.number_input("upper 95% limit", 0.001, value=1.00)
                lh, se_ = AD2.loghr_from_ci(hr, lo, hi); st.write(f"ln HR = {lh:.4f}, SE = {se_:.4f} -> pool with generic inverse-variance (Statistics Lab > Meta-analysis). Check proportional hazards and that CIs are not from robust/exact methods; where only Kaplan-Meier curves are published, reconstruct IPD (Guyot 2012; external R workflow in the lesson).")
        except (ValueError, S.ConvergenceError, np.linalg.LinAlgError) as e: st.error(f"Cannot compute: {e}")
# ------------------------------------------------------ KNOWLEDGE UNIVERSE
elif page == "Knowledge Universe":
    st.title("Knowledge Universe")
    vs = VER.summary(db)
    st.caption(f"{vs['total']} registry entries · {vs['page examined by a human']} verified by a human · {vs['link-checked']} link-checked · {vs['candidate']} candidates (not verified). Plus {len(references.REFS)} bibliographically verified papers.")
    t1, t2, t3, t4 = st.tabs(["Resources (filterable)", "Recommended for a lesson/task", "Verified papers", "Verify resources (local workflow)"])
    with t1:
        st.warning("**Most entries are CANDIDATES** chosen from author knowledge: the build sandbox could not reach their sites. Status shows exactly what has been checked. Costs, versions and licences are 'check yourself'. 'SEARCH:' entries are search links, not endorsements.")
        c1, c2, c3 = st.columns(3)
        q = c1.text_input("Search"); cats = c2.multiselect("Category", sorted({resources.category(r) for r in resources.RESOURCES})); lv = c3.multiselect("Level", ["Beginner", "Intermediate", "Advanced", "All"])
        d1, d2, d3 = st.columns(3)
        disc = d1.multiselect("Discipline", ["Health", "Life sciences", "Ecology", "Education", "Agriculture", "Preclinical", "Social science", "Methodology", "Ageing", "Genetics"]); free = d2.checkbox("Hide paid-only"); only_v = d3.checkbox("Only human-verified")
        rows = resources.filter_resources(q, (), disc, lv, free, cats)
        rows = [r for r in rows if not only_v or VER.status(r["url"], db)["level"] == VER.LEVELS[2]]
        st.caption(f"{len(rows)} of {len(resources.RESOURCES)} resources")
        st.dataframe(pd.DataFrame([{"title": r["title"], "category": resources.category(r), "org": r["org"], "type": r["type"], "level": r["level"], "discipline": r["discipline"], "access": r["access"],
                                    "status": VER.status(r["url"], db)["level"], "why useful": r["why"], "modules": ", ".join(map(str, r["modules"])), "url": r["url"]} for r in rows]),
                     hide_index=True, width="stretch", column_config={"url": st.column_config.LinkColumn("url")})
        st.caption("Not yet listed (nothing verified, nothing invented): specific YouTube channels, named recorded lectures, specific fellowships/grant calls/summer schools. Use the SEARCH entries and the Opportunities directory in Network & Collaboration.")
    with t2:
        mid = st.selectbox("Module", [m["id"] for m in curriculum.MODULES], format_func=lambda i: f"{i}. {curriculum.BY_ID[i]['title']}")
        rec = resources.recommend(mid)
        st.markdown(f"**Resources tagged to Module {mid}** ({'lesson available' if mid in LES else 'outline only'})")
        for r in rec["resources"]: st.markdown(f"- [{r['title']}]({r['url']}) - {resources.category(r)} · {r['access']} · *{r['why']}* · `{VER.status(r['url'], db)['level']}`")
        if not rec["resources"]: st.caption("No resource tagged yet for this module.")
        if rec["references"]:
            st.markdown("**Verified references cited by the lesson**")
            for r in rec["references"]: st.markdown("- " + references.link(r["key"]))
        st.caption("Recommendations are tag-based (modules assigned by the author), not personalised or evaluated.")
    with t3:
        st.caption(f"{len(references.REFS)} papers. Bibliographic verification only (title/authors/journal/DOI matched in PubMed or Crossref); abstract/full-text examination is tracked per claim in Quality & Expert Review.")
        pq = st.text_input("Filter papers")
        for k, v in references.REFS.items():
            if not pq or pq.lower() in v["cite"].lower(): st.markdown(f"- {references.link(k)} · verified {v['verified_on']} via {v.get('verified_via', '')}")
    with t4:
        st.markdown("**How to verify on your own machine** (the sandbox could not): (1) run `python3 tools/check_links.py` (link level only); (2) download the queue below, open each official page, fill the columns *verifier, verified_on, page_title_seen, matches_description* (+ cost/version/notes); (3) upload it back. Rows without a verifier are skipped; invalid rows are rejected with a reason. Only a human who actually looked can verify; AI cannot.")
        st.download_button("Download verification queue (CSV)", VER.export_queue(db), "verification_queue.csv")
        up = st.file_uploader("Upload filled queue", type="csv")
        if up and st.button("Import verification results"):
            res = VER.import_results(db, up.getvalue().decode("utf-8", "ignore")); st.success(f"Imported {res['imported']}, skipped {res['skipped']} unfilled rows.")
            for ln, msg in res["errors"][:20]: st.error(f"Row {ln}: {msg}")
        with st.form("onev"):
            es = VER.entries(); u = st.selectbox("Entry", [e["url"] for e in es], format_func=lambda x: next(e["name"] for e in es if e["url"] == x))
            c1, c2, c3 = st.columns(3); who = c1.text_input("Verifier (human)", "human:self"); dt = c2.text_input("Date you looked (YYYY-MM-DD)", str(datetime.date.today())); mt = c3.selectbox("Matches the description?", ["yes", "partly", "no"])
            pt = st.text_input("Page title / heading you saw (required)"); ac = st.text_input("Access / cost you saw"); vd = st.text_input("Version / date on the page"); nt = st.text_input("Notes")
            if st.form_submit_button("Record verification"):
                try: db.add_verification(u, who, dt, pt, mt, ac, vd, nt); st.success("Recorded"); st.rerun()
                except ValueError as e_: st.error(str(e_))
        ver = db.verifications()
        if ver: st.dataframe(pd.DataFrame(ver)[["url", "verifier", "verified_on", "page_title_seen", "matches_description", "access_cost_seen", "version_or_date_seen", "notes"]], hide_index=True, width="stretch")

# --------------------------------------------------------------- NETWORK
elif page == "Network & Collaboration":
    st.title("Network & Collaboration")
    st.info("There are no platform users, profiles, posts, matches or opportunities, and none are simulated. Real community features need authentication, moderation and hosting (see FUTURE_COMMUNITY_ARCHITECTURE.md). "
            "Below: a directory of real external organisations/communities (unverified links), a LOCAL collaborator manager for people you add yourself, CRediT tracking and templates. MetaLab never contacts anyone.")
    tabs = st.tabs(["Directory", "My collaborators (local)", "CRediT & authorship", "Templates", "Opportunities"])
    with tabs[0]:
        st.markdown("**Organisations and societies**")
        st.dataframe(pd.DataFrame([{**{k: o.get(k, "") for k in ("name", "focus", "discipline", "url", "membership", "cost")}, "status": VER.status(o["url"], db)["level"]} for o in resources.ORGS]), hide_index=True, width="stretch", column_config={"url": st.column_config.LinkColumn("url")})
        st.markdown("**Communities and forums** (public; quality varies; follow each community's rules; do not post unpublished data)")
        st.dataframe(pd.DataFrame([{"name": o["name"], "kind": o["kind"], "focus": o["focus"], "url": o["url"], "status": VER.status(o["url"], db)["level"]} for o in resources.COMMUNITIES]), hide_index=True, width="stretch", column_config={"url": st.column_config.LinkColumn("url")})
        st.caption("Mentoring/training organisations are marked in the focus column (e.g. NRMN, CIMER, Open Life Science, The Carpentries, ReproducibiliTea). Not listed because nothing is verified: specific university evidence-synthesis centres, named librarians, statistical-consultation services, named mentors. Ask your own institution's library and statistics/biostatistics core first - they are often the best first contact.")
    with tabs[1]:
        st.caption("Contacts you add manually are stored only in this local file. Store only what you need and only with a legitimate basis; do not add private details of others you would not want shared. Deleting removes them and their notes.")
        with st.form("ct", clear_on_submit=True):
            c1, c2, c3 = st.columns(3); nm = c1.text_input("Name"); rl = c2.text_input("Role/expertise"); og = c3.text_input("Organisation")
            hm = st.text_input("How you know them / context"); ok = st.text_input("Contact preferences / consent note"); nt = st.text_area("Notes", height=70)
            if st.form_submit_button("Add contact"):
                try: db.add_contact(nm, rl, og, "", rl, hm, ok, nt); st.success("Added"); st.rerun()
                except ValueError as e_: st.error(str(e_))
        cts = db.contacts()
        for c_ in cts:
            with st.expander(f"{c_['name']} - {c_['role']} ({c_['org']})"):
                st.write(c_["how_met"], "·", c_["contact_ok"]); st.write(c_["notes"])
                with st.form(f"ia{c_['id']}", clear_on_submit=True):
                    i1, i2, i3 = st.columns(3); dt = i1.date_input("Date", key=f"d{c_['id']}"); kd = i2.selectbox("Kind", ["email", "call", "meeting", "message", "other"], key=f"k{c_['id']}"); fu = i3.text_input("Follow-up due (YYYY-MM-DD)", key=f"f{c_['id']}")
                    sm_ = st.text_input("Summary", key=f"s{c_['id']}")
                    if st.form_submit_button("Log interaction"): db.log_interaction(c_["id"], str(dt), kd, sm_, fu); st.rerun()
                for i_ in db.interactions(c_["id"]): st.caption(f"{i_['date']} · {i_['kind']} · {i_['summary']}" + (f" · follow-up {i_['followup_due']}" if i_["followup_due"] else ""))
                if st.button("Delete this contact and its notes", key=f"del{c_['id']}"): db.delete_contact(c_["id"]); st.rerun()
        due_ = db.followups_due()
        if due_: st.warning("Follow-ups due: " + "; ".join(f"{x['name']} ({x['followup_due']})" for x in due_))
        if not cts: st.info("No contacts yet. Add genuine contacts here; nothing is pre-populated.")
    with tabs[2]:
        from metalab import templates_lib as TL
        p = project_picker("cr")
        st.caption("CRediT lists 14 contributor roles describing what was actually done. It does not decide authorship; follow ICMJE/journal/institutional criteria. Gift or purchased authorship is not supported.")
        if p:
            with st.form("crf", clear_on_submit=True):
                c1, c2 = st.columns(2); per = c1.text_input("Person (you or a collaborator)"); rl_ = c2.selectbox("CRediT role", TL.CREDIT_ROLES); nt_ = st.text_input("What exactly was done? (required)")
                if st.form_submit_button("Record contribution"):
                    try: db.add_credit(p["id"], per, rl_, nt_); st.rerun()
                    except ValueError as e_: st.error(str(e_))
            cr = db.credits(p["id"])
            if cr: st.dataframe(pd.DataFrame(cr)[["person", "role", "note"]], hide_index=True, width="stretch")
    with tabs[3]:
        from metalab import templates_lib as TL
        k = st.selectbox("Template", list(TL.T)); st.text_area("Edit and send yourself (the platform never contacts anyone)", TL.T[k], height=280)
        st.caption("Authorship must follow your institution/journal criteria (e.g. ICMJE): substantive contribution only. Agreement text is a draft, not legal advice.")
    with tabs[4]:
        st.info("**Opportunities directory, not a feed.** These are recurring events, funder portals and training directories where genuine opportunities are announced. No specific call, deadline, fee, eligibility or 'currently open' status is asserted, and there is no live monitoring. Check each official page; record what you find in your own notes or via the verification workflow.")
        st.dataframe(pd.DataFrame([{**o, "status": VER.status(o["url"], db)["level"]} for o in resources.OPPORTUNITY_DIRECTORIES]), hide_index=True, width="stretch", column_config={"url": st.column_config.LinkColumn("url")})
        st.caption("Filters you will want when you add verified opportunities yourself: discipline, country, remote participation, career stage, cost, deadline, funding, eligibility - the verification ledger records the date and what you saw.")

# ------------------------------------------------------ QUALITY / EXPERT REVIEW
elif page == "Quality & Expert Review":
    from metalab import claims as CL, expert as EX
    st.title("Quality & Expert Review")
    sm = CL.summary()
    st.metric("Claims tracked", sm["total"]); c1, c2, c3, c4 = st.columns(4)
    c1.metric("Directly supported (abstract/software)", sm["supported"]); c2.metric("Partial", sm["partial"])
    c3.metric("Unverified", sm["unverified"]); c4.metric("Human-expert reviewed", sm["human_reviewed"])
    st.warning("Nothing in MetaLab is expert-reviewed yet. 'Supported' means the source's abstract (or software output) directly supports the claim - not that a qualified human checked the lesson.")
    t1, t2, t3, t4 = st.tabs(["Claim register", "Correction history", "Expert review packages", "Curriculum coverage audit"])
    with t1:
        st.dataframe(pd.DataFrame(CL.CLAIMS).drop(columns=["verified_on"]), hide_index=True, width="stretch")
    with t2:
        st.caption("Every error found so far is kept here, including ones the verification tools caught.")
        st.dataframe(pd.DataFrame(CL.CORRECTIONS), hide_index=True, width="stretch")
    with t3:
        pk = EX.available(); sel = st.selectbox("Package", list(pk))
        md = pk[sel](); st.download_button("Download package (Markdown)", md, file_name=sel.split(":")[0].replace(" ", "_") + "_review_package.md")
        with st.expander("Preview"): st.markdown(md)
    with t4:
        st.warning(LRN.AUDIT_NOTE)
        st.dataframe(pd.DataFrame(LRN.coverage_table()), hide_index=True, width="stretch")
        st.markdown("**Proposed additional modules (justified by gaps found while building)**")
        st.dataframe(pd.DataFrame(LRN.PROPOSED_NEW_MODULES, columns=["id", "level", "title", "justification"]), hide_index=True, width="stretch")

# ----------------------------------------------------------------- STATUS
else:
    st.title("Status & Limitations")
    F = json.load(open(ROOT / "features.json"))
    st.caption(F["_note"])
    st.dataframe(pd.DataFrame(F["features"]).fillna(""), hide_index=True, width="stretch")
    c = curriculum.counts()
    st.markdown(f"**Curriculum:** {c['total']} modules registered; **{c['drafted']} have lessons**; {c['outline']} are outlines only.")
    st.markdown("See `KNOWN_LIMITATIONS.md`, `TESTING_REPORT.md`, `PROJECT_STATUS.md` in the project folder.")


# ------------------------------------------------------- cross-page "what next" links (consistent footer)
NEXT = {"Home": ["Onboarding", "Learning Academy", "First Paper Plan"], "Onboarding": ["Method Wizard", "Learning Academy"], "Learning Academy": ["Practice", "Coding Lab", "First Paper Plan"],
        "Practice": ["Learning Academy", "Virtual Lab"], "Coding Lab": ["Statistics Lab", "Learning Academy"], "Virtual Lab": ["Research Workspace", "Coding Lab"],
        "Method Wizard": ["Learning Academy", "Statistics Lab"], "First Paper Plan": ["Research Workspace", "Learning Academy", "Knowledge Universe"],
        "Research Workspace": ["Manuscript Studio", "Statistics Lab", "Virtual Lab"], "Manuscript Studio": ["Research Workspace", "Quality & Expert Review"],
        "Statistics Lab": ["Research Workspace", "Coding Lab"], "Knowledge Universe": ["Network & Collaboration", "Learning Academy"], "Network & Collaboration": ["Knowledge Universe", "First Paper Plan"],
        "Quality & Expert Review": ["Status & Limitations", "Learning Academy"], "Status & Limitations": ["Quality & Expert Review", "Home"]}
st.divider()
cols = st.columns(len(NEXT[page]) + 1); cols[0].caption("Related:")
for c_, p_ in zip(cols[1:], NEXT[page]): c_.button(f"{ICONS[AREAS[p_]]} {p_}", key=f"foot_{page}_{p_}", on_click=goto, args=(p_,))
