# Drosie's World: The Secret Fly Lab

A free, browser-based science game for ages 5–8 (drosiesworld.com). **Lab 0: Safety Academy** (7 missions, new) is the prequel; **Lab 1: Meet Your Fruit Fly** — find a stereomicroscope, learn its parts, prepare a specimen, operate a simulated microscope, explore fly anatomy, tell boy flies from girl flies, and solve the Fly Detective challenge.

No build step, no dependencies, no login, no paid services, no external fonts.

## Run it
- **Quickest:** double-click `index.html` (works from `file://`).
- **Local server (recommended):** `python3 -m http.server 8000` in this folder, then open http://localhost:8000.

Controls: mouse/touch tap and drag; arrow keys / A-D scroll the lab; mouse wheel pans; the pause and fullscreen buttons are in the top-right HUD.

## Deploy to GitHub Pages
1. Create a repository and push the contents of this folder to the `main` branch (`index.html` at the repo root).
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, choose `main` / `/ (root)`, Save.
3. After a minute the game is live at `https://<user>.github.io/<repo>/`. Add a custom domain (e.g. `play.drosiesworld.com`) under the same page if wanted.


## Lab 0: Safety Academy (new)
Players start at the Lab Entrance hub (glass doors, mission map, Dr. Maya's welcome, a skippable intro). Each mission unlocks the next; completing Mission 7 lights up the lab, opens the doors and awards the animated badge **CERTIFIED LAB READY — SAFETY SCIENTIST**. The badge is a *game achievement*, not an official certification (stated on the badge screen). Lab 1 unlocks afterwards (a teacher can unlock it earlier in Teacher Mode). An optional 3-question refresher is offered before Lab 1.

| # | Mission | Learning objective | Files |
|---|---|---|---|
| 1 | Suit Up | Choose protective gear for a task (goggles, coat, gloves, closed shoes, hair tied back); reject distractors (scarf, sunglasses, sandals) | `js/lab0/m1.js` |
| 2 | Protection Lab | Explain what each PPE item protects, and that PPE is a helper, not magic | `m2.js` |
| 3 | Spot the Hazard | Recognise hazards (food, unlabeled bottle, loose hair near heat, spill, glass, blocked exit, sandals, running); respond by stepping away and telling an adult, never cleaning spills or handling glass | `m3.js` |
| 4 | Gear for the Job | Match gear to the job; see that PPE alone does not make a hazardous job safe (Explorer / Scientist / Advanced) | `m4.js` |
| 5 | Safety Control Room | Judge SAFE vs UNSAFE actions and explain why | `m5.js` |
| 6 | Emergency Response | Spill, eye splash (alert the teacher AND start eyewash immediately, keep rinsing until told to stop, about 15 minutes), broken glass, fire alarm | `m6.js` |
| 7 | Safety Scientist Challenge | 8 questions (pass at 6 on first tries), retry with fresh variants and a review of topics | `m7.js` |

Missions never punish: wrong answers give gentle hints and the mission still completes. Badges need ≥75% first-try accuracy (Mission 7 needs ≥6/8), otherwise replay is offered.

### Architecture
Vanilla JS classic scripts under `window.DW` (no modules, no build; works from `file://` and GitHub Pages). Lab 0 adds: `js/data0.js` (all content), `js/hub.js` (entrance, mission map, certificate, refresher), `js/teacher.js`, `js/lab0/core.js` (16:9 1600×900-unit stage, shared question card `L0.ask`, cancel-safe async runs, finish/result card), `js/lab0/m1–m7.js`, `js/art/rooms.js` and `js/art/safety.js` (inline SVG art), `css/lab0.css`. Progress is saved in `localStorage` under `dw.progress.v1` (Lab 0 and Lab 1 separate); **Reset progress** is in Teacher Mode and settings.

### Teacher Mode
"For teachers" on the hub, behind a simple adult math question. Everything is local and on-device: overview, this device's progress, printables (PPE sheet, checklist, hazard hunt, cards, quiz A/B, teacher guide), a pre/post check, and settings (unlock Lab 1, reset).

### Safety references used
American Chemical Society *Safety in the Elementary Science Classroom*; NSTA safety resources; OSHA laboratory standard / eye and face protection; CDC and NIOSH PPE and glove guidance; ANSI/ISEA Z358.1 (eyewash: flush about 15 minutes). The game is educational and does not replace your school's own safety rules, your teacher, or training.

### Optional pre/post check
Teacher Mode offers printable Form A / Form B. Limitations: tiny samples, no control group, memorising answers is possible. Results show nothing about learning gains and we make no such claim. No names or personal data are collected by the game.

## Lab 1 structure

| Mission | What happens | Files |
|---|---|---|
| 1 Welcome | Explore the lab, find the stereomicroscope | `js/lab.js`, `js/main.js` |
| 2 Parts | Tap the eyepieces, zoom, focus, objective, stage, light | `js/scope.js` (learn) |
| 3 Prepare | Collect vial + pad, drag the sleeping fly onto the stage (snap) | `js/scope.js` (prep) |
| 4 Master the microscope | Light, brightness, focus blur, fine focus, zoom + shrinking field of view, specimen position | `js/scope.js` (master) |
| 5 Anatomy | Head, eyes, antennae, thorax, wings, legs, abdomen | `js/anatomy.js` |
| 6 Boy vs girl | Stripes, dark tip, sex comb close-up, size is unreliable | `js/compare.js` |
| 7 Fly Detective | 6 cases, 3 difficulty tiers, 3-level hints, never punishes | `js/detective.js` |

HUD: mission card + progress, inventory, journal (discoveries / equipment / badges), tooltips, settings (sound, music, narration), pause, restart, lab ↔ microscope switch, fullscreen.

## Characters and assets (temporary placeholders!)
Drosie and Dr. Maya currently use **clearly marked TEMP ART** vector placeholders (`js/art/chars.js`). To use original art:
1. Put PNG/WebP files in `assets/characters/maya/` and `assets/characters/drosie/` (transparent, 512×512, same canvas for each state).
2. Use the file names listed in `js/manifest.js` (Maya: `neutral talk happy think celebrate`; Drosie: `idle happy think celebrate fly`, `.png`).
3. Set `provided: true` for that character in `js/manifest.js`. Nothing else changes.

All other art (lab, microscope, fly, icons) is original inline SVG generated in `js/art/`. Sound effects and music are synthesized with WebAudio; narration uses the browser's built-in speech synthesis (toggle in settings).

## Analytics (GoatCounter, privacy-safe)
`index.html` loads GoatCounter from `https://drosiesworld.goatcounter.com/count` — change the subdomain to your own. Only anonymous event names are sent, once per page session each (deduplicated), and Do Not Track is respected (verified: 0 events sent with DNT on). Path prefix `secret-fly-lab/`. Lab 1 events: `game-started`, `mission-1-completed` … `mission-7-completed`, `microscope-activity-completed`, `anatomy-exploration-completed`, `fly-detective-completed`, `game-completed`. Lab 0 events: `lab0-started`, `lab0-mission-N-started`, `lab0-mission-N-completed`, `lab0-assessment-started`, `lab0-assessment-completed`, `lab0-completed`, `lab1-unlocked`, `lab0-refresher-taken`, `lab0-teacher-print`. Progress stays only in the player's own browser; no names, scores or personal data are sent.

## Science notes

Fly illustrations are stylised diagrams, not photographs, and say so in-game. Facts used: *Drosophila melanogaster* adults ≈ 2.5 mm; males have sex combs on the front legs, a dark rounded abdomen tip and fused dark posterior bands; females have fully striped, pointed abdomens and are usually slightly larger (unreliable alone); compound eyes of ~800 ommatidia; wild-type eyes red. Reference: FlyBase (flybase.org) and standard *Drosophila* teaching guides. The microscope is a simulation with simplified optics (blur, brightness and field-of-view models) for learning the controls.


## File-by-file change summary
- **New:** `js/data0.js`, `js/hub.js`, `js/teacher.js`, `js/lab0/core.js`, `js/lab0/m1.js`–`m7.js`, `js/art/rooms.js`, `js/art/safety.js`, `css/lab0.css`.
- **Edited:** `index.html` (scripts, stylesheet, description), `js/main.js` (Play opens the hub, `DW.startLab1`, finale returns to the Lab Entrance), `js/ui.js` (mission tag, Safety journal tab, Lab 0 badges, Lab Entrance menu item), `js/save.js` (localStorage progress and reset), `js/track.js` (new events), `js/util.js` (`DW.reduced`), `js/fx.js`, `js/art/icons.js` (new icons). Lab 1 files (`lab.js`, `scope.js`, `anatomy.js`, `compare.js`, `detective.js`) are unchanged.

## QA actually run
Automated Playwright runs in headless Chromium (desktop 1280×720, phone-landscape 844×390 viewport, `file://`):
- Full end-to-end: hub → Missions 1–7 → certificate → Lab 1 entry → return to hub: passed, no console errors.
- Mission 7 failure path (review card, retry with fresh variants) and pass: passed.
- Locked-mission toast, progress saved and restored after reload (intro does not replay, Enter Lab 1 shown): passed.
- Teacher Mode math gate (wrong answer rejected), printable sheets render, print-media screenshot reviewed, Unlock Lab 1, Reset clears localStorage: passed.
- `prefers-reduced-motion` flag honoured; Do Not Track sends 0 events: passed.
- Phone-landscape screenshots reviewed: layouts usable; while Dr. Maya's dialogue bar is open it covers part of the lower-left panel, then clears.

**Not tested:** real iOS/Android devices, screen readers, real print dialog or printers, real touch drag, speech quality across browsers, Safari/Firefox.

## Limitations
- Drosie and Maya are marked **TEMP** placeholder art (see replacement steps above); all other art is generated SVG.
- Narration is browser text-to-speech; quality varies.
- Fly Lab 1 remains un-reviewed on physical devices.
- Pre/post design cannot prove learning outcomes.
- Safety guidance is general classroom guidance; follow your school's own rules.
