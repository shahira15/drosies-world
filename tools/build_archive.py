#!/usr/bin/env python3
"""Build the self-contained, offline ARCHIVAL EDITION of Drosie's World as deterministic ZIP files.

The live site's source files are NOT modified. This script derives the archival edition from the
committed files by applying documented, asserted transformations (see docs/ARCHIVAL_EDITION.md):

  * removes the live Supabase/Turnstile feedback form, the GoatCounter analytics, the visitor-counter
    fetch, the Leaflet/OpenStreetMap map (and its adult-email request form), Google Fonts and the
    YouTube embed, so that the archived software makes NO network requests to third parties;
  * serves page-flip (MIT) from a vendored copy instead of a CDN;
  * rewrites root-absolute links ("/x.html") to relative links so the folder works from file:// or any path;
  * replaces portrait photographs with a neutral placeholder (personal images are never included);
  * edition "full": keeps the original illustrations/mascot images used by the pages
    (rights and contractual scope to be verified by the author before any upload; see ASSET_LICENSES.md);
    edition "placeholders": replaces every illustration with a neutral generated placeholder of the same size.

Usage:
    python3 tools/build_archive.py                    # build both editions into release/
    python3 tools/build_archive.py --edition full
    python3 tools/build_archive.py --edition placeholders
    python3 tools/build_archive.py --check            # rebuild to temp files and compare to release/
    python3 tools/build_archive.py --extract DIR --edition full   # unpack an edition tree into DIR (for testing)
    python3 tools/build_archive.py --list --edition full

Requires: git, Python 3 and Pillow (only for the placeholder edition and placeholder portraits).
Licensing is NOT finalised by this script: licences ship as PROPOSED files (licenses/MIT.PROPOSED.txt).
"""
import argparse, hashlib, io, os, re, subprocess, sys, tempfile, zipfile

VERSION = "1.0.0"
FIXED_TIME = (2026, 11, 24, 0, 0, 0)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(ROOT, "release")
EDITIONS = {"full": "archival-full", "placeholders": "archival-placeholders"}

# ----------------------------------------------------------------------------- file selection
DROP_PREFIX = [
    ("release/", None),  # build outputs; skipped silently so they cannot change the archive
    ("docs/conference-visual/screens/", "QA screenshots (derived from interface artwork), not needed"),
    ("book-pages/", "full-size PNG masters of storybook pages (the 56 web copies in book-pages-web/ are what the reader uses)"),
]
DROP_EXACT = {
    "CNAME": "deployment configuration for the author's domain",
    "Virtual lab": "stray 1-byte file",
    "shahira-photo.png": "personal photograph: not included without documented consent",
    "illustrator.jpeg": "personal photograph: not included without documented consent",
    "images/shahira-photo-900.webp": "personal photograph: not included without documented consent",
    "drosie adult.png": "full-size master image, not used by any page",
    "drosie egg.png": "full-size master image, not used by any page",
    "drosie larva.png": "full-size master image, not used by any page",
    "drosie larva1.png": "full-size master image, not used by any page",
    "drosie pupa.png": "full-size master image, not used by any page",
    "drosie.png.png": "full-size master image (odd file name), not used by any page",
    "drosie-book-cover.png": "full-size master image, not used by any page (a 640 px web copy is in images/)",
    "my-microscope.png": "full-size master image, not used by any page",
    "fruit bowl.png": "full-size master image, not used by any page",
    "tools/build_release.py": "superseded by tools/build_archive.py",
}
# Illustration / mascot / brand files that are kept in the "full" edition and replaced by neutral
# placeholders in the "placeholders" edition. (Portraits are in DROP_EXACT and replaced in both editions.)
ART_PREFIX = ["book-pages-web/", "images/", "climbing-game-assets/", "science-activities/img/",
              "fruit-fly-life-cycle-activities/img/"]
ART_EXACT = {"drosie-mascot.svg", "favicon.svg", "Certificate.pdf", "letters/assets/illustrations/sprig.svg",
             "letters/assets/illustrations/wax-seal.svg", "drosie-genetics-lab/assets/favicon.svg"}
