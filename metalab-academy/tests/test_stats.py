"""Statistical validation tests.

Reference sources and honesty notes
-----------------------------------
* BCG (Colditz 1994) dataset = metafor::dat.bcg. Reference values for the
  REML random-effects model on log risk ratios were recalled from the metafor
  documentation/Viechtbauer (2010) and must be re-confirmed by running R
  (status: 'recalled-reference, pending R confirmation').
* Independent checks (no R needed): brute-force numerical REML likelihood
  maximisation, closed-form hand calculations, and internal identities.
"""
import math
import numpy as np
import pytest
from metalab import stats as S

from metalab.datasets import BCG


def bcg_es():
    y, v = [], []
    for tp, tn, cp, cn in BCG:
        e, var = S.log_risk_ratio(tp, tp + tn, cp, cp + cn)
        y.append(e); v.append(var)
    return np.array(y), np.array(v)


def test_hedges_g_hand_calc():
    g, v, j = S.smd(10, 2, 20, 8, 2, 20, vtype="borenstein")
    d = 1.0
    assert j == pytest.approx(S.hedges_j(38)) and abs(j - S.hedges_j_approx(38)) < 1e-4  # approximation fine at df=38
    assert g == pytest.approx(j * d)
    assert v == pytest.approx(j**2 * (40 / 400 + 1 / 80))


def test_lnor_hand_calc():
    e, v = S.log_odds_ratio(10, 50, 5, 50)
    assert e == pytest.approx(math.log((10 * 45) / (40 * 5)))
    assert v == pytest.approx(1/10 + 1/40 + 1/5 + 1/45)


def test_lnrr_hand_calc():
    e, v = S.log_response_ratio(12, 3, 10, 10, 2, 10)
    assert e == pytest.approx(math.log(1.2))
    assert v == pytest.approx(9/(10*144) + 4/(10*100))


def test_lnrr_rejects_nonpositive():
    with pytest.raises(ValueError):
        S.log_response_ratio(0, 1, 5, 2, 1, 5)


def test_zero_cell_requires_correction():
    with pytest.raises(ValueError):
        S.log_odds_ratio(0, 20, 3, 20)
    e, v = S.log_odds_ratio(0, 20, 3, 20, cc=0.5)
    assert math.isfinite(e) and v > 0


def test_combine_groups_matches_pooled_data():
    rng = np.random.default_rng(0)
    a, b = rng.normal(5, 2, 12), rng.normal(7, 3, 30)
    n, m, sd = S.combine_groups(12, a.mean(), a.std(ddof=1), 30, b.mean(), b.std(ddof=1))
    allx = np.concatenate([a, b])
    assert (n, m, sd) == (42, pytest.approx(allx.mean()), pytest.approx(allx.std(ddof=1)))


def test_se_ci_roundtrip():
    se = S.se_from_ci(1.0 - 1.96 * 0.3, 1.0 + 1.96 * 0.3)
    assert se == pytest.approx(0.3, rel=1e-3)
    assert S.sd_from_se(S.se_from_sd(4, 25), 25) == pytest.approx(4)


def test_fisher_z():
    z, v = S.fisher_z(0.5, 23)
    assert z == pytest.approx(math.atanh(0.5)) and v == pytest.approx(1 / 20)


def test_common_effect_hand_calc():
    y = np.array([0.0, 1.0]); v = np.array([1.0, 1.0])
    r = S.meta_analyze(y, v, model="common")
    assert r.est == pytest.approx(0.5) and r.se == pytest.approx(math.sqrt(0.5))
    assert r.Q == pytest.approx(0.5) and r.I2 == 0.0


def test_dl_hand_calc():
    y = np.array([0.1, 0.5, 0.9]); v = np.array([0.04, 0.04, 0.04])
    # Q = 8*... compute directly
    Q = np.sum((y - y.mean()) ** 2 / 0.04)
    c = 3 * 25 - 3 * 625 / 75
    assert S.tau2_dl(y, v) == pytest.approx(max(0, (Q - 2) / c))


def test_reml_matches_bruteforce_likelihood():
    y, v = bcg_es()
    grid = np.linspace(0, 2, 200001)
    def ll(t):
        w = 1 / (v + t); mu = (w * y).sum() / w.sum()
        return -0.5 * (np.log(v + t).sum() + np.log(w.sum()) + (w * (y - mu) ** 2).sum())
    best = grid[np.argmax([ll(t) for t in grid[::100]]) * 100]
    assert S.tau2_reml(y, v) == pytest.approx(best, abs=2e-3)


