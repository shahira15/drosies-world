# Release-Readiness Report: Drosie's World v1.0.0 (provisional)

Prepared 2026-11-24 on branch `claude/ecstatic-planck-jl44t9` from base commit `b3707ac`.
Prepared by an AI assistant (Claude) at the author's request; **every item marked "human review" needs a person's decision.** Not legal advice.

## 1. Bottom line

**Not ready to deposit as-is.** The software itself is in reasonable technical shape for an archival snapshot, and the documentation and metadata are drafted. Deposit should wait for the **blocking decisions** below: licence selection, artwork/illustrator rights, confirmation of AI-generated content, and the live-backend/privacy questions. Nothing was published, uploaded, deployed, merged or licensed in this work.

| Status | Count |
|---|---|
| Blocking (must be resolved before upload) | 9 |
| Strongly recommended before upload | 10 |
| Housekeeping / later | 9 |

## 2. What was prepared (all in this branch, unmerged)

README.md (rewritten; old text retained in git history), `CITATION.cff` (schema-valid: validated with `cffconvert`, CFF 1.2.0), `.zenodo.json` (valid JSON, **licence omitted on purpose**), and in `docs/`: AI_DISCLOSURE, SCIENTIFIC_REFERENCES, ARCHITECTURE, TESTING, EDUCATIONAL_FEATURES, REPOSITORY_AUDIT, LICENSING_AUDIT, LICENSING_PROPOSAL, ZENODO_METADATA_DRAFT, RELEASE_BUILD, this report; `tools/build_release.py`; `release/` (ZIP, checksum, verification record).

## 3. Release ZIP

See `release/BUILD_VERIFICATION.md` for exact counts, the SHA-256 and the reproducibility checks performed. The archive contains code, tests, documentation and educator documents; it **excludes** mascot/storybook artwork, brand marks, portraits, the Canva certificate and other items (`EXCLUDED_FILES.txt` inside the archive).

## 4. Blocking issues (human decision required)

| ID | Area | Issue | Why it blocks | Suggested resolution |
|---|---|---|---|---|
| L-1 | Licence | **No licence exists** anywhere in the repository. | Zenodo needs one for open access; without a choice, a default may be applied to everything. | Decide per `docs/LICENSING_PROPOSAL.md`, then add LICENSE and update `.zenodo.json` and `CITATION.cff`. |
| L-2 | Rights | **Ownership of mascot and storybook art is undocumented** (illustrator credited on `team.html`; book made in Canva). | Cannot grant or reserve rights confidently. | Obtain the illustrator agreement; state who holds copyright; decide what may be archived. |
| L-3 | Rights | **Possible AI-generated or Canva-library imagery** is unknown. | Affects copyright claims and disclosure. | Author to confirm and record in `AI_DISCLOSURE.md`. |
| L-4 | Rights | **Licence of the existing book record** (DOI 10.5281/zenodo.23550876) could not be read from this environment. | An open licence there already covers those images; "all rights reserved" would be inconsistent. | Check the record; align strategy. |
| L-5 | Rights/privacy | Illustrator's name, social handle and portrait are on the public site; consent for permanent archival isn't documented. | Personal data / likeness. | Get written consent or omit (the ZIP already omits the photo). |
| L-6 | Rights | Characters are **drawn in code** (`lab/js/art/chars.js`, `lab-scene.js`, `vx-art.js`), mixing software and artwork. These files **are in the ZIP**. | They would be covered by whatever software licence is chosen. | Choose option 1/2/3 in the proposal; if option 1 or 3, move or replace before upload. |
| S-1 | Security/privacy | `index.html` embeds a live **Supabase URL + publishable key** and **Turnstile site key**. Not secrets by design, but they permanently identify a live backend; row-level-security was not and could not be reviewed here. | Archived forever; misuse/abuse surface; also the older README wrongly said no data is collected. | Verify RLS and function rate limits; decide to keep, redact or parameterise in the archive. |
| S-3 | Privacy/legal | Feedback form collects free text and optional country; **no privacy notice or retention policy** in the repo; analytics and Google Fonts also transmit visitor data. Children's-privacy law (COPPA/GDPR-K etc.) not assessed. | A formal software record of a children's educational site should not carry unexamined data-protection exposure. | Legal/privacy review; publish a privacy notice; consider self-hosting fonts. |
| SC-1 | Scientific | **No independent expert review** of the science, including allele data and timings (the repository says so). Genetics README calls it "scientifically validated". | The record would be read as scholarly. | Obtain a *Drosophila* geneticist's review, or change wording to "checked by the developer against FlyBase". |

## 5. Strongly recommended before upload

