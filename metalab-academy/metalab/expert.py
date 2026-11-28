"""Build self-contained expert-review packages (Markdown). Reviewing a package does not require the whole app.
Nothing here marks anything as expert-reviewed: review status changes only when a qualified human signs
and a maintainer records it in claims.json / features.json."""
from pathlib import Path
from . import claims, references, lessons, curriculum

ROOT = Path(__file__).resolve().parent.parent
SIGNOFF = """## Reviewer sign-off (to be completed by the reviewer)
- Name / affiliation / qualification relevant to this review:
- Date:
- Scope reviewed (tick): [ ] statements of fact  [ ] formulas  [ ] worked examples  [ ] quiz answers  [ ] code/numbers  [ ] omissions
- Overall: [ ] acceptable as educational material  [ ] acceptable with corrections  [ ] not acceptable
- Corrections required (quote the text, give the correct statement and a source):
- Missing concepts a learner needs:
- Conflicts of interest:
> Return as a file; the maintainer records the outcome in `claims.json` (human_review) and `corrections.json`. Until then nothing is labelled expert-reviewed.
"""

def lesson_package(n):
    L = lessons.load()[n]
    out = [f"# Expert review package - Lesson {n}: {L['title']}", f"Version {L['version']} · status: **{L['status']}** · last verification: {L['last_verified']}",
           "\n## What you are being asked to check\nWhether each statement is correct, appropriately hedged, current, and pedagogically sound. Please be harsh; unsupported claims are listed below with their evidence level.\n",
           "## Content\n### Why it matters\n" + L["why"], "### Plain-language\n" + L["plain"], "### Intermediate\n" + L["intermediate"], "### Advanced\n" + L["advanced"]]
    if L["formulas"]:
        out.append("### Formulas")
        for f in L["formulas"]:
            out.append(f"- **{f['name']}**: `{f['tex']}`; symbols: " + "; ".join(f"{k} = {v}" for k, v in f["symbols"].items()))
    out += ["### Assumptions", *[f"- {a}" for a in L["assumptions"]], "### Worked example", L["worked_example"],
            "### Common mistakes / misconceptions / controversies", *[f"- {m}" for m in L["mistakes"]],
            *[f"- Misconception: {a} -> {b}" for a, b in L["misconceptions"]], *[f"- Controversy: {c}" for c in L["controversies"]], "### Quiz (answer marked *)"]
    for i, q in enumerate(L["quiz"], 1):
        out.append(f"{i}. {q['q']}")
        out += [f"   - {'*' if j == q['ans'] else ' '} {o}" for j, o in enumerate(q["opts"])]
        out.append(f"   - Explanation: {q['why']}")
    out.append("\n## Claim-level evidence")
    cs = claims.for_lesson(n)
    out.append("| id | claim | source | examined | supports directly | limitations | status |\n|---|---|---|---|---|---|---|")
    for c in cs:
        out.append(f"| {c['id']} | {c['claim']} | {(references.REFS[c['source_key']]['cite'][:70] if c['source_key'] else c['source_type'])} | {c['examined']} | {c['supports_directly']} | {c['limitations']} | {c['status']} |")
    if not cs: out.append("*No claim-level records yet for this lesson - everything is unverified at claim level.*")
    out.append("\n## References cited (bibliographic verification)")
    out += [f"- {references.link(k)} (verified {references.REFS[k]['verified_on']} via {references.REFS[k].get('verified_via','')})" for k in L["further"]]
    rel = [c for c in claims.CORRECTIONS if f"lesson_{n:02d}" in c["where"]]
    out.append("\n## Correction history touching this lesson\n" + ("\n".join(f"- {c['date']}: {c['what']} -> {c['fix']}" for c in rel) or "- none recorded"))
    out.append(SIGNOFF)
    return "\n".join(out)

