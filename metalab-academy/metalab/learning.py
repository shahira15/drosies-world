"""Glossary, flashcards (SM-2 style scheduling), universal search, method wizard, pathways, coverage audit, study notes.
All definitions are original educational summaries (AI-drafted, not expert-reviewed)."""
from __future__ import annotations
import datetime, re
from . import curriculum, lessons, references, resources, claims, workflows

# ------------------------------------------------------------------ glossary
G = {}
def g(term, definition, module=None, see=()): G[term] = dict(term=term, definition=definition, module=module, see=list(see))
g("Bias", "A systematic departure of a study's result from the truth that does not shrink as sample size grows.", 21)
g("Random error / imprecision", "Chance variation in an estimate; it shrinks as the amount of information grows and is reflected in the variance or confidence interval.", 21)
g("Risk of bias", "Judgement of whether a study's design, conduct or analysis could systematically distort its result.", 22)
g("Reporting quality", "How completely a study describes what was done; distinct from bias, although poor reporting can prevent judging bias.", 21)
g("Pseudoreplication", "Treating non-independent observations (e.g. flies in one vial) as independent replicates, which understates variance.", 21)
g("Systematic review", "A review that answers a focused question using pre-planned, reproducible methods to find, select, appraise and synthesise studies.", 3)
g("Meta-analysis", "Statistical combination of results from multiple studies; may be part of a systematic review but is not required by one.", 3)
g("Scoping review", "A review that maps the extent and nature of evidence or concepts on a broad topic rather than estimating an effect.", 55)
g("Umbrella review", "A review of existing systematic reviews.", 56)
g("PICO", "Framework naming Population, Intervention, Comparator and Outcome for a review question.", 4)
g("PECO", "PICO variant with Exposure instead of Intervention, used when the exposure is not assigned by investigators.", 4)
g("PCC", "Population, Concept, Context: framework commonly used for scoping reviews.", 4)
g("Eligibility criteria", "Pre-specified rules determining which studies are included in a review.", 7)
g("Protocol", "A dated plan for a review fixing question, methods and analyses in advance.", 7)
g("Boolean operators", "AND narrows, OR widens and NOT excludes in database searches; parentheses control grouping.", 10)
g("Sensitivity (search)", "Proportion of all relevant records that a search retrieves.", 10)
g("Precision (search)", "Proportion of retrieved records that are relevant.", 10)
g("Controlled vocabulary", "Standardised subject headings assigned to records (e.g. MeSH, Emtree) that group synonyms.", 10)
g("Provenance", "The documented origin of a data value: source, location, extractor, date, transformation and verification.", 20)
g("Experimental unit", "The smallest independent unit to which a treatment is applied and on which replication is counted (e.g. vial, plot, classroom).", 18)
g("Effect size", "A numeric measure of the magnitude of a difference or association, with a sampling variance.", 27)
g("Mean difference (MD)", "Difference between group means in the original units of the outcome.", 27)
g("Standardised mean difference (SMD)", "Mean difference divided by a pooled standard deviation, giving a unit-free effect size (Cohen's d; Hedges' g with small-sample correction).", 27)
g("Hedges' g", "Cohen's d multiplied by a small-sample correction factor J (<1).", 27)
g("Log response ratio (lnRR)", "Natural log of the ratio of two means, for ratio-scale outcomes; exp(lnRR) is a proportional change.", 27)
g("Sampling variance", "Variance of an effect-size estimate; its inverse is the usual weight in inverse-variance pooling.", 32)
g("Inverse-variance weighting", "Weighting studies by 1/variance so more precise studies count more.", 32)
g("Common-effect model", "Meta-analysis model assuming all studies estimate one true effect (also called fixed-effect).", 33)
g("Random-effects model", "Meta-analysis model in which true effects vary between studies and are drawn from a distribution; the pooled value estimates its mean.", 34)
g("tau-squared (τ²)", "Estimated variance of true effects between studies, in squared effect-size units.", 35)
g("REML", "Restricted maximum likelihood: an estimator of τ² that is a reasonable default in many settings but not universally optimal.", 34)
g("DerSimonian–Laird", "Moment-based τ² estimator; widely used historically but biased in some small-study and rare-event settings.", 34)
g("Paule–Mandel", "τ² estimator that solves Q(τ²) = k − 1; performs well in many simulations but can be positively biased when study sizes differ greatly.", 34)
g("Hartung–Knapp (HKSJ)", "Adjustment using a t distribution and Q-scaled variance for the pooled estimate's confidence interval, often better calibrated with few studies.", 34)
g("Cochran's Q", "Weighted sum of squared deviations of study effects from the pooled effect; tests/quantifies heterogeneity.", 35)
g("I-squared (I²)", "Proportion of observed variability beyond chance; depends on study precision and is not an absolute measure of heterogeneity.", 35)
g("H-squared (H²)", "Observed variability divided by sampling variability; 1 means chance only.", 35)
g("Prediction interval", "Interval for the true effect in a new study under a random-effects model; incorporates τ².", 35)
g("Subgroup analysis", "Comparison of effects between groups of studies defined by a categorical characteristic; a difference requires a formal test of interaction.", 36)
g("Meta-regression", "Regression of study effect sizes on study-level characteristics; observational across studies and unstable with few studies.", 37)
g("Publication bias", "Systematic difference between published and unpublished results because of selective publication.", 50)
g("Small-study effects", "Tendency for smaller studies to show different (often larger) effects; may reflect publication bias, heterogeneity or chance.", 50)
g("Leave-one-out analysis", "Sensitivity analysis re-estimating the pooled effect omitting each study in turn.", 51)
g("Certainty of evidence", "Confidence that the estimated effect is close to the true effect (e.g. GRADE).", 52)
g("PRISMA 2020", "Reporting guideline for systematic reviews, with a 27-item checklist and flow diagram.", 76)
g("Cohen's kappa", "Chance-corrected agreement between two raters for categorical judgements.", 15)
g("Deduplication", "Identifying and removing duplicate records of the same item, preserving originals and an audit trail.", 14)
g("Shared control", "A control group used in several comparisons, which makes the resulting effect sizes statistically dependent.", 38)
g("Dependent effect sizes", "Effect sizes whose sampling errors are correlated (shared controls, multiple outcomes, same participants).", 38)

