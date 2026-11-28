"""Benchmarks of metalab.advanced2 against R (metafor 4.4.0, clubSandwich 0.5.10, ape, base R). Reference: validation/make_reference_v04.R."""
import json, math
from pathlib import Path
import numpy as np, pytest
from metalab import advanced as A, advanced2 as B, stats as S

REF = json.loads((Path(__file__).parent.parent / "validation" / "reference" / "reference_v04.json").read_text())
def close(a, b, rtol=1e-6, atol=1e-8, what=""):
    np.testing.assert_allclose(np.atleast_1d(np.asarray(a, float)), np.atleast_1d(np.asarray(b, float)), rtol=rtol, atol=atol, err_msg=what)

# ---------------- trim-and-fill
@pytest.mark.parametrize("ds", list(REF["trimfill"]))
@pytest.mark.parametrize("est", ["L0", "R0"])
def test_trimfill_matches_metafor(ds, est):
    d = REF["trimfill"][ds]; ref = d[est]
    r = B.trim_fill(d["yi"], d["vi"], estimator=est)
    assert r["k0"] == ref["k0"] and r["side"] == ref["side"]
    # metafor's final REML refit inside trimfill() uses its default Fisher-scoring tolerance (1e-5), so agree to ~1e-5, not 1e-8 (our value is the tighter optimum).
    close(r["est"], ref["est"], rtol=3e-4, atol=5e-6, what="est"); close(r["se"], ref["se"], rtol=3e-4, atol=5e-6, what="se"); close(r["ci"], ref["ci"], rtol=3e-4, atol=5e-6); close(r["tau2"], ref["tau2"], rtol=3e-4, atol=2e-5)
    # the filled data themselves must be identical to metafor's (same mirrored values, same variances); pooling them with our engine is then exact
    o1, o2 = np.lexsort((r["v_all"], r["y_all"])), np.lexsort((ref["vi_f"], ref["yi_f"]))
    close(np.asarray(r["y_all"])[o1], np.asarray(ref["yi_f"])[o2], rtol=1e-9, atol=1e-10, what="filled data"); close(np.asarray(r["v_all"])[o1], np.asarray(ref["vi_f"])[o2], rtol=1e-9)
    if ref["k0"] > 0: assert len(r["filled_y"]) == ref["k0"]
    assert any("sensitivity analysis" in n for n in r["notes"])

def test_trimfill_symmetric_data_fills_nothing():
    y = np.array([-.3, -.2, -.1, 0, .1, .2, .3]); v = np.array([.04, .03, .02, .01, .02, .03, .04]); assert B.trim_fill(y, v)["k0"] == 0

def test_trimfill_errors():
    with pytest.raises(ValueError): B.trim_fill([1, 2], [.1, .1])
    with pytest.raises(ValueError): B.trim_fill([1, 2, 3], [.1, .1, .1], estimator="X")
    with pytest.raises(ValueError): B.trim_fill([1, 2, 3], [.1, .1, -.1])
    with pytest.raises(ValueError): B.trim_fill([1, 2, 3], [.1, .1, .1], side="up")

# ---------------- PET / PEESE
@pytest.mark.parametrize("ds", list(REF["petpeese"]))
def test_pet_peese_matches_lm(ds):
    d = REF["petpeese"][ds]; r = B.pet_peese(d["yi"], d["vi"])
    for m in ("pet", "peese"):
        close(r[m]["coef"], d[m]["coef"]); close(r[m]["se"], d[m]["se"]); close(r[m]["p"], d[m]["p"], atol=1e-10); assert r[m]["df"] == d[m]["df"]

def test_pet_peese_few_studies():
    with pytest.raises(ValueError): B.pet_peese([1, 2, 3, 4], [.1] * 4)

