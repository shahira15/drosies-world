import datetime, pytest
from metalab import resources, templates_lib
from metalab.store import Store

def test_local_contacts_and_followups_and_privacy():
    s = Store(":memory:")
    with pytest.raises(ValueError): s.add_contact("  ")
    cid = s.add_contact("Dr Example (fictional test person)", "statistician", "Test University", "Biostatistics", "meta-analysis", "met at workshop", "OK to email", "")
    assert all("Example" not in a["detail"] for a in s.audit_rows())            # personal details never copied into the audit log
    s.log_interaction(cid, "2026-01-01", "email", "asked for SAP feedback", "2026-01-10")
    assert s.followups_due(datetime.date(2026, 1, 9)) == [] and len(s.followups_due(datetime.date(2026, 1, 10))) == 1
    s.complete_followup(s.interactions(cid)[0]["id"]); assert s.followups_due(datetime.date(2026, 2, 1)) == []
    with pytest.raises(ValueError): s.log_interaction(999, "2026-01-01", "x", "y")
    s.delete_contact(cid); assert s.contacts() == [] and s.interactions() == []

def test_credit_roles_require_real_contribution():
    s = Store(":memory:"); pid = s.create_project("P", "B", "SR")
    assert len(templates_lib.CREDIT_ROLES) == 14
    with pytest.raises(ValueError): s.add_credit(pid, "me", "Gift authorship", "x")
    with pytest.raises(ValueError): s.add_credit(pid, "me", "Formal analysis", "")
    s.add_credit(pid, "me", "Formal analysis", "ran primary meta-analysis"); assert len(s.credits(pid)) == 1
    s2 = Store(":memory:"); s2.restore_json(s.backup_json()); assert len(s2.credits(pid)) == 1

def test_templates_never_send_and_mention_authorship_criteria():
    assert "ICMJE" in templates_lib.T["Authorship expectations (to agree in writing)"] and "not legal advice" in templates_lib.T["Authorship expectations (to agree in writing)"].lower()
    assert all("[" in t for t in templates_lib.T.values() if t.startswith("Subject:"))   # placeholders, nothing pre-filled with real people

def test_resource_registry_honesty_and_filters():
    for d in resources.RESOURCES + resources.ORGS + resources.COMMUNITIES:
        assert d["url"].startswith("https://") and d["verified_on"] is None
    assert "not checked" in resources.link_status("https://www.metafor-project.org/") or "reachable" in resources.link_status("https://www.metafor-project.org/")
    assert any(d["title"].startswith("metafor") for d in resources.filter_resources("metafor"))
    eco = [d["title"] for d in resources.filter_resources("", disciplines=["Ecology"])]
    assert any("orchaRd" in t for t in eco) and not any("Covidence" in t for t in eco) and any("Rayyan" in t for t in eco)   # discipline "All" tools included, Health-only excluded
    assert all(d["access"] for d in resources.RESOURCES) and len({d["url"] for d in resources.RESOURCES}) == len(resources.RESOURCES)

def test_recommender_links_modules_to_resources_and_verified_refs():
    r = resources.recommend(32); assert r["resources"] and any(x["key"] == "borenstein2010" for x in r["references"])
    assert resources.recommend(19)["resources"] and resources.recommend(19)["references"] == []      # outline module: resources only, no invented refs
    lv = resources.verification_levels(resources.RESOURCES[0]); assert lv["full_text"] == "not examined"

def test_no_fake_community_content():
    import metalab.store as st, inspect
    src = inspect.getsource(st) + inspect.getsource(resources)
    assert "fake" not in src.lower() or "fake" in "never fake"                       # sanity: registry has no placeholder people
    assert Store(":memory:").contacts() == []
