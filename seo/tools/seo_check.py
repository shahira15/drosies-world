#!/usr/bin/env python3
"""Static SEO checks for Drosie's World. Run from the repository root: python3 seo/tools/seo_check.py
Checks: titles, descriptions, canonicals, H1, duplicate titles, JSON-LD parsing, internal links/images,
sitemap coverage and validity. Exits non-zero on errors."""
import re, sys, json, os, subprocess, urllib.parse
import xml.etree.ElementTree as ET
BASE = 'https://drosiesworld.com'
pages = [p for p in subprocess.check_output(['git', 'ls-files', '*.html']).decode().split('\n') if p]
NOINDEX_OK = ('drosie-genetics-lab/tests/', 'letters/tools/', 'letters/homepage-integration/', '404.html')
errors, warns = [], []
titles = {}
def url_of(p):
    if p.endswith('index.html'): return BASE + '/' + p[:-len('index.html')]
    return BASE + '/' + p
def target(frm, u):
    u = urllib.parse.unquote(u.split('?')[0])
    if u.startswith(BASE): u = u[len(BASE):] or '/'
    t = u.lstrip('/') if u.startswith('/') else os.path.normpath(os.path.join(os.path.dirname(frm), u))
    if t in ('', '.'): t = 'index.html'
    if os.path.isdir(t): t = os.path.join(t, 'index.html')
    return t
indexable = []
for p in pages:
    s = open(p, errors='ignore').read()
    noindex = bool(re.search(r'<meta\s+name="robots"\s+content="[^"]*noindex', s))
    if noindex or p.startswith(NOINDEX_OK): 
        if not noindex and p not in ('404.html',): warns.append(f'{p}: blocked by robots.txt but no noindex tag (ok if intentional)')
        continue
    indexable.append(p)
    t = re.search(r'<title>(.*?)</title>', s, re.S)
    d = re.search(r'<meta\s+name="description"\s+content="(.*?)"', s, re.S)
    c = re.search(r'<link[^>]*rel="canonical"[^>]*href="(.*?)"', s)
    if not t: errors.append(f'{p}: missing <title>')
    else:
        tt = re.sub(r'\s+', ' ', t.group(1)).strip(); titles.setdefault(tt, []).append(p)
        if len(tt) > 75: warns.append(f'{p}: long title ({len(tt)} chars)')
    if not d: errors.append(f'{p}: missing meta description')
    elif not 70 <= len(d.group(1)) <= 200: warns.append(f'{p}: description length {len(d.group(1))}')
    if not c: errors.append(f'{p}: missing canonical')
    elif c.group(1) != url_of(p): errors.append(f'{p}: canonical {c.group(1)} != {url_of(p)}')
    if not re.search(r'<h1', s) and 'seo-intro' not in s and 'id="station-title"' not in s: errors.append(f'{p}: no <h1> in source')
    if not re.search(r'<html[^>]*lang=', s): errors.append(f'{p}: missing html lang')
    if not re.search(r'name="viewport"', s): errors.append(f'{p}: missing viewport')
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        try: json.loads(m.group(1))
        except Exception as e: errors.append(f'{p}: invalid JSON-LD ({e})')
    for m in re.finditer(r'<img\b(?![^>]*\balt=)[^>]*>', s): errors.append(f'{p}: <img> without alt: {m.group(0)[:60]}')
for t, ps in titles.items():
    if len(ps) > 1: errors.append(f'duplicate title {t!r}: {ps}')
# links and assets on every html page
for p in pages:
    s = open(p, errors='ignore').read()
    for m in re.finditer(r'(?:href|src)="([^"#]+)(#[^"]*)?"', s):
        u = m.group(1)
        if re.match(r'(https?:|mailto:|tel:|data:|javascript:|\$\{)', u) and not u.startswith(BASE): continue
        if '${' in u or u.startswith('//'): continue
        if not os.path.exists(target(p, u)): errors.append(f'{p}: broken link/asset {u}')
    # in-page anchors
    for m in re.finditer(r'href="#([^"]+)"', s):
        if f'id="{m.group(1)}"' not in s and f"id='{m.group(1)}'" not in s: warns.append(f'{p}: anchor #{m.group(1)} has no target')
# sitemap
try:
    root = ET.parse('sitemap.xml').getroot(); ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    locs = [u.find('s:loc', ns).text for u in root.findall('s:url', ns)]
    if len(locs) != len(set(locs)): errors.append('sitemap has duplicate URLs')
    for l in locs:
        if not l.startswith(BASE): errors.append(f'sitemap non-canonical host {l}')
        if not os.path.exists(target('x', l)): errors.append(f'sitemap URL has no file: {l}')
    want = {url_of(p) for p in indexable if p != '404.html'}
    for w in sorted(want - set(locs)): warns.append(f'indexable page not in sitemap: {w}')
    print(f'sitemap: {len(locs)} URLs')
except Exception as e: errors.append(f'sitemap parse error: {e}')
print(f'{len(pages)} html files, {len(indexable)} indexable')
for w in warns: print('WARN ', w)
for e in errors: print('ERROR', e)
print(f'{len(errors)} errors, {len(warns)} warnings'); sys.exit(1 if errors else 0)