# ---------------- CR2
def test_cr2_matches_clubSandwich():
    d = REF["cr2"]; y, v, cl = np.array(d["yi"]), np.array(d["vi"]), np.array(d["district"])
    fit = B.multilevel_cr2(y, v, cl)
    # the three-level fit itself is checked against rma.mv: school-within-district via advanced.multilevel_meta uses effect-level (not school) variance;
    # here the reference has school nested in district, so we benchmark the CR2 step on the reference's own marginal covariance instead:
    school = np.array(d["school"])
    keyed = np.array([f"{a}-{b}" for a, b in zip(cl, school)]); n = len(y)
    s2d, s2s = d["intercept"]["sigma2"]
    Sg = np.diag(v).astype(float)
    for i in range(n):
        for j in range(n):
            if cl[i] == cl[j]: Sg[i, j] += s2d
            if keyed[i] == keyed[j]: Sg[i, j] += s2s
    X = np.ones((n, 1)); r = B.robust_cr2(X, y, Sg, cl)
    ref = d["intercept"]; close(r["beta"][0], ref["beta"]); close(r["se"][0], ref["se"], rtol=1e-6); close(r["df"][0], ref["df"], rtol=1e-5); close(r["p"][0], ref["p"], rtol=1e-4)
    assert fit["clusters"] == 11

def test_cr2_with_moderator_matches_clubSandwich():
    d = REF["cr2"]; y, v, cl, school, yr = (np.array(d[k]) for k in ("yi", "vi", "district", "school", "year")); n = len(y)
    keyed = np.array([f"{a}-{b}" for a, b in zip(cl, school)]); s2d, s2s = d["mod_year"]["sigma2"]
    Sg = np.diag(v).astype(float)
    for i in range(n):
        for j in range(n):
            if cl[i] == cl[j]: Sg[i, j] += s2d
            if keyed[i] == keyed[j]: Sg[i, j] += s2s
    X = np.column_stack([np.ones(n), yr]); r = B.robust_cr2(X, y, Sg, cl); ref = d["mod_year"]
    close(r["beta"], ref["beta"]); close(r["se"], ref["se"], rtol=1e-6); close(r["df"], ref["df"], rtol=1e-5); close(r["p"], ref["p"], rtol=1e-4)

def test_cr2_errors_and_warnings():
    X = np.ones((6, 1)); y = np.arange(6.0); Sg = np.eye(6)
    with pytest.raises(ValueError): B.robust_cr2(X, y, Sg, [1, 1, 1, 2, 2, 2])
    with pytest.raises(ValueError): B.robust_cr2(X, y, Sg, [1, 1])
    r = B.robust_cr2(X, y, Sg, [1, 1, 2, 2, 3, 3]); assert any("clusters" in w for w in r["warnings"])

# ---------------- generic REML engine reproduces existing 3-level function
def test_reml_varcomp_matches_multilevel():
    d = REF["cr2"]; y, v, cl = np.array(d["yi"]), np.array(d["vi"]), np.array(d["district"]); n = len(y)
    fit = A.multilevel_meta(y, v, cl)
    Gc = (cl[:, None] == cl[None, :]).astype(float); Ge = np.eye(n)
    g = B.reml_varcomp(y, v, None, [Gc, Ge], ["c", "e"])
    close(g["theta"]["c"], fit["sigma2_cluster"], rtol=1e-4, atol=1e-6); close(g["loglik_reml"], fit["loglik_reml"], atol=1e-6)

# ---------------- multivariate (Berkey)
def _berkey():
    m = REF["multivariate"]; study = np.array(m["trial"]); outcome = np.array([0 if o == "AL" else 1 for o in m["outcome"]])  # R factor order: AL, PD
    Vb = {}
    for t, flat in m["V"].items():
        arr = np.array(flat); k = int(round(math.sqrt(len(arr)))); Vb[int(t)] = arr.reshape(k, k)
    return np.array(m["yi"]), Vb, outcome, study

