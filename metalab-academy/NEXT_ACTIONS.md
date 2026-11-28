# Next actions (after v0.4.0)
**You (learner), now:** `./run.sh` -> Home -> Onboarding -> Method Wizard -> Learning Academy -> *My pathway* -> Lessons 3, 4, 5 -> Practice (drills, final assessment) -> Virtual Lab -> Research Workspace > *Readiness & traceability* (run the fictional end-to-end review once) -> create your real project -> First Paper Plan -> Topic Explorer. You can start your real review without finishing anything else.
**Needs YOUR action/decision (only these):**
1. Choose the topic after Milestone 3 (never chosen for you).
2. On your Mac run `./validation/run_validation.sh` (R reference + all benchmarks), then **run the six scripts in `validation/external_workflows/`** (netmeta, mada, bayesmeta, dosresmeta, selection models, lme4 one-stage IPD) which the developer could not execute, and report mismatches.
3. Verify Knowledge-Universe candidates yourself: `python3 tools/check_links.py` then `python3 tools/verify_batch.py run --verifier "human:Your Name"` (see KNOWLEDGE_VERIFICATION.md). Nothing is verified until you do.
4. Send **one area package** (Quality & Expert Review > Expert review packages, or the ZIP) to a suitable expert per area; nothing is expert-reviewed yet.
5. Licence choice (LICENSE_DECISION.md); public deployment, registration, submission, contacting anyone remain yours.
**Development queue (independent work):**
- **Deepen lessons further after expert feedback**: the mechanical audit is passed by all 90, but the shortest (check word counts in Quality & Expert Review) remain brief; expert reviewers will say where depth is really missing.
- Statistics: node-splitting/design-by-treatment inconsistency tests, HSROC, shared-control V-matrix builder, selection models, GLMM rare-event, Guyot reconstruction (all currently external-only); cross-check against `meta`, `netmeta`, `mada`, `bayesmeta` once installable.
- Handbook chapters with no module: 18 (patient-reported outcomes), 20 (economic evidence), 22 (prospective meta-analysis).
- Manuscript Studio: PDF export, citation styles, GRADE/SoF builder, journal comparison, peer-review response workspace.
- UI: manual screen-reader/zoom audit; alt text for Plotly charts.
- Education/public-health topic scans need ERIC/Scopus/Web of Science access.
- Community features (accounts, moderation, hosting) only after the curriculum and research tooling are expert-reviewed and the owner approves (FUTURE_COMMUNITY_ARCHITECTURE.md).
