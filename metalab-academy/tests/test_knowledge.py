import collections, pytest
from metalab import knowledge as K, resources, references, curriculum, lessons, verification

def test_every_module_has_a_reading_list_with_verified_core_and_candidates():
    cov = K.coverage(); assert [r["module"] for r in cov] == [m["id"] for m in curriculum.MODULES] and len(cov) == 90
    for r in cov: assert r["verified_refs"] >= 3, r; assert r["candidates"] >= 1, r

def test_candidates_are_never_marked_verified():
    for d in resources.RESOURCES + resources.ORGS + resources.COMMUNITIES + resources.OPPORTUNITY_DIRECTORIES:
        assert d["verified_on"] is None and d["url"].startswith("https://") and d["cost"] == "not verified"
    assert all(verification.status(d["url"])["level"] != verification.LEVELS[2] for d in resources.RESOURCES)

def test_registry_covers_all_requested_formats_and_categories():
    cats = collections.Counter(resources.category(d) for d in resources.RESOURCES)
    for need in ("Courses & training", "Videos & lectures", "Textbooks", "Handbooks & guidance", "Tutorials", "Software & packages", "Reporting guidelines", "Risk-of-bias & appraisal tools", "Databases", "Registries", "Repositories & datasets", "Integrity & ethics", "Journals & publishing"):
        assert cats[need] >= 1, need
    kinds = " ".join(o["kind"] for o in resources.OPPORTUNITY_DIRECTORIES); assert "Conference" in kinds and "Funder" in kinds and "Mentoring" in kinds and "Workshops" in kinds and "Training" in kinds
    assert len(resources.ORGS) >= 20 and len(resources.COMMUNITIES) >= 12 and len(resources.RESOURCES) >= 140

def test_no_duplicate_urls_within_each_registry():
    for reg in (resources.RESOURCES, resources.ORGS, resources.COMMUNITIES, resources.OPPORTUNITY_DIRECTORIES):
        urls = [d["url"] for d in reg]; assert len(urls) == len(set(urls)), [u for u, c in collections.Counter(urls).items() if c > 1]

def test_search_links_are_labelled_as_search_not_endorsement():
    n = 0
    for d in resources.RESOURCES:
        if d["type"] in ("Video search (not a channel)", "Online course search"):
            n += 1; assert d["title"].startswith("SEARCH:") and ("search" in d["url"].lower() or "results" in d["url"].lower()), d["title"]
    assert n >= 8

def test_example_reviews_and_datasets_have_verified_sources():
    for e in K.EXAMPLE_REVIEWS: assert references.REFS[e["ref"]]["verified"] and all(m in curriculum.BY_ID for m in e["modules"])
    for d in K.DATASETS:
        assert all(m in curriculum.BY_ID for m in d["used_in"])
        if d["source_ref"]: assert references.REFS[d["source_ref"]]["verified"]
        else: assert "SIMULATED" in d["note"].upper() or "FICTIONAL" in d["note"].upper()

def test_filters_by_format_discipline_level_cost_module_objective():
    assert all(resources.category(d) == "Videos & lectures" for d in K.filter_candidates(fmt=("Videos & lectures",)))
    assert K.filter_candidates(module=42) and all(42 in d["modules"] for d in K.filter_candidates(module=42))
    assert all("paid" not in d["access"].lower() or "free" in d["access"].lower() for d in K.filter_candidates(free_only=True))
    assert K.filter_candidates(objective_query="network") and not K.filter_candidates(objective_query="zzzzqqq")
    assert K.filter_candidates(level=("Advanced",)) and K.filter_candidates(discipline=("Preclinical",))

def test_reading_list_sections_are_consistent_and_labelled():
    rl = K.reading_list(42); assert rl["core_verified_references"] and rl["guidance"] and any(d["id"] == "HASSELBLAD" for d in rl["built_in_datasets"])
    assert all(r["verified"] for r in rl["core_verified_references"]); assert rl["title"] == curriculum.BY_ID[42]["title"]

def test_new_dataset_sources_are_verified_records():
    for k in ("hasselblad1998", "berkey1998", "konstantopoulos2011", "moura2021", "nielweise2007"): assert references.REFS[k]["verified"]
