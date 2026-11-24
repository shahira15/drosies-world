#!/usr/bin/env python3
"""Generate the citation hub: cite/index.html, cite/drosies-world.bib, cite/drosies-world.ris, cite/CITATION.cff.

Single source of truth for the data is RESOURCES below. Re-run after editing:  python3 tools/build_cite.py
No identifier is invented: the software DOI is intentionally absent until Zenodo assigns one; the ORCID is omitted
until the author supplies a verified one. The book DOI was verified against the live Zenodo API on 2026-11-24.
"""
import html, os, shutil, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "cite")
SITE = "https://drosiesworld.com"
YEAR = "2026"
VERSION = "1.0.0"
AUTHOR_BIB = "Arzoo, Shahira Helal"
AUTHOR_APA = "Arzoo, S. H."
AUTHOR_MLA = "Arzoo, Shahira Helal"
PUBLISHER = "Drosie's World"

# id, title, path (relative to site root), kind ('software' | 'webpage'), one-line description
RESOURCES = [
    ("platform", "Drosie's World: An Interactive Educational Software Platform for Entomology and Scientific Inquiry", "/", "software",
     "The whole platform (all activities, simulations and teacher resources)."),
    ("genetics-lab", "Drosie Genetics Lab", "/drosie-genetics-lab/", "software", "Fruit fly genetics simulator (Punnett squares, linkage, chi-square)."),
    ("secret-fly-lab", "The Secret Fly Lab", "/lab/", "software", "Safety Academy, microscope skills and fly anatomy game for ages 5 to 8."),
    ("life-cycle-adventure", "Drosie's Life Cycle Adventure", "/life-cycle-game.html", "software", "Interactive fruit fly life cycle adventure."),
    ("grow-your-own-fruit-fly", "Grow Your Own Fruit Fly", "/grow-your-own-fruit-fly.html", "software", "Virtual fly-culture laboratory."),
    ("climbing-challenge", "Drosie's Climbing Challenge", "/climbing-game.html", "software", "Simulated climbing assay for practising experiments."),
    ("lab-notebook-academy", "Drosie's Lab Notebook Academy", "/lab-notebook-academy.html", "software", "Practice in keeping honest laboratory records."),
    ("scientific-conference", "Drosie's First Scientific Conference", "/scientific-conference.html", "software", "Simulated science conference: experiment, abstract, poster, talk."),
    ("letters", "Letters from Drosie", "/letters/", "software", "Interactive mailbox of short science letters."),
    ("storybook-reader", "Drosie's Magical Storybook (online reader)", "/storybook.html", "software", "Online reader for the illustrated storybook."),
    ("discovery-library", "Drosie's Discovery Library", "/discoveries.html", "webpage", "Real fruit fly research explained for children."),
    ("fruit-fly-biology", "Fruit Fly Biology for Students and Teachers", "/fruit-fly-biology/", "webpage", "Reference page on Drosophila melanogaster with references."),
    ("life-cycle-activities", "Fruit Fly Life Cycle Activities", "/fruit-fly-life-cycle-activities/", "webpage", "Lesson page with activities and discussion questions."),
    ("science-activities", "Free Science Activities for Kids", "/science-activities/", "webpage", "Hub of activities by age."),
    ("teacher-resources", "Teacher Resources", "/teacher-resources/", "webpage", "Lesson plans, activity sheets and classroom guidance."),
]
BOOK = dict(id="book", title="Drosie, the Fruit Fly", doi="10.5281/zenodo.23550876", version="1.0", year="2026",
            illustrator="Letícia Cavalcanti")

def url(path): return SITE + (path if path != "/" else "/")
def short(path): return (SITE.replace("https://", "") + (path if path != "/" else "")).rstrip("/") if path != "/" else SITE.replace("https://", "")

def kind_label(kind): return "Computer software" if kind == "software" else "Web page"
def sentence_case(t):
    """APA wants sentence case for titles of standalone works; keep proper nouns we know."""
    keep = {"Drosie", "Drosie's", "World", "Genetics", "Secret", "Fly", "Lab", "Notebook", "Academy", "Scientific", "Conference", "Drosophila", "Letters", "Climbing", "Challenge", "Discovery", "Library", "Magical", "Storybook", "Life", "Cycle", "Adventure", "Grow", "Your", "Own", "Fruit"}
    return t  # APA 7 allows title case for software names; we keep the published titles unchanged

