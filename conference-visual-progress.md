# Drosie's First Scientific Conference · visual-first redesign · progress log

Branch: `feature/conference-visual-adventure` (cut from `origin/main` at 5474c07, which already contains PR #13 and PR #14).
Nothing is merged or deployed. The old branch/PR (#13) is not reused.

## M0 · Audit

### How the existing engine works (what must be preserved)
- Global `window.DC`. A chapter is `DC.register(n, {render, mount, complete, gate})`; **completion is derived from state** (never stored), gates come from `DC.canOpen`.
- One state object in `localStorage['drosieConference.v1']` (`conf-core.js`). `data-act` → `DC.acts[name]` (event delegation), `data-bind="path"` for fields, `DC.onBind(prefix, fn)` for live updates.
- Single source of truth for numbers: `conf-data.js` (`DC.DATA`: counts `[7,8,6,8,7]` / `[4,5,3,5,4]`). Drawing, animation (`DC.lab.positions/svg`), tables, stats (`DC.stats`), graphs (`DC.chart`), abstract checks, poster figure, hall feedback and portfolio all derive from it or from what the learner recorded.
- Path isolation: `pickPath` snapshots `abs/poster/hall/prac/revs` per path.
- Printing: `DC.print(html, orientation)` → `#printRoot`; exports: `DC.certHTML / abstractSheet / posterHTML / reflectionHTML / portfolioHTML`.
- 20+ Playwright suites in `tests/conference/` (run-all.sh), including privacy, XSS, axe, keyboard, exports.

### Reading load of the current experience (measured, `tests/conference/reading-load.js`, baseline file `docs/conference-visual/baseline-legacy.json`)
Desktop 1280×800, each chapter opened at the start of its own work, Path A / Path B:

| Ch | Words (first screen) | Paragraphs | Text fields | Long text blocks |
|---|---|---|---|---|
| 1 Invitation | 329 (168) | 5 | 1 | 2 |
| 2 Path | 105 (105) | 3 | 0 | 0 (but Path B opens a 10-field form) |
| 3 Lab | 482 (196) / 251 B | 9 | 6 / 10 B | 5 |
| 4 Detective | 773 (145) / 280 B | 3 | 7 / 3 B | 7 |
| 5 Abstract | 742 (360) / 641 B | 14 | 5 | 8 |
| 6 Poster | 766 (162) / 712 B | 8 | 12 / 11 B | 4 |
| 7 Registration | 337 (127) | 10 | 0 | 3 |
| 8 Hall | 125 (63) (map only; every area opens a text panel) | 1 | 0 | 1 |
| 9 Present | 673 (192) / 614 B | 15 | 9 | 4 |
| 10 Finale | 291 (186) | 8 | 0 | 3 |

Diagnosis: five chapters (3, 4, 5, 6, 9) ask for 480–770 words of reading plus up to 12 fields; the hall is a clickable picture that opens text panels. This matches the creator's feedback.

### Reference: the Secret Fly Lab (`/lab/`)
Full-bleed illustrated room, touchable props, big chunky "Play" button with a dark lower edge, small icon toolbar, almost no text. Its character art is explicitly **temporary placeholder art** and depends on the lab's own `DW` namespace, so it is not reused; the conference gets its own original art in the same spirit.

## Architecture of the redesign (decided)
A **visual layer on top of the validated engine**, not a rewrite:
- `vx.css`, `vx-core.js` (scene frame, Drosie companion, dialogue, hotspots/tray, Research Backpack, world map, Explorer/Researcher level, chapter wrapper), `vx-art.js` (original SVG scene/character toolkit), then `vx-*.js` per chapter group.
- `DC.vx.chapter(n, def)` wraps `DC.chap[n]`: it keeps the engine's `complete()` and `gate()` and the **same state keys**, and replaces `render/mount` with a scene. The original chapter is kept as `legacy` and powers the **Researcher workbench** (full forms, tables, numeric tools), so none of the validated functionality is lost.
- **Explorer** level (default): visual interactions, minimal typing. **Researcher** level: the same scenes plus the full workbench. Switching levels never touches saved work; both write the same state.
- New UI-only state lives in `state.ui` (level, per-chapter step, seen backpack cards). `DC.defaults()` gains `ui`; old saves load through the existing deep-merge (tested as a migration).
- No new dependencies; static hosting unchanged.

## Chapter plan (before → after)
See the table in the final PR description; each milestone below is ticked only when its primary visual interaction works and is tested.

## Milestone status
| M | Scope | Status |
|---|---|---|
| M0 | Audit and plan | done |
| M1 | Design system, Drosie, scene framework, map, Research Backpack | done (`vx-core.js`, `vx.css`, `vx-art.js`; map, backpack, level switch, old-save migration tested) |
| M2 | Ch1–2 | done (`vx-ch1-2.js`: envelope, 3 conference scenes, badge studio, two doors, stamped simulation seal, Path B step-by-step) |
| M3 | Ch3 lab | done (`vx-ch3.js`: bench scene with 9 objects, planning game, animated trial, tap-to-count flies with nearest-fly targeting, clipboard/lamps, compare + variation; Path B card organizer; 55 checks) |
| M4 | Ch4 detective | done (`vx-ch4.js`: evidence-board scene with 7 case pins: card sort, averages, graph reading, truncated-axis slider, seen-vs-guessed card sort, claim check, limits; Path B evidence board; 51 checks) |
| M5 | Ch5 abstract workshop | done (`vx-ch5.js`: five arched story slots, sentence cards generated from the learner's data with wrong-number / interpretation / overclaim distractors, write-my-own with the original checker, Path B own-words slots; 42 checks) |
| M6 | Ch6 poster studio | todo |
| M7 | Ch7–8 lobby and hall | todo |
| M8 | Ch9 theater | todo |
| M9 | Ch10 celebration | todo |
| M10 | Integration, verification, polish | todo |

## Notes from M1–M2
- Old regression suites now run against the original chapters with `?legacy=1` (the Researcher workbench is the same code). New suites run the visual interface.
- `DC.setPath(p)` was split out of `pickPath` (same isolation behaviour) so visual chapters can switch paths without re-rendering mid-typing.
- Drosie's expressions are implemented as state-dependent animation + an icon badge on the existing mascot artwork, **not** as redrawn poses. This is a documented limitation (no new Drosie illustrations exist).
- Game layout: scene + companion on the left, the current step on the right (desktop); stacked on phones. In-scene hotspots hide on phones; every hotspot has a tray/list alternative.
