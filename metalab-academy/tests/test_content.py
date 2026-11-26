import importlib, numpy as np, pytest
from metalab import curriculum, references, resources, stats as S

import pkgutil
from pathlib import Path as _Pth
LESSONS = {}
for _m in pkgutil.iter_modules([str(_Pth(__file__).parent.parent / "content")]):
    if _m.name.startswith("lesson_"):
        _L = importlib.import_module(f"content.{_m.name}").LESSON; LESSONS[_L["id"]] = _L
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
