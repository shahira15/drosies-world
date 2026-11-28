# Known limitations register (v0.4, 2026-11-28)
**Curriculum**
1. All 90 registered modules have lessons, but they are AI-drafted and NOT expert-reviewed; all 90 pass a deliberately low mechanical depth audit (>= 450 words, numbers, quiz, code, references; see Quality & Expert Review). 'Written' and 'passes the audit' do not mean complete, correct or sufficient.
2. The Cochrane Handbook v6 coverage audit uses chapter TITLES verified in Crossref; chapter content was not read and the chapter-to-module mapping is the author's judgement. Uncovered or thin: patient-reported outcomes (ch. 18), economic evidence (ch. 20), prospective meta-analysis (ch. 22).
3. Lesson claims: 72 tracked; 44 abstract-supported, 18 partial (title-level), 10 unverified; most cited papers were checked bibliographically only. No lesson, question or claim has human expert review.
4. Coding Lab runs code locally in a subprocess (not a security sandbox; not in-browser); R tutorials need Rscript + metafor. No video content.
**Statistics**
5. Benchmarked vs R/metafor 4.4.0, clubSandwich 0.5.10 and base R; not expert-validated. The field-standard packages netmeta, mada, bayesmeta, dosresmeta, metasens and `meta` could not be installed (CRAN needs a newer R): NMA, DTA and Bayesian meta-analysis are benchmarked against metafor `rma.mv` / independent integration only, and six external R workflows (validation/external_workflows/) have NEVER been executed by the developer.
6. NOT implemented (lesson + external workflow, or absent): dose-response meta-analysis, selection models, one-stage IPD GLMMs, binomial GLMM for rare events/proportions, Kaplan-Meier curve reconstruction, RMST, NMA inconsistency tests (node-splitting, design-by-treatment) and component NMA, HSROC/SROC, automatic shared-control covariance (V) construction, trial sequential analysis, lnCVR.
7. Trim-and-fill and PET/PEESE are sensitivity analyses with mandatory warnings; they are known to perform poorly under heterogeneity and with few studies. P-scores ignore certainty of evidence.
8. DTA reference table is synthetic; the first DTA benchmark attempt gave a boundary solution (rho = -1) and was replaced; boundary correlations are flagged by the code, not repaired.
**Workflow**
9. The end-to-end pipeline test uses fictional data and a labelled simulated verifier; it proves the software connects the stages and that independent recomputation agrees, not that a real review will be sound. Real reviews need real human verifiers.
10. Extraction: no automatic unit conversion; effect builder handles two-group continuous and 2x2 binary. Dependence is flagged and can be modelled with the advanced functions, but V matrices for shared controls must be supplied by you.
11. Screening: no blinding mode, no active-learning prioritisation, no AI-assisted screening. Fuzzy dedup not tuned on real exports; RIS/NBIB parsers cover common tags only.
12. Risk of bias: domain names only; official guidance must be used; NOS/JBI/CASP/MMAT not included; no signalling-question algorithms.
13. Manuscript Studio: no PDF export, citation-style formatting, collaborative editing, GRADE/SoF builder, journal comparison or peer-review response manager.
**Knowledge / network**
14. All resources, organisations, communities, conference/funding directories are CANDIDATES (unverified; costs, dates, eligibility not stated). Only a human running tools/verify_batch.py (or the app form) changes that. No fabricated users, collaborators, opportunities or activity exist; the personal networking dashboard is local and never sends anything.
15. No community features (profiles, matching, forums, messaging); see FUTURE_COMMUNITY_ARCHITECTURE.md.
**Learning**
16. Questions, drills, the 65-question final assessment and the 13-item capstone rubric are AI-drafted and not psychometrically validated; the 80%-in-every-section benchmark is arbitrary; the learning record is NOT a certificate and is not accredited.
**Platform**
17. Single local user; no authentication; SQLite unencrypted. axe-core audit of 28 views (desktop) found 1 minor issue in Streamlit's own file-uploader; NOT done: screen-reader, zoom/reflow, other browsers. Plotly charts lack text alternatives. CI workflow not yet run on GitHub.
