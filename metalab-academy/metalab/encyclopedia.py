"""Reference Encyclopedia: searchable, cross-linked reference material for evidence synthesis.
Two sources of entries:
  (a) AUTO-EXTRACTED from the lessons (formulas, assumptions, common mistakes, decision trees, worked interpretation examples) - always in sync with the lesson text and tests;
  (b) CURATED here: effect-size definitions, method-comparison tables, reporting guidelines, risk-of-bias instruments, troubleshooting guide, R/Python command reference.
Every entry links to the lesson(s) and app area(s) that teach or implement it. Command-reference entries carry EXPECTED numeric output that the test-suite executes
(Python always; R when metafor is installed). Nothing here is expert-reviewed; entries carry a status string."""
from __future__ import annotations
import re
from functools import lru_cache
from . import lessons, rob_tools, workflows, references, curriculum

STATUS = "AI-drafted reference material; numerically checked where marked; not expert-reviewed"
KINDS = ["Effect size", "Formula", "Assumptions", "Common mistakes", "Decision tree", "Interpretation example", "Method comparison", "Reporting guideline", "Risk-of-bias instrument", "Troubleshooting", "Command (R/Python)"]

# ------------------------------------------------------------------------------------------------ effect sizes (curated)
EFFECT_SIZES = [
 dict(id="MD", name="Mean difference (raw)", tex=r"MD=\bar x_1-\bar x_2,\quad Var=\frac{s_1^2}{n_1}+\frac{s_2^2}{n_2}", scale="Original units", use="Same outcome, same units in all studies.", avoid="Different scales/units across studies.", lessons=[27], where="Statistics Lab > Effect-size calculators", r='escalc("MD", ...)'),
 dict(id="SMD", name="Standardised mean difference (Hedges' g)", tex=r"g=J\,\frac{\bar x_1-\bar x_2}{s_p},\ J=1-\frac3{4df-1}\ (\text{exact: gamma form}),\ Var\approx\frac{n_1+n_2}{n_1n_2}+\frac{g^2}{2(n_1+n_2)}", scale="SD units", use="Different scales for the same construct.", avoid="Very different SD between studies for reasons unrelated to the construct (range restriction); tiny samples/low-variance designs inflate g (Lesson 64, 68).", lessons=[27, 64], where="Statistics Lab > Effect-size calculators", r='escalc("SMD", ...)'),
 dict(id="lnRR", name="Log response ratio (ratio of means)", tex=r"\ln RR=\ln\frac{\bar x_1}{\bar x_2},\quad Var=\frac{s_1^2}{n_1\bar x_1^2}+\frac{s_2^2}{n_2\bar x_2^2}", scale="Log ratio; back-transform to % change", use="Ratio-scale positive means (lifespan, biomass, expression).", avoid="Zero/negative means; means near zero.", lessons=[27, 60, 61], where="Statistics Lab > Effect-size calculators", r='escalc("ROM", ...)'),
 dict(id="lnVR", name="Log variability ratio", tex=r"\ln VR=\ln\frac{s_1}{s_2}+\frac1{2(n_1-1)}-\frac1{2(n_2-1)},\quad Var=\frac1{2(n_1-1)}+\frac1{2(n_2-1)}", scale="Log ratio of SDs", use="Questions about variability between groups.", avoid="SD mechanically tied to the mean (use lnCVR).", lessons=[49], where="advanced2.log_variability_ratio", r='escalc("VR", ...)'),
 dict(id="RR", name="Risk ratio", tex=r"\ln RR=\ln\frac{a/n_1}{c/n_2},\quad Var=\frac1a-\frac1{n_1}+\frac1c-\frac1{n_2}", scale="Log ratio", use="Binary outcomes; easy to interpret; collapsible.", avoid="Zero cells without a plan (Lesson 48).", lessons=[28, 48], where="Statistics Lab > Effect-size calculators", r='escalc("RR", ...)'),
 dict(id="OR", name="Odds ratio", tex=r"\ln OR=\ln\frac{ad}{bc},\quad Var=\frac1a+\frac1b+\frac1c+\frac1d", scale="Log ratio", use="Case-control designs, logistic models.", avoid="Common outcomes (OR exaggerates the RR); non-collapsibility.", lessons=[28, 48], where="Statistics Lab > Effect-size calculators", r='escalc("OR", ...)'),
 dict(id="RD", name="Risk difference", tex=r"RD=\frac a{n_1}-\frac c{n_2},\quad Var=\frac{p_1(1-p_1)}{n_1}+\frac{p_2(1-p_2)}{n_2}", scale="Absolute", use="Absolute effects, NNT = 1/RD.", avoid="Baseline-risk-dependent; often heterogeneous.", lessons=[28, 57], where="Statistics Lab > Effect-size calculators", r='escalc("RD", ...)'),
 dict(id="z", name="Fisher's z (correlation)", tex=r"z=\operatorname{atanh}r,\quad Var=\frac1{n-3}", scale="z; back-transform r = tanh z", use="Correlations.", avoid="Pooling raw r; adjusted slopes with different covariates.", lessons=[29], where="Statistics Lab > Effect-size calculators", r='escalc("ZCOR", ...)'),
 dict(id="IRR", name="Incidence rate ratio", tex=r"\ln IRR=\ln\frac{x_1/t_1}{x_2/t_2},\quad Var=\frac1{x_1}+\frac1{x_2}", scale="Log ratio", use="Counts with exposure time.", avoid="Overdispersed counts without adjustment.", lessons=[30], where="Statistics Lab > Advanced methods", r='escalc("IRR", ...)'),
 dict(id="HR", name="Log hazard ratio", tex=r"SE(\ln HR)=\frac{\ln U-\ln L}{2\times1.96}", scale="Log ratio", use="Time-to-event with censoring.", avoid="Non-proportional hazards with different follow-up.", lessons=[30, 86], where="advanced2.loghr_from_ci", r="metafor: yi = log(HR), sei from CI"),
 dict(id="PLO", name="Logit proportion", tex=r"\ln\frac{x}{n-x},\quad Var=\frac1x+\frac1{n-x}", scale="Logit; back-transform expit", use="Prevalence, proportions.", avoid="Zero/full counts without correction/GLMM.", lessons=[47], where="Statistics Lab > Advanced methods", r='escalc("PLO", ...)'),
 dict(id="r_partial", name="Partial correlation from a t-statistic", tex=r"r=\frac t{\sqrt{t^2+df}}", scale="Correlation", use="Regression coefficients in economics/social science.", avoid="Mixing specifications/levels vs logs.", lessons=[67], where="Lesson 67", r="escalc('PCOR', ti=, ni=, mi=)"),
]

