# Literature Retrieval and Extraction Pipeline

Principle: **evidence first.** Every published value must be a normalisation of a text span that exists in a pinned, licence-cleared article version. AI may *propose*; only span-checked, human-verified (or deterministic-high-confidence, validated) records are published as verified.

## 1. Stages

| # | Stage | Output | Notes |
|---|---|---|---|
| 0 | Manifest | `input_manifest.json` (queries, dates, versions) | Everything hashed; reruns reproducible |
| 1 | Candidate discovery | PMCID/DOI list | Europe PMC search: Drosophila organism/keyword + methods terms; fallback Crossref/OpenAlex metadata. Query text archived |
| 2 | Licence gate | tier T0–T3 per article | Europe PMC LICENSE field / PMC OA group / Crossref licence; fail-closed to T3 [V sources: DATA_SOURCES] |
| 3 | Full-text retrieval | `article_version` (JATS/BioC XML) | Only approved routes (Europe PMC bulk/API, PMC OAI/BioC/cloud) [V]; throttle; cache; hash |
| 4 | Section parsing | structured sections, figure/table legends, supplementary refs | Preserve char offsets in a normalised text with offset map back to XML |
| 5 | Mention detection | antibody/reagent mention candidates | Deterministic patterns (below) |
| 6 | Entity linking | RRID, vendor, catalogue, DSHB name, FBgn candidates | FlyBase synonyms + Antibody Registry (policy-compliant) |
| 7 | Parameter extraction | `parameter_value` candidates + spans | Rules first; optional model second |
| 8 | Span verification | auto-check pass/fail | Value must be reproducible from span by a rule; span must exist verbatim in article_version |
| 9 | Review queue | prioritised human verification | Stratified sampling + all low-agreement items |
| 10 | Release build | versioned artefacts | CI determinism test |

## 2. Methods evaluated

### A. Deterministic extraction (baseline, MVP) — **recommended default**
Targets with high regularity [U — to be confirmed empirically]:
- RRIDs: `RRID:\s*AB_\d+` (+ variants with spaces/typos, SCR_, `RRID: AB_`).
- Vendor/catalogue patterns: `(Vendor, #?cat)`, `Vendor (cat. no.)`, `catalog #`. Vendor alias dictionary.
- DSHB names: closed list from catalogue (e.g., clone names) matched with context words ("DSHB", "Hybridoma Bank").
- Dilutions: `1:\d+`, `1/\d+`, `1 in \d+`, `\d+(\.\d+)?\s*(µ|u)?g/m?L`, "at a dilution of".
- Host/clonality tokens (rabbit, mouse, rat, guinea pig, chicken, goat; polyclonal/monoclonal).
- Application cue words by sentence/section (Western, immunoblot, immunostaining, IF, IHC, co-IP...).
- Molecular weight: `\d+\s*kDa` with role cues (expected/predicted/calculated vs observed/detected) — **role is stated only if a cue exists; else `ambiguous`**.
Strengths: auditable, free, offline, reproducible. Weaknesses: linking across sentences, prose variation, tables.

### B. Biomedical NLP (optional, phase 2)
Fine-tuned biomedical encoders (PubMedBERT-/BioBERT-family via open weights) or scispaCy for NER (gene/species/cell line/reagent); fine-tuned on **our benchmark**. SciScore illustrates NER+rules for reagents [V]; BioPIE shows reagent-IE datasets exist for protocols [V]. Requires training data → benchmark first. Licences of models/datasets to verify [U].

### C. LLM-assisted extraction (optional, never authoritative)
Use only for: (i) proposing candidates in hard prose, (ii) linking multi-sentence context, (iii) triage ranking for human review. Constraints:
1. Prefer **open-weight, locally run** models; no mandatory paid service (project requirement). Paid APIs only as an *optional* adapter, off by default [A].
2. Output must be **span-citing JSON**: each value paired with char offsets; verifier rejects any value whose span doesn't exist verbatim or from which a rule cannot reproduce the value (anti-hallucination).
3. Prompt, model ID/version, seed, temperature, schema pinned in `pipeline_run`.
4. Candidates stay `candidate` until human-verified; no auto-promotion on model confidence alone (confidence not assumed calibrated).
5. Unpublished/private lab data are never sent to external services.
6. Evaluate vs deterministic baseline on the same benchmark; adopt only if it improves **precision at fixed recall with zero increase in hallucination rate** [A].

## 3. Difficult cases and handling

| Case | Handling |
|---|---|
| Multiple antibodies per paper | Mention-level observations; link each parameter to nearest antibody by explicit cue; if linkage uncertain → `link_confidence=low` and queue |
| Antibody synonyms / clone names | Alias tables (DSHB names, registry names); conflicts → ambiguous, not merged |
| Ambiguous dilutions ("1:500–1:1000", "1:500 for WB, 1:50 for IF") | Split by application when stated; ranges stored as range; otherwise `ambiguous` |
| Conflicting conditions (text vs table vs legend) | Keep all as separate evidence; parameter `status=conflicting`; no resolution by us |
| "As previously described (ref)" | Record `defers_to_reference` with the cited ref; do **not** copy parameters from the cited paper into this record |
| Supplementary files | Out of MVP; flag `supplement_referenced=true`; later phases only where licence allows |
| Figure-only information | Not extracted (OCR out of scope); flagged `in_figure` |
| Lab-made / gifted antibodies | `source_kind=lab_made/gift`; no catalogue expected; not an error |
| Missing info | `not_reported` with the searched sections recorded |
| Tables with reagent lists (Key Resources Table) | Dedicated table parser — high-yield, high-precision source (STAR Methods style) [U] |
| Non-Drosophila antibodies in a fly paper | Organism filter on sample context; otherwise ambiguous |

## 4. Reproducibility
Pinned dependency lock; containerised build; fixed random seeds; manifest of source hashes; golden-file tests; deterministic ordering; pipeline code and rules versioned; benchmark frozen per release.

## 5. Open technical risks
XML heterogeneity across publishers; OA full-text availability gaps; PMC FTP changes (Aug 2026 notice [V, unresolved status]); Europe PMC limits [unverified]; tokenisation/offset bugs (mitigated by span round-trip tests).
