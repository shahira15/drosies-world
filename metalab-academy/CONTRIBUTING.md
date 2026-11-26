# Contributing to MetaLab Academy

Thank you. This project's value depends on scientific trustworthiness more than on feature count.

## Ground rules
1. **No fabrication**: no invented references, DOIs, data, users, opportunities or verification dates. Verify references with `tools/verify_refs.py` (Crossref) or PubMed before adding.
2. **Separate evidence levels**: bibliographic, link, full-text, claim-support (see `metalab/resources.py` header). Do not label content "expert-reviewed" unless a qualified human signed a review (see `expert_review` packages).
3. **Statistics must be benchmarked**: any new estimator needs a reference comparison (R/metafor or another established implementation) added to `validation/make_reference.R` + `tests/test_validation_r.py`, plus edge cases. Passing tests is not methodological validation; say so.
4. **Original content only**: link to books/courses; never copy copyrighted text. Risk-of-bias tools: domain names only.
5. **Honest status**: update `features.json` (planned / in_development / implemented / tested / benchmarked / scientifically_validated / requires_*), `KNOWN_LIMITATIONS.md`, and run `python3 tools/gen_docs.py`.

## Scientific content contributions (lessons)
- Use `content/lesson_NN.py` (see existing lessons). Required sections are enforced by `tests/test_content.py` (objectives, plain/intermediate/advanced, assumptions, worked example, mistakes, misconceptions, controversies, decision tree, exercises, integrity warning, references, application task, checklist, >=5 quiz items with explanations).
- Numbers in worked examples/quizzes must be reproducible by code; mark `numeric=True` quiz items and add checks in `tests/test_content.py`.
- Add claim records to `metalab/claims.json` for important methodological claims (source, locator, abstract vs full text, limits). Unverified claims must say so.
- Lessons stay "AI-drafted" until reviewed.

## Development
```bash
pip install -r requirements.txt
python3 -m pytest -q tests        # ~300 tests; uses committed R reference
./validation/run_validation.sh    # regenerates the R reference (needs R + metafor)
./run.sh
```
Style: small pure functions in `metalab/`; UI only in `app.py`; no network calls from the app; tests must use temp databases (`METALAB_DB`).

## Reporting
Use the issue templates (bug, scientific correction, content proposal). Security issues: see SECURITY.md.
No licence has been chosen for the project; contributions are accepted only once the owner publishes a licence and contribution terms.