# ------------------------------------------------------------------------------------------------ method comparison tables (curated)
COMPARISONS = [
 dict(id="tau2", title="Between-study variance (tau^2) estimators", columns=["Estimator", "Idea", "Strength", "Weakness", "MetaLab"], lessons=[26, 34, 35], rows=[
   ["DerSimonian-Laird (DL)", "Moment estimator from Q", "Simple, historically default", "Biased low with few/small studies; underestimates uncertainty", "Implemented; benchmarked vs metafor"],
   ["REML", "Restricted maximum likelihood", "Good general default; less biased than ML", "Iterative; boundary at 0; not universally best", "Implemented; benchmarked"],
   ["Paule-Mandel (PM)", "Equates generalised Q to df", "Recommended in several comparisons for binary/continuous outcomes", "Iterative", "Implemented; benchmarked"],
   ["Bayesian (weak prior)", "Posterior for tau", "Stable with few studies; honest intervals", "Prior-dependent", "bayes_meta; benchmarked vs R quadrature"]]),
 dict(id="ci", title="Confidence interval methods for the pooled effect", columns=["Method", "Idea", "Strength", "Weakness", "MetaLab"], lessons=[34, 35], rows=[
   ["Wald (z)", "est +- 1.96 SE", "Simple", "Too narrow with few studies/high heterogeneity", "Default option"],
   ["Hartung-Knapp-Sidik-Jonkman", "t(k-1) with q*-scaled variance", "Better coverage with few studies", "Can be narrower than Wald (q* < 1); undefined with identical effects", "Implemented; benchmarked"],
   ["Profile likelihood / Q-profile", "Invert test", "Respects constraints; used for tau^2", "Iterative", "Q-profile tau^2 CI implemented"],
   ["Bayesian credible interval", "Posterior quantiles", "Natural prediction", "Prior needed", "bayes_meta"]]),
 dict(id="heterogeneity", title="Heterogeneity statistics", columns=["Statistic", "Meaning", "Caution", "Lesson"], lessons=[35], rows=[
   ["Q", "Weighted sum of squares around pooled mean (df = k-1)", "Low power with few studies; high with many", "35"],
   ["I^2", "Share of observed variability not due to sampling error", "Not absolute heterogeneity; two definitions (Q-based vs tau^2-based)", "35"],
   ["tau^2 / tau", "Between-study variance/SD (effect units)", "Wide CI; boundary 0", "35"],
   ["Prediction interval", "Range for a new study's true effect", "Convention differs (t_{k-2} vs z); needs k >= 3", "35"]]),
 dict(id="bias", title="Small-study effects / publication bias methods", columns=["Method", "Assumes", "Use", "Warning", "MetaLab"], lessons=[36, 49, 50], rows=[
   ["Funnel plot", "Visual symmetry", "k >= 10", "Asymmetry has many causes", "Implemented (plot)"],
   ["Egger regression", "Linear relation of effect and precision", "k >= 10", "Inflated false positives for some measures (e.g. log OR)", "Implemented; benchmarked"],
   ["Begg rank test", "Rank correlation", "Low power", "Low power", "Implemented; benchmarked"],
   ["Trim-and-fill", "Suppression of extreme small studies", "Sensitivity only", "Not a correction; unreliable with heterogeneity", "Implemented; benchmarked vs metafor"],
   ["PET / PEESE", "Effect-SE (or variance) relation", "Sensitivity only", "Biased with heterogeneity/few studies", "Implemented; benchmarked vs lm"],
   ["Selection models", "Publication process by p-value", "Sensitivity; many studies", "Assumption-heavy", "External R workflow only"]]),
 dict(id="dependence", title="Handling dependent effect sizes", columns=["Strategy", "Needs", "Strength", "Weakness", "MetaLab"], lessons=[38, 39, 40], rows=[
   ["Pick one / average per study", "Nothing", "Simple, valid for the study-level target", "Loses information", "Manual"],
   ["Three-level model", "Cluster labels", "Models true-effect clustering", "Ignores sampling covariance unless V given", "Implemented; benchmarked"],
   ["Multivariate model", "Within-study covariance V", "Borrows strength across outcomes", "Correlation poorly estimable; boundaries", "Implemented; benchmarked"],
   ["RVE (CR2 + Satterthwaite)", "Many clusters", "Valid SEs under unknown structure", "Small df with few clusters", "Implemented; benchmarked vs clubSandwich"],
   ["Phylogenetic model", "Tree/correlation matrix", "Shared ancestry", "Brownian assumption", "Implemented; benchmarked vs metafor"]]),
 dict(id="binary", title="Pooling binary outcomes", columns=["Method", "Handles zeros?", "Best for", "Weakness", "MetaLab"], lessons=[28, 48], rows=[
   ["Inverse-variance (log OR/RR)", "Needs correction", "Moderate event rates", "Correction bias with zeros", "Implemented"],
   ["Mantel-Haenszel", "Yes (no correction of tables)", "Sparse data, balanced arms", "Assumes common effect", "Implemented; benchmarked"],
   ["Peto OR", "Yes", "Very rare events, balanced arms, small effects", "Biased otherwise", "Implemented; benchmarked"],
   ["Binomial GLMM / Bayesian", "Yes", "Sparse data", "Needs expertise", "External workflow"]]),
]

