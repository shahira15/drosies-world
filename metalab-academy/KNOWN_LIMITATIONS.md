# Known limitations register (v0.2, 2026-11-26)
**Curriculum**
1. 12 of 88 registered modules have lessons (AI-drafted, NOT expert-reviewed). 76 are outlines. Core first-researcher pathway: 12 of its 13 modules have lessons (Module 15, screening, does not yet).
2. Curriculum coverage audit is against the chapter structure of handbooks *as recalled*, not re-read.
3. Lesson claims: 30 tracked; 6 unverified (RoB domain lists, evidence-based-research claim); most others verified at abstract/title level only. Cochrane Handbook, JBI Manual, GRADE guidance not re-read.
4. Coding Lab runs code locally in a subprocess (not a security sandbox; not in-browser); R tutorials need Rscript + metafor. No video content.
**Statistics**
5. Benchmarked vs R/metafor 4.4.0 (not expert-validated). `meta` package could not be installed (cross-check missing). Methods implemented: effect sizes (MD, SMD, lnRR, lnOR, lnRR-binary, RD, Fisher z), common/random-effects (REML, DL, PM, HKSJ), PI, Q/I²/H², leave-one-out, subgroup, meta-regression.
6. NOT implemented: hazard-ratio effect-size helpers beyond log-scale CI conversion, medians→mean estimators, GLMM/Bayesian/network/DTA/dose-response, trim-and-fill/selection models/PET-PEESE, CR2 robust variance, shared-control covariance matrices, trial sequential analysis, certainty tools, sample-size calculators. (MH, Peto, Egger/Begg, cumulative, Q-profile CI, influence, three-level REML+CR1, IRR, prevalence, design effect ARE implemented and benchmarked.)
7. Riley t(k-2) prediction interval checked against our own formula (not independent software).
**Workflow**
8. Extraction: no automatic unit conversion; effect builder handles two-group continuous and 2x2 binary only. Dependence is flagged, not modelled.
9. Screening: no blinding mode, no active-learning prioritisation, no AI-assisted screening. Fuzzy dedup not tuned on real exports; RIS/NBIB parsers cover common tags only.
10. PRISMA: simplified template, SVG only; 'reports not retrieved' not tracked; records/reports/studies linked only via the Extraction tab.
11. Risk of bias: domain names only; official guidance must be used; NOS/JBI/CASP/MMAT/other tools not included; no signalling-question algorithms.
12. Manuscript Studio exists (tokens, verification, QC, exports) but: no PDF export, no citation-style formatting, no collaborative editing; no journal-comparison workspace, peer-review response manager or GRADE/SoF table builder yet.
**Knowledge / network**
13. Resources: links NOT verified (1 URL checked; sandbox blocks hosts); costs/versions/licences not verified; no videos, courses, conferences, funding, fellowships, summer schools, workshops listed (none verified, none invented). No university centres, librarians, consultation services or mentorship programmes listed.
14. No community features (profiles, matching, forums, messaging, journal clubs); local contact manager only.
**Platform**
15. Single local user; no authentication; SQLite unencrypted; no security or accessibility audit; Plotly charts lack alt text; CI workflow untested on GitHub; no PNG/PDF figure export; no mobile testing beyond one screenshot.
16. Diagnostic quiz and pathway recommendations are rule-based, not psychometrically validated. SM-2 scheduling is a heuristic.