def stats_package():
    v = (ROOT / "VALIDATION.md").read_text()
    out = ["# Expert review package - Statistics engine (metalab/stats.py)",
           "Reviewer: statistician / meta-analysis methodologist. Numerical agreement with R/metafor is documented below; **methodological suitability is not established** and is what you are asked to judge.",
           "\n## Implemented methods\nEffect sizes: MD, SMD (Hedges g, exact J; LS and Borenstein variance), lnRR, ln OR, ln RR, RD (zero-cell correction), Fisher z, SD/SE/CI conversions, group combination.\n"
           "Pooling: inverse-variance common-effect; random effects with REML (score-equation root finding), DL, PM; HKSJ; prediction intervals (Riley t(k-2) and metafor convention); Q, I2 (Q-based and tau2-based), H2; leave-one-out; subgroup analysis; mixed-effects meta-regression (z and knha).\n",
           "## Questions for you\n1. Are the defaults (REML, Riley PI, LS variance) defensible for a first-time user? 2. Are the guard-rails (k<5 warning, <10 studies/moderator warning, refusal rules) adequate? 3. What methods are dangerously missing for the stated use-cases? 4. Are any docstrings/UI texts misleading?\n",
           "## Validation record\n" + v, "\n## Source\n`metalab/stats.py`, `tests/test_validation_r.py`, `validation/make_reference.R`, `validation/reference/reference.json`.", SIGNOFF]
    return "\n".join(out)

def workflow_package():
    f = __import__("json").load(open(ROOT / "features.json"))["features"]
    rows = [x for x in f if x["id"].startswith(("workspace.", "validation."))]
    out = ["# Expert review package - Review workflow (workspace)",
           "Reviewer: systematic-review methodologist / information specialist. Please judge whether the workflow supports (and does not undermine) rigorous review conduct.",
           "\n## Feature status\n| feature | status | evidence |\n|---|---|---|", *[f"| {x['name']} | {x['status']} | {x.get('evidence','')} |" for x in rows],
           "\n## Design rules to check\n- Raw imported records preserved; dedup is a reversible flag.\n- AI cannot be recorded as a reviewer.\n- Full-text exclusions require reasons.\n- Audit log append-only (DB triggers).\n- PRISMA counts derived only from stored records, with inconsistency warnings.\n- Search log records only searches the user ran.\n- Teaching (simulated) projects are separated from real projects.\n",
           "## Questions\n1. What PRISMA 2020 / PRISMA-S items does the workflow fail to capture? 2. Is single-reviewer screening adequately flagged? 3. Is the dedup rule set unsafe in any case? 4. What is missing for preclinical (SYRCLE/ARRIVE) reviews?\n", SIGNOFF]
    return "\n".join(out)

# ===================================================================== v0.4: one package per expert AREA (easy for an individual expert to review one slice)
import io, json, zipfile

def _feat(prefixes):
    f = json.load(open(ROOT / "features.json"))["features"]
    return [x for x in f if x["id"].startswith(prefixes)]

def _lesson_digest(ids):
    L = lessons.load(); out = []
    for n in ids:
        if n not in L: continue
        l = L[n]
        out += [f"### Module {n}: {l['title']}  ({l['status']})", "**Objectives:** " + " / ".join(l["objectives"]),
                *([f"**Formula - {f['name']}:** `{f['tex']}`" for f in l["formulas"]]), "**Assumptions:** " + "; ".join(l["assumptions"]), "**Worked example:** " + l["worked_example"].replace("\n", " "),
                "**Common mistakes:** " + "; ".join(l["mistakes"]), "**References cited:** " + "; ".join(references.REFS[r]["cite"][:110] for r in l["further"] if r in references.REFS), ""]
    return out

def _area(title, reviewer, scope, ids, materials, questions, extra=None):
    out = [f"# Expert review package - {title}", f"**Who should review:** {reviewer}", f"**Scope:** {scope}",
           "\n## Ground rules\n- Nothing in MetaLab is currently expert-reviewed; 'AI-drafted' is the honest status of every lesson and question.\n- Numerical agreement with R/metafor (where stated) is NOT the same as methodological suitability: your job is the latter.\n"
           "- Be harsh and specific: quote text, say what is wrong, give the correct statement and a source.\n- You can review this package alone; the full lesson packages for the modules below are in the ZIP (lessons/).",
           "\n## Materials in this package", *[f"- {m}" for m in materials], "\n## Questions for you", *[f"{i}. {q}" for i, q in enumerate(questions, 1)]]
    if extra: out += ["", *extra]
    out += ["", "## Lesson digests", *_lesson_digest(ids), "", SIGNOFF]
    return "\n".join(out)