# ------------------------------------------------------------------------------------------------ reporting guidelines (curated; refs verified bibliographically)
REPORTING = [
 dict(name="PRISMA 2020", for_="Systematic reviews (reporting)", ref="page2021", lessons=[76, 79], note="27-item checklist; flow diagram; use with PRISMA-S for searches."),
 dict(name="PRISMA-ScR", for_="Scoping reviews", ref="tricco2018", lessons=[55], note="Scoping-review extension."),
 dict(name="PRISMA-DTA", for_="Diagnostic test accuracy reviews", ref="mcgrath2019dta", lessons=[44], note="DTA extension."),
 dict(name="PRISMA-NMA", for_="Network meta-analyses", ref="hutton2015", lessons=[42], note="NMA extension."),
 dict(name="PRISMA-IPD", for_="IPD meta-analyses", ref="stewart2015", lessons=[46], note="IPD extension."),
 dict(name="PRISMA-Equity", for_="Equity-focused reviews", ref="welch2012", lessons=[90], note="Equity extension."),
 dict(name="SWiM", for_="Synthesis without meta-analysis", ref="campbell2020", lessons=[53], note="Reporting items for narrative/structured synthesis."),
 dict(name="MOOSE", for_="Meta-analyses of observational studies", ref="stroup2000", lessons=[58], note="Reporting checklist."),
 dict(name="ENTREQ", for_="Qualitative evidence syntheses", ref="tong2012", lessons=[54], note="Reporting qualitative synthesis."),
 dict(name="RAMESES", for_="Realist syntheses", ref="wong2013", lessons=[56], note="Realist-synthesis publication standards."),
 dict(name="ARRIVE 2.0", for_="Animal studies (primary reports)", ref="arrive2020", lessons=[59], note="Reporting guideline for in-vivo studies: NOT a risk-of-bias tool."),
 dict(name="CHARMS / PROBAST", for_="Prediction-model reviews", ref="moons2014charms", lessons=[45], note="CHARMS = data extraction; PROBAST (Wolff 2019) = risk of bias."),
]

