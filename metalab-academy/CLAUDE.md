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
