# Third-Party Notices

Status: draft for the author's review. Licence names are those stated by each upstream project; the audit did not re-read every upstream repository.

## 1. Code shipped inside the archival editions

### page-flip (StPageFlip) 2.0.7: vendored at `vendor/page-flip/`
- Used by `storybook.html` for the page-turn effect. The live site loads it from the jsDelivr CDN; **the archival edition uses this vendored copy** so that no network request is needed.
- Source: npm package `page-flip@2.0.7` (`dist/js/page-flip.browser.js`, SHA-256 `bbaca0bbef57a22bb66a3fc69d67baf9a17fb9a9c89ec9ed35e2b91abe4bd1e7`). Not compared byte-for-byte with the CDN copy (the CDN was not reachable).
- Licence: **MIT**, Copyright (c) 2020 Nodlik. Full text (verbatim from the package):

```
MIT License

Copyright (c) 2020 Nodlik

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

## 2. Third-party services and libraries used by the LIVE website only (NOT in the archival editions)

| Item | Where on the live site | Licence / terms (upstream-stated) | Archival edition |
|---|---|---|---|
| Leaflet 1.9.4 (unpkg CDN, with SRI) | home page map | BSD-2-Clause | Removed |
| OpenStreetMap tiles and data | home page map | ODbL data, OSMF tile usage policy; attribution required | Removed |
| Google Fonts: DM Sans, Nunito, Caveat, Cormorant Garamond, Lora | `styles.css`, `letters/index.html` | SIL Open Font License 1.1 (per Google Fonts) | Removed; system fonts fall back |
| GoatCounter script and service | home, Secret Fly Lab, Discovery Library, Storybook | service terms; script by the GoatCounter project | Removed |
| Supabase (REST and Edge Function) | home-page feedback form | service terms | Removed |
| Cloudflare Turnstile | home-page feedback form | service terms | Removed |
| YouTube nocookie embed | Discovery Library | YouTube terms; video credited on the page to IMP and Science/AAAS | Replaced by a text link |

## 3. Development and test tooling (not distributed)

| Tool | Use | Licence (upstream-stated; verify) |
|---|---|---|
| Playwright (Node) | `tests/` | Apache-2.0 |
| axe-core | accessibility scan in `tests/` (installed ad hoc, never bundled) | MPL-2.0 |
| Pillow (Python) | `tools/build_archive.py` placeholder generation | HPND (PIL Software License) |
| Node.js, Python | runtimes | their own licences |

## 4. Data and standards referenced

- FlyBase gene/allele data: facts and identifiers are cited; FlyBase's data licence and attribution requirements have **not** been re-checked here (see the readiness report).
- NGSS and TEKS identifiers appear in the Genetics Lab teacher guide; the issuers' terms of use have not been checked.

## 5. Artwork and brand

Not third-party code. See `ASSET_LICENSES.md`.
