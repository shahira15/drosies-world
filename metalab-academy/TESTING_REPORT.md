# Testing report (v0.4.0)
`python3 -m pytest -q tests` -> **823 passed, 1 skipped** (~3 min; the skip is the opt-in UI audit, run separately with `METALAB_UI_AUDIT=1`).
- Numerical benchmarks vs R: test_validation_r, test_advanced_r, test_advanced2_r (trim-and-fill, PET/PEESE, CR2, multivariate, DTA, NMA, phylogenetic, Bayesian, IPD, continuity corrections); R is required for these (skipped without R).
- Content: every lesson's structure, numeric quiz answers and worked-example numbers are recomputed from code or the R reference (test_content, test_lessons_b4/b5/b6, test_lesson_audit, test_encyclopedia commands in Python and R).
- End to end: test_pipeline_e2e (fictional review; PRISMA recount from exported CSV; independent R/metafor analysis; trace report; changing an input breaks traceability).
- Learning/network/knowledge: test_learning_lab (drills vs independent formulas, final assessment scoring, rubric, record, datasets), test_network_hub (privacy: nothing personal in audit log or shareable backups), test_knowledge, test_verify_batch, test_expert_areas.
- Browser: tools/audit_ui.py (axe-core + keyboard, 28 views) 2026-11-28: 1 minor third-party violation; screenshots inspected.
Passing tests = software correctness checks; NOT methodological validation or expert review.
**Not tested:** screen readers, zoom/reflow, other browsers, large imports, concurrency, GitHub CI run, link verification, the six external R workflows.
