# Drosie's World: The Secret Fly Lab

A free, browser-based science game for ages 5–8 (drosiesworld.com). **Lab 1: Meet Your Fruit Fly** — find a stereomicroscope, learn its parts, prepare a specimen, operate a simulated microscope, explore fly anatomy, tell boy flies from girl flies, and solve the Fly Detective challenge.

No build step, no dependencies, no login, no paid services, no external fonts.

## Run it
- **Quickest:** double-click `index.html` (works from `file://`).
- **Local server (recommended):** `python3 -m http.server 8000` in this folder, then open http://localhost:8000.

Controls: mouse/touch tap and drag; arrow keys / A-D scroll the lab; mouse wheel pans; the pause and fullscreen buttons are in the top-right HUD.

## Deploy to GitHub Pages
1. Create a repository and push the contents of this folder to the `main` branch (`index.html` at the repo root).
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, choose `main` / `/ (root)`, Save.
3. After a minute the game is live at `https://<user>.github.io/<repo>/`. Add a custom domain (e.g. `play.drosiesworld.com`) under the same page if wanted.

## Game structure
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
`index.html` loads GoatCounter from `https://drosiesworld.goatcounter.com/count` — change the subdomain to your own. Only anonymous event names are sent, once per session, and Do Not Track is respected. Events (path prefix `secret-fly-lab/`): `game-started`, `mission-1-completed` … `mission-7-completed`, `microscope-activity-completed`, `anatomy-exploration-completed`, `fly-detective-completed`, `game-completed`. No personal data is collected; progress is not stored between sessions.

## Science notes
Fly illustrations are stylised diagrams, not photographs, and say so in-game. Facts used: *Drosophila melanogaster* adults ≈ 2.5 mm; males have sex combs on the front legs, a dark rounded abdomen tip and fused dark posterior bands; females have fully striped, pointed abdomens and are usually slightly larger (unreliable alone); compound eyes of ~800 ommatidia; wild-type eyes red. Reference: FlyBase (flybase.org) and standard *Drosophila* teaching guides. The microscope is a simulation with simplified optics (blur, brightness and field-of-view models) for learning the controls.

## Not finished / missing
- Original Drosie and Dr. Maya artwork (placeholders in use).
- Recorded voice acting (uses browser text-to-speech, quality varies by device).
- Real specimen photographs / micrographs (all art is illustrated).
- Only Lab 1 exists; later labs are not built.
- No saved progress between sessions (by design: no login/storage).
- Not tested on physical iOS/Android devices or with screen readers; layouts were checked in headless Chromium at desktop sizes.
- Custom audio files and large-scene image overrides are supported by the manifest structure but unused.
