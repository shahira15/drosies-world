# FlyMethods — Planning Workspace

Status: **Phase 1–7 planning draft v0.1 (2026-11-26). Awaiting founder approval. No code, no deployment, no publication.**

| # | Document | Purpose |
|---|----------|---------|
| 1 | [LANDSCAPE_AUDIT.md](LANDSCAPE_AUDIT.md) | What exists today |
| 2 | [SCIENTIFIC_GAP.md](SCIENTIFIC_GAP.md) | Does our gap genuinely exist? Recommended re-scoping |
| 3 | [COMPETITOR_MATRIX.md](COMPETITOR_MATRIX.md) | Capability comparison (only documented capabilities) |
| 4 | [DATA_SOURCES_AND_LICENSING.md](DATA_SOURCES_AND_LICENSING.md) | APIs, limits, redistribution rules, conflicts |
| 5 | [PRODUCT_SPECIFICATION.md](PRODUCT_SPECIFICATION.md) | MVP: published antibody usage |
| 6 | [DATA_SCHEMA.md](DATA_SCHEMA.md) | Modular schema, provenance, verification |
| 7 | [EXTRACTION_PIPELINE.md](EXTRACTION_PIPELINE.md) | Reproducible retrieval + extraction |
| 8 | [VALIDATION_PLAN.md](VALIDATION_PLAN.md) | Benchmark, metrics, hallucination rate |
| 9 | [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) | Simplest sustainable architecture |
| 10 | [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) | Gated phases |
| 11 | [OPEN_SOURCE_GOVERNANCE.md](OPEN_SOURCE_GOVERNANCE.md) | Licences, policies, citation, Zenodo |
| 12 | [RISKS_AND_LIMITATIONS.md](RISKS_AND_LIMITATIONS.md) | Risk register |
| + | [DECISION_LOG.md](DECISION_LOG.md) | Assumptions, open questions, decisions |

## Evidence convention (used in every document)

- **[V]** Seen in a web-search result this session, with the URL cited. This is *snippet-level* verification, not a full read of the page or a legal reading of a licence. Re-check the primary page before relying on it for anything that matters (especially licences).
- **[U]** From general background knowledge, **not verified this session**. Treat as a hypothesis.
- **[A]** An assumption or design decision of ours.
- **[BLOCKED]** Could not be checked (network allowlist, no access).

## Limits of this audit (read first)

1. Web searches were run on 2026-11-26 through a general search tool. No primary API was called: `www.ebi.ac.uk` returned HTTP 403 from this session's egress proxy, so **no empirical hit counts from Europe PMC exist yet**.
2. Several sources disagree with each other (FlyBase licence, Antibody Registry licence, OpenAlex budget units). These are listed as **unresolved**, not resolved.
3. No survey documenting antibody-method needs among Drosophila researchers was found. The gap is plausible and consistent with the founder's firsthand experience, but **not yet independently documented** (see SCIENTIFIC_GAP.md).
4. Nothing here is legal advice. Licensing decisions need review by an institutional librarian/legal office.
