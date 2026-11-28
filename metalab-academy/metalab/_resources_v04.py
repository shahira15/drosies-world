"""v0.4 additions to the Knowledge Universe: CANDIDATE entries chosen from author knowledge of well-known sources. NOTHING here has been opened or verified
(verified_on stays None; costs, dates, eligibility and availability are deliberately not asserted). Purpose: every curriculum module gets at least one candidate resource,
and the registry covers courses, lectures, videos, textbooks, tutorials, guidelines, templates, datasets, software documentation, organisations, conferences, workshops,
mentorship, communities and funding directories. Verify on your own machine with tools/verify_batch.py (see KNOWLEDGE_VERIFICATION.md)."""

def _R(title, org, type_, topic, level, discipline, url, access, why, modules, audience="Researchers"):
    return dict(title=title, org=org, type=type_, topic=topic, level=level, discipline=discipline, url=url, access=access, why=why, modules=modules, audience=audience, doi=None)

NEW_RESOURCES = [
 # ---- foundations of reasoning, designs, bias
 _R("Understanding Science (UC Berkeley)", "UC Museum of Paleontology", "Free online book", "How science works; evidence and reasoning", "Beginner", "All", "https://undsci.berkeley.edu/", "Free online (verify)", "Accessible introduction to scientific reasoning for Module 1.", [1]),
 _R("Catalogue of Bias", "Centre for Evidence-Based Medicine, Oxford", "Methodological guidance", "Definitions, examples and mitigation of biases", "Intermediate", "All", "https://catalogofbias.org/", "Free (verify)", "Searchable catalogue of biases: study designs and bias fundamentals.", [1, 2, 21, 36, 50]),
 _R("Khan Academy: Statistics and probability", "Khan Academy", "Online course", "Introductory statistics and probability", "Beginner", "All", "https://www.khanacademy.org/math/statistics-probability", "Free (verify)", "Self-paced foundations for Modules 24-26.", [24, 25, 26]),
 _R("Our World in Data: how to read charts (search)", "Our World in Data", "Statistical tutorial / worked examples", "Reading data visualisations", "Beginner", "All", "https://ourworldindata.org/", "Free (verify)", "Examples of clear graphical communication (Module 73).", [73]),
 # ---- effect sizes and outcome-specific methods
 _R("metafor: analysis examples (counts, proportions, correlations, survival)", "W. Viechtbauer", "Software documentation", "Worked R examples for many outcome types", "Intermediate", "All", "https://www.metafor-project.org/doku.php/analyses", "Free online (verify)", "Reproduce published analyses for binary, count, correlation and proportion data.", [28, 29, 30, 31, 47, 48, 36, 37, 49, 50, 51]),
 _R("survival (R package)", "T. Therneau", "R package", "Time-to-event analysis", "Intermediate", "Health", "https://cran.r-project.org/package=survival", "Free (verify)", "Reference implementation for survival analysis (Modules 30, 86).", [30, 86]),
 _R("Cochrane Handbook for Systematic Reviews of Diagnostic Test Accuracy", "Cochrane", "Methodological handbook", "Diagnostic test accuracy reviews", "Intermediate", "Health", "https://training.cochrane.org/handbook-diagnostic-test-accuracy", "Free online (verify)", "Official methods for DTA reviews (Module 44).", [44]),
 _R("mada (R package)", "P. Doebler et al.", "R package", "Diagnostic accuracy meta-analysis", "Intermediate", "Health", "https://cran.r-project.org/package=mada", "Free (verify)", "Bivariate/HSROC models; use to check MetaLab's DTA output (Module 44).", [44]),
 _R("QUADAS-2", "University of Bristol", "Methodology/RoB tool", "Quality assessment of diagnostic accuracy studies", "Intermediate", "Health", "https://www.bristol.ac.uk/population-health-sciences/projects/quadas/quadas-2/", "Free (verify)", "Official QUADAS-2 resources.", [44, 22]),
 _R("PROBAST", "PROBAST group", "Methodology/RoB tool", "Risk of bias in prediction-model studies", "Intermediate", "Health", "https://www.probast.org/", "Free (verify)", "Official PROBAST resources (Module 45).", [45, 22]),
 _R("TRIPOD statement", "TRIPOD group", "Reporting guideline", "Reporting prediction-model studies", "Intermediate", "Health", "https://www.tripod-statement.org/", "Free (verify)", "Reporting standard for the primary studies you will synthesise.", [45, 76]),
 _R("metasens (R package)", "G. Schwarzer et al.", "R package", "Sensitivity analyses for publication bias (Copas, limit meta-analysis)", "Advanced", "All", "https://cran.r-project.org/package=metasens", "Free (verify)", "Selection-model-style sensitivity analyses (Module 49).", [49, 50]),
 _R("PRISMA-IPD / PRISMA extensions", "PRISMA group", "Reporting guideline", "Reporting extensions for IPD, NMA, DTA, equity", "Intermediate", "Health", "https://www.prisma-statement.org/extensions", "Free (verify)", "Find the extension that fits your review (Modules 42, 44, 46, 90).", [42, 44, 46, 90]),
 # ---- review variants
 _R("Cochrane Handbook chapters on SWiM and variants", "Cochrane", "Methodological handbook", "Synthesis without meta-analysis; living reviews; non-randomised studies", "Intermediate", "Health", "https://training.cochrane.org/handbook/current", "Free online (verify)", "Chapters 12, 13, 15, 16, 17, 22-26 map onto Modules 53, 50, 74, 90, 56, 58, 46.", [12, 53, 50, 74, 90, 56, 58, 46, 6, 20, 21]),
 _R("Living systematic reviews (Cochrane guidance hub)", "Cochrane", "Methodological guidance", "Living review production", "Advanced", "Health", "https://community.cochrane.org/review-production/production-resources/living-systematic-reviews", "Free (verify)", "Practical guidance for updating reviews (Module 56).", [56]),
 _R("RAMESES project", "RAMESES", "Methodological guidance", "Realist syntheses and evaluations", "Advanced", "Health, social science", "https://www.ramesesproject.org/", "Free (verify)", "Standards and training for realist reviews (Module 56).", [56]),
 _R("Evidence synthesis for qualitative research: Cochrane-Campbell handbook (search)", "Cochrane/Campbell", "Methodological guidance", "Qualitative evidence synthesis", "Advanced", "Social science, health", "https://training.cochrane.org/", "Free (verify)", "Look for the Cochrane-Campbell Handbook for QES (Module 54).", [54]),
 _R("CERQual (GRADE-CERQual)", "GRADE-CERQual Coordinating Team", "Certainty framework", "Confidence in qualitative evidence", "Advanced", "Health, social science", "https://www.cerqual.org/", "Free (verify)", "Official GRADE-CERQual resources.", [54, 52]),
 _R("SWiM and other reporting guidelines (EQUATOR search)", "EQUATOR Network", "Reporting guideline directory", "Find SWiM, MOOSE, ENTREQ", "Intermediate", "All", "https://www.equator-network.org/reporting-guidelines/", "Free (verify)", "Locate the checklist for your design (Modules 53, 54, 58).", [53, 54, 58, 76]),
 # ---- discipline modules
 _R("STROBE statement", "STROBE group", "Reporting guideline", "Reporting observational studies", "Intermediate", "Health", "https://www.strobe-statement.org/", "Free (verify)", "Reporting standard for observational primary studies (Module 58).", [58]),
 _R("GRADEpro GDT (summary of findings)", "GRADE", "Software", "Summary of findings and certainty tables", "Intermediate", "Health", "https://www.gradepro.org/", "Free/paid tiers (verify)", "Build certainty-of-evidence tables (Modules 52, 57, 74).", [57, 74]),
 _R("Cochrane Nutrition", "Cochrane", "Methodological guidance", "Nutrition evidence synthesis", "Intermediate", "Nutrition", "https://nutrition.cochrane.org/", "Free (verify)", "Nutrition-specific review resources (Module 66).", [66]),
 _R("USDA Nutrition Evidence Systematic Review (NESR)", "USDA", "Methodological guidance", "Nutrition systematic review methods", "Intermediate", "Nutrition", "https://nesr.usda.gov/", "Free (verify)", "Example of a nutrition evidence process (Module 66).", [66]),
 _R("MAER-Net (Meta-Analysis of Economics Research Network)", "MAER-Net", "Methodological guidance", "Meta-regression analysis in economics and business", "Advanced", "Economics", "https://www.maer-net.org/", "Free (verify)", "Community and guidelines for economics meta-analysis (Module 67).", [67]),
 _R("IEEE Xplore", "IEEE", "Bibliographic database", "Engineering and computer-science literature", "All", "Engineering", "https://ieeexplore.ieee.org/", "Subscription/open (verify)", "Primary database for engineering SLRs (Module 68).", [68]),
 _R("ACM Digital Library", "ACM", "Bibliographic database", "Computing literature", "All", "Computer science", "https://dl.acm.org/", "Subscription/open (verify)", "Primary database for computing SLRs (Module 68).", [68]),
 _R("Psychological Science Accelerator", "PSA", "Registry", "Large-scale multi-lab replications", "Advanced", "Psychology", "https://psysciacc.org/", "Free (verify)", "Context for replicability evidence (Module 64).", [64]),
 _R("APA Journal Article Reporting Standards (JARS / MARS)", "APA", "Reporting guideline", "Reporting standards incl. meta-analysis (MARS)", "Intermediate", "Psychology", "https://apastyle.apa.org/jars", "Free (verify)", "Psychology reporting standards (Modules 64, 76).", [64, 76]),
 _R("Microbiology Society resources", "Microbiology Society", "Journal directory", "Microbiology research community and journals", "All", "Microbiology", "https://microbiologysociety.org/", "Free/members (verify)", "Society hub for microbiology (Module 62).", [62]),
 _R("American Society for Microbiology", "ASM", "Journal directory", "Microbiology community, journals and guidelines", "All", "Microbiology", "https://asm.org/", "Free/members (verify)", "Society hub for microbiology (Module 62).", [62]),
 _R("NC3Rs Experimental Design Assistant", "NC3Rs", "Software", "Experimental design, experimental unit and sample size for animal studies", "Intermediate", "Preclinical", "https://eda.nc3rs.org.uk/", "Free (verify)", "Think about the experimental unit before extraction (Modules 85, 87).", [85, 87, 59]),
 _R("SAGER guidelines (sex and gender reporting)", "EASE", "Reporting guideline", "Sex and gender reporting in research", "Intermediate", "All", "https://ease.org.uk/communities/gender-policy-committee/the-sager-guidelines/", "Free (verify)", "Reporting guidance relevant to sex as a biological variable (Module 87).", [87]),
 # ---- peer review, submission, integrity, conflicts, capstone
 _R("PREreview", "PREreview", "Training portal", "Open peer review and reviewer training", "Beginner", "All", "https://prereview.org/", "Free (verify)", "Practise reviewing and see open reviews (Module 78).", [78]),
 _R("ICMJE: disclosure of conflicts of interest", "ICMJE", "Authorship criteria", "Disclosure forms and recommendations", "All", "All", "https://www.icmje.org/disclosure-of-interest/", "Free (verify)", "Standard disclosure form and guidance (Modules 80, 83, 89).", [89, 78]),
 _R("Cochrane Handbook: conflicts of interest chapter", "Cochrane", "Methodological handbook", "Considering bias and conflicts of interest among included studies", "Intermediate", "Health", "https://training.cochrane.org/handbook/current/chapter-07", "Free online (verify)", "Handbook chapter on conflicts of interest and bias in included studies (Module 89).", [89, 21]),
 _R("Open Science Framework: preregistration templates", "Center for Open Science", "Registry", "Preregistration templates", "Beginner", "All", "https://osf.io/registries", "Free (verify)", "Templates for registering protocols (Modules 8, 84).", [84]),
 _R("PRISMA 2020 flow diagram generator (Shiny)", "PRISMA2020 R package team", "Software", "PRISMA 2020 flow diagrams", "Beginner", "All", "https://estech.shinyapps.io/prisma_flowdiagram/", "Free (verify)", "Compare with MetaLab's PRISMA output (Modules 16, 84).", [84, 16]),
 _R("Cochrane data collection form templates", "Cochrane", "Methodological guidance", "Data collection form templates", "Beginner", "Health", "https://training.cochrane.org/data-collection-forms-intervention-reviews", "Free (verify)", "Templates to adapt for extraction (Modules 17, 84).", [84, 17, 20]),
 _R("Turing Way: reproducible research chapters", "The Turing Way community", "Open handbook", "Data provenance, quality and reproducibility", "Intermediate", "All", "https://book.the-turing-way.org/reproducible-research/reproducible-research", "Free, open (verify licence)", "Provenance and quality practices (Module 20).", [20, 84]),
 # ---- video / course searches (NOT channels or endorsements)
 _R("SEARCH: YouTube - network meta-analysis lectures", "YouTube search", "Video search (not a channel)", "Lecture videos on NMA", "Advanced", "All", "https://www.youtube.com/results?search_query=network+meta-analysis+lecture", "Free (search results change)", "Search only; vet each lecturer's credentials and date.", [42]),
 _R("SEARCH: YouTube - Bayesian meta-analysis lectures", "YouTube search", "Video search (not a channel)", "Lecture videos on Bayesian MA", "Advanced", "All", "https://www.youtube.com/results?search_query=bayesian+meta-analysis+lecture", "Free (search results change)", "Search only; vet each lecturer.", [41]),
 _R("SEARCH: YouTube - risk of bias assessment tutorials", "YouTube search", "Video search (not a channel)", "RoB tool tutorials", "Intermediate", "All", "https://www.youtube.com/results?search_query=risk+of+bias+assessment+tutorial", "Free (search results change)", "Search only; vet each source.", [21, 22, 23]),
 _R("SEARCH: YouTube - meta-regression and heterogeneity lectures", "YouTube search", "Video search (not a channel)", "Heterogeneity lectures", "Intermediate", "All", "https://www.youtube.com/results?search_query=heterogeneity+meta-regression+lecture", "Free (search results change)", "Search only; vet each source.", [35, 36, 37]),
 _R("SEARCH: Coursera - statistics for biologists", "Coursera search", "Online course search", "Introductory statistics courses", "Beginner", "All", "https://www.coursera.org/search?query=statistics%20for%20biology", "Free audit/paid (verify)", "Search only; check syllabus, level and date.", [24, 25, 26]),
 _R("SEARCH: edX - research methods and reproducibility", "edX search", "Online course search", "Research methods courses", "Beginner", "All", "https://www.edx.org/search?q=research%20methods%20reproducibility", "Free audit/paid (verify)", "Search only; check syllabus, level and date.", [1, 72, 84]),
]

