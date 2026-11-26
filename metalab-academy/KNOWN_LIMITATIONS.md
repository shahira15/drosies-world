# Known limitations register
1. **3 of 84 modules** have lessons; the rest are outlines. Lessons are AI-drafted, not expert-reviewed.
2. Statistics are **benchmarked** against R/metafor 4.4.0 (not 'scientifically validated': no expert review; `meta` package could not be installed here). See VALIDATION.md.
3. Only generic meta-analysis (inverse variance; DL/PM/REML; HKSJ). No MH/Peto, multilevel, RVE, Bayesian, network, DTA, dose-response, publication-bias tests.
4. Effect-size calculators cover MD, SMD, lnRR, lnRR(binary), lnOR, RD, Fisher z, SD/SE/CI, group combination. No HR, IRR, median→mean, test-statistic conversions, ICC/cluster adjustment, shared-control adjustment.
5. Deduplication is exact-match only (DOI, PMID, normalised title+year). No fuzzy matching.
6. Screening: single-user; kappa, blinding, prioritisation not implemented. Multi-reviewer = reviewer labels in one local database.
7. PRISMA: counts only; no diagram; records/reports/studies not distinguished.
8. Extraction forms, risk-of-bias tools, manuscript studio, journal tools, calculators for sample size: not built.
9. Resource/organisation links unverified; no databases/software/opportunities directories.
10. No authentication, community, messaging, matching, AI assistant (all need external infrastructure).
11. Accessibility, security and mobile layout not audited. Single local SQLite file, unencrypted.
12. Diagnostic quiz is not psychometrically validated; pathway recommendation is rule-based and coarse.
13. Parser coverage for RIS/NBIB is limited to common tags; real exports from Embase/WoS/Scopus untested.
