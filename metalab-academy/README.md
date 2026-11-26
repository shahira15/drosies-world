# MetaLab Academy (v0.1.0 - early, local-first)

A learning-and-workflow platform for evidence synthesis (systematic reviews, meta-analysis). Single-user, runs on your computer, stores data in one local SQLite file, makes no network calls.

## Open it
```bash
cd metalab-academy
pip install -r requirements.txt
./run.sh            # opens http://localhost:8501
```
Run the tests: `python3 -m pytest -q tests`

## What works today (honestly)
- **Learning Academy:** 84-module curriculum *registry*; **3 full lessons** (Modules 3, 4, 32) with quizzes, notes, progress.
- **Onboarding** + diagnostic + pathway suggestion.
- **Research Workspace:** projects (teaching vs real), question builder, search log, RIS/NBIB import, exact dedup (reversible), screening, PRISMA counts, decision log, append-only audit log, backup/restore/CSV.
- **First Paper Plan:** 16-week task plan with quality gates.
- **Statistics Lab:** SD-vs-SE and CI-coverage simulations; meta-analysis (common/random; DL/PM/REML; HKSJ; prediction interval; forest plot; leave-one-out; R code); effect-size calculators.
- **Knowledge Universe:** 15 PubMed-verified references; resource list (links unverified).
- **Network:** external organisation list + outreach templates. **No users or community exist.**

See `FEATURE_STATUS.md`, `KNOWN_LIMITATIONS.md`, `AUDIT_2026-11-26.md`. Start with `NEXT_ACTIONS.md`.