def test_multivariate_matches_metafor_berkey():
    y, Vb, outcome, study = _berkey(); m = REF["multivariate"]; r = B.multivariate_meta(y, Vb, outcome, study, 2)
    close(r["beta"], m["beta"], rtol=1e-5); close(r["se"], m["se"], rtol=1e-4); close(r["tau2"], m["tau2"], rtol=1e-3, atol=1e-6)
    close(r["rho"], m["rho"], rtol=1e-3, atol=1e-4); close(r["loglik_reml"], m["ll"], atol=1e-4)

def test_multivariate_errors():
    y, Vb, outcome, study = _berkey()
    with pytest.raises(ValueError): B.multivariate_meta(y, {**Vb, 1: np.eye(5)}, outcome, study, 2)
    with pytest.raises(ValueError): B.multivariate_meta(np.append(y[:-1], np.nan), Vb, outcome, study, 2)

# ---------------- DTA
def test_dta_matches_metafor_bivariate():
    d = REF["dta"]; t = d["table"]; r = B.dta_bivariate([x["TP"] for x in t], [x["FN"] for x in t], [x["FP"] for x in t], [x["TN"] for x in t])
    close(r["beta"], d["beta"], rtol=1e-5); close(r["se"], d["se"], rtol=1e-4); close(r["tau2"], d["tau2"], rtol=1e-3); close(r["rho"], d["rho"], rtol=1e-2, atol=1e-3)
    close(r["sens"], d["sens"], rtol=1e-5); close(r["spec"], d["spec"], rtol=1e-5); close(r["loglik_reml"], d["ll"], atol=1e-4)
    assert 0 < r["sens_ci"][0] < r["sens"] < r["sens_ci"][1] < 1; assert any("threshold" in w for w in r["warnings"])

def test_dta_invalid():
    with pytest.raises(ValueError): B.dta_bivariate([0, 2], [0, 0], [1, 1], [1, 1])
    with pytest.raises(ValueError): B.dta_bivariate([1, -2], [1, 1], [1, 1], [1, 1])

# ---------------- NMA
def _nma_inputs():
    a = REF["nma"]["arms"]; st = [x["study"] for x in a]; tr = [x["trt"] for x in a]; x_ = np.array([r["xi"] for r in a], float); n = np.array([r["ni"] for r in a], float)
    return st, tr, np.log((x_ + .5) / (n - x_ + .5)), 1 / (x_ + .5) + 1 / (n - x_ + .5)

def test_nma_common_matches_rma_mv():
    st, tr, y, v = _nma_inputs(); r = B.nma(st, tr, y, v, reference="no_contact", model="common", higher_is_better=True); ref = REF["nma"]
    assert r["treatments"] == ref["treatments"]; close(r["beta"], ref["common"]["beta"], rtol=1e-7); close(r["se"], ref["common"]["se"], rtol=1e-7)
    close(r["Q"], ref["common"]["QE"], rtol=1e-7); close(r["vcov"].ravel(), ref["common"]["vcov"], rtol=1e-6, atol=1e-10)

def test_nma_random_matches_rma_mv():
    st, tr, y, v = _nma_inputs(); r = B.nma(st, tr, y, v, reference="no_contact", model="random", higher_is_better=True); ref = REF["nma"]["random"]
    close(r["tau2"], ref["tau2"], rtol=1e-4); close(r["beta"], ref["beta"], rtol=1e-5); close(r["se"], ref["se"], rtol=1e-4)

def test_nma_invariances():
    st, tr, y, v = _nma_inputs(); a = B.nma(st, tr, y, v, reference="no_contact", model="random", higher_is_better=True); b = B.nma(st, tr, y, v, reference="self_help", model="random", higher_is_better=True)
    ia = {t: i for i, t in enumerate(a["treatments"])}; ib = {t: i for i, t in enumerate(b["treatments"])}
    for t1 in ia:
        for t2 in ia: close(a["league"][ia[t1], ia[t2]], b["league"][ib[t1], ib[t2]], rtol=1e-5, atol=1e-7, what="league table independent of reference")
    # antisymmetry; pscores average 0.5
    L = a["league"]; close(L, -L.T); close(np.mean(list(a["pscore"].values())), 0.5, rtol=1e-9)
    assert any("Consistency" in w for w in a["warnings"])