# Existing resources (matched by URL) that ALSO serve additional modules (author judgement from the resource's scope; unverified).
EXTRA_MODULES = {
 "https://training.cochrane.org/handbook": [2, 6, 12, 20, 21, 28, 29, 30, 31, 36, 37, 48, 50, 51, 53, 56, 57, 58, 74, 84, 89, 90],
 "https://jbi-global-wiki.refined.site/space/MANUAL": [47, 56, 58, 53],
 "https://www.metafor-project.org/": [28, 29, 30, 31, 36, 47, 48, 49, 50, 51],
 "https://cran.r-project.org/package=meta": [28, 30, 47, 48, 50],
 "https://cran.r-project.org/package=metadat": [28, 29, 30, 31, 36, 44, 46, 48],
 "https://www.prisma-statement.org/": [12, 53, 56, 74, 84],
 "https://arriveguidelines.org/": [2, 85, 87],
 "https://www.syrcle.nl/": [2, 85, 87, 84],
 "https://www.ed.ac.uk/clinical-brain-sciences/research/camarades": [84, 87, 85],
 "https://www.crd.york.ac.uk/prospero/": [6, 88],
 "https://pubmed.ncbi.nlm.nih.gov/": [88, 12],
 "https://europepmc.org/": [88, 12],
 "https://openalex.org/": [88],
 "https://training.cochrane.org/interactivelearning": [6, 84, 89, 90, 21, 36, 37, 50, 51],
 "https://training.cochrane.org/": [6, 84],
 "https://www.equator-network.org/": [53, 54, 58, 84],
 "https://publicationethics.org/": [78, 89],
 "https://www.icmje.org/recommendations/": [78, 89],
 "https://osf.io/": [64, 84],
 "https://book.the-turing-way.org/": [20, 84],
 "https://www.go-fair.org/fair-principles/": [20],
 "https://cran.r-project.org/package=netmeta": [42],
 "https://cran.r-project.org/package=clubSandwich": [39, 40],
 "https://flybase.org/": [87],
}

