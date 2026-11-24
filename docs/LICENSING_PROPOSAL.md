# Proposed Mixed-Licensing Strategy (PROPOSAL ONLY: NOT APPLIED)

> ## UPDATE 2026-11-24: author's preferred strategy and new facts
> - **Preferred by the author:** MIT for eligible reusable software code; original illustrations, mascot, character designs, storybook artwork and branding keep their existing rights and contractual terms; the illustrator's attribution is preserved; MIT is **not** applied automatically to any artwork; distribution permission is kept distinct from sublicensing permission.
> - **Implemented as drafts only (nothing finalised):** `licenses/MIT.PROPOSED.txt` (marked "not in effect"), `ASSET_LICENSES.md`, `THIRD_PARTY_NOTICES.md`, `docs/COMPONENT_LICENSE_INVENTORY.md` (including the files that draw characters in code and a proposed code/art separation).
> - **Layer D (artwork):** the illustrator-rights statement is creator-provided and its scope is unverified (see `ASSET_LICENSES.md` section 0). The book's Zenodo record is CC BY-NC-ND 4.0 (verified live), so the earlier suggestion of CC BY-NC-ND 4.0 for storybook art is *consistent with the licence already published for the book PDF*, but it remains a choice for the author and illustrator, and it must not be applied to non-book artwork without their decision.
> - **Zenodo mechanics (unchanged):** one licence field per record. If the full edition is uploaded, setting the record to MIT without qualification could be misread as covering the artwork. Recommended wording: record licence = the code licence (after approval) **plus** the description paragraph and `ASSET_LICENSES.md` stating that artwork is excluded from it. Alternative with the least ambiguity: upload the **placeholder edition** under MIT as the software record and archive the artwork separately under its own terms. Whether the Zenodo form accepts the intended combination should be tested in the Zenodo sandbox before the real deposit.
> - **Finalising:** the build script does not create a `LICENSE` file. After the author approves, `licenses/MIT.PROPOSED.txt` would be copied to `LICENSE` (without the "proposed" banner), the licence field added to `.zenodo.json`/`CITATION.cff`, and the archives rebuilt.


Status: **proposal for the author's decision.** Nothing in this document has been applied to any file. No `LICENSE` file was created or changed, no licence field was set in `CITATION.cff` or `.zenodo.json`, and **no licence is assigned to any artwork**. This is not legal advice; have an advisor (and the illustrator) review it. See `docs/LICENSING_AUDIT.md` for the facts it rests on.

## Goals
1. Let teachers, researchers and developers reuse, adapt and redistribute the **software** with minimal friction.
2. Keep control of **Drosie** (the mascot), the **Drosie's World** name and logo, and the **storybook illustrations** so they are not repackaged, commercialised or confused with endorsed products.
3. Keep the **text educational content** easy for teachers to use.
4. Be honest to Zenodo and users: each part is clearly labelled, and a single Zenodo record does not misrepresent artwork as open.

## Proposed layers

| Layer | What it covers | Proposed licence | Why | Status |
|---|---|---|---|---|
| **A. Software** | HTML/JS/CSS logic, genetics engine, tests, build and SEO tools, `package.json` | **MIT** (simple, widely understood). Alternative: **Apache-2.0** (adds an express patent grant and a NOTICE mechanism). | Permissive, OSI-approved, compatible with Zenodo's licence list (`MIT`, `Apache-2.0`). | PROPOSED |
| **B. Documentation and written educational content** | `docs/`, teacher guides, lesson plans, worksheets, activity-sheet text, science explanations | **CC BY 4.0** if maximum reuse is wanted; **CC BY-NC-SA 4.0** if commercial reuse should be restricted. (NC licences are not "open" under common OER definitions and can confuse schools; choose consciously.) | Teachers can adapt with attribution. | PROPOSED; undecided between the two |
| **C. Brand identity** | name "Drosie's World", "Drosie", "Dr. Maya", logo and favicon, domain | **Not licensed by copyright licence.** Publish a short brand and trademark policy: factual references and attribution allowed; implying endorsement, using the mascot as one's own brand, or selling products with the name/mascot requires written permission. Consider trademark registration advice. | Names and marks are protected by trademark, not copyright; an open code licence does not grant them. | PROPOSED |
| **D. Mascot and storybook illustrations** | `drosie*.png`, `drosie-mascot.svg`, `book-pages*/`, book cover, life-cycle and stage art, other raster illustrations | **All rights reserved** by default, with an optional explicit permission notice for narrow uses (for example "free to view and to use unmodified in non-commercial classroom and home settings with attribution"). If the illustrator agrees, a **CC BY-NC-ND 4.0** grant is a possible standardised alternative. **Do not assign any licence until ownership and the illustrator's terms are confirmed.** | Protects the creators' livelihood and the brand while allowing classroom use. | **Undecided; blocked on rights questions** |
| **E. Portraits and personal images** | author and illustrator photographs | Not licensed. Do not distribute in software archives. | Personal data and likeness. | Excluded from the release ZIP |
| **F. Third-party material** | Leaflet, page-flip, Google Fonts, OSM data, FlyBase-derived facts | Keep their own licences; add a `THIRD_PARTY_NOTICES.md` if any is ever vendored | Compliance | Currently CDN-loaded only |