ART_EXT_UNDER = {"life-cycle-assets/": (".webp", ".png", ".jpg", ".jpeg")}

# Files that are generic decorative SVG, not character/brand art: kept as-is in both editions.
KEEP_ART_BOTH = {"letters/assets/illustrations/sprig.svg", "letters/assets/illustrations/wax-seal.svg",
                 "drosie-genetics-lab/assets/favicon.svg"}

PORTRAIT_PLACEHOLDER = "archival-placeholders/portrait-placeholder.svg"

def git_files():
    out = subprocess.run(["git", "ls-files", "-z"], cwd=ROOT, check=True, capture_output=True).stdout
    return sorted(p for p in out.decode("utf-8").split("\0") if p)

def is_art(path):
    if path in KEEP_ART_BOTH:
        return False
    if path in ART_EXACT:
        return True
    if any(path.startswith(p) for p in ART_PREFIX):
        return True
    for pre, exts in ART_EXT_UNDER.items():
        if path.startswith(pre) and path.lower().endswith(exts):
            return True
    return False

def drop_reason(path):
    if path in DROP_EXACT:
        return DROP_EXACT[path]
    for pre, why in DROP_PREFIX:
        if path.startswith(pre):
            return why or "SILENT"
    return None

# ----------------------------------------------------------------------------- transformations
class PatchError(Exception):
    pass

def sub(text, pattern, repl, expect, path, flags=re.DOTALL, literal=False):
    if literal:
        n = text.count(pattern)
        if n != expect:
            raise PatchError(f"{path}: expected {expect} match(es) of literal {pattern[:60]!r}, found {n}")
        return text.replace(pattern, repl)
    new, n = re.subn(pattern, repl, text, flags=flags)
    if n != expect:
        raise PatchError(f"{path}: expected {expect} match(es) of /{pattern[:60]}/, found {n}")
    return new

NOTICE_STYLE = 'style="background:#eaf5ea;padding:40px 20px;text-align:center;color:#285a43"'
def notice(title, body):
    return (f'<section {NOTICE_STYLE} aria-label="{title}"><h2 style="margin:0 0 .5rem">{title}</h2>'
            f'<p style="max-width:42rem;margin:0 auto">{body}</p></section>')

BANNER = ('<div role="note" style="background:#fff3cd;color:#3b2f00;padding:8px 14px;text-align:center;font:14px/1.4 system-ui,sans-serif">'
          "Archival edition v%s of Drosie's World. Works offline; no data is sent anywhere. "
          'Feedback, analytics, the visitor counter, the outreach map and the embedded video of the live site are not included. '
          'See <a href="ARCHIVAL_EDITION.md">ARCHIVAL_EDITION.md</a>.</div>' % VERSION)

def rel_prefix(path):
    depth = path.count("/")
    return "../" * depth if depth else ""

def relativize(html, path):
    pre = rel_prefix(path)
    def fix(m):
        attr, url = m.group(1), m.group(2)
        if url.startswith("//"):
            return m.group(0)
        frag = ""
        if "#" in url:
            url, frag = url.split("#", 1); frag = "#" + frag
        if "?" in url:
            url, q = url.split("?", 1); q = "?" + q
        else:
            q = ""
        target = url[1:]
        if target == "" or target.endswith("/"):
            target += "index.html"
        return f'{attr}="{pre}{target}{q}{frag}"'
    html = re.sub(r'\b(href|src|action)="(/[^"]*)"', fix, html)
    # relative directory links ("x/", "../x/") do not open index.html from file://: make them explicit
    def fixdir(m):
        attr, url = m.group(1), m.group(2)
        if re.match(r'^(https?:|mailto:|tel:|data:|javascript:|#|//)', url):
            return m.group(0)
        return f'{attr}="{url}index.html"'
    return re.sub(r'\b(href|src|action)="([^"#?]*/)"', fixdir, html)

