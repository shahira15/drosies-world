# Feature status (generated from features.json)

Statuses: planned | in_development | implemented | tested (unit tests) | benchmarked (numerically matches established software, e.g. R/metafor) | scientifically_validated (benchmarked AND methodology reviewed by a qualified human expert) | requires_external_service | requires_expert_review. Benchmarking is NOT validation. Nothing is currently scientifically_validated. Updated 2026-11-26 (v0.2 batch 1).

| Feature | Status | Evidence | Blocker |
|---|---|---|---|
| Effect-size calculators (MD, Hedges g, lnRR, lnOR, lnRR-binary, RD, Fisher z, SD/SE/CI conversions, group combining) | **benchmarked** | Matches R metafor 4.4.0 escalc (MD, SMD/Hedges g, ROM, RR, OR, RD, ZCOR) on metadat datasets incl. zero-event and n=2-4 cases. Defects found/fixed: RD correction, exact Hedges J, SMD variance types. | Expert review pending; package 'meta' could not be installed to cross-check |
| Common-effect and random-effects pooling (DL, PM, REML), HKSJ, prediction interval, Q/I2/H2, leave-one-out | **benchmarked** | Common/random effects (REML, DL, PM), HKSJ, Q, tau2, I2, PI, leave-one-out match metafor 4.4.0 on 10 datasets + 9 edge cases (242 tests). See VALIDATION.md | Expert review pending; rare-event/dependence methods not implemented |
| Simulations: SD vs SE, CI coverage | **tested** | Statistical property tests (coverage ~95%, SE matches empirical SD) |  |
| 88-module registry (84 specified + 4 proposed) | **implemented** | Lesson availability computed from files; coverage audit vs recalled Handbook structure (not re-read) |  |
| Full lessons | **requires_expert_review** | 12 of 88 registered modules (3,4,5,7,10,18,20,21,22,27,32,35). AI-drafted; numeric content machine-checked; R snippets executed in tests; claims tracked (30; 0 human-reviewed; 6 unverified) | Qualified human review; 76 modules still outline-only |
| Quizzes with explanations and scoring | **tested** | Structure + numeric answers verified vs code; conceptual answers need expert review |  |
| Onboarding, diagnostic, pathway recommendation | **implemented** | Rule-based; diagnostic not psychometrically validated |  |
| Flashcards with SM-2-style spaced repetition (glossary + misconceptions) | **tested** | Scheduling properties tested; SM-2 is a heuristic, not validated |  |
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
| Resource registry (53 resources, 11 orgs, 6 communities) with 4 verification levels | **implemented** | Bibliographic via PubMed/Crossref for 77 references; link check ran for 1 URL only (sandbox blocks hosts); full-text/claim-support not claimed | Run tools/check_links.py locally; verify costs/versions; no videos/courses/funding/conference entries yet (unverified, not invented) |
| Database and software directories | **planned** |  |  |
| External organisations/communities directory | **implemented** | Unverified links; no costs/eligibility claimed |  |
| Outreach/agreement templates (collaboration, reviewer recruitment, mentor, statistician, author contact, authorship, meeting prep) | **implemented** | Drafts; not legal advice |  |
| Profiles, matching, forums, messaging | **requires_external_service** | Needs auth, moderation, hosting, real users. Nothing simulated. |  |
| Research opportunities hub | **planned** | Intentionally empty: nothing officially verified; no live monitoring |  |
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
| Searchable glossary (47 terms) linked to modules | **tested** | Original definitions; not expert-reviewed | Expert review |
| Core first-researcher pathway + extensions + specialist pathways | **implemented** | Availability computed; 13 core modules (12 written/available count computed in UI) |  |
| Method-selection wizard (rule-based, assumptions shown, flags unsupported methods) | **tested** | Scenario tests; rules not expert-reviewed | Expert review; does not cover many designs |
| Universal search across lessons, formulas, glossary, resources, claims, calculators, workflows | **tested** | Simple token scoring |  |
| Virtual Research Lab: fully simulated review with planted errors, simulated 2nd reviewer, grader | **tested** | Perfect solver scores 100%; empty learner low; traps verified; all material labelled FICTIONAL; separate teaching project |  |
| Downloadable lesson notes + formula cheat sheet | **tested** |  |  |
| Interactive coding tutorials (in-browser R/Python execution) | **planned** | Code is shown and tested but cannot be run inside the app |  |
| Bookmarks and weekly goal | **implemented** |  |  |
| Resource recommender per module (tag-based) | **tested** | Not personalised; tags assigned by author |  |
| Local collaborator manager (manual contacts, interactions, follow-ups) + CRediT tracking | **tested** | Contacts local only; details never copied to audit log; CRediT requires a described contribution |  |
| Open-source readiness docs, issue templates, CI workflow, dependency inventory | **implemented** | CONTRIBUTING, DEVELOPER, SECURITY, ACCESSIBILITY, LICENSE_DECISION (open), DEPENDENCIES; CI workflow not yet run on GitHub | Licence choice (owner); security/accessibility audits |
| Visual inspection in Chromium (desktop + 390px mobile) | **tested** | Home/Academy/First Paper/Stats Lab/Method Wizard screenshots reviewed 2026-11-26; no keyboard/screen-reader audit |  |
| Manuscript studio and export | **planned** | Reproducibility ZIP and SAP/PRISMA exports exist; no manuscript editor yet |  |
