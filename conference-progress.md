# Drosie's First Scientific Conference · progress log

Branch: `claude/magical-planck-uqfniy` (cut from `origin/main` at db76f5e). **Nothing merged or deployed.**
Entry page `scientific-conference.html` · guide `conference-teacher-guide.html` · assets `conference-assets/` · tests `tests/conference/`

> Branch note: the environment designated this branch for all work, so I developed on it directly instead of creating a second git worktree. No other branch was touched.

## Status: all ten milestones implemented and tested (see limitations below before calling it "done")

| M | Scope | Status |
|---|-------|--------|
| M1 | Architecture, visual system, navigation, persistence | done |
| M2 | Introduction and path selection (Ch1, Ch2) | done |
| M3 | Guided simulation + original-research organizer (Ch3) | done |
| M4 | Data interpretation and graphing (Ch4) | done |
| M5 | Abstract studio (Ch5) | done |
| M6 | Poster studio and exports (Ch6) | done |
| M7 | Registration + interactive hall (Ch7, Ch8) | done |
| M8 | Presentation practice, scientist questions, revision (Ch9) | done |
| M9 | Finale, certificate, portfolio (Ch10) | done |
| M10 | Teacher guide, a11y, SEO, regression testing, polish | done (see "Not done / not verified") |

## How to resume (new Claude Code session)
1. `git checkout claude/magical-planck-uqfniy && git pull`
2. `python3 -m http.server 8123` from the repo root (background).
3. `npm i axe-core` in a scratch folder, then `AXE_PATH=/path/to/node_modules/axe-core/axe.min.js tests/conference/run-all.sh` (Playwright + Chromium are preinstalled in the cloud image; run `node -e "require('playwright')"` to confirm).
4. Everything is committed. Remaining work is only the "Not done / not verified" list.

## Architecture (stable, extensible)
- Static site, no build step, no dependencies. Global `window.DC`. A chapter is `DC.register(n, {render, mount, complete, gate})`. To add a module: new `chN.js` + a row in `DC.CHAPTERS` (`conf-data.js`) + a script tag.
- One state object saved to `localStorage['drosieConference.v1']` (`conf-core.js`), flushed on `pagehide`. Chapter completion is **derived** from state (never stored), so gates cannot get out of sync.
- Event delegation: `data-act` → `DC.acts[name]`; fields use `data-bind="path"`; `DC.onBind(prefix, fn)` for live updates. `DC.softUpdate()` refreshes the rail and Next button **without replacing unchanged DOM** (replacing buttons between mousedown and mouseup swallowed clicks: fixed).
- Single source of truth for data: `conf-data.js` (`DC.DATA`). The vial drawing, animation, data table, stats, graphs, abstract checks, poster figure, hall answers and portfolio are all computed from it (or from the numbers the learner recorded).
- Print: `DC.print(html, orientation)` fills `#printRoot` then `window.print()`; `@media print` hides everything else.

## Requirements checklist (spec §§ 1–15)
Legend: ✅ implemented and tested · 🟡 implemented, with a stated limitation · ⬜ not done

**Chapters**
- ✅ Ch1 invitation: illustrated invitation, Drosie guide, why scientists attend, nickname or anonymous, badge preview (live), guided vs independent, "not necessarily peer reviewed" check
- ✅ Ch2 two pathways. Path A study card lists question, hypothesis, prediction, IV, DV, control, 10 flies, 5 trials, measurement, uncertainty, limitations; simulation labeled. Path B has all ten structured fields, skip boxes, project types (no hypothesis required for observation/exploration), local-only
- ✅ Ch3 virtual lab: setup sorting, reference line, 10 s measurement period, repeated trials, count-and-record, data table, variation question. Animation/numbers share one source; Path B research organizer instead of invented data
- ✅ Ch4 summaries calculated from recorded data, three interactive graphs, truncated-axis demo, observation/interpretation, causation, repeated-measures-vs-replicates, limitations; **no p-values**. Path B: four evidence types (no forced bar graph), claims/evidence organizer
- ✅ Ch5 abstract studio: five sections, explanations, examples, starters, live preview, word counters, missing-info feedback, number-vs-data check, overclaim check; never writes a conclusion or invents numbers; simulated example abstract
- ✅ Ch6 poster studio: editable fields incl. acknowledgments/references, 3 layouts, 5 palettes with computed contrast, data figure + caption, design guide, checklist (fits-one-page measured), full-size preview, print/PDF
- ✅ Ch7 fictional check-in, badge, program, poster assignment, prep checklist, talk-ordering practice (buttons, no drag)
- ✅ Ch8 illustrated hall with six keyboard-operable areas, five original fictional scientists, path-aware questions with specific feedback, three flawed fictional posters, fictional talk with claims check, glossary and references booth, reflection area
- ✅ Ch9 silent 60 s practice (no mic/camera), explanation challenge, three audience questions that explicitly honor "I don't know yet", revision log with real-change detection, reflection
- ✅ Ch10 certificate (simulated, participation only), printable abstract/poster/reflection/badge, portfolio `.html`, JSON backup/restore, links to other Drosie's World resources