## The hard part: code that draws the characters

Some JavaScript files exist mostly to draw Drosie and Dr. Maya (for example `lab/js/art/chars.js`, scene drawing in `drosie-genetics-lab/js/lab-scene.js`, `conference-assets/vx-art.js`). They are code **and** artwork. Options for the author:

1. **Dual-label by file** (recommended): list them in a `REUSE.toml` / `ARTWORK-NOTICE.md` as **Layer D** while the rest of the repository is Layer A. Forks keep working by replacing those modules with their own characters (`lab/js/manifest.js` is already designed for swapping character art).
2. **Release them under Layer A** and accept that anyone may reuse the drawn characters. Not consistent with goal 2.
3. **Replace the drawn characters** in the public software release with neutral placeholders.

## How the layers would be marked (when approved)

- **Root `LICENSE`** (MIT text) with a one-paragraph scope statement: "Applies to source code only. See `NOTICE-ARTWORK-AND-BRAND.md` and `docs/LICENSING_PROPOSAL.md`."
- **`LICENSE-docs`** (CC text) or a per-folder note for Layer B.
- **`NOTICE-ARTWORK-AND-BRAND.md`**: all-rights-reserved statement for Layer D and the brand policy for Layer C, with contact details.
- **SPDX headers** (`// SPDX-License-Identifier: MIT`) in code files; the **REUSE** specification (`REUSE.toml`) can express per-path licences and checks them with the `reuse lint` tool.
- **`CITATION.cff`**: `license: MIT` (CFF accepts one SPDX expression; mixed repositories usually cite the software licence) and an explanatory `message`.
- **Package manifests**: add `"license": "MIT"` to `drosie-genetics-lab/package.json` if Layer A is MIT.

## Zenodo mechanics

- A Zenodo record has **one** licence field. Set the **software record** to the Layer A licence **and** keep Layer C/D material out of it (the build script already excludes it). The record description states the exclusion. If the full website including artwork were uploaded under MIT, the artwork would be presented as MIT-licensed; that must not happen.
- Do **not** accept Zenodo's default licence (it may default to CC BY 4.0). The draft `.zenodo.json` deliberately omits `license` so the omission cannot be missed.
- If artwork should be archived, make a **separate** record (restricted or open under its own terms) after the rights questions are settled.
- The existing book record (DOI 10.5281/zenodo.23550876) already has a licence the author must check: if it is open (for example CC BY), the illustrations in that record are already reusable on those terms and "all rights reserved" cannot be claimed for those exact files.

## Decisions the author must make (checklist)

- [ ] Software: MIT or Apache-2.0?
- [ ] Text content: CC BY 4.0 or CC BY-NC-SA 4.0?
- [ ] Characters drawn in code: option 1, 2 or 3 above?
- [ ] Illustrator agreement: written confirmation of ownership/licence, and consent for each use listed in Layer D.
- [ ] Brand policy wording and whether to seek trademark advice.
- [ ] Confirm no AI-generated or Canva-library artwork sits in Layer D (changes feasibility).
- [ ] What licence does the book record carry today?

## Draft wording (for review; do not use until approved)

> **Artwork and brand notice (DRAFT).** The Drosie character, the Drosie's World name and logo, and the storybook illustrations are © [YEAR] [RIGHTS HOLDER(S)]. All rights reserved. The open-source licence for this repository's source code does not apply to them. You may [view them on the official website / use them unmodified for non-commercial classroom and home education with attribution]. Any other use requires written permission: [CONTACT].
