# Asset Licences and Rights (DRAFT for the author's verification)

Status: **DRAFT. Nothing in this file has been finalised.** It records what the repository can show and what the author has stated. It is not legal advice.

## 0. Rights statements and their sources

| Statement | Source | Verified by this repository? |
|---|---|---|
| The author is the project creator and directs the scientific and educational development. | Author, 2026-11-24 | n/a |
| The author **has obtained artwork rights from Letícia Cavalcanti**, illustrator of *Drosie, the Fruit Fly*. | **Creator-provided confirmation, 2026-11-24.** | **No.** No contract, assignment or licence document is in the repository. |
| The companion book "Drosie, the Fruit Fly" (Zenodo DOI 10.5281/zenodo.23550876) is published **open access under CC BY-NC-ND 4.0**; creator Arzoo, Shahira; contributor Cavalcanti, Letícia (type "Other"). | Zenodo API record, fetched live 2026-11-24 | **Yes** (record read directly) |

### Contractual scope that a human must verify before any upload (checklist)

The author's confirmation says rights were obtained; it does not say **what kind** or **how far**. Before the artwork goes into a permanent public archive, someone should read the actual agreement and answer each point, then record the answers here:

1. **Assignment or licence?** Does the author own the copyright (assignment / work-for-hire) or hold a licence? If a licence: exclusive or non-exclusive; term; territory; revocable?
2. **Digital distribution and permanent archival.** Does it expressly allow online publication, **permanent public archival on Zenodo** (which keeps files indefinitely and mints a DOI), and download by anyone?
3. **Sublicensing.** May the author grant others rights (for example the CC BY-NC-ND 4.0 already used on the book record)? Zenodo's terms require the depositor to have the right to grant Zenodo a licence to host and distribute. **Permission to distribute is not permission to sublicense**; the two must be checked separately (see section 2).
4. **Adaptations.** Do the rights cover the web-optimised WebP copies, resizing, cropping and display in an interactive page-flip reader, the certificate PDF, the Open Graph image, the life-cycle stage images, and character states used in games? Does the agreement permit derivative or merchandise uses?
5. **Which works are covered.** Exactly which images: the 56 book pages and cover; the mascot and character images; `fruit bowl`, `my-microscope`, life-cycle stage art, certificate artwork; the character poses in the code-drawn art? Were any commissioned separately, produced by the author, produced with AI tools, or sourced from Canva libraries?
6. **Attribution and moral rights.** Required credit wording and placement; right of integrity.
7. **Name and likeness.** Permission to publish the illustrator's name, social handle and photograph (the photograph is excluded from the archive regardless).
8. **Restrictions.** Any restriction on AI training use, commercial use, or use in software or games.
9. **Representations.** Any warranty the author gave that the work is original and any obligations to indemnify.

Until those answers are recorded here, treat the artwork's licence terms as **undetermined**; **no open licence is assigned to any artwork.**

## 1. Asset categories