| ID | Area | Issue | Suggested action |
|---|---|---|---|
| S-2 | Privacy | GoatCounter script and `drosiesworld` site code in archived pages would report counts to the live site from any copy. | Document, or make analytics opt-in/configurable for forks. |
| SC-2 | Scientific | Timing facts (about 24 h embryo, 4 d larva, 4-5 d pupa; 19 d at 18 °C, 7 d at 29 °C) lack citations on the pages. | Add citations or soften ("about"). |
| SC-3 | Scientific | Reference R9 (Miller et al. 2018 balancer evolution) not matched in PubMed lookup. Hurd 2015 and Bidaye 2014 matched by PMID but metadata not read. Full texts of Gargano 2005 and Nichols 2012 not read (stated on the guide). | Verify citations; read the sources. |
| SC-4 | Scientific | FlyBase IDs, map positions and release coordinates in `drosie-genetics-lab/` were not re-checked in this work. | Spot-check against FlyBase. |
| SC-5 | Scientific | "roughly 14,000 genes" (Fruit Fly Biology) vs the cited paper's about 13,600 at the time. | Cite a current FlyBase figure. |
| E-1 | Educational claims | Standards mappings (NGSS, TEKS) in the Genetics teacher guide and the team page are unreviewed; only TEKS BIO.8.B was verified. Teacher Resources says other resources are not aligned. | Have a teacher/curriculum specialist verify, or label "informal". |
| E-2 | Educational claims | Age bands and time estimates are unpiloted; draft DOCX lesson plans are marked "to be proofread". | Proofread or label as drafts; do not imply validation. |
| T-1 | Testing | Only Chromium tested; no screen-reader, device or user testing; most components (all except the Genetics Lab and the Conference) have no dedicated automated tests. | Run the extra tests in `docs/TESTING.md` §6, or keep the limitations statement prominent. |
| T-2 | Dependencies | page-flip 2.0.7 (jsDelivr, no SRI), Leaflet, fonts loaded from CDNs; test dependencies undeclared. | Add SRI/vendor with licences; add dev manifest. |
| L-7 | Licensing | Third-party terms to verify: FlyBase data licence attribution wording, NGSS terms of use for quoted text, OSM tile policy, YouTube video authorisation (credited to IMP and Science/AAAS), Canva terms for `Certificate.pdf`. | Review each; remove if unclear. |

## 6. Housekeeping / later

| ID | Item |
|---|---|
| T-3 | Five Conference tests hard-code `/tmp/claude-0/...` scratch paths (tests pass only if those directories exist). Use `os.tmpdir()`. |
| T-4 | Absolute root paths make sub-folder deployment break. |
| T-5 | `drosie-genetics-lab/package.json` lacks version/licence; `.nojekyll` claimed but absent; no root `.gitignore`. |
| T-6 | Stray files: `Virtual lab`, `book-pages/gitkeep`, `drosie.png.png`. About 90 MB of raster images in the code repo (55 MB duplicates of storybook pages). |
| T-7 | `seo_check.py` reports 8 warnings (long titles/descriptions; `#ch1` anchor). |
| T-8 | Five different JS architectures, no shared library (maintainability). |
| T-9 | Sitemap, robots and canonical URLs refer to drosiesworld.com; unaffected for archive but note for forks. |
| T-10 | The date in `CITATION.cff`/`.zenodo.json` (2026-11-24) is a placeholder for the deposit date. |
| T-11 | Add the release commit hash to the Zenodo notes after merge; if the PR is merged by squash, the hash changes. |

## 7. Claim discipline check

Statements added in this work that distinguish functionality from effectiveness: README header note and Limitations; Zenodo description; CITATION abstract; EDUCATIONAL_FEATURES §G. **No** document in this branch claims learning effectiveness, WCAG conformance, standards alignment, expert review or cross-browser support. Existing site text was **not** edited; pre-existing claims flagged above remain as they were.

## 8. What was verified in this work versus not

| Verified here (evidence) | Not verified |
|---|---|
| Genetics engine tests: 58/58 passed (run now) | Educational effectiveness (no data exist) |
| Conference scripts: 1,145 assertions, 0 failed (run now, Chromium) | Firefox/Safari/mobile; screen readers |
| `seo_check.py`: 0 errors, 8 warnings (run now) | RLS and security of the Supabase backend |
| `CITATION.cff` validates against CFF 1.2.0 (cffconvert) | Zenodo's acceptance of `.zenodo.json` (no upload attempted) |
| 6 references confirmed to exist in PubMed; 2 matched by PMID | Full texts of any cited paper; FlyBase records |
| Secret/PII pattern scans on tree and history: nothing credential-like found | Third-party licence terms, legal sufficiency |
| ZIP built twice and in a clean clone: see `release/BUILD_VERIFICATION.md` | Whether artwork is AI-generated or Canva-sourced |

## 9. Actions deliberately not taken (per instructions)

No existing licence modified (none exist); no licence assigned to artwork or anything else; no GitHub release or tag created; nothing uploaded to Zenodo; no merge; no deployment. A draft pull request was opened for review.
