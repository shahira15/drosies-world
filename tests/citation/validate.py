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
    ok(m.get("citation_author") == (r.get("creator") or "Arzoo, Shahira Helal") and m.get("author") == RS.AUTHOR_FULL and m.get("citation_title") and m.get("citation_public_url") == expect,
       "%s: author/title/URL meta present" % r["id"])
    ok(canon_tag is None or canon_tag.group(1) == expect, "%s: citation URL equals canonical (%s)" % (r["id"], expect))
    docs = []
    for blk in p.jsonld:
        try: docs.append(json.loads(blk))
        except Exception as e: ok(False, "%s: JSON-LD parses (%s)" % (r["id"], e))
    types = {t for d in docs for ts in walk_types(d) for t in ts}
    if r["id"] in ("teacher-resources", "fruit-fly-biology", "life-cycle-activities", "science-activities"):
        ok(bool(docs), "%s: existing JSON-LD retained" % r["id"]); continue
    mine = [d for d in docs if d.get("citation")]
    ok(len(mine) == 1, "%s: one citation JSON-LD block" % r["id"])
    d = mine[0]; ts = d["@type"] if isinstance(d["@type"], list) else [d["@type"]]
    ok(any(t in ("SoftwareApplication", "LearningResource", "Book") for t in ts), "%s: @type %s" % (r["id"], ts))
    ok(d["author"]["name"] == RS.AUTHOR_FULL and d["url"] == expect and d["name"] and d["description"], "%s: name/author/url/description" % r["id"])
    if "SoftwareApplication" in ts:
        ok(d["applicationCategory"] and d["operatingSystem"] and d["offers"]["price"] == "0", "%s: SoftwareApplication required props" % r["id"])
    if r["id"] == "storybook":
        ok(d["datePublished"] == "2026-10-22" and d["sameAs"] == "https://doi.org/" + RS.BOOK_DOI and d["license"].endswith("/by-nc-nd/4.0/"), "storybook: datePublished 2026-10-22, Zenodo DOI, CC BY-NC-ND 4.0 licence URL")
        ok(d["illustrator"]["name"] == "Letícia Cavalcanti", "storybook: illustrator preserved in JSON-LD")
        ok(m.get("citation_publication_date") == "2026/10/22" and m.get("citation_doi") == RS.BOOK_DOI and m.get("citation_author") == "Arzoo, Shahira", "storybook: dated meta, DOI, creator string as published on the record")
    else:
        ok("datePublished" not in d and "copyrightYear" not in d and "dateCreated" not in d, "%s: no inferred publication/copyright date in JSON-LD" % r["id"])
        ok("citation_publication_date" not in m, "%s: no citation_publication_date meta" % r["id"])
        ok("(n.d.)" in d["citation"], "%s: JSON-LD citation is undated (n.d.)" % r["id"])
    ok(d["author"].get("sameAs") == RS.ORCID and d["author"]["name"] == "Shahira Helal Arzoo", "%s: author has the verified ORCID and professional name" % r["id"])
ld = [json.loads(b) for b in parse("cite/index.html").jsonld]; ok(len(ld) == 1 and ld[0]["@graph"][0]["@type"] == "WebPage", "cite page WebPage + BreadcrumbList JSON-LD")

print("== Honesty guards")
allsrc = "".join(read(f) for f in ["cite/index.html", "CITATION.cff", "cite/drosies-world-bibliography.bib", "cite/drosies-world-bibliography.ris", "cite/drosies-world-bibliography.enw"])
orcids = set(re.findall(r"\b\d{4}-\d{4}-\d{4}-\d{3}[\dX]\b", allsrc)); ok(orcids == {"0009-0009-8947-7828"}, "only the verified ORCID appears: %s" % orcids)
def orcid_ok(o):
    t = 0
    for c in o.replace("-", "")[:-1]: t = (t + int(c)) * 2
    r = (12 - t % 11) % 11; return o[-1] == ("X" if r == 10 else str(r))