def area_statistics():
    v = (ROOT / "VALIDATION.md").read_text(); feats = _feat(("stats.",)); rows = [f"| {x['name']} | {x['status']} | {x.get('evidence','')} | {x.get('blocker','')} |" for x in feats]
    return _area("Statistical methods", "Statistician / meta-analysis methodologist", "metalab/stats.py, advanced.py, advanced2.py and the lessons that teach them (Modules 24-49, 50-52).",
                 [24, 25, 26, 29, 30, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51],
                 ["VALIDATION.md (full record below)", "validation/make_reference.R, make_reference_v04.R and the JSON references", "validation/external_workflows/*.R (NOT executed by the developer: netmeta, mada, bayesmeta, dosresmeta, metasens/selmodel, lme4 one-stage IPD)", "tests/test_validation_r.py, test_advanced_r.py, test_advanced2_r.py"],
                 ["Are the defaults (REML, Riley PI, HKSJ option, LS variance for SMD) defensible for first-time users?", "Is each model assumption stated correctly in the lessons (NMA transitivity, CR2 df, phylogenetic Brownian motion, Bayesian prior sensitivity, PET-PEESE bias)?",
                  "Are warnings on trim-and-fill, PET-PEESE, P-scores and boundary correlations adequate and not over- or under-stated?", "Which implemented method is dangerous without expert supervision? Which should be removed or labelled differently?",
                  "Do the external R workflows (not run here) look correct? Please run them and report discrepancies.", "What important methods are missing for the intended use (preclinical lifespan meta-analysis)?"],
                 ["## Feature status (statistics)", "| feature | status | evidence | blocker |", "|---|---|---|---|", *rows, "", "## Validation record", v])

def area_searching():
    from . import topic_scan as T
    srch = [f"- {s[0]} ({s[1]}): {s[4]} hits - {s[5][:160]}" for s in T.SEARCHES]
    return _area("Literature searching", "Information specialist / medical librarian", "Lessons on databases, strategies, supplementary searching, reproducibility, deduplication and the topic-scan lesson; the logged topic scan.",
                 [9, 10, 11, 12, 13, 14, 88], ["Search-log template and the real topic scan below (32 searches on PubMed, 2026-11-26/27)", "Deduplication rules (metalab/workflow.py, store.py) with tests", "Resource registry entries for databases (candidates, unverified)"],
                 ["Are the lessons accurate about Boolean logic, field tags, MeSH/Emtree, truncation, filters and database differences?", "Does the lesson on peer review of search strategies (PRESS) and PRISMA-S reporting capture what is needed?", "Is the dedup logic (exact + fuzzy + reversible flags) safe? Where can it wrongly merge records?",
                  "Is the topic-scan guidance (88) appropriate, and are the query-translation warnings correct for PubMed?", "What search sources are missing for lab biology (Embase, Web of Science, Scopus, bioRxiv, CAB Abstracts, grey literature)?"],
                 ["## Logged topic scan (PubMed only; signals, not systematic searches)", *srch])

def area_methodology():
    from . import pipeline
    return _area("Systematic review methodology", "Systematic-review methodologist", "Protocol, registration, screening, extraction, effect-size choice, synthesis without meta-analysis, certainty, interpretation, the end-to-end simulated review and the curriculum coverage audit.",
                 [3, 4, 5, 6, 7, 8, 15, 16, 17, 18, 19, 20, 52, 53, 54, 55, 56, 74, 84, 89, 90], ["metalab/pipeline.py + tests/test_pipeline_e2e.py (fictional review, independent R cross-check)", "Curriculum audit vs the 26 Cochrane Handbook chapters (metalab/handbook_toc.json; titles only, mapping is the author's judgement)", "Readiness stage checker (14 stages)"],
                 ["Does the 14-stage readiness checker reflect good practice? What stages or safeguards are missing?", "Is the Cochrane Handbook coverage mapping fair? Which chapters are inadequately served by the corresponding modules?", "Are the review variants (umbrella, rapid, living, realist, scoping) described accurately and with the right cautions?",
                  "Is single-reviewer screening/extraction flagged strongly enough? Is the independent second-extractor verification design sound?", "Which parts of PRISMA 2020/PRISMA-S would a user still fail to report with this workflow?"],
                 ["## Readiness stages", *[f"- {x}" for x in ("Question", "Protocol / decisions", "Search log", "Records imported", "Deduplication", "Screening", "Extraction", "Risk of bias", "Effect sizes", "Analysis", "Verification", "Manuscript", "Quality checks", "Reproducibility package")]])

