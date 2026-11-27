import csv, io, pytest
from metalab import verification as V, resources
from metalab.store import Store

def test_registry_integrity_after_expansion():
    es = V.entries(); urls = [e["url"] for e in es]
    assert len(urls) == len(set(urls)) and all(u.startswith("https://") for u in urls) and len(es) >= 130
    for d in resources.RESOURCES + resources.ORGS + resources.COMMUNITIES + resources.OPPORTUNITY_DIRECTORIES: assert d.get("verified_on") is None
    assert all(resources.category(d) != "Other" for d in resources.RESOURCES)
    assert {resources.category(d) for d in resources.RESOURCES} >= {"Textbooks", "Courses & training", "Videos & lectures", "Software & packages", "Databases", "Registries", "Repositories & datasets", "Reporting guidelines", "Integrity & ethics", "Journals & publishing", "Risk-of-bias & appraisal tools"}

def test_search_link_entries_are_labelled_not_endorsements():
    s = [d for d in resources.RESOURCES if d["title"].startswith("SEARCH:")]; assert len(s) >= 4 and all("search" in d["type"].lower() for d in s)
    assert all("not an opportunity" in d["kind"].lower() or d["kind"] != "" for d in resources.OPPORTUNITY_DIRECTORIES)
    assert not any(k in " ".join(d["note"] for d in resources.OPPORTUNITY_DIRECTORIES).lower() for k in ("deadline:", "$", "apply by", "now open"))

def test_everything_starts_as_candidate_and_ledger_upgrades_only_with_human_evidence():
    s = Store(":memory:"); u = V.entries()[0]["url"]
    assert V.status(u, s)["level"] == "candidate"
    for bad in (dict(verifier="AI model", verified_on="2026-11-27", page_title_seen="x", matches_description="yes"), dict(verifier="human:me", verified_on="yesterday", page_title_seen="x", matches_description="yes"),
                dict(verifier="human:me", verified_on="2026-11-27", page_title_seen="", matches_description="yes"), dict(verifier="human:me", verified_on="2026-11-27", page_title_seen="x", matches_description="maybe")):
        with pytest.raises(ValueError): s.add_verification(u, **bad)
    s.add_verification(u, "human:me", "2026-11-27", "Cochrane Handbook", "yes", "free", "v6.5")
    st = V.status(u, s); assert st["level"] == "page examined by a human" and "human:me" in st["detail"] and V.summary(s)["page examined by a human"] == 1

def test_queue_export_import_roundtrip_and_rejections():
    s = Store(":memory:"); q = V.export_queue(s); rows = list(csv.DictReader(io.StringIO(q))); assert len(rows) == len(V.entries())
    rows[0].update(verifier="human:me", verified_on="2026-11-27", page_title_seen="Official page title", matches_description="yes")
    rows[1].update(verifier="human:me", verified_on="2026-13-40", page_title_seen="x", matches_description="yes")      # bad date
    rows[2].update(url="https://not-in-registry.example", verifier="human:me", verified_on="2026-11-27", page_title_seen="x", matches_description="no")
    buf = io.StringIO(); w = csv.DictWriter(buf, fieldnames=V.FIELDS); w.writeheader(); w.writerows(rows)
    r = V.import_results(s, buf.getvalue()); assert r["imported"] == 1 and len(r["errors"]) == 2 and r["skipped"] == len(rows) - 3
    assert len(V.export_queue(s).splitlines()) == len(rows)                    # header + all but the one verified
    s2 = Store(":memory:"); s2.restore_json(s.backup_json()); assert len(s2.verifications()) == 1

def test_link_checked_level_only_from_definitive_reachable_results(monkeypatch):
    u = V.entries()[0]["url"]; monkeypatch.setitem(resources.LINKS, u, dict(status=200, final_url=u, checked_on="2026-11-27", result="reachable"))
    assert V.status(u)["level"] == "link-checked" and "NOT examined" in V.status(u)["detail"]
    monkeypatch.setitem(resources.LINKS, u, dict(status=404, final_url=u, checked_on="2026-11-27", result="NOT FOUND (HTTP 404)")); assert V.status(u)["level"] == "candidate"