ok(orcid_ok("0009-0009-8947-7828"), "ORCID checksum valid")
ok("979-8--23424051-4" not in allsrc and "9798234240514" not in allsrc, "malformed ISBN is not published or 'corrected' anywhere in generated outputs")
meta = json.load(open(os.path.join(ROOT, "tools/citation/metadata.json"), encoding="utf-8"))
ok(meta["author"]["orcid"] == "https://orcid.org/0009-0009-8947-7828" and meta["license"] is None and meta["software"]["doi"] is None and meta["software"]["version"] is None and meta["educational_content_license"] is None, "metadata.json: ORCID set; software DOI/version/licence and educational licence unset")
ok(meta["book"]["license"] == "CC BY-NC-ND 4.0" and meta["book"]["published_date"] == "2026-10-22" and meta["book"]["concept_doi"] == "10.5281/zenodo.23550875" and meta["book"]["creator_as_published"] == "Arzoo, Shahira", "metadata.json: confirmed book record fields")
ok(meta["author"]["display_name"] == "Shahira Helal Arzoo" and meta["author"]["apa_name"] == "Arzoo, S. H.", "author name standardised (Shahira Helal Arzoo / Arzoo, S. H.)")
ck = read("tools/citation/VERIFICATION_CHECKLIST.md")
ok(len(meta["book"]["needs_manual_verification"]) == 2 and "ISBN" in ck and "979-8--23424051-4" in ck and "name" in ck.lower(), "checklist flags the name discrepancy and the malformed ISBN (verbatim, uncorrected)")
dois = {d.rstrip(".") for d in re.findall(r"10\.\d{4,9}/[^\s\"'<>)\]},]+", allsrc)}; ok(dois == {RS.BOOK_DOI, RS.CONCEPT_DOI}, "only the book's version and concept DOIs appear (no software DOI): %s" % dois)
page = read("cite/index.html")
ok("No software DOI is listed" in page and "Not yet available" in page, "software DOI section is a clearly-labelled placeholder")
for bad in ("peer-reviewed by", "endorsed by", "proven effective", "evidence-based", "improves learning outcomes", "owned by Texas Tech"):
    ok(bad.lower() not in page.lower(), "page does not contain %r" % bad)
ok("AI-assisted development disclosure" in page and "Claude Code" in page, "AI disclosure present")
ok("not mean that Texas Tech University publishes, endorses, sponsors or owns" in page, "affiliation disclaimer present")
ok("First committed" not in page and not re.search(r"\b2026-11-(02|22|23)\b", page), "no git-commit dates shown on the page")
ok(page.count("Not documented: cited as n.d.") == len(RS.R) - 1, "every non-storybook card says its date is not documented")
import formats as FM
for r in RS.R:
    a = FM.apa(r, acc=False)
    ok(("(2026)" in a) == (r["id"] == "storybook") and (("(n.d.)" in a) == (r["id"] != "storybook")), "%s: APA is %s" % (r["id"], "dated" if r["id"] == "storybook" else "n.d."))
for fn in (FM.apa, FM.mla, FM.chicago, FM.bibtex, FM.ris, FM.endnote):
    ok("Cavalcanti" in fn(RS.BY_ID["storybook"], acc=False) or fn is FM.endnote and "Cavalcanti" in fn(RS.BY_ID["storybook"]), "illustrator credited in storybook %s" % fn.__name__)
