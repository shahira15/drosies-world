# Feature status (generated from features.json)

Statuses: planned | in_development | implemented | tested | scientifically_validated | requires_external_service | requires_expert_review. 'scientifically_validated' is reserved for items independently checked against established software or by a qualified human; nothing is currently at that level. Updated 2026-11-26.

| Feature | Status | Evidence | Blocker |
|---|---|---|---|
| Effect-size calculators (MD, Hedges g, lnRR, lnOR, lnRR-binary, RD, Fisher z, SD/SE/CI conversions, group combining) | **tested** | Hand-calculation unit tests; NOT yet compared with R/metafor escalc | R unavailable in build environment |
| Common-effect and random-effects pooling (DL, PM, REML), HKSJ, prediction interval, Q/I2/H2, leave-one-out | **tested** | Hand calcs; brute-force REML likelihood check; BCG dataset vs reference values recalled from metafor docs (pending live R confirmation) | Run R metafor and record output in TESTING_REPORT.md; then upgrade to scientifically_validated |
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
| Deduplication (exact DOI/PMID/title+year; reversible) | **tested** | Fuzzy matching NOT implemented |  |
| Single/multi-reviewer screening with conflict detection | **tested** | Cohen's kappa and blinding not implemented |  |
| PRISMA count derivation + inconsistency warnings | **tested** | Counts only; flow-diagram graphic not yet drawn |  |
| JSON backup/restore, CSV export | **tested** |  |  |
| 16-week plan with gates and progress | **implemented** |  |  |
| Data extraction forms with provenance | **in_development** | Table exists; UI not built |  |
| Risk-of-bias tools | **planned** |  |  |
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
