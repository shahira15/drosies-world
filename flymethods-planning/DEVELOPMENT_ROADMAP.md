# Development Roadmap (gated)

No phase starts without the preceding gate passing and **founder approval**. Durations are rough effort estimates for a small part-time team [A], not commitments.

## Phase 0 — Feasibility closure (2–4 weeks) — *needs your approval to start*
0.1 Unblock primary-API checks (Europe PMC, FlyBase, Antibody Registry/SciCrunch pages): requires network access to `www.ebi.ac.uk` etc. (currently 403 in this session) or you run the queries locally.
0.2 Measure H1/H5: counts of Drosophila OA papers by licence tier; 200-paper manual audit of reported catalogue/RRID/dilution prevalence.
0.3 Written licence clarifications: FlyBase, Antibody Registry/SciCrunch, DSHB (see DATA_SOURCES §3b). Institutional librarian/legal review of the tier policy.
0.4 Needs survey (≥ 50 respondents; ethics determination first; via Fly Board/community channels only with their permission).
0.5 Name/trademark/prior-art check for "FlyMethods" (not done), GitHub/Zenodo/bioRxiv/journal prior-art search, discontinued-project search.
0.6 30-query competitor comparison (COMPETITOR_MATRIX).
**Gate G0:** H1, H5 pass thresholds or documented re-scope; licences clear for T0 workflow; survey supports need; no equivalent open tool found. Else pivot (e.g., reporting-gap atlas / link-out index).

## Phase 1 — Benchmark & guidelines (4–6 weeks)
Annotation guidelines v1, pilot 50 papers, agreement study, dev set. **Gate G1:** κ ≥ 0.8 on core fields.

## Phase 2 — Deterministic extractor MVP-0 (6–8 weeks)
Pipeline stages 0–8 for DSHB+RRID antibodies in T0 papers; span verifier; review queue; locked-test evaluation. **Gate G2:** precision ≥ 0.95 identity+dilution; 0 unsupported values in verified set.

## Phase 3 — Static search site, private beta (4–6 weeks)
Search + evidence table + CSV/JSON + corrections link; accessibility audit; performance budget. Private link to ≤ 10 invited labs (**no public deployment without approval**). **Gate G3:** usability tasks pass; SUS ≥ 70 [A].

## Phase 4 — Public beta and independent validation (8–12 weeks)
Public deployment (approval required), international beta (≥ 3 countries), independent annotation, timed study, comparison study, Zenodo release v0.1 with DOI. **Gate G4:** validation targets met; governance live.

## Phase 5 — Expansion (ongoing)
Broader antibody coverage (commercial/lab-made), Key-Resource-Table parser, optional biomedical-NER model, supplementary-file policy, then module 2 (e.g., qPCR primers — high regularity of sequences). Each module repeats G1–G4.

## Phase 6 — Publication
Preprint then research-software/database journal (see GOVERNANCE §9). Meta-research paper on reporting completeness is a possible separate output.

## Smallest scientifically useful implementation
**MVP-0** (PRODUCT_SPECIFICATION §9): DSHB-Drosophila + RRID antibodies × T0 OA papers × deterministic extraction of identity, application, dilution (+host/clonality) with evidence spans, human-verified subset, static search, CSV/JSON. It already delivers: "show me every published dilution and its source sentence for antibody X," and a first quantification of reporting gaps.

## Dependencies on you (founder)
Scientific lead for annotation; recruit second annotator and external labs; approve gates; sign off licences/decisions; provide domain vocabulary (application, tissue, buffer names); decide funding/hosting.
