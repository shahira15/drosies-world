# Open-Source Governance Plan

Plan only — **no repository will be created or published without explicit founder approval.** Note: the current workspace repo (`drosies-world`) is an unrelated educational website; FlyMethods should live in its **own** repository.

## 1. Licensing (separate layers)
| Layer | Proposed [A] | Notes |
|---|---|---|
| Code | **Apache-2.0** (patent grant, permissive, widely accepted by institutions) — alternative MIT; AGPL considered but deters reuse | Final choice Q-11 |
| Curated dataset (our extracted parameters, normalisations, verification records) | **CC BY 4.0** (or CC0 for pure facts — decide with legal advice, Q-12) | Applies only to *our* contribution |
| Third-party content (article snippets, FlyBase, Registry, DSHB) | **Retain original licences/terms**, listed per record (`license_spdx`) and in `THIRD_PARTY_NOTICES.md` | Tiering rules in DATA_SOURCES §2 |
| Documentation | CC BY 4.0 | |
| Benchmark | CC BY 4.0 for annotations; T0 text only | |
Software licence never implies rights to third-party literature or datasets; this is stated in README.

## 2. Repository files (to create after approval)
README (purpose, limits, "usage ≠ validation", how to cite); CONTRIBUTING.md (dev setup, tests, style, DCO sign-off); CODE_OF_CONDUCT.md (Contributor Covenant 2.1); SECURITY.md; CITATION.cff; LICENSE + LICENSE-DATA; THIRD_PARTY_NOTICES.md; `docs/data_dictionary.csv` + `docs/DATA_DICTIONARY.md`; GOVERNANCE.md; issue/PR templates (bug, correction, new-source, new-module); CHANGELOG.md; `.zenodo.json`. (The existing `CITATION.cff` in drosies-world belongs to a different project and is not reused.)

## 3. Scientific data dictionary
Single source of truth `data_dictionary.csv` (param_code, definition, type, unit, CV, "what counts as reported", "what is NOT inferred", examples, version). Schema-generated docs and validators; changes require a PR + scientific-reviewer approval.

## 4. Contribution & correction procedure
1. Anyone may open a correction (issue template or email) with: record ID, what is wrong, evidence (DOI + location).
2. Triage within a stated SLA (e.g., 14 days) [A].
3. A *scientific reviewer* (not the submitter, where possible) checks the source article → `confirmed|rejected|unclear`; logged in `verification_record`/`correction_decision`.
4. Confirmed fixes ship in the next PATCH data release; superseded records remain retrievable by version.
5. Disputes → second reviewer; unresolved ⇒ `disputed` badge, never silently deleted.
6. Takedown requests (rights holders/authors) honoured promptly; process documented.

## 5. Scientific review policy
Roles: Scientific Lead (founder), Reviewers (fly researchers with ≥ 1 yr bench experience in the relevant assay), Maintainers (code). Verified status requires a reviewer who did not run the extraction. Conflict-of-interest declaration (e.g., vendor affiliation) required; vendors cannot be sole reviewers of their own products. No vendor payments, sponsored ranking, or paid placement — ever (written policy).

## 6. Testing, versioning, releases
CI: lint, unit, golden-file, offset round-trip, determinism (hash-equal rebuild), schema validation, accessibility (axe), link-check. SemVer for software; separate data-release versioning (`data-vYYYY.MINOR.PATCH` [A]); tagged releases; signed tags; changelog distinguishes code vs data changes.

## 7. Zenodo and archiving
GitHub–Zenodo integration (after approval) → DOI per release, concept DOI for citation; dataset and benchmark deposited as separate Zenodo records; `CITATION.cff` + `.zenodo.json` kept in sync (CI check). Registry-style archiving of static site snapshots.

## 8. Maintenance and sustainability
Bus-factor ≥ 2 maintainers before public beta; documented release runbook; scheduled quarterly rebuilds; deprecation policy; hosting-independence (static files, mirrorable); funding options explored (institutional hosting, grants, community stewardship e.g. via fly community bodies) — **no paid-subscription or paywall**; a succession/archival clause if the project is abandoned (final Zenodo snapshot).

## 9. Contributor recognition & publication strategy
- CONTRIBUTORS via all-contributors/CRediT-style roles (annotator, reviewer, developer, validator); Zenodo release author lists updated; annotators named with consent.
- Publication targets [U: verify scope/policies before choosing]: a research-software or database-focused venue (e.g., *Journal of Open Source Software*, *Bioinformatics* Application Notes, *Database*, *NAR* database issue, *GENETICS/G3* resource-type articles). Choose after G2/G4 data exist. Preprint on bioRxiv first.
- Pre-register validation protocols (OSF/Zenodo) before running them.
