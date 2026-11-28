# MetaLab Academy (v0.4.0 - local-first, pre-expert-review)

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

- **Academy:** 90-module registry (84 specified + 6 proposed); **90 written lessons** (AI-drafted; all pass a deliberately low mechanical depth audit - which is not a quality judgement), quizzes, notes, flashcards (spaced repetition), glossary, pathways, method-selection wizard, universal search, **Virtual Research Lab** (fictional scenarios with grader), **Reference Encyclopedia** (formulas, definitions, comparisons, troubleshooting, R/Python commands executed against R/metafor in the tests).
- **Practice:** calculation drills, method-selection and interpretation exercises, **final comprehensive assessment**, capstone rubric, practice-dataset ZIP, formula sheets, **internal learning record (not a certificate)**.
- **Research Workspace:** projects (teaching vs real), question builder, search log, RIS/NBIB import, exact + fuzzy dedup (human-confirmed), screening + kappa, PRISMA counts + SVG, **extraction with provenance/versioning/verification**, **risk of bias** (SYRCLE, RoB 2, ROBINS-I, QUADAS-2, custom) + plots, effect-size builder, SAP draft, audit log, backup/restore, **reproducibility ZIP**, **readiness checker and manuscript-number traceability**; an **end-to-end fictional review** exercises every stage with independent R cross-checks.
- **First paper:** 14 milestones + Topic Explorer (a real, logged PubMed scan; no topic chosen for you); Manuscript Studio with verified-result tokens.
- **Statistics Lab:** simulations; meta-analysis (REML/DL/PM, HKSJ, PI, forest, leave-one-out); subgroups & meta-regression; calculators; advanced methods I and II (MH/Peto, Egger/Begg, multilevel + CR1/CR2, multivariate, DTA, NMA, phylogenetic, Bayesian, trim-and-fill, PET/PEESE, power, rare-event sensitivity) - **benchmarked vs R/metafor/clubSandwich where possible** (VALIDATION.md); NMA/DTA/Bayesian are NOT yet checked against netmeta/mada/bayesmeta (not installable here).
- **Quality:** claim registry, correction history, **eight expert-review area packages** + per-lesson packages.
- **Knowledge/Network:** 142 verified references (PubMed/Crossref), 151 resources (candidate links, unverified; batch verification tool for your machine), reading list for every module, **personal local networking dashboard** (nothing is ever sent), CRediT, templates. **No users or community exist.**

See `FEATURE_STATUS.md`, `KNOWN_LIMITATIONS.md`, `VALIDATION.md`, `KNOWLEDGE_VERIFICATION.md`, `AUDIT_2026-11-26.md`, `NEXT_ACTIONS.md`, `CONTRIBUTING.md`.
