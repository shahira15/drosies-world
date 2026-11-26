"""Numerical benchmarking against R/metafor (reference produced by validation/make_reference.R).

WHAT THIS ESTABLISHES: our Python implementation reproduces metafor's numbers on documented
datasets (metadat) and synthetic edge cases, to the stated tolerances.
WHAT IT DOES NOT ESTABLISH: that the methods are the *right* ones for a given research question
(methodological correctness) or any expert review. See VALIDATION.md.
"""
import json, math
from pathlib import Path
import numpy as np, pytest
from metalab import stats as S

REF = json.loads((Path(__file__).parent.parent / "validation" / "reference" / "reference.json").read_text())
RTOL, ATOL = 1e-7, 1e-9


# Per-case tolerance overrides, each with a documented reason (see VALIDATION.md).
OVERRIDES = {"edge:tiny_variances": dict(rtol=1e-3, atol=1e-12)}   # metafor's convergence threshold is absolute (1e-10) and stops early when tau2 ~ 1e-8


def close(a, b, rtol=RTOL, atol=ATOL, what=""):
    a = np.atleast_1d(np.asarray(a, float)); b = np.atleast_1d(np.asarray(b, float))
    assert a.shape == b.shape, f"{what}: shape {a.shape} vs {b.shape}"
    np.testing.assert_allclose(a, b, rtol=rtol, atol=atol, err_msg=what)


# ------------------------------------------------------------ effect sizes
def _es(case):
    d, n = REF["escalc"][case], case
    m = d["measure"]
    out = []
    for r in d["data"]:          # jsonlite writes data frames row-wise
        if n.startswith("bcg") or n.startswith("nielweise"):
            if n.startswith("bcg"):
                a, n1, c, n2 = r["tpos"], r["tpos"] + r["tneg"], r["cpos"], r["cpos"] + r["cneg"]
            else:
                a, n1, c, n2 = r["ai"], r["n1i"], r["ci"], r["n2i"]
            f = {"RR": S.log_risk_ratio, "OR": S.log_odds_ratio, "RD": S.risk_difference}[m]
            out.append(f(a, n1, c, n2, cc=0.5))
        elif n.startswith("normand"):
            args = (r["m1i"], r["sd1i"], r["n1i"], r["m2i"], r["sd2i"], r["n2i"])
            out.append({"MD": S.mean_difference, "ROM": S.log_response_ratio}.get(m, None)(*args) if m != "SMD" else S.smd(*args)[:2])
        elif n.startswith("molloy"):
            out.append(S.fisher_z(r["ri"], int(r["ni"])))
    return np.array(out), d


@pytest.mark.parametrize("case", list(REF["escalc"]))
def test_effect_sizes_match_escalc(case):
    got, d = _es(case)
    exp_y, exp_v = np.array(d["yi"], float), np.array(d["vi"], float)
    close(got[:, 0], exp_y, what=f"{case} yi")
    close(got[:, 1], exp_v, what=f"{case} vi")


def test_tiny_variances_our_reml_satisfies_estimating_equation():
    """Direction-of-error check for the loosened tolerance: OUR solution is the converged one."""
    d = REF["edge"]["tiny_variances"]; y, v = np.array(d["yi"]), np.array(d["vi"])
    t = S.tau2_estimate(y, v, "REML"); ys, vs, c = S._scale(y, v); X = np.ones((4, 1))
    assert abs(S._reml_score(t * c * c, ys, vs, X)) < 1e-12
    assert abs(S._reml_score(d["REML"]["tau2"] * c * c, ys, vs, X)) > abs(S._reml_score(t * c * c, ys, vs, X))


def test_tiny_sample_smd_matches_escalc():
    d = REF["edge"]["tiny_sample_smd"]; c = d["data"]
    got = np.array([S.smd(r["m1i"], r["sd1i"], r["n1i"], r["m2i"], r["sd2i"], r["n2i"])[:2] for r in c])
    close(got[:, 0], d["yi"], what="yi"); close(got[:, 1], d["vi"], what="vi")


# -------------------------------------------------------------- pooling
MODELS = {"common": ("common", None, False), "REML": ("random", "REML", False), "DL": ("random", "DL", False),
          "PM": ("random", "PM", False), "REML_knha": ("random", "REML", True),
          "DL_knha": ("random", "DL", True), "PM_knha": ("random", "PM", True)}


def pool_cases():
    for grp in ("pool", "edge"):
        for name, d in REF[grp].items():
            if "common" in d:
                for key in MODELS:
                    yield pytest.param(grp, name, key, id=f"{grp}:{name}:{key}")


