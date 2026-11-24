#!/usr/bin/env python3
"""Static validation of the citation hub: link validity, metadata, bibliography files, CITATION.cff, sitemap.
Run from the repository root:  python3 tests/citation/validate.py
Optional: if `cffconvert` is on PATH, CITATION.cff is validated against the official schema too.
External (https://) links are listed but not fetched: this check is offline by design."""
import json, os, re, shutil, subprocess, sys
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "tools", "citation"))
import resources as RS  # noqa: E402

passed = failed = 0
def ok(cond, msg):
    global passed, failed
    if cond: passed += 1; print("  PASS", msg)
    else: failed += 1; print("  FAIL", msg)

def read(rel): return open(os.path.join(ROOT, rel), encoding="utf-8").read()

class P(HTMLParser):
    def __init__(s): super().__init__(); s.links=[]; s.ids=set(); s.jsonld=[]; s._ld=False; s.metas=[]; s.btns=[]
    def handle_starttag(s, t, a):
        a = dict(a)
        if "id" in a: s.ids.add(a["id"])
        if t == "a" and "href" in a: s.links.append(a["href"])
        if t in ("link",) and "href" in a: s.links.append(a["href"])
        if t in ("script", "img") and "src" in a: s.links.append(a["src"])
        if t == "meta": s.metas.append(a)
        if t == "script" and a.get("type") == "application/ld+json": s._ld = True; s.jsonld.append("")
    def handle_endtag(s, t):
        if t == "script": s._ld = False
    def handle_data(s, d):
        if s._ld: s.jsonld[-1] += d

def parse(rel):
    p = P(); p.feed(read(rel)); return p

def resolve(base_rel, href):
    """Return (file path or None, fragment) for an internal link, or None for external."""
    u = urlparse(href)
    if u.scheme in ("http", "https"):
        if u.netloc not in ("drosiesworld.com", "www.drosiesworld.com"): return None
        path = u.path
    elif u.scheme in ("mailto", "tel", "javascript", "data"): return None
    else:
        path = u.path
        if path and not path.startswith("/"):
            path = "/" + os.path.normpath(os.path.join(os.path.dirname(base_rel), path)).replace(os.sep, "/")
        if not path: path = "/" + base_rel
    path = unquote(path)
    fs = os.path.join(ROOT, path.lstrip("/"))
    if os.path.isdir(fs): fs = os.path.join(fs, "index.html")
    return fs, u.fragment

print("== Resource inventory: every citation points at a real file")
for r in RS.R:
    ok(os.path.exists(os.path.join(ROOT, r["file"])), "%s -> %s exists" % (r["id"], r["file"]))
    canon = r.get("read_url") or r["url"]
    ok(canon.startswith(RS.SITE + "/"), "%s URL is on drosiesworld.com or the DOI" % r["id"]) if not r.get("doi") else ok(r["url"] == "https://doi.org/" + RS.BOOK_DOI, "storybook uses the verified DOI URL")
ids = [r["id"] for r in RS.R]; ok(len(ids) == len(set(ids)), "resource ids are unique")
ok(sum(1 for r in RS.R if r.get("doi")) == 1, "exactly one DOI in the dataset (storybook)")

print("== cite/index.html links and anchors")
for page in ["cite/index.html"]:
    p = parse(page); bad = []
    for h in p.links:
        res = resolve(page, h)
        if res is None: continue
        fs, frag = res
        if not os.path.exists(fs): bad.append(h); continue
        if frag:
            tp = p if os.path.abspath(fs) == os.path.join(ROOT, page) else parse(os.path.relpath(fs, ROOT))
            if frag not in tp.ids: bad.append(h + " (missing anchor)")
    ok(not bad, "%s: all %d internal links/assets resolve %s" % (page, len(p.links), bad))
    ok(len(p.ids) == len(re.findall(r'\sid="', read(page))), "no duplicate element ids")
    ext = sorted({h for h in p.links if h.startswith("http") and "drosiesworld.com" not in h})
    print("  INFO external links (not fetched):", ext)

print("== Every 'Cite' link added across the site resolves to an anchor on /cite/")
cite_ids = parse("cite/index.html").ids; bad = []; n = 0
for dirpath, _, files in os.walk(ROOT):
    if any(x in dirpath for x in (".git", "node_modules", "/tests", "/seo")): continue
    for f in files:
        if not f.endswith(".html"): continue
        rel = os.path.relpath(os.path.join(dirpath, f), ROOT)
        for h in re.findall(r'href="([^"]*cite/[^"]*)"', read(rel)):
            if h.startswith("/cite/#") or h.startswith("cite/#") or h in ("/cite/", "cite/"):
                n += 1
                frag = urlparse(h).fragment
                if frag and frag not in cite_ids: bad.append((rel, h))
ok(n >= 25 and not bad, "%d cite links found, broken: %s" % (n, bad))

