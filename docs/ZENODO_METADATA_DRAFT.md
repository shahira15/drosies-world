# Zenodo Record Draft (v1.0.0)

Status: **DRAFT for human review. Nothing has been uploaded to Zenodo.** Machine-readable counterpart: `.zenodo.json` (this document is derived from it). Fields marked **[DECIDE]** need the author.

## Resource type and files
Software (upload type: Software), open access. **Choose one file** (see `docs/ARCHIVAL_EDITION.md`):
- `release/drosies-world-v1.0.0-archival-full.zip`: includes the original illustrations; use only after the illustrator-agreement scope check in `ASSET_LICENSES.md` section 0 is complete.
- `release/drosies-world-v1.0.0-archival-placeholders.zip`: no protected artwork (except code-drawn placeholder characters); the lowest-risk option.
Checksums: `release/SHA256SUMS`. Trial the deposit in the **Zenodo sandbox** first.

## Title
Drosie's World: An Interactive Educational Software Platform for Entomology and Scientific Inquiry

## Version / date
1.0.0 (provisional). Publication date 2026-11-24 is a placeholder; set the real deposit date.

## Creators
| Name | Affiliation | ORCID | Role |
|---|---|---|---|
| Arzoo, Shahira Helal | Texas Tech University | **intentionally blank until the author supplies a verified identifier** (the book record shows one; confirm it is the one to use) | Creator |

Not creators: ChatGPT and Claude Code (disclosed in the description, not credited as authors).
**Contributor (full edition only):** Cavalcanti, Letícia (type "Other"), who is also a contributor on the book record. Requires her agreement; remove for the placeholder edition. **[DECIDE]**

## Description (HTML; also in `.zenodo.json`)
Drosie's World is a free, browser-based collection of educational activities about the fruit fly Drosophila melanogaster and the practice of scientific inquiry. This record is the self-contained archival edition: a static website (HTML, CSS and vanilla JavaScript) with no build step, which works offline and makes no network requests to third parties. The live website's feedback form, analytics, visitor counter, outreach map, web-font requests, CDN scripts and embedded video are removed; the page-flip library is vendored.

Components: a fruit fly genetics simulator with a seeded, independently tested inheritance engine (Punnett squares, X-linkage, linkage and recombination, lethal alleles, chi-square); a laboratory-safety and stereomicroscope game; life-cycle activities and a virtual fly-culture lab; a simulated climbing assay; a lab-notebook practice module; a simulated scientific conference in which learners write an abstract and build a poster; a storybook reader; a citation hub; and printable teacher resources.

All experimental data in the software are simulated. The release documents technical functionality only. No formal student learning outcomes have been established, no classroom study has been conducted, and no independent expert review of the science has been completed. Design is research-informed (see the scientific verification matrix in the archive). Automated testing covers the genetics engine, the conference module and, in this release, page loading, links, keyboard navigation, mobile layouts, offline operation and component flows, on Chromium only; automated accessibility scans are not a WCAG conformance evaluation.

Rights. Software code is proposed for the MIT licence (see the archive's licence files). The Drosie's World name and logo, the Drosie mascot and character designs, and the storybook illustrations (by Letícia Cavalcanti) are not covered by that licence; see ASSET_LICENSES.md in the archive. Photographs of people are not included.

AI assistance. The platform was conceived and directed by its creator and developed with assistance from ChatGPT (OpenAI) and Claude Code (Anthropic); see docs/AI_DISCLOSURE.md. The companion storybook is a separate scholarly output deposited separately (DOI 10.5281/zenodo.23550876).

## Keywords
educational software; science education; Drosophila melanogaster; fruit fly; entomology; genetics simulation; scientific inquiry; simulation; open educational resources; elementary education; JavaScript

## Language
English (eng)

## Related identifiers
| Identifier | Scheme | Relation | Resource type |
|---|---|---|---|
| 10.5281/zenodo.23550876 | doi | references | publication-book |
| https://github.com/shahira15/drosies-world | url | isSupplementTo | software |
| https://drosiesworld.com | url | isAlternateIdentifier |  |

**Book relation:** the book record (verified live 2026-11-24: Book, v1.0, published 2026-10-22, **CC BY-NC-ND 4.0**, creator Arzoo, Shahira; contributor Cavalcanti, Letícia; it already lists `https://drosiesworld.com/` as *isSupplementedBy*) is treated as a distinct output related to the software. `references` is recommended rather than `isSupplementTo`; see `docs/BOOK_RELATIONSHIP.md` for the options and the optional reciprocal link. The relation vocabulary in the Zenodo form should be checked at upload time.

## Licence
**Not set. [DECIDE]** Proposed (not in effect): MIT for eligible software code only; artwork, characters, name, logo and photographs excluded (`ASSET_LICENSES.md`, `docs/LICENSING_PROPOSAL.md`). A Zenodo record has one licence field: if the full edition is uploaded, make the exclusion prominent in the description (it is) and consider the sandbox trial to see how the licence label is displayed. Do not accept a default licence.

## Communities, funding, grants
None identified. **[DECIDE]**

## Notes field (as in `.zenodo.json`)
DRAFT for human review; do not upload until approved. (1) 'license' is deliberately omitted: no licence is finalised (see docs/LICENSING_PROPOSAL.md; proposed: MIT for eligible code only, artwork excluded). Set it only after approval. (2) The 'contributors' entry credits the illustrator and applies only if the FULL edition (with illustrations) is uploaded and she agrees; remove it for the placeholder edition. (3) No creator ORCID is included; add a verified one when the author supplies it. (4) Version 1.0.0 is provisional. (5) The related-identifier relation to the book is a recommendation; see docs/BOOK_RELATIONSHIP.md.

## Pre-upload checklist
- [ ] Licence approved; `LICENSE` created; `.zenodo.json` and `CITATION.cff` updated (see `docs/RELEASE_BUILD.md`).
- [ ] Illustrator agreement scope checked (every item in `ASSET_LICENSES.md` section 0), or the placeholder edition chosen.
- [ ] Confirm no AI-generated or Canva-library imagery (or disclose it) and the illustrator's consent for her name.
- [ ] Privacy/legal review items in `docs/RELEASE_READINESS_REPORT.md`.
- [ ] Independent scientific review, or keep the "no independent review" wording.
- [ ] ORCID added or consciously omitted; real publication date; release commit hash recorded in the notes.
- [ ] Sandbox deposit rehearsed.
