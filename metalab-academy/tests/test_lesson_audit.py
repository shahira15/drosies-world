import pytest
from metalab import lesson_audit as A, lessons

def test_audit_covers_every_lesson_and_never_claims_expert_review():
    rows = A.audit(); assert [r["module"] for r in rows] == sorted(dict(lessons.load())) and all(r["expert_reviewed"] is False for r in rows)
    s = A.summary(); assert s["total"] == len(rows) == s["substantive"] + s["thin"] and s["expert_reviewed"] == 0

def test_tier_is_consistent_with_failing_criteria():
    for r in A.audit():
        assert (r["tier"] == "substantive draft") == (r["failing"] == "-")
        for f in ([] if r["failing"] == "-" else r["failing"].split(", ")): assert f in A.CRITERIA

def test_all_lessons_pass_the_mechanical_criteria_after_v04_deepening():
    got = {r["module"]: r for r in A.audit()}
    for n, r in got.items(): assert r["tier"] == "substantive draft", (n, r["failing"])
    assert any(r["not_applicable"] != "-" for r in got.values())          # process/concept lessons have waived numeric criteria, shown explicitly

def test_audit_is_a_low_bar_and_says_so():
    s = A.summary(); assert "not that it is correct" in s["note"] and s["expert_reviewed"] == 0
    assert A.CRITERIA["length"].endswith(">= 450 words")          # the thresholds are explicit and modest; passing them proves little about quality

def test_a_trivial_lesson_fails_the_audit():
    L = dict(id=999, title="t", plain="x", intermediate="y", advanced="z", worked_example="none", why="w", integrity="i", application="a", mistakes=["m"], exercises=["e"], checklist=["c"], controversies=["c"],
             quiz=[dict(q="q", opts=["a", "b"], ans=0, why="")], misconceptions=[("a", "b")], assumptions=[], further=[], coding=None, formulas=[dict(name="f", tex="x", symbols={})])
    r = A.audit_lesson(999, L, set()); assert r["tier"] == "thin draft" and "length" in r["failing"] and "numeric_check" in r["failing"] and "code" in r["failing"]


def test_conceptual_lessons_waive_numeric_criteria_explicitly():
    L = dict(id=998, title="t", plain="x " * 600, intermediate="y", advanced="z", worked_example="no numbers", why="w", integrity="i", application="a", mistakes=["m1", "m2", "m3"], exercises=["e1", "e2", "e3"], checklist=["c"], controversies=["c"],
             quiz=[dict(q="q", opts=["a", "b"], ans=0, why="w")] * 5, misconceptions=[("a", "b"), ("c", "d")], assumptions=["a1", "a2"], further=["page2021", "higgins2002", "viechtbauer2010"], coding=None, formulas=[])
    r = A.audit_lesson(998, L, {998}); assert r["tier"] == "substantive draft" and set(r["not_applicable"].split(", ")) == {"worked_numbers", "numeric_check", "code"}
