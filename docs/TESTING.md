# Testing, Accessibility and Browser Compatibility

Updated 2026-11-24 (second pass). **Only results actually obtained are reported as results.** Anything not run is listed as not run. Automated accessibility tests are **not** a WCAG conformance evaluation.

## 1. Environment
Linux container; Node v22.23.5; Python 3.13; Playwright 1.63.0 with bundled **Chromium 158**; axe-core 4.10.2 (installed outside the repository); static servers started by the tests. Third-party hosts are blocked in every run (and the sandbox network allowed only Zenodo, DOI and Crossref).

## 2. Suites and how to run them
| Suite | Location | Command |
|---|---|---|
| Genetics engine (scientific calculations) | `drosie-genetics-lab/tests/` | `cd drosie-genetics-lab && node tests/run-tests.mjs` |
| Scientific Conference (30 scripts) | `tests/conference/` | `AXE_PATH=<axe.min.js> tests/conference/run-all.sh` (server on :8123) |
| **Site-wide suite (new)** | `tests/site/run.js` | `SITE_ROOT=<dir> EXPECT_NO_EXTERNAL=1 AXE_PATH=<axe.min.js> BROWSER=chromium node tests/site/run.js [pages links keyboard mobile a11y offline components]` |
| Static SEO/link checker | `seo/tools/seo_check.py` | `python3 seo/tools/seo_check.py` |

