# Software Architecture

Version 1.0.0 (draft). Describes the repository as of commit `b3707ac` plus this release-preparation branch.

## 1. Overview

Drosie's World is a **static, client-side web application suite**. There is no server component, build step, bundler, transpiler, framework or package dependency in the shipped software. Each activity is a mostly self-contained HTML page (or small folder) with its own scripts and styles. About 25,700 lines of HTML, JavaScript and CSS (excluding `docs/`) plus assets.

```
Browser ──► static host (GitHub Pages, CNAME drosiesworld.com)
              │
              ├─ HTML pages + JS/CSS (no build)
              ├─ images (WebP/PNG/SVG), PDFs, DOCX, ZIP downloads
              └─ optional third-party calls (see §6)
All learner state: localStorage in the learner's own browser
```

## 2. Components and technology style

The suite was authored in several independent styles. They share no common runtime library.

| Component | Path | Script model | Global namespace | State key (localStorage) |
|---|---|---|---|---|
| Home, hubs, team, 404 | `index.html`, `styles.css`, `script.js`, `seo-pages.css`, hub folders | classic scripts, inline | none | `drosie-letter-invite:v1` (invite widget) |
| **Genetics Lab** | `drosie-genetics-lab/` | **ES modules** (`<script type="module">`) | none (imports) | `drosie-genetics-lab:v1` |
| **Secret Fly Lab** | `lab/` | classic scripts | `window.DW` | keys prefixed `dw.` (e.g. `dw.progress.v1`) |
| **Scientific Conference** | `conference-assets/` | classic scripts with cache-busting query strings | `window.DC` | `drosieConference.v1` |
| **Grow Your Own Fruit Fly** | `fly-lab-assets/` | classic scripts | `window.FL` | `drosie-flylab-session-v1`, `drosie-flylab-prefs-v1` |
| **Life Cycle Adventure** | `life-cycle-assets/` | classic script | none | `drosie-lifecycle-prefs-v1` |
| **Lab Notebook Academy** | `notebook-academy-assets/` | classic scripts | (module-scoped objects) | `drosie-notebook-academy-v1` |
| **Climbing Challenge** | `climbing-game.html` (inline CSS and JS) | inline | none | none found |
| **Letters from Drosie** | `letters/` | classic scripts | none | `drosie-letters:v1` |
| **Storybook** | `storybook.html` | inline + `page-flip` 2.0.7 from CDN | `St` (page-flip) | not determined |

The Genetics Lab requires an HTTP server because of ES modules. `lab/` is documented to work from `file://`.

## 3. Genetics Lab (the most structured component)

```
index.html ──► js/ui.js (shell, HUD, dialogs)
                 ├─ js/stations/*.js    8 stations (stocks, breeding, microscope, punnett,
                 │                      chromosome, analysis, notebook, missions)
                 ├─ js/lab-scene.js, phenotype-renderer.js   SVG drawing
                 ├─ js/missions.js, notebook.js, stocks.js, audio.js
                 └─ js/engine/          UI-independent genetics engine
                      trait-database → chromosome-model → genotype-parser
                      inheritance-models → recombination → viability
                      genetics-engine → simulation (seeded PRNG) → statistics
tests/engine.tests.js  ← runs headless in Node (tests/run-tests.mjs) or in the browser (tests/index.html)
docs/*.md              ← scientific reference, model specification, QA report, guides
```

Design properties: the engine has **no DOM dependency**, so the same code runs in Node for testing and in the browser; sampling is **seeded** for reproducibility; expected values in tests are written analytically rather than read back from the engine. `package.json` defines only `npm test` and has no dependencies.

## 4. Scientific Conference

A chapter-registry pattern: `DC.register(n, {render, mount, complete, gate})`. One state object persisted to `localStorage`; chapter completion is *derived* from state, never stored. Data source of truth is `conf-data.js` (`DC.DATA`): the vial animation, tables, statistics, graphs, abstract checks, poster figure and portfolio are all computed from the same numbers. Event delegation uses `data-act` attributes and `data-bind` for fields. The `vx-*` files are a later visual layer ("visual-first redesign") applied over the earlier `ch*.js` logic modules. Printing uses a `#printRoot` element and `@media print`; export formats are print-to-PDF, standalone `.html` portfolio, and JSON backup/restore.

