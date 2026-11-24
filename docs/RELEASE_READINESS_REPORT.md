# Release-Readiness Report: Drosie's World v1.0.0 (provisional), second pass

Updated 2026-11-24 on branch `claude/ecstatic-planck-jl44t9` (draft PR #16). Prepared by an AI assistant (Claude Code) at the author's direction. Not legal advice. **Nothing has been merged, deployed, released, uploaded to Zenodo, or licensed.**

## 1. Bottom line

The technical and documentary preparation is largely done: a reproducible offline archival edition exists in two variants, the live-site privacy exposure is removed from it, the science has a verification matrix, and the tests found and fixed real defects. **It is still not ready to deposit.** Remaining items need the author's decisions, the illustrator, legal/institutional review and an independent scientific reviewer (sections 3 to 7). Test results, including failures that remain, are in `docs/TESTING.md`.

## 1A. Author statements recorded after the second pass (2026-11-24)

These are the author's statements. The assistant has **not** seen the agreements and cannot verify them; this is not legal advice. Private contractual documents must stay out of the public repository (do not commit them, quote them, or paste their terms into `ASSET_LICENSES.md`).

| # | Author statement | Effect on this report |
|---|---|---|
| A-1 | Signed illustrator agreements exist, and the author **owns the copyright** in the commissioned Drosie's World illustrations covered by them. | Resolves the "who owns the art" question (formerly L-2 in the first-pass report) and most of I-1 to I-4. What remains is *which works the agreements cover* (I-5) and a check for retained rights or restrictions (I-8). |
| A-2 | **MIT for original software code only.** | Decision for D-1 (code). Not yet applied: no `LICENSE` file exists and `license` stays out of `.zenodo.json` and `CITATION.cff` until the structure below is complete. |
| A-3 | **All rights reserved** for Drosie characters, mascot, character designs, storybook illustrations and storybook text. | Fixes the scope of the reserved works. See blocker B-2 (existing book record is CC BY-NC-ND 4.0). |
| A-4 | MIT is **not** extended to artwork, character designs or creative content embedded in source code. | This is D-3 **option 1** (separate and reserve). Decision made; implementation open (B-3). |
| A-5 | Preserve credit to Letícia Cavalcanti. | Resolves I-6 credit wording. Her name stays in `team.html`, `cite/`, `CITATION.cff` and the book record's contributor field. |
| A-6 | Preserve applicable third-party licences. | Obligation confirmed; verification of each term remains (B-5). |
| A-7 | Omit the illustrator's **portrait and social handle** from archival editions unless separately authorised. | Resolves I-7 as a decision. Build must be checked for the handle (B-4). |
| A-8 | **Educational content licensing is pending** the author's final decision. | Stays open (B-1). |

## 1B. Remaining genuine licensing blockers

Only items that are still open after A-1 to A-8. Resolved questions are not repeated.

| ID | Blocker | Needed to close |
|---|---|---|
| B-1 | **Educational content licence is undecided** (lesson sheets, worksheets, guides, teacher text, DOCX plans). The archive ZIP currently contains educator documents. | Author decides the content licence, **or** the archive excludes educator content until then. |
| B-2 | **Existing book record is CC BY-NC-ND 4.0** (second-pass finding R2, fetched live). "All rights reserved" for the storybook text and illustrations cannot silently override a public licence already granted on that record. | Author states the intended relationship in `ASSET_LICENSES.md` (for example: the deposited book copy is CC BY-NC-ND 4.0; all other uses of the text and art are reserved), or changes the book record. Public pages (cite hub, README) must use the same wording. |
| B-3 | **Reserved works embedded in code are not yet separated.** Character-drawing code (`lab/js/art/chars.js`, `drMayaSVG`/`drosieSVG` in `drosie-genetics-lab/js/lab-scene.js`, `vx-art.js` and similar) and creative text in data/narration files (for example letters and conference story text) fall under A-4. The boundary of "creative content embedded in code" has not been enumerated. | Author confirms the file list; then add file-level reservation notices and a `LICENSE` carve-out, and keep reserved files out of any MIT-labelled path or out of the archive. |
| B-4 | Archival editions must omit the illustrator's portrait and **social handle**. The portrait is already excluded; the handle appears in `team.html` text. | Verify (or add) redaction of the handle in the archival build. |
| B-5 | Third-party terms are inventoried (`THIRD_PARTY_NOTICES.md`) but not verified: FlyBase attribution wording, NGSS text, Canva terms for `Certificate.pdf`, vendored page-flip licence text. | Author or legal reviewer checks each; include the licence texts in the archive. |
| B-6 | **Edition choice (D-2).** With A-3 and A-4, the **placeholder edition** is the only variant fully consistent with "MIT for code only". The full edition would put reserved artwork in an open-access record. | Author chooses; rehearse a Zenodo sandbox record first. |
| B-7 | **Institutional (L-1) and AI-assisted code (L-2):** the university IP/outside-activity check and MIT suitability for AI-assisted code are unchanged, and they bear on who may place the MIT notice and under which name. | Legal/institutional review. |

Other blockers (S-1 privacy/backend, S-3 children's privacy, SC-1 independent science review) are unchanged.

## 1C. Overlap with PR #17 (citation hub)

PR #16 now contains its own `cite/index.html`, `tools/build_cite.py` and `CITATION.cff`. PR #17 (`feature/scholarly-citation-hub`) provides a second citation hub with a single metadata source. A merge rehearsal shows **25 overlapping files**, with content conflicts in `CITATION.cff`, `cite/index.html` and about 15 pages. Two competing hubs must not both land. Keep one as canonical and drop the other's `cite/` files, generator and tests before merging either PR.

## 2. Resolved in this pass

| # | Issue | Resolution | Evidence |
|---|---|---|---|
| R1 | Miller 2018 reference unresolved | PMC5873907 = PMID 29420191, *G3* 2018;8(4):1161-1171, doi:10.1534/g3.118.200021. The repository had the wrong title and journal; corrected. No substitute invented; whether it supports the CyO marker list remains open (S-3). | `docs/SCIENTIFIC_VERIFICATION_MATRIX.md` |
| R2 | Book record unverified | Fetched live from the Zenodo API: Book, v1.0, 2026-10-22, **CC BY-NC-ND 4.0**, open access, creator Arzoo, Shahira, contributor Cavalcanti, Letícia. Relation to the software recommended: `references`, not `isSupplementTo`. | `docs/BOOK_RELATIONSHIP.md` |
| R3 | "Scientifically validated" and "verified against FlyBase" wording | Replaced with literature-informed design, technical testing, "compiled from FlyBase records and checked by the developer (not independently reviewed)". | Genetics Lab README, UI, footer, `fruit-fly-biology` byline |
| R4 | Live Supabase/Turnstile/analytics/fonts/CDN/map/video in the archived software | Removed by asserted build transformations; page-flip vendored; links made relative. Automated test: zero external requests, works from `file://` | `docs/ARCHIVAL_EDITION.md`, `tests/site` |
| R5 | Missing images / nonfunctional pages in the archive | Full edition keeps the illustrations used by pages; placeholder edition generates same-size placeholders; tests assert no broken images on every page | `docs/TESTING.md` |
| R6 | Licensing documents missing | Proposed MIT text (not in effect), `ASSET_LICENSES.md`, `THIRD_PARTY_NOTICES.md`, component inventory, character-in-code files identified with a separation proposal; licensing audit updated for the creator-provided illustrator-rights statement (scope flagged) | repository root and `docs/` |
| R7 | AI disclosure | Rewritten with the author's descriptions of ChatGPT and Claude Code contributions; does not claim all work was manual | `docs/AI_DISCLOSURE.md` |
| R8 | Citation hub | `/cite/` with APA, MLA, Chicago, BibTeX, RIS, copy buttons, downloads, book DOI, software DOI placeholder (no invented identifier), creators, AI disclosure; "Cite this resource" links on resource pages; sitemap updated | `cite/`, `tools/build_cite.py` |
| R9 | Untested simulations | New site-wide test suite; defects found and fixed: search/filters did not hide cards (CSS overrode `hidden`), invisible text block on Letters page, zoom disabled in the Secret Fly Lab, horizontal overflow on a worksheet page, contrast failures (logo, eyebrow, headings, team role, notebook academy), unnamed inventory group, a load-time race in the Conference, a dead `#ch1` link | commits and `docs/TESTING.md` |
| R10 | Live-site privacy/security audit; privacy notice | Audit with Supabase RLS requirements and owner test plan; proposed privacy notice (draft) | `docs/LIVE_SITE_PRIVACY_SECURITY_AUDIT.md`, `docs/PROPOSED_PRIVACY_NOTICE.md` |
| R11 | Reproducible build | Both ZIPs rebuilt; in-place `--check` and a fresh-clone build give identical SHA-256 (see `release/BUILD_VERIFICATION.md`) | `tools/build_archive.py` |
| R12 | Secret/PII scan of new work | No credentials added; ORCID left blank; portraits excluded | `docs/REPOSITORY_AUDIT.md` |

## 3. Requires the author's decision

| ID | Decision |
|---|---|
| D-1 | **Code: MIT decided (A-2). Educational content licence still pending (B-1).** Approve **MIT** (or Apache-2.0) for eligible code, and a content licence (CC BY 4.0 or CC BY-NC-SA 4.0) for text. Then create `LICENSE`, set `license` in `.zenodo.json` and `CITATION.cff`, rebuild. The build does not do this automatically. |
| D-2 | **Which edition to deposit:** *full* (illustrations; only after the illustrator-agreement check) or *placeholders*. Rehearse in the Zenodo sandbox to see how a mixed-rights record's licence label displays. |
| D-3 | **Option 1 decided (A-4); implementation open (B-3).** **Characters drawn in JavaScript** (`lab/js/art/chars.js`, `drMayaSVG`/`drosieSVG` in `drosie-genetics-lab/js/lab-scene.js`): option 1 (separate and reserve), 2 (release under MIT) or 3 (replace with neutral art); then implement the proposed separation. |
| D-4 | Related identifier to the book (`references` recommended) and whether to add a reciprocal link on the book record; whether to list the illustrator as a contributor on the software record; the **ORCID** to use (blank until supplied; the book record shows one). |
| D-5 | **Narrowed:** the commissioned illustrations are covered by A-1; confirm that no *other* reserved work (mascot rasters, Canva layout, certificate art) is AI-generated or Canva-library sourced. Confirm AI-disclosure statements: which tool produced which components, the human-review statement, and that no illustration was AI-generated or Canva-library sourced. |
| D-6 | Live-site changes: keep or remove third-party services; adopt the privacy notice; self-host fonts; accept the pinch-zoom change in the Secret Fly Lab (needed for accessibility, but it alters touch behaviour). |
| D-7 | Wording of unsupported numbers (development times, stage durations): soften or cite (see S-1). |
| D-8 | Contrast findings still open (see `docs/TESTING.md`): approve darker muted-text colours across the site. |
| D-9 | Housekeeping: delete stray files in the repository, add `.gitignore`, move the 90 MB of raster masters out of the code repository, remove hard-coded scratch paths from five Conference tests. |
| D-10 | Set the real release date; record the release commit hash in the Zenodo notes. |

## 4. Illustrator-related items (Letícia Cavalcanti)

**Status after A-1, A-5 and A-7:** I-1 to I-4, I-6 and I-7 are answered by the author's statements (copyright owned under signed agreements; credit preserved; portrait and handle omitted from archives). Still open: **I-5** (which works the agreements cover) and **I-8** (any retained rights or restrictions). Her written confirmation is needed only if an agreement does not already cover an item. The list below is the original second-pass list, kept for traceability.

The author states rights were obtained. The following need her written confirmation or the agreement text (`ASSET_LICENSES.md` section 0):
- I-1 Scope of the agreement: assignment or licence; exclusive or not; term; territory.
- I-2 Express permission for **permanent public archival on Zenodo** and download by anyone, and for Zenodo to host (a licence the depositor must be able to grant).
- I-3 **Sublicensing** separately from distribution (the book is already CC BY-NC-ND 4.0).
- I-4 Adaptations: web-optimised WebP copies, display in an interactive reader, the certificate PDF, Open Graph image, life-cycle stage images, character poses used in games, and the code-drawn characters derived from her designs.
- I-5 Which works are covered (book pages, cover, mascot, fruit bowl, microscope, stage art, certificate art).
- I-6 Credit wording, moral rights, and being listed as a contributor on the software record.
- I-7 Use of her name, Instagram handle and photograph (photograph is excluded from every archive).
- I-8 Any restrictions on AI-training use, merchandise, or commercial use.

## 5. Requires institutional or legal review

| ID | Item |
|---|---|
| L-1 | **Institutional IP and affiliation:** the author is a doctoral researcher at Texas Tech University and the metadata names the university. Check university IP and outside-activity policies and whether the affiliation may be used. |
| L-2 | Copyright in AI-assisted code and text; suitability of MIT for it. |
| L-3 | **Children's privacy and data protection** for the live site (COPPA/GDPR-K/FERPA context, IP addresses, feedback form, analytics, third-party requests), and the proposed privacy notice. No compliance is claimed. |
| L-4 | Supabase terms and a data-processing agreement; retention and deletion procedures. |
| L-5 | Trademark status of "Drosie's World", "Drosie", the logo; brand-use policy. |
| L-6 | Terms for third-party material: FlyBase data licence and attribution, NGSS/TEKS text, Canva terms for `Certificate.pdf` (it embeds Canva fonts), YouTube video authorisation (live site only), OSM tile policy (live site only). |
| L-7 | The Zenodo depositor terms for mixed-rights records. |
| L-8 | Accessibility obligations for schools (no conformance claimed here). |
| L-9 | If any future study with children is planned, ethics review. None has been done. |

## 6. Requires independent scientific review

Use `docs/INDEPENDENT_SCIENTIFIC_REVIEWER_CHECKLIST.md`.
- S-1 Unsupported numbers: 9-10 days at 25 C, about 19 days at 18 C, about 7 days at 29 C; stage durations; anatomy facts. Only the qualitative effect of temperature is supported by sources found (Yadav 2013, Schou 2017; abstracts).
- S-2 FlyBase allele/gene data (not re-queried: the network allowed only Zenodo, DOI and Crossref).
- S-3 Whether Miller 2018 supports the CyO marker list; balancer recombination treated as fully suppressed although rare crossovers are reported.
- S-4 Discrepancies: gene count (13,600 vs "roughly 14,000"); Kosambi 1943 vs 1944; Haldane 1919 original not located.
- S-5 Moonwalker stock details (BDSC 79596, 625 nm, retinal) and the FlyBase record identity for Vilinsky 2018.
- S-6 Missing sources: male achiasmate meiosis, X:A sex determination, notebook practice, lab-safety standards (safety professional), NGSS/TEKS codes (curriculum specialist).
- S-7 Full-text confirmation of all abstract-only (V-ABS) rows.

## 7. Technical items still open (not blocking if disclosed)

- Firefox and WebKit **not run**: binaries are not installed here and installing browsers was out of scope for this environment; the suite supports them (`BROWSER=firefox|webkit`; example CI file `tests/site/ci-workflow.example.yml`, not installed).
- Remaining axe contrast failures on muted grey text and a few page-specific colours (listed in `docs/TESTING.md`); no screen-reader or user testing; no WCAG claim.
- Absolute root paths on the live site (the archival edition rewrites them).
- Live-site third-party exposure (audit) is unchanged; only the archival edition is clean.

## 8. Claim discipline

No document claims learning effectiveness, WCAG conformance, standards alignment, expert review, legal compliance or cross-browser support. No student learning outcomes have been established. Existing live-site text was edited only to remove unsupported "validated/verified" phrasing and to fix defects listed above.

## 9. Counts

Items resolved: 12 (plus the author statements A-1 to A-8 in section 1A). Licensing blockers still open: 7 (section 1B). Awaiting the author: 10. Illustrator: 2 open (I-5, I-8). Legal/institutional: 9. Scientific: 7.
