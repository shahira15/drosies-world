# Feature status (generated from features.json)

Statuses: planned | in_development | implemented | tested (unit tests) | benchmarked (numerically matches established software, e.g. R/metafor) | scientifically_validated (benchmarked AND methodology reviewed by a qualified human expert) | requires_external_service | requires_expert_review. Benchmarking is NOT validation. Nothing is currently scientifically_validated. Updated 2026-11-26 (v0.2 batch 1).

| Feature | Status | Evidence | Blocker |
|---|---|---|---|
| Effect-size calculators (MD, Hedges g, lnRR, lnOR, lnRR-binary, RD, Fisher z, SD/SE/CI conversions, group combining) | **benchmarked** | Matches R metafor 4.4.0 escalc (MD, SMD/Hedges g, ROM, RR, OR, RD, ZCOR) on metadat datasets incl. zero-event and n=2-4 cases. Defects found/fixed: RD correction, exact Hedges J, SMD variance types. | Expert review pending; package 'meta' could not be installed to cross-check |
| Common-effect and random-effects pooling (DL, PM, REML), HKSJ, prediction interval, Q/I2/H2, leave-one-out | **benchmarked** | Common/random effects (REML, DL, PM), HKSJ, Q, tau2, I2, PI, leave-one-out match metafor 4.4.0 on 10 datasets + 9 edge cases (242 tests). See VALIDATION.md | Expert review pending; rare-event/dependence methods not implemented |
| Simulations: SD vs SE, CI coverage | **tested** | Statistical property tests (coverage ~95%, SE matches empirical SD) |  |
| 84-module curriculum registry | **implemented** | Titles/levels only; lesson availability computed from files |  |
| Full lessons | **requires_expert_review** | 3 of 84 drafted (M3, M4, M32); AI-drafted; key references verified in PubMed; not reviewed by a qualified human expert |  |
| Quizzes with explanations and scoring | **tested** | Structure tests; numeric answers machine-checked; conceptual answers need expert review |  |
| Onboarding, diagnostic, pathway recommendation | **implemented** | Rule-based; diagnostic not psychometrically validated |  |
| Flashcards and spaced repetition | **planned** |  |  |
| Projects, question builder, decision log | **tested** |  |  |
| Append-only audit log (DB triggers) | **tested** |  |  |
| Search history logger (records searches the USER ran; the app executes none) | **tested** |  |  |
| RIS and PubMed NBIB import with raw-record preservation | **tested** | Synthetic test files only; real-world export variants not yet exercised |  |
| Deduplication: exact DOI/PMID/title+year plus fuzzy candidates with human confirmation (reversible) | **tested** | Fuzzy: title similarity + year + author, preprint/conference-abstract hints; never auto-merges | Not tuned on real exports; no author-level fuzzy beyond first author |
| Screening with multi-reviewer labels, conflict detection and Cohen's kappa | **tested** | Kappa verified vs hand-computed textbook example; no blinding mode; no active-learning prioritisation |  |
| PRISMA counts + accessible SVG flow diagram from stored records | **tested** | SVG validated as XML; simplified PRISMA 2020 template (databases only); reports-not-retrieved not tracked; no PNG/PDF export |  |
| JSON backup/restore, CSV export | **tested** |  |  |
| 16-week plan with gates and progress | **implemented** |  |  |
| Configurable extraction forms per review type, study/report/experiment/effect IDs, provenance, versioned (append-only) values, independent verification, missing-data tracking, uncertainty labels | **tested** | tests/test_workflow.py; per-value source required; self-verification and AI extractor refused; validation prompts (units, CV, shared control, duplicates, missing SD) | Unit conversion helpers limited to manual 'transform' labelling; no automatic unit conversion; expert review pending |
| Risk-of-bias recorder (SYRCLE, RoB 2, ROBINS-I, QUADAS-2, custom) + traffic-light and domain plots + reviewer agreement | **tested** | Domain names only (no official guidance text); every judgement needs rationale; AI refused; tool references verified (Crossref/PubMed) | Must be used with the official tool guidance; not reviewed by an expert; NOS/JBI/CASP/MMAT not included |
| Manuscript studio and export | **planned** |  |  |
| Resource registry | **implemented** | 15 verified references (PubMed); 16 resources + 8 organisations with UNVERIFIED links (no verification dates) |  |
| Database and software directories | **planned** |  |  |
| External organisation directory | **implemented** | Links unverified; no costs/eligibility claimed |  |
| Outreach templates | **implemented** |  |  |
| Profiles, matching, forums, messaging | **requires_external_service** | Needs auth, moderation, hosting, real users. Nothing simulated. |  |
| Research opportunities directory | **planned** | No entries until officially sourced |  |
| AI assistant | **requires_external_service** | No API configured; prompt-generation only is planned |  |
| Forest plot | **tested** | Renders from computed results; not compared pixelwise with R |  |
| Funnel, Baujat, RoB, network plots, exports | **planned** |  |  |
| Local-only storage, parameterised SQL, no network calls | **implemented** | No auth (single local user); no security audit performed |  |
| Subgroup analysis and mixed-effects meta-regression (REML/DL/PM, z and knha) | **benchmarked** | Matches metafor on dat.raudenbush1985 and dat.bcg (single/multiple/categorical moderators) | Expert review pending |
| R reference generation + automated comparison (Mac/CI-runnable) | **implemented** | validation/make_reference.R, run_validation.sh, .github/workflows/metalab-ci.yml (CI not yet executed on GitHub) |  |
| Effect-size builder from verified extraction, stable effect IDs, SAP template, shared-control warnings | **tested** | Matches stats engine; skips (never imputes) incomplete experiments |  |
| Reproducibility package ZIP (all stages, R script, SAP, PRISMA, audit log, SHA-256 manifest) | **tested** |  |  |
| Workflow templates: preclinical, clinical, observational, ecological, qualitative, scoping | **implemented** | Forms/tools/measures/guidelines differ by type; qualitative/scoping have no effect-size path | Templates need domain-expert review |
| 14-milestone guided pathway (8 elements each) + Topic Explorer with real PubMed scan | **implemented** | Scan = 18 logged PubMed searches (2026-11-26); signals only, not novelty determination |  |
| Claim-level verification registry + correction history + expert review packages | **implemented** | 15 claims; 0 human-reviewed; 11 corrections logged |  |
| Reference verification tooling (Crossref DOI registry + PubMed) | **tested** | tools/verify_refs.py rejects author/year mismatches; caught 3 wrong recalled identifiers; bibliographic verification only |  |