def transform_text(path, text):
    """Apply the archival-edition transformations to one text file; returns new text."""
    if path.endswith(".html") and not path.startswith(("docs/", "tests/", "drosie-genetics-lab/docs/")):
        # analytics script (any page)
        text = re.sub(r'(?:<!--[^>]*GoatCounter[^>]*-->\s*)?<script\b[^>]*\bsrc="https://gc\.zgo\.at/count\.js"[^>]*>\s*</script>', "", text, flags=re.DOTALL)
        if path == "index.html":
            text = sub(text, r"<!-- Website visitor counter -->.*?</section>",
                       notice("Our Growing Community", "The live website shows a visit counter. It is not part of the archival edition, which contacts no external service."), 1, path)
            text = sub(text, r'<script>\s*window\.addEventListener\("load", function \(\) \{\s*const counter = document\.getElementById\("drosie-visit-count"\);.*?</script>', "", 1, path)
            text = sub(text, r"<!-- DROSIE FEEDBACK SECTION -->.*?<!-- END DROSIE FEEDBACK SECTION -->",
                       notice("Feedback", "Feedback submission is disabled in the archival edition. To contact the project, use the contact details in the repository README."), 1, path)
            text = sub(text, r"<!-- START DROSIE GLOBAL MAP.*?<!-- END DROSIE GLOBAL MAP -->",
                       notice("Drosie Around the World", "The live site shows an outreach map built with a third-party map library and tiles, and an outreach-contact form. Both are omitted from the archival edition."), 1, path)
            text = sub(text, "</head><body>", "</head><body>" + BANNER, 1, path, literal=True)
        if path == "letters/index.html":
            text = sub(text, r'\s*<link rel="preconnect" href="https://fonts\.googleapis\.com">', "", 1, path)
            text = sub(text, r'\s*<link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin>', "", 1, path)
            text = sub(text, r'\s*<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2[^"]*">', "", 1, path)
        if path == "storybook.html":
            text = sub(text, "https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js",
                       "vendor/page-flip/page-flip.browser.js", 1, path, literal=True)
        if path == "discoveries.html":
            text = sub(text, r'<iframe src="https://www\.youtube-nocookie\.com/embed/[^>]*></iframe>',
                       '<p>The embedded video of the live site is not included in the archival edition. A link to the original is given below.</p>', 1, path)
        if path == "team.html":
            text = sub(text, "images/shahira-photo-900.webp", PORTRAIT_PLACEHOLDER, 1, path, literal=True)
            text = sub(text, 'src="illustrator.jpeg"', f'src="{PORTRAIT_PLACEHOLDER}"', 1, path, literal=True)
        text = relativize(text, path)
    elif path == "styles.css":
        text = sub(text, r"@import url\('https://fonts\.googleapis\.com/[^']*'\);\s*", "", 1, path)
    elif path == "fly-lab-assets/report.js":
        text = sub(text, '<a href="/life-cycle-game.html">', '<a href="life-cycle-game.html">', 1, path, literal=True)
        text = sub(text, '<a href="/science-activities/">', '<a href="science-activities/index.html">', 1, path, literal=True)
        text = sub(text, '<a href="/">', '<a href="index.html">', 1, path, literal=True)
    return text

# ----------------------------------------------------------------------------- placeholders
def _font(size):
    from PIL import ImageFont
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()

