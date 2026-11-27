import importlib, numpy as np, pytest
from metalab import curriculum, references, resources, stats as S

from pathlib import Path as _Pth
from metalab import lessons as _lessons
LESSONS = dict(_lessons.load())
REQUIRED = ["objectives","prerequisites","why","plain","intermediate","advanced","assumptions","worked_example",
            "examples","mistakes","misconceptions","controversies","decision_tree","exercises","integrity",
            "further","application","checklist","quiz","time_min","version","last_verified","status"]

@pytest.mark.parametrize("n", LESSONS)
def test_lesson_structure(n):
    L = LESSONS[n]
    for k in REQUIRED:
        assert L.get(k), f"lesson {n} missing {k}"
    assert len(L["quiz"]) >= 5
    for q in L["quiz"]:
        assert 0 <= q["ans"] < len(q["opts"]) and q["why"]
    for r in L["further"]:
        assert r in references.REFS
    assert "AI-drafted" in L["status"]          # never claim expert review

def test_numeric_quiz_answers_match_code():
    y, v = np.array([0.2, 0.5, 0.8]), np.array([0.04, 0.04, 0.16])
    r = S.meta_analyze(y, v, "common")
    q = LESSONS[32]["quiz"]
    assert q[0]["opts"][q[0]["ans"]] == "0.40" and r.est == pytest.approx(0.40)
    assert q[1]["opts"][q[1]["ans"]] == "0.133" and r.se == pytest.approx(0.1333, abs=5e-4)
    assert r.ci[0] == pytest.approx(0.139, abs=1e-3) and r.ci[1] == pytest.approx(0.661, abs=1e-3)   # worked example text

def test_curriculum_counts_truthful():
    c = curriculum.counts()
    assert c["specified"] == 84 and c["proposed"] == 4 and c["total"] == 88 and c["drafted"] + c["outline"] == 88
    ids = [m["id"] for m in curriculum.MODULES]
    assert ids == list(range(1, 89))
    assert all(m.get("proposed") for m in curriculum.MODULES if m["id"] > 84)

def test_references_verified_fields():
    for k, r in references.REFS.items():
        assert r["verified"] and r["verified_on"] and (r["doi"] or r["pmid"])

def test_resources_never_claim_verification():
    for d in resources.RESOURCES + resources.ORGS:
        assert d["verified_on"] is None and d["url"].startswith("https://")


def test_topic_scan_is_honest():
    from metalab import topic_scan as T
    assert T.DATE == "2026-11-26" and T.DB.startswith("PubMed")
    ids = {s[0] for s in T.SEARCHES}
    assert len(ids) == len(T.SEARCHES)
    for c in T.CANDIDATES:
        assert set(c["signals"]) <= ids
    for s in T.SEARCHES:
        assert isinstance(s[4], int) and s[3].strip() and s[5].strip()
    # zero-hit searches must carry an explicit 'does not prove novelty' caveat
    assert all("NOT" in s[5] or "DO NOT" in s[5] for s in T.SEARCHES if s[4] == 0)


def test_claims_registry_integrity():
    from metalab import claims, references
    ids = [c["id"] for c in claims.CLAIMS]
    assert len(ids) == len(set(ids))
    for c in claims.CLAIMS:
        assert c["source_key"] in references.REFS or (c["source_key"] is None and c["source_type"].startswith("primary observation")), c["id"]
        assert c["human_review"] == "none"          # no claim is human-reviewed yet; change only with a real signed review
        assert c["supports_directly"] in ("yes", "partial", "unverified") or c["supports_directly"].startswith("yes")
        if c["supports_directly"] == "unverified":
            assert "UNVERIFIED" in c["status"] and "not examined" in c["examined"]
    assert len(claims.CORRECTIONS) >= 10


def test_all_references_have_ids_and_verification_dates():
    from metalab import references
    for k, r in references.REFS.items():
        assert r["verified_on"] and (r["doi"] or r["pmid"]), k


