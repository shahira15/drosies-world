# Data Schema (v0.1 draft)

Design goals: modular (antibodies now; primers, diets, genetic reagents, assays later), strict separation of concerns, every value traceable to evidence, reproducible builds, machine-readable export.

## 1. Layers and separation

```
Publication layer     publication, article_version (pinned full text + licence + hash)
Biological layer      organism, gene (FBgn), protein, tissue, stage (FBbt/FBdv ontology IDs)
Reagent layer         reagent (abstract) → antibody | primer | stock | diet | ...
Context layer         experiment_context (application, sample, genotype, conditions)
Observation layer     usage_observation (reagent × context × publication)
Parameter layer       parameter_value (typed, normalised, with status)
Evidence layer        evidence_span (where in which article_version)
Verification layer    verification_record (who/what/when/outcome)
Community layer       correction (proposed), correction_decision
Release layer         release (versioned snapshot), pipeline_run
```
Rule: **a parameter_value cannot exist without ≥ 1 evidence_span** (except `not_reported`, which instead references the article_version + searched sections). Verification and corrections are *separate append-only tables*, never edits of source rows.

## 2. Core tables (logical)

**publication**: `pub_id`, `doi`, `pmid`, `pmcid`, `title`, `journal`, `year`, `identifiers_resolved_at`.
**article_version**: `av_id`, `pub_id`, `source` (europepmc|pmc), `retrieved_at`, `format`, `content_sha256`, `license_spdx`, `license_url`, `license_tier` (T0–T3), `license_checked_at`, `storage_ref` (not published if tier>T0).
**gene**: `fbgn`, `symbol`, `name`, `flybase_release`. **gene_synonym**: `fbgn`, `synonym`, `synonym_type`, `flybase_release`.
**ontology_term**: `term_id` (FBbt, FBdv, MI, etc.), `label`, `ontology_version`.
**reagent**: `reagent_id`, `reagent_type`.
**antibody** (extends reagent): `rrid`, `registry_id`, `target_text_as_reported`, `target_fbgn` (nullable), `vendor_id`, `catalog_no_raw`, `catalog_no_norm`, `clone_id`, `host_species`, `clonality`, `immunogen_as_reported`, `source_kind` (commercial|DSHB|lab_made|gift|unknown).
**vendor**, **vendor_alias** (normalisation).
**experiment_context**: `ctx_id`, `application` (CV), `species`, `tissue_term`, `sex`, `stage_term`, `age_text`, `genotype_text` (raw) + `genotype_parsed` (optional, nullable).
**usage_observation**: `obs_id`, `pub_id`, `av_id`, `antibody_id`, `ctx_id`, `link_confidence`, `obs_status`.
**parameter_value**: `pv_id`, `obs_id`, `param_code`, `status` (reported|not_reported|ambiguous|conflicting|not_applicable), `value_text_raw`, `value_num`, `unit_raw`, `unit_norm`, `normalised_form`, `method` (rule:<id>|model:<id>@<ver>|manual), `confidence` (nullable; calibrated only if validated).
**evidence_span**: `ev_id`, `pv_id`/`obs_id`, `av_id`, `section`, `locator` (figure/table/legend/supplement/para index), `char_start`, `char_end`, `snippet` (nullable if tier>T0), `span_sha256`.
**verification_record**: `vr_id`, `target_table`, `target_id`, `reviewer_id` (pseudonymous), `outcome` (confirmed|corrected|rejected|unclear), `checked_against_av_id`, `timestamp`, `notes`.
**correction**: `corr_id`, `target`, `proposed_value`, `rationale`, `submitter_contact` (optional, not published), `status`, `decision_by`, `decision_at`.
**release**, **pipeline_run**: `git_commit`, `config_hash`, `model_ids`, `input_manifest_hash`, `flybase_release`, `registry_snapshot_date`, `counts`.

## 3. Parameter dictionary (antibody module, excerpt)
`dilution` (num: ratio denominator or concentration; `dilution_form`: ratio|mass_vol|molar), `incubation_time` (s), `incubation_temp` (°C), `protein_load` (µg; normalised from mg/µL etc.), `extraction_buffer` (text + optional named buffer e.g. RIPA, raw preserved), `mw_expected_kda`, `mw_observed_kda` (**separate**; each with `source_phrase`), `fixative` + `fix_time`, `blocking_agent`, `pos_control`, `neg_control`, `validation_claim_type` (CV: KO/null, RNAi, overexpression, peptide_block, secondary_only, other, none_reported). Full dictionary shipped as `data_dictionary.csv` (GOVERNANCE).

## 4. Unit normalisation
Preserve raw string always. Normalise to SI-adjacent units (s, °C, µg, µL, kDa). Ratio dilutions `1:500`, `1/500`, `1 in 500` → denominator 500 (`dilution_form=ratio`; note `1:500` vs "1:1:500" artefacts flagged). Ambiguous forms (e.g., "1:500–1:1000", "overnight", "RT") stored as range/raw with `status=ambiguous` rather than coerced.

## 5. Identifier resolution
Gene: exact synonym match → FBgn; multi-hit ⇒ ambiguous, never auto-picked. Antibody: RRID → registry record; catalogue + vendor alias → candidate; DSHB name → AB_ ID. Ontologies via versioned term tables. Resolution rules versioned; unresolved is a valid terminal state.

## 6. Duplicate detection
(1) Publication: DOI/PMCID/PMID cross-map; preprint↔published linked not merged. (2) Antibody: same RRID, or (vendor_alias+catalog_norm), or DSHB ID; fuzzy matches go to review queue. (3) Observation: same pub + antibody + application + context hash with identical dilution/location ⇒ merged; differing ⇒ separate (multiple observations per paper are expected).

## 7. Versioning and reproducibility
Immutable inputs (hashed) → deterministic pipeline (pinned deps, seeded) → release artefacts (SQLite, Parquet, CSV, JSON) with `release_manifest.json`. Semantic data versions (MAJOR schema break, MINOR new data, PATCH corrections); every record has `first_seen_release` / `superseded_in`. Same inputs + commit ⇒ byte-identical outputs (CI-tested).

## 8. Exports
Flat CSV (one row per observation, all fields + status columns), JSON-LD/JSON Lines with full provenance, optional schema.org `Dataset` metadata, RRID/Identifiers.org URIs. Export schema documented and versioned (JSON Schema).

## 9. Extensibility
New module = new `reagent` subtype + `param_code` set + CV list + extraction rules; the evidence/verification/correction layers are unchanged. (Primers: sequence, Tm, amplicon, efficiency; Diets: composition per L; etc.)
