# Validation Plan

## 1. Questions we must answer with data
V1 Does extraction work (accuracy)? V2 Are displayed values traceable (attribution)? V3 Does the AI/rule layer ever fabricate (hallucination)? V4 Is the product useful and faster than status quo (usability/time)? V5 Is it reproducible and adopted?

## 2. Benchmark dataset (manually annotated)

**Corpus.** Stratified sample of T0-licence OA Drosophila papers (so snippets can be released). Strata: year (pre-2015 / 2015–2020 / 2021+), application (WB, IF, IP, ChIP, mixed), journal family/format (STAR-Methods-like key resource tables vs prose methods), antibody source (DSHB, commercial, lab-made), and deliberately seeded **hard cases** (§5).
**Size [A, to confirm]:** pilot 50 papers → development 150 → locked test 150 (test set never used for rule tuning or prompt tuning). Rationale: with ~150 test papers × several observations each, per-field metrics get usable confidence intervals; we report bootstrap 95% CIs rather than claim a size is sufficient.
**Annotation.** Guidelines v1 written first (field definitions, "not reported" rules, multi-antibody linking). Two independent annotators (founder = scientific lead + one independent fly biologist from another lab/country), blinded to system output; third adjudicator for disagreements. Report inter-annotator agreement (Cohen's κ per field + raw agreement) *before* using the data as gold. Annotation tool records span offsets. Annotators also label `not_reported` explicitly.
**Release.** Benchmark published (CC BY-compatible; only T0 text) with guidelines, so others can reproduce.

## 3. Metrics

Unit of evaluation: (observation, field). Matching rule declared per field (exact / normalised-equal / numeric-tolerance).

| Metric | Definition |
|---|---|
| Field precision | correct reported values ÷ all values the system reports |
| Field recall | correct reported values ÷ gold reported values |
| F1 | harmonic mean, per field and macro/micro |
| Strict vs lenient | strict = value+normalisation exact; lenient = value equal, normalisation tolerated |
| `not_reported` accuracy | system says not_reported when gold says not_reported (and vice versa); critical for "never infer" |
| Observation linking accuracy | parameter assigned to correct antibody-use |
| **Source attribution accuracy** | proportion of reported values whose cited span (a) exists in the article version and (b) supports the value per an annotator |
| **Hallucination rate** | proportion of reported values with **no support anywhere in the source article** (strictly unsupported) — reported separately from *wrong-but-supported* errors (misattribution/misparse). **Release gate: 0 unsupported values in the verified set; < 1% in any shown candidate set** [A] |
| Calibration | reliability curve of any reported confidence; if poorly calibrated, confidence is not shown |
| Throughput | human verification seconds per record (to plan curation cost) |

Report by stratum, not only overall; report CIs; publish confusion examples.

## 4. Baselines and ablations
B0 regex rules; B1 rules+NER; B2 + LLM proposal with verifier; B3 LLM only (negative control: expected to show hallucination). Compare on the locked test set. Choose pipeline by precision/hallucination first, recall second.

## 5. Required difficult-case suites (each ≥ 20 items)
supplementary-only methods; antibody synonyms/clone names; multiple antibodies and multiple applications in one paper; ambiguous/range dilutions; text-vs-table conflicts; "as described previously" deferrals; lab-made/gifted reagents; non-Drosophila antibodies in fly papers; missing-information papers; OCR-free figure-only data.

## 6. Verification in production
- Span check automatic (100% of records).
- Human verification sampling: all records shown as verified have ≥ 1 reviewer; ongoing audit of 5% random sample of verified records by a different reviewer → published error rate per release [A].
- Community corrections handled as in GOVERNANCE; every correction is logged and fed to regression tests.

## 7. Independent scientific validation
External fly labs (≥ 3 countries) annotate 20 papers each and judge 50 records each (blinded to origin) → inter-lab agreement. Preregister protocol (OSF/Zenodo) before running.

## 8. Comparison with existing tools
30-query task set (gene, catalogue, RRID, application questions) answered by FlyMethods vs FlyBase links, DSHB, Antibody Registry, CiteAb, BenchSci, Europe PMC search — only through tools' public free interfaces and within their terms; record time-to-answer and completeness of the fields. No claims about competitors beyond observed outputs.

## 9. Usability and time-saving studies
Within-subject timed tasks (n ≥ 20 researchers, mixed career stages and countries): "find a WB dilution & lysis buffer used for antibody X in fly heads" with FlyMethods vs researcher's usual method; outcomes: time, success, confidence, SUS (System Usability Scale). Mobile and low-bandwidth arm. Accessibility audit (axe + manual screen-reader pass). Ethics: institutional review determination before recruiting; no personal data stored beyond consented study data.

## 10. Reproducibility assessment
Third party rebuilds a release from manifest and obtains identical hashes; report differences. Annual re-run to measure link-rot and licence changes.

## 11. Adoption and citation tracking
Release DOIs (Zenodo), CITATION.cff, tracked via Crossref/OpenAlex/Europe PMC citation APIs and GitHub stars/forks/issues-from-externals; counted contributors from ≥ N labs/countries; privacy-preserving aggregate (cookie-free) usage counts.

## 12. Stop/go criteria
MVP public beta only if: lock-test precision ≥ 0.95 for antibody identity and dilution; hallucination (unsupported) = 0 in verified set; attribution accuracy ≥ 0.98; κ ≥ 0.8 for core fields [A, thresholds to be confirmed by founder — Q-3].
