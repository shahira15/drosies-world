# Scientific Gap Analysis

## Proposed gap (founder)
A free, evidence-backed search engine for *how* antibodies (later: primers, reagents, procedures) are actually used in published *Drosophila* work: dilution, buffer, tissue, stage, application, controls, with exact source location.

## Verdict: **plausible and partially supported; not yet proven. Re-scope before building.**

### What the evidence supports
1. **Article↔reagent identification is being solved by others.** Europe PMC now exposes SciCrunch RRIDs per article via search, SciLite and the Annotations API (May 2026) [V: https://www.rrids.org/news/2026/5/21/from-text-to-traceability-rrid-integration-in-europe-pmc]. Building our own RRID detector as the headline feature would duplicate this. We should **consume, not rebuild**, it where licences permit.
2. **Fly-specific guidance is link-based.** FlyBase's antibody page points to vendors, review sites and search tools rather than hosting per-use experimental parameters [V: https://wiki.flybase.org/wiki/FlyBase:Antibodies].
3. **Community reviews exist but are small-scale/crowdsourced** (pAbmAbs) [V], size/currency unknown.
4. **Research literature shows antibody-specificity extraction is feasible** (Antibody Watch) [V: https://arxiv.org/pdf/2008.01937] but targets specificity flags, not Drosophila usage parameters.
5. **Dedicated Drosophila resource: DSHB** lists ~290 Drosophila products with registry IDs [V] but not structured per-paper usage conditions (on the pages seen).

### What is NOT established
- That researchers lack adequate tools — **no survey documenting antibody-method needs was found.** Fly Board / FlyBase surveys exist [V] but were not read; none surfaced as antibody-specific. The founder's firsthand experience is valid evidence of a hypothesis, not a measurement.
- That papers report enough detail. Unmeasured. Many fly papers describe antibodies in prose, reference "as described in", or cite lab-made reagents [U]. **The proportion of Drosophila papers reporting catalogue number + dilution is the single most important unknown.** (Planned: Europe PMC counting query, blocked this session.)
- That commercial tools (BenchSci, CiteAb) don't already cover this for fly. Their internals are not public; we cannot claim absence.
- Whether a legally redistributable corpus is large enough. Only a subset of Europe PMC/PMC is reusable [V: https://groups.google.com/a/ebi.ac.uk/g/epmc-webservices/c/sdxUbcGLTGg, https://pmc.ncbi.nlm.nih.gov/tools/textmining/].

## Recommended modifications
1. **Reposition from "search engine for methods" to "evidence index of published Drosophila antibody usage"** — a transparent, verifiable table, not a recommender. Avoid implying efficacy/specificity.
2. **Seed with DSHB Drosophila antibodies** (closed, RRID-bearing, ~290 items [V]) then expand to RRID-bearing commercial antibodies. This bounds scope and enables benchmark construction.
3. **Layer on existing infrastructure**: FlyBase for genes/synonyms, Europe PMC annotations (if licence-compatible) for RRID candidates, Antibody Registry for identity. Our unique value = *parameters with exact evidence spans, normalized, filterable, exportable*.
4. **Make "not reported" a first-class result.** Possibly the most useful finding for the community: quantified reporting gaps (a publishable meta-research outcome in itself).
5. **Gate the project on a measured go/no-go** (ROADMAP Phase 0): (a) prevalence of reported parameters, (b) redistributable corpus size, (c) pilot-extraction precision, (d) a short founder-led needs survey (≥ 50 respondents across ≥ 10 countries, via Fly Board channels *with their permission*).

## Falsifiable gap hypotheses

| ID | Hypothesis | Test | Kill/revise threshold [A] |
|---|---|---|---|
| H1 | ≥ 30% of OA Drosophila papers using antibodies report vendor+catalogue or RRID | Europe PMC query + 200-paper manual audit | < 10% → pivot to "reporting-gap atlas" |
| H2 | Deterministic extraction reaches ≥ 0.90 precision on dilution & catalogue | VALIDATION_PLAN pilot | < 0.80 → human-in-loop heavy |
| H3 | Fly researchers spend meaningful time on this search | Survey + timed task | Median < 5 min/week → deprioritise |
| H4 | Existing tools don't answer a fixed query set for fly | Structured comparison of 30 realistic queries | Competitor answers ≥ 70% fully → narrow value prop |
| H5 | Reusable-licence corpus covers a useful share of fly antibody papers | Licence-stratified count | < 20% of target papers → "pointer-only" index |

Thresholds are placeholders for the founder to confirm (DECISION_LOG Q-3).
