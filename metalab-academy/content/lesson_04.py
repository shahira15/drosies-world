LESSON = dict(
 id=4, title="Formulating a research question for a review (PICO, PECO and friends)",
 time_min=80, version="0.1.0", status="AI-drafted; awaiting qualified human expert review",
 content_type="Established guidance with educational simplifications",
 last_verified="2026-11-26 (Schardt 2007 verified in PubMed; framework definitions from standard methods texts - not re-read this session)",
 prerequisites=["Module 3 (review types)."],
 objectives=["Choose a framework (PICO, PICOS, PECO, PCC, SPIDER) that fits the question type.",
  "Define each element precisely enough that two reviewers would screen identically.",
  "Distinguish primary from secondary outcomes and pre-specify them.",
  "Write a question in a form that can be searched, screened and extracted."],
 why="Every later step - search, eligibility, extraction, analysis - is derived from the question. A vague question guarantees disagreeing screeners, unfocused searches and unplanned analyses (a route to outcome switching).",
 plain="""A good review question names **who/what** is studied, **what is done or exposed**, **compared to what**, and **what is measured**.
- **PICO**: Population, Intervention, Comparator, Outcome - for intervention questions.
- **PICOS / PICOT**: adds Study design or Time.
- **PECO**: Exposure instead of Intervention - for environmental, etiological or observational questions where nobody assigns the exposure.
- **PCC**: Population, Concept, Context - for scoping reviews.
- **SPIDER**: Sample, Phenomenon of Interest, Design, Evaluation, Research type - often used for qualitative/mixed-methods questions.""",
 intermediate="""Frameworks are *scaffolds, not guarantees*. In a pilot randomised study of 31 clinicians, PICO-based search templates showed higher search precision than standard PubMed searching, but confidence intervals overlapped and the difference was not statistically significant (Schardt et al. 2007) - so use PICO because it forces clarity, not because it has been proven to improve searches.

**Defining elements.** *Population*: species, strain/genotype, sex, age, husbandry; or patient group. *Intervention/Exposure*: what, dose, duration, delivery. *Comparator*: no treatment, vehicle, sham, standard care, different dose. *Outcome*: the construct, the measurement, the time point and the summary metric (e.g. median lifespan vs mean vs hazard ratio). **Primary outcome** = the one pre-specified to answer the question; secondary outcomes are labelled as such before data collection.

**Question types** change the frame: intervention (PICO), etiological/exposure (PECO), prevalence (population + condition + context), diagnostic accuracy (population, index test, reference standard, target condition), prognostic (population, prognostic factor/model, outcome, time), mechanistic (be cautious: mechanisms rarely pool).""",
 advanced="""Breadth involves a trade-off. Broad questions (all dietary interventions, all model organisms) increase generalisability and moderator power but also heterogeneity and the risk of averaging unlike things; narrow questions are cleaner but may yield too few studies to analyse. A common strategy is a *broad question with pre-specified moderators and a narrow primary comparison*. Pre-specify the effect measure and its direction. For animal and plant studies, specify the **unit of analysis** (vial, plot, cage, pen) in the question's eligibility rules - it affects both eligibility and the variance.""",
 formulas=[],
 assumptions=["Elements are defined *before* looking at results.","Outcome definitions are operational (measurable) and could be extracted from reports."],
 worked_example="""**Draft idea (not a verified research gap):** exercise and aging in *Drosophila*.
- P: adult *Drosophila melanogaster* (any strain; sex recorded as a moderator).
- I: chronic exercise (e.g. climbing-based training devices) of defined duration.
- C: non-exercised controls housed under equivalent conditions.
- O (primary): lifespan (decide: median, mean or survival-curve hazard); O (secondary): climbing performance/healthspan measures.
- S: controlled laboratory experiments with concurrent controls.
**Question:** *In adult D. melanogaster, does chronic exercise training, compared with non-exercised controls, change lifespan?*
**Critique:** (i) Is 'exercise' similar enough across labs? (ii) Are enough studies reporting lifespan with variance available? (iii) Has this been reviewed? **None of these are known yet** - Module 5/6 and the Search workflow exist to find out. This is a candidate, not a finding.""",
 examples=[("Clinical (PICO)","Adults with type 2 diabetes; SGLT2 inhibitors; placebo; hospitalisation for heart failure."),
  ("Environmental (PECO)","Freshwater invertebrates; exposure to neonicotinoids; unexposed sites; abundance."),
  ("Plant (PICO/PECO)","Wheat cultivars; drought stress; well-watered; grain yield (log response ratio)."),
  ("Education (PICOS)","Undergraduate biology students; storytelling instruction; standard lecture; test achievement; quasi-experimental or randomised."),
  ("Scoping (PCC)","Population: model organisms; Concept: dietary restriction; Context: aging research, all publication types.")],
 mistakes=["Outcome stated as a topic ('metabolism') not a measurable construct.","Comparator left vague.","Adding elements after seeing the data.","Using PICO for a question that is really exposure-based.","Question so broad that the 'pooled' value cannot be interpreted."],
 misconceptions=[("'PICO guarantees a good search.'","It prompts clarity; evidence that it improves search precision is limited (Schardt 2007 pilot)."),
  ("'Population means humans.'","Population is whatever unit is studied: strains, plots, classrooms.")],
 controversies=["How broad a question can be before pooling is meaningless.","Whether mechanistic questions belong in effect-size meta-analysis."],
 decision_tree=[("Do investigators assign the intervention?","Yes -> PICO(S). No (exposure observed) -> PECO(S)."),
  ("Is the aim to map a field?","Yes -> PCC."),
  ("Is the aim to understand experiences/meaning?","Yes -> SPIDER or SPICE-type framework."),
  ("Are measurable outcome, time point and metric defined?","If no, the question is not yet reviewable.")],
 exercises=["Fill the Question Builder (Research Workspace) for your candidate topic. Mark every element you cannot define precisely.",
  "Rewrite your outcome three ways (median lifespan, mean lifespan, hazard ratio). Which would be extractable from typical papers? Which needs reconstruction (and therefore uncertainty labels)?",
  "State your unit of analysis. Would fly-level n be valid? Why or why not?"],
 coding=None,
 integrity="Write the primary outcome before searching. Changing it after seeing the results is outcome switching and must be reported as a protocol deviation.",
 further=["schardt2007","page2021ee","munn2018"],
 application="**First-paper task:** complete a Question Builder entry; the platform will flag unfilled elements. Save it as the draft question for your project; it is *provisional* until novelty and feasibility are assessed.",
 checklist=["Every element is defined operationally.","Primary vs secondary outcomes are separated.","Unit of analysis is stated.","The question can be answered by the study designs I plan to include."],
 quiz=[
  dict(q="Environmental question: 'Does pesticide exposure reduce pollinator abundance?' Which framework fits best?", opts=["PICO","PECO","PCC","SPIDER"], ans=1, why="Exposure is observed, not assigned -> PECO."),
  dict(q="Which outcome definition is most reviewable?", opts=["Aging","Metabolic health","Median adult lifespan in days, measured from eclosion","Improved well-being"], ans=2, why="It names a construct, metric and time origin."),
  dict(q="What did the Schardt 2007 pilot show about PICO search templates?", opts=["Significantly higher precision.","Higher precision trend but CIs overlapped and no significant difference.","Lower precision.","It proved PICO is unnecessary."], ans=1, why="Small pilot (31 participants); the authors state it could not demonstrate a significant difference."),
  dict(q="Scoping reviews typically use which framework?", opts=["PICO","PCC","PECO","none"], ans=1, why="Population, Concept, Context (JBI approach; see Munn 2018 and PRISMA-ScR)."),
  dict(q="You change the primary outcome after seeing results. Correct handling?", opts=["Nothing; refine freely.","Report it as a protocol deviation with rationale.","Delete the old protocol.","Only report the significant outcome."], ans=1, why="Transparent deviation reporting preserves credibility; silent switching is selective reporting."),
 ])
