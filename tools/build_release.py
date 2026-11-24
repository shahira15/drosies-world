#!/usr/bin/env python3
"""Build the deterministic software-release ZIP for Drosie's World.

Usage:
    python3 tools/build_release.py            # build release/drosies-world-v<VERSION>.zip
    python3 tools/build_release.py --check    # rebuild to a temp file and compare bytes/SHA-256
    python3 tools/build_release.py --list     # print included/excluded files and exit

Reproducibility: the file list comes from `git ls-files` (sorted), timestamps are fixed,
permissions are normalised, compression settings are fixed, and file bytes are copied
unchanged. The same commit therefore always yields the same ZIP bytes (same Python
zlib build; compressed bytes can differ across zlib implementations, so compare the
RELEASE_MANIFEST.txt inside the archive, which is independent of compression).

Rights-reserved or uncertain artwork and personal images are EXCLUDED on purpose.
Edit EXCLUDE_RULES below only with the author's decision. See docs/RELEASE_BUILD.md.
"""
import argparse, hashlib, os, subprocess, sys, tempfile, zipfile

VERSION = "1.0.0"
FIXED_TIME = (2026, 11, 24, 0, 0, 0)   # fixed on purpose (ZIP cannot store dates before 1980)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(ROOT, "release")
PREFIX = f"drosies-world-v{VERSION}/"

# (match kind, pattern, reason). kinds: "prefix" (path startswith) or "exact".
EXCLUDE_RULES = [
    ("prefix", "book-pages/", "storybook illustrations: rights reserved / unlicensed (see docs/LICENSING_AUDIT.md)"),
    ("prefix", "book-pages-web/", "storybook illustrations (web copies): rights reserved / unlicensed"),
    ("prefix", "images/", "mascot, book-cover, illustration and portrait derivatives; og-image: rights/consent undecided"),
    ("prefix", "climbing-game-assets/", "mascot/illustration derivatives: rights undecided"),
    ("prefix", "science-activities/img/", "mascot/illustration derivatives: rights undecided"),
    ("prefix", "fruit-fly-life-cycle-activities/img/", "mascot/illustration derivatives: rights undecided"),
    ("prefix", "life-cycle-assets/", None),  # handled below by extension (keep .js/.css)
    ("prefix", "docs/conference-visual/screens/", "screenshots of the interface including artwork: not needed for the software"),
    ("exact", "drosie adult.png", "mascot artwork (raster original): rights reserved"),
    ("exact", "drosie egg.png", "mascot artwork (raster original): rights reserved"),
    ("exact", "drosie larva.png", "mascot artwork (raster original): rights reserved"),
    ("exact", "drosie larva1.png", "mascot artwork (raster original): rights reserved"),
    ("exact", "drosie pupa.png", "mascot artwork (raster original): rights reserved"),
    ("exact", "drosie.png.png", "mascot artwork; duplicate/odd filename: rights reserved"),
    ("exact", "drosie-book-cover.png", "book cover artwork: rights reserved"),
    ("exact", "my-microscope.png", "illustration: rights undecided"),
    ("exact", "fruit bowl.png", "illustration: rights undecided"),
    ("exact", "drosie-mascot.svg", "mascot artwork: rights reserved (brand)"),
    ("exact", "favicon.svg", "mascot/brand mark: rights reserved"),
    ("exact", "shahira-photo.png", "portrait photograph of a person: personal image, consent/rights not recorded"),
    ("exact", "illustrator.jpeg", "portrait photograph of a person: personal image, consent/rights not recorded"),
    ("exact", "Certificate.pdf", "created with Canva (template/asset licence unknown)"),
    ("exact", "CNAME", "deployment configuration for the author's domain, not software"),
    ("exact", "Virtual lab", "stray 1-byte file, no content"),
]
# life-cycle-assets: keep code, drop image files
def life_cycle_exclusion(path):
    return path.startswith("life-cycle-assets/") and path.lower().endswith((".webp", ".png", ".jpg", ".jpeg"))