def placeholder_image(path, original_bytes):
    from PIL import Image, ImageDraw
    ext = os.path.splitext(path)[1].lower()
    try:
        im = Image.open(io.BytesIO(original_bytes)); w, h = im.size
    except Exception:
        w, h = 640, 640
    scale = min(1.0, 640.0 / max(w, h)); w, h = max(16, int(w * scale)), max(16, int(h * scale))
    img = Image.new("RGB", (w, h), "#e8f0e8")
    d = ImageDraw.Draw(img)
    d.rectangle([2, 2, w - 3, h - 3], outline="#9db89d", width=3)
    label = "Illustration placeholder"
    m = re.search(r"book-pages-web/(\d+)\.", path)
    if m:
        label = f"Storybook page {m.group(1)} (placeholder)"
    f = _font(max(12, min(w, h) // 14))
    tw = d.textlength(label, font=f)
    d.text(((w - tw) / 2, h / 2 - 8), label, fill="#3d5a43", font=f)
    buf = io.BytesIO()
    if ext == ".webp":
        img.save(buf, "WEBP", quality=70, method=6)
    elif ext in (".jpg", ".jpeg"):
        img.save(buf, "JPEG", quality=80, optimize=False)
    elif ext == ".png":
        img.save(buf, "PNG", optimize=False)
    elif ext == ".pdf":
        pg = Image.new("RGB", (1100, 850), "#ffffff"); dd = ImageDraw.Draw(pg)
        dd.rectangle([30, 30, 1070, 820], outline="#9db89d", width=6)
        for i, (txt, sz, y) in enumerate([("Certificate of Scientific Discovery", 54, 140), ("Little Scientist Award", 40, 230),
                                          ("Presented to: ________________________", 32, 380), ("Date: __________    Facilitator: __________", 28, 520),
                                          ("(Neutral placeholder: the illustrated certificate is not in this edition)", 22, 700)]):
            ff = _font(sz); dd.text(((1100 - dd.textlength(txt, font=ff)) / 2, y), txt, fill="#285a43", font=ff)
        pg.save(buf, "PDF", resolution=100.0)
    else:
        return None
    out = buf.getvalue()
    if ext == ".pdf":  # Pillow stamps the current time: pin it so the build is reproducible
        out = re.sub(rb"D:\d{14}", b"D:20261124000000", out)
    return out

def placeholder_svg(path):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Neutral placeholder">'
            '<rect width="200" height="200" rx="16" fill="#e8f0e8" stroke="#9db89d" stroke-width="4"/>'
            '<circle cx="100" cy="78" r="30" fill="#b9cfb9"/><rect x="52" y="120" width="96" height="46" rx="22" fill="#b9cfb9"/>'
            '<text x="100" y="188" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#3d5a43">Placeholder</text></svg>\n').encode()

PORTRAIT_SVG = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 205 245" role="img" aria-label="Portrait not included in the archival edition">'
                '<rect width="205" height="245" rx="14" fill="#e8f0e8"/><circle cx="102" cy="92" r="42" fill="#b9cfb9"/>'
                '<rect x="38" y="148" width="130" height="80" rx="40" fill="#b9cfb9"/></svg>\n').encode()

# ----------------------------------------------------------------------------- assembly
def assemble(edition):
    entries, excluded, replaced = {}, [], []
    for p in git_files():
        why = drop_reason(p)
        if why == "SILENT":
            continue
        if why:
            excluded.append((p, why)); continue
        with open(os.path.join(ROOT, p), "rb") as f:
            data = f.read()
        if is_art(p):
            if edition == "placeholders":
                ext = os.path.splitext(p)[1].lower()
                new = placeholder_svg(p) if ext == ".svg" else placeholder_image(p, data)
                if new is None:
                    raise RuntimeError("no placeholder for " + p)
                replaced.append((p, "illustration replaced by neutral placeholder"))
                data = new
        elif p.endswith((".html", ".css", ".js")):
            try:
                txt = data.decode("utf-8")
            except UnicodeDecodeError:
                txt = None
            if txt is not None:
                new = transform_text(p, txt)
                if new != txt:
                    data = new.encode("utf-8")
        entries[p] = data
    # additions
    entries[PORTRAIT_PLACEHOLDER] = PORTRAIT_SVG
    for p in ("vendor/page-flip/page-flip.browser.js", "vendor/page-flip/LICENSE"):
        assert p in entries, p + " missing from repository"
    with open(os.path.join(ROOT, "docs", "ARCHIVAL_EDITION.md"), "rb") as f:
        edition_doc = f.read()
    label = ("FULL edition: original illustrations included (author-asserted rights; contractual scope must be verified before upload)."
             if edition == "full" else
             "PLACEHOLDER edition: every illustration is a neutral generated placeholder; no protected artwork is included.")
    entries["ARCHIVAL_EDITION.md"] = (f"> **This archive: {label}**\n\n").encode() + edition_doc
    return entries, excluded, replaced

