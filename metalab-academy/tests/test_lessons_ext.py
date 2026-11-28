"""Numbers added by content/extensions.py are recomputed from code / the R reference."""
import math, json
from pathlib import Path
import numpy as np, pytest
from scipy import stats as sps
from metalab import lessons, lesson_audit, stats as S, advanced as A, advanced2 as B, datasets as DS, references, workflow as W

L = dict(lessons.load()); R = json.loads((Path(__file__).parent.parent / "validation" / "reference" / "reference_v04.json").read_text())
ys, vs = zip(*[S.log_risk_ratio(a, a + b, c, c + d) for a, b, c, d in DS.BCG]); y, v = np.array(ys), np.array(vs)
txt = lambda n: (L[n]["intermediate"]).replace("−", "-").replace("**", "")
ans = lambda n, i: L[n]["quiz"][i]["opts"][L[n]["quiz"][i]["ans"]].replace("−", "-")
def has(n, *xs):
    t = txt(n)
    for x in xs: assert x.replace("−", "-") in t, (n, x)

def test_33_common_vs_random():
    c = S.meta_analyze(y, v, "common"); r = S.meta_analyze(y, v, "random", "REML"); has(33, f"{c.est:.3f}", f"{c.se:.4f}", f"{c.Q:.2f}", f"{r.est:.3f}", f"{r.se:.3f}", f"{r.tau2:.3f}", f"±{1.96*c.se:.3f}", f"±{1.96*r.se:.3f}")
    assert float(ans(33, -1)) == pytest.approx(c.est, abs=5e-4) and f"{math.exp(c.est):.2f}" in txt(33) and f"{math.exp(r.est):.2f}" in txt(33)

def test_34_estimators_and_intervals():
    t = {m: S.meta_analyze(y, v, "random", m).tau2 for m in ("DL", "REML", "PM")}; h = S.meta_analyze(y, v, "random", "REML", hksj=True); w = S.meta_analyze(y, v, "random", "REML")
    has(34, f"{t['DL']:.3f}", f"{t['REML']:.3f}", f"{t['PM']:.3f}", f"{h.ci[0]:.3f}", f"{h.ci[1]:.3f}", f"{w.ci[0]:.3f}", f"{w.ci[1]:.3f}", f"{w.pred_int[0]:.3f}", f"{w.pred_int[1]:.3f}")
    mp = S.meta_analyze(y, v, "random", "REML", pi_method="metafor").pred_int; has(34, f"{mp[0]:.3f}", f"{mp[1]:.3f}"); q = A.tau2_ci_qprofile(y, v); has(34, f"{q['tau2'][0]:.3f}", f"{q['tau2'][1]:.3f}", f"{q['I2'][0]:.1f}", f"{q['I2'][1]:.1f}")
    assert float(ans(34, -2)) == pytest.approx(h.ci[0], abs=5e-4) and float(ans(34, -1)) == pytest.approx(t["PM"], abs=5e-4)
    from metalab import encyclopedia as E; assert E.run_command(next(c for c in E.COMMANDS if c["id"] == "hksj"), "py")[2] == pytest.approx(h.ci[0])

def test_36_subgroups():
    s = S.subgroup_analysis(y, v, DS.BCG_ALLOC, method="REML"); g = s["groups"]
    has(36, f"{g['random'].est:.3f}", f"{g['systematic'].est:.3f}", f"{g['alternate'].est:.3f}", f"{s['Q_between']:.2f}", f"{s['Q_between_p']:.2f}", f"{s['moderator_test'].QM:.2f}", f"{s['moderator_test'].QM_p:.2f}")
    assert [g[k].k for k in ("random", "systematic", "alternate")] == [7, 4, 2] and float(ans(36, -1)) == pytest.approx(s["Q_between_p"], abs=5e-3)

def test_37_meta_regression():
    X = np.column_stack([np.ones(13), DS.BCG_ABLAT]); m = S.meta_regression(y, v, X, method="REML")
    has(37, f"{m.beta[0]:.3f}", f"{m.beta[1]:.4f}", f"{m.se[1]:.4f}", f"{m.ci[1][0]:.4f}", f"{m.ci[1][1]:.4f}", f"{m.QM:.2f}", f"{m.tau2:.4f}", f"{m.R2:.1f}%", f"{m.QE:.2f}", f"{m.QE_p:.4f}", f"{min(DS.BCG_ABLAT)}", f"{max(DS.BCG_ABLAT)}")
    assert float(ans(37, -2)) == pytest.approx(m.beta[1], abs=5e-5) and float(ans(37, -1).rstrip("%")) == pytest.approx(m.R2, abs=0.05)
    from metalab import encyclopedia as E; assert E.run_command(next(c for c in E.COMMANDS if c["id"] == "metareg"), "py")[1] == pytest.approx(m.beta[1])

def test_38_shared_control_variance_statement():
    sd, n = 2.0, 10; assert sd ** 2 / n == pytest.approx(0.4)          # control contribution to Var(mean difference) used for the covariance statement

def test_50_publication_bias_numbers():
    e = A.egger_test(y, v); b = A.begg_test(y, v); tf = B.trim_fill(y, v, "L0"); tr = B.trim_fill(y, v, "R0"); pp = B.pet_peese(y, v)
    has(50, f"{e['intercept']:.3f}", f"{e['se']:.3f}", f"{e['t']:.2f}", f"{e['p']:.3f}", f"{b['tau']:.3f}", f"{b['p']:.2f}", f"{tf['est']:.3f}", f"{S.meta_analyze(y, v, 'random', 'REML').est:.3f}", f"{pp['pet']['coef'][0]:.2f}", f"{pp['peese']['coef'][0]:.2f}")
    assert tf["k0"] == 1 and tr["k0"] == 0 and float(ans(50, -1)) == pytest.approx(e["p"], abs=5e-4)
    assert R["petpeese"]["bcg_RR"]["pet"]["coef"][0] == pytest.approx(pp["pet"]["coef"][0]) and R["trimfill"]["bcg_RR"]["L0"]["est"] == pytest.approx(tf["est"], rel=3e-4)

