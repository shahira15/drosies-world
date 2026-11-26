# Decision Log

Status values: **Proposed** (by Claude, awaiting founder) · **Accepted** · **Rejected** · **Open**. Nothing is Accepted until the founder says so.

## Decisions (architectural / scope)
| ID | Date | Decision | Status | Rationale / link |
|---|---|---|---|---|
| D-1 | 2026-11-26 | Keep planning in `flymethods-planning/`; FlyMethods will need its own repo later | Proposed | Existing repo is unrelated site |
| D-2 | 2026-11-26 | Evidence tags [V]/[U]/[A]/[BLOCKED] in all docs | Proposed | Distinguish facts from assumptions |
| D-3 | 2026-11-26 | Re-scope to "evidence index of published Drosophila antibody usage"; consume Europe PMC/FlyBase/Registry rather than rebuild | Proposed | SCIENTIFIC_GAP |
| D-4 | 2026-11-26 | Seed MVP-0 with DSHB Drosophila antibodies + RRID-bearing antibodies | Proposed | Bounded, RRID-bearing, Drosophila-centric |
| D-5 | 2026-11-26 | Deterministic extraction is the default; AI optional, local, span-verified, never auto-verified | Proposed | EXTRACTION_PIPELINE |
| D-6 | 2026-11-26 | Static-first architecture (build-time pipeline, SQLite/CSV/JSON, client search) | Proposed | TECHNICAL_ARCHITECTURE |
| D-7 | 2026-11-26 | Licence-tier policy (T0–T3), fail-closed | Proposed | DATA_SOURCES §2 |
| D-8 | 2026-11-26 | Usage and reported-validation are separate; no scores/rankings/recommendations | Proposed | PRODUCT_SPEC §6 |
| D-9 | 2026-11-26 | Expected vs observed MW always separate fields | Proposed | founder requirement |
| D-10 | 2026-11-26 | Gated roadmap with Phase 0 feasibility closure before any build | Proposed | DEVELOPMENT_ROADMAP |
| D-11 | 2026-11-26 | Planning files pushed only to the designated dev branch (`claude/stoic-thompson-vnn9i0`) per the environment stop-hook; no new repo, no PR, no deployment, no Pages/default-branch merge without founder approval | Accepted (hook instruction) | Branch push is not public release; confirm repo visibility (Q-16) |

## Assumptions
A-1 Drosophila papers report enough antibody detail for a useful index (untested → H1). A-2 A T0-licence corpus is large enough (untested → H5). A-3 Facts extracted from text are lower legal risk than quotes (not relied upon; see tier policy). A-4 Static search scales to MVP-0 data volume. A-5 DSHB would permit/partner on catalogue use. A-6 Founder + one independent annotator available for the benchmark.

## Unresolved questions
| ID | Question | Needed from |
|---|---|---|
| Q-1 | Approve Phase 0 and the re-scoped MVP-0? | Founder |
| Q-2 | Can the environment's network allowlist be extended (e.g., `www.ebi.ac.uk`, `flybase.org`, `antibodyregistry.org`, `api.crossref.org`, `api.openalex.org`) for read-only API checks — or will you run the counting queries locally? | Founder |
| Q-3 | Confirm/modify go/no-go thresholds in SCIENTIFIC_GAP & VALIDATION_PLAN | Founder |
| Q-4 | Who is the independent second annotator and which external labs/countries for beta? | Founder |
| Q-5 | Default UI visibility of machine-only candidates (hidden vs opt-in) | Founder |
| Q-6 | Contact FlyBase / Antibody Registry / DSHB for licence clarity — who sends (project vs founder's institution)? | Founder |
| Q-7 | WASM-SQLite vs sharded JSON | Prototype |
| Q-8 | JS framework choice | Prototype |
| Q-9 | Hosting target | Founder |
| Q-10 | Primary text route (PMC bulk vs Europe PMC API), pending PMC FTP status | Phase 0 |
| Q-11 | Code licence (Apache-2.0 vs MIT) | Founder |
| Q-12 | Dataset licence (CC BY 4.0 vs CC0) | Legal advice |
| Q-13 | Name availability/trademark for "FlyMethods" | Phase 0.5 |
| Q-14 | Institutional context: PhD institution IP/data policy implications for open-source release | Founder |
| Q-L1…L8 | Licensing questions | DATA_SOURCES §3b |
| Q-15 | Funding/ownership model (individual, lab, nonprofit) | Founder |
| Q-16 | Is `shahira15/drosies-world` public? If so, the planning docs on this branch are publicly readable; keep them there or move FlyMethods to its own (private until approved) repo? | Founder |

## Verification debt (claims to re-check at primary source)
FlyBase terms; Antibody Registry terms and CC scope; OpenAlex budget units/licence; Europe PMC rate limits; PMC FTP status post Aug 2026; protocols.io API terms; DSHB terms; Crossref metadata licence wording; Fly Board / CAG survey contents; journal policies for software publication.
