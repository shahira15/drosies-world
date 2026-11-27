# Licensing Audit

> ## UPDATE 2026-11-24 (second pass): creator-provided rights confirmation and book-record verification
>
> **New information, with sources:**
> 1. **Creator-provided confirmation (not verified by this repository):** the author states they have **obtained artwork rights from Letícia Cavalcanti**, illustrator of *Drosie, the Fruit Fly*. No contract, assignment or licence document exists in the repository, so the **exact contractual scope is unverified and must be checked by a human** (checklist in `ASSET_LICENSES.md` section 0).
> 2. **Verified live (Zenodo API, 2026-11-24):** the companion book record (DOI 10.5281/zenodo.23550876) is **open access under CC BY-NC-ND 4.0**, creator Arzoo, Shahira, contributor Cavalcanti, Letícia (type "Other"). This answers the earlier open question about the book's licence. It is the **only licence on record for the storybook illustrations**.
> 3. **Author's licensing preference:** MIT for eligible reusable code; retain rights and contractual terms for the illustrations, mascot, character designs, storybook artwork and branding; preserve the illustrator's attribution; do not automatically apply MIT to artwork; distinguish permission to **distribute** artwork from permission to **sublicense** it; keep the original illustrations in the Zenodo release **where the rights permit permanent digital archival and redistribution**; do not include personal photographs without consent.
>
> **Effect on this audit:**
> - Rows below that said "UNKNOWN whether the rasters were drawn by the credited illustrator" are now: *author states rights obtained from the illustrator; scope unverified; origin of any piece not drawn by the illustrator (for example the code-drawn characters, the Canva certificate layout) still undetermined*.
> - Former blocking item "who owns the mascot and storybook art" is **downgraded from "unknown" to "author-asserted, scope to verify"**. It is not closed.
> - Former item "licence of the existing book record" is **resolved**: CC BY-NC-ND 4.0. Consequence: the book PDF's illustrations are already publicly licensed on those terms; **a MIT (or any open sublicence) must not be applied to the illustrations**, and an "all rights reserved" statement can only apply to files and uses outside that grant.
> - The **full archival edition includes** the original illustrations (web-sized copies), conditional on the scope check; the **placeholder edition** is the fallback if any answer is "no". Portraits remain excluded in both.
> - Distribution is not sublicensing: Zenodo requires the depositor to be able to grant Zenodo a licence to host and distribute; whether the illustrator agreement allows that, and allows adaptations (WebP conversion, page-flip display, certificate PDF), is part of the scope check.
>
> Still open (unchanged): AI-generated or Canva-library imagery; trademark status; FlyBase data-licence wording; NGSS/TEKS terms; YouTube video authorisation (the archival edition no longer embeds it); the three DOCX lesson plans' template provenance; consent for the author's and illustrator's names and photos (photos excluded).


Audit date: 2026-11-24. This is a **technical inventory prepared for the author, not legal advice.** Facts come from the repository; "Provenance" entries marked **UNKNOWN** could not be determined and need the author's records (contracts, receipts, export history).

## 1. Existing licences in the repository

**None.** There is no `LICENSE`, `COPYING`, `NOTICE` or SPDX header in any file, and no `license` field in `drosie-genetics-lab/package.json`. The only licensing statement is in `drosie-genetics-lab/README.md`: "Original code and artwork for Drosie's World. No photographs or third-party images are used." That statement is inconsistent with the presence of photographs of two people elsewhere in the repository (author and illustrator portraits) and cannot be relied on for the whole repository. **Nothing has been overwritten or added to licensing files in this branch.**

Without a licence, default copyright applies: others may view the public site but may not lawfully copy, modify or redistribute the code or content.

## 2. Asset-class inventory

