# Data Sources, API Access and Licensing

**Not legal advice.** Snippet-level verification only ([V]); every row marked "verify" must be checked on the primary page and, for redistribution, reviewed by an institutional librarian/legal office before release.

Principle: **an open-access article is not automatically redistributable.** Reuse depends on the article's specific licence. Software licence ≠ dataset licence ≠ third-party content rights.

## 1. Source table

| Source | Access | Limits / terms (as seen) | Redistribution position | Status |
|---|---|---|---|---|
| **Europe PMC** | REST API; bulk OA full text; Annotations API (`ebi.ac.uk/europepmc/annotations_api/`) | No key needed per R client docs [V: https://docs.ropensci.org/europepmc/]. Rate limits **not found** in searches. | All content free to read, only a proportion reusable; bulk OA-subset items carry CC BY or CC0 per Europe PMC forum reply; copyright compliance is the user's responsibility; Search API has a LICENSE field for filtering [V: https://groups.google.com/a/ebi.ac.uk/g/epmc-webservices/c/sdxUbcGLTGg]. | Verify limits; **primary API unreachable from this session (403)**. |
| **PMC (NCBI)** | FTP, Cloud (AWS), OAI-PMH, E-utilities, BioC API are the approved automated routes [V: https://pmc.ncbi.nlm.nih.gov/tools/textmining/] | OA Subset has 3 groups: commercial-use (CC0, CC BY, CC BY-SA, CC BY-ND), non-commercial (CC BY-NC*), Other (no/custom licence) [V: https://pmc.ncbi.nlm.nih.gov/tools/openftlist]. | Not all PMC articles permit text mining/reuse [V]. | **Caution:** PMC page said article datasets would be removed from FTP in Aug 2026; status today unconfirmed [V + unresolved]. Check live. |
| **FlyBase** | Bulk precomputed files incl. synonyms (FB2026_01) [V: https://flybase.org/downloads/bulkdata] | — | **CONFLICT:** a Feb 2026 arXiv paper says CC BY 4.0 [V: https://arxiv.org/pdf/2602.09163]; FlyBase's own copyright page says commercial use prohibited without written permission and some portions separately copyrighted [V: https://ftp.flybase.net/flybase/docs/copyright.html]. Wiki content CC BY-SA 3.0 [V]. | **Unresolved. Contact FlyBase for written clarification before redistributing any FlyBase-derived table.** Using FlyBase only for *identifier resolution at build time* and publishing only FBgn IDs + our own symbols is lower risk [A]. |
| **Antibody Registry (RRID)** | No direct API; index via SciCrunch/FDI Lab; per-record .json/.xml; resolvers (Identifiers.org etc.) [V: https://antibodyregistry.org/faq] | SciCrunch account/API key for programmatic index [V] | RRIDs and some metadata CC0 per FAQ [V]; Terms page says indexed data licensed by owners, cite registry + source, CC BY [V: https://antibodyregistry.org/terms-and-conditions]; an earlier search snippet also reported company-supplied metadata under a non-commercial licence (not re-confirmed). | **Internally inconsistent; ask registry to clarify.** Plan: store RRID string + our own link, not mirrored vendor metadata. |
| **DSHB** | Public web catalogue [V] | Terms/robots/API **unverified** | Unverified. Product names/IDs likely facts, but a scraped mirror is not assumed permitted [A]. | Ask DSHB for permission to use catalogue/IDs; ideally partner. |
| **Crossref** | REST API; polite pool via `mailto` | From 1 Dec 2025: polite DOI lookup 10 req/s (concurrency 3); polite queries 3 req/s (concurrency 3); public 5 and 1 req/s [V: https://crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/, https://crossref.org/blog/announcing-changes-to-rest-api-rate-limits/] | Crossref claims no ownership of bibliographic metadata [V]; exact licence wording to verify. | Use for DOI metadata/licence fields; verify. |
| **OpenAlex** | REST; API key required for production use since Feb 2026; free key [V: https://developers.openalex.org/api-reference/authentication] | Max 100 req/s; daily budget stated inconsistently ($1/day vs 100,000 credits/day) [V: conflict]. | Data "will remain available at no cost" [V]; licence (CC0?) **not confirmed**. | Optional dependency; avoid making it mandatory [A]. A required key conflicts with "no mandatory accounts" for *developers*, not end users. |
| **protocols.io** | API exists [U] | API terms/limits **unverified** | Site states all content CC-BY, per-protocol statements vary [V: https://www.protocols.io/code-of-conduct] | Phase 2+ (not MVP). |
| **CiteAb** | Web | Terms restrict copying/reselling [V: https://citeab.com/terms] | **Do not scrape or redistribute.** Link out only. | Excluded. |
| **pAbmAbs, BenchSci, Antibodypedia** | Web | Unverified | Unverified | Link out only; no ingestion without agreement. |

## 2. Licence-tier policy for article text (proposed [A], requires legal review)

| Tier | Article licence | What FlyMethods may store/publish |
|---|---|---|
| T0 | CC0, CC BY (commercial-use group, no SA/ND) | Extracted parameters **+ short verbatim evidence snippet (≤ ~300 chars) + offsets** with attribution (authors, title, DOI, licence). |
| T1 | CC BY-SA, CC BY-ND | Extracted parameters + location pointer only; no verbatim quotes until legal review (SA/ND obligations on adaptations are unsettled for snippets) [A]. |
| T2 | CC BY-NC variants | Parameters + pointer only; project's data licence may not be NC-compatible [A]. |
| T3 | No/custom licence, or non-OA | **Metadata and identifiers only; no full-text processing for distribution.** Possible private local processing only if legal review confirms TDM rights (e.g., institutional subscription) and *results are not published*. Default: excluded. |

Facts (e.g., "dilution 1:500") are generally not copyrightable in many jurisdictions, but this varies, and database rights (e.g., EU) and publisher terms may still apply [U]. We therefore *do not rely on that alone*; the tiering is the conservative default.

## 3. Compliance requirements baked into the pipeline
- Store `license`, `license_url`, `license_checked_at`, `retrieved_from`, `content_hash` per article version.
- Licence filter occurs **before** snippet storage (fail-closed: unknown licence ⇒ T3).
- Honour Crossref `mailto`; identify via a generic project User-Agent; throttle below documented limits; cache aggressively; never hammer endpoints.
- No scraping of publisher sites or sites whose terms forbid it.
- Takedown/correction path documented (GOVERNANCE).
- Privacy: search logs not stored beyond aggregate counts (ARCHITECTURE).

## 3b. Open licensing questions (tracked in DECISION_LOG)
Q-L1 FlyBase licence; Q-L2 Antibody Registry vendor-metadata licence; Q-L3 DSHB permission; Q-L4 PMC FTP status after Aug 2026; Q-L5 Europe PMC rate limits; Q-L6 OpenAlex licence + budget units; Q-L7 whether CC BY-SA snippets can sit in a CC BY dataset; Q-L8 EU/UK database-right exposure.