def cites(r):
    rid, title, path, kind, _ = r
    u = url(path); lab = kind_label(kind)
    ver = f" (Version {VERSION})" if kind == "software" else ""
    out = {}
    out["APA"] = (f"{AUTHOR_APA} ({YEAR}). <i>{html.escape(title)}</i>{ver} [{lab}]. {PUBLISHER}. {u}", )
    out["MLA"] = (f"{AUTHOR_MLA}. <i>{html.escape(title)}</i>." + (f" Version {VERSION}," if kind == "software" else "") + f" {PUBLISHER}, {YEAR}, {short(path)}.",)
    out["Chicago"] = (f"{AUTHOR_BIB}. {YEAR}. <i>{html.escape(title)}</i>." + (f" Version {VERSION}." if kind == "software" else "") + f" {PUBLISHER}. {u}.",)
    key = "arzoo" + YEAR + "_" + re.sub(r"[^a-z0-9]", "", rid.replace("-", ""))
    typ = "software" if kind == "software" else "misc"
    fields = [("author", AUTHOR_BIB), ("title", title), ("year", YEAR)]
    if kind == "software": fields.append(("version", VERSION))
    fields += [("publisher", PUBLISHER), ("url", u)]
    note = "Software DOI not yet assigned" if rid == "platform" else ("Part of the Drosie's World platform, version " + VERSION)
    fields.append(("note", note))
    out["BibTeX"] = (f"@{typ}{{{key},\n" + ",\n".join(f"  {k} = {{{v}}}" for k, v in fields) + "\n}",)
    ty = "COMP" if kind == "software" else "ELEC"
    ris = [f"TY  - {ty}", f"AU  - {AUTHOR_BIB}", f"TI  - {title}", f"PY  - {YEAR}", f"PB  - {PUBLISHER}"]
    if kind == "software": ris.append(f"ET  - {VERSION}")
    ris += [f"UR  - {u}", f"N1  - {note}", "ER  - "]
    out["RIS"] = ("\n".join(ris),)
    return {k: v[0] for k, v in out.items()}, key

def book_cites():
    b = BOOK; u = "https://doi.org/" + b["doi"]
    c = {}
    c["APA"] = f"{AUTHOR_APA} ({b['year']}). <i>Drosie, the fruit fly</i> ({b['illustrator'].split()[0][0]}. Cavalcanti, Illus.; Version {b['version']}) [Book]. Zenodo. {u}"
    c["MLA"] = f"{AUTHOR_MLA}. <i>Drosie, the Fruit Fly</i>. Illustrated by {b['illustrator']}, version {b['version']}, Zenodo, {b['year']}, doi.org/{b['doi']}."
    c["Chicago"] = f"{AUTHOR_BIB}. {b['year']}. <i>Drosie, the Fruit Fly</i>. Illustrated by {b['illustrator']}. Version {b['version']}. Zenodo. {u}."
    c["BibTeX"] = ("@book{arzoo2026book,\n  author = {Arzoo, Shahira},\n  title = {Drosie, the Fruit Fly},\n  year = {2026},\n  edition = {1.0},\n"
                   "  publisher = {Zenodo},\n  doi = {10.5281/zenodo.23550876},\n  url = {https://doi.org/10.5281/zenodo.23550876},\n  note = {Illustrated by Let\\'icia Cavalcanti}\n}")
    c["RIS"] = "\n".join(["TY  - BOOK", "AU  - Arzoo, Shahira", "TI  - Drosie, the Fruit Fly", "PY  - 2026", "ET  - 1.0", "PB  - Zenodo",
                          "DO  - 10.5281/zenodo.23550876", "UR  - https://doi.org/10.5281/zenodo.23550876", "N1  - Illustrated by Letícia Cavalcanti", "ER  - "])
    return c

def plain(s): return html.unescape(re.sub(r"</?i>", "", s))

FORMATS = ["APA", "MLA", "Chicago", "BibTeX", "RIS"]

def block(cid, fmt, text):
    esc = text if fmt in ("APA", "MLA", "Chicago") else html.escape(text)
    tag = "p" if fmt in ("APA", "MLA", "Chicago") else "pre"
    return (f'<div class="cite-fmt"><div class="cite-fmt-head"><strong>{fmt}</strong>'
            f'<button type="button" class="button button-light cite-copy" data-target="{cid}-{fmt}" aria-label="Copy {fmt} citation">Copy</button></div>'
            f'<{tag} class="cite-text" id="{cid}-{fmt}" tabindex="0">{esc}</{tag}></div>')

