"""Preliminary topic scan for the first-paper pathway.

PROVENANCE: every count below was returned by PubMed (NCBI) through the PubMed connector on 2026-11-26.
ONE database, title/abstract-level, auto-translated queries, no screening. This is a *signal for what to
investigate*, NOT a novelty or feasibility determination. Zero review hits does not prove no review exists
(other databases, preprints, registries, grey literature, and synonyms were not searched).
The user must repeat/extend these searches in the Search Log and decide.
"""
DATE = "2026-11-26"; DB = "PubMed (NCBI)"
EXT_DATE = "2026-11-27"   # searches S19-S30 were run on this later date (same connector, same caveats)
SEARCHES = [
 # id, topic, purpose, exact query, total_count
 ("S1","Drosophila exercise","existing reviews","(Drosophila OR fruit fly OR invertebrate model) AND (exercise OR physical activity OR exercise training) AND (meta-analysis[pt] OR systematic review[pt])",4,"4 hits, none on fly exercise (off-topic: body-fat GWAS, bioturbation, metabolic scaling, snail toxicity)"),
 ("S2","Drosophila exercise","primary-study volume (title terms)","(Drosophila[ti] OR fruit fly[ti]) AND (exercise[ti] OR training[ti] OR \"physical activity\"[ti]) AND (lifespan OR longevity OR \"life span\")",29,"29 records; first 20 inspected by title: mostly gene-specific (cardiac/muscle) experiments from a small number of groups; not all report lifespan"),
 ("S3","Drosophila exercise","broader primary volume","(Drosophila) AND (exercise OR physical activity OR climbing training) AND (lifespan OR longevity OR aging)",206,"broader/noisier; includes non-lifespan and non-fly-exercise records"),
 ("S4","Dietary restriction in Drosophila","existing reviews","(Drosophila) AND (lifespan OR longevity) AND (dietary restriction OR diet) AND (meta-analysis[pt] OR systematic review[pt])",2,"Liang 2018 (survival-curve MA of calorie restriction; PMID 29636552), Simons 2013 (rodent DR MA; PMID 23438200)"),
 ("S5","Dietary restriction in Drosophila","primary-study volume","(Drosophila) AND (lifespan OR longevity) AND (dietary restriction OR diet)",869,"large literature"),
 ("S6","Rapamycin/mTOR and lifespan","existing reviews","(rapamycin OR mTOR inhibition) AND (lifespan OR longevity) AND (meta-analysis[pt] OR systematic review[pt])",8,"Crowded: Swindell 2017 (mice, PMID 27519886), Phillips 2023 (pathogen resilience, PMID 36399256), Ivimey-Cook 2025 (vertebrates, PMID 40532901), Lee 2024 (humans, PMID 38310895); others off-topic"),
 ("S7","Rapamycin/mTOR and lifespan","primary-study volume","(rapamycin OR mTOR inhibition) AND (lifespan OR longevity) AND (Drosophila OR mice OR yeast OR nematode)",1008,"large literature"),
 ("S8","Sex-specific effects of insulin/TOR on lifespan","existing reviews","(insulin OR IGF OR insulin-like signaling) AND (lifespan OR longevity) AND (sex differences OR sexual dimorphism) AND (meta-analysis[pt] OR systematic review[pt])",4,"4 hits, none on-topic (human exercise/asprosin, GWAS, liver fat)"),
 ("S9","Sex-specific effects of insulin/TOR on lifespan","primary-study volume","(insulin OR IGF OR insulin-like signaling OR TOR) AND (lifespan OR longevity) AND (sex differences OR sexual dimorphism) AND (Drosophila OR mice OR nematode)",100,"moderate literature"),
 ("S10","Sex-specific effects of DR on lifespan","existing reviews","(sex differences OR sex-specific OR sexual dimorphism) AND (dietary restriction OR caloric restriction) AND (lifespan OR longevity) AND (meta-analysis[pt] OR systematic review[pt])",3,"only Ivimey-Cook 2025 (PMID 40532901) on-topic-adjacent; Moatt 2016 DR-reproduction MA (PMID 27717308) appears; need to read whether sex-stratified lifespan effects were analysed"),
 ("S11","Sex-specific interventions (general)","existing reviews","(sex differences OR sex-specific) AND (lifespan extension OR longevity intervention) AND (meta-analysis[pt] OR systematic review[pt]) AND (Drosophila OR mice OR rodents OR model organisms)",9,"mostly off-topic fracture-risk MAs; includes a 2026 Nature paper on sterilisation and vertebrate lifespan (PMID 41372417)"),
 ("S12","Drosophila lifespan reviews (any intervention)","landscape of existing reviews","Drosophila AND (lifespan OR longevity OR survival) AND (meta-analysis[pt] OR systematic review[pt])",13,"On-topic precedents: Drosophila survival-data MA across studies 2013 (PMID 23795998); cysteine and lifespan in 3 model organisms SR/MA 2025 (PMID 39478327); antioxidant enzymes/aging markers in Drosophila SR 2026 (PMID 41873818); Friedreich's ataxia modifiers in Drosophila SR/MA 2026 (PMID 42303002)"),
 ("S13","Drosophila microbiota/probiotics and lifespan","existing reviews","(Drosophila) AND (lifespan OR longevity) AND (microbiota OR microbiome OR probiotic OR Lactobacillus OR Acetobacter) AND (meta-analysis[pt] OR systematic review[pt])",0,"0 hits (does NOT prove novelty)"),
 ("S14","Drosophila microbiota/probiotics and lifespan","primary-study volume","(Drosophila) AND (lifespan OR longevity) AND (microbiota OR microbiome OR probiotic OR Lactobacillus OR Acetobacter)",165,"moderate literature; microbial composition/strain heterogeneity expected"),
 ("S15","Drosophila sleep and lifespan","existing reviews","(Drosophila) AND (sleep) AND (lifespan OR longevity OR aging) AND (meta-analysis[pt] OR systematic review[pt])",0,"0 hits (does NOT prove novelty)"),
 ("S16","Sex-specific Drosophila lifespan responses","primary-study volume","Drosophila AND (lifespan OR longevity) AND (sex-specific OR sexually dimorphic OR \"males and females\") AND (dietary restriction OR insulin OR TOR OR rapamycin)",39,"moderate literature; sex-stratified lifespan data likely available in many studies (unverified)"),
 ("S17","Plant: mycorrhiza and drought","existing reviews","(arbuscular mycorrhizal fungi) AND (drought) AND (plant growth OR biomass OR yield) AND (meta-analysis[pt] OR systematic review[pt])",9,"Crowded: 9 hits already (not individually inspected)"),
 ("S18","Science education: storytelling","existing reviews","(storytelling OR narrative) AND (science education OR STEM education) AND (meta-analysis[pt] OR systematic review[pt])",1340,"INVALID QUERY: PubMed translated 'STEM' into plant stems / electron microscopy -> noise. PubMed is also the wrong database for education research (use ERIC, Web of Science, Scopus). Lesson: always read the query translation."),
 ("S0a","(narrow queries, shown for the lesson)","over-specification","Drosophila exercise lifespan meta-analysis",0,"0 hits because terms were AND-ed as free text; DO NOT read as novelty"),
 ("S0b","(narrow queries, shown for the lesson)","over-specification","dietary restriction lifespan model organisms systematic review",0,"0 hits for the same reason; DO NOT read as novelty"),
 # ---- v0.3 extension (run 2026-11-27 via the same PubMed connector; same caveats)
 ("S19","Intermittent fasting / time-restricted feeding and lifespan (model organisms)","existing reviews","(intermittent fasting OR time-restricted feeding) AND (lifespan OR longevity) AND (meta-analysis[pt] OR systematic review[pt]) AND (animals OR Drosophila OR mice OR \"Caenorhabditis elegans\")",0,"0 hits (does NOT prove novelty; the strict AND of several concept blocks may hide reviews)"),
 ("S20","Intermittent fasting / time-restricted feeding and lifespan (model organisms)","primary-study volume","(intermittent fasting OR time-restricted feeding) AND (lifespan OR longevity) AND (Drosophila OR mice OR \"Caenorhabditis elegans\")",113,"moderate literature; outcome heterogeneity and regimen definitions likely"),
 ("S21","Metformin and lifespan (model organisms)","existing reviews","metformin AND (lifespan OR longevity) AND (meta-analysis[pt] OR systematic review[pt]) AND (Drosophila OR mice OR \"Caenorhabditis elegans\" OR animals)",5,"5 hits; includes Triggle 2022 (broad metformin review, PMID 35640743) and Ivimey-Cook 2025 (rapamycin vs metformin in vertebrates, PMID 40532901) seen in S6; remaining hits not inspected"),
 ("S22","Metformin and lifespan (model organisms)","primary-study volume","metformin AND (lifespan OR longevity) AND (Drosophila OR mice OR \"Caenorhabditis elegans\")",167,"moderate literature"),
 ("S23","Drosophila neurodegeneration models and lifespan","existing reviews","Drosophila AND (Alzheimer OR neurodegeneration OR Parkinson) AND (lifespan OR survival) AND (meta-analysis[pt] OR systematic review[pt])",2,"2 hits; one is the 2026 Friedreich's-ataxia modifiers SR/MA (PMID 42303002, seen in S12); the other not inspected"),
 ("S24","Drosophila neurodegeneration models and lifespan","primary-study volume","Drosophila AND (Alzheimer OR neurodegeneration OR Parkinson) AND (lifespan OR survival)",1213,"large literature; many disease models/genotypes -> comparability must be narrowed"),
 ("S25","NAD+ precursors and lifespan","existing reviews","(NAD OR nicotinamide riboside OR nicotinamide mononucleotide) AND (lifespan OR longevity) AND (meta-analysis[pt] OR systematic review[pt])",1,"1 hit (PMID 31917996) - NOT inspected, so its relevance is unknown"),
 ("S26","NAD+ precursors and lifespan","primary-study volume","(NAD OR nicotinamide riboside OR nicotinamide mononucleotide) AND (lifespan OR longevity) AND (Drosophila OR mice OR \"Caenorhabditis elegans\")",432,"large literature; 'NAD' also matches unrelated biochemistry"),
 ("S27","Plant biostimulants (seaweed, humic) and crop growth/yield","existing reviews","(biostimulant OR seaweed extract OR humic) AND (crop yield OR plant growth) AND (meta-analysis[pt] OR systematic review[pt])",12,"Crowded: 12 hits (not individually inspected); PubMed's 'crop' term also maps to avian crop (noise)"),
 ("S28","Plant biostimulants (seaweed, humic) and crop growth/yield","primary-study volume","(biostimulant OR seaweed extract OR humic) AND (crop yield OR plant growth)",3444,"very large literature (plus noise)"),
 ("S29","RNAi / dsRNA efficacy in insect pests (biotechnology)","existing reviews","(RNAi OR dsRNA) AND (insect OR pest) AND (mortality OR efficacy) AND (meta-analysis[pt] OR systematic review[pt])",0,"0 hits (does NOT prove novelty; agricultural databases such as CAB Abstracts/AGRIS and Web of Science were not searched)"),
 ("S30","RNAi / dsRNA efficacy in insect pests (biotechnology)","primary-study volume","(RNAi OR dsRNA) AND (insect OR pest) AND (mortality OR efficacy)",1561,"large literature; huge heterogeneity in species, delivery, target gene expected"),
]
CANDIDATES = [
 dict(id="A", title="Exercise training and lifespan/mortality in Drosophila",
      why_interesting="Direct fit with your expertise; no on-topic review found in this PubMed scan (S1) - UNVERIFIED elsewhere.",
      signals=["S1","S2","S3"],
      concerns=["Probably small k (tens of records at most; many gene-specific and not all report lifespan).","Strong lab clustering and dependence (few groups); protocols differ (e.g. different exercise devices) -> comparability.","Lifespan often reported as survival curves: effect sizes may need reconstruction (provenance/uncertainty labels).","Fly-level vs vial-level n (pseudoreplication)."],
      likely_design="SR with possible small MA (lnRR of median/mean lifespan or log hazard ratio) - may end as structured synthesis (SWiM) if data insufficient.",
      next_steps=["Repeat in Web of Science / Scopus / Embase (access permitting) and Europe PMC (incl. preprints)","Search PROSPERO and OSF registries for existing protocols","Screen the 29 + 206 records to count eligible studies with usable lifespan data (this IS your Weeks 3-4 task)"]),
 dict(id="B", title="Sex-specific lifespan responses to dietary restriction or TOR/insulin manipulation in Drosophila (or model organisms)",
      why_interesting="Methodologically meaningful (sex as a moderator, a known weakness of many studies); 39-100 primary records; no on-topic SR/MA seen (S8, S10).",
      signals=["S8","S9","S10","S16"],
      concerns=["Existing broad DR/rapamycin meta-analyses (S4, S6, S10) may already address sex - must be read to check overlap.","Heterogeneous interventions (diet composition, genotypes, drugs).","Same-study multiple effect sizes (sexes share controls/lab) -> dependence modelling needed (Module 38-40, not yet taught).","Needs a strict question to avoid pooling unlike interventions."],
      likely_design="SR + multilevel meta-analysis of male-vs-female differences in lnRR of lifespan; advanced statistics -> mentor/statistician strongly advised.",
      next_steps=["Read Ivimey-Cook 2025 and Moatt 2016 full text to see whether sex-by-intervention was analysed","Pilot extraction on 5 studies to test data availability by sex"]),
 dict(id="C", title="Microbiota/probiotic manipulation and lifespan in Drosophila",
      why_interesting="0 reviews in PubMed (S13) with 165 primary records (S14).",
      signals=["S13","S14"],
      concerns=["Very heterogeneous interventions (axenic vs gnotobiotic vs probiotic; species/strains; diets).","Husbandry/housing confounders.","Zero-hit result is not proof of novelty."],
      likely_design="SR; MA only within narrow, defined contrasts (e.g. axenic vs conventional).",
      next_steps=["Define one contrast","Check feasibility by screening a sample"]),

 dict(id="F", title="Intermittent fasting / time-restricted feeding and lifespan in model organisms",
      why_interesting="Fits aging + metabolism; 0 review hits in this PubMed query (S19) with 113 primary records (S20).",
      signals=["S19","S20"], concerns=["Regimen definitions vary widely (feeding window, fasting duration, diet composition).","Zero reviews could be a query artefact.","Species differences (fly, worm, mouse) may make pooling meaningless without a narrow focus."],
      likely_design="SR; MA only within one organism and a defined regimen family.", next_steps=["Re-search without the review filter and read the closest DR reviews (S4, S6) for overlap","Pilot-screen 100 records for eligibility/extractable data"]),
 dict(id="G", title="RNAi / dsRNA efficacy against insect pests (biotechnology)",
      why_interesting="Biotechnology-relevant; 0 review hits in PubMed (S29) vs 1561 primary records (S30).",
      signals=["S29","S30"], concerns=["Extreme heterogeneity (species, delivery, target gene, dose).","Agricultural databases not searched.","Outcome definitions (mortality, knockdown) differ."],
      likely_design="Scoping review / evidence map may be more appropriate than meta-analysis; MA only for a narrow species-target-delivery combination.", next_steps=["Search CAB Abstracts/AGRIS/Web of Science","Map outcome types before choosing an effect size"]),
 dict(id="H", title="NAD+ precursors and lifespan; Drosophila neurodegeneration-model survival",
      why_interesting="Molecular/metabolic and neuroscience angles from your background; S25 shows 1 review hit (uninspected), S23 shows 2 (one off-target).",
      signals=["S23","S24","S25","S26"], concerns=["Large, heterogeneous primary literature.","Must inspect the single NAD+ review hit before judging novelty.","Disease-model and genotype comparability."],
      likely_design="Narrow SR; MA only with strict eligibility.", next_steps=["Read PMID 31917996 and the S23 non-Friedreich hit","Define one precursor/one organism or one disease model"]),
 dict(id="X", title="Crowded or poorly-suited in PubMed-only scan",
      why_interesting="Rapamycin/DR lifespan: multiple recent meta-analyses (S4, S6) - needs a clearly different question to justify. Plant mycorrhiza-drought: 9 existing reviews (S17); plant biostimulants: 12 review hits (S27). Metformin lifespan: several reviews incl. a vertebrate comparison with rapamycin (S21). Education/storytelling and public health: PubMed scan invalid or out of scope (S18) - needs ERIC/Scopus/Web of Science; not yet scanned.",
      signals=["S4","S6","S17","S18","S21","S27"], concerns=[], likely_design="-", next_steps=["Only revisit with a distinct, defensible gap"]),
]
RUBRIC = ["Scientifically meaningful question", "Manageable scope", "Accessible primary literature", "Sufficient comparable data (effect + variance extractable)",
          "Appropriate statistical methods you can learn in time", "Realistic timeline (weeks 3-16 of the plan)", "Genuine publication potential (not 'easy to publish')",
          "Novelty supported by documented searches in >=2 databases + registries", "Independence of studies (labs, shared controls) manageable"]
