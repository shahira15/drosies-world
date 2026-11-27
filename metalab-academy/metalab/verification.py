"""Local resource-verification workflow.

Why: the build sandbox cannot reach most hosts, so registry entries are CANDIDATES. Verification happens on YOUR machine:
  1. python3 tools/check_links.py            -> link level (URL responded on a date; says nothing about content)
  2. export the queue (CSV), open each official page yourself, fill: verifier, verified_on, page_title_seen, matches_description, access/cost/version seen, notes
  3. import the CSV (or enter results one by one in the app) -> human 'page examined' level, stored in the local ledger with date and verifier
Status levels shown to users: candidate < link-checked < page examined by a human (<- the only level that supports 'verified'). Claim-support is a separate question (claims registry).
"""
import csv, io
from . import resources, claims

LEVELS = ("candidate", "link-checked", "page examined by a human")
FIELDS = ["url", "name", "category", "type", "current_status", "verifier", "verified_on", "page_title_seen", "matches_description", "access_cost_seen", "version_or_date_seen", "notes"]


def entries():
    out = []
    for d in resources.RESOURCES: out.append(dict(url=d["url"], name=d["title"], type=d["type"], category=resources.category(d), source="resource"))
    for d in resources.ORGS: out.append(dict(url=d["url"], name=d["name"], type="Organisation", category="Organisations", source="organisation"))
    for d in resources.COMMUNITIES: out.append(dict(url=d["url"], name=d["name"], type=d["kind"], category="Communities & forums", source="community"))
    for d in resources.OPPORTUNITY_DIRECTORIES: out.append(dict(url=d["url"], name=d["name"], type=d["kind"], category="Opportunities (directories)", source="opportunity directory"))
    seen = {}
    for e in out: seen.setdefault(e["url"], e)
    return list(seen.values())


def status(url, store=None):
    if store is not None:
        v = store.verifications(url)
        if v: return dict(level=LEVELS[2], detail=f"verified by {v[0]['verifier']} on {v[0]['verified_on']} (page: '{v[0]['page_title_seen']}'; matches description: {v[0]['matches_description']})")
    lc = resources.LINKS.get(url)
    if lc and lc["result"] == "reachable": return dict(level=LEVELS[1], detail=f"URL reachable on {lc['checked_on']} (content NOT examined)")
    if lc: return dict(level=LEVELS[0], detail=f"{lc['result']} on {lc['checked_on']}")
    return dict(level=LEVELS[0], detail="not checked")


def export_queue(store=None, only_unverified=True):
    buf = io.StringIO(); w = csv.DictWriter(buf, fieldnames=FIELDS); w.writeheader()
    for e in entries():
        st = status(e["url"], store)
        if only_unverified and st["level"] == LEVELS[2]: continue
        w.writerow(dict(url=e["url"], name=e["name"], category=e["category"], type=e["type"], current_status=st["level"] + ": " + st["detail"]))
    return buf.getvalue()


def import_results(store, text):
    """Import a filled-in queue CSV. Rows with no verifier are skipped (not an error). Invalid rows are rejected with a reason; nothing partial is silently accepted."""
    known = {e["url"] for e in entries()}; ok, skipped, errors = 0, 0, []
    for i, row in enumerate(csv.DictReader(io.StringIO(text)), start=2):
        if not (row.get("verifier") or "").strip(): skipped += 1; continue
        if row.get("url") not in known: errors.append((i, "URL is not in the registry")); continue
        try:
            store.add_verification(row["url"], row["verifier"].strip(), (row.get("verified_on") or "").strip(), row.get("page_title_seen") or "", (row.get("matches_description") or "").strip().lower(),
                                   row.get("access_cost_seen") or "", row.get("version_or_date_seen") or "", row.get("notes") or ""); ok += 1
        except ValueError as e: errors.append((i, str(e)))
    return dict(imported=ok, skipped=skipped, errors=errors)


def summary(store=None):
    es = entries(); lv = [status(e["url"], store)["level"] for e in es]
    return {l: lv.count(l) for l in LEVELS} | {"total": len(es)}