def glossary_search(q):
    q = q.lower().strip()
    return [v for v in G.values() if not q or q in v["term"].lower() or q in v["definition"].lower()]

# ---------------------------------------------------------------- flashcards
def cards():
    out = [dict(key=f"gl:{t}", front=f"Define: {v['term']}", back=v["definition"], module=v["module"]) for t, v in G.items()]
    for n, L in lessons.load().items():
        for i, (mis, cor) in enumerate(L["misconceptions"]):
            out.append(dict(key=f"mis:{n}:{i}", front=f"Misconception to correct: {mis}", back=cor, module=n))
    return out

def sm2(ease, interval, reps, quality, today=None):
    """SM-2 style scheduling (Wozniak): a simple heuristic, not an optimised or validated learning model.
    quality 0-5 (>=3 = recalled). Returns (ease, interval_days, reps, lapsed)."""
    if quality < 0 or quality > 5: raise ValueError("quality must be 0-5")
    if quality < 3:
        return ease, 1, 0, True
    reps += 1
    interval = 1 if reps == 1 else 6 if reps == 2 else round(interval * ease)
    ease = max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
    return ease, interval, reps, False

# ------------------------------------------------------------ universal search
def _tokens(s): return re.findall(r"[a-z0-9²]+", s.lower())

def _index():
    docs = []
    for n, L in lessons.load().items():
        body = " ".join([L["title"], L["why"], L["plain"], L["intermediate"], L["advanced"], L["worked_example"], " ".join(L["mistakes"])] + [f["name"] + " " + f["tex"] for f in L["formulas"]])
        docs.append(dict(type="Lesson", title=f"Module {n}: {L['title']}", text=body, where="Learning Academy", ref=n))
        for f in L["formulas"]: docs.append(dict(type="Formula", title=f["name"] + f" (Module {n})", text=f["name"] + " " + f["tex"] + " " + " ".join(f["symbols"]) , where="Learning Academy", ref=n))
    for m in curriculum.MODULES: docs.append(dict(type="Module" + (" (lesson)" if m["status"] == "drafted" else " (outline only)"), title=f"Module {m['id']}: {m['title']}", text=m["title"] + " " + m["part_name"] + " " + m["level_name"], where="Learning Academy", ref=m["id"]))
    for t in G.values(): docs.append(dict(type="Glossary", title=t["term"], text=t["term"] + " " + t["definition"], where="Practice", ref=t["module"]))
    for r in resources.RESOURCES: docs.append(dict(type="Resource (link unverified)", title=r["title"], text=" ".join([r["title"], r["org"], r["type"], r["topic"], r["why"]]), where="Knowledge Universe", ref=r["url"]))
    for o in resources.ORGS: docs.append(dict(type="Organisation (link unverified)", title=o["name"], text=o["name"] + " " + o["focus"], where="Network & Collaboration", ref=o["url"]))
    for k, r in references.REFS.items(): docs.append(dict(type="Reference (verified)", title=r["cite"][:140], text=r["cite"], where="Knowledge Universe", ref=r["doi"]))
    for c in claims.CLAIMS: docs.append(dict(type="Claim", title=f"{c['id']}: {c['claim'][:110]}", text=c["claim"], where="Quality & Expert Review", ref=c["id"]))
    for k, w in workflows.WORKFLOWS.items(): docs.append(dict(type="Workflow", title=w["label"], text=" ".join([w["label"], " ".join(w["effect_measures"]), w["guideline"], " ".join(w["warnings"])]), where="Research Workspace", ref=k))
    docs += [dict(type="Calculator", title=t, text=t, where="Statistics Lab", ref=t) for t in
             ["Hedges' g / Cohen's d", "Mean difference", "Log response ratio", "Risk ratio", "Odds ratio", "Risk difference", "Fisher's z", "SD to SE conversion", "SE from confidence interval", "Combine two groups",
              "Random-effects meta-analysis REML DerSimonian-Laird Paule-Mandel Hartung-Knapp", "Meta-regression and subgroup analysis"]]
    # ---- v0.3 additions: communities, opportunity directories, tutorials, scenarios, milestones, templates, methods, appraisal tools
    for o in resources.COMMUNITIES: docs.append(dict(type="Community (candidate)", title=o["name"], text=o["name"] + " " + o["focus"] + " " + o["kind"], where="Network & Collaboration", ref=o["url"]))
    for o in resources.OPPORTUNITY_DIRECTORIES: docs.append(dict(type="Opportunity directory (candidate)", title=o["name"], text=" ".join([o["name"], o["kind"], o["note"]]), where="Network & Collaboration", ref=o["url"]))
    from . import coding, scenarios, milestones, templates_lib, rob_tools, vlab
    for t in coding.T: docs.append(dict(type="Coding tutorial", title=f"{t['title']} ({t['lang']})", text=" ".join([t["title"], t["goal"], " ".join(t["hints"])]), where="Coding Lab", ref=t["id"]))
    for sc in scenarios.ALL.values(): docs.append(dict(type="Virtual Lab scenario", title=f"{sc.discipline}: {sc.title}", text=sc.intro + " " + " ".join(sc.planted), where="Virtual Lab", ref=sc.id))
    docs.append(dict(type="Virtual Lab scenario", title="Preclinical: Nx-7 and Drosophila lifespan", text="Drosophila lifespan vial pseudoreplication SEM hours shared control missing SD " + " ".join(vlab.planted_errors()), where="Virtual Lab", ref="preclinical"))
    for m in milestones.M: docs.append(dict(type="First-paper milestone", title=f"Milestone {m['id']}: {m['name']}", text=" ".join([m["learn"], m["why"], m["task"], m["deliverable"]]), where="First Paper Plan", ref=m["id"]))
    for name, txt in templates_lib.T.items(): docs.append(dict(type="Template", title=name, text=txt[:400], where="Network & Collaboration", ref=name))
    for role in templates_lib.CREDIT_ROLES: docs.append(dict(type="CRediT role", title=role, text="CRediT contributor role " + role, where="Network & Collaboration", ref=role))
    for k, tl in rob_tools.TOOLS.items(): docs.append(dict(type="Appraisal tool", title=tl["name"], text=" ".join([tl["name"], tl["design"], " ".join(tl["domains"]), tl["note"]]), where="Research Workspace", ref=k))
    docs += [dict(type="Template", title=t, text=t, where="Research Workspace", ref=t) for t in ["Statistical analysis plan (SAP) draft", "Protocol skeleton", "Search log CSV", "Extraction form per review type", "PRISMA flow diagram (SVG)", "PRISMA 2020 checklist tracker", "Reproducibility package (ZIP)", "Manuscript skeleton with verified-result tokens", "Study characteristics table", "Forest plot (SVG)"]]
    for nm, where, txt in METHODS: docs.append(dict(type="Statistical method", title=nm, text=nm + " " + txt, where=where, ref=nm))
    return docs