def section_for(title, cid, c, extra=""):
    inner = "".join(block(cid, f, c[f]) for f in FORMATS)
    return f'<article class="cite-item" id="{cid}"><h3>{html.escape(title)}</h3>{extra}{inner}</article>'

def build():
    os.makedirs(OUT, exist_ok=True)
    allbib, allris = [], []
    items = []
    for r in RESOURCES:
        c, key = cites(r); allbib.append(c["BibTeX"]); allris.append(c["RIS"])
        items.append((r, c))
    bc = book_cites(); allbib.append(bc["BibTeX"]); allris.append(bc["RIS"])
    open(os.path.join(OUT, "drosies-world.bib"), "w", encoding="utf8").write(
        "% Drosie's World citation records (generated by tools/build_cite.py). Software DOI: not yet assigned.\n\n" + "\n\n".join(allbib) + "\n")
    open(os.path.join(OUT, "drosies-world.ris"), "w", encoding="utf8").write("\n".join(allris) + "\n")
    shutil.copyfile(os.path.join(ROOT, "CITATION.cff"), os.path.join(OUT, "CITATION.cff"))

    plat_r, plat_c = items[0]
    platform = section_for("Drosie's World (the whole platform)", "platform", plat_c,
                           f'<p class="cite-note">Version {VERSION} (provisional). Cite the platform when you use several activities or the software as a whole.</p>')
    book = section_for("Drosie, the Fruit Fly (companion storybook)", "book", bc,
                       '<p class="cite-note">The book has its own DOI, <a href="https://doi.org/10.5281/zenodo.23550876" rel="noopener">10.5281/zenodo.23550876</a>, '
                       'confirmed against the Zenodo record on 2026-11-24 (published 2026-10-22; open access; licence CC BY-NC-ND 4.0). Illustrated by Let&iacute;cia Cavalcanti. '
                       'The book and the software are separate scholarly outputs: cite the book for the story and illustrations, the platform for the software.</p>')
    res = "".join(f'<details class="cite-res" id="res-{r[0]}"><summary><strong>{html.escape(r[1])}</strong> <span class="cite-sum">{html.escape(r[4])}</span></summary>'
                  + section_for(r[1], r[0], c) + "</details>" for r, c in items[1:])
    jsonld = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "WebPage", "@id": SITE + "/cite/#page", "url": SITE + "/cite/", "name": "Cite Drosie's World", "inLanguage": "en",
             "description": "How to cite Drosie's World and its individual educational resources, in APA, MLA, Chicago, BibTeX and RIS formats.",
             "isPartOf": {"@id": SITE + "/#website"}, "dateModified": "2026-11-24", "relatedLink": "https://doi.org/10.5281/zenodo.23550876"},
            {"@type": "SoftwareApplication", "@id": SITE + "/#software", "name": plat_r[1], "softwareVersion": VERSION, "url": SITE + "/",
             "applicationCategory": "EducationalApplication", "operatingSystem": "Any (web browser)", "inLanguage": "en",
             "author": {"@type": "Person", "name": "Shahira Helal Arzoo", "affiliation": {"@type": "CollegeOrUniversity", "name": "Texas Tech University"}},
             "citation": {"@type": "Book", "name": "Drosie, the Fruit Fly", "sameAs": "https://doi.org/10.5281/zenodo.23550876"}},
        ]}
    import json
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f7f6ee">
<title>Cite Drosie's World: Citation Formats and Downloads | Drosie's World</title>
<meta name="description" content="How to cite Drosie's World and each of its educational resources in APA, MLA, Chicago, BibTeX and RIS, with copy buttons and downloadable citation files.">
<link rel="canonical" href="{SITE}/cite/">
<meta property="og:type" content="website"><meta property="og:title" content="Cite Drosie's World"><meta property="og:description" content="Recommended citations for Drosie's World and its educational resources, in five formats."><meta property="og:url" content="{SITE}/cite/"><meta property="og:site_name" content="Drosie's World">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/seo-pages.css">
<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>
<style>
.cite-wrap{{max-width:900px;margin:0 auto;padding:0 16px 3rem}}
.cite-item{{background:#fff;border:1px solid #dfe7de;border-radius:16px;padding:1.1rem 1.2rem;margin:1rem 0}}
.cite-item h3{{margin:.1rem 0 .6rem}}
.cite-fmt{{margin:.7rem 0}}
.cite-fmt-head{{display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.25rem}}
.cite-text{{margin:0;padding:.6rem .75rem;background:#f7f6ee;border:1px solid #e3e9e1;border-radius:10px;overflow-wrap:anywhere;white-space:pre-wrap;font-size:.95rem;line-height:1.5}}
pre.cite-text{{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.85rem}}
.cite-copy{{padding:.35rem .9rem;min-height:2.5rem}}
.cite-note{{color:#4a5f55;margin:.2rem 0 .8rem}}
.cite-res{{background:#fff;border:1px solid #dfe7de;border-radius:14px;margin:.7rem 0;padding:.4rem 1rem}}
.cite-res summary{{cursor:pointer;padding:.5rem 0}}
.cite-res summary .cite-sum{{display:block;font-weight:400;color:#4a5f55;font-size:.92rem}}
.cite-res .cite-item{{border:0;padding:.2rem 0;margin:0}}
.cite-res .cite-item h3{{display:none}}
.cite-status{{position:sticky;bottom:12px;margin:1rem 0 0;padding:.6rem 1rem;background:#245f55;color:#fff;border-radius:12px;text-align:center;min-height:1.5rem}}
.cite-status:empty{{visibility:hidden}}
.cite-dl{{display:flex;flex-wrap:wrap;gap:.6rem;margin:.6rem 0}}
.cite-todo{{background:#fff8e6;border:1px solid #ecd9a0;border-radius:12px;padding:.8rem 1rem}}
</style>
</head><body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="nav-wrap"><a href="/" class="brand" aria-label="Drosie's World home"><span class="brand-mark">✿</span><span>Drosie's <em>World</em></span></a><button id="menuButton" class="menu-button" aria-label="Open navigation" aria-expanded="false" aria-controls="navLinks">☰</button><nav id="navLinks" class="nav-links" aria-label="Main navigation"><a href="/">Home</a><a href="/science-activities/">Science Activities</a><a href="/scientific-conference.html">Conference</a><a href="/fruit-fly-biology/">Fruit Fly Biology</a><a href="/teacher-resources/">For Teachers</a><a href="/storybook.html">Storybook</a><a href="/lab/">Secret Fly Lab</a><a href="/drosie-genetics-lab/">Genetics Lab</a><a href="/discoveries.html">Discoveries</a><a href="/team.html">Team</a><a href="/cite/" aria-current="page">Cite</a></nav></div></header>
<main id="main">
<section class="hub-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Drosie's World</a> › Cite</nav>
<span class="eyebrow"><span class="tiny-star">✳</span> For researchers, teachers and students</span>
<h1>Cite Drosie's World</h1>
<p>Please cite the platform, or the specific resource you used. Each citation is available in APA, MLA, Chicago, BibTeX and RIS, with a copy button. Add the date you accessed the page if your style guide asks for it.</p>
<div class="hub-jump"><a class="button button-dark" href="#platform">Platform citation</a><a class="button button-light" href="#software-doi">Software DOI</a><a class="button button-light" href="#book">The book</a><a class="button button-light" href="#resources">Individual resources</a><a class="button button-light" href="#downloads">Downloads</a><a class="button button-light" href="#creators">Creators &amp; AI disclosure</a></div></div></section>
<div class="cite-wrap">
<h2 id="recommended">Recommended platform citation</h2>
{platform}
<h2 id="software-doi">Software DOI</h2>
<div class="cite-todo"><p><strong>Not yet assigned.</strong> A permanent, versioned archive of the software on Zenodo is being prepared. Until a DOI exists, cite the website address and the version shown above. When the DOI has been issued it will be added here and to the downloadable files; no identifier is shown before then.</p></div>
<h2 id="book-heading">Companion book</h2>
{book}
<h2 id="resources">Individual educational resources</h2>
<p>Open a resource to see its citations. Software titles describe the interactive activity; web page titles describe reading and reference pages.</p>
{res}
<h2 id="downloads">Downloadable citation files</h2>
<div class="cite-dl"><a class="button button-dark" href="/cite/drosies-world.bib" download>BibTeX (.bib), all resources</a><a class="button button-dark" href="/cite/drosies-world.ris" download>RIS (.ris), all resources</a><a class="button button-light" href="/cite/CITATION.cff" download>CITATION.cff (software)</a></div>
<h2 id="creators">Creator information</h2>
<ul>
<li><strong>Creator and author:</strong> Shahira Helal Arzoo, doctoral researcher in Biological Sciences, Texas Tech University. Project creator; directs the scientific and educational development of the platform.</li>
<li><strong>Illustrator of the storybook:</strong> Let&iacute;cia Cavalcanti. Illustrations are credited to her and are not covered by any open software licence.</li>
<li><strong>ORCID:</strong> to be added when the author supplies a verified identifier.</li>
</ul>
<h2 id="ai">AI-assisted development disclosure</h2>
<p>Drosie's World was developed with the help of generative AI tools. The creator directs the scientific and educational content and is responsible for it. <strong>ChatGPT</strong> (OpenAI) assisted with project conceptualisation, brainstorming, educational content development, simulation specifications, scientific explanations, prompt development, code generation, troubleshooting and feature planning. <strong>Claude Code</strong> (Anthropic) assisted with repository-level implementation, interface development, code generation, debugging, testing, documentation and release preparation. Not all code or content was written by hand, and AI tools are not listed as authors. No student learning outcomes have been established for these resources; the software documents technical functionality only.</p>
<p class="cite-note">Full details: <code>docs/AI_DISCLOSURE.md</code> in the project repository.</p>
<div id="cite-status" class="cite-status" role="status" aria-live="polite"></div>
</div>
</main>
<footer class="footer"><div class="container footer-top"><div><a href="/" class="brand"><span class="brand-mark">✿</span><span>Drosie's <em>World</em></span></a><p>Tiny fly. Big discoveries.<br>Free science learning for curious minds.</p></div><div class="footer-nav"><a href="/science-activities/">Science Activities</a><a href="/fruit-fly-biology/">Fruit Fly Biology</a><a href="/teacher-resources/">Teacher Resources</a><a href="/cite/">Cite</a><a href="/team.html">Team</a></div></div><div class="container footer-bottom"><span>© <span id="year">2026</span> Drosie's World. Created with curiosity.</span><span>For educational use · Please credit the creator when sharing.</span></div></footer>
<script src="/script.js" defer></script>
<script>
(function(){{
  var status=document.getElementById('cite-status');
  function say(m){{status.textContent=m;clearTimeout(say.t);say.t=setTimeout(function(){{status.textContent='';}},2500);}}
  function legacy(text){{var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();var ok=false;try{{ok=document.execCommand('copy');}}catch(e){{}}document.body.removeChild(ta);return ok;}}
  document.addEventListener('click',function(e){{
    var b=e.target.closest('.cite-copy');if(!b)return;
    var el=document.getElementById(b.getAttribute('data-target'));if(!el)return;
    var text=el.innerText.trim(), htmlText=el.tagName==='P'?el.innerHTML:null;
    function done(ok){{say(ok?'Copied the '+b.getAttribute('aria-label').replace('Copy ','')+'.':'Copy failed. Select the text and copy it manually.');}}
    if(navigator.clipboard&&window.ClipboardItem&&htmlText){{
      navigator.clipboard.write([new ClipboardItem({{'text/plain':new Blob([text],{{type:'text/plain'}}),'text/html':new Blob([htmlText],{{type:'text/html'}})}})]).then(function(){{done(true);}},function(){{done(legacy(text));}});
    }}else if(navigator.clipboard&&navigator.clipboard.writeText){{
      navigator.clipboard.writeText(text).then(function(){{done(true);}},function(){{done(legacy(text));}});
    }}else{{done(legacy(text));}}
  }});
  if(location.hash){{var t=document.querySelector(location.hash.replace(/[^#\\w-]/g,''));var d=t&&t.closest&&t.closest('details');if(d)d.open=true;}}
  var m=location.hash.match(/^#res-/);
}})();
</script>
</body></html>
"""
    # resources can be linked as /cite/#<id>; open the matching <details> on arrival
    open(os.path.join(OUT, "index.html"), "w", encoding="utf8").write(page)
    return len(items) + 1

if __name__ == "__main__":
    print("generated", build(), "citation entries")