| Category | Files / examples | Owner (as stated) | Attribution | Permitted uses (proposed) | Restrictions | Included in archival edition |
|---|---|---|---|---|---|---|
| **Software code** | JS/CSS/HTML logic, engine, tests, tools (see `docs/COMPONENT_LICENSE_INVENTORY.md`) | Author (with AI assistance; see `docs/AI_DISCLOSURE.md`) | Copyright line | **MIT (proposed, not in effect)** | Excludes everything below | Both editions |
| **Storybook illustrations and cover** | `book-pages-web/*.webp` (56), `images/drosie-book-cover-640.webp`, `images/og-image.jpg` | Illustrator Letícia Cavalcanti creative work; author states rights obtained | **Required:** "Illustrations by Letícia Cavalcanti" (preserved on the Team page, in `CITATION.cff` notes, in the Zenodo contributors if she agrees) | Viewing and use inside this software; the book itself is **CC BY-NC-ND 4.0** on Zenodo (verified), which is the only licence on record for these images | **Not MIT.** No further sublicensing; no derivatives or commercial use beyond what the contract and the book's CC BY-NC-ND record allow | **Full edition: included. Placeholder edition: replaced by neutral placeholders** |
| **Mascot and character designs** (Drosie, Dr. Maya) as images | `images/drosie-*.webp`, `images/drosie-mascot-640.webp`, `images/fruit-bowl-640.webp`, `images/my-microscope-640.webp`, `life-cycle-assets/*.webp`, `climbing-game-assets/*`, `science-activities/img/*`, `fruit-fly-life-cycle-activities/img/*`, `drosie-mascot.svg`, `favicon.svg`, `Certificate.pdf` | As above (author asserts rights; scope unverified; origin of some pieces **undetermined**) | Same credit | Use inside this software; the brand and character remain reserved | **Not MIT.** No separate redistribution or reuse of the characters outside this software without permission | Full: included. Placeholders: replaced |
| **Character designs drawn in code** | `lab/js/art/chars.js`; `drMayaSVG`/`drosieSVG` in `drosie-genetics-lab/js/lab-scene.js` | Author (with AI assistance); designs derive from the Drosie / Dr. Maya characters, whose underlying rights are described above | Copyright line | **Excluded from the MIT grant (proposed).** Reserved as character artwork (see `docs/COMPONENT_LICENSE_INVENTORY.md` section 3 for the proposed separation) | As above | Present in both editions as rights-reserved character art |
| **Drosie's World name, logo and wordmark** | Text and the leaf/flower mark | Author | n/a | Factual references and citations welcome | **Not licensed.** No implied endorsement; no use as another product's name or brand without written permission. Trademark status unknown | Names appear in code and pages |
| **Photographs of people** | `shahira-photo.png`, `images/shahira-photo-900.webp`, `illustrator.jpeg` | Photographers unknown | n/a | None | **Not included** in any archive without documented consent of the person and the photographer | **Excluded**; replaced with a neutral silhouette |
| **Educational text and worksheets** | `Drosie_*.docx`, `lesson-*-activity-sheet.pdf`, `all-activity-sheets.zip`, HTML teaching text, `docs/` | Author with AI assistance | Author | **Content licence proposed: CC BY 4.0 or CC BY-NC-SA 4.0 (author to choose)** | Illustrations inside them are covered by the rows above | Both editions |
| **Generic decorative SVG** | `letters/assets/illustrations/sprig.svg`, `wax-seal.svg`, `drosie-genetics-lab/assets/favicon.svg` | Author (provenance to confirm) | n/a | MIT (proposed) once provenance is confirmed | Confirm none derive from third-party art | Both editions |
| **Scientific diagrams of the fly** (anatomy and genotype renderer SVG drawn in code, `phenotype-renderer.js`, `lab/js/art/fly.js`) | code | Author with AI assistance | Copyright line | MIT (proposed), subject to the author confirming these are generic anatomical diagrams, not the Drosie character | | Both |
| **Third-party libraries** | page-flip 2.0.7 (vendored in the archive) | Nodlik, MIT | Keep licence file | MIT (their own) | See `THIRD_PARTY_NOTICES.md` | Both |
| **Fonts** | none bundled | n/a | n/a | n/a | Archival edition uses system fonts only | n/a |
| **Sound** | none stored (Web Audio and browser speech) | Code | n/a | MIT (proposed) | | n/a |

## 2. Distribution is not sublicensing

- **Permission to distribute** lets the author (and Zenodo, as the hosting service) copy and serve the artwork unchanged. It does not let anyone else reuse it.
- **Permission to sublicense** is the power to grant others rights. An open licence (MIT, CC BY) on a Zenodo record is a sublicence. This strategy therefore **does not apply** MIT to the artwork, and does not claim that artwork is open.
- The one existing grant to the public for the illustrations is the **CC BY-NC-ND 4.0** on the book's Zenodo record (verified). That grant was made earlier, by the author, for that PDF. The author should confirm the illustrator agreement allowed it.

## 3. How the archival edition marks these layers

- Archive root: `ASSET_LICENSES.md` (this file), `THIRD_PARTY_NOTICES.md`, `licenses/MIT.PROPOSED.txt` (not in effect).
- The **placeholder edition** contains no protected artwork except the code-drawn characters in section 1 (reserved).
- The **full edition** contains the artwork under the author's stated rights, on the condition that the checklist in section 0 is completed first. If any answer is "no", use the placeholder edition (or rebuild without the offending files).
- Illustrator attribution is preserved on `team.html` and `cite/index.html`, and in `CITATION.cff`.