def test_numeric_quizzes_match_code():
    """Every quiz flagged numeric=True has its marked answer verified here against the stats engine."""
    from metalab import stats as S
    ans = lambda n, i: LESSONS[n]["quiz"][i]["opts"][LESSONS[n]["quiz"][i]["ans"]]
    # lesson 27
    assert S.mean_difference(12, 3, 10, 10, 2, 10)[1] == pytest.approx(float(ans(27, 0)))
    assert S.log_response_ratio(12, 3, 10, 10, 2, 10)[0] == pytest.approx(float(ans(27, 1)), abs=5e-4)
    assert S.sd_from_se(0.9, 16) == pytest.approx(float(ans(27, 4)))
    # lesson 35
    r = S.meta_analyze([0.10, 0.30, 0.55, 0.90], [0.02, 0.03, 0.025, 0.04], "common")
    assert r.I2 == pytest.approx(float(ans(35, 0).rstrip("%")), abs=0.1) and r.Q == pytest.approx(11.98, abs=0.01)
    r2 = S.meta_analyze([0.10, 0.30, 0.55, 0.90], [0.02, 0.03, 0.025, 0.04], "random", "REML")
    assert (r2.tau2, r2.pred_int[0], r2.pred_int[1]) == pytest.approx((0.0855, -1.006, 1.899), abs=2e-3)
    # lesson 18
    assert S.sd_from_se(0.9, 16) == pytest.approx(float(ans(18, 0)))
    assert S.se_from_ci(3.2, 6.8, 10) == pytest.approx(float(ans(18, 1)), abs=1e-3)
    assert S.combine_groups(12, 5.0, 2.0, 30, 7.0, 3.0)[2] == pytest.approx(float(ans(18, 3)), abs=5e-3)
    # lesson 10
    assert 15 / 20 == 0.75 and ans(10, 1) == "75%"


def test_lesson_numbers_in_text_match_code():
    from metalab import stats as S
    g, v_ls, j = S.smd(12, 3, 10, 10, 2, 10); v_b = S.smd(12, 3, 10, 10, 2, 10, vtype="borenstein")[1]
    t = LESSONS[27]["worked_example"]
    for needle in (f"{g:.3f}", f"{v_ls:.4f}", f"{v_b:.4f}", f"{j:.4f}"):
        assert needle in t, needle


def test_bcg_numbers_in_lesson35_come_from_r_reference():
    import json
    R = json.loads((_Pth(__file__).parent.parent / "validation" / "reference" / "reference.json").read_text())["pool"]["bcg_RR"]["REML"]
    t = LESSONS[35]["worked_example"]
    assert f"{R['tau2']:.4f}" in t and f"{R['I2_tau']:.2f}%" in t and f"{R['Q']:.2f}" in t


def _r_available():
    import shutil, subprocess
    return shutil.which("Rscript") and subprocess.run(["Rscript", "-e", "library(metafor)"], capture_output=True).returncode == 0


