# Drosie's First Scientific Conference · progress log

Branch: `claude/magical-planck-uqfniy` (cut from `origin/main` at db76f5e). Nothing merged or deployed.
Entry page: `scientific-conference.html` · assets: `conference-assets/` · tests: `tests/conference/`

## How to resume (new Claude Code session)
1. `git checkout claude/magical-planck-uqfniy && git pull`
2. `python3 -m http.server 8123` from the repo root (background), then `node tests/conference/<file>.js` (Playwright is preinstalled).
3. Read the **Milestone status** table below and continue at the first row that is not "done".

## Architecture (stable)
- Static site, no build step. `window.DC` namespace. Chapter = `DC.register(n,{render,mount,complete,gate})`.
- State in one object persisted to `localStorage['drosieConference.v1']` (`conf-core.js`). Chapter completion is *derived* from state, never stored.
- Event delegation: `data-act="name"` -> `DC.acts[name]`; form fields use `data-bind="path.in.state"`; `DC.onBind(prefix, fn)` for live previews.
- Print: `DC.print(html, orientation)` fills `#printRoot` then `window.print()`; `@media print` hides everything else.
- Charts: `conf-chart.js` (dot / bar / line, text table alternative, keyboard-focusable points).
- Simulated dataset and fixed content: `conf-data.js` (single source of truth).

## Milestone status
| M | Scope | Status |
|---|-------|--------|
| M1 | Architecture, visual system, navigation, persistence | done |
| M2 | Introduction and path selection (Ch1, Ch2) | done |
| M3 | Guided simulation + original-research organizer (Ch3) | done |
| M4 | Data interpretation and graphing (Ch4) | done |
| M5 | Abstract studio (Ch5) | done |
| M6 | Poster studio and exports (Ch6) | done |
| M7 | Registration + hall (Ch7, Ch8) | done |
| M8 | Presentation practice, questions, revision (Ch9) | next |
| M9 | Finale, certificate, portfolio (Ch10) | todo |
| M10 | Teacher guide, a11y, SEO, regression, polish | todo |

## Verified references (PubMed record checked; full texts NOT read)
- Gargano et al. 2005, Exp Gerontol 40(5):386-395, doi:10.1016/j.exger.2005.02.005, PMID 15919590
- Nichols, Becnel, Pandey 2012, J Vis Exp (61):3795, doi:10.3791/3795, PMID 22433384
Limitation: only title/abstract metadata were retrieved; method details in the activity are *inspired by* these assays, not copied.

## Tests run so far
- `m1-m2.js` 28/28 · `m3.js` 35/35 · `m4.js` 42/42 · `m5.js` 28/28 · `m6.js` 33/33 · `m7.js` 51/51 (all Playwright/Chromium; each also checks overflow at 320/390/768/1280 and console errors).
- Poster PDF: generated via Chromium `page.pdf()` in print media, 1 page, text extractable (pdftotext).

## Known issues / limitations
(see bottom of file as milestones complete)
