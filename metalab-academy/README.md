# MetaLab Academy (v0.2.0 - early, local-first)

A learning-and-workflow platform for evidence synthesis (systematic reviews, meta-analysis). Single-user, runs on your computer, stores data in one local SQLite file, makes no network calls.

## Open it
```bash
cd metalab-academy
pip install -r requirements.txt
./run.sh            # opens http://localhost:8501
```
Run the tests: `python3 -m pytest -q tests`

## What works today (honestly)
**Nothing in MetaLab is expert-reviewed yet**: lessons are AI-drafted, statistics are benchmarked against R/metafor but not reviewed by a statistician, and no learner-facing content has been signed off by a qualified human.

- **Academy:** 88-module registry (84 specified + 4 proposed); **23 written lessons** (AI-drafted), quizzes, notes, flashcards (spaced repetition), glossary, pathways (core first-researcher path), method-selection wizard, universal search, **Virtual Research Lab** (fully simulated review with grader).
- **Research Workspace:** projects (teaching vs real), question builder, search log, RIS/NBIB import, exact + fuzzy dedup (human-confirmed), screening + kappa, PRISMA counts + SVG, **extraction with provenance/versioning/verification**, **risk of bias** (SYRCLE, RoB 2, ROBINS-I, QUADAS-2, custom) + plots, effect-size builder, SAP draft, audit log, backup/restore, **reproducibility ZIP**; workflows differ by review type.
- **First paper:** 14 milestones + Topic Explorer (a real, logged PubMed scan; no topic chosen for you).
- **Statistics Lab:** simulations; meta-analysis (REML/DL/PM, HKSJ, PI, forest, leave-one-out); subgroups & meta-regression; calculators - **benchmarked vs R/metafor** (VALIDATION.md).
- **Quality:** claim registry, correction history, expert-review packages.
- **Knowledge/Network:** 80 verified references (PubMed/Crossref), 53 resources (links unchecked), local collaborator manager, CRediT, templates. **No users or community exist.**

See `FEATURE_STATUS.md`, `KNOWN_LIMITATIONS.md`, `VALIDATION.md`, `AUDIT_2026-11-26.md`, `NEXT_ACTIONS.md`, `CONTRIBUTING.md`.
