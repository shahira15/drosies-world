# Verifying Knowledge-Universe candidates (on your Mac)

The build environment could not reach most websites, so **every course, video search, textbook, organisation, community, conference and funding directory is a CANDIDATE**:
chosen from the author's knowledge, link-checked only if you ran the link checker, and *never* described as verified until a person looks at the page.

Three separate levels (never conflated): **bibliographic** (a paper's record exists in PubMed/Crossref - already done for every paper in `references.py`), **link** (the URL answered on a date),
**page examined by a human** (you opened it and recorded what you saw). Whether a source *supports a specific claim* is a fourth question handled by the claims registry.

## Batch workflow
```bash
python3 tools/check_links.py                       # optional: link level only (says nothing about content)
python3 tools/verify_batch.py list --category "Software & packages"
python3 tools/verify_batch.py run --verifier "human:Your Name" --batch 10 --category "Courses & training"
```
`run` opens each page in your default browser and asks what you *saw* (page title, whether it matches the description, access/cost, version/date, notes). A blank title skips the entry; `q` quits.
Nothing is written unless you typed the title you saw. Results appear in the app under *Knowledge Universe -> Verify resources*.

Spreadsheet route: `python3 tools/verify_batch.py export --out queue.csv`, fill the `verifier`, `verified_on`, `page_title_seen`, `matches_description`, ... columns, then `python3 tools/verify_batch.py import queue.csv`.

## What you should NOT do
Do not copy costs, deadlines, eligibility or availability from memory or from a search snippet; record exactly what the page showed and the date. Do not mark a YouTube lecture "verified" because the channel looks good:
verify the specific page and judge the statistics against the benchmarked MetaLab outputs. Do not contact anyone listed; the app never does.
