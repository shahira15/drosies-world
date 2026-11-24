# Testing, Accessibility and Browser Compatibility

Prepared 2026-11-24. **Rule for this document: only results that were actually obtained are reported as results.** Anything not run is listed as not run. No result has been estimated or inferred.

## 1. Test environment used for the runs reported here

| Item | Value |
|---|---|
| Date | 2026-11-24 |
| OS | Linux 6.18 (cloud container) |
| Node.js | v22.23.5 |
| Python | 3.13 |
| Playwright | 1.63.0, bundled Chromium (headless) |
| axe-core | 4.10.2, installed ad hoc with `npm i axe-core` outside the repository |
| Server | `python3 -m http.server 8123` from the repository root |
| Network | Third-party hosts (Google Fonts, analytics, Leaflet, Supabase, Turnstile, jsDelivr) are not guaranteed reachable from the container; tests of the Conference and Genetics Lab do not depend on them. |

## 2. Automated test inventory and results

| Suite | Location | Command | Result in this session |
|---|---|---|---|
| Genetics Lab engine (scientific tests) | `drosie-genetics-lab/tests/` | `cd drosie-genetics-lab && node tests/run-tests.mjs` | **58 / 58 passed** (deterministic and fixed-seed stochastic tests) |
| Scientific Conference, 30 scripts run by `tests/conference/run-all.sh` (functional, keyboard, privacy, export, robustness, discoverability, axe accessibility) | `tests/conference/` | `AXE_PATH=<axe.min.js> tests/conference/run-all.sh` (each script run individually in this session) | **1,145 assertions passed, 0 failed** across the 30 scripts, including `a11y` (22 passed) and `vx-a11y` (52 passed) |
| Static SEO / link / structured-data checker | `seo/tools/seo_check.py` | `python3 seo/tools/seo_check.py` | **0 errors, 8 warnings** (long titles/descriptions, one `#ch1` anchor on `scientific-conference.html` with no static target) |
| `tests/conference/reading-load.js` | `tests/conference/` | not included in `run-all.sh` | **Not run** |
| Genetics Lab browser suite (`tests/index.html`) and the end-to-end mission runs described in its QA report | `drosie-genetics-lab/` | open in a browser | **Not re-run.** The QA report (22 Nov 2026) states 16/16 missions were completed by scripted players; that script is not in the repository. |

How the Conference suite was run here: the five tests that write scratch output (`m6.js`, `m9.js`, `exports.js`, `robustness.js`, `vx-m6.js`) have hard-coded absolute scratch paths from an earlier session, so those directories were created outside the repository before running. This is a portability defect, listed in the readiness report. No test file was modified.

### Components with no automated tests in this repository

The Secret Fly Lab (`lab/`), Life Cycle Adventure, Grow Your Own Fruit Fly, Climbing Challenge, Lab Notebook Academy, Letters from Drosie, Storybook, Discovery Library and the home page have **no dedicated automated functional tests**. The SEO checker covers their static HTML only (titles, canonical links, alt attributes, internal links, JSON-LD parses). Earlier repository reports (`seo/05-testing-report.md`, `lab/README.md` "QA actually run") describe manual or scripted browser checks made in earlier sessions; those were **not reproduced** in this session and are cited as the authors' reports, not as results verified here.

### What the tests do and do not show

They show that the specific scripted behaviours passed on Chromium in the stated environment. They do **not** show correctness of the science beyond what is asserted (the Genetics Lab expected values are analytic and written into tests), usability for children, or educational effect. Stochastic tests use fixed seeds.

## 3. Accessibility

### Implemented (from code and documentation)
Skip links, landmarks and heading structure, labelled form controls, visible focus styles, keyboard operation of interactive scenes (Genetics Lab stations, Conference hall), ARIA live regions for announcements, chart descriptions and table views, non-drag alternatives, reduced-motion (device preference and in-app setting), high-contrast and larger-text options, optional speech narration, text with every colour cue, print stylesheets.

### Tested
| What | Evidence |
|---|---|
| axe-core scan of Conference states: no violations found in the tested states | `a11y` and `vx-a11y` scripts passed in this session (22 and 52 assertions) |
| Keyboard walkthrough of the Conference by script | `keyboard` script passed (29 assertions) |
| Genetics Lab: no interactive controls without accessible names across six stations; keyboard Tab/Enter/Escape; reduced motion; high contrast and 130% text (visual) | reported in `drosie-genetics-lab/docs/QA_REPORT.md` (22 Nov 2026), not re-run here |

### Not tested (no evidence exists)
- Screen readers (NVDA, JAWS, VoiceOver, TalkBack): **none**.
- Switch access, voice control, magnification software: **none**.
- Testing with disabled users, or with children: **none**.
- Colour-vision-deficiency checks beyond the Genetics Lab chart palette validation reported in its QA report.
- axe-core or other automated scans of the home page, Secret Fly Lab, Life Cycle, Grow Your Own, Climbing, Notebook Academy, Letters, Storybook.
- **No claim of WCAG conformance (any level) is made.** Automated tools detect only a portion of barriers.

## 4. Browser and device compatibility

### Tested
| Browser | Evidence |
|---|---|
| Chromium (Playwright 1.63, desktop viewports; mobile viewports 390 px reported by earlier QA) | Automated runs above and earlier reports |

### Not tested
Firefox, Safari (desktop and iOS), Samsung Internet, Edge as a separate product, Android browsers, real touch devices, older browser versions, assistive-technology/browser combinations. Any compatibility statement beyond Chromium would be a guess.

### Features used (compatibility risk indicators, from a source scan, not test results)
ES modules (Genetics Lab; modern browsers only), `<dialog>.showModal()`, optional chaining and nullish coalescing, CSS container queries (`container-type`, used in the Conference poster, with a documented `cqw` fallback), Web Audio API, Web Speech `speechSynthesis` (voices vary by device; Letters and others handle absence), `localStorage` (guarded with try/catch in several modules), Clipboard and Web Share (feature-guarded in at least some places), Fullscreen API, `prefers-reduced-motion`. Several of these require browsers from roughly 2021 onward; the exact minimum versions have not been determined or tested and are therefore not stated.

### Known compatibility-related observations
- The Genetics Lab does not work from `file://`; it needs HTTP.
- Pages use absolute root paths (e.g. `/favicon.svg`, `/life-cycle-game.html`), so they assume deployment at a domain root.
- Offline use degrades third-party features (fonts, map, analytics, feedback form, page-flip effect on the Storybook).

## 5. How to reproduce

```bash
# Genetics engine
cd drosie-genetics-lab && node tests/run-tests.mjs

# Static checks
python3 seo/tools/seo_check.py

# Conference (needs Playwright with Chromium, and axe-core for two scripts)
mkdir -p /tmp/axe && cd /tmp/axe && npm init -y && npm i axe-core
cd <repo> && python3 -m http.server 8123 &
AXE_PATH=/tmp/axe/node_modules/axe-core/axe.min.js tests/conference/run-all.sh
```

`run-all.sh` writes to `/tmp/conf-last.txt`, and five scripts expect the scratch directories named in their source; create them first (see readiness report item T-3).

## 6. Recommended additional testing before claiming more

1. Cross-browser run of the Conference and Genetics suites on Firefox and WebKit (Playwright supports both).
2. Add smoke tests for the untested components (load without console errors, key flows).
3. Manual screen-reader pass (NVDA + Firefox, VoiceOver + Safari) of at least the Genetics Lab, Secret Fly Lab and Conference.
4. A pilot with teachers and children, with an ethics review, if any claim about learning is to be made.