print("== Required placements")
want = {  # file -> substrings that must be present
 "index.html": ['href="cite/"'], "404.html": ['href="/cite/"'], "science-activities/index.html": ['href="/cite/"'],
 "fruit-fly-biology/index.html": ['href="/cite/"'], "fruit-fly-life-cycle-activities/index.html": ['href="/cite/"'],
 "teacher-resources/index.html": ['href="/cite/"', 'href="/cite/#teacher-resources"'] + ['href="/cite/#lesson-%d"' % i for i in range(1, 8)],
 "storybook.html": ['href="/cite/"', 'href="/cite/#storybook"'], "team.html": ['href="/cite/"'], "discoveries.html": ['href="/cite/"'],
 "life-cycle-game.html": ['href="/cite/"', 'href="/cite/#life-cycle-adventure"'], "grow-your-own-fruit-fly.html": ['href="/cite/"', 'href="/cite/#grow-your-own"'],
 "lab-notebook-academy.html": ['href="/cite/"', 'href="/cite/#notebook-academy"'], "scientific-conference.html": ['href="/cite/"', 'href="/cite/#conference"'],
 "conference-teacher-guide.html": ['href="/cite/"', 'href="/cite/#conference-guide"'], "climbing-game.html": ['href="/cite/#climbing-challenge"'],
 "drosie-genetics-lab/index.html": ['href="/cite/#genetics-lab"', 'href="/cite/"'], "drosie-genetics-lab/teacher/index.html": ['href="/cite/#genetics-teacher"'],
 "drosie-genetics-lab/teacher/worksheets.html": ['href="/cite/#genetics-worksheets"'], "drosie-genetics-lab/docs/index.html": ['href="/cite/#genetics-reference"'],
 "lab/index.html": ['href="/cite/#secret-fly-lab"'], "lab/js/teacher.js": ["/cite/#secret-fly-lab"], "letters/index.html": ['href="/cite/"'],
}
for f, subs in want.items():
    s = read(f); ok(all(x in s for x in subs), "%s has %s" % (f, [x for x in subs if x not in s] or "all required cite links"))

print("== Scholarly metadata + JSON-LD on resource pages")
def walk_types(o):
    if isinstance(o, dict):
        t = o.get("@type"); yield t if isinstance(t, list) else [t]
        for v in o.values(): yield from walk_types(v)
    elif isinstance(o, list):
        for v in o: yield from walk_types(v)
for r in RS.R:
    if r["id"].startswith("lesson-") or r["id"] == "platform": continue
    p = parse(r["file"]); m = {a.get("name"): a.get("content") for a in p.metas if a.get("name")}
    canon_tag = re.search(r'<link rel="canonical" href="([^"]+)"', read(r["file"]))
    expect = r.get("read_url") or r["url"]
    ok(m.get("citation_author") == "Arzoo, Shahira Helal" and m.get("author") == RS.AUTHOR_FULL and m.get("citation_title") and m.get("citation_public_url") == expect,
       "%s: author/title/URL meta present" % r["id"])
    ok(canon_tag is None or canon_tag.group(1) == expect, "%s: citation URL equals canonical (%s)" % (r["id"], expect))
    docs = []
    for blk in p.jsonld:
        try: docs.append(json.loads(blk))
        except Exception as e: ok(False, "%s: JSON-LD parses (%s)" % (r["id"], e))
    types = {t for d in docs for ts in walk_types(d) for t in ts}
    if r["id"] in ("teacher-resources", "fruit-fly-biology", "life-cycle-activities"):
        ok(bool(docs), "%s: existing JSON-LD retained" % r["id"]); continue
    mine = [d for d in docs if d.get("citation")]
    ok(len(mine) == 1, "%s: one citation JSON-LD block" % r["id"])
    d = mine[0]; ts = d["@type"] if isinstance(d["@type"], list) else [d["@type"]]
    ok(any(t in ("SoftwareApplication", "LearningResource", "Book") for t in ts), "%s: @type %s" % (r["id"], ts))
    ok(d["author"]["name"] == RS.AUTHOR_FULL and d["url"] == expect and d["name"] and d["description"], "%s: name/author/url/description" % r["id"])
    if "SoftwareApplication" in ts:
        ok(d["applicationCategory"] and d["operatingSystem"] and d["offers"]["price"] == "0", "%s: SoftwareApplication required props" % r["id"])
    if r["id"] == "storybook":
        ok(d["datePublished"] == "2026" and d["sameAs"] == "https://doi.org/" + RS.BOOK_DOI, "storybook: datePublished 2026 + Zenodo DOI")
    else:
        ok("datePublished" not in d, "%s: no invented datePublished" % r["id"])
    ok("sameAs" not in json.dumps(d.get("author")), "%s: no unverified author sameAs/ORCID" % r["id"])
ld = [json.loads(b) for b in parse("cite/index.html").jsonld]; ok(len(ld) == 1 and ld[0]["@graph"][0]["@type"] == "WebPage", "cite page WebPage + BreadcrumbList JSON-LD")