METHODS = [
 ("Inverse-variance common-effect meta-analysis", "Statistics Lab → Meta-analysis", "fixed-effect weights 1/variance Q I2"), ("Random-effects meta-analysis (REML, Paule-Mandel, DerSimonian-Laird)", "Statistics Lab → Meta-analysis", "tau2 estimator heterogeneity"),
 ("Hartung-Knapp-Sidik-Jonkman confidence interval", "Statistics Lab → Meta-analysis", "HKSJ t distribution few studies"), ("Prediction interval", "Statistics Lab → Meta-analysis", "Riley metafor new study true effect"),
 ("Leave-one-out analysis", "Statistics Lab → Meta-analysis", "sensitivity influence"), ("Subgroup analysis and test for subgroup differences", "Statistics Lab → Subgroups & meta-regression", "interaction moderator Q between"),
 ("Mixed-effects meta-regression", "Statistics Lab → Subgroups & meta-regression", "moderators QM R2 residual heterogeneity"), ("Mantel-Haenszel pooled OR RR RD", "Statistics Lab → Advanced methods", "sparse data zero cells binary"),
 ("Peto odds ratio", "Statistics Lab → Advanced methods", "rare events one-step"), ("Egger regression test", "Statistics Lab → Advanced methods", "funnel plot asymmetry small-study effects"),
 ("Begg rank correlation test", "Statistics Lab → Advanced methods", "Kendall tau funnel"), ("Cumulative meta-analysis", "Statistics Lab → Advanced methods", "sequential by year"),
 ("Q-profile confidence interval for tau-squared", "Statistics Lab → Advanced methods", "heterogeneity uncertainty I2 interval"), ("Influence diagnostics (studentised residual, Cook's distance)", "Statistics Lab → Advanced methods", "outlier leverage"),
 ("Three-level (multilevel) meta-analysis", "Statistics Lab → Advanced methods", "dependent effect sizes cluster random effects rma.mv"), ("Cluster-robust variance estimation (CR1)", "Statistics Lab → Advanced methods", "robust variance dependence few clusters"),
 ("Incidence rate ratio", "Statistics Lab → Advanced methods", "person-time counts"), ("Prevalence transformations (logit, Freeman-Tukey, arcsine)", "Statistics Lab → Advanced methods", "proportion PLO PFT PAS"),
 ("Design effect and effective sample size", "Statistics Lab → Advanced methods", "cluster ICC classroom"), ("Fisher z transformation of correlations", "Statistics Lab → Effect-size calculators", "correlation"),
 ("Standardised mean difference (Hedges' g)", "Statistics Lab → Effect-size calculators", "exact J small sample LS Borenstein variance"), ("Log response ratio", "Statistics Lab → Effect-size calculators", "ratio of means ecology"),
 ("Cohen's kappa", "Research Workspace → Screening", "inter-rater agreement"), ("p-value to standard error conversion", "Statistics Lab → Effect-size calculators", "exact two-sided p z"),
]

