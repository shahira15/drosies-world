# Competitor / Adjacent-Tool Matrix

Cells: **Y** = documented in a source seen this session · **N?** = not seen in sources (NOT a claim of absence) · **?** = unknown. Only public, documented capabilities are listed. Commercial internals are unknown.

| Capability | FlyBase | DSHB | Antibody Registry | CiteAb | pAbmAbs | BenchSci | Europe PMC (RRID/SciLite) | SciScore | Antibody Watch | protocols.io | **FlyMethods (goal)** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Drosophila-centred | Y | Y (Drosophila collection) | N? | ? | ? | ? | N (all biomed) | N | N | partial | **Y** |
| Gene/FBgn/synonym search | Y | gene field on entries | ? | ? | ? | ? | ? | N? | N? | N? | **Y** |
| Antibody catalogue/ID | links | Y (AB_ IDs) | Y (RRID) | Y | reviews carry catalogue | ? | via RRID annotations | detects | via RRID | N | **Y (from sources)** |
| Per-paper usage parameters (dilution etc.) | N? | N? | N? | ? | partial (reviewer-entered dilution/assay) | ? | N? | N? | N | protocol-level | **Y (core)** |
| Exact evidence span shown | N? | N? | N? | ? | N | ? | Y (annotation in text) | ? | ? | n/a | **Y (required)** |
| Specificity-issue detection | N? | N? | N? | ? | via reviews | ? | N? | rigor flags | **Y** | N | out of scope (link out) |
| Open API / bulk | Y (bulk files) | ? | via SciCrunch only | restricted terms | ? | ? | Y | ? | ? | ? | **planned open exports** |
| Free, no account | Y | Y browsing | Y browsing | free tier + registration [U] | Y | ? | Y | for authors? | research | Y | **Y** |
| Open source code | partial [U] | N? | ? | N | ? | N | partial [U] | N | research code? | ? | **Y** |

Sources: FlyBase [V https://wiki.flybase.org/wiki/FlyBase:Antibodies]; DSHB [V https://dshb.biology.uiowa.edu/collections/drosophila-antigens]; Antibody Registry [V https://antibodyregistry.org/faq]; CiteAb [V https://citeab.com/terms]; pAbmAbs [V Aarhus newsroom link in LANDSCAPE_AUDIT]; Europe PMC RRID [V rrids.org 2026 post]; SciScore [V PMC7644557]; Antibody Watch [V arXiv 2008.01937]; protocols.io [V code of conduct].

## Reading the matrix
- No single seen tool is documented to combine **fly-focus + normalized per-paper parameters + exact evidence spans + open export**. This is a *within-sources* observation, not proof.
- pAbmAbs is the closest in spirit (user-submitted usage conditions) but is crowd-sourced, not literature-extracted [V/partial].
- Europe PMC is a **dependency/partner**, not a competitor.

## Discontinued / defunct projects
Not yet investigated. Candidate search list for Phase 0: antibody-validation portals, Drosophila "reagent" portals, methods-text-mining prototypes in Bioinformatics/Database journals, GitHub repos tagged `rrid`, `antibody`, `drosophila`. Result goes into DECISION_LOG.

## Required follow-up
30-query head-to-head benchmark (H4 in SCIENTIFIC_GAP) executed by founder, results recorded verbatim, ideally also by one external lab, to replace the "N?" cells with evidence.