**Cross-cutting**
- ✅ Privacy: no login/ads/tracking/server; local storage; reset; backup; "storage can be lost" message; PII guard on nickname/author/thanks
- ✅ Accessibility: see tests; skip link, focus outlines, labels, landmarks, large text, high contrast, reduced motion (device + setting), text alternatives, non-drag alternatives
- ✅ Teacher/parent guide (objectives, age, time, use, paths, discussion questions, terminology, assessment, privacy, accessibility, references); **no standards alignment claimed**
- ✅ SEO: title, description, canonical, crawlable intro with internal links, sitemap entries, accurate JSON-LD (`LearningResource`, no ratings/reviews), home footer link
- ✅ Existing pages unchanged except one footer link in `index.html` and two `sitemap.xml` entries
- 🟡 Scientific references: two real papers located in PubMed (metadata/abstracts only; **full texts not read**); cited only as examples of climbing assays

## Verified references
- Gargano JW et al. 2005, Exp Gerontol 40(5):386-395, doi:10.1016/j.exger.2005.02.005, PMID 15919590
- Nichols CD, Becnel J, Pandey UB. 2012, J Vis Exp (61):3795, doi:10.3791/3795, PMID 22433384
Statements such as "fruit flies are ectotherms" are standard textbook biology and carry no specific citation; the guide asks adults to check a biology text.

## Tests actually run (Playwright + Chromium; `tests/conference/run-all.sh`)
`unit` 9 · `m1-m2` 28 · `m3` 35 · `m4` 42 · `m5` 28 · `m6` 33 · `m7` 51 · `m8` 32 · `m9` 39 · `keyboard` 29 · `e2e` (Path A, blank browser → certificate, UI only) 30 · `e2e-b` (Path B) 20 · `guide-and-site` 44 · `a11y` (axe-core, 10 chapters × 2 paths) 22. **All passed at the last run.**
Each chapter test also checks horizontal overflow at 320 / 390 / 768 / 1280 px and console errors. Real files produced and inspected: poster PDF (1 page, text extractable), certificate PDF, abstract/reflection/badge PDFs, standalone portfolio `.html` (opened in a fresh page: renders with styles, no errors).
Visual inspection (screenshots): Ch1, Ch3 (lab), Ch4 (graph), Ch5, Ch6 (desktop + 390 px), Ch8 hall (desktop + 390 px), Ch10, poster/certificate PDFs.

## Bugs found by testing and fixed
Scrollable table label leaked page width · checkbox clicks blocked by global `preventDefault` · save lost within 120 ms of reload · poster too tall to print on one page (figure height, aspect, type scale) · chart markers had `aria-label` without role (axe) · "all flies" overclaim detector flagged the careful phrase "cannot tell us what all flies do" · timer skip capped at step 5 · **Next click swallowed after typing** (footer replaced on blur) · Ch9 reflection did not unlock Next · ordering focus lost at top row · JS changed `document.title` (hurt SEO) · fictional beans poster was itself scientifically doubtful (dark-grown seedlings can be taller): replaced with a seed-sprouting example.