print("== Honesty guards")
allsrc = "".join(read(f) for f in ["cite/index.html", "CITATION.cff", "cite/drosies-world-bibliography.bib", "cite/drosies-world-bibliography.ris", "cite/drosies-world-bibliography.enw"])
ok(not re.search(r"orcid\.org|\b\d{4}-\d{4}-\d{4}-\d{3}[\dX]\b", allsrc, re.I), "no ORCID link or identifier (not verified)")
dois = {d.rstrip(".") for d in re.findall(r"10\.\d{4,9}/[^\s\"'<>)\]},]+", allsrc)}; ok(dois == {RS.BOOK_DOI}, "only the storybook DOI appears: %s" % dois)
page = read("cite/index.html")
ok("No software DOI is listed" in page and "Not yet available" in page, "software DOI section is a clearly-labelled placeholder")
for bad in ("peer-reviewed by", "endorsed by", "proven effective", "evidence-based", "improves learning outcomes", "owned by Texas Tech"):
    ok(bad.lower() not in page.lower(), "page does not contain %r" % bad)
ok("AI-assisted development disclosure" in page and "Claude Code" in page, "AI disclosure present")
ok("not mean that Texas Tech University publishes, endorses, sponsors or owns" in page, "affiliation disclaimer present")
dates = set(re.findall(r"First committed to GitHub</dt><dd>(\d{4}-\d{2}-\d{2})", page))
ok(dates <= {"2026-11-02", "2026-11-22", "2026-11-23"}, "only repository-history dates shown: %s" % sorted(dates))

print("== Bibliography files")
bib = read("cite/drosies-world-bibliography.bib"); keys = re.findall(r"^@misc\{([^,]+),", bib, re.M)
ok(len(keys) == len(RS.R) == len(set(keys)), "BibTeX: %d unique entries" % len(keys))
ok(all(e.count("{") == e.count("}") for e in re.split(r"\n@", bib)[1:]), "BibTeX: balanced braces")
ok(all(re.search(r"^\s+(author|title|year|url)\s+=", e, re.M) for e in bib.split("\n@")[1:]), "BibTeX: author/title/year/url in every entry")
rs = read("cite/drosies-world-bibliography.ris"); recs = [x for x in rs.strip().split("\n\n")]
ok(len(recs) == len(RS.R) and all(x.startswith("TY  - ") and x.rstrip().endswith("ER  -") for x in recs), "RIS: %d records, each TY...ER" % len(recs))
ok(all(re.match(r"^[A-Z][A-Z0-9]  - ", l) for l in rs.splitlines() if l.strip()), "RIS: every line is 'XX  - value'")
enw = read("cite/drosies-world-bibliography.enw"); ok(len(enw.strip().split("\n\n")) == len(RS.R) and enw.count("%0 ") == len(RS.R), "EndNote .enw: %d records" % len(RS.R))
for f in ("bib", "ris", "enw"): ok(("/cite/drosies-world-bibliography." + f) in page, "page links the .%s download" % f)

print("== CITATION.cff")
import yaml
y = yaml.safe_load(read("CITATION.cff"))
ok(y["cff-version"] == "1.2.0" and y["title"] and y["authors"][0]["family-names"] == "Arzoo", "CFF required keys")
ok("doi" not in y and "date-released" not in y and "version" not in y and "license" not in y and "orcid" not in json.dumps(y).lower(), "CFF has no software DOI/version/date/license/ORCID")
ok(y["references"][0]["doi"] == RS.BOOK_DOI, "CFF references the storybook DOI")
cc = shutil.which("cffconvert") or os.environ.get("CFFCONVERT")
if cc:
    r = subprocess.run([cc, "--validate", "-i", os.path.join(ROOT, "CITATION.cff")], capture_output=True, text=True)
    ok(r.returncode == 0, "cffconvert --validate: " + (r.stdout + r.stderr).strip().splitlines()[-1][:120])
else: print("  SKIP cffconvert not installed")

print("== Sitemap")
sm = read("sitemap.xml"); locs = re.findall(r"<loc>([^<]+)</loc>", sm)
ok("https://drosiesworld.com/cite/" in locs and len(locs) == len(set(locs)), "sitemap lists /cite/ once")
ok(sm.count("<url>") == sm.count("</url>"), "sitemap balanced")
bad = [l for l in locs if not resolve("sitemap.xml", l) or not os.path.exists(resolve("sitemap.xml", l)[0])]; ok(not bad, "every sitemap URL maps to a file %s" % bad)
ok(not any("/tests" in l or ".bib" in l for l in locs), "sitemap has no test/download URLs")

print("== Idempotent build")
before = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout
snap = {f: read(f) for f in ["cite/index.html", "CITATION.cff", "storybook.html", "scientific-conference.html"]}
subprocess.run([sys.executable, os.path.join(ROOT, "tools/citation/build_cite.py")], check=True, capture_output=True)
ok(all(read(f) == v for f, v in snap.items()), "re-running build_cite.py changes nothing")

print("\n%d passed, %d failed" % (passed, failed)); sys.exit(1 if failed else 0)