| Class | Files (counts as tracked) | Apparent authorship | Provenance / risk | Included in release ZIP? |
|---|---|---|---|---|
| **Original source code** | HTML/JS/CSS across `lab/`, `drosie-genetics-lab/`, `conference-assets/`, `fly-lab-assets/`, `life-cycle-assets/*.js,css`, `notebook-academy-assets/`, `letters/`, `tests/`, `seo/tools/`, `script.js`, `styles.css`, page HTML | Author, with AI assistance (ChatGPT per the author; Claude per git history). | Copyright status of AI-generated portions is jurisdiction-dependent and uncertain; human selection, arrangement, direction and editing support authorship of the whole but not necessarily each AI-written line. **Author to confirm no third-party code was pasted.** No vendored libraries found. | Yes |
| **Code-drawn artwork (inline SVG in JS)** | `lab/js/art/*.js` (including `chars.js`: Drosie and Dr. Maya, marked TEMP ART), `drosie-genetics-lab/js/lab-scene.js`, `phenotype-renderer.js`, `conference-assets/vx-art.js`, `lab/js/art/fly.js` etc. | Author/AI | Software and artwork at once. Characters embody the brand. **Mixed-rights files; need a decision** on whether character-drawing code is under the software or the brand terms. | Yes (flagged) |
| **Mascot "Drosie" raster and vector artwork** | `drosie adult/egg/larva/larva1/pupa.png`, `drosie.png.png`, `drosie-mascot.svg`, `favicon.svg`, `images/drosie-*.webp`, `life-cycle-assets/*.webp`, `fruit-fly-life-cycle-activities/img/*`, `science-activities/img/*`, `climbing-game-assets/*.webp` | Unknown: root README calls `drosie-mascot.svg` "an original temporary cartoon illustration"; the storybook illustrator is credited on `team.html`. **UNKNOWN whether the rasters were drawn by the credited illustrator, by the author, or generated with an AI image tool.** | **High.** Chain of title, any contract with the illustrator (assignment vs licence vs work for hire), and any AI-generation terms must be established. | **No (excluded)** |
| **Storybook illustrations and text** | `book-pages/` (56 PNG), `book-pages-web/` (56 WebP), `drosie-book-cover.png`, `images/drosie-book-cover-640.webp`, `storybook.html` | Illustrator credited as Letícia Cavalcanti; text by the author (book deposited at Zenodo DOI 10.5281/zenodo.23550876). Root README says the book was made in Canva. | **High.** The Zenodo book record has its own licence, which this audit could not read (no network route to Zenodo from the container). Canva content licence terms for any stock elements used are **UNKNOWN**. Illustrator's rights to be confirmed in writing. | **No (excluded)** |
| **Other illustrations** | `fruit bowl.png`, `my-microscope.png`, `images/fruit-bowl-640.webp`, `images/my-microscope-640.webp` | UNKNOWN (same set as mascot art by style) | High, same as mascot | **No** |
| **Portrait photographs** | `shahira-photo.png`, `images/shahira-photo-900.webp`, `illustrator.jpeg` | Photographers UNKNOWN | Personal likeness. Illustrator's consent to permanent archival not documented. Photo copyright holder unknown. | **No** |
| **Open-graph image** | `images/og-image.jpg` (derived from book cover) | derived from cover art | as book cover | **No** (within `images/`) |
| **Certificate** | `Certificate.pdf` | Created in Canva (PDF producer) | Canva Content/licence terms for included templates or elements **UNKNOWN**. Possibly contains Canva-library graphics. | **No** |
| **Educator documents** | 3 `.docx` lesson plans; 7 activity-sheet PDFs; `all-activity-sheets.zip` | Author text (DOCX generated by python-docx; PDFs by ReportLab) | Text content, no graphics checked in detail. Drafts per root README. Need a content licence decision. The DOCX titled "Template_Aligned" may incorporate a school-district template. **UNKNOWN.** | Yes (content licence undecided) |
| **Documentation text** | all `.md` and teacher guides | Author/AI | Needs a documentation licence decision | Yes |
| **Fonts** | Not bundled. Google Fonts referenced by URL: DM Sans, Nunito, Caveat, Cormorant Garamond, Lora | Google Fonts families (SIL OFL 1.1 as distributed) | Low. No font files in the repository. System font stacks (Georgia, Verdana, Segoe Print, etc.) are referenced by name only. | n/a |
| **Sound** | none stored; Web Audio synthesised; browser speech synthesis | Code | Low. Optional narration MP3 not present. | n/a |
| **Third-party runtime libraries** | Leaflet 1.9.4 (BSD-2-Clause); page-flip 2.0.7 (MIT) via CDN; not vendored | upstream | Low. Attribution obligations are met on CDN-loaded copies only to the extent the libraries' own banners are served. If ever vendored, include their licence texts. | n/a (not in repo) |
| **Map data** | OpenStreetMap tiles; attribution displayed | OSMF contributors, ODbL | Attribution present. Tile-server usage policy limits heavy use. | n/a |
| **Embedded video** | YouTube embed, credited to IMP and Science/AAAS, uploaded by an individual | third party | Embedding is not redistribution, but whether the upload is authorised by the rights holders is **UNKNOWN**. Page links the original paper. | n/a |
| **Scientific facts, allele data** | FlyBase-derived facts in `trait-database.js` | FlyBase (CC BY 4.0 per FlyBase's stated data licence; **verify the current terms and required attribution**) | Facts are not copyrightable but database terms and attribution norms apply. Footer cites FlyBase. | Yes |
| **Reference lists** | citations | n/a | Citing is fine. | Yes |
| **Names and marks** | "Drosie", "Drosie's World", "Dr. Maya", the logo, domain drosiesworld.com | Author | Trademark status **UNKNOWN** (no registration found in repository). Copyright does not protect names. | Names appear in code |
| **Standards text** | NGSS and TEKS performance-expectation descriptions in `drosie-genetics-lab/docs/TEACHER_GUIDE.md` | NGSS (Achieve/NRC; terms of use apply), TEKS (public Texas text) | Brief identifiers and paraphrase are typical, but quoting needs the issuers' terms checked. **Check.** | Yes |
| **Safety references** | names of ACS, NSTA, OSHA, CDC/NIOSH, ANSI/ISEA documents | n/a | Cited only. | Yes |
| **Quotations of "Red Book" etc.** | paraphrased citations | n/a | Low | Yes |

## 3. AI-related licensing considerations
- Code and text produced with ChatGPT and Claude: both vendors' terms assign output rights to the user as between user and vendor, subject to law. Copyright subsistence in purely machine-generated material is uncertain in many jurisdictions (for example the US Copyright Office requires human authorship). The author's human contribution should be documented (see `docs/AI_DISCLOSURE.md`).
- If any raster mascot or storybook art was AI-generated, that must be disclosed and affects both copyright claims and the feasibility of "all rights reserved" branding. **Author to confirm.**

## 4. Summary of blocking questions
1. Who owns the copyright in the mascot and storybook art, and under what agreement? Does the illustrator allow (a) open release of the software that displays it, (b) separate deposit of the images, (c) the proposed brand restrictions?
2. Was any artwork AI-generated or sourced from Canva libraries?
3. What licence does the existing book record (DOI 10.5281/zenodo.23550876) carry? A permissive licence there, if already granted, cannot be retracted for that version and would conflict with "all rights reserved" statements about the same illustrations.
4. Consent for the illustrator's and author's portraits.
5. Whether the lesson-plan DOCX files incorporate third-party templates.
