# Product Specification — MVP: Published *Drosophila* Antibody Usage

## 1. Product statement
A free, account-free web tool that answers: **"How has antibody X (or an antibody against gene Y) been used in published Drosophila work, and where exactly does the paper say so?"** It reports what papers state. It does **not** rate, rank or recommend antibodies.

## 2. Non-goals (MVP)
No accounts, profiles, social features, dashboards, antibody scoring, AI chat, primers/diets/behaviour (schema-ready only), or cross-organism coverage.

## 3. Users and jobs
- Bench researcher choosing/troubleshooting an antibody (dilution used by others, tissue, fixation).
- Reviewer/PI checking reporting completeness.
- Meta-researcher analysing reporting practice (via exports).

## 4. Search (all client-visible, single box + filters)
| Query type | Resolution |
|---|---|
| Gene symbol / synonym | FlyBase synonym table (build-time) → FBgn |
| FlyBase ID (FBgn…) | direct |
| Protein name | via gene/protein name synonyms; ambiguity shown as a disambiguation list, never silently merged |
| Catalogue number | normalised (strip spaces/hyphens/case) + vendor match |
| RRID (`RRID:AB_…` or `AB_…`) | direct |
| Manufacturer | vendor name normalisation table |
| Application | controlled vocabulary: WB, IF/IHC, IP/co-IP, ChIP, ELISA, FACS, other |
Filters: application, tissue (controlled), stage, sex, host, clonality, verification status, "has dilution", year, evidence licence tier.

## 5. Result record (one row = one *antibody-use observation* in one paper)
Every field has a **status**: `reported` | `not_reported` | `ambiguous` | `conflicting` | `not_applicable`. Values never inferred.

Fields (per request): target (as stated + resolved FBgn if confident); manufacturer; catalogue; RRID; host; clonality; application; *Drosophila* species; tissue; sex; developmental stage/age; genotype; sample preparation; extraction/lysis buffer; protein load; dilution (value + unit + dilution-form: ratio/µg/mL); incubation (time, temperature, diluent, blocking); **molecular weight: `expected_kda` (stated as expected/predicted/vendor) and `observed_kda` (stated as observed/band seen) as separate fields, never merged**; fixation/staining; positive control; negative control; reported specificity validation *(see §6)*; publication DOI/PMID/PMCID; exact source location (section, figure/table/legend/supplement, paragraph, char offsets, evidence snippet where tier permits); extraction method (`rule` | `model:<id>@<ver>` | `manual`); verification status; record version + provenance (pipeline commit, source hash, timestamps).

## 6. Usage vs. validation — hard rule
Two distinct record types, shown in separate columns and never conflated:
- **Usage observation:** "paper P used antibody A in application X at dilution D."
- **Specificity evidence (as reported):** a paper *states* a validation (e.g., "signal lost in RNAi", "knockout control", "peptide block") — displayed as a quoted claim with the control type, labelled **"reported by authors"**. The UI never shows "validated antibody." Words like "works", "good", "recommended" are not used.
A footnote on every page: *Usage in a publication does not demonstrate specificity.*

## 7. Results UI
- Table first (sortable), compact on mobile (card layout), keyboard accessible, WCAG 2.2 AA target.
- Each row expands to the evidence: snippet with highlighted extracted tokens, source link (DOI/PMC), location, licence, verification badge, record version.
- "Not reported" displayed explicitly (never a blank).
- Downloads: CSV and JSON for the current filtered view and full release; includes provenance columns and a data-release version.
- "Report a correction" link → GitHub issue template or email form (no account on our site).
- Permanent URLs for queries and records.

## 8. Verification states
`candidate` (machine) → `auto_checked` (span-string check passed, deterministic rules agree) → `human_verified` (≥ 1 reviewer confirmed against source) → `double_verified` (2 reviewers) ; plus `disputed`, `rejected`, `superseded`. Default UI view shows **human_verified + deterministic-high-confidence**, clearly badged; machine-only candidates hidden unless the user opts in. [A: exact default to be decided — Q-5]

## 9. Smallest scientifically useful implementation ("MVP-0")
Scope: **DSHB-catalogued *Drosophila* antibodies** (~290 products [V]) + RRID-bearing antibodies, in **T0-licence** OA papers only.
Extracted by deterministic rules only: antibody identity (RRID/catalogue/clone name), application (sentence keywords), dilution, host/clonality when stated, evidence snippet + location. Fields needing judgment (genotype, buffer, controls) are *left not_extracted* and linked to the evidence paragraph.
Success criteria: precision ≥ 0.95 on identity+dilution on a 100-paper benchmark; 100% of displayed values have a verifiable span; ≥ 5 independent fly labs complete a timed task faster than baseline.

## 10. Performance & accessibility targets [A]
First result < 1 s on mid-range phone over 3G-class link after initial load; initial JS ≤ 150 KB gz; works without JS for basic search (progressive enhancement) where feasible; no third-party trackers; downloads gzip.
