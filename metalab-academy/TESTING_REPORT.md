# Testing report (v0.2.0)
`python3 -m pytest -q tests` -> **312 passed** (~16 s).
- test_validation_r (R/metafor benchmark), test_stats, test_store, test_workflow, test_vlab, test_learning, test_network, test_content (lesson structure, numeric quiz answers vs code, R snippets executed when R available, claims/ref integrity), test_app (every page renders incl. populated project, virtual lab, search).
- Manual: Chromium screenshots (desktop 1366 px, mobile 390 px) of Home, Academy, First Paper, Statistics Lab, Method Wizard reviewed 2026-11-26.
Passing tests = software correctness checks; NOT methodological validation or expert review.
**Not tested:** accessibility (keyboard/screen reader/contrast), other browsers, large imports, concurrency, security audit, GitHub CI run, link verification.