def search(q, limit=25):
    qt = _tokens(q)
    if not qt: return []
    res = []
    for d in _index():
        title_t, text_t = _tokens(d["title"]), _tokens(d["text"])
        score = 0
        for t in qt:
            score += 5 * sum(t in x for x in title_t) + sum(1 for x in text_t if t in x) ** 0.5
        if all(any(t in x for x in title_t + text_t) for t in qt) and score:
            res.append((score, d))
    res.sort(key=lambda x: -x[0])
    return [d for s, d in res[:limit]]

# --------------------------------------------------------------- method wizard
def wizard(design, outcome, k, dependence, objective, comparable):
    """Rule-based suggestions with explicit assumptions. NOT a substitute for scientific judgement or statistical advice."""
    rec = dict(review_types=[], measures=[], models=[], cautions=[], lessons=[], not_supported=[], assumptions=[
        "Recommendations assume the inputs you gave are accurate and pre-specified.", "They are prompts for discussion with a methodologist/statistician, not decisions."])
    if objective == "map the evidence":
        rec["review_types"] = ["Scoping review / evidence map (PRISMA-ScR)"]; rec["lessons"] += [3, 55]; rec["measures"] = ["None (charting)"]; return rec
    if design == "qualitative":
        rec["review_types"] = ["Qualitative evidence synthesis (thematic/framework; ENTREQ)"]; rec["lessons"] += [54]; rec["not_supported"].append("Qualitative synthesis tools beyond note-taking forms."); return rec
    if design == "diagnostic accuracy":
        rec["review_types"] = ["Systematic review of diagnostic accuracy (PRISMA-DTA)"]; rec["measures"] = ["Sensitivity/specificity (bivariate or HSROC models)"]; rec["lessons"] += [44]
        rec["not_supported"].append("Bivariate/HSROC models are NOT implemented in MetaLab; use R packages with a statistician."); return rec
    if not comparable:
        rec["review_types"] = ["Systematic review with structured synthesis without meta-analysis (SWiM)"]; rec["cautions"].append("If studies do not estimate comparable quantities, pooling would average unlike things.")
        rec["lessons"] += [3, 53]; return rec
    rec["review_types"] = ["Systematic review ± meta-analysis (PRISMA 2020)"]
    m = {"continuous (same scale)": ["Mean difference"], "continuous (different scales)": ["SMD (Hedges' g)"], "continuous ratio-scale, positive (e.g. lifespan, biomass)": ["Log response ratio (lnRR)", "SMD (sensitivity)"],
         "binary": ["Risk ratio / odds ratio / risk difference (log scale for RR/OR)"], "count / rate": ["Incidence rate ratio (not implemented)"], "time-to-event": ["Log hazard ratio; reconstructed survival data if needed (not implemented)"],
         "correlation": ["Fisher's z"], "proportion / prevalence": ["Logit/Freeman-Tukey/GLMM (NOT implemented)"]}
    rec["measures"] = m.get(outcome, ["Choose an effect measure suited to the outcome"]); rec["lessons"] += [27, 28, 31, 32, 35]
    if outcome in ("count / rate", "time-to-event", "proportion / prevalence"): rec["not_supported"].append(f"Effect sizes for '{outcome}' are not implemented in the calculators.")
    if dependence != "none":
        rec["cautions"].append(f"Dependence ({dependence}): the simple random-effects model assumes independent effect sizes. Use a dependence-aware approach (multilevel/multivariate/robust variance) - NOT implemented in MetaLab; seek statistical support. Module 38 is an outline only.")
        rec["not_supported"].append("Multilevel / RVE / multivariate models"); rec["lessons"] += [38, 39, 40]
    else:
        rec["models"] = ["Random-effects (REML default; pre-specify; sensitivity with PM)", "Hartung-Knapp CI", "Prediction interval", "Common-effect only if one true effect is plausible a priori"]
    if k < 3: rec["cautions"].append("Fewer than 3 studies: a prediction interval is not estimable; heterogeneity is not assessable. Consider narrative synthesis or presenting studies individually.")
    elif k < 5: rec["cautions"].append("k < 5: τ² and I² are very imprecise; prefer HKSJ and report this limitation.")
    if objective == "explore heterogeneity" and k < 10: rec["cautions"].append("Subgroup/meta-regression with <10 studies per moderator is unstable and prone to false findings; pre-specify few moderators.")
    if objective == "explore heterogeneity": rec["models"].append("Pre-specified subgroup analysis / meta-regression (Statistics Lab)"); rec["lessons"] += [36, 37]
    if design == "observational": rec["cautions"].append("Observational estimates are confounded; pool adjusted estimates consistently and appraise with ROBINS-I or similar.")
    rec["lessons"] = sorted(set(rec["lessons"])); return rec

