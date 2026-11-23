# 1. SEO audit report: Drosie's World

Audited: repository `shahira15/drosies-world` at `origin/main` commit `4217749` (23 Nov 2026).
**Limitation:** the live site (drosiesworld.com) could not be fetched from the audit environment (outbound network is restricted), so HTTPS/www redirects, live indexing status, Core Web Vitals field data and Search Console data were **not** checked. Everything below is verified from the repository, a local static server and a headless browser. No ranking claims are made.

## Branches and PRs
No open PRs at audit time. Feature branches (`fly-lab-redesign`, `life-cycle-adventure`, `climbing-challenge-redesign`, `science-activities-hub`, etc.) are already merged or are older copies of merged work. No Lab Notebook Academy code exists on `main` or any branch seen; this work does not touch it.

## Public page inventory (17 URLs in sitemap, 18 HTML files tracked)
| URL | Role | Before |
|---|---|---|
| `/` | Home, book, lessons | Good title/description/canonical; hero image 4 MB PNG; no plain-language "what is this site" text; no author/book schema |
| `/science-activities/` | Hub by age group | Strong: CollectionPage + ItemList schema |
| `/fruit-fly-life-cycle-activities/` | Teaching page (indexed) | Strong content; title 89 chars (truncates in results) |
| `/storybook.html` | Online book | Fine; content is an image-flipbook (little text) |
| `/lab/` | Secret Fly Lab game (JS) | **Source HTML had ~0 words** (only a script loader) |
| `/drosie-genetics-lab/` | Genetics simulator (JS) | **Empty `<h1>` and no text in source** |
| `/life-cycle-game.html`, `/grow-your-own-fruit-fly.html`, `/climbing-game.html` | Games | Good metadata |
| `/discoveries.html`, `/letters/`, `/team.html` | Content / creator | Good; team has Person schema without `@id` |
| `/drosie-genetics-lab/teacher/`, `…/worksheets.html`, `…/docs/` | Teacher/reference | Missing canonical; worksheets and docs had no description; docs is a client-side markdown viewer |
| `/drosie-genetics-lab/tests/`, `/letters/tools/cue-maker.html` | Internal | `noindex` + robots Disallow (correct) |
| `/letters/homepage-integration/letter-invite-snippet.html` | Dev snippet, publicly served | No title, indexable |

## Findings
**High impact (fixed in this PR)**
1. JS-only game pages exposed no text to crawlers (`/lab/`, `/drosie-genetics-lab/`). Added crawlable intro text inside the containers the scripts already replace.
2. Images: multi-MB PNGs used on the home page (≈21 MB total across home-page images; hero alone 4.0 MB; `og:image` 8.6 MB, which many social/search crawlers reject). Added WebP versions (≈0.3 MB total) and a 1200×630 `og-image.jpg` (91 KB), explicit width/height, `fetchpriority` on the hero.
3. No `404.html`. Added a branded `noindex` 404 page (GitHub Pages serves it automatically).
4. Lesson 3 card on the home page linked to Lesson 2's PDF. Now links to `lesson-3-activity-sheet.pdf`.
5. Missing topical pages for "fruit fly biology" and "lesson plans/teacher resources" (see keyword map). Added two hubs with original content and references.

**Medium**
6. Sitemap `lastmod` was the same date on every URL and `priority` values are ignored by Google. Rebuilt from git dates; added new pages and the scientific reference page.
7. Missing canonical/description on genetics teacher, worksheets and docs pages; the docs viewer now has a canonical so `?f=` variants consolidate to one URL.
8. Two titles over ~75 characters shortened.
9. `Organization`/`Person` schema not linked: added `@id` to the Person and a `founder` link; added a `Book` entity (with the existing Zenodo DOI) to the home page.
10. Letters page used the 4 MB mascot PNG and as favicon; now WebP / SVG.
11. Mobile horizontal overflow on home (book cover at 390 px) and genetics teacher page (table). Fixed with small CSS rules.
12. Dev-only snippet page set to `noindex` and disallowed.

**Known issues not changed (out of scope / need owner decision)**
- `/letters/assets/audio/letter-01.mp3` returns 404 (audio files not in repo; documented in `letters/README`). Not an SEO issue but a visible broken asset on the letters page.
- FAQPage markup on `/fruit-fly-life-cycle-activities/` is accurate and matches visible text, so it was kept. Google limits FAQ rich results to a few site types, so do not expect a rich result.
- Original large PNGs remain in the repo root (referenced as downloads/legacy). They can be deleted once the owner confirms nothing external hot-links them.
- Storybook (`/storybook.html`) text is mostly in page images; a text version (see growth plan) would help search and accessibility.
- GitHub Pages: `CNAME` is `drosiesworld.com`, so GitHub redirects www to the apex when DNS is correct, and enforces HTTPS when "Enforce HTTPS" is on. **Verify in repo Settings → Pages**; not testable from here.
- Worksheets page intentionally has several `<h1>` (one per printable sheet).

## Pages that are indexable but not confirmed indexed
Only `/fruit-fly-life-cycle-activities/` is confirmed. All other pages in the sitemap should be checked in Search Console's Page indexing report; request indexing for the two new hubs after deploy.