@pytest.mark.parametrize("grp,name,key", list(pool_cases()))
def test_pooling_matches_metafor(grp, name, key):
    d = REF[grp][name]; ref = d[key]
    if name == "missing_rows":      # R fitted only the complete rows; we must drop the same rows, explicitly
        y, v, _, _ = S.drop_missing([x if x is not None else np.nan for x in d["y"]], [x if x is not None else np.nan for x in d["v"]])
    else:
        y, v = np.array(d["yi"], float), np.array(d["vi"], float)
    model, method, knha = MODELS[key]
    if "error" in ref:
        with pytest.raises((S.ConvergenceError, ValueError)):
            S.meta_analyze(y, v, model, method or "REML", knha)
        return
    r = S.meta_analyze(y, v, model, method or "REML", knha, pi_method="metafor")
    w = f"{grp}:{name}:{key}"
    ov = OVERRIDES.get(f"{grp}:{name}", {})
    loose = ov.get("rtol", RTOL); la = ov.get("atol", ATOL)
    close(r.est, ref["est"], rtol=loose, atol=la, what=w + " est"); close(r.se, ref["se"], rtol=loose, atol=la, what=w + " se")
    close(r.ci, ref["ci"], rtol=loose, atol=la, what=w + " ci"); close(r.z, ref["z"] if ref["z"] is not None else np.nan, rtol=max(loose, 1e-6), atol=la, what=w + " stat")
    if ref["se"] == 0:   # INTENTIONAL DEVIATION: metafor reports p=0 for an undefined statistic; we return NaN + warning
        assert math.isnan(r.p) and math.isnan(r.z) and r.notes
    else:
        close(r.p, ref["p"], rtol=max(loose, 1e-6), atol=1e-12, what=w + " p")
    close(r.tau2, ref["tau2"], rtol=max(loose, 1e-6), atol=1e-10 if not ov else 1e-14, what=w + " tau2")
    close(r.Q, ref["Q"], what=w + " Q"); close(r.Q_p, ref["Q_p"], rtol=1e-6, atol=1e-12, what=w + " Qp")
    close(r.weights, ref["weights_pct"], rtol=max(loose, 1e-6), what=w + " weights")
    if model == "random":
        close(r.I2_tau, ref["I2_tau"], rtol=max(loose, 1e-6), atol=1e-8, what=w + " I2(tau)")
        close(r.H2_tau, ref["H2_tau"], rtol=max(loose, 1e-6), atol=1e-8, what=w + " H2(tau)")
        if ref.get("pi_metafor") and ref["pi_metafor"][0] is not None:
            close(r.pred_int, ref["pi_metafor"], rtol=max(loose, 1e-6), atol=la, what=w + " PI(metafor convention)")
        if ref.get("pi_riley") is not None and not knha:
            r2 = S.meta_analyze(y, v, model, method, knha, pi_method="riley")
            close(r2.pred_int, ref["pi_riley"], rtol=max(loose, 1e-6), atol=la, what=w + " PI(Riley)")


@pytest.mark.parametrize("grp,name", [(g, n) for g in ("pool", "edge") for n, d in REF[g].items() if "leave1out_REML" in d])
def test_leave_one_out_matches_metafor_loop(grp, name):
    d = REF[grp][name]; ref = d["leave1out_REML"]
    y, v = np.array(d["yi"], float), np.array(d["vi"], float)
    got = np.array(S.leave_one_out(y, v, model="random", method="REML"))
    ov = OVERRIDES.get(f"{grp}:{name}", {}); rt = ov.get("rtol", RTOL); at = ov.get("atol", ATOL)
    close(got[:, 1], ref["est"], rtol=rt, atol=at, what="est"); close(got[:, 2], ref["ci_lb"], rtol=rt, atol=at, what="lb")
    close(got[:, 3], ref["ci_ub"], rtol=rt, atol=at, what="ub"); close(got[:, 4], ref["tau2"], rtol=max(rt, 1e-6), atol=1e-10 if not ov else 1e-14, what="tau2")


# ----------------------------------------------------- meta-regression
def _reg_cases():
    for name, d in REF["regression"].items():
        for key in ("REML", "DL", "PM", "REML_knha", "DL_knha", "PM_knha"):
            if key in d:
                yield pytest.param(name, key, id=f"{name}:{key}")


@pytest.mark.parametrize("name,key", list(_reg_cases()))
def test_meta_regression_matches_metafor(name, key):
    d = REF["regression"][name]; ref = d[key]
    y, v = np.array(d["yi"], float), np.array(d["vi"], float)
    X, names = S.design_matrix(**{k: v_ for k, v_ in d["mods"].items()})
    method = key.split("_")[0]; knha = key.endswith("knha")
    r = S.meta_regression(y, v, X, names, method, knha)
    close(r.beta, ref["beta"], what="beta"); close(r.se, ref["se"], what="se")
    close(r.stat, ref["stat"], what="stat"); close(r.p, ref["pval"], rtol=1e-6, atol=1e-12, what="p")
    close(r.ci[:, 0], ref["ci_lb"], what="ci_lb"); close(r.ci[:, 1], ref["ci_ub"], what="ci_ub")
    close(r.QM, ref["QM"], what="QM"); close(r.QM_p, ref["QMp"], rtol=1e-6, atol=1e-12, what="QMp")
    close(r.QE, ref["QE"], what="QE"); close(r.tau2, ref["tau2"], rtol=1e-6, atol=1e-10, what="tau2")
    close(r.R2, ref["R2"], rtol=1e-5, atol=1e-6, what="R2")
    close(r.I2_tau, ref["I2_tau"], rtol=1e-6, atol=1e-8, what="I2"); close(r.H2_tau, ref["H2_tau"], rtol=1e-6, atol=1e-8, what="H2")