# ------------------------------------------------------------------------------------------------ troubleshooting (curated)
TROUBLE = [
 dict(symptom="tau^2 = 0 but I^2 is large (or vice versa)", cause="I^2 (Q-based) and tau^2-based I^2 are different quantities; tau^2 may sit on the boundary with few studies.", check="Compare Q, tau^2 CI (Q-profile), prediction interval.", fix="Report tau^2 with its CI and the PI; do not read tau^2 = 0 as homogeneity.", lessons=[26, 35]),
 dict(symptom="Hartung-Knapp interval narrower than the Wald interval", cause="q* < 1 (little observed heterogeneity); some software truncates q* at 1.", check="Look at q* and the note returned by meta_analyze.", fix="State the choice; consider reporting both; do not hide the narrower interval.", lessons=[34, 35]),
 dict(symptom="HKSJ gives NaN / p undefined", cause="All effects identical (q* = 0, SE = 0).", check="Inspect yi: identical values?", fix="Check for data-entry duplication; report degenerate case.", lessons=[34]),
 dict(symptom="REML ConvergenceError", cause="Flat likelihood (tiny heterogeneity) or extreme/duplicated data.", check="Plot yi/vi; try PM or DL; scale variances.", fix="Investigate data; report estimator sensitivity.", lessons=[26, 34]),
 dict(symptom="Infinite or NaN odds ratios", cause="Zero cells.", check="Count zero cells per study.", fix="MH/Peto, GLMM, or pre-specified continuity correction with sensitivity analysis.", lessons=[48]),
 dict(symptom="Python and R pooled estimates differ", cause="Different defaults: tau^2 estimator, HK adjustment, continuity corrections, SMD variance formula.", check="Print options; compare tau^2 first.", fix="Match options explicitly; use the validation suite as a model.", lessons=[70, 71]),
 dict(symptom="Egger test significant with 6 studies", cause="Low power/high false positives with few studies; asymmetry has many causes.", check="k >= 10? heterogeneity? effect measure?", fix="Do not conclude publication bias; narrative caution.", lessons=[36, 49, 50]),
 dict(symptom="SD larger than the mean for a positive outcome", cause="Skewed data; SD may actually be SE or IQR-derived.", check="Legend/methods: SD or SE? medians?", fix="Use conversion methods with labelled sensitivity analysis; avoid lnRR if means near zero.", lessons=[18, 25]),
 dict(symptom="Same control group appears in several comparisons", cause="Shared-control dependence.", check="Study design table.", fix="Split the control group, combine arms, or model covariance (multivariate/RVE).", lessons=[38, 39, 40]),
 dict(symptom="n looks huge (flies) but the experiment has few vials", cause="Pseudoreplication: wrong unit of analysis.", check="Identify the independent unit.", fix="Use vial/cage level n or DEFF adjustment with sensitivity.", lessons=[85]),
 dict(symptom="PRISMA numbers do not reconcile", cause="Unresolved conflicts, missing decisions or exclusion reasons.", check="Open the PRISMA tab warnings.", fix="Resolve each warning before reporting.", lessons=[16, 79]),
 dict(symptom="Forest plot of ratios looks asymmetric", cause="Linear axis for ratio measure.", check="Axis scale.", fix="Plot on log scale with null at 1.", lessons=[73]),
 dict(symptom="Meta-regression coefficient is huge/unstable", cause="Too few studies per moderator or collinear moderators.", check="k per moderator; correlations.", fix="Reduce moderators; pre-specify; exploratory label.", lessons=[37]),
 dict(symptom="CR2 degrees of freedom < 4", cause="Few informative clusters for that coefficient.", check="Clusters per moderator level.", fix="Report as exploratory; simplify model.", lessons=[40]),
 dict(symptom="Network meta-analysis ranks a placebo-like arm best", cause="Ranking direction set wrongly (higher vs lower is better).", check="higher_is_better argument.", fix="State direction explicitly (required argument in MetaLab).", lessons=[42]),
 dict(symptom="Numbers in the manuscript differ from the analysis", cause="Results changed after text was written (stale tokens).", check="Manuscript quality checks.", fix="Recompute, re-verify, re-render.", lessons=[72, 79]),
]

