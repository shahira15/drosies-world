# Developer guide
- **Layout**: `app.py` (Streamlit UI) · `metalab/` (stats, store, workflow, learning, vlab, claims, references, resources, workflows, rob_tools, milestones, topic_scan, expert) · `content/lesson_NN.py` · `validation/` (R reference) · `tools/` (verification/doc generators) · `tests/`.
- **Add a lesson**: copy a `content/lesson_*.py`; run tests; add claims + references (verify first); `python3 tools/gen_docs.py`.
- **Add a review workflow**: edit `metalab/workflows.py` (forms, tools, guideline, warnings).
- **Add an appraisal tool**: `metalab/rob_tools.py` (domain names + judgement scale + verified source key). Never paste official guidance text.
- **Add a statistical method**: implement in `metalab/stats.py`, add R reference generation, tolerance policy with documented reasons, edge cases, lesson text, claims.
- **Data portability**: `Store.backup_json()` / `restore_json()`, CSV exports, reproducibility ZIP (`workflow.export_package`). SQLite file is a single portable file.
- **Releases**: bump `metalab/__init__.py`, update `CHANGELOG.md`, run full tests + R validation, tag `vX.Y.Z`. Public release/licence/deployment need owner approval.

## v0.4 module map
`advanced2.py` generic REML engine (`reml_varcomp`), trim-and-fill, PET/PEESE, CR2, multivariate/DTA, NMA, phylogenetic, Bayesian quadrature, power, IPD two-stage, continuity-correction sensitivity, log-HR helpers · `pipeline.py` readiness/trace/simulated review · `learning_lab.py` drills/final exam/capstone/record · `encyclopedia.py` reference entries + executable commands · `knowledge.py` reading lists · `network_hub.py` networking dashboard (Store tables: collab_interests, meetings, authorship_discussions, opp_bookmarks, mentor_candidates, outreach_drafts, exam_results, capstone) · `lesson_audit.py` depth audit · `content/lessons_b4..b7.py` new lessons.