def test_51_leave_one_out_and_influence():
    loo = [x[1] for x in S.leave_one_out(y, v, model="random", method="REML")]; inf = A.influence_diagnostics(y, v); top = max(inf, key=lambda d: abs(d["rstudent"]))
    has(51, f"{min(loo):.3f}", f"{max(loo):.3f}", f"{math.exp(min(loo)):.2f}", f"{math.exp(max(loo)):.2f}", f"{top['rstudent']:.2f}", f"{top['cook']:.3f}", f"{top['hat']:.3f}", f"{top['weight_pct']:.1f}%")
    assert top["i"] + 1 == 4 and float(ans(51, -1)) == pytest.approx(max(loo), abs=5e-4) and all(x < 0 for x in loo)

def test_52_grade_illustration_numbers():
    r = S.meta_analyze(y, v, "random", "REML"); h = S.meta_analyze(y, v, "random", "REML", hksj=True); rr = math.exp(r.est); X = np.column_stack([np.ones(13), DS.BCG_ABLAT]); m = S.meta_regression(y, v, X, method="REML")
    has(52, f"{rr:.2f}", f"{r.I2:.0f}%", f"{math.exp(r.pred_int[0]):.2f}", f"{math.exp(r.pred_int[1]):.2f}", f"{math.exp(h.ci[0]):.2f}", f"{math.exp(h.ci[1]):.2f}", f"{100*0.10*(1-0.49):.1f}", "196")
    assert 0.10 * (1 - 0.49) == pytest.approx(float(ans(52, -1))) and round(1 / (0.01 * (1 - 0.49))) == 196 and round(m.R2) == 76

def test_53_vote_counting():
    k = int((y < 0).sum()); p = sps.binomtest(k, 13, 0.5).pvalue; has(53, f"**{k}**".replace("**", ""), f"{p:.3f}"); assert k == 11 and float(ans(53, -1)) == pytest.approx(p, abs=5e-4)

def test_74_interpretation_sentence_numbers():
    r = S.meta_analyze(y, v, "random", "REML"); h = S.meta_analyze(y, v, "random", "REML", hksj=True)
    has(74, f"{math.exp(r.est):.2f}", f"{math.exp(h.ci[0]):.2f}", f"{math.exp(h.ci[1]):.2f}", f"{r.tau2:.2f}", f"{r.I2:.0f}%", f"{math.exp(r.pred_int[0]):.2f}", f"{math.exp(r.pred_int[1]):.2f}"); assert float(ans(74, -1)) == pytest.approx(math.exp(r.pred_int[1]), abs=5e-3)

def test_31_conversions():
    assert 2 * 0.5 / math.sqrt(1 - 0.25) == pytest.approx(1.1547, abs=5e-4)
    rr = lambda orr, p0: orr / (1 - p0 + p0 * orr); assert round(rr(2, 0.1), 1) == 1.8 and round(rr(2, 0.8), 1) == 1.1; assert math.log(2) * math.sqrt(3) / math.pi == pytest.approx(0.382, abs=5e-4)

def test_process_lessons_arithmetic():
    assert (22 / 100, 900 * 0.22) == (0.22, 198.0) and float(ans(6, -1)) == 198
    a = [1] * 20 + [1] * 5 + [0] * 10 + [0] * 15; b = [1] * 20 + [0] * 5 + [1] * 10 + [0] * 15; assert W.cohens_kappa(a, b)["kappa"] == pytest.approx(0.40) and float(ans(15, -1)) == 0.40
    assert (120 - 20, 100 - 80, 20 - 12) == (100, 20, 8) and int(ans(16, -1)) == 8
    assert 8 / 40 == 0.2 and 7 / 8 == 0.875 and ans(20, -1) == "87.5%"
    ident, uniq = 260, 190; assert round(100 * (ident - uniq) / ident, 1) == 26.9 and "27%" in ans(14, -1) and "70" in L[14]["intermediate"]
    assert 8 / 10 == 0.8 and ans(5, -1) == "80%" and sum(w * y_ for w, y_ in zip([25, 25, 6.25], [.2, .5, .8])) / 56.25 == pytest.approx(0.4) and ans(3, -1) == "0.40"
    assert 1 + 24 * 0.1 == pytest.approx(3.4) and round(100 / 3.4) == 29 and "**3.4**" in L[65]["intermediate"] and "29" in L[65]["intermediate"]
    assert round(math.log(12 / 10), 3) == 0.182 and ans(63, -1) == "0.182"

def test_extensions_do_not_remove_original_content_and_audit_improves():
    s = lesson_audit.summary(); assert s["substantive"] >= 85 and s["expert_reviewed"] == 0
    for n in (34, 36, 37, 50): assert "Worked" in L[n]["intermediate"] or "worked" in L[n]["intermediate"].lower()
    for n, l in L.items(): assert "AI-drafted" in l["status"] and all(r in references.REFS for r in l["further"])
    from metalab import assessments as AS
    assert len(AS.exam(sorted(L), 2)) >= 2 * len(L) - 5
