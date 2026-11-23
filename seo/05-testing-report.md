# 5. Testing report

Environment: local static server + headless Chromium (Playwright), viewports 390×800 (mobile) and 1280×800 (desktop), 23 Nov 2026. External hosts (Google Fonts, analytics, Leaflet, Supabase, Cloudflare Turnstile, jsDelivr) are unreachable from the sandbox and were excluded from pass/fail. **No Google ranking or indexing claims are made.** Search Console evidence is required for those.

## Automated static checks: `python3 seo/tools/seo_check.py`
Result: **0 errors, 1 warning** (18 HTML files, 15 indexable, 17 sitemap URLs).
Covers: missing/duplicate titles, missing descriptions, canonical equals the page's own URL, `<html lang>`, viewport, H1 present in source, JSON-LD parses, every `<img>` has `alt`, every internal link/asset target exists, in-page anchors, sitemap well-formed, no duplicate URLs, every URL has a file, every indexable page is in the sitemap.
Warning: `/science-activities/` title is 83 characters (may truncate in results; deliberately kept because it carries the target keywords).

## Browser checks (all 17 public pages × 2 viewports)
| Check | Result |
|---|---|
| JavaScript errors | None on any page after fix (the new 404 page initially threw because the shared script expects the footer year element; footer added) |
| Missing images/internal assets | None introduced. Pre-existing: `/letters/assets/audio/letter-01.mp3` returns 404 (also on `main`) |
| Horizontal overflow on mobile | Was present on `/` (book cover) and genetics teacher page (wide table) on `main`; **fixed**, now none on all 34 page/viewport loads |
| Games unchanged | Rendered text length of `/lab/`, `/drosie-genetics-lab/`, life-cycle, grow-your-own, climbing, storybook, letters, discoveries is **identical** before vs after (the new crawlable intros are replaced by the game scripts on load, as designed). Gameplay was not changed (no game script edited except the one letters image path/console message). |
| Hub pages | Render and read well at 390 px (screenshots reviewed); 1 H1 each |

Not tested: real-device Safari/Android, screen-reader pass, keyboard walkthrough of the hubs beyond focus styles (reused site components with existing focus rules), Lighthouse/PageSpeed (needs the live site), Rich Results Test (needs network).

## Structured data
All JSON-LD blocks parse. Types used: WebSite, Organization (+`founder`), Book, Person (+`@id`), WebPage, CollectionPage, ItemList/ListItem/LearningResource, BreadcrumbList, Taxon, EducationalAudience, FAQPage (pre-existing, matches visible text). No Review, Rating, Course or completion markup was added. **Recommended after deploy:** run the live URLs through Google's Rich Results Test and the Schema.org validator.

## Image performance (measured file sizes)
| Image | Before | After |
|---|---|---|
| Hero mascot | 3.99 MB PNG | 64 KB WebP |
| Book cover | 8.63 MB PNG | 43 KB WebP |
| Fruit bowl | 2.56 MB | 25 KB |
| Microscope | 1.77 MB | 30 KB |
| Four life cycle stage images | ≈4.1 MB | ≈90 KB |
| Author photo (team) | 4.05 MB | 25 KB |
| `og:image` | 8.63 MB PNG | 91 KB JPEG, 1200×630 |

## Regression guard
Re-run before each release: `python3 seo/tools/seo_check.py` (exit code 1 on errors).
