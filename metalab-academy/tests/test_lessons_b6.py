"""Numbers quoted in v0.4 batch-6 lessons (69-73, 79-81, 83, 84, 88) are recomputed from code, R reference or the logged topic scan."""
import hashlib, json, math, subprocess, shutil
from pathlib import Path
import numpy as np, pytest
from metalab import lessons, stats as S, references, topic_scan as T

LES = dict(lessons.load()); ROOT = Path(__file__).parent.parent
R1 = json.loads((ROOT / "validation" / "reference" / "reference.json").read_text())
ans = lambda n, i: LES[n]["quiz"][i]["opts"][LES[n]["quiz"][i]["ans"]].replace("−", "-")
def has(n, *needles):
    t = LES[n]["worked_example"].replace("−", "-").replace("**", "")
    for x in needles: assert x.replace("−", "-").replace("**", "") in t, (n, x)
def txt(n): return (LES[n]["plain"] + LES[n]["intermediate"]).replace("−", "-").replace("**", "")

def test_69_weighted_mean():
    r = S.meta_analyze([.2, .5, .8], [.04, .04, .16], "common"); has(69, "0.4", "0.01778", "0.1333"); assert float(ans(69, 0)) == pytest.approx(r.est) and float(ans(69, 1)) == pytest.approx(r.se, abs=5e-5)

def test_70_71_bcg_reference():
    p = R1["pool"]["bcg_RR"]["REML"]
    assert f"{p['est']:.4f}" in txt(70) + LES[70]["worked_example"].replace("−", "-") and f"{p['tau2']:.4f}" in LES[70]["worked_example"] and f"{p['I2_tau']:.2f}" in LES[70]["worked_example"] and f"{p['Q']:.2f}" in LES[70]["worked_example"]
    assert f"{p['se']:.4f}" in LES[70]["worked_example"] and f"{math.exp(p['est']):.3f}" in LES[70]["worked_example"]
    assert float(ans(70, 0)) == pytest.approx(p["tau2"], abs=5e-4) and float(ans(70, 1)) == pytest.approx(math.exp(p["est"]), abs=5e-4) and float(ans(71, 0)) == pytest.approx(p["I2_tau"], abs=5e-3)
    has(71, f"{p['est']:.4f}", f"{p['tau2']:.4f}", f"{p['I2_tau']:.2f}"); pil = p["pi_metafor"]; assert f"{pil[0]:.3f}" in LES[70]["worked_example"].replace("−", "-") and f"{pil[1]:.3f}" in LES[70]["worked_example"]

def test_72_deterministic_checks():
    assert f"{float(np.random.default_rng(1).normal()):.4f}" in LES[72]["worked_example"]; assert hashlib.sha256(b"abc").hexdigest() in LES[72]["worked_example"]; assert ans(72, 0) == hashlib.sha256(b"abc").hexdigest()[:8]
    if shutil.which("Rscript"):
        out = subprocess.run(["Rscript", "-e", "set.seed(1); cat(round(rnorm(1), 4))"], capture_output=True, text=True).stdout.strip()
        assert out == "-0.6265" and "-0.6265" in LES[72]["coding"]["r"]

def test_73_four_study_example():
    y, v = [.1, .3, .55, .9], [.02, .03, .025, .04]; r = S.meta_analyze(y, v, "random", "REML"); c = S.meta_analyze(y, v, "common")
    has(73, f"{c.est:.4f}", f"{r.est:.4f}", f"{r.tau2:.4f}", f"{r.I2_tau:.2f}", f"{r.I2:.2f}", f"{r.pred_int[0]:.3f}", f"{r.pred_int[1]:.3f}"); assert float(ans(73, 0)) == pytest.approx(r.est, abs=5e-4)

def test_79_flow_arithmetic():
    ident, dup = 1200, 300; scr = ident - dup; ft = scr - 800; inc = ft - 70; assert (scr, ft, inc) == (900, 100, 30); has(79, "900", "100", "30"); assert int(ans(79, 0)) == inc

def test_80_ppv():
    ppv = lambda R, p, a=.05: p * R / (p * R + a); has(80, f"{ppv(.1,.8):.3f}", f"{ppv(.1,.2):.3f}", f"{ppv(.01,.2):.3f}"); assert float(ans(80, 0)) == pytest.approx(ppv(.1, .8), abs=5e-4) and float(ans(80, 1)) == pytest.approx(ppv(.1, .2), abs=5e-4)
    assert "1.97%" in LES[80]["plain"] and "14.12%" in LES[80]["plain"]

def test_81_recall():
    assert 95 / 100 == float(ans(81, 0)) and 1 - 1000 / 4000 == float(ans(81, 1)); has(81, "0.95", "0.75", "95/100")
    assert "cites no performance figures" in LES[81]["advanced"]

def test_83_kappa():
    from metalab import workflow as W
    a = [1] * 10 + [0] * 30 + [1] * 6 + [0] * 4; b = [1] * 10 + [0] * 30 + [0] * 6 + [1] * 4; k = W.cohens_kappa(a, b)
    has(83, f"{k['kappa']:.3f}", f"{k['po']:.2f}", f"{k['pe']:.4f}"); assert float(ans(83, 0)) == pytest.approx(k["kappa"], abs=5e-4)

def test_84_rubric_arithmetic():
    assert 13 * 2 == int(ans(84, 0)) and round(100 * 21 / 26, 1) == 80.8; has(84, "26", "80.8")

def test_88_topic_scan_numbers_come_from_log():
    n = {s[0]: s[4] for s in T.SEARCHES}
    assert (n["S2"], n["S3"], n["S4"], n["S5"], n["S18"], n["S1"]) == (29, 206, 2, 869, 1340, 4); assert f"{n['S3']/n['S2']:.1f}" in LES[88]["worked_example"] and float(ans(88, 0)) == pytest.approx(n["S3"] / n["S2"], abs=0.05)
    assert f"{len(T.SEARCHES)} logged PubMed searches" in LES[88]["intermediate"]; s18 = [s for s in T.SEARCHES if s[0] == "S18"][0]; assert "INVALID" in s18[5] and "STEM" in s18[5]

def test_batch6_status_and_refs():
    for n in (69, 70, 71, 72, 73, 79, 80, 81, 83, 84, 88):
        assert "AI-drafted" in LES[n]["status"]
        for r in LES[n]["further"]: assert references.REFS[r]["verified"]