sb = RS.BY_ID["storybook"]
ok(FM.apa(sb, acc=False).startswith("Arzoo, S. (2026). *Drosie, the Fruit Fly* (Version 1.0; L. Cavalcanti, Illus.)"), "APA storybook: record's author string (Arzoo, S.), year only, Illus. convention")
ok("22 Oct. 2026" in FM.mla(sb) and "2026." in FM.chicago(sb) and "22 Oct" not in FM.chicago(sb) and "22" not in FM.apa(sb).split("Version")[0], "date detail follows each style: MLA full date, APA/Chicago year only")
ok("date         = {2026-10-22}" in FM.bibtex(sb) and "month        = oct" in FM.bibtex(sb) and "DA  - 2026/10/22" in FM.ris(sb), "BibTeX/RIS carry the full date")
ok("Arzoo, Shahira Helal" not in FM.bibtex(sb) and "Arzoo, Shahira Helal" in FM.bibtex(RS.BY_ID["secret-fly-lab"]), "storybook entries use the record's creator string; other entries use the professional name")
ok("Illustrated by Letícia Cavalcanti" in read("cite/drosies-world-bibliography.ris") and "Let{\\'\\i}cia" in read("cite/drosies-world-bibliography.bib"), "illustrator attribution in downloadable RIS and BibTeX")
ok("does not grant permission to reproduce" in page and "CC BY-NC-ND" in page and "reserved beyond permissions already granted" in page and "No open licence is declared" not in page, "page states the book licence, reserved rights and pending licences accurately")
ok("licensing for worksheets and other educational resources is pending" in page and "A software licence is not yet in effect" in page, "software and educational licensing shown as pending")
bib_entries = read("cite/drosies-world-bibliography.bib").split("@misc{")[1:]
ok(sum(1 for e in bib_entries if re.search(r"^\s+year\s+=", e, re.M)) == 1, "BibTeX: exactly one entry (storybook) has a year")
ok(sum(1 for e in read("cite/drosies-world-bibliography.ris").split("\n\n") if "\nPY  - " in e) == 1, "RIS: exactly one record (storybook) has PY")
ok("[[ACC" not in read("cite/drosies-world-bibliography.ris") + read("cite/drosies-world-bibliography.bib") + read("cite/drosies-world-bibliography.enw") + read("CITATION.cff"), "no access-date tokens leak into downloads")
ok("Retrieved" not in read("cite/drosies-world-bibliography.ris"), "downloads carry no hard-coded access dates")

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
ok("doi" not in y and "date-released" not in y and "version" not in y and "license" not in y, "CFF has no software DOI/version/date/license")
ok(y["authors"][0]["orcid"] == RS.ORCID and y["authors"][0]["given-names"] == "Shahira Helal", "CFF author: professional name + verified ORCID")
ref = y["references"][0]
ok(ref["doi"] == RS.BOOK_DOI and ref["license"] == "CC-BY-NC-ND-4.0" and ref["date-published"] == "2026-10-22" and ref["authors"][0]["given-names"] == "Shahira" and ref["authors"][0]["orcid"] == RS.ORCID, "CFF book reference: record author string, date, licence, ORCID, version DOI")
cc = shutil.which("cffconvert") or os.environ.get("CFFCONVERT")
if cc:
    r = subprocess.run([cc, "--validate", "-i", os.path.join(ROOT, "CITATION.cff")], capture_output=True, text=True)
    ok(r.returncode == 0, "cffconvert --validate: " + (r.stdout + r.stderr).strip().splitlines()[-1][:120])
else: print("  SKIP cffconvert not installed")

print("== .zenodo.json stays consistent with the single metadata source")
if os.path.exists(os.path.join(ROOT, ".zenodo.json")):
    z = json.load(open(os.path.join(ROOT, ".zenodo.json"), encoding="utf-8"))
    cr = z["creators"][0]
    ok(cr["name"] == "%s, %s" % (meta["author"]["family_names"], meta["author"]["given_names"]), ".zenodo.json creator = metadata.json author")
    ok(cr.get("orcid") == meta["author"]["orcid"].replace("https://orcid.org/", ""), ".zenodo.json ORCID = metadata.json ORCID")
    ok("license" not in z and "doi" not in z and (z.get("related_identifiers") or [{}])[0].get("identifier") == meta["book"]["doi"], ".zenodo.json has no licence or software DOI and references the book DOI")
else:
    print("  SKIP no .zenodo.json in this tree")

print("== Sitemap")
sm = read("sitemap.xml"); locs = re.findall(r"<loc>([^<]+)</loc>", sm)
ok("https://drosiesworld.com/cite/" in locs and len(locs) == len(set(locs)), "sitemap lists /cite/ once")
ok(sm.count("<url>") == sm.count("</url>"), "sitemap balanced")
bad = [l for l in locs if not resolve("sitemap.xml", l) or not os.path.exists(resolve("sitemap.xml", l)[0])]; ok(not bad, "every sitemap URL maps to a file %s" % bad)
ok(not any("/tests" in l or ".bib" in l for l in locs), "sitemap has no test/download URLs")