## Not done / not verified (honest list)
1. **No human testing at all**: not with children, teachers, or assistive-technology users. No screen-reader (NVDA/JAWS/VoiceOver), voice-control or switch testing. axe-core passing ≠ accessible. No WCAG compliance claim is made anywhere.
2. **Only Chromium was run.** Firefox/Safari untested. The poster uses CSS container-query units (modern browsers) and `zoom` for the phone preview. Print/PDF verified only through Chromium; real print dialogs on other browsers and on paper are unchecked.
3. Time estimates and the 7–12 age range are **estimates, not measured**; the guide says so.
4. Feedback on writing/answers is **word-and-number pattern matching**, not language understanding. It can accept weak answers and reject good ones. The UI and guide say so.
5. Scientific accuracy was reviewed by me (the author) against the spec and the two PubMed records; **no domain expert review**. The simulated data and the fictional posters/talk are teaching constructs.
6. Only 320/390/768/1280 overflow is automated; visual review at every width for every chapter was not done (spot checks only). Real touch devices untested.
7. Hall illustration is simple; the third poster board in the SVG is blank (cosmetic).
8. Path A uses one fixed dataset; the same learner on a different day (or a whole class) sees the same numbers.
9. Navigation links to the conference exist from the home footer only. I deliberately did **not** edit the home nav dropdown, `science-activities/` or `teacher-resources/` to avoid conflicts with other open branches; adding those links is a one-line follow-up for the site owner.
10. English only.

---
## Pre-merge review (second pass, after PR #13 was opened)
Compatibility: `origin/main` has not moved since the branch point (db76f5e) and already contains PRs #11 and #12; a trial merge in a throwaway worktree had **no conflicts**. Only `index.html` (1 footer link) and `sitemap.xml` (2 entries) touch existing files.

Problems found by the review and **fixed in this pass**
1. **Path leakage (real bug):** switching A→B left the fruit-fly abstract/poster/answers in the Path B portfolio. Each path now keeps its own abstract, poster, hall answers, practice answers and revisions; switching back restores them.
2. **Stuck Start button (real bug):** leaving Chapter 3 mid-trial and returning rendered a permanently disabled "Counting time…" button.
3. **Science wording:** the study listed "flies get tired after several trials" as a source of uncertainty, but the cited RING paper's abstract reports performance was *not* influenced by repeated testing. Rewritten as a thing a real lab would check. A hard-coded "lower in every trial" (trials are not paired) now quotes computed ranges. Chapter 3's "mix the order so tiredness…" rewritten ("alternate between groups… time of day"). Chapter 4 now says explicitly that results do not always match the prediction.
4. Charts were illegible at 320 px (~4.6 px text): added a narrow-screen drawing (≥ 8 px text, no clipping). Chapter 7 program table wrapped times mid-word.
5. Screen readers: example-abstract heading jump (h2→h4), poster `<h1>` inside the page, answer feedback not reliably announced (now routed through the live region), Path B chapter-3 gate message now lists exactly what is missing.
6. Added a `@supports not (width:1cqw)` pixel fallback for poster sizing in older Safari/Firefox (**untested**: the bundled Chromium supports `cqw`).

New suites: `review` 49 · `exports` 25 (reads real PDFs with pdftotext; checks printed poster sizes: body 10.7 pt, headings 11 pt, caption 9.2 pt) · `privacy` 7 (158 requests during a full session: all same-origin GETs, no fetch/XHR/beacon/WebSocket, learner text never in a URL/body, one localStorage key, no cookies) · `robustness` 20 (locked deep links, corrupt/blocked storage, mid-animation navigation, XSS payloads in every free-text field incl. the downloaded portfolio, large text at 320 px).

Still true after review (unchanged limitations)
- **Firefox and WebKit could not be run**: only Chromium is installed and browser downloads are blocked by the network policy. Compatibility was reasoned from feature support only (container-query units: Safari 16+/Firefox 110+; CSS `zoom` fallback: Firefox < 126 shows a sideways-scrolling preview; `dialog.showModal`: Safari 15.4+).
- No human or assistive-technology testing; keyboard behavior is verified only by automated scripts. Reduced motion verified via emulated `prefers-reduced-motion` and the in-app setting only.
- References: both PubMed records re-confirmed; **PMC returned no full text** for Nichols 2012 and Gargano 2005 has no PMC copy via this tool, so neither full text was read. Still **unverified** by any source in this activity: that 18 °C vs 25 °C reduces climbing in real *Drosophila* (stated only as a hypothesis about simulated data; a PubMed search surfaced cold-stress work at 0 °C, which does not test this), and the general facts "fruit flies are ectothermic" and "flies climb after being tapped" (the latter is supported by the Gargano abstract).
