"""Numbers quoted in the v0.4 batch-4 lessons (modules 24-49) are recomputed from code or taken from the R reference."""
import json, math
from pathlib import Path
import numpy as np, pytest
from scipy import stats as st, special
from metalab import lessons, stats as S, advanced as A, advanced2 as B, datasets as DS

LES = dict(lessons.load())
R = json.loads((Path(__file__).parent.parent / "validation" / "reference" / "reference_v04.json").read_text())
ans = lambda n, i: LES[n]["quiz"][i]["opts"][LES[n]["quiz"][i]["ans"]].replace("−", "-")
def has(n, *needles):
    t = LES[n]["worked_example"].replace("−", "-").replace("**", "")
    for x in needles: assert x.replace("−", "-").replace("**", "") in t, (n, x)

def test_24_foundations():
    has(24, f"{math.log(2):.4f}", f"{-math.log(2):.4f}"); r = S.meta_analyze([.2, .5, .8], [.04, .04, .16], "common")
    assert r.est == pytest.approx(0.4) and 1 / 56.25 == pytest.approx(float(ans(24, 4)), abs=5e-5); has(24, "0.0178", "0.1333")
    assert math.sqrt(.3 ** 2 + .4 ** 2) == pytest.approx(float(ans(24, 1)))

def test_25_descriptives():
    se = 2 / math.sqrt(10); t = st.t.ppf(.975, 9); has(25, f"{se:.4f}", f"{t:.4f}", f"{t*se:.4f}"); assert float(ans(25, 0)) == pytest.approx(se, abs=5e-4) and float(ans(25, 1)) == pytest.approx(t * se, abs=5e-3)

def test_26_estimation():
    x = np.array([2, 4, 9.]); has(26, "8.667", "13", "26"); assert float(ans(26, 0)) == pytest.approx(x.var(), abs=5e-3) and float(ans(26, 1)) == x.var(ddof=1)

def test_29_correlation():
    z, v = S.fisher_z(.5, 28); se = math.sqrt(v); has(29, f"{z:.4f}", f"{v:.4f}", f"{math.tanh(z-1.96*se):.3f}", f"{math.tanh(z+1.96*se):.3f}", f"{2*.5/math.sqrt(.75):.4f}")
    assert float(ans(29, 0)) == pytest.approx(z, abs=5e-4) and float(ans(29, 1)) == pytest.approx(v, abs=5e-3) and float(ans(29, 2)) == pytest.approx(1.1547, abs=5e-4)

def test_30_rates():
    y, v = A.log_irr(10, 100, 15, 110); has(30, f"{math.exp(y):.4f}", f"{y:.4f}", f"{v:.4f}"); assert float(ans(30, 0)) == pytest.approx(math.exp(y), abs=5e-4) and float(ans(30, 1)) == pytest.approx(v, abs=5e-4)
    lh, se = B.loghr_from_ci(.75, .60, .94); assert float(ans(30, 2)) == pytest.approx(se, abs=5e-5)

def test_39_40_konstantopoulos():
    c = R["cr2"]["intercept"]; s2c, s2e = c["sigma2"]
    has(39, f"{c['beta']:.4f}", f"{s2c:.4f}", f"{s2e:.4f}", f"{s2c/(s2c+s2e):.3f}", f"{R['multivariate']['beta'][0]:.3f}", f"{R['multivariate']['beta'][1]:.3f}", f"{R['multivariate']['rho']:.3f}")
    assert float(ans(39, 0)) == pytest.approx(s2c / (s2c + s2e), abs=5e-4)
    has(40, f"{c['se']:.4f}", f"{c['tstat']:.3f}", f"{c['df']:.2f}", f"{c['p']:.3f}"); assert float(ans(40, 0)) == pytest.approx(c["df"], abs=5e-3)
    from metalab.datasets import KON_YI, KON_VI, KON_DISTRICT
    f = A.multilevel_meta(KON_YI, KON_VI, KON_DISTRICT); assert f["se"][0] == pytest.approx(0.0846, abs=5e-4)        # model-based SE quoted in lesson 40

def test_41_bayes():
    b = R["bayes"]["halfnormal_0.5"]; bc = R["bayes"]["halfcauchy_0.5"]
    has(41, f"{b['mu_median']:.3f}", f"{b['mu_ci'][0]:.3f}", f"{b['mu_ci'][1]:.3f}", f"{b['tau_median']:.3f}", f"{b['tau_ci'][0]:.3f}", f"{b['tau_ci'][1]:.3f}", f"{bc['mu_median']:.3f}", f"{bc['tau_median']:.3f}")
    ys, vs = zip(*[S.log_risk_ratio(a, a + b_, c, c + d, cc=0.5) for a, b_, c, d in DS.BCG]); r = B.bayes_meta(ys, vs, "halfnormal", .5)
    assert r["mu_median"] == pytest.approx(b["mu_median"], rel=2e-5) and float(ans(41, 0)) == pytest.approx(b["mu_median"], abs=5e-4)

def test_42_nma_numbers_and_pscores():
    a = DS.HASSELBLAD; x = np.array([t[2] for t in a], float); n = np.array([t[3] for t in a], float)
    r = B.nma([t[0] for t in a], [t[1] for t in a], np.log((x + .5) / (n - x + .5)), 1 / (x + .5) + 1 / (n - x + .5), reference="no_contact", model="random", higher_is_better=True)
    o = dict(zip(r["treatments"], np.exp(r["beta"].tolist() and np.concatenate([[0], r["beta"]])))); has(42, f"{o['ind_counseling']:.2f}", f"{o['grp_counseling']:.2f}", f"{o['self_help']:.2f}", f"{r['tau2']:.3f}", f"{r['Q']:.1f}")
    ps = r["pscore"]; has(42, f"{ps['no_contact']:.2f}", f"{ps['ind_counseling']:.2f}", f"{ps['grp_counseling']:.2f}"); assert 0.39 < ps["self_help"] < 0.41 and float(ans(42, 0)) == pytest.approx(o["ind_counseling"], abs=5e-3)