# ---------------------------------------------------------- subgroups
def test_subgroup_estimates_and_moderator_test_match_metafor():
    d = REF["subgroup"]["bcg_alloc"]
    y, v, g = np.array(d["yi"], float), np.array(d["vi"], float), d["group"]
    res = S.subgroup_analysis(y, v, g, method="REML")
    for grp, ref in d["by_group"].items():
        r = res["groups"][grp]
        close(r.est, ref["est"], what=grp + " est"); close(r.se, ref["se"], what=grp + " se")
        close(r.tau2, ref["tau2"], rtol=1e-6, atol=1e-10, what=grp + " tau2")
    m = res["moderator_test"]; ref = d["mods_REML"]
    close(m.QM, ref["QM"], what="QM"); close(m.QM_p, ref["QMp"], rtol=1e-6, atol=1e-12, what="QMp")
    close(m.beta, ref["beta"], what="beta")
    # between-subgroup Q recomputed by hand from the per-group metafor fits (formula-level check)
    est = np.array([d["by_group"][k]["est"] for k in sorted(d["by_group"])]); se = np.array([d["by_group"][k]["se"] for k in sorted(d["by_group"])])
    w = 1 / se**2; Qb = np.sum(w * (est - np.sum(w * est) / np.sum(w)) ** 2)
    close(res["Q_between"], Qb, what="Q_between")


# --------------------------------------------------- invalid input / edge
def test_missing_rows_match_metafor_listwise_deletion():
    d = REF["edge"]["missing_rows"]
    y, v, kept, dropped = S.drop_missing([x if x is not None else np.nan for x in d["y"]], [x if x is not None else np.nan for x in d["v"]])
    assert list(kept + 1) == list(np.atleast_1d(d["kept"])) and len(dropped) == 2
    with pytest.raises(ValueError, match="drop_missing"):
        S.meta_analyze([0.2, np.nan, 0.5], [0.04, 0.05, 0.06])


@pytest.mark.parametrize("bad_v", [0.0, -0.1, np.inf])
def test_invalid_variances_rejected(bad_v):
    with pytest.raises(ValueError):
        S.meta_analyze([0.1, 0.2, 0.3], [0.1, bad_v, 0.1])


def test_regression_guards():
    y = np.array([0.1, 0.4, 0.3, 0.8]); v = np.array([0.1] * 4)
    X, n = S.design_matrix(x=[1, 2, 3, 4])
    with pytest.raises(ValueError, match="residual df"):
        S.meta_regression(y[:3], v[:3], X[:3], n)
    with pytest.raises(ValueError, match="collinear|rank"):
        S.meta_regression(np.arange(6.0), np.ones(6), np.column_stack([np.ones(6), np.arange(6.0), 2 * np.arange(6.0)]))


def test_result_independent_of_scale_of_data():
    """tau2 and SE scale with units; est/se ratio, I2, weights must not change."""
    y = np.array([0.2, 0.5, 0.8, 0.1]); v = np.array([0.04, 0.04, 0.16, 0.09])
    a = S.meta_analyze(y, v); b = S.meta_analyze(y * 1000, v * 1e6)
    close(b.est, a.est * 1000); close(b.tau2, a.tau2 * 1e6, rtol=1e-6); close(b.I2, a.I2); close(b.weights, a.weights)


def test_convergence_error_is_raised_not_swallowed():
    f = lambda t: 1.0  # never turns over
    with pytest.raises(S.ConvergenceError):
        S._bracket(f, 1.0, maxdoub=5)


def test_reference_provenance_recorded():
    m = REF["meta"]; assert m["metafor"] and m["R"].startswith("R version")


def test_bundled_bcg_dataset_identical_to_r_export():
    from metalab.datasets import BCG, BCG_ALLOC, BCG_ABLAT
    raw = REF["escalc"]["bcg_RR"]["data"]
    assert [(r["tpos"], r["tneg"], r["cpos"], r["cneg"]) for r in raw] == [tuple(x) for x in BCG]
    assert REF["subgroup"]["bcg_alloc"]["group"] == BCG_ALLOC
    assert REF["regression"]["bcg_ablat"]["mods"]["ablat"] == BCG_ABLAT