## 5. Secret Fly Lab

Classic-script architecture under `window.DW`: `data0.js` (all Lab 0 content), `hub.js`, `teacher.js`, `lab0/core.js` and missions `m1`-`m7`, Lab 1 modules (`lab.js`, `scope.js`, `anatomy.js`, `compare.js`, `detective.js`), SVG art generated in `js/art/*.js`, WebAudio-synthesised sound (`audio.js`), analytics wrapper (`track.js`) and persistence (`save.js`). Characters Drosie and Dr. Maya are code-drawn placeholder vector art (`js/art/chars.js`) with an optional manifest for replacement bitmaps (`js/manifest.js`, `assets/` not present).

## 6. External interfaces

| Service | Where | Purpose | Failure behaviour |
|---|---|---|---|
| GoatCounter (`gc.zgo.at`, `drosiesworld.goatcounter.com`) | `index.html`, `lab/`, `discoveries.html`, `storybook.html` | anonymous page and event counts; visitor counter fetch | tracking silently skipped |
| Google Fonts | `styles.css` `@import`; `letters/index.html` | typography | fallback system fonts |
| Supabase REST + Edge Function | `index.html` (`DROSIE_FEEDBACK_CONFIG`) | public review list and feedback submission | form shows an error |
| Cloudflare Turnstile | `index.html` | bot check on feedback form | form cannot be submitted |
| unpkg (Leaflet 1.9.4, SRI hashes) and OpenStreetMap tiles | `index.html` | map | map absent |
| jsDelivr (`page-flip@2.0.7`) | `storybook.html` | page-turn effect | no SRI hash; behaviour on failure not tested |
| YouTube (nocookie) iframe | `discoveries.html` | embedded video | blank frame |
| Browser APIs | various | `localStorage`, Web Audio, `speechSynthesis`, `<dialog>`, `matchMedia`, Clipboard/Share, Fullscreen | most are feature-guarded with try/catch (not exhaustively verified) |

## 7. Data and persistence

No databases or user accounts apart from the optional feedback form (§6). Learner work is stored only in the browser. Export and backup are explicit user actions. The Conference includes a "personal information" guard on name-like fields and warns that storage may be lost.

## 8. Build, test and release tooling

- No build. A page is its source.
- Tests: `drosie-genetics-lab/tests/` (Node), `tests/conference/*.js` (Playwright, run by `tests/conference/run-all.sh`), `seo/tools/seo_check.py` (Python static checks). See `docs/TESTING.md`.
- Release: `tools/build_release.py` produces a deterministic ZIP; see `docs/RELEASE_BUILD.md`.
- Development-only dependencies (not declared in any manifest): Node 18+ (22 used), Playwright with Chromium, `axe-core` (installed ad hoc through `npm i axe-core`), Python 3.

## 9. Architectural risks and technical debt

1. **Five independent coding styles** and global-namespace patterns raise maintenance cost; no shared utilities.
2. **Dependencies are undeclared**: test tooling is described in a shell-script comment only; no lockfile.
3. **Hard-coded scratch paths** in some tests (`/tmp/claude-0/...` in `tests/conference/m6.js`, `m9.js`, `exports.js`, `robustness.js`, `vx-m6.js`), so a fresh checkout cannot run them as-is without creating those directories.
4. **Absolute site paths** (`/life-cycle-game.html`, `/favicon.svg`) mean pages assume they are served from a domain root; they break in a sub-folder deployment.
5. **Artwork embedded in code** (SVG drawings of Drosie and Dr. Maya in `lab/js/art/`, `drosie-genetics-lab/js/lab-scene.js`) complicates separating "software" from "artwork" for licensing.
6. `package.json` in the Genetics Lab lacks `version`, `license` and `description`.
7. Third-party CDN assets are not vendored; archived copies will depend on live third-party servers.
