"""LINK verification: GET each registry URL and record HTTP status + date in metalab/link_checks.json.
A reachable link (2xx) means ONLY that the URL responded on that date. It does not verify content, version,
cost, licence, eligibility or that the page supports any claim. 403/429/bot-blocking are recorded as 'blocked/unknown', never as OK."""
import json, sys, time, urllib.error, urllib.request, datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT = Path(__file__).resolve().parent.parent; sys.path.insert(0, str(ROOT))
from metalab import resources
out = ROOT / "metalab" / "link_checks.json"
old = {}   # only definitive results from THIS run are kept (stale statuses are never carried over silently)
today = sys.argv[1] if len(sys.argv) > 1 else datetime.date.today().isoformat()
urls = sorted({r["url"] for r in resources.RESOURCES + resources.ORGS + resources.COMMUNITIES if r.get("url")})
def check(u):
    req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (compatible; link-check)"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r: return u, dict(status=r.status, final_url=r.geturl(), checked_on=today, result="reachable")
    except urllib.error.HTTPError as e:
        if e.code in (404, 410): return u, dict(status=e.code, final_url=u, checked_on=today, result="NOT FOUND (HTTP %d)" % e.code)
        return u, None            # 401/403/429/5xx: bot-blocking or transient -> inconclusive, NOT recorded
    except Exception as e:
        return u, None            # proxy/network-policy blocks, DNS, TLS, timeouts -> inconclusive, NOT recorded
with ThreadPoolExecutor(8) as ex:
    for u, res in ex.map(check, urls):
        if res: old[u] = res; print(res["result"].ljust(34), u)
        else: print("inconclusive (not recorded)".ljust(34), u)
out.write_text(json.dumps(old, indent=1))