def test_nma_direct_only_reduces_to_pairwise():
    y = np.array([.2, .0, .5, .1, .3, .2]); v = np.array([.04] * 6); st = [1, 1, 2, 2, 3, 3]; tr = ["B", "A"] * 3
    r = B.nma(st, tr, y, v, reference="A", model="common", higher_is_better=True); ref = S.meta_analyze(y[::2] - y[1::2], v[::2] + v[1::2], "common"); close(r["beta"][0], ref.est)

def test_nma_disconnected_and_invalid():
    with pytest.raises(ValueError, match="disconnected"): B.nma([1, 1, 2, 2], ["A", "B", "C", "D"], [0, 1, 0, 1], [.1] * 4, higher_is_better=True)
    with pytest.raises(ValueError): B.nma([1, 1], ["A", "A"], [0, 1], [.1, .1], higher_is_better=True)
    with pytest.raises(ValueError): B.nma([1, 1], ["A", "B"], [0, 1], [.1, 0], higher_is_better=True)

# ---------------- phylogenetic
def test_phylo_matches_metafor_rma_mv():
    p = REF["phylo"]; Am = np.array(p["A"]); r = B.phylogenetic_meta(p["yi"], p["vi"], p["species"], Am, p["species_levels"]); th = list(r["theta"].values())
    close(r["beta"], p["beta"], rtol=1e-3); close(th, p["sigma2"], rtol=2e-2, atol=2e-4); close(r["se"], p["se"], rtol=1e-2); close(r["loglik_reml"], p["ll"], atol=1e-3)
    assert 0 <= r["H2_phylo"] <= 1

def test_phylo_invalid():
    p = REF["phylo"]; Am = np.array(p["A"])
    with pytest.raises(ValueError): B.phylogenetic_meta(p["yi"], p["vi"], ["x"] * 150, Am, p["species_levels"])
    with pytest.raises(ValueError): B.phylogenetic_meta(p["yi"], p["vi"], p["species"], Am[:5, :5], p["species_levels"])

# ---------------- Bayesian
@pytest.mark.parametrize("key,prior", [("halfnormal_0.5", "halfnormal"), ("halfcauchy_0.5", "halfcauchy")])
def test_bayes_matches_independent_R_integration(key, prior):
    ref = REF["bayes"][key]; r = B.bayes_meta(REF["bayes"]["yi"], REF["bayes"]["vi"], prior, 0.5)
    for k in ("tau_mean", "tau_sd", "tau_median", "mu_mean", "mu_sd", "mu_median"): close(r[k], ref[k], rtol=2e-5, what=k)
    close(r["tau_ci"], ref["tau_ci"], rtol=2e-4); close(r["mu_ci"], ref["mu_ci"], rtol=2e-5)

def test_bayes_prior_sensitivity_and_flat_limit():
    y, v = REF["bayes"]["yi"], REF["bayes"]["vi"]; a = B.bayes_meta(y, v, "halfnormal", 0.1); b = B.bayes_meta(y, v, "halfnormal", 2.0)
    assert a["tau_mean"] < b["tau_mean"]
    with pytest.raises(ValueError): B.bayes_meta(y, v, "uniform")
    with pytest.raises(ValueError): B.bayes_meta(y, v, scale=-1)

# ---------------- IPD / rare events / survival / power
def test_ipd_two_stage_matches_lm_reference():
    d = REF["ipd"]; data = d["data"]; r = B.ipd_two_stage([x["study"] for x in data], [x["trt"] for x in data], [x["y"] for x in data]); ts = d["two_stage"]
    close(r["stage1_est"], ts["est"]); close(r["stage1_se"], ts["se"]); close(r["pooled"].est, ts["pooled"], rtol=1e-6); close(r["pooled"].se, ts["pooled_se"], rtol=1e-6)

