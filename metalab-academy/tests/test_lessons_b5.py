"""Numbers quoted in v0.4 batch-5 lessons (54, 56, 57, 58, 60, 64, 66, 67, 68) are recomputed from code."""
import math, re
import pytest
from metalab import lessons, stats as S, workflow as W, references

LES = dict(lessons.load())
ans = lambda n, i: LES[n]["quiz"][i]["opts"][LES[n]["quiz"][i]["ans"]].replace("−", "-")
def has(n, *needles):
    t = LES[n]["worked_example"].replace("−", "-").replace("**", "")
    for x in needles: assert x.replace("−", "-").replace("**", "") in t, (n, x)

def test_54_kappa():
    r = W.cohens_kappa([1] * 11 + [0] * 9, [1] * 9 + [0] * 2 + [1] * 2 + [0] * 7)           # 9 yes/yes, 2 yes/no, 2 no/yes, 7 no/no
    r = W.cohens_kappa([1]*9+[1]*2+[0]*2+[0]*7, [1]*9+[0]*2+[1]*2+[0]*7); has(54, f"{r['kappa']:.3f}", "0.80", "0.505"); assert float(ans(54, 0)) == pytest.approx(r["kappa"], abs=5e-4)

def test_56_cca():
    N, r, c = 40, 25, 5; cca = (N - r) / (r * c - r); has(56, f"{cca:.2f}"); assert float(ans(56, 0)) == pytest.approx(cca)
    assert (125 - 25) / (25 * 5 - 25) == 1.0 and (25 - 25) / (125 - 25) == 0       # limiting cases quoted in the lesson

def test_57_nnt():
    for pc, nnt in ((.20, 20), (.02, 200)): assert 1 / (pc * (1 - .75)) == pytest.approx(nnt)
    has(57, "0.05", "20", "200", "0.005"); assert float(ans(57, 0)) == 20 and float(ans(57, 1)) == 200

def test_58_paf():
    p, rr = .2, 2.; paf = p * (rr - 1) / (1 + p * (rr - 1)); has(58, f"{paf:.4f}"); assert float(ans(58, 0)) == pytest.approx(paf, abs=5e-4)
    assert f"{0.05*1/1.05:.3f}" in LES[58]["worked_example"]

def test_60_lnrr():
    has(60, f"{math.log(2):.4f}", f"{math.log(2)*-.5:.4f}", f"{math.log(1.2):.4f}", f"{2**-.5:.3f}"); assert float(ans(60, 0)) == pytest.approx(math.log(2), abs=5e-4) and float(ans(60, 1)) == pytest.approx(math.log(1.2), abs=5e-4)

def test_64_hedges_g():
    g, v, j = S.smd(10.5, 1, 20, 10, 1, 20); has(64, f"{j:.4f}", f"{g:.4f}", f"{v:.4f}"); assert float(ans(64, 0)) == pytest.approx(g, abs=5e-4) and float(ans(64, 1)) == pytest.approx(v, abs=5e-4)
    g2, v2, j2 = S.smd(.80, .01, 5, .78, .01, 5); has(64, f"{j2:.4f}", f"{g2:.3f}")

def test_66_rescale():
    has(66, f"{1.10**(10/25):.4f}", f"{1.10**2:.2f}"); assert float(ans(66, 0)) == pytest.approx(1.10 ** .4, abs=5e-4)

def test_67_partial_r():
    t, df = 2.5, 40; r = t / math.sqrt(t * t + df); v = (1 - r * r) ** 2 / df; has(67, f"{r:.4f}", f"{v:.4f}", f"{math.sqrt(v):.3f}"); assert float(ans(67, 0)) == pytest.approx(r, abs=5e-4)

def test_68_seeds_vs_datasets():
    g, v, j = S.smd(.80, .01, 5, .78, .01, 5); has(68, f"{g:.3f}", f"{j:.4f}", f"{0.05/math.sqrt(10):.4f}", "1.26"); assert float(ans(68, 0)) == pytest.approx(g, abs=5e-4) and float(ans(68, 2)) == pytest.approx(.05 / math.sqrt(10), abs=5e-5)
    assert 0.02 / (0.05 / math.sqrt(10)) == pytest.approx(1.265, abs=5e-3)

def test_batch5_status_and_refs():
    for n in (54, 56, 57, 58, 60, 64, 66, 67, 68):
        assert "AI-drafted" in LES[n]["status"]
        for r in LES[n]["further"]: assert references.REFS[r]["verified"]

def test_replication_claims_registered_with_abstract_level_support():
    from metalab import claims
    got = {c["source_key"]: c for c in claims.CLAIMS if c["lesson"] == 64}
    assert got["osc2015"]["status"] == "abstract-supported" and got["kvarven2019"]["status"] == "abstract-supported"
