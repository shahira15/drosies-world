"""Verify bibliographic records in metalab/refs_wanted.json against the Crossref DOI registry.
BIBLIOGRAPHIC verification only: confirms the DOI exists and that first-author family name and year match
what was intended. It does NOT confirm that the paper supports any claim (see claims registry).
Output: metalab/refs_verified.json (merged, idempotent). Failures are printed and NOT written."""
import html, re, json, sys, time, urllib.error, urllib.parse, urllib.request, datetime
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
wanted = json.loads((ROOT / "metalab" / "refs_wanted.json").read_text())
out_p = ROOT / "metalab" / "refs_verified.json"
have = json.loads(out_p.read_text()) if out_p.exists() else {}
today = datetime.date.today().isoformat() if len(sys.argv) < 2 else sys.argv[1]
bad = []
for w in wanted:
    if w["key"] in have: continue
    url = "https://api.crossref.org/works/" + urllib.parse.quote(w["doi"], safe="/()[];:")
    for attempt in range(6):
        try:
            with urllib.request.urlopen(url, timeout=25) as r: m = json.load(r)["message"]; break
        except urllib.error.HTTPError as e:
            if e.code == 404: m = None; break
            if e.code != 429 or attempt == 5: raise
            time.sleep(4 * (attempt + 1))
    time.sleep(1.2)
    if m is None: bad.append((w["key"], "DOI not found in Crossref")); continue
    fa = ((m.get("author") or [{}])[0].get("family") or "")
    yr = (m.get("issued", {}).get("date-parts") or [[None]])[0][0]
    if (w["author"] and w["author"].lower() not in fa.lower()) or yr != w["year"]:
        bad.append((w["key"], f"mismatch: expected {w['author']} {w['year']}, registry says {fa} {yr} | {m['title'][0][:80]}")); continue
    authors = [a.get("family", "") for a in m.get("author", [])]
    have[w["key"]] = dict(doi=m["DOI"], title=re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html.unescape(re.sub(r"&lt;/?SUBTITLE&gt;", ": ", m["title"][0])))), first_author=fa, n_authors=len(authors),
        year=w.get("cite_year", yr), year_registry=yr, note=w.get("note", ""), journal=(m.get("container-title") or [""])[0], volume=m.get("volume", ""), pages=m.get("page", ""), pmid=w.get("pmid"),
        verification="bibliographic", verified_via="Crossref DOI registry", verified_on=today)
    print("OK ", w["key"], yr, fa, "|", have[w["key"]]["title"][:90])
out_p.write_text(json.dumps(have, indent=1, ensure_ascii=False))
for k, why in bad: print("FAIL", k, why)
sys.exit(1 if bad else 0)