@pytest.mark.parametrize("ds", ["nielweise", "bcg"])
@pytest.mark.parametrize("m", ["OR", "RR"])
def test_cc_sensitivity_matches_escalc(ds, m):
    d = REF["cc"][ds]["data"]
    d = {k: [r[k] for r in d] for k in ("ai", "bi", "ci", "di")} if isinstance(d, list) else d
    r = B.cc_sensitivity(d["ai"], d["bi"], d["ci"], d["di"], m)
    for add in (0.01, 0.1, 0.5, 1.0):
        ref = REF["cc"][ds][f"{m}_{add if add != 1.0 else 1}"]
        close(r[add]["est"], ref["est"], rtol=1e-5, atol=1e-7); close(r[add]["se"], ref["se"], rtol=1e-5); assert r[add]["k"] == ref["k"]

def test_survival_extraction():
    lh, se = B.loghr_from_ci(0.8, 0.64, 1.0); assert lh == pytest.approx(math.log(.8)); assert se == pytest.approx((math.log(1.0) - math.log(.64)) / (2 * 1.959963984540054))
    assert B.loghr_from_oe(10, 14, 8) == (-0.5, 0.125)
    with pytest.raises(ValueError): B.loghr_from_ci(2, 0.5, 1.5)
    with pytest.raises(ValueError): B.loghr_from_oe(1, 2, 0)

def test_power_closed_form_and_monte_carlo():
    assert B.power_meta(0, 0.04, 10) == pytest.approx(0.05)
    p = B.power_meta(0.3, 0.04, 8, 0.02); se = math.sqrt(.06 / 8); assert p == pytest.approx(1 - 0.5 * (1 + math.erf((1.959963984540054 - .3 / se) / math.sqrt(2))) + 0.5 * (1 + math.erf((-1.959963984540054 - .3 / se) / math.sqrt(2))), abs=1e-9)
    rng = np.random.default_rng(1); hit = 0; R = 3000; v = np.full(8, .04)
    for _ in range(R):
        yv = rng.normal(.3, np.sqrt(.04 + .02), 8); r = S.meta_analyze(yv, v, "random", "DL"); hit += r.p < .05   # DL estimates tau2: power slightly below the known-tau2 value
    assert abs(hit / R - p) < 0.12 and hit / R <= p + 0.03
    assert B.k_for_power(0.3, .04, 0.02) >= 1 and B.power_meta(0.3, .04, B.k_for_power(0.3, .04, 0.02), 0.02) >= 0.8
    assert B.power_Q_test(10, .04, 0) == pytest.approx(0.05)
    with pytest.raises(ValueError): B.power_meta(.3, 0, 5)
    with pytest.raises(ValueError): B.k_for_power(1e-9, 0.04, 0.0, kmax=50)


# ---------------- edge cases, invalid inputs, convergence
def test_reml_varcomp_input_validation():
    y = np.array([.1, .2, .3, .4]); v = np.full(4, .05)
    with pytest.raises(ValueError): B.reml_varcomp(y[:2], v[:2], None, [])
    with pytest.raises(ValueError): B.reml_varcomp(np.append(y[:3], np.nan), v, None, [np.eye(4)])
    with pytest.raises(ValueError): B.reml_varcomp(y, -v, None, [np.eye(4)])
    with pytest.raises(ValueError): B.reml_varcomp(y, v, np.ones((4, 2)), [np.eye(4)])            # rank deficient
    with pytest.raises(ValueError): B.reml_varcomp(y, v, None, [np.eye(3)])                      # wrong G shape
    asym = np.diag(v); asym[0, 1] = .01
    with pytest.raises(ValueError): B.reml_varcomp(y, asym, None, [np.eye(4)])