@pytest.mark.skipif(not _r_available(), reason="R + metafor not installed")
@pytest.mark.parametrize("n", [n for n, L in LESSONS.items() if L.get("coding") and "library(metafor)" in L["coding"]["r"]])
def test_lesson_r_code_runs(n):
    import subprocess
    r = subprocess.run(["Rscript", "-e", LESSONS[n]["coding"]["r"]], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr[-800:]


@pytest.mark.parametrize("n", [n for n, L in LESSONS.items() if L.get("coding")])
def test_lesson_python_code_runs(n):
    code = LESSONS[n]["coding"]["python"]
    exec(compile(code, f"lesson{n}", "exec"), {})


def test_batch1_numbers_match_code():
    import math
    from metalab import stats as S, workflow as W
    assert S.log_risk_ratio(15, 100, 25, 100) == pytest.approx((math.log(0.6), 1/15 - 1/100 + 1/25 - 1/100))
    y, v = S.log_odds_ratio(15, 100, 25, 100); assert math.exp(y) == pytest.approx(0.5294, abs=1e-4) and v == pytest.approx(0.1318, abs=1e-4)
    assert S.risk_difference(15, 100, 25, 100)[0] == pytest.approx(-0.10) and 1 / 0.10 == pytest.approx(10)
    assert S.log_odds_ratio(0, 20, 3, 20, cc=0.5)[0] == pytest.approx(-2.104, abs=1e-3)
    r1 = ["y"] * 25 + ["n"] * 25; r2 = ["y"] * 20 + ["n"] * 5 + ["y"] * 10 + ["n"] * 15
    assert W.cohens_kappa(["y"]*20+["y"]*5+["n"]*10+["n"]*15, ["y"]*20+["n"]*5+["y"]*10+["n"]*15)["kappa"] == pytest.approx(0.4)
    assert S.se_from_p(0.5, 0.05) == pytest.approx(0.2551, abs=1e-4) and S.se_from_p(0.5, 0.05, df=18) == pytest.approx(0.2380, abs=1e-4)
    assert 1.9 * math.sqrt(8) == pytest.approx(5.374, abs=1e-3) and 1176 / 24 == 49 and 1.2 * math.sqrt(8) == pytest.approx(3.394, abs=1e-3)
    assert 0.22 * 900 == pytest.approx(198)


def test_batch2_numbers_come_from_r_reference():
    import json, math
    R = json.loads((_Pth(__file__).parent.parent / "validation" / "reference" / "reference.json").read_text())
    t33, t34, t36, t37, t50 = (LESSONS[n]["worked_example"] for n in (33, 34, 36, 37, 50))
    mh = R["mh"]["bcg"]["OR"]; pe = R["peto"]["bcg"]["res"]; p = R["pool"]["bcg_RR"]
    assert f"{p['common']['est']:.3f}".replace("-", "−") in t33 and f"{p['REML']['est']:.4f}".replace("-", "−") in t33
    assert f"{math.exp(mh['est']):.3f}" in t33 and f"{math.exp(pe['est']):.3f}" in t33
    for m in ("REML", "PM", "DL"): assert f"{p[m]['tau2']:.4f}" in t34
    assert f"{p['REML']['est']:.4f}".replace("-", "−") in t34 and f"{p['REML_knha']['ci'][0]:.3f}".replace("-", "−") in t34 and f"{p['REML_knha']['ci'][1]:.3f}".replace("-", "−") in t34
    sg = R["subgroup"]["bcg_alloc"]; q = sg["mods_REML"]
    assert f"{q['QM']:.3f}" in t36 and f"{q['QMp']:.3f}" in t36
    for g in ("random", "alternate", "systematic"): assert f"{sg['by_group'][g]['est']:.3f}".replace("-", "−") in t36
    rg = R["regression"]["bcg_ablat"]["REML"]
    assert f"{rg['beta'][1]:.4f}".replace("-", "−") in t37 and f"{rg['QM']:.2f}" in t37 and f"{rg['tau2']:.4f}" in t37 and f"{rg['R2']:.1f}" in t37 and f"{rg['QE']:.2f}" in t37
    eg = R["bias"]["bcg_RR"]; assert f"{eg['egger']['z']:.2f}".replace("-", "−") in t50 and f"{eg['egger']['p']:.3f}" in t50 and f"{eg['begg']['p']:.3f}" in t50
    # BCG pooled RR prediction interval quoted in lesson 34
    from metalab import stats as S
    pi = np.exp(S.meta_analyze(p["yi"], p["vi"]).pred_int); assert f"{pi[0]:.2f}" in t34 and f"{pi[1]:.2f}" in t34
    ans = lambda n, i: LESSONS[n]["quiz"][i]["opts"][LESSONS[n]["quiz"][i]["ans"]]
    assert ans(34, 3) == "0.313" and ans(50, 2) == "0.189" and ans(37, 1) == "-0.029"
    assert ans(36, 1).startswith("1.77")


def test_lesson12_uses_real_logged_count():
    from metalab import topic_scan as T
    assert dict((s[0], s[4]) for s in T.SEARCHES)["S5"] == 869 and "869" in LESSONS[12]["worked_example"]


def test_batch3_numbers_match_code():
    import math
    from scipy import stats as st
    from metalab import stats as S, advanced as A
    assert A.design_effect(20, 0.10) == pytest.approx(2.9) and 100 / 2.9 == pytest.approx(34.48, abs=0.01)
    se = (math.log(0.94) - math.log(0.60)) / (2 * 1.959964); assert se == pytest.approx(0.1145, abs=1e-4) and math.log(0.75) == pytest.approx(-0.2877, abs=1e-4) and math.log(48 / 40) == pytest.approx(0.1823, abs=1e-4)
    d, sd = 0.08, math.hypot(0.04, 0.05); z = d / sd; assert sd == pytest.approx(0.064, abs=1e-3) and z == pytest.approx(1.25, abs=0.01) and 2 * st.norm.sf(z) == pytest.approx(0.21, abs=0.005)
    assert 2 * st.norm.sf(0.10 / 0.04) == pytest.approx(0.012, abs=5e-4) and 2 * st.norm.sf(0.02 / 0.05) == pytest.approx(0.69, abs=0.01)
    assert 9 / 60 + 9 / 60 == pytest.approx(0.30) and 9 / 60 + 9 / 30 == pytest.approx(0.45)
    y, v = S.log_response_ratio(4.8, 0.7, 6, 4.1, 0.6, 6); assert y == pytest.approx(0.1576, abs=1e-4) and v == pytest.approx(0.0071, abs=1e-4)
    assert math.log10(5.0e6) - math.log10(1.0e4) == pytest.approx(2.699, abs=1e-3) and A.design_effect(25, 0.10) == pytest.approx(3.4) and 100 / 3.4 == pytest.approx(29.41, abs=0.01)
    ans = lambda n, i: LESSONS[n]["quiz"][i]["opts"][LESSONS[n]["quiz"][i]["ans"]]
    assert ans(85, 0) == "2.9" and ans(86, 0) == "0.1145" and ans(87, 0) == "1.25" and ans(61, 0) == "0.158" and ans(62, 0) == "2.70" and ans(65, 0) == "3.4" and ans(38, 1) == "30"
