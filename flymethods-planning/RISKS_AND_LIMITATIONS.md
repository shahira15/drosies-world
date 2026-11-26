# Risks and Limitations

Likelihood (L) / Impact (I): H/M/L [A]. Owner is a role, not a person.

## A. Scientific
| ID | Risk | L | I | Mitigation |
|---|---|---|---|---|
| S1 | **Misreading usage as endorsement/validation** → researchers trust a bad antibody | H | H | Separate usage vs reported-validation; wording policy; persistent disclaimer; no scores |
| S2 | Wrong value shown (misattribution to wrong antibody, wrong application) | M | H | Span display, linking-confidence flag, human verification, per-release error rate |
| S3 | Reporting in papers is too sparse/inconsistent for a useful index | M | H | H1 measurement in Phase 0; pivot to reporting-gap atlas |
| S4 | "Previously described" methods hide parameters | H | M | `defers_to_reference`; no copying across papers |
| S5 | Synonym ambiguity in Drosophila gene names (e.g., common-word symbols) merges unrelated genes | M | H | No auto-merge; ambiguity UI; FlyBase release pinning [U about severity] |
| S6 | Lot-to-lot antibody variability; catalogue changes/discontinuation | H | M | Show "as reported"; date; no claim of current availability |
| S7 | Expected vs observed MW confusion | M | M | Two fields; role cue required |
| S8 | Bias: OA/English/high-resource-journal skew | H | M | Report coverage stats per release; state in limitations |

## B. Legal and licensing
| ID | Risk | L | I | Mitigation |
|---|---|---|---|---|
| L1 | Redistributing snippets from articles whose licence doesn't allow it | M | H | Tier policy, fail-closed, legal review |
| L2 | FlyBase licence ambiguity [V conflict] | H | M | Written clarification; minimise redistributed FlyBase content |
| L3 | Antibody Registry/vendor metadata terms inconsistent [V conflict] | M | M | Store RRID only + link |
| L4 | Publisher/DSHB/CiteAb terms violated by scraping | L | H | No scraping; approved routes; permissions |
| L5 | Data-protection (reviewer/submitter contact data) | L | M | Minimise; pseudonymous reviewer IDs; no tracking |
| L6 | Vendor trademark / "antibody ranking" defamation exposure | L | M | Neutral facts only, evidence-linked, correction path |

## C. Technical
| ID | Risk | L | I | Mitigation |
|---|---|---|---|---|
| T1 | Source API/FTP changes (PMC FTP notice for Aug 2026 [V, unresolved]; OpenAlex key policy change Feb 2026 [V]; Crossref limits changed Dec 2025 [V]) | H | M | Multiple routes; adapters; pinned snapshots; monitoring |
| T2 | Offset/normalisation bugs breaking evidence spans | M | H | Round-trip property tests; 100% span check |
| T3 | LLM hallucination if AI used | M | H | Span-cited verifier; human gate; zero-unsupported release rule |
| T4 | Static dataset too big for client-side search | L | M | Sharding; later API |
| T5 | Dependency/model licence issues | M | M | Licence audit in CI |
| T6 | Reproducibility drift (changing upstream data) | M | M | Hashed inputs, versioned releases |

## D. Project / sustainability
| ID | Risk | L | I | Mitigation |
|---|---|---|---|---|
| P1 | Single-maintainer burnout; abandonment | H | H | ≥ 2 maintainers, docs, archival clause, small scope |
| P2 | Verification labour exceeds capacity | H | M | Prioritised queue, deterministic high-precision first, community reviewers with recognition |
| P3 | Duplication of effort (Europe PMC, FlyBase, commercial tools expanding) | M | H | Partner not compete; early contact; unique value = fly-specific evidence table |
| P4 | Funding | M | M | Low-cost static design |
| P5 | Name collision/trademark ("FlyMethods") | ? | M | Not checked — Phase 0.5 |
| P6 | Scope creep to all methods | H | M | Module gating (each needs its own G1–G4) |

## E. Limitations of *this planning audit*
1. Snippet-level verification only; no full-page reads of licence texts.
2. Europe PMC primary API blocked (HTTP 403 via proxy) → no empirical prevalence counts.
3. No GitHub/Zenodo/bioRxiv prior-art search; no discontinued-project survey.
4. Fly Board / FlyBase survey contents not read; no antibody-specific need documented.
5. Competitor capabilities limited to public descriptions; "N?" ≠ absent.
6. All numeric thresholds, timelines and sizes are [A] placeholders for founder decision.
