# CLAUDE.md - instructions for future sessions
Source of truth: the master specification given by the user (MetaLab Academy). Resume from `NEXT_ACTIONS.md`, `PROJECT_STATUS.md`, `features.json`.
## Hard rules
- Never fabricate references/DOIs/data/users/opportunities. Verify every new reference (PubMed MCP tools: lookup_article_by_citation + get_article_metadata) BEFORE adding to `metalab/references.py`. Non-PubMed resources go in `resources.py` with `verified_on=None` unless actually fetched.
- Never mark a feature `scientifically_validated` without comparison to R/established software or qualified human review. Update `features.json` then run `python3 tools/gen_docs.py`.
- Lessons stay labelled "AI-drafted" until a qualified human reviews them.
- App never submits/registers/contacts anyone. AI is never recorded as a reviewer.
- Tests must use `METALAB_DB` temp paths - never touch `data/metalab.sqlite`.
## Layout
`app.py` UI · `metalab/` logic (stats, store, curriculum, references, resources, plan) · `content/lesson_NN.py` lessons (auto-discovered) · `tests/` · `features.json` registry · `tools/gen_docs.py`.
## Commands
`./run.sh` · `python3 -m pytest -q tests` · `python3 tools/gen_docs.py`

## v0.2 additions
- Verify references: `python3 tools/verify_refs.py <date>` (edit `metalab/refs_wanted.json`; Crossref) or PubMed MCP. It rejects author/year mismatches. Resource links: `tools/check_links.py` (only definitive results recorded).
- Statistics changes need R reference + tests (`validation/make_reference.R`, `tests/test_validation_r.py`). 'benchmarked' != 'scientifically_validated'.
- Claims: add to `metalab/claims.json`; corrections to `metalab/corrections.json`; regenerate docs with `tools/gen_docs.py` and `tools/gen_deps.py`.
- Virtual Lab data is FICTIONAL (metalab/vlab.py) and must stay labelled; never mix with real projects.
- Do not choose a licence, deploy publicly, register, submit, or contact anyone without the owner's explicit approval.

## v0.4 additions
- New modules: `advanced2.py` (advanced methods, benchmarked via `validation/make_reference_v04.R`), `pipeline.py` (end-to-end review, readiness, trace), `encyclopedia.py`, `knowledge.py` (+ `_resources_v04.py`), `network_hub.py`, `learning_lab.py`, `lesson_audit.py`, `expert.py` area packages, `tools/verify_batch.py`.
- **Audit reference scripts before trusting them**: v0.4 found silent errors in the R reference itself (trimfill `control` clash, DTA boundary, name collision). Assert every reference section is non-error.
- Lesson numbers must come from code or the R reference (tests/test_lessons_b4-b6); abstract-level claims go to `claims.json`; new references via `refs_wanted.json` + `tools/verify_refs.py` (Crossref) and PubMed MCP.
- Keep verification levels separate; candidates stay `verified_on=None`; the app never contacts anyone; the learning record is never a certificate; the simulation verifier is always labelled fictional.
- NMA `higher_is_better` is a REQUIRED argument (a default once ranked the wrong way).