print("== Generator never overwrites verified or hand-maintained data")
import tempfile, importlib
sys.path.insert(0, os.path.join(ROOT, "tools", "citation"))
import build_cite as B
def guard_outcome(cff_text, metadata_env=None):
    """Run guard_cff against a temporary CITATION.cff; return None if allowed, else the refusal message."""
    with tempfile.TemporaryDirectory() as td:
        open(os.path.join(td, "CITATION.cff"), "w", encoding="utf-8").write(cff_text)
        old = B.ROOT; B.ROOT = td
        try: B.guard_cff(False); return None
        except SystemExit as e: return str(e)
        finally: B.ROOT = old
current = read("CITATION.cff")
import yaml
F_HEAD = "# Generated by tools/citation/build_cite.py from tools/citation/metadata.json.\n"
ok(guard_outcome(current) is None, "regenerating over its own unchanged CITATION.cff is allowed")
hand = "cff-version: 1.2.0\ntitle: x\nversion: '1.0.0'\ndate-released: '2026-11-24'\n"  # e.g. the hand-maintained release CFF
ok("not generated by this script" in (guard_outcome(hand) or ""), "refuses to overwrite a hand-maintained CITATION.cff")
ok("doi" in (guard_outcome(current + "doi: 10.5281/zenodo.99999999\n") or ""), "refuses to drop a DOI that is not in metadata.json")
_y = yaml.safe_load(current); _y["authors"][0]["orcid"] = "https://orcid.org/0000-0002-1825-0097"
ok("orcid" in (guard_outcome(F_HEAD + yaml.safe_dump(_y, sort_keys=False)) or ""), "refuses to drop an ORCID that is not in metadata.json")
ok("license" in (guard_outcome(current + "license: MIT\n") or ""), "refuses to drop a licence that is not in metadata.json")
ok("version" in (guard_outcome(current + "version: '1.0.0'\n") or ""), "refuses to drop a version that is not in metadata.json")
# A verified software DOI entered in metadata.json flows through to the CFF and the page model (fake value, subprocess only)
with tempfile.TemporaryDirectory() as td:
    m = json.loads(json.dumps(meta)); m["software"].update({"doi": "10.0000/test.fake", "version": "9.9.9", "date_released": "2030-01-01"}); m["author"]["orcid"] = "https://orcid.org/0000-0000-0000-0000"
    mp = os.path.join(td, "m.json"); json.dump(m, open(mp, "w"))
    out = subprocess.run([sys.executable, "-c", "import sys,json; sys.path.insert(0,'%s/tools/citation'); import formats as F, resources as R; d=F.cff_data(); print(json.dumps([d.get('doi'), d.get('version'), d.get('date-released'), d['authors'][0].get('orcid'), [r['id'] for r in R.R if r['group']=='software']]))" % ROOT],
                         env=dict(os.environ, DROSIE_CITE_METADATA=mp), capture_output=True, text=True)
    ok(out.returncode == 0 and json.loads(out.stdout) == ["10.0000/test.fake", "9.9.9", "2030-01-01", "https://orcid.org/0000-0000-0000-0000", ["software-archive"]], "verified values entered in metadata.json flow into CFF + citable list: " + out.stdout.strip()[:100] + out.stderr[-100:])
ok(not B.BY_ID.get("software-archive"), "default build has no software-archive entry")

print("== Idempotent build")
before = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout
snap = {f: read(f) for f in ["cite/index.html", "CITATION.cff", "storybook.html", "scientific-conference.html"]}
subprocess.run([sys.executable, os.path.join(ROOT, "tools/citation/build_cite.py")], check=True, capture_output=True)
ok(all(read(f) == v for f, v in snap.items()), "re-running build_cite.py changes nothing")

print("\n%d passed, %d failed" % (passed, failed)); sys.exit(1 if failed else 0)