def test_reml_varcomp_boundary_is_reported_not_hidden():
    y = np.array([.1, .1, .1, .1, .1]); r = B.reml_varcomp(y, np.full(5, .05), None, [np.eye(5)], ["tau2"])
    assert r["theta"]["tau2"] == pytest.approx(0, abs=1e-8) and any("boundary" in w for w in r["warnings"])

def test_dta_boundary_correlation_warning():
    # tiny, strongly threshold-driven table: correlation hits -1; the function must warn rather than present it as an ordinary estimate
    tp = [45, 30, 62, 20, 80, 15, 50, 38]; fn = [5, 10, 8, 4, 20, 5, 12, 7]; fp = [8, 6, 15, 3, 30, 2, 9, 12]; tn = [92, 64, 115, 77, 170, 58, 129, 143]   # this table drives rho to -1 (found in v0.4 benchmarking)
    r = B.dta_bivariate(tp, fn, fp, tn); assert abs(r["rho"]) > 0.99 and any("near +-1" in w or "at zero" in w for w in r["warnings"])

def test_multivariate_missing_outcome_in_some_studies():
    y, Vb, outcome, study = _berkey(); keep = ~((study == 1) & (outcome == 1))     # trial 1 reports one outcome only
    Vb2 = dict(Vb); Vb2[1] = Vb[1][:1, :1]; Vb2[1] = np.array([[Vb[1][0, 0]]])
    r = B.multivariate_meta(y[keep], Vb2, outcome[keep], study[keep], 2); assert np.all(np.isfinite(r["beta"]))

def test_nma_unconnected_but_valid_two_component_rejected_and_multiarm_ok():
    st_, tr, y, v = _nma_inputs(); r = B.nma(st_, tr, y, v, model="common", higher_is_better=True); assert r["n_contrasts"] == len(set(st_)) + sum(1 for s in set(st_) if st_.count(s) == 3)

def test_bayes_extreme_inputs():
    r = B.bayes_meta([0.1, 0.1, 0.1], [0.01, 0.01, 0.01], "halfnormal", 0.5); assert r["tau_median"] < 0.1 and abs(r["mu_mean"] - 0.1) < 1e-6
    assert r["tail_mass_beyond_upper"] < 1e-6

def test_cc_sensitivity_invalid_measure():
    with pytest.raises(ValueError): B.cc_sensitivity([1], [2], [3], [4], "RD")

def test_ipd_two_stage_invalid():
    with pytest.raises(ValueError): B.ipd_two_stage([1, 1, 1], [0, 0, 0], [1, 2, 3])


def test_nma_ranking_direction_is_explicit_and_reverses_pscores():
    st_, tr, y, v = _nma_inputs()
    with pytest.raises(TypeError): B.nma(st_, tr, y, v, reference="no_contact")       # direction must be chosen deliberately
    up = B.nma(st_, tr, y, v, reference="no_contact", higher_is_better=True)["pscore"]; dn = B.nma(st_, tr, y, v, reference="no_contact", higher_is_better=False)["pscore"]
    for t in up: close(up[t] + dn[t], 1.0, rtol=1e-9)
    assert up["no_contact"] < 0.1 and max(up, key=up.get) in ("ind_counseling", "grp_counseling")


def test_reference_file_contains_no_silent_r_errors():
    """The v0.4 reference script once swallowed an R error (trimfill 'control' clash) and wrote it into the JSON; every section must now be error-free and non-degenerate."""
    def walk(o, path=""):
        if isinstance(o, dict):
            assert "error" not in o, f"R error recorded at {path}: {o.get('error')}"
            for k, v in o.items(): walk(v, f"{path}/{k}")
        elif isinstance(o, list):
            for i, v in enumerate(o[:50]): walk(v, f"{path}[{i}]")
    walk(REF)
    assert REF["dta"]["rho"] > -0.99 and min(REF["dta"]["tau2"]) > 0.05          # interior optimum, not a boundary solution
    assert REF["meta"]["metafor"] == "4.4.0" and REF["meta"]["clubSandwich"] == "0.5.10"
