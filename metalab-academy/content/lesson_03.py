LESSON = dict(
 id=3, title="Introduction to evidence synthesis: choosing the right kind of review",
 time_min=75, version="0.1.0", status="AI-drafted; awaiting qualified human expert review",
 content_type="Established guidance with educational simplifications",
 last_verified="2026-11-26 (key references checked in PubMed; Cochrane Handbook not re-read this session)",
 prerequisites=["None. Curiosity about how a research field's evidence is summarised."],
 objectives=[
  "Distinguish a narrative review, systematic review, meta-analysis, scoping review, umbrella review, rapid review, living review and evidence map.",
  "State precisely what a meta-analysis is - and that it is a statistical option inside some systematic reviews, not a synonym for 'systematic review'.",
  "Use a decision tree to pick a review type that fits a question.",
  "List the conditions under which pooling effect sizes is scientifically defensible, and when it is not.",
 ],
 why="Choosing the wrong review type is the most expensive early mistake: a meta-analysis of studies that measure different things yields a precise-looking number that answers no question. Your choice of review type determines the protocol, the reporting guideline, the tools and the manuscript you will write.",
 plain="""A **review** summarises what research says. Reviews differ in *how much they promise about method*.
- A **narrative review** is an expert's selective tour of a field. Useful for orientation, but the reader cannot check what was left out.
- A **systematic review** answers a specific question using *pre-planned, reproducible* methods: a documented search, explicit inclusion rules, assessment of each study's quality or risk of bias, and a transparent synthesis.
- A **meta-analysis** is a *statistical* step: it combines numerical results from several studies into one estimate, weighting studies by their precision. A systematic review may or may not include one.
- A **scoping review** maps *what exists* on a broad topic (concepts, types of evidence, gaps) rather than answering an effectiveness question.
- An **evidence map / gap map** presents the landscape visually (e.g. studies by species x intervention).
- An **umbrella review** (overview of reviews) summarises *existing systematic reviews*.
- A **rapid review** streamlines steps to answer faster, accepting stated trade-offs.
- A **living systematic review** is kept continually up to date as new studies appear.""",
 intermediate="""The decisive questions are: (1) *Is the question about effects, associations, accuracy, prevalence, experiences or 'what is known'?* (2) *Do the included studies estimate the same quantity on a comparable scale?* (3) *Is there enough numerical information (effect + variance, or the inputs to compute them)?*

Munn et al. (2018) argue that scoping reviews are appropriate to identify knowledge gaps, scope a body of literature, clarify concepts or investigate research conduct - and that they are often a precursor to a systematic review, not a lesser version of one. Scoping reviews follow PRISMA-ScR for reporting; systematic reviews follow PRISMA 2020. Critical appraisal is typically *not* a required component of scoping reviews, which is one reason they cannot support claims like 'X works'.

**Systematic review without meta-analysis** is common and legitimate when studies are too different to pool. Reporting such syntheses transparently is the purpose of the SWiM guideline (Campbell et al. 2020).""",
 advanced="""Formally, a meta-analysis estimates a parameter (or the mean/distribution of a parameter) across a population of studies. Whether a pooled estimate is *interpretable* depends on the estimand: a common-effect model assumes every study estimates one true effect; a random-effects model assumes study-specific true effects drawn from a distribution, and the pooled value estimates their *mean* (Borenstein et al. 2010). Pooling across strains, ages, doses and assays produces a mean of a distribution you may not care about; the **prediction interval** and a pre-specified moderator plan are what keep such a synthesis honest (Riley et al. 2011). Methodological work on living reviews, rapid reviews and review-of-review overlap (e.g. corrected covered area) is evolving; treat guidance in these areas as *emerging* and check current methods handbooks.""",
 formulas=[dict(name="Why we weight (preview of Module 32)", tex=r"\hat\theta = \frac{\sum_i w_i y_i}{\sum_i w_i},\quad w_i = 1/v_i",
   symbols={"y_i":"effect size from study i","v_i":"its sampling variance (square of its standard error)","w_i":"weight of study i (more precise = larger weight)","\\hat\\theta":"pooled estimate"})],
 assumptions=["Pooling presumes studies estimate sufficiently similar quantities (same construct, comparable direction and scale).",
  "Studies must be (approximately) statistically independent; one experiment reported twice must not enter twice.",
  "Effect sizes and variances must be available or computable without invention."],
 worked_example="""**Scenario (model-organism biology):** Ten Drosophila studies test dietary restriction (DR) vs ad libitum feeding and report median lifespan. Five use 5-sugar/yeast diets by *percent dilution*, three by *specific nutrient removal*, two by *intermittent fasting*. Strains, sexes and temperatures differ.
1. **Question type:** effect of an intervention on a continuous outcome -> a systematic review with possible meta-analysis is on the table.
2. **Same estimand?** 'DR' covers different interventions; the pooled number would average over them. A defensible plan: pre-specify intervention *type* as a subgroup/moderator, or restrict the review to one DR operationalisation.
3. **Units:** the experimental unit is usually the *vial/cage*, not the fly. If studies report fly-level SD and n, standard errors can be far too small (pseudoreplication). Extract the replication level and flag it.
4. **Decision:** proceed to protocol; pooling decided *after* checking comparability, not before. If comparability fails, report a structured synthesis without meta-analysis (SWiM).""",
 examples=[("Clinical","Do statins reduce fracture risk? -> SR of RCTs; pooled risk ratio plausible."),
  ("Plant science","What drought-tolerance traits have been studied in wheat? -> scoping review / evidence map."),
  ("Ecology","Effect of warming on species richness across sites -> SR + meta-analysis with log response ratio, phylogenetic/spatial dependence flagged."),
  ("Education","Do storytelling interventions improve STEM learning? -> SR; pooling only if outcome constructs align (standardised mean differences)."),
  ("Methods","Which review types exist for aging biology? -> scoping or umbrella review.")],
 mistakes=["Calling any literature review 'systematic'.","Equating meta-analysis with systematic review.","Pooling because the software lets you.","Choosing a scoping review to avoid appraising study quality when the question is actually about effects.","Deciding to pool after seeing which result looks best."],
 misconceptions=[("'More studies pooled = stronger evidence.'","Pooling many biased or non-comparable studies yields a precise estimate of the wrong thing."),
  ("'A scoping review is an easy systematic review.'","It answers different questions and still demands transparent, rigorous methods (Munn 2018)."),
  ("'A meta-analysis is the top of the evidence pyramid.'","Evidence hierarchies are heuristics; quality depends on included studies and methods.")],
 controversies=["Whether and when to pool heterogeneous preclinical/ecological studies ('apples and oranges' debate).","Appropriate degrees of streamlining in rapid reviews.","How much appraisal belongs in scoping reviews (guidance differs by group; check your target method handbook)."],
 decision_tree=[("Is your goal to estimate an effect/association/accuracy for a focused question?","Yes -> Systematic review (go to next); No -> go to 'map/clarify'."),
  ("Do included studies share comparable populations, interventions/exposures, outcomes and effect scales, with usable numbers?","Yes -> Meta-analysis is a candidate (still check heterogeneity plan). No -> Systematic review with structured synthesis (SWiM)."),
  ("Is the goal to map concepts, types of evidence or gaps in a broad field?","Yes -> Scoping review (PRISMA-ScR) or evidence/gap map."),
  ("Are there already many systematic reviews on the topic?","Yes -> Consider an umbrella review, or update/replace a flawed review (justify)."),
  ("Is the decision time-critical or is the evidence base moving fast?","Rapid review (declare trade-offs) / living review (needs sustained resources).")],
 exercises=["Pick your candidate topic. Write which review type fits, and one sentence justifying why the alternatives do not.",
  "List three ways the studies on your topic might measure 'the same' outcome differently. Could they be put on one scale without invention?",
  "Find (do not invent) one published systematic review and one scoping review in any field. For each: what question, what searches, was risk of bias assessed, was there a meta-analysis? Record DOIs from the actual papers."],
 coding=None,
 integrity="Do not claim your review is 'the first' on a topic without documented searches of databases and registries supporting that claim (Module 5). Do not choose a review type to make the result look more favourable.",
 further=["munn2018","page2021","page2021ee","tricco2018","campbell2020","borenstein2010"],
 application="**First-paper task:** write a 150-word 'Review-type justification' for your Workspace project (Research Workspace -> Decisions). It becomes part of the protocol rationale.",
 checklist=["I can define systematic review vs meta-analysis in my own words.","I chose a review type for my project and justified it.","I know which reporting guideline matches it.","I recorded the decision (not silently assumed)."],
 quiz=[
  dict(q="Which statement is correct?", opts=["A meta-analysis is always a systematic review.","A systematic review must contain a meta-analysis.","A meta-analysis is a statistical synthesis that can be part of a systematic review, but a systematic review can exist without one.","They are synonyms."], ans=2, why="Systematic review = method for locating and appraising evidence; meta-analysis = optional statistical pooling step. Cochrane and PRISMA treat them as distinct."),
  dict(q="You want to describe what kinds of evidence exist on exercise and aging across model organisms and identify gaps, without estimating an effect. Best fit?", opts=["Meta-analysis of RCTs","Scoping review / evidence map","Umbrella review","Narrative opinion piece"], ans=1, why="Mapping concepts and evidence types is the scoping-review purpose (Munn 2018)."),
  dict(q="Ten studies all report 'dietary restriction' but use very different regimens. What is the most defensible next step?", opts=["Pool all of them; random effects handles heterogeneity.","Check comparability, consider restricting or pre-specifying intervention type, and report heterogeneity/prediction interval or a structured synthesis if pooling is not meaningful.","Drop the two studies that disagree.","Use a vote count of significant results."], ans=1, why="Random effects models heterogeneity statistically; it does not make different interventions the same thing. Dropping studies for disagreement is outcome-driven selection; vote counting is discouraged (SWiM)."),
  dict(q="When is a pooled estimate scientifically inappropriate?", opts=["Only when I² > 50%.","When studies estimate different quantities or are not independent, or data are unavailable without invention - regardless of I².","When fewer than 20 studies are available.","Never; software handles it."], ans=1, why="Comparability and independence are conceptual conditions; no I² threshold substitutes for them (Rücker 2008)."),
  dict(q="Which reporting guideline fits a scoping review?", opts=["PRISMA 2020","PRISMA-ScR","SWiM","ARRIVE"], ans=1, why="PRISMA-ScR (Tricco 2018). SWiM is for synthesis without meta-analysis in intervention reviews; ARRIVE reports primary animal studies."),
  dict(q="In fly lifespan studies, why can fly-level n inflate precision?", opts=["Flies are small.","The experimental unit is often the vial/cage; flies in one vial are not independent (pseudoreplication).","Lifespan is not continuous.","It cannot."], ans=1, why="Treating clustered animals as independent shrinks standard errors; extract replication level and adjust or flag it."),
 ])