# ------------------------------------------------------------------------------------------------ command reference: R <-> Python with EXPECTED values (executed by tests)
COMMANDS = [
 dict(id="smd", task="Hedges' g and variance", r='d <- escalc("SMD", m1i=10.5, sd1i=1, n1i=20, m2i=10, sd2i=1, n2i=20); c(d$yi, d$vi)', py='from metalab import stats as S; r = S.smd(10.5,1,20,10,1,20); [r[0], r[1]]', expected=[0.490055, 0.103002], lessons=[27, 64]),
 dict(id="rom", task="Log response ratio", r='d <- escalc("ROM", m1i=12, sd1i=3, n1i=10, m2i=10, sd2i=2, n2i=10); c(d$yi, d$vi)', py='from metalab import stats as S; list(S.log_response_ratio(12,3,10,10,2,10))', expected=[0.182322, 0.010250], lessons=[27, 60]),
 dict(id="vr", task="Log variability ratio", r='d <- escalc("VR", sd1i=3, n1i=10, sd2i=2, n2i=10); c(d$yi, d$vi)', py='from metalab import advanced2 as B; list(B.log_variability_ratio(3,10,2,10))', expected=[0.405465, 0.111111], lessons=[49]),
 dict(id="rr", task="Log risk ratio", r='d <- escalc("RR", ai=10, bi=90, ci=20, di=80); c(d$yi, d$vi)', py='from metalab import stats as S; list(S.log_risk_ratio(10,100,20,100))', expected=[-0.693147, 0.13], lessons=[28]),
 dict(id="or", task="Log odds ratio", r='d <- escalc("OR", ai=10, bi=90, ci=20, di=80); c(d$yi, d$vi)', py='from metalab import stats as S; list(S.log_odds_ratio(10,100,20,100))', expected=[-0.810930, 0.173611], lessons=[28]),
 dict(id="rd", task="Risk difference", r='d <- escalc("RD", ai=10, bi=90, ci=20, di=80); c(d$yi, d$vi)', py='from metalab import stats as S; list(S.risk_difference(10,100,20,100))', expected=[-0.1, 0.0025], lessons=[28]),
 dict(id="zcor", task="Fisher z", r='d <- escalc("ZCOR", ri=0.5, ni=28); c(d$yi, d$vi)', py='from metalab import stats as S; list(S.fisher_z(0.5,28))', expected=[0.549306, 0.04], lessons=[29]),
 dict(id="irr", task="Log incidence rate ratio", r='d <- escalc("IRR", x1i=10, t1i=100, x2i=15, t2i=110); c(d$yi, d$vi)', py='from metalab import advanced as A; list(A.log_irr(10,100,15,110))', expected=[-0.310155, 0.166667], lessons=[30]),
 dict(id="plo", task="Logit proportion", r='d <- escalc("PLO", xi=12, ni=80); c(d$yi, d$vi)', py='from metalab import advanced as A; list(A.proportion_es(12,80,"PLO"))', expected=[-1.734601, 0.098039], lessons=[47]),
 dict(id="reml", task="Random-effects REML pooled estimate, SE, tau^2 (BCG)", setup_r='b <- escalc("RR", ai=tpos, bi=tneg, ci=cpos, di=cneg, data=dat.bcg)',
      r='r <- rma(yi, vi, data=b, method="REML", control=list(threshold=1e-10, tol=1e-12)); c(r$beta, r$se, r$tau2)',
      py='from metalab import stats as S; from metalab.datasets import BCG; ys, vs = zip(*[S.log_risk_ratio(a,a+b,c,c+d) for a,b,c,d in BCG]); r = S.meta_analyze(ys, vs, "random", "REML"); [r.est, r.se, r.tau2]', expected=[-0.714532, 0.179782, 0.313243], lessons=[34, 35, 70]),
 dict(id="dl", task="DerSimonian-Laird (BCG)", setup_r='b <- escalc("RR", ai=tpos, bi=tneg, ci=cpos, di=cneg, data=dat.bcg)',
      r='r <- rma(yi, vi, data=b, method="DL"); c(r$beta, r$se, r$tau2)',
      py='from metalab import stats as S; from metalab.datasets import BCG; ys, vs = zip(*[S.log_risk_ratio(a,a+b,c,c+d) for a,b,c,d in BCG]); r = S.meta_analyze(ys, vs, "random", "DL"); [r.est, r.se, r.tau2]', expected=[-0.714117, 0.178742, 0.308760], lessons=[34]),
 dict(id="pm", task="Paule-Mandel (BCG)", setup_r='b <- escalc("RR", ai=tpos, bi=tneg, ci=cpos, di=cneg, data=dat.bcg)',
      r='r <- rma(yi, vi, data=b, method="PM", control=list(threshold=1e-10, tol=1e-12)); c(r$beta, r$se, r$tau2)',
      py='from metalab import stats as S; from metalab.datasets import BCG; ys, vs = zip(*[S.log_risk_ratio(a,a+b,c,c+d) for a,b,c,d in BCG]); r = S.meta_analyze(ys, vs, "random", "PM"); [r.est, r.se, r.tau2]', expected=[-0.714968, 0.180892, 0.318068], lessons=[34]),
 dict(id="hksj", task="Hartung-Knapp: estimate, SE, CI (BCG)", setup_r='b <- escalc("RR", ai=tpos, bi=tneg, ci=cpos, di=cneg, data=dat.bcg)',
      r='r <- rma(yi, vi, data=b, method="REML", test="knha", control=list(threshold=1e-10, tol=1e-12)); c(r$beta, r$se, r$ci.lb, r$ci.ub)',
      py='from metalab import stats as S; from metalab.datasets import BCG; ys, vs = zip(*[S.log_risk_ratio(a,a+b,c,c+d) for a,b,c,d in BCG]); r = S.meta_analyze(ys, vs, "random", "REML", hksj=True); [r.est, r.se, r.ci[0], r.ci[1]]', expected=[-0.714532, 0.180792, -1.108444, -0.320621], lessons=[34, 35]),
 dict(id="metareg", task="Meta-regression on absolute latitude (intercept, slope, tau^2)", setup_r='b <- escalc("RR", ai=tpos, bi=tneg, ci=cpos, di=cneg, data=dat.bcg)',
      r='r <- rma(yi, vi, mods = ~ ablat, data=b, method="REML", control=list(threshold=1e-10, tol=1e-12)); c(r$beta, r$tau2)',
      py='import numpy as np; from metalab import stats as S; from metalab.datasets import BCG, BCG_ABLAT; ys, vs = zip(*[S.log_risk_ratio(a,a+b,c,c+d) for a,b,c,d in BCG]); X = np.column_stack([np.ones(len(ys)), BCG_ABLAT]); r = S.meta_regression(ys, vs, X, method="REML"); [r.beta[0], r.beta[1], r.tau2]', expected=[0.251468, -0.029102, 0.076348], lessons=[37]),
]