# ----------------------------------------------------------------- pathways
CORE_PATH = [3, 4, 5, 7, 10, 15, 18, 20, 21, 22, 27, 32, 35]      # first-time researcher: through the primary analysis
CORE_EXTENSIONS = [6, 9, 12, 13, 14, 16, 17, 19, 23, 28, 31, 33, 34, 36, 37, 50, 51, 52, 74, 75, 76, 77, 78, 82]
SPECIALIST = {"Preclinical / model organisms": [59, 60, 38, 39, 40], "Clinical": [57, 28, 30, 42, 44], "Plant science": [61, 38], "Microbiology": [62, 48, 49],
              "Ecology & evolution": [63, 38, 39, 40], "Public health": [58, 43, 47], "Education / social science": [65, 64], "Statisticians": [41, 42, 43, 46, 48, 49]}

def pathway(ids):
    L = lessons.load()
    return [dict(id=i, title=curriculum.BY_ID[i]["title"], available=i in L, minutes=L[i]["time_min"] if i in L else None) for i in ids]

# ---------------------------------------------------------- coverage audit
AUDIT_NOTE = ("SELF-AUDIT against the chapter structure of the Cochrane Handbook (as recalled by the author - NOT re-read or verified this session), "
              "the PRISMA 2020 item list (partly verified via abstracts) and the master specification. A proper audit requires opening each handbook; "
              "this table shows where MetaLab's own curriculum is thin so that effort goes to the right places.")
