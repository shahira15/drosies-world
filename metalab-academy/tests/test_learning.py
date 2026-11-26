import pytest
from metalab import learning as LRN, lessons, curriculum

def test_glossary_links_to_valid_modules_and_has_no_empty_definitions():
    for t, v in LRN.G.items():
        assert v["definition"].strip() and (v["module"] is None or v["module"] in curriculum.BY_ID), t
    assert len(LRN.G) >= 45

def test_glossary_search():
    assert any(x["term"] == "Hedges' g" for x in LRN.glossary_search("small-sample"))
    assert LRN.glossary_search("zzzzzz") == []

def test_cards_unique_and_nonempty():
    c = LRN.cards(); keys = [x["key"] for x in c]
    assert len(keys) == len(set(keys)) and len(c) > 60 and all(x["front"] and x["back"] for x in c)

def test_sm2_scheduling_properties():
    e, i, r = 2.5, 0, 0
    e, i, r, lap = LRN.sm2(e, i, r, 5); assert (i, r, lap) == (1, 1, False)
    e, i, r, lap = LRN.sm2(e, i, r, 5); assert i == 6
    e2, i2, r2, lap = LRN.sm2(e, i, r, 5); assert i2 > 6 and e2 > e                     # intervals grow, ease rises on easy recall
    e3, i3, r3, lap = LRN.sm2(e2, i2, r2, 1); assert (i3, r3, lap) == (1, 0, True)       # lapse resets
    lo = 2.5
    for _ in range(30): lo, *_ = LRN.sm2(lo, 10, 5, 3)
    assert lo >= 1.3                                                                     # ease floor
    with pytest.raises(ValueError): LRN.sm2(2.5, 1, 1, 7)

def test_universal_search_finds_each_type():
    types = lambda q: {d["type"].split(" ")[0] for d in LRN.search(q)}
    assert "Lesson" in types("pseudoreplication") or "Glossary" in types("pseudoreplication")
    assert "Formula" in types("pooled SD") and "Reference" in types("SYRCLE")
    assert "Resource" in types("metafor") and "Calculator" in types("log response ratio")
    assert "Workflow" in types("qualitative") and "Organisation" in types("Cochrane")
    assert LRN.search("") == [] and LRN.search("qqqzzz") == []
    r = LRN.search("tau squared heterogeneity"); assert r and r[0]["where"] in ("Learning Academy", "Practice")

def test_wizard_scenarios_and_honesty():
    w = LRN.wizard("randomised experiments", "continuous ratio-scale, positive (e.g. lifespan, biomass)", 12, "none", "estimate an effect", True)
    assert "Log response ratio (lnRR)" in w["measures"] and w["models"] and 32 in w["lessons"] and w["assumptions"]
    d = LRN.wizard("randomised experiments", "continuous (same scale)", 12, "shared control", "estimate an effect", True)
    assert any("NOT implemented" in x for x in d["cautions"]) and d["not_supported"] and not d["models"]
    s = LRN.wizard("randomised experiments", "binary", 2, "none", "estimate an effect", True)
    assert any("Fewer than 3" in c for c in s["cautions"])
    n = LRN.wizard("randomised experiments", "binary", 8, "none", "estimate an effect", False)
    assert "SWiM" in n["review_types"][0]
    m = LRN.wizard("any", "binary", 8, "none", "map the evidence", True); assert "Scoping" in m["review_types"][0]
    dta = LRN.wizard("diagnostic accuracy", "binary", 8, "none", "estimate an effect", True); assert dta["not_supported"]
    t = LRN.wizard("randomised experiments", "time-to-event", 8, "none", "explore heterogeneity", True)
    assert any("not implemented" in x.lower() for x in t["not_supported"]) and any("<10" in c or "10 studies" in c for c in t["cautions"])

def test_pathways_reference_real_modules_and_report_availability():
    L = lessons.load()
    for ids in [LRN.CORE_PATH, LRN.CORE_EXTENSIONS, *LRN.SPECIALIST.values()]:
        assert all(i in curriculum.BY_ID for i in ids)
    p = LRN.pathway(LRN.CORE_PATH)
    assert all((x["minutes"] is not None) == x["available"] for x in p)
    assert sum(x["available"] for x in p) >= 11

def test_coverage_audit_is_computed_not_asserted():
    rows = LRN.coverage_table(); L = lessons.load()
    for r, (area, src, mods, note) in zip(rows, LRN.COVERAGE):
        assert r["with_lessons"] == sum(m in L for m in mods)
    assert "NOT re-read" in LRN.AUDIT_NOTE and all(len(x) == 4 for x in LRN.PROPOSED_NEW_MODULES)

def test_study_notes_and_cheat_sheet():
    assert "Objectives" in LRN.lesson_notes(32) and "Hedges" in LRN.cheat_sheet()


def test_srs_persistence_and_due_logic():
    import datetime
    from metalab.store import Store
    s = Store(":memory:"); d0 = datetime.date(2026, 1, 1); keys = ["a", "b", "c"]
    assert s.cards_due(keys, d0) == ([], keys)
    due = s.card_review("a", 5, d0); assert due == "2026-01-02"
    s.card_review("b", 1, d0)                                           # lapse -> due next day
    due_now, new = s.cards_due(keys, d0); assert due_now == [] and new == ["c"]
    due_tom, _ = s.cards_due(keys, d0 + datetime.timedelta(days=1)); assert set(due_tom) == {"a", "b"}
    s.card_review("a", 5, d0 + datetime.timedelta(days=1)); assert s.q("SELECT interval FROM cards WHERE card_key='a'")[0]["interval"] == 6
    assert s.toggle_bookmark("lesson", 32) is True and s.toggle_bookmark("lesson", 32) is False
    s2 = Store(":memory:"); s.toggle_bookmark("lesson", 5); s2.restore_json(s.backup_json())
    assert len(s2.bookmarks()) == 1 and s2.q("SELECT COUNT(*) c FROM cards")[0]["c"] == 2