def area_rob():
    from . import rob_tools
    tools = [f"- **{t['name']}** ({t['design']}): domains - " + "; ".join(t["domains"]) + f". Note: {t['note']}" for t in rob_tools.TOOLS.values()]
    return _area("Risk of bias and appraisal", "Methodologist experienced with RoB 2 / ROBINS-I / SYRCLE / QUADAS-2 / PROBAST", "Bias fundamentals, appraisal instruments, visualisation, the SYRCLE adaptation for invertebrate work, and the Virtual Lab RoB key.",
                 [21, 22, 23, 59, 44, 45], ["metalab/rob_tools.py (domain NAMES only; official guidance must be used)", "Virtual Lab ROB key and texts (fictional) in metalab/vlab.py", "RoB visualisation code in the app"],
                 ["Are the registered domain names exactly those of the published tools, and are the cautions about using official guidance sufficient?", "Is the claim that SYRCLE items map imperfectly to Drosophila vials/cages accurate and is the suggested handling reasonable?", "Are lessons 21-23 correct about outcome-level assessment, selective reporting and blinding?",
                  "Is the traffic-light/summary visualisation misleading in any way (e.g. implied scores)?", "What risk-of-bias guidance is missing for in-vitro, plant and ecological studies?"], ["## Registered tools", *tools])

def area_education():
    from . import lesson_audit
    s = lesson_audit.summary(); rows = [f"| {r['module']} | {r['title'][:60]} | {r['words']} | {r['numeric_quiz']} | {r['tier']} | {r['failing']} |" for r in lesson_audit.audit()]
    return _area("Educational content and assessment", "Educator / learning scientist with research-methods teaching experience", "Lesson structure, depth, quizzes, exercise banks, the final assessment, the capstone rubric, flashcards and pathways.",
                 [3, 24, 32, 35, 84], ["Mechanical lesson-depth audit below", "metalab/learning_lab.py (drills, method-selection and interpretation banks, final assessment, rubric)", "metalab/assessments.py (module exams, pathways)", "metalab/learning.py (cards, SM-2, glossary)"],
                 ["Is the 3-level (plain/intermediate/advanced) structure effective? Which lessons are too dense or too shallow?", "Are quiz items valid (unambiguous, one best answer, plausible distractors)? Please sample at least 20.", "Is the 80%-in-every-section internal benchmark and the 13-item capstone rubric sensible for self-assessment?",
                  "Is the language about 'internal learning record, not a certificate' clear enough to prevent misuse?", "Where does the curriculum order create unnecessary prerequisites or gaps for a PhD biologist new to evidence synthesis?"],
                 [f"## Lesson depth audit ({s['substantive']} substantive, {s['thin']} thin of {s['total']}; mechanical criteria only)", "| module | title | words | numeric quiz items | tier | failing criteria |", "|---|---|---|---|---|---|", *rows])

def area_disciplines():
    from . import scenarios, assessments
    sc = [f"- {x.discipline}: {x.title}" for x in scenarios.ALL.values()]; tr = [f"- {k}: modules {v['core'][:3]}... + {v['extra']} - {v['note']}" for k, v in assessments.DISCIPLINE_TRACKS.items()]
    return _area("Discipline-specific applications", "Domain scientists: Drosophila/aging biology, clinical research, plant science, microbiology, ecology/evolution, public health, psychology/education", "Discipline lessons (57-68, 59-63, 85-87), discipline tracks and the Virtual Lab scenarios.",
                 [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 85, 86, 87], ["Virtual Lab scenarios (fictional data with planted errors)", "Discipline pathways", "Domain claims registry entries"],
                 ["Are field-specific statements correct (e.g. experimental units for flies/plants/microbes, lifespan metrics, sex as a biological variable)?", "Do the scenarios' planted errors reflect real problems in your field? Which common ones are missing?", "Which effect sizes and moderators would your field insist on that are not mentioned?",
                  "Are there field conventions the lessons contradict?"], ["## Virtual Lab scenarios", *sc, "", "## Discipline tracks", *tr])

def area_usability():
    acc = (ROOT / "ACCESSIBILITY.md").read_text(); lim = (ROOT / "KNOWN_LIMITATIONS.md").read_text()[:5000]
    tasks = ["Install and start the app from README only (note every point of confusion).", "Complete Onboarding and read the recommended path.", "Open Lesson 32 and run the worked-example calculation in the Statistics Lab.", "Create a TEACHING project, import the simulated RIS file and complete screening of five records.",
             "Find the formula for I\u00b2 using Search everything and the Reference Encyclopedia.", "Run the simulated end-to-end review and read the traceability table.", "Add a contact, record a meeting and a follow-up in the networking dashboard; confirm nothing is sent.", "Use Knowledge Universe to find a reading list for Module 42 and mark one resource verified with what you actually saw.",
             "Download a backup WITHOUT personal data and open it - is anything personal inside?"]
    return _area("Software usability and accessibility", "Usability specialist / accessibility specialist / a PhD student who has never seen the app", "The Streamlit interface, navigation, error messages, accessibility and data-safety affordances.",
                 [], ["tools/audit_ui.py results (axe-core in Chromium), keyboard walk", "ACCESSIBILITY.md and KNOWN_LIMITATIONS.md (below)", "Usability task script below (please time each task and note errors)"],
                 ["Which tasks failed or took unexpectedly long, and why?", "Where does the interface imply certainty or endorsement it should not (statuses, badges, warnings)?", "Can a screen-reader user complete the core path? (Not tested by the developer.)", "Are destructive actions (delete project, restore backup) sufficiently protected?", "What would stop you trusting the numbers on a page?"],
                 ["## Usability task script", *[f"{i}. {t}" for i, t in enumerate(tasks, 1)], "", "## ACCESSIBILITY.md", acc, "", "## Known limitations (excerpt)", lim])