# ------------------------------------------------------------------------------------------------ auto-extraction from lessons
@lru_cache(maxsize=1)
def entries():
    E = []
    def add(kind, title, body, lessons_, where="", **extra):
        E.append(dict(id=f"enc.{len(E):04d}", kind=kind, title=title, body=body, lessons=sorted(set(lessons_)), where=where, status=STATUS, **extra))
    for e in EFFECT_SIZES:
        add("Effect size", e["name"], f"Formula: {e['tex']}\nScale: {e['scale']}. Use when: {e['use']} Avoid when: {e['avoid']} Software: {e['r']}.", e["lessons"], e["where"], tex=e["tex"], code=e["r"])
    L = dict(lessons.load())
    for n, l in sorted(L.items()):
        t = l["title"]
        for f in l.get("formulas", []):
            add("Formula", f"{f['name']} (Module {n})", f"{f['tex']}\nwhere " + "; ".join(f"{k} = {v}" for k, v in f["symbols"].items()), [n], "Learning Academy", tex=f["tex"])
        if l.get("assumptions"): add("Assumptions", f"Assumptions - {t}", "\n".join(f"- {a}" for a in l["assumptions"]), [n], "Learning Academy")
        if l.get("mistakes"): add("Common mistakes", f"Common mistakes - {t}", "\n".join(f"- {m}" for m in l["mistakes"]), [n], "Learning Academy")
        if l.get("decision_tree"): add("Decision tree", f"Decision tree - {t}", "\n".join(f"- {q}  ->  {a}" for q, a in l["decision_tree"]), [n], "Learning Academy")
        add("Interpretation example", f"Worked interpretation - {t}", l["worked_example"], [n], "Learning Academy")
    for c in COMPARISONS:
        body = " | ".join(c["columns"]) + "\n" + "\n".join(" | ".join(r) for r in c["rows"]); add("Method comparison", c["title"], body, c["lessons"], "Statistics Lab", table=c)
    for r in REPORTING:
        add("Reporting guideline", f"{r['name']} - {r['for_']}", f"{r['note']}  Reference: {references.link(r['ref'])}", r["lessons"], "Manuscript Studio", ref=r["ref"])
    for k, t in rob_tools.TOOLS.items():
        add("Risk-of-bias instrument", t["name"], f"Design: {t['design']}. Domains: " + "; ".join(t["domains"]) + f". Judgements: {', '.join(t['judgements'])}. {t['note']}", [21, 22, 23], "Research Workspace > Risk of bias", tool=k)
    for tr in TROUBLE:
        add("Troubleshooting", tr["symptom"], f"Likely cause: {tr['cause']}\nCheck: {tr['check']}\nFix: {tr['fix']}", tr["lessons"], "Statistics Lab")
    for c in COMMANDS:
        add("Command (R/Python)", c["task"], f"R:\n{(c.get('setup_r', '') + chr(10) if c.get('setup_r') else '')}{c['r']}\n\nPython:\n{c['py']}\n\nExpected output (checked in tests): {c['expected']}", c["lessons"], "Coding Lab", command=c["id"])
    return E


