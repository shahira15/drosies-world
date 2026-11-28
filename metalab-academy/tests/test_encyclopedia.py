import collections, pytest
from metalab import encyclopedia as E, lessons, references, curriculum, learning

L = dict(lessons.load())

def test_all_kinds_present_and_counts_sane():
    c = collections.Counter(e["kind"] for e in E.entries()); assert set(c) == set(E.KINDS)
    assert c["Assumptions"] == c["Common mistakes"] == c["Decision tree"] == c["Interpretation example"] == len(L) and c["Formula"] == sum(len(l["formulas"]) for l in L.values())
    assert c["Command (R/Python)"] == len(E.COMMANDS) and c["Troubleshooting"] == len(E.TROUBLE) and c["Reporting guideline"] == len(E.REPORTING) and c["Effect size"] == len(E.EFFECT_SIZES) >= 12

def test_every_entry_is_cross_linked_to_real_lessons_and_labelled():
    ids = set()
    for e in E.entries():
        assert e["id"] not in ids; ids.add(e["id"]); assert e["lessons"] and all(n in curriculum.BY_ID and n in L for n in e["lessons"]), e["title"]
        assert "not expert-reviewed" in e["status"] and e["body"].strip() and e["title"].strip()

def test_reporting_guidelines_cite_verified_references():
    for r in E.REPORTING: assert references.REFS[r["ref"]]["verified"], r["name"]

def test_comparison_tables_are_rectangular_and_make_no_unbenchmarked_claims():
    for c in E.COMPARISONS:
        assert all(len(r) == len(c["columns"]) for r in c["rows"]), c["id"]
    txt = " ".join(" ".join(r) for c in E.COMPARISONS for r in c["rows"])
    assert "benchmarked vs metafor" in txt and "External R workflow only" in txt          # statuses stay honest

def test_search_finds_formulas_mistakes_commands_and_troubleshooting():
    assert any("Hartung" in e["title"] or "Hartung" in e["body"] for e in E.search("hartung knapp")); assert E.search("zero cells", ["Troubleshooting"])
    assert E.search("escalc", ["Command (R/Python)"]) and E.search("fisher z", ["Effect size"]) and E.search("pseudoreplication")
    assert E.search("") == [] and E.search("zzzzqqqq") == []
    assert [e["kind"] for e in E.search("PRISMA", ["Reporting guideline"])]

def test_for_lesson_returns_linked_entries():
    assert {e["kind"] for e in E.for_lesson(42)} >= {"Formula", "Assumptions", "Common mistakes", "Decision tree", "Interpretation example"}

@pytest.mark.parametrize("cmd", E.COMMANDS, ids=lambda c: c["id"])
def test_python_command_output_matches_expected(cmd):
    got = E.run_command(cmd, "py"); assert len(got) == len(cmd["expected"]); assert got == pytest.approx(cmd["expected"], abs=2e-6)

@pytest.mark.parametrize("cmd", E.COMMANDS, ids=lambda c: c["id"])
def test_r_command_output_matches_expected(cmd):
    from metalab import pipeline
    if not pipeline.r_available(): pytest.skip("R + metafor not installed")
    got = E.run_command(cmd, "r"); assert got == pytest.approx(cmd["expected"], abs=2e-6)

def test_universal_search_includes_encyclopedia_and_new_methods():
    assert any(d["type"].startswith("Encyclopedia") for d in learning.search("infinite odds ratios zero cells", 20))
    assert any("Trim-and-fill" in d["title"] for d in learning.search("trim and fill", 10)) and any("Network meta-analysis" in d["title"] for d in learning.search("league table P-score", 10))

def test_lnvr_formula_in_entry_matches_code():
    from metalab import advanced2 as B
    y, v = B.log_variability_ratio(3, 10, 2, 10); assert y == pytest.approx(0.405465, abs=1e-6) and v == pytest.approx(1 / 18 + 1 / 18)
    with pytest.raises(ValueError): B.log_variability_ratio(0, 10, 2, 10)