def sha256(b):
    return hashlib.sha256(b).hexdigest()

def write_zip(dest, edition):
    entries, excluded, replaced = assemble(edition)
    prefix = f"drosies-world-v{VERSION}-{EDITIONS[edition]}/"
    manifest = ("# Drosie's World v%s %s: sha256  bytes  path (sorted)\n" % (VERSION, EDITIONS[edition])
                + "\n".join(f"{sha256(entries[p])}  {len(entries[p]):>9}  {p}" for p in sorted(entries)) + "\n").encode()
    changes = ("# Files not in this archive, or replaced, relative to the repository. Reason per file.\n"
               + "\n".join(f"EXCLUDED\t{p}\t{r}" for p, r in excluded)
               + ("\n" if excluded else "") + "\n".join(f"REPLACED\t{p}\t{r}" for p, r in replaced) + "\n").encode()
    entries["RELEASE_MANIFEST.txt"] = manifest
    entries["EXCLUDED_AND_REPLACED_FILES.txt"] = changes
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name in sorted(entries):
            zi = zipfile.ZipInfo(prefix + name, FIXED_TIME)
            zi.compress_type = zipfile.ZIP_DEFLATED; zi.create_system = 3; zi.external_attr = 0o100644 << 16
            z.writestr(zi, entries[name], compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    return len(entries)

def file_sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for c in iter(lambda: f.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--edition", choices=list(EDITIONS), help="default: both")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--extract", metavar="DIR")
    ap.add_argument("--allow-dirty", action="store_true")
    a = ap.parse_args()
    eds = [a.edition] if a.edition else list(EDITIONS)
    dirty = subprocess.run(["git", "status", "--porcelain", "--untracked-files=no", "--", ".", ":!release"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    if dirty and not (a.allow_dirty or a.list or a.extract):
        sys.exit("Tracked files have uncommitted changes. Commit first, or use --allow-dirty.\n" + dirty)
    if a.list:
        for e in eds:
            entries, excluded, replaced = assemble(e)
            print(f"== {e}: {len(entries)} files, {len(excluded)} excluded, {len(replaced)} replaced")
            [print("  EXCLUDED", p, "|", r) for p, r in excluded]
        return
    if a.extract:
        entries, _, _ = assemble(eds[0])
        for p, data in entries.items():
            dst = os.path.join(a.extract, p); os.makedirs(os.path.dirname(dst) or ".", exist_ok=True)
            with open(dst, "wb") as f: f.write(data)
        print(f"extracted {len(entries)} files to {a.extract}"); return
    os.makedirs(OUT_DIR, exist_ok=True)
    ok = True; sums = []
    for e in eds:
        dest = os.path.join(OUT_DIR, f"drosies-world-v{VERSION}-{EDITIONS[e]}.zip")
        if a.check:
            with tempfile.TemporaryDirectory() as td:
                t = os.path.join(td, "c.zip"); write_zip(t, e)
                same = os.path.exists(dest) and file_sha(t) == file_sha(dest)
                print(("IDENTICAL " if same else "DIFFERENT "), e, file_sha(t)); ok &= same
        else:
            n = write_zip(dest, e); d = file_sha(dest)
            print(f"built {os.path.basename(dest)}  {os.path.getsize(dest):,} bytes  {n} entries  sha256 {d}")
    if not a.check:
        with open(os.path.join(OUT_DIR, "SHA256SUMS"), "w") as f:
            for e in EDITIONS:
                dest = os.path.join(OUT_DIR, f"drosies-world-v{VERSION}-{EDITIONS[e]}.zip")
                if os.path.exists(dest):
                    f.write(f"{file_sha(dest)}  {os.path.basename(dest)}\n")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
