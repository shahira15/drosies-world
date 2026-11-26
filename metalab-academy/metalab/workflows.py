"""Review-type workflow templates: forms, appraisal tools, effect measures, guideline. Different review types get
different workflows - not one intervention-meta-analysis template for everything."""
def F(name, typ="number", unit="", required=False, help=""): return dict(name=name, type=typ, unit=unit, required=required, help=help)
GROUP = lambda g: [F(f"{g}_n", "number", "count", True, "number of experimental units (vial/cage/plot/participant) - state which"),
                   F(f"{g}_mean", "number", "", True), F(f"{g}_sd", "number", "", True, "SD, NOT SE; if SE reported record it in notes and convert")]
COMMON = [F("citation_label", "text", "", True), F("design", "choice", "", True, "e.g. RCT, controlled lab experiment, cohort"), F("funding_coi", "text"),
          F("experimental_unit", "choice", "", True, "individual / vial-cage / plot / classroom / other"), F("control_group_id", "text", "", False, "same id = shared control (dependence!)"),
          F("outcome_definition", "text", "", True), F("timepoint", "text"), F("outcome_unit", "text", "", True)]
WORKFLOWS = {
 "preclinical": dict(label="Preclinical / animal / model organism (e.g. Drosophila lifespan)", effect_measures=["SMD (Hedges g)", "lnRR (ratio-scale outcomes)", "log hazard ratio (survival)"],
   rob=["SYRCLE", "CUSTOM"], guideline="PRISMA 2020 (+ SYRCLE/ARRIVE awareness for appraisal/reporting)",
   fields=COMMON + [F("species_strain_genotype", "text", "", True), F("sex", "choice", "", True), F("age_at_start", "text"), F("diet_housing", "text"), F("dose_duration", "text")] + GROUP("treat") + GROUP("ctrl"),
   warnings=["Experimental unit is often the vial/cage, not the animal: extract replication level.", "Survival outcomes: record whether median/mean/curves; reconstructed data need uncertainty labels.", "Multiple sexes/genotypes sharing a control -> dependent effect sizes."]),
 "clinical": dict(label="Clinical intervention (RCT-based)", effect_measures=["Risk ratio / odds ratio / risk difference", "Mean difference / SMD", "Hazard ratio"],
   rob=["ROB2", "ROBINSI"], guideline="PRISMA 2020", fields=COMMON + [F("population", "text", "", True), F("intervention", "text", "", True), F("comparator", "text", "", True),
   F("events_treat", "number", "count"), F("n_treat", "number", "count"), F("events_ctrl", "number", "count"), F("n_ctrl", "number", "count")] + GROUP("treat") + GROUP("ctrl"),
   warnings=["Prefer intention-to-treat data; record analysis population.", "Zero cells: record, do not silently correct.", "Multi-arm trials: avoid double-counting the control."]),
 "observational": dict(label="Observational (cohort / case-control / cross-sectional)", effect_measures=["Adjusted OR/RR/HR (log scale)", "Correlations (Fisher z)"],
   rob=["ROBINSI", "CUSTOM"], guideline="PRISMA 2020 + MOOSE", fields=COMMON + [F("exposure", "text", "", True), F("adjusted_estimate", "number"), F("ci_lower", "number"), F("ci_upper", "number"), F("adjustment_set", "text", "", True)],
   warnings=["Adjusted and unadjusted estimates must not be mixed unplanned.", "Overlapping cohorts across reports."]),
 "ecological": dict(label="Ecological / environmental meta-analysis", effect_measures=["lnRR", "SMD", "Zr"], rob=["CUSTOM"], guideline="PRISMA 2020 / ROSES (verified reference in registry); CEE guidance",
   fields=COMMON + [F("species", "text", "", True), F("site_lat_lon", "text"), F("system", "choice"), F("phylogeny_id", "text", "", False, "needed for phylogenetic non-independence")] + GROUP("treat") + GROUP("ctrl"),
   warnings=["Multiple effect sizes per study/site/species: multilevel models needed (not yet taught).", "Phylogenetic and spatial non-independence."]),
 "qualitative": dict(label="Qualitative evidence synthesis", effect_measures=["None (thematic/framework synthesis)"], rob=["CUSTOM"], guideline="ENTREQ (+ eMERGe for meta-ethnography)",
   fields=[F("citation_label", "text", "", True), F("setting_context", "text", "", True), F("participants", "text"), F("methodology", "text"), F("themes_or_findings", "text", "", True), F("illustrative_quotes", "text"), F("reflexivity_notes", "text")],
   warnings=["No effect sizes; do not force quantitative extraction.", "Record reviewer reflexivity."]),
 "scoping": dict(label="Scoping review / evidence map", effect_measures=["None (charting)"], rob=[], guideline="PRISMA-ScR",
   fields=[F("citation_label", "text", "", True), F("population_concept_context", "text", "", True), F("study_design", "text"), F("evidence_type", "choice"), F("key_findings_charted", "text"), F("gaps_noted", "text")],
   warnings=["Appraisal is optional in scoping reviews; state your choice in the protocol."]),
}