NEW_ORGS = [
 dict(name="Cochrane Methods groups (directory)", url="https://methods.cochrane.org/", focus="Methodology groups: prognosis, DTA, bias, statistics, qualitative", discipline="Health, methodology"),
 dict(name="Campbell Collaboration", url="https://www.campbellcollaboration.org/", focus="Social-science evidence synthesis", discipline="Social science"),
 dict(name="Collaboration for Environmental Evidence", url="https://environmentalevidence.org/", focus="Environmental evidence synthesis", discipline="Ecology, environment"),
 dict(name="JBI", url="https://jbi.global/", focus="Evidence synthesis training and methodology", discipline="Health"),
 dict(name="EQUATOR Network", url="https://www.equator-network.org/", focus="Reporting guidelines hub", discipline="All"),
 dict(name="Center for Open Science", url="https://www.cos.io/", focus="Open science infrastructure and reproducibility", discipline="All"),
 dict(name="UK Reproducibility Network", url="https://www.ukrn.org/", focus="Reproducibility research and local networks", discipline="All"),
 dict(name="Psychological Science Accelerator", url="https://psysciacc.org/", focus="Distributed multi-lab studies", discipline="Psychology"),
 dict(name="MAER-Net", url="https://www.maer-net.org/", focus="Meta-analysis in economics", discipline="Economics"),
 dict(name="NC3Rs", url="https://nc3rs.org.uk/", focus="Replacement, reduction, refinement of animal research; ARRIVE", discipline="Preclinical"),
]
NEW_COMMUNITIES = [
 dict(name="Cross Validated (Stack Exchange)", url="https://stats.stackexchange.com/", focus="Statistics Q&A (public; quality varies; cite and verify answers)", kind="forum"),
 dict(name="Stack Overflow (R and Python tags)", url="https://stackoverflow.com/", focus="Programming Q&A (public; quality varies)", kind="forum"),
 dict(name="ESHackathon community", url="https://www.eshackathon.org/", focus="Open evidence-synthesis tooling community", kind="community"),
 dict(name="Open Life Science programme", url="https://openlifesci.org/", focus="Open science mentoring for life scientists", kind="mentoring programme"),
 dict(name="Carpentries workshops", url="https://carpentries.org/", focus="Coding and data workshops", kind="workshops"),
]
NEW_OPPS = [
 dict(kind="Funder portal (directory)", name="UKRI funding finder", url="https://www.ukri.org/opportunity/", note="Directory of UK research funding; no specific opportunity is asserted."),
 dict(kind="Funder portal (directory)", name="EU Funding & Tenders Portal", url="https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home", note="Directory of EU funding calls; no specific call is asserted."),
 dict(kind="Funder portal (directory)", name="Wellcome funding", url="https://wellcome.org/grant-funding", note="Directory of Wellcome funding schemes; no specific scheme/deadline is asserted."),
 dict(kind="Conference (recurring)", name="Global Evidence Summit", url="https://www.globalevidencesummit.org/", note="Joint evidence-synthesis summit series; dates/location/cost not verified."),
 dict(kind="Mentoring directory", name="CIMER resources", url="https://cimerproject.org/", note="Mentoring training resources; availability not verified."),
 dict(kind="Mentoring directory", name="National Research Mentoring Network", url="https://nrmnet.net/", note="US-focused mentoring resources; eligibility not verified."),
 dict(kind="Training directory", name="Cochrane Training", url="https://training.cochrane.org/", note="Courses and webinars; check current offerings and costs."),
 dict(kind="Workshops / hackathons", name="ESMARConf", url="https://esmarconf.org/", note="Online R-for-evidence-synthesis conference; details not verified."),
]
