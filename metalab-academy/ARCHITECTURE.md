# Architecture
**Stack decision:** Python + Streamlit + SQLite + NumPy/SciPy/pandas/Plotly. Chosen for fast, maintainable, local-first delivery with scientific libraries; no paid services. R/Quarto not installed in the build environment; R code is *generated* for users and must be used for validation. Future multi-user: swap SQLite for PostgreSQL behind `Store`, add FastAPI + auth; tables already carry `project_id` and `actor`.
## Separation
UI (`app.py`) · content (`content/`) · statistics (`metalab/stats.py`, no UI imports) · persistence (`metalab/store.py`) · registries (`curriculum`, `references`, `resources`, `features.json`) · audit log (append-only triggers) · external integrations: none yet.
## Data
Raw imported records stored verbatim (`refs.raw`); dedup is a reversible flag, never deletion. Teaching projects flagged `is_teaching`. Stable integer IDs. Backups are JSON.
