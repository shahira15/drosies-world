import datetime, json
import pytest
from metalab import network_hub as NH, templates_lib
from metalab.store import Store

def S():
    s = Store(":memory:"); c = s.add_contact("Dr Example (fictional test contact)", "statistician", "Example Univ", "stats", "meta-regression", "workshop"); return s, c

def test_dashboard_aggregates_only_what_the_user_entered():
    s = Store(":memory:"); d = NH.dashboard(s); assert all(v == 0 for v in d["counts"].values()) and not d["followups_due"] and "Nothing is sent" in d["principles"][0]
    s, c = S(); s.add_interest("lifespan meta-analysis", "ageing", "biology expertise", "statistics help", "exploring"); s.add_meeting(c, "2026-11-20", "protocol review", "discussed SAP", "use REML", "send draft", "2026-11-25")
    s.add_authorship_discussion("order of authors for review 1", c, None, "2026-11-21", "second author", "Formal analysis; Methodology", "open"); s.set_mentor_candidate(c, "to ask", "feedback on protocol")
    s.add_opp_bookmark("Example meeting directory", "https://example.org/events", "Conference", "checking details", "2026-11-26", "check dates myself")
    d = NH.dashboard(s, datetime.date(2026, 11, 28)); n = d["counts"]
    assert n["contacts"] == 1 and n["interests"] == 1 and n["meetings"] == 1 and n["authorship_open"] == 1 and n["mentors_active"] == 1 and n["opportunities_tracked"] == 1
    assert len(d["followups_due"]) == 1 and len(d["opportunity_checks_due"]) == 1 and len(d["recent_meetings"]) == 1 and d["unresolved_authorship"][0]["status"] == "open"

def test_validation_and_honest_statuses():
    s, c = S()
    with pytest.raises(ValueError): s.add_interest("", "x")
    with pytest.raises(ValueError): s.add_interest("t", status="matched")                      # no 'matched' - the app does not match people
    with pytest.raises(ValueError): s.add_meeting(999, "2026-11-20", "a")
    with pytest.raises(ValueError): s.add_meeting(c, "28/11/2026", "a")
    with pytest.raises(ValueError): s.add_meeting(c, "2026-11-20")
    with pytest.raises(ValueError): s.add_authorship_discussion("t", c, status="signed")
    with pytest.raises(ValueError): s.add_opp_bookmark("x", "http://insecure.example", "k")
    with pytest.raises(ValueError): s.add_opp_bookmark("x", "https://x.org", "k", "applied by app")
    with pytest.raises(ValueError): s.set_mentor_candidate(c, "assigned")
    with pytest.raises(ValueError): s.mark_outreach(s.save_outreach_draft("Mentor outreach", "text", c), "sent by app")
    assert set(s.AUTHORSHIP_STATUS) >= {"agreed in writing", "to revisit"} and "submitted by me" in s.OPP_STATUS and "sent by me" in s.DRAFT_STATUS

def test_outreach_drafts_are_never_sent_and_placeholders_stay_visible():
    s, c = S(); t = NH.fill_template("Mentor outreach", Name="Dr Example", topic="lifespan meta-analysis")
    assert "Dr Example" in t and "[Your name]" in NH.unfilled(t) and "[field]" in NH.unfilled(t)           # unfilled placeholders are left visible
    d = s.save_outreach_draft("Mentor outreach", t, c); assert s.outreach_drafts()[0]["status"] == "draft" and s.outreach_drafts("sent by me") == []
    s.mark_outreach(d, "sent by me"); assert s.outreach_drafts("sent by me")[0]["id"] == d
    log = " ".join(r["detail"] for r in s.audit_rows()); assert "NOT sent" in log and "Dr Example" not in log