def _tok(s): return re.findall(r"[a-z0-9^_']+", s.lower())


def search(q, kinds=None, limit=30):
    qt = _tok(q)
    if not qt: return []
    out = []
    for e in entries():
        if kinds and e["kind"] not in kinds: continue
        t, b = " ".join(_tok(e["title"])), " ".join(_tok(e["body"]))
        s = sum((3 if w in t else 0) + (1 if w in b else 0) for w in qt)
        if all(w in t or w in b for w in qt): s += 5
        if s: out.append((s, e))
    return [e for _, e in sorted(out, key=lambda x: (-x[0], x[1]["id"]))[:limit]]


def for_lesson(n): return [e for e in entries() if n in e["lessons"]]


def run_command(cmd, language="py", rscript=None):
    """Execute a command-reference entry and return its numeric output list (used by tests and the Coding Lab 'try it')."""
    import subprocess
    if language == "py":
        code = cmd["py"]; head, _, last = code.rpartition(";"); ns = {}
        exec(compile(head.replace("; ", "\n") if head else "", "cmd", "exec"), ns) if head else None
        return [float(x) for x in eval(last.strip(), ns)]
    prog = 'suppressMessages(library(metafor)); suppressMessages(library(metadat))\n' + (cmd.get("setup_r", "") + "\n" if cmd.get("setup_r") else "") + "cat(sprintf('%.6f', {" + cmd["r"] + "}), sep='\\n')"
    o = subprocess.run([rscript or "Rscript", "-e", prog], capture_output=True, text=True)
    if o.returncode != 0: raise RuntimeError(o.stderr[-300:])
    return [float(x) for x in o.stdout.split()]
