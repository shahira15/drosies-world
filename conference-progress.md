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