def test_audit_log_never_contains_personal_details():
    s, c = S(); s.add_interest("secret topic zebra", "x", "offer-xyz", "seek-xyz"); s.add_meeting(c, "2026-11-20", "agenda-qqq", "notes-qqq"); s.add_authorship_discussion("topic-www", c, notes="note-www"); s.set_mentor_candidate(c, "asked by me", "hope-eee"); s.add_opp_bookmark("opp-name-rrr", "https://x.org/y", "kind", notes="n-rrr")
    blob = json.dumps(s.audit_rows()); 
    for w in ("zebra", "offer-xyz", "agenda-qqq", "topic-www", "hope-eee", "opp-name-rrr", "Dr Example"): assert w not in blob, w

def test_followups_and_checks_complete_and_disappear():
    s, c = S(); m = s.add_meeting(c, "2026-11-20", "a", followup_due="2026-11-25"); o = s.add_opp_bookmark("d", "https://x.org", "k", next_check="2026-11-25")
    today = datetime.date(2026, 11, 28); assert len(s.meeting_followups_due(today)) == 1 and len(s.opp_checks_due(today)) == 1
    s.complete_meeting_followup(m); s.set_opp_status(o, "not relevant"); assert not s.meeting_followups_due(today) and not s.opp_checks_due(today)

def test_authorship_status_history_is_kept_in_notes():
    s, c = S(); a = s.add_authorship_discussion("order", c, notes="first idea"); s.set_authorship_status(a, "agreed in principle", "agreed on a call; to confirm in writing"); s.set_authorship_status(a, "agreed in writing", "email thread saved")
    r = s.authorship_discussions()[0]; assert r["status"] == "agreed in writing" and "first idea" in r["notes"] and "to confirm in writing" in r["notes"]

def test_contribution_summary_by_person_and_role_and_credit_names_not_logged():
    s = Store(":memory:"); pid = s.create_project("P", "Bio", "SR"); s.add_credit(pid, "Person A (test)", "Investigation", "ran screening of 300 records"); s.add_credit(pid, "Person A (test)", "Formal analysis", "ran the REML models")
    s.add_credit(pid, "Person B (test)", "Methodology", "reviewed SAP"); cs = NH.contribution_summary(s, pid)
    assert cs["by_person"]["Person A (test)"] == ["Formal analysis", "Investigation"] and cs["by_role"]["Methodology"] == ["Person B (test)"] and cs["n_entries"] == 3
    assert "Person A" not in json.dumps(s.audit_rows())

def test_backup_without_personal_data_excludes_all_networking_tables_and_roundtrips_with_them():
    s, c = S(); s.add_interest("t", "d"); s.add_meeting(c, "2026-11-20", "a"); s.add_authorship_discussion("t", c); s.set_mentor_candidate(c); s.add_opp_bookmark("o", "https://x.org"); s.save_outreach_draft("Mentor outreach", "x")
    shared = json.loads(s.backup_json(include_personal=False))["tables"]
    for t in ("contacts", "collab_interests", "meetings", "authorship_discussions", "mentor_candidates", "opp_bookmarks", "outreach_drafts"): assert shared[t] == [], t
    full = s.backup_json(); s2 = Store(":memory:"); s2.restore_json(full); assert len(s2.interests()) == 1 and len(s2.meetings()) == 1 and len(s2.opp_bookmarks()) == 1 and len(s2.outreach_drafts()) == 1 and len(s2.mentor_candidates()) == 1
    bad = json.loads(full); bad["tables"]["meetings"][0]["evil_col"] = 1
    with pytest.raises(ValueError): s2.restore_json(json.dumps(bad))

def test_deleting_a_contact_removes_dependent_personal_rows():
    s, c = S(); s.add_meeting(c, "2026-11-20", "a"); s.set_mentor_candidate(c); s.save_outreach_draft("Mentor outreach", "x", c); a = s.add_authorship_discussion("t", c); s.delete_contact(c)
    assert not s.meetings() and not s.mentor_candidates() and not s.outreach_drafts() and s.authorship_discussions()[0]["contact_id"] is None and a

def test_no_fabricated_people_anywhere_in_templates_or_dashboard():
    assert all("fictional" not in v.lower() for v in templates_lib.T.values()); s = Store(":memory:"); d = NH.dashboard(s); assert d["mentor_pipeline"] == [] and d["recent_meetings"] == []
