import pytest
from metalab import lesson_audit as A, lessons

def test_audit_covers_every_lesson_and_never_claims_expert_review():
    rows = A.audit(); assert [r["module"] for r in rows] == sorted(dict(lessons.load())) and all(r["expert_reviewed"] is False for r in rows)
    s = A.summary(); assert s["total"] == len(rows) == s["substantive"] + s["thin"] and s["expert_reviewed"] == 0

def test_tier_is_consistent_with_failing_criteria():
    for r in A.audit():
        assert (r["tier"] == "substantive draft") == (r["failing"] == "-")
        for f in ([] if r["failing"] == "-" else r["failing"].split(", ")): assert f in A.CRITERIA

def test_new_v04_lessons_are_substantive():
    got = {r["module"]: r for r in A.audit()}
    for n in (24, 25, 26, 29, 30, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 54, 56, 57, 58, 60, 64, 66, 67, 68, 69, 70, 71, 72, 73, 79, 80, 81, 83, 84, 88, 89, 90):
        if n in (31,): continue
        assert got[n]["tier"] == "substantive draft", (n, got[n]["failing"])

def test_thin_lessons_are_reported_not_hidden():
    assert A.summary()["thin"] > 0          # the backlog is visible; if it reaches 0 this test should be revisited deliberately, not silently passed

def test_a_trivial_lesson_fails_the_audit():
    L = dict(id=999, title="t", plain="x", intermediate="y", advanced="z", worked_example="none", why="w", integrity="i", application="a", mistakes=["m"], exercises=["e"], checklist=["c"], controversies=["c"],
             quiz=[dict(q="q", opts=["a", "b"], ans=0, why="")], misconceptions=[("a", "b")], assumptions=[], further=[], coding=None)
    r = A.audit_lesson(999, L, set()); assert r["tier"] == "thin draft" and "length" in r["failing"] and "numeric_check" in r["failing"] and "code" in r["failing"]
