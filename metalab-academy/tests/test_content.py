import importlib, numpy as np, pytest
from metalab import curriculum, references, resources, stats as S

LESSONS = {n: importlib.import_module(f"content.lesson_{n:02d}").LESSON for n in (3, 4, 32)}
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
    assert c["total"] == 84 and c["drafted"] + c["outline"] == 84
    ids = [m["id"] for m in curriculum.MODULES]
    assert ids == list(range(1, 85))

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
        assert c["source_key"] in references.REFS, c["id"]
        assert c["human_review"] == "none"          # no claim is human-reviewed yet; change only with a real signed review
        assert c["supports_directly"] in ("yes", "partial", "unverified") or c["supports_directly"].startswith("yes")
        if c["supports_directly"] == "unverified":
            assert "UNVERIFIED" in c["status"] and "not examined" in c["examined"]
    assert len(claims.CORRECTIONS) >= 10


def test_all_references_have_ids_and_verification_dates():
    from metalab import references
    for k, r in references.REFS.items():
        assert r["verified_on"] and (r["doi"] or r["pmid"]), k