COVERAGE = [  # (topic area, source-structure area, modules, notes)
 ("Starting a review, scope, question", "Handbook early chapters", [3, 4, 5, 6], "L3,L4,L5 written; M6 outline"),
 ("Searching and selecting studies", "Handbook search chapter; PRISMA-S; PRESS", [9, 10, 11, 12, 15, 14, 13], "L10 written; others outline"),
 ("Collecting data", "Handbook data collection chapter", [17, 18, 19, 20], "L18,L20 written"),
 ("Choosing effect measures", "Handbook effect-measure chapter", [27, 28, 29, 30, 31], "Only continuous (L27) written"),
 ("Risk of bias", "Handbook RoB chapters", [21, 22, 23], "L21,L22 written; visualisation in app"),
 ("Analysing data / meta-analysis", "Handbook analysis chapter", [32, 33, 34, 35, 36, 37], "L32,L35 written; M33,M34,M36,M37 outline"),
 ("Network meta-analysis", "Handbook NMA chapter", [42], "outline only"),
 ("Synthesis without meta-analysis", "SWiM", [53], "outline only (SWiM referenced in L3)"),
 ("Reporting bias / missing results", "Handbook reporting-bias chapter", [50, 51], "outline only"),
 ("Certainty of evidence (GRADE)", "Handbook GRADE chapter", [52], "outline only"),
 ("Interpreting results, conclusions", "Handbook interpretation chapter", [74], "outline only"),
 ("Qualitative / mixed evidence", "Handbook qualitative chapter; ENTREQ", [54], "outline only"),
 ("Reporting and publication", "PRISMA 2020; journals", [75, 76, 77, 78], "outline only"),
 ("Ethics, integrity, AI, open science", "Specification parts XVIII", [80, 81, 82], "outline only"),
 ("Programming/reproducibility", "Specification part XV", [69, 70, 71, 72], "outline only; app generates R code"),
]
PROPOSED_NEW_MODULES = [
 (85, 3, "Units of analysis, pseudoreplication and hierarchical data in laboratory biology", "Repeatedly critical during this build (vial vs fly; shared controls) but only touched inside Modules 18/21."),
 (86, 4, "Survival data and lifespan synthesis: hazard ratios, medians and curve reconstruction", "Central to the founder's candidate topics; Module 30 is generic and outline-only."),
 (87, 3, "Sex as a biological variable in evidence synthesis", "Candidate topic B and a known weakness of many primary studies; not in the 84-module list."),
 (88, 2, "Scanning the literature before committing: topic scans, query translation pitfalls and feasibility triage", "Developed from the real scan run on 2026-11-26; partly covered by Modules 5/10."),
]

def coverage_table():
    L = lessons.load(); rows = []
    for area, src, mods, note in COVERAGE:
        have = [m for m in mods if m in L]
        rows.append(dict(area=area, source_structure=src, modules=", ".join(map(str, mods)), with_lessons=len(have), total=len(mods), coverage=f"{100*len(have)/len(mods):.0f}%", note=note))
    return rows

# ---------------------------------------------------------------- notes
def lesson_notes(n):
    L = lessons.load()[n]
    out = [f"# Study notes - Module {n}: {L['title']}", f"*~{L['time_min']} min · v{L['version']} · {L['status']}*", "## Objectives", *[f"- {o}" for o in L["objectives"]]]
    if L["formulas"]:
        out.append("## Formulas")
        for f in L["formulas"]: out += [f"**{f['name']}**: `{f['tex']}`", "  where " + "; ".join(f"{k} = {v}" for k, v in f["symbols"].items())]
    out += ["## Assumptions", *[f"- {a}" for a in L["assumptions"]], "## Common mistakes", *[f"- {m}" for m in L["mistakes"]],
            "## Checklist", *[f"- [ ] {c}" for c in L["checklist"]], "## References", *[f"- {references.link(k)}" for k in L["further"]],
            "\n> Educational summary (AI-drafted, not expert-reviewed). Verify against primary sources."]
    return "\n".join(out)

def cheat_sheet():
    out = ["# MetaLab Academy cheat sheet - formulas in available lessons", "*AI-drafted; verify before use.*"]
    for n, L in sorted(lessons.load().items()):
        for f in L["formulas"]: out.append(f"- (M{n}) **{f['name']}**: `{f['tex']}`")
    return "\n".join(out)