def area_integrity():
    from . import claims
    sm = claims.summary(); corr = claims.CORRECTIONS; sec = (ROOT / "SECURITY.md").read_text()[:3500]; ri = (ROOT / "RESEARCH_INTEGRITY.md").read_text()
    return _area("Research integrity, ethics, privacy and security", "Research-integrity officer / ethicist / data-protection or security reviewer", "Integrity rules, AI policy, claims registry, correction history, privacy design (no names in audit log, personal data excluded from shareable backups), security notes and licence/deployment decisions left to the owner.",
                 [1, 8, 80, 81, 82, 83, 89, 79], ["RESEARCH_INTEGRITY.md (below)", f"Claims registry: {sm['total']} claims ({sm['supported']} abstract-supported, {sm['partial']} partial, {sm['unverified']} unverified, {sm['human_reviewed']} human-reviewed)", "Correction history (every error found, including by the tools)", "SECURITY.md excerpt; tests/test_security_privacy.py"],
                 ["Are the hard rules (no fabricated data/users/opportunities, no AI reviewer/verifier, no automatic contact) sufficient and enforced in code?", "Is the AI-use policy in Lesson 81 responsible and current? What is missing?", "Does the corrections log read as honest rather than reassuring?", "Privacy: could contacts, notes or personal data leak through backups, exports, the audit log or the learning record?",
                  "Which decisions must remain with the owner (licence, public deployment, registration, data sharing) and are they clearly flagged?"],
                 ["## Research integrity rules", ri, "", "## Corrections so far", *[f"- {c['date']} {c['where']}: {c['what']} -> {c['fix']}" for c in corr], "", "## Security notes (excerpt)", sec])

AREAS = {"Statistical methods": area_statistics, "Literature searching": area_searching, "Systematic review methodology": area_methodology, "Risk of bias and appraisal": area_rob,
         "Educational content and assessment": area_education, "Discipline-specific applications": area_disciplines, "Software usability and accessibility": area_usability, "Research integrity, ethics, privacy and security": area_integrity}

INDEX = """# MetaLab Academy - expert review packages
Thank you for considering a review. Each package is **self-contained**: you do not need to install the app. Pick the ONE area that matches your expertise, read the questions, comment on the digests, complete the sign-off and return the file.
Nothing is labelled 'expert-reviewed' until a maintainer records your outcome. Please do not feel you must review everything; partial, specific feedback is valuable. Reviewing is voluntary and unpaid unless the owner arranges otherwise; the app never contacts reviewers.

| Area | Typical reviewer | Approx. reading |
|---|---|---|
""" + "\n".join(f"| {k} | see package header | 1-3 h |" for k in AREAS) + "\n\n`lessons/` contains one package per lesson for anyone who wants to review a specific module.\n"

def expert_zip():
    buf = io.BytesIO(); ls = lessons.load()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("INDEX.md", INDEX)
        for k, fn in AREAS.items(): z.writestr(f"areas/{k.replace(' ', '_').replace(',', '').replace('/', '-')}.md", fn())
        for n in sorted(ls): z.writestr(f"lessons/lesson_{n:02d}.md", lesson_package(n))
        z.writestr("statistics_engine_core.md", stats_package()); z.writestr("review_workflow.md", workflow_package())
    return buf.getvalue()

def available():
    ls = lessons.load()
    return {**{f"AREA - {k}": fn for k, fn in AREAS.items()}, **{f"Lesson {n}: {ls[n]['title']}": (lambda n=n: lesson_package(n)) for n in sorted(ls)},
            "Statistics engine (core)": stats_package, "Review workflow": workflow_package}
