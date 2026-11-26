"""Risk-of-bias / appraisal tool registry.
Only DOMAIN NAMES are stored (as published in each tool's paper). Signalling questions, algorithms and guidance
belong to the official tool documents: use them (check licences) - MetaLab is a recorder + visualiser, NOT a
substitute for the official guidance. Reporting guidelines (ARRIVE, CONSORT) are NOT risk-of-bias tools."""
TOOLS = {
 "SYRCLE": dict(name="SYRCLE risk of bias tool", design="Animal intervention studies (controlled)", ref="hooijmans2014",
   judgements=["low", "high", "unclear"],
   domains=["Sequence generation", "Baseline characteristics", "Allocation concealment", "Random housing", "Blinding (caregivers/investigators)",
            "Random outcome assessment", "Blinding (outcome assessor)", "Incomplete outcome data", "Selective outcome reporting", "Other sources of bias"],
   note="Designed for animal intervention studies; check applicability for invertebrate (e.g. Drosophila) experiments - several items (housing, caregivers) map differently to vials/cages. Document how you interpreted each item."),
 "ROB2": dict(name="Cochrane RoB 2 (randomised trials)", design="Randomised trials", ref="sterne2019rob2",
   judgements=["low", "some concerns", "high"],
   domains=["Randomisation process", "Deviations from intended interventions", "Missing outcome data", "Measurement of the outcome", "Selection of the reported result"],
   note="Outcome/result-specific. Official tool, guidance and algorithm required."),
 "ROBINSI": dict(name="ROBINS-I (non-randomised studies of interventions)", design="Non-randomised intervention studies", ref="sterne2016robinsi",
   judgements=["low", "moderate", "serious", "critical", "no information"],
   domains=["Confounding", "Selection of participants", "Classification of interventions", "Deviations from intended interventions", "Missing data", "Measurement of outcomes", "Selection of the reported result"],
   note="Requires specifying target trial and confounders; official guidance required."),
 "QUADAS2": dict(name="QUADAS-2 (diagnostic accuracy)", design="Diagnostic accuracy studies", ref="whiting2011",
   judgements=["low", "high", "unclear"],
   domains=["Patient selection", "Index test", "Reference standard", "Flow and timing"],
   note="Applicability concerns are assessed separately in the official tool."),
 "CUSTOM": dict(name="Custom domains (YOU define; justify and pre-specify)", design="Any (e.g. ecological, in vitro, education)", ref=None,
   judgements=["low", "unclear", "high"], domains=["Domain 1", "Domain 2", "Domain 3"],
   note="No validated tool is implied. Pre-specify domains in the protocol; cite the framework you adapt (e.g. CEE guidance for environmental evidence)."),
}
NOT_RISK_OF_BIAS_TOOLS = ["ARRIVE (reporting guideline)", "CONSORT (reporting guideline)", "PRISMA (reporting guideline)"]
