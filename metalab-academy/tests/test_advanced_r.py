"""Numerical benchmarking of advanced methods against R/metafor 4.4.0 (reference: validation/make_reference.R)."""
import json, math
from pathlib import Path
import numpy as np, pytest
from metalab import advanced as A, stats as S

REF = json.loads((Path(__file__).parent.parent / "validation" / "reference" / "reference.json").read_text())
def close(a, b, rtol=1e-7, atol=1e-9, what=""):
    np.testing.assert_allclose(np.atleast_1d(np.asarray(a, float)), np.atleast_1d(np.asarray(b, float)), rtol=rtol, atol=atol, err_msg=what)

# ---- rates / prevalence
def test_irr_matches_escalc():
    d = REF["rates"]["irr"]; got = np.array([A.log_irr(r["x1i"], r["t1i"], r["x2i"], r["t2i"]) for r in d["data"]])
    close(got[:, 0], d["yi"]); close(got[:, 1], d["vi"])

@pytest.mark.parametrize("m", ["PR", "PLO", "PFT", "PAS"])
def test_prevalence_transforms_match_escalc(m):
    d = REF["prev"]; got = np.array([A.proportion_es(r["xi"], r["ni"], m) for r in d["data"]])
    close(got[:, 0], d[m]["yi"], what=m + " yi"); close(got[:, 1], d[m]["vi"], what=m + " vi")

@pytest.mark.parametrize("m", ["PLO", "PFT"])
def test_prevalence_zero_and_full_counts_match_escalc(m):
    d = REF["prev"]; got = np.array([A.proportion_es(r["xi"], r["ni"], m) for r in d["edge_data"]])
    close(got[:, 0], d[f"edge_{m}"]["yi"]); close(got[:, 1], d[f"edge_{m}"]["vi"])

def test_design_effect():
    assert A.design_effect(10, 0.1) == pytest.approx(1.9); assert A.design_effect(1, 0.5) == 1
    with pytest.raises(ValueError): A.design_effect(5, 1.5)

# ---- MH / Peto
@pytest.mark.parametrize("ds", ["bcg", "nielweise"])
@pytest.mark.parametrize("m", ["OR", "RR", "RD"])
def test_mantel_haenszel_matches_rma_mh(ds, m):
    d = REF["mh"][ds]; ref = d[m]; t = d["data"]
    r = A.mantel_haenszel([x["a"] for x in t], [x["b"] for x in t], [x["c"] for x in t], [x["d"] for x in t], m)
    close(r["est"], ref["est"], what="est"); close(r["se"], ref["se"], what="se"); close(r["ci"], ref["ci"], what="ci")
    close(r["p"], ref["p"], rtol=1e-6, atol=1e-12, what="p"); close(r["Q"], ref["QE"], rtol=1e-6, what="Q"); assert r["k"] == ref["k"]

@pytest.mark.parametrize("ds", ["bcg", "nielweise"])
def test_peto_matches_rma_peto(ds):
    t = REF["peto"][ds]["data"]; ref = REF["peto"][ds]["res"]
    r = A.peto_or([x["a"] for x in t], [x["b"] for x in t], [x["c"] for x in t], [x["d"] for x in t])
    close(r["est"], ref["est"]); close(r["se"], ref["se"]); close(r["ci"], ref["ci"]); close(r["Q"], ref["QE"], rtol=1e-6); assert r["k"] == ref["k"]

def test_mh_drops_double_zero_studies_and_errors():
    r = A.mantel_haenszel([0, 3, 2], [20, 17, 18], [0, 4, 5], [20, 16, 15], "OR"); assert r["k"] == 3 and r["Q_df"] == 1   # double-zero kept in MH, dropped from Q (metafor)
    with pytest.raises(ValueError): A.mantel_haenszel([0], [10], [0], [10], "OR")
    with pytest.raises(ValueError): A.mantel_haenszel([1, 2], [5], [1, 2], [5, 6])

# ---- Egger / Begg / cumulative
@pytest.mark.parametrize("n", list(REF["bias"]))
def test_egger_and_begg_match_metafor(n):
    d = REF["bias"][n]; y, v = d["yi"], d["vi"]
    e = A.egger_test(y, v)
    close(e["t"], d["egger"]["z"], rtol=1e-6, what="Egger t"); close(e["p"], d["egger"]["p"], rtol=1e-6, atol=1e-12, what="Egger p"); close(e["intercept"], d["egger"]["coefs"][1], rtol=1e-6, what="Egger intercept"); assert e["df"] == d["egger"]["df"]
    b = A.begg_test(y, v); close(b["tau"], d["begg"]["tau"], rtol=1e-6, what="tau"); close(b["p"], d["begg"]["p"], rtol=1e-5, atol=1e-9, what="Begg p")