def test_pm_satisfies_defining_equation():
    y, v = bcg_es()
    t = S.tau2_pm(y, v)
    w = 1 / (v + t); mu = (w * y).sum() / w.sum()
    assert (w * (y - mu) ** 2).sum() == pytest.approx(len(y) - 1, abs=1e-6)


def test_bcg_published_reference_values():
    """metafor::rma(yi,vi,method='REML') on dat.bcg log RR (recalled reference:
    est -0.7145, se 0.1798, tau2 0.3132, I2 92.22%, Q 152.23 on 12 df)."""
    y, v = bcg_es()
    r = S.meta_analyze(y, v, "random", "REML")
    assert r.est == pytest.approx(-0.7145, abs=5e-4)
    assert r.se == pytest.approx(0.1798, abs=5e-4)
    assert r.tau2 == pytest.approx(0.3132, abs=5e-4)
    assert r.Q == pytest.approx(152.2330, abs=5e-2)
    assert r.Q_df == 12


def test_hksj_wider_than_wald_for_bcg():
    y, v = bcg_es()
    a = S.meta_analyze(y, v, "random", "REML")
    b = S.meta_analyze(y, v, "random", "REML", hksj=True)
    assert b.ci[1] - b.ci[0] > a.ci[1] - a.ci[0]


def test_prediction_interval_contains_ci():
    y, v = bcg_es()
    r = S.meta_analyze(y, v)
    assert r.pred_int[0] < r.ci[0] and r.pred_int[1] > r.ci[1]


def test_weights_sum_to_100_and_validation():
    y, v = bcg_es()
    assert S.meta_analyze(y, v).weights.sum() == pytest.approx(100)
    with pytest.raises(ValueError):
        S.meta_analyze([1.0], [1.0])
    with pytest.raises(ValueError):
        S.meta_analyze([1, 2], [0.0, 1.0])


def test_zero_heterogeneity_random_equals_common():
    y = np.array([0.5, 0.5, 0.5]) + np.array([0.01, -0.01, 0.0]); v = np.ones(3)
    assert S.meta_analyze(y, v, "random", "DL").est == pytest.approx(S.meta_analyze(y, v, "common").est)


def test_leave_one_out_length():
    y, v = bcg_es()
    assert len(S.leave_one_out(y, v)) == 13


def test_ci_coverage_near_nominal():
    cov, lo, hi = S.ci_coverage(0, 1, 10, reps=4000)
    assert 0.94 < cov < 0.96


def test_sd_stable_se_shrinks():
    out = S.simulate_sd_vs_se(0, 2, [5, 50, 500], reps=1500)
    assert out[0][2] > out[2][2] * 5
    assert abs(out[2][1] - 2) < 0.1
    for n, sd, se, emp in out:
        assert se == pytest.approx(emp, rel=0.1)


def test_hedges_j_exact_vs_approx():
    assert S.hedges_j(2) == pytest.approx(0.5641895835, abs=1e-9)   # = Gamma(1)/(sqrt(1)*Gamma(1/2)) = 1/sqrt(pi)
    assert abs(S.hedges_j(2) - S.hedges_j_approx(2)) > 5e-3          # approximation is poor for tiny df
    assert S.hedges_j(1000) == pytest.approx(S.hedges_j_approx(1000), abs=1e-6)


def test_smd_variance_types_documented_difference():
    gL, vL, _ = S.smd(5, 1, 2, 4, 1.1, 2, vtype="LS")
    gB, vB, j = S.smd(5, 1, 2, 4, 1.1, 2, vtype="borenstein")
    assert gL == gB and vL == pytest.approx(1 / 2 + 1 / 2 + gL**2 / 8) and vB != pytest.approx(vL, rel=1e-3)
    with pytest.raises(ValueError):
        S.smd(5, 1, 20, 4, 1, 20, vtype="x")


def test_se_from_p():
    assert S.se_from_p(0.5, 0.05) == pytest.approx(0.5 / 1.959964, rel=1e-6)
    assert S.se_from_p(0.5, 0.05, df=9) == pytest.approx(0.5 / 2.262157, rel=1e-6)
    for bad in (0.0, 1.0, -0.1):
        with pytest.raises(ValueError): S.se_from_p(0.5, bad)
    with pytest.raises(ValueError): S.se_from_p(0, 0.05)