The site-wide suite covers: page load without JavaScript/console errors or failed local requests; all visible images load; title/lang/viewport/h1; static link and anchor resolution across every shipped HTML file; keyboard Tab traversal with visible focus indicators; mobile layouts (390x844 touch and 320x568, no horizontal scroll); an axe-core scan; offline operation with all external hosts blocked and, for the archival edition, **zero external requests**, plus opening pages from `file://`; and functional flows: Climbing Challenge (three full trials, recorded count equals flies drawn above the line, mean equals the recorded trials), Life Cycle Adventure, Grow Your Own (including the development-time table's internal consistency), Secret Fly Lab, Lab Notebook Academy, Storybook reader, Letters, Discovery Library search, home-page lesson search, Genetics Lab UI smoke.

## 3. Results of the final runs (Chromium, 2026-11-24)

Run against the archival editions extracted from the built ZIPs, and against the live-site source (repository root).

### Archival edition, FULL (illustrations included), extracted from the ZIP

Browser: chromium. Total: **348 passed, 3 failed, 0 skipped**.

| Suite | Passed | Failed | Skipped |
|---|---|---|---|
| pages: load, errors, images, external requests (desktop 1280x800) | 148 | 0 | 0 |
| links: every local href/src/action resolves; in-page anchors exist | 2 | 0 | 0 |
| keyboard: Tab order reaches interactive controls with a visible focus indicator, no trap | 40 | 0 | 0 |
| mobile: 390x844 touch and 320x568; no horizontal overflow, no missing images | 80 | 0 | 0 |
| a11y: automated axe-core scan (NOT a WCAG conformance evaluation) | 18 | 3 | 0 |
| offline: pages work with every external host blocked and make zero external attempts | 2 | 0 | 0 |
| offline: open directly from the file system (file://), no server | 7 | 0 | 0 |
| components: Climbing Challenge (full 3-trial flow, results match what is drawn) | 10 | 0 | 0 |
| components: Life Cycle Adventure, Grow Your Own Fruit Fly | 16 | 0 | 0 |
| components: The Secret Fly Lab | 4 | 0 | 0 |
| components: Lab Notebook Academy | 5 | 0 | 0 |
| components: Storybook reader | 6 | 0 | 0 |
| components: Letters from Drosie, Discovery Library, home page | 7 | 0 | 0 |
| components: Drosie Genetics Lab (UI smoke; the engine has its own 58-test Node suite) | 3 | 0 | 0 |

Failures:

- `a11y` index.html: no critical/serious axe violations (1 total violations of any impact) (color-contrast(68) .hero-proof > span:nth-child(2))
- `a11y` fruit-fly-life-cycle-activities/index.html: no critical/serious axe violations (1 total violations of any impact) (color-contrast(6) figcaption)
- `a11y` science-activities/index.html: no critical/serious axe violations (1 total violations of any impact) (color-contrast(50) #ages-5-8 > .container > .hub-blurb)

### Archival edition, PLACEHOLDERS, extracted from the ZIP

Browser: chromium. Total: **348 passed, 3 failed, 0 skipped**.

| Suite | Passed | Failed | Skipped |
|---|---|---|---|
| pages: load, errors, images, external requests (desktop 1280x800) | 148 | 0 | 0 |
| links: every local href/src/action resolves; in-page anchors exist | 2 | 0 | 0 |
| keyboard: Tab order reaches interactive controls with a visible focus indicator, no trap | 40 | 0 | 0 |
| mobile: 390x844 touch and 320x568; no horizontal overflow, no missing images | 80 | 0 | 0 |
| a11y: automated axe-core scan (NOT a WCAG conformance evaluation) | 18 | 3 | 0 |
| offline: pages work with every external host blocked and make zero external attempts | 2 | 0 | 0 |
| offline: open directly from the file system (file://), no server | 7 | 0 | 0 |
| components: Climbing Challenge (full 3-trial flow, results match what is drawn) | 10 | 0 | 0 |
| components: Life Cycle Adventure, Grow Your Own Fruit Fly | 16 | 0 | 0 |
| components: The Secret Fly Lab | 4 | 0 | 0 |
| components: Lab Notebook Academy | 5 | 0 | 0 |
| components: Storybook reader | 6 | 0 | 0 |
| components: Letters from Drosie, Discovery Library, home page | 7 | 0 | 0 |
| components: Drosie Genetics Lab (UI smoke; the engine has its own 58-test Node suite) | 3 | 0 | 0 |

Failures:

- `a11y` index.html: no critical/serious axe violations (1 total violations of any impact) (color-contrast(68) .hero-proof > span:nth-child(2))
- `a11y` fruit-fly-life-cycle-activities/index.html: no critical/serious axe violations (1 total violations of any impact) (color-contrast(6) figcaption)
- `a11y` science-activities/index.html: no critical/serious axe violations (1 total violations of any impact) (color-contrast(50) #ages-5-8 > .container > .hub-blurb)

### Live-site source (repository root; third-party hosts blocked)

Browser: chromium. Total: **310 passed, 3 failed, 2 skipped**.

| Suite | Passed | Failed | Skipped |
|---|---|---|---|
| pages: load, errors, images, external requests (desktop 1280x800) | 127 | 0 | 0 |
| links: every local href/src/action resolves; in-page anchors exist | 2 | 0 | 0 |
| keyboard: Tab order reaches interactive controls with a visible focus indicator, no trap | 40 | 0 | 0 |
| mobile: 390x844 touch and 320x568; no horizontal overflow, no missing images | 80 | 0 | 0 |
| a11y: automated axe-core scan (NOT a WCAG conformance evaluation) | 18 | 3 | 0 |
| offline: pages work with every external host blocked | 0 | 0 | 1 |
| components: Climbing Challenge (full 3-trial flow, results match what is drawn) | 10 | 0 | 0 |
| components: Life Cycle Adventure, Grow Your Own Fruit Fly | 16 | 0 | 0 |
| components: The Secret Fly Lab | 4 | 0 | 0 |
| components: Lab Notebook Academy | 5 | 0 | 0 |
| components: Storybook reader | 0 | 0 | 1 |
| components: Letters from Drosie, Discovery Library, home page | 5 | 0 | 0 |
| components: Drosie Genetics Lab (UI smoke; the engine has its own 58-test Node suite) | 3 | 0 | 0 |

Failures:

- `a11y` index.html: no critical/serious axe violations (1 total violations of any impact) (color-contrast(69) .hero-proof > span:nth-child(2))
- `a11y` fruit-fly-life-cycle-activities/index.html: no critical/serious axe violations (1 total violations of any impact) (color-contrast(6) figcaption)
- `a11y` science-activities/index.html: no critical/serious axe violations (1 total violations of any impact) (color-contrast(50) #ages-5-8 > .container > .hub-blurb)


**Genetics engine:** 58/58 passed. **SEO checker:** 0 errors, 7 warnings (long titles/descriptions).
**Scientific Conference (30 scripts):** see section 4.

### Reading the failures
All remaining failures are **axe-core colour-contrast violations** of muted grey text (`.hero-proof` text on the home page, a hub blurb, figure captions). They are real findings, not test errors, and are **unresolved**; they need approved darker text colours across the site (decision D-8 in the readiness report). The live-site run skips two checks that need CDN resources blocked in the test environment (the Storybook page-turn library on the live site; the archival edition vendors it and passes).

## 4. Conference suite (rerun after the conference code guards were added)
All 30 scripts run by  were rerun after the guards were added: **1145 assertions passed, 0 failed** (including  22 and  52 axe assertions). Not part of this run: .

## 5. Defects found by the new tests and fixed in this pass
1. Home-page lesson search and the Discovery Library filter/search set the `hidden` property but a CSS `display` rule kept cards visible. Fixed with a `[hidden]` rule.
2. The Letters page's "More from Drosie's World" block was dark text on a dark background (contrast 1.12). Fixed.
3. The Secret Fly Lab disabled pinch zoom (`user-scalable=no`). Removed for accessibility (touch behaviour of the game should be checked on devices).
4. A worksheet page overflowed horizontally on phones (long underscore lines). Fixed.
5. Colour contrast: site logo accent, eyebrow labels, hero heading accents, team role, Notebook Academy logo. Fixed.
6. The Conference threw an error when a resize event arrived before initialisation (intermittent). Guarded.
7. A dead in-page link (`#ch1`) on the Conference page. Fixed.
8. The Secret Fly Lab inventory had an ARIA label on a role-less `div`. Added `role="group"`.
9. Reproducibility bug in the placeholder PDF (timestamp). Pinned.

## 6. What was NOT tested
- **Firefox and WebKit: not run.** Neither binary is installed in this environment; installing browsers was not attempted. The suite honours `BROWSER=firefox|webkit` and reports "NOT RUN" when a browser is missing; `tests/site/ci-workflow.example.yml` shows a three-browser CI job (not installed in the repository).
- Screen readers, switch/voice control, magnifiers, disabled users, children: none.
- Real mobile devices and touch gestures (mobile runs are emulation).
- WCAG conformance: not assessed. axe-core detects only a part of the possible barriers.
- The Genetics Lab mission-by-mission end-to-end script cited in its QA report is not in the repository and was not re-run.
- Supabase/Turnstile backend behaviour (live site): not tested (see the privacy/security audit).
- Page behaviour under slow or failing networks beyond blocking external hosts.

## 7. Known test limitations and hygiene
- Five Conference scripts (`m6`, `m9`, `exports`, `robustness`, `vx-m6`) hard-code scratch paths from an earlier session; the directories were created outside the repository to run them.
- `tests/conference/reading-load.js` is not in `run-all.sh` and was not run.
- Stochastic engine tests use fixed seeds; random simulations in games are checked for internal consistency, not for statistical properties.
- Test timing waits are tuned for a loaded container; a rerun on a slower machine may need longer waits.