def git_files():
    out = subprocess.run(["git", "ls-files", "-z"], cwd=ROOT, check=True, capture_output=True).stdout
    return sorted(p for p in out.decode("utf-8").split("\0") if p)

def classify(path):
    if path.startswith("release/"):
        return None  # build outputs are skipped silently (see plan()) so they cannot change the archive
    if life_cycle_exclusion(path):
        return "mascot/illustration derivatives (life cycle stage art): rights undecided"
    for kind, pat, reason in EXCLUDE_RULES:
        if reason is None:
            continue
        if (kind == "prefix" and path.startswith(pat)) or (kind == "exact" and path == pat):
            return reason
    return None

def sha256(data):
    return hashlib.sha256(data).hexdigest()

def plan():
    inc, exc = [], []
    for p in git_files():
        if p.startswith("release/"):
            continue  # never archive build outputs, and never list them (keeps the archive reproducible)
        r = classify(p)
        (exc.append((p, r)) if r else inc.append(p))
    return inc, exc

def write_zip(dest, inc, exc):
    manifest_lines, blobs = [], {}
    for p in inc:
        with open(os.path.join(ROOT, p), "rb") as f:
            data = f.read()
        blobs[p] = data
        manifest_lines.append(f"{sha256(data)}  {len(data):>9}  {p}")
    manifest = ("# Drosie's World v%s release manifest: sha256, bytes, path (sorted)\n" % VERSION
                + "\n".join(manifest_lines) + "\n").encode()
    excluded = ("# Files deliberately EXCLUDED from this software archive (still in the git repository).\n"
                "# Reason shown per file. Pages that show these images will have missing images in this archive.\n"
                + "\n".join(f"{p}\t{r}" for p, r in exc) + "\n").encode()
    entries = dict(blobs)
    entries["RELEASE_MANIFEST.txt"] = manifest
    entries["EXCLUDED_FILES.txt"] = excluded
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name in sorted(entries):
            zi = zipfile.ZipInfo(PREFIX + name, FIXED_TIME)
            zi.compress_type = zipfile.ZIP_DEFLATED
            zi.create_system = 3
            zi.external_attr = 0o100644 << 16
            z.writestr(zi, entries[name], compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    return sha256(manifest)

def file_sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--allow-dirty", action="store_true", help="skip the clean-tree check (build not reproducible from a commit)")
    a = ap.parse_args()
    dirty = subprocess.run(["git", "status", "--porcelain", "--untracked-files=no"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    if dirty and not a.allow_dirty and not a.list:
        sys.exit("Tracked files have uncommitted changes. Commit first (reproducible builds come from a commit) or use --allow-dirty.\n" + dirty)
    inc, exc = plan()
    if a.list:
        print(f"INCLUDED ({len(inc)})"); [print("  " + p) for p in inc]
        print(f"EXCLUDED ({len(exc)})"); [print(f"  {p}\t{r}") for p, r in exc]
        return
    os.makedirs(OUT_DIR, exist_ok=True)
    dest = os.path.join(OUT_DIR, f"drosies-world-v{VERSION}.zip")
    if a.check:
        with tempfile.TemporaryDirectory() as td:
            t = os.path.join(td, "check.zip")
            write_zip(t, inc, exc)
            if not os.path.exists(dest):
                sys.exit("No existing archive to compare against.")
            same = file_sha(t) == file_sha(dest)
            print("IDENTICAL" if same else "DIFFERENT", file_sha(t), file_sha(dest))
            sys.exit(0 if same else 1)
    write_zip(dest, inc, exc)
    digest = file_sha(dest)
    with open(os.path.join(OUT_DIR, "SHA256SUMS"), "w") as f:
        f.write(f"{digest}  drosies-world-v{VERSION}.zip\n")
    print(f"built {dest}\nsha256 {digest}\nincluded {len(inc)} files, excluded {len(exc)}")

if __name__ == "__main__":
    main()
