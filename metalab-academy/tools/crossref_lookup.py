"""Bibliographic lookup via the public Crossref API (no key needed). Prints top matches so a human/agent can
choose a DOI from REAL registry records instead of recalling DOIs.  Usage: python3 tools/crossref_lookup.py "title words" [year]
This verifies that a record EXISTS with given metadata. It does not verify that the paper supports any claim."""
import json, sys, time, urllib.error, urllib.parse, urllib.request
def lookup(q, n=3):
    url = "https://api.crossref.org/works?rows=%d&select=DOI,title,author,issued,container-title,type&query.bibliographic=%s" % (n, urllib.parse.quote(q))
    for attempt in range(6):
        try:
            with urllib.request.urlopen(url, timeout=25) as r:
                items = json.load(r)["message"]["items"]
            break
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 5: raise
            time.sleep(4 * (attempt + 1))
    out = []
    for it in items:
        out.append(dict(doi=it["DOI"], title=(it.get("title") or [""])[0], first_author=(it.get("author") or [{}])[0].get("family", ""),
                        year=(it.get("issued", {}).get("date-parts") or [[None]])[0][0], journal=(it.get("container-title") or [""])[0], type=it.get("type")))
    return out
if __name__ == "__main__":
    for q in sys.argv[1:]:
        time.sleep(1.5); print("##", q)
        for o in lookup(q):
            print("  ", o["year"], o["first_author"], "|", o["title"][:110], "|", o["journal"], "|", o["doi"])