def test_egger_flags_low_k_and_detects_planted_asymmetry():
    assert "warning" in A.egger_test([0.1, 0.3, 0.5, 0.2], [0.04, 0.03, 0.02, 0.05])
    rng = np.random.default_rng(1); se = np.linspace(0.05, 0.5, 40); y = 0.2 + 3.0 * se + rng.normal(0, 0.02, 40)   # strong small-study effect
    assert A.egger_test(y, se**2)["p"] < 0.001

def test_cumulative_matches_metafor():
    d = REF["cumul"]["raudenbush_by_year"]; rows = A.cumulative(d["yi"], d["vi"])
    close([r["est"] for r in rows], d["est"], what="est"); close([r["se"] for r in rows], d["se"], what="se")
    close([r["tau2"] for r in rows][1:], d["tau2"][1:], rtol=1e-6, atol=1e-9, what="tau2"); close([r["ci"][0] for r in rows], d["ci_lb"], what="ci")

# ---- Q-profile CI / influence
@pytest.mark.parametrize("key", list(REF["confint"]))
def test_qprofile_ci_matches_metafor_confint(key):
    d = REF["confint"][key]; y, v = np.array(d["yi"]), np.array(d["vi"]); r = A.tau2_ci_qprofile(y, v)
    # metafor's confint() uses uniroot with its default tolerance (absolute tolerance ~1.2e-4), so agreement is ~1e-4 absolute; assert that OUR root is the more exact one
    close(r["tau2"], d["tau2"][1:], rtol=5e-4, atol=2e-4, what="tau2 CI"); close(r["I2"], d["I2"][1:], rtol=5e-4, atol=0.05, what="I2 CI")   # uniroot abs tol ~1.2e-4
    from scipy import stats as st
    k = len(y); targets = st.chi2.ppf([0.975, 0.025], k - 1)
    def Q(t): w = 1 / (v + t); mu = (w * y).sum() / w.sum(); return (w * (y - mu) ** 2).sum()
    for mine, theirs, tg in zip(r["tau2"], d["tau2"][1:], targets):
        if mine > 0: assert abs(Q(mine) - tg) <= abs(Q(theirs) - tg) + 1e-12

@pytest.mark.parametrize("n", list(REF["influence"]))
def test_influence_matches_metafor(n):
    d = REF["influence"][n]; rows = A.influence_diagnostics(d["yi"], d["vi"])
    close([r["rstudent"] for r in rows], d["rstudent"], rtol=1e-6, what="rstudent"); close([r["hat"] for r in rows], d["hat"], rtol=1e-6, what="hat")
    close([r["tau2_del"] for r in rows], d["tau2_del"], rtol=1e-6, atol=1e-9, what="tau2.del")
    close([r["cook"] for r in rows], d["cook"], rtol=1e-5, atol=1e-9, what="cook")

# ---- multilevel + robust
def test_multilevel_matches_rma_mv_and_robust_cr1():
    d = REF["mv"]["konstantopoulos"]
    fit = A.multilevel_meta(d["yi"], d["vi"], d["district"])
    close([fit["sigma2_cluster"], fit["sigma2_effect"]], d["sigma2"], rtol=2e-3, atol=1e-5, what="sigma2")
    close(fit["beta"], d["est"], rtol=1e-4, what="beta"); close(fit["se"], d["se"], rtol=1e-4, what="se"); close(fit["loglik_reml"], d["ll"], rtol=1e-8, atol=1e-5, what="REML loglik")
    rb = A.robust_cr1(fit); R = d["robust"]
    close(rb["se"], R["se"], rtol=1e-3, what="robust se"); assert rb["df"] == R["df"]; close(rb["p"], R["p"], rtol=1e-2, what="robust p")

def test_multilevel_guards():
    with pytest.raises(ValueError): A.multilevel_meta([0.1, 0.2], [0.1, 0.1], [1, 1])


def test_bundled_konstantopoulos_equals_r_export():
    from metalab.datasets import KON_YI, KON_VI, KON_DISTRICT
    d = REF["mv"]["konstantopoulos"]; assert KON_YI == d["yi"] and KON_VI == d["vi"] and KON_DISTRICT == d["district"] and len(KON_YI) == 56
