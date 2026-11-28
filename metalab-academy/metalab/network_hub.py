"""Personal networking dashboard (LOCAL ONLY). It records what YOU decide and do: contacts you added, collaboration interests, meeting records, authorship discussions,
mentor shortlists, opportunity bookmarks (links to official pages YOU will check) and outreach DRAFTS. It contains no users, no matching, no recommendations of people and no
simulated activity, and it never sends, submits, registers or contacts anything - 'sent by me' / 'submitted by me' are notes you make after acting yourself."""
from __future__ import annotations
import datetime, re
from . import templates_lib

PRINCIPLES = ["Nothing is sent by the app.", "People appear only if you added them.", "Statuses record your own actions.", "Authorship is discussed and agreed by people, in writing; this log is only a memory aid.",
              "Opportunity entries are bookmarks to official pages; check dates, eligibility and costs there."]


def fill_template(name, **fields):
    """Fill [placeholders] of a template with the values you give; unfilled placeholders stay visible as [..] so nothing is invented."""
    txt = templates_lib.T[name]
    for k, v in fields.items():
        if v is not None and str(v).strip(): txt = txt.replace(f"[{k}]", str(v))
    return txt


def unfilled(text): return sorted(set(re.findall(r"\[[^\[\]]+\]", text)))


def contribution_summary(store, pid):
    """CRediT contributions recorded for a project, grouped by role and person (names are shown only here, never written to the audit log)."""
    by_person = {}
    for r in store.credits(pid): by_person.setdefault(r["person"], []).append(r["role"])
    by_role = {}
    for p, roles in by_person.items():
        for r in roles: by_role.setdefault(r, []).append(p)
    return dict(by_person={p: sorted(set(v)) for p, v in by_person.items()}, by_role={r: sorted(set(v)) for r, v in by_role.items()}, n_entries=len(store.credits(pid)))


def dashboard(store, today=None):
    today = today or datetime.date.today(); t = today.isoformat()
    contacts = store.contacts(); mentors = store.mentor_candidates(); interests = store.interests(); meets = store.meetings(); auth = store.authorship_discussions(); opps = store.opp_bookmarks(); drafts = store.outreach_drafts()
    recent = [m for m in meets if m["date"] >= (today - datetime.timedelta(days=30)).isoformat()]
    return dict(
        counts=dict(contacts=len(contacts), interests=len(interests), meetings=len(meets), authorship_open=sum(a["status"] in ("open", "to revisit") for a in auth), mentors_active=sum(m["status"] in ("considering", "to ask", "asked by me") for m in mentors),
                    opportunities_tracked=sum(o["status"] in ("interested", "checking details", "preparing") for o in opps), drafts_unsent=sum(d["status"] == "draft" for d in drafts)),
        followups_due=list(store.followups_due(today)) + list(store.meeting_followups_due(today)), opportunity_checks_due=list(store.opp_checks_due(today)),
        unresolved_authorship=[a for a in auth if a["status"] in ("open", "to revisit")], mentor_pipeline=mentors, recent_meetings=recent, interests_active=[i for i in interests if i["status"] in ("exploring", "active")],
        principles=PRINCIPLES, generated=t)
