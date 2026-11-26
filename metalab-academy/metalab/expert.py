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
        out.append(f"| {c['id']} | {c['claim']} | {references.REFS[c['source_key']]['cite'][:70]} | {c['examined']} | {c['supports_directly']} | {c['limitations']} | {c['status']} |")
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

def available():
    ls = lessons.load()
    return {**{f"Lesson {n}: {ls[n]['title']}": (lambda n=n: lesson_package(n)) for n in sorted(ls)},
            "Statistics engine": stats_package, "Review workflow": workflow_package}
