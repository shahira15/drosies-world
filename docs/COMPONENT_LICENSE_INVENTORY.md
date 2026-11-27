# Component-Level Licensing Inventory (PROPOSED)

Status: **proposal; nothing is finalised.** "MIT (proposed)" means: the author is expected to approve MIT for that component. A component is only MIT-eligible where the author has the right to license it; items marked **HOLD** are not to be finalised until ownership or provenance is confirmed. All MIT proposals exclude the name, logo, mascot, character designs, storybook illustrations, photographs and other protected creative assets (see `ASSET_LICENSES.md`). AI-assisted code (`docs/AI_DISCLOSURE.md`): copyright subsistence in AI-assisted portions is jurisdiction-dependent; legal review recommended.

## 1. Software components

| Component | Paths | Files | Authorship | Character artwork inside? | Proposed licence | Notes |
|---|---|---|---|---|---|---|
| Genetics Lab engine | `drosie-genetics-lab/js/engine/` | 10 | Author with AI assistance | No | MIT (proposed) | UI-independent; strongest candidate for reuse |
| Genetics Lab UI | `drosie-genetics-lab/js/ui.js`, `stations/`, `missions.js`, `notebook.js`, `stocks.js`, `audio.js`, `css/`, `index.html`, `teacher/` | ~20 | same | `lab-scene.js` yes (see section 3) | MIT (proposed) except `lab-scene.js` (HOLD) | Educational text inside is content (see section 2) |
| Genetics Lab tests | `drosie-genetics-lab/tests/` | 3 | same | No | MIT (proposed) | |
| Secret Fly Lab | `lab/` (38 files) | 38 | same | `js/art/chars.js` yes; `js/art/rooms.js`, `lab.js`, `scope.js`, `safety.js`, `icons.js`, `fly.js` are scene/icon drawings | MIT (proposed) except `chars.js` (HOLD) | Room/scene drawings are generic laboratory art; author to confirm they contain no character likeness |
| Scientific Conference | `conference-assets/`, `scientific-conference.html`, `conference-teacher-guide.html` | 27 | Author with AI assistance (Claude Code) | Uses mascot raster images (not code-drawn); 5 fictional scientists drawn in code | MIT (proposed) | Fictional-scientist avatars are generic; confirm |
| Grow Your Own Fruit Fly | `fly-lab-assets/`, `grow-your-own-fruit-fly.html` | 6 | same | Raster mascot images only | MIT (proposed) | |
| Life Cycle Adventure | `life-cycle-assets/*.js,*.css`, `life-cycle-game.html` | 3 | same | Raster stage art only | MIT (proposed) | Images are artwork (section 4) |
| Climbing Challenge | `climbing-game.html` (inline) | 1 | same | Raster mascot image; fly symbol drawn in code | MIT (proposed) | |
| Lab Notebook Academy | `notebook-academy-assets/`, `lab-notebook-academy.html` | 7 | same | No | MIT (proposed) | |
| Letters from Drosie | `letters/` | 14 | Author with AI assistance | Raster mascot; `sprig.svg`, `wax-seal.svg` generic | MIT (proposed) | Provenance of the two SVGs to confirm |
| Storybook reader | `storybook.html` | 1 | same | Displays the book pages (artwork) | MIT (proposed) for the reader code | Book pages are artwork, not MIT |
| Site shell and hubs | `index.html`, `styles.css`, `script.js`, `seo-pages.css`, hub folders, `404.html`, `team.html`, `discoveries.html` | ~12 | same | Mascot images | MIT (proposed) for code; page text is content | `team.html` contains people's names/bios (personal data; author decision) |
| Cite hub | `cite/` | 5 | Author with AI assistance (Claude Code) | No | MIT (proposed) | Citation text is content |
| Tests and tools | `tests/`, `tools/`, `seo/tools/` | ~42 | same | No | MIT (proposed) | Some tests hard-code scratch paths (readiness report) |
| Vendored library | `vendor/page-flip/` | 2 | Nodlik | No | **MIT (upstream, not ours)** | See `THIRD_PARTY_NOTICES.md` |

## 2. Content components

| Component | Paths | Proposed licence | Note |
|---|---|---|---|
| Teaching text, lesson plans, worksheets | `Drosie_*.docx`, `lesson-*.pdf`, `all-activity-sheets.zip`, `docs/`, teacher guides, README | CC BY 4.0 or CC BY-NC-SA 4.0 (author to choose) | HOLD for the three DOCX until it is confirmed they use no third-party template |
| Scientific reference documents | `drosie-genetics-lab/docs/`, `docs/SCIENTIFIC_*.md` | same as above | Facts are not copyrightable; wording is |

## 3. Files containing character artwork in JavaScript, and a proposed separation

| File | What it contains | Evidence |
|---|---|---|
| `lab/js/art/chars.js` | `A.maya()` and `A.drosie()` return full SVG drawings of Dr. Maya and Drosie in several emotional states (`neutral talk happy think celebrate idle fly`), plus a small flying Drosie. Self-described as "TEMP ART" placeholders | file header |
| `drosie-genetics-lab/js/lab-scene.js` | `drMayaSVG`, `mayaBody`, `drosieSVG`, `drosieBody` (character drawings) and `labSceneSVG` (the room) | function names |
| `conference-assets/vx-core.js`, `vx-art.js`, `ch8.js` | Drosie companion using a raster image; generic scene shapes; five fictional scientists (`DC.avatar`) | review; not character code |
| `lab/js/art/rooms.js`, `lab.js`, `scope.js`, `safety.js`, `icons.js`, `fly.js` | environment, equipment and icon drawings (not named characters) | review |
| `drosie-genetics-lab/js/phenotype-renderer.js` (`flySVG`) | anatomical fly diagram for genotype display | review |

**Proposal (not yet implemented):**
1. Keep **logic** and **art** in separate modules behind a small interface that already exists: `DW.chars.el(id, state)` / `DW.chars.set(el, state)` in the Secret Fly Lab, and `drMayaSVG(size, mood)` / `drosieSVG(size)` in the Genetics Lab.
2. Move only the drawing functions into `brand/characters-*.js` (rights-reserved; listed in `ASSET_LICENSES.md`), leaving the rest of `lab-scene.js` and `art/` MIT.
3. Add `characters-neutral.js` (MIT): simple geometric avatars implementing the same interface, loaded when `brand/` is absent. `lab/js/manifest.js` already supports swapping in image files with `provided:true`.
4. The placeholder edition would then ship the neutral module and contain no character art at all.
5. Cost and risk: small (two interfaces, about 400 lines moved). It changes live-site file layout, so it should be done in a separate reviewed change after the author decides option 1, 2 or 3 in `docs/LICENSING_PROPOSAL.md`.

## 4. Artwork components (never MIT; see `ASSET_LICENSES.md`)

`book-pages-web/`, `book-pages/` (masters, not archived), `images/`, `life-cycle-assets/*.webp`, `climbing-game-assets/`, `science-activities/img/`, `fruit-fly-life-cycle-activities/img/`, root masters, `drosie-mascot.svg`, `favicon.svg`, `Certificate.pdf`, portraits (never archived).
