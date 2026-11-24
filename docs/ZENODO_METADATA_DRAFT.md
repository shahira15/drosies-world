# Zenodo Record Draft (v1.0.0)

Status: **DRAFT for human review. Nothing has been uploaded to Zenodo.** Machine-readable counterpart: `.zenodo.json`. Fields marked **[DECIDE]** need the author.

## Resource type
Software (upload type: Software). Access: Open access to the software archive (the archive excludes rights-reserved artwork; see below).

## Title
Drosie's World: An Interactive Educational Software Platform for Entomology and Scientific Inquiry

## Version
1.0.0 (provisional)

## Publication date
2026-11-24 (planned; update to the actual deposit date).

## Creators
| Name | Affiliation | ORCID | Role |
|---|---|---|---|
| Arzoo, Shahira Helal | Texas Tech University | **[DECIDE: add if available]** | Creator |

Not listed as creators: ChatGPT and Claude (AI tools are disclosed in the description and in `docs/AI_DISCLOSURE.md`, not credited as authors). Illustrator Letícia Cavalcanti created the companion book's illustrations, which are **not part of this software archive**; whether to list her as a contributor to the software record is **[DECIDE]** (needs her agreement and a defined role).

## Description (paste as HTML or plain text)

Drosie's World is a free, browser-based collection of educational activities about the fruit fly *Drosophila melanogaster* and the practice of scientific inquiry. It is a static website (HTML, CSS and vanilla JavaScript) with no build step and no package dependencies.

Components: a fruit fly genetics simulator with a seeded, independently tested inheritance engine (Punnett squares, X-linkage, linkage and recombination, lethal alleles, chi-square); a laboratory-safety and stereomicroscope game; life-cycle activities and a virtual fly-culture lab; a simulated climbing assay; a lab-notebook practice module; a simulated scientific conference in which learners write an abstract and build a poster; a storybook reader; and printable teacher resources.

**All experimental data in the software are simulated. This release documents technical functionality only. No formal student learning outcomes have been established**, no classroom study has been conducted, and no independent expert review has been completed. Automated testing covers the genetics engine and the conference module (Chromium only); no screen-reader or multi-browser testing has been done.

AI assistance: parts of the software and documentation were developed with ChatGPT (OpenAI) and Claude (Anthropic); see `docs/AI_DISCLOSURE.md` in the archive.

Contents of the archive: source code, tests, documentation, and educator documents. **Excluded:** the Drosie mascot artwork, branding, storybook illustrations and portrait photographs, which are not licensed for reuse (the list is in `EXCLUDED_FILES.txt` in the archive). Pages that display those images show gaps in the archive copy. The companion storybook is deposited separately (DOI below).

## Keywords
educational software; science education; *Drosophila melanogaster*; fruit fly; entomology; genetics simulation; scientific inquiry; simulation; open educational resources; elementary education; JavaScript

Optional additions **[DECIDE]**: Punnett square; model organism; STEM education; lab safety.

## Language
English (eng)

## Related identifiers
| Identifier | Scheme | Relation | Rationale |
|---|---|---|---|
| 10.5281/zenodo.23550876 | DOI | is supplement to (resource type: book) | The software accompanies the storybook "Drosie, the Fruit Fly" by S. Arzoo (Zenodo, v1.0), already cited on the website. **[DECIDE]** an alternative relation (`isCompiledBy`, `references`, `isRelatedTo`) might fit better; I could not open the book record to confirm its metadata (no network route to Zenodo from the working container). |
| https://github.com/shahira15/drosies-world | URL | is supplement to (software) | Development repository. |
| https://drosiesworld.com | URL | is alternate identifier | Live deployment. (Zenodo may require a different relation for this; use "isDocumentedBy"/"isAlternateIdentifier" per preference.) |

After the first version DOI exists, add `isNewVersionOf` links for later releases. Referenced works (Zenodo `references`) **[DECIDE, optional]**: Morgan (1910) doi:10.1126/science.32.812.120; Hales et al. (2015) doi:10.1534/genetics.115.183392 (both PubMed-verified for existence).

## Licence
**[DECIDE] Not set.** Do not accept a platform default. See `docs/LICENSING_PROPOSAL.md`. After the decision, set the field to the SPDX identifier chosen for the software (for example `MIT`) and update `CITATION.cff` (`license:`).

## Files to upload
`release/drosies-world-v1.0.0.zip` (built by `tools/build_release.py`; checksum in `release/SHA256SUMS`).

## Communities, funding, grants
None identified. **[DECIDE]** whether to add a community (for example an education community) or funding statement.

## Additional notes (suggested)
"Provisional version 1.0.0. Simulated data only. Documents technical functionality; no student learning outcomes have been established. Rights-reserved artwork excluded."

## Pre-upload checks
- [ ] Licence chosen and set; CITATION.cff updated with `license`, DOI and release date.
- [ ] ORCID added or consciously omitted.
- [ ] Illustrator/third-party permissions resolved (readiness report, items L-1 to L-6).
- [ ] The live Supabase/Turnstile/analytics identifiers decision made (S-1, S-2).
- [ ] Zenodo "Sandbox" trial deposit performed first (recommended).
