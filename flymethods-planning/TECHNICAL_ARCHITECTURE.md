# Technical Architecture — simplest sustainable design

## 1. Recommendation (static-first, build-time science)
**Heavy work offline in a reproducible batch pipeline; ship a static, versioned dataset and a thin client.** No application server, no database server, no accounts, no analytics trackers in the default deployment.

```
[Sources] → [Pipeline (Python, containerised)] → [Release artefacts] → [Static site + client-side search]
 EuropePMC/PMC   deterministic extractor            SQLite  (query)         search UI, filters, evidence table
 FlyBase         span verifier                      Parquet (analysis)      CSV/JSON downloads
 Registry        review-queue export                CSV/JSON (public)       Zenodo-archived releases
                 ↑ verified records/corrections (git-tracked, text)
```

### Why static-first [A, supported by requirements]
- Free, low-bandwidth, privacy-preserving (no server-side query logs), trivial to mirror and archive, near-zero ongoing cost, easy to deploy → long-term sustainability.
- Dataset size expectation: MVP-0 is thousands–tens of thousands of observations [A, to be measured], comfortably within client-side search at tens of MB compressed. If it grows beyond, move to **sharded static indices** (by gene/antibody) before considering a server.

### Rejected / deferred
| Option | Verdict |
|---|---|
| Elasticsearch/OpenSearch cluster | Over-engineered; ops burden; deferred unless data > static limits |
| Postgres + API server | Not needed for MVP; add *only* if write-path (live corrections) becomes essential; corrections can flow via GitHub issues/PRs |
| Vector DB / embedding search | Not needed; exact identifiers dominate queries. Optional synonyms-fuzzy later |
| Mandatory LLM service | Rejected (requirement) |
| User accounts | Rejected (requirement) |
| Single-vendor serverless lock-in | Avoid; keep output plain files hostable anywhere |

## 2. Components
- **Pipeline** (Python ≥ 3.11, `uv`/pip-lock, container image): modules `fetch`, `license`, `parse`, `detect`, `link`, `extract`, `verify`, `build`. CLI: `flymethods build --manifest …`. Config & rules in versioned text (YAML/TOML). Tests: unit (regex/rules), golden files, property tests on offset round-trips, determinism test in CI.
- **Datastore:** SQLite as canonical query artefact + CSV/JSON exports; Parquet for analysis. Curated verification/corrections stored as plain text (JSONL/CSV) **in git** so history = provenance.
- **Search client:** static HTML/JS; SQLite compiled to WASM with HTTP-range-request loading (fetch only needed pages) *or* pre-sharded JSON + a small index library; decision after prototyping (Q-7). Progressive enhancement: server-rendered static pages per gene/antibody for crawlability and no-JS use. Target initial payload small; gzip/brotli.
- **Hosting:** any static host (GitHub Pages / institutional / Cloudflare Pages-like). **No deployment without founder approval.** Mirror releases to Zenodo.
- **Corrections intake:** link to GitHub issue template and a mailto/form-less path; no account needed on FlyMethods itself (GitHub is an optional channel).
- **Optional later:** read-only JSON API generated as static files (`/api/v1/gene/FBgn….json`).

## 3. Non-functional requirements and how met
| Requirement | Approach |
|---|---|
| Open source / free | Licences in GOVERNANCE; no paid dependency required |
| Account-free | No auth anywhere |
| Fast, mobile, low bandwidth | static assets, range-request DB, card layout, no heavy frameworks (vanilla/Preact-size) [A] |
| Accessible | semantic HTML tables, WCAG 2.2 AA, keyboard + screen-reader tests in CI (axe) |
| Privacy preserving | no cookies/trackers; no server logs of queries; optional aggregate counts via privacy-friendly, self-hostable method; no IP retention |
| Easy to deploy | `make build && make site` yields a folder |
| Modular | reagent-module plug-ins (rules + CV + schema fragment) |
| Reproducible | manifests, hashes, pinned env, CI determinism |
| Independence from paid AI | optional local-model adapter only |

## 4. Security and integrity
Signed release tags and checksums; dependency pinning/scanning; no secrets in repo; data files checksummed in the manifest; CSP header/meta; no user-generated HTML rendered (snippets escaped, highlight done via offsets).

## 5. Data flows touching third parties
Only pipeline→public APIs, at build time, polite/throttled, identified by a generic project User-Agent + contact `mailto` (project address, not personal). End-user browsers talk **only** to the static host.

## 6. Decisions awaiting prototype
Q-7 WASM-SQLite vs sharded JSON; Q-8 minimal JS framework vs none; Q-9 hosting target; Q-10 PMC bulk vs Europe PMC API as primary text route (depends on Aug 2026 FTP change status [V, unresolved]).