def test_43_naive_slope():
    d, y, v = np.array([1, 2.]), np.array([.2, .5]), np.array([.04, .04]); sl = (d * y / v).sum() / (d ** 2 / v).sum(); has(43, "0.24"); assert sl == pytest.approx(.24) and float(ans(43, 0)) == pytest.approx(sl)

def test_44_dta():
    tp, fn, fp, tn = 45, 5, 8, 92; se, sp = tp / (tp + fn), tn / (tn + fp); has(44, "103.5", "11.25", "0.1087", "0.90", "0.92")
    assert tp * tn / (fn * fp) == pytest.approx(float(ans(44, 0))) and se / (1 - sp) == pytest.approx(float(ans(44, 1)))
    d = R["dta"]; has(44, f"{d['sens']:.3f}", f"{d['spec']:.3f}", f"{d['rho']:.3f}".replace("-", "−"))

def test_45_cstat():
    c = .75; has(45, f"{special.logit(c):.4f}", f"{.02/(c*(1-c)):.4f}"); assert float(ans(45, 0)) == pytest.approx(special.logit(c), abs=5e-4) and float(ans(45, 1)) == pytest.approx(.02 / (c * (1 - c)), abs=5e-5)

def test_46_ipd():
    ts, os_ = R["ipd"]["two_stage"], R["ipd"]["one_stage_lme4"]; has(46, f"{ts['pooled']:.4f}", f"{ts['pooled_se']:.4f}", f"{ts['tau2']:.4f}", f"{os_['fixed'][1]:.4f}", f"{abs(ts['pooled']-os_['fixed'][1]):.4f}"); assert float(ans(46, 0)) == pytest.approx(ts["pooled"], abs=5e-4)

def test_47_prevalence():
    y, v = A.proportion_es(12, 80, "PLO"); yf, vf = A.proportion_es(12, 80, "PFT"); has(47, f"{y:.4f}", f"{v:.5f}", f"{yf:.4f}", f"{vf:.6f}", "0.15"); assert float(ans(47, 0)) == pytest.approx(y, abs=5e-4) and float(ans(47, 1)) == pytest.approx(v, abs=5e-4)

def test_48_cc():
    cc = R["cc"]["nielweise"]; vals = [cc[f"OR_{a}"]["est"] for a in ("0.01", "0.1", "0.5", "1")]; has(48, *[f"{x:.3f}".replace("-", "−") for x in vals]); has(48, "0.0022", "0.0139")
    assert [round(math.exp(x), 2) for x in vals] == [0.43, 0.41, 0.38, 0.39] and float(ans(48, 0)) == pytest.approx(vals[2], abs=5e-4)

def test_49_trimfill_and_power():
    import re
    tf = R["trimfill"]; got = re.findall(r"\*\*(\d)\*\*[^;]*?\(R0: (\d)\)", LES[49]["worked_example"]); exp = [(str(tf[k]["L0"]["k0"]), str(tf[k]["R0"]["k0"])) for k in ("bcg_RR", "raudenbush", "bangertdrowns", "hackshaw", "normand_SMD")]
    assert got == exp, (got, exp)
    v = B.smd_variance(30, 30, .3); assert f"{v:.4f}" in LES[49]["worked_example"] + " " + " ".join(LES[49]["exercises"])
    assert f"{B.power_meta(.3, v, 10, .02):.3f}" in LES[49]["worked_example"] and f"{B.power_meta(.3, v, 20, .02):.3f}" in LES[49]["worked_example"]
    assert [B.k_for_power(.3, v, t) for t in (0, .02, .1)] == [6, 8, 15]; assert float(ans(49, 0)) == tf["bcg_RR"]["L0"]["k0"]

def test_lessons_cite_only_verified_refs_and_are_labelled_ai_drafted():
    from metalab import references
    for n in (24, 25, 26, 29, 30, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49):
        assert "AI-drafted" in LES[n]["status"]
        for r in LES[n]["further"]: assert r in references.REFS and references.REFS[r]["verified"]


def test_89_90_numbers():
    import math
    from scipy import stats as st
    L = lessons.load(); L = dict(L)
    se = (math.log(1.37) - math.log(1.17)) / (2 * 1.959964); z = math.log(1.27) / se
    t = L[89]["worked_example"].replace("**", "")
    for x in (f"{se:.4f}", f"{math.log(1.27):.4f}", f"{z:.2f}"): assert x in t
    se2 = (math.log(2.93) - math.log(.64)) / (2 * 1.959964); assert f"{se2:.3f}" in t and f"{math.log(1.37)/se2:.2f}" in t and f"{2*st.norm.sf(math.log(1.37)/se2):.2f}" in t
    assert float(L[89]["quiz"][0]["opts"][0]) == pytest.approx(se, abs=5e-5)
    t90 = L[90]["worked_example"].replace("**", ""); assert "0.02" in t90 and "0.06" in t90 and "50" in t90 and "16.7" in t90 and round(1 / .06, 1) == 16.7
    from metalab import claims
    assert any(c["lesson"] == 43 and c["source_key"] == "orsini2012" for c in claims.CLAIMS)
