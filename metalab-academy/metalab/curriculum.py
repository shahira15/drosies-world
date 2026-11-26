"""84-module curriculum registry. status: outline (title+scope only, NO lesson) |
drafted (lesson exists, AI-drafted, awaiting expert review). Only `drafted`
modules open lessons; counts shown to users are computed from this table."""
PARTS = {1:"Foundations of science and evidence",2:"Research question development",3:"Protocols and registration",
4:"Information retrieval",5:"References and study selection",6:"Data extraction and management",
7:"Risk of bias and appraisal",8:"Statistics from first principles",9:"Effect sizes",10:"Core meta-analysis",
11:"Advanced meta-analysis",12:"Bias, robustness, certainty",13:"Non-quantitative synthesis",
14:"Discipline academies",15:"Programming",16:"Visualization and communication",
17:"Manuscript and publication",18:"Ethics, AI, open science"}
LEVELS = {0:"Research foundations",1:"Systematic review fundamentals",2:"Applied evidence synthesis",
3:"Quantitative meta-analysis",4:"Advanced & specialized methods",5:"Independent researcher & publication mastery"}
# (id, part, level, title)
_M = """1,1,0,Scientific reasoning
2,1,0,Research study designs
3,1,1,Introduction to evidence synthesis
4,2,1,Formulating research questions
5,2,1,Novelty and research gap identification
6,2,1,Feasibility and project planning
7,3,1,Protocol development
8,3,1,Registration and open protocols
9,4,2,Bibliographic databases
10,4,2,Advanced search strategies
11,4,2,Supplementary searching
12,4,2,Literature search reproducibility
13,5,2,Reference management
14,5,2,Deduplication
15,5,2,Study screening
16,5,2,PRISMA flow diagrams
17,6,2,Extraction framework
18,6,2,Quantitative data extraction
19,6,2,Graph digitization and unavailable data
20,6,2,Data quality and provenance
21,7,2,Bias fundamentals
22,7,2,Critical appraisal instruments
23,7,2,Risk-of-bias visualization
24,8,0,Mathematical foundations
25,8,1,Descriptive and inferential statistics
26,8,3,Statistical estimation and uncertainty
27,9,3,Continuous outcome effect sizes
28,9,3,Binary and categorical outcomes
29,9,3,Correlation and regression effects
30,9,3,Count, rate and survival outcomes
31,9,3,Effect-size transformations
32,10,3,Principles of quantitative pooling
33,10,3,Common-effect models
34,10,3,Random-effects models
35,10,3,Heterogeneity
36,10,3,Subgroup analysis
37,10,3,Meta-regression
38,11,4,Dependent effect sizes
39,11,4,Multilevel and multivariate meta-analysis
40,11,4,Robust variance estimation
41,11,4,Bayesian meta-analysis
42,11,4,Network meta-analysis
43,11,4,Dose-response meta-analysis
44,11,4,Diagnostic test accuracy meta-analysis
45,11,4,Prognostic and prediction model synthesis
46,11,4,Individual participant data meta-analysis
47,11,4,Prevalence and incidence meta-analysis
48,11,4,Rare-event meta-analysis
49,11,4,Additional specialized quantitative methods
50,12,3,Publication bias and missing evidence
51,12,3,Sensitivity and influence analysis
52,12,3,Certainty of evidence
53,13,2,Synthesis without meta-analysis
54,13,4,Qualitative evidence synthesis
55,13,2,Scoping reviews and evidence maps
56,13,4,Umbrella, rapid, living and realist reviews
57,14,4,Clinical medicine and healthcare
58,14,4,Public health and epidemiology
59,14,4,Preclinical and animal research
60,14,4,Molecular biology, genetics and biotechnology
61,14,4,Plant biology and agriculture
62,14,4,Microbiology and infectious disease
63,14,4,Ecology, evolution and environmental science
64,14,4,Psychology and behavioral science
65,14,4,Education and social science
66,14,4,Nutrition, food science and exercise
67,14,4,Economics, business and policy
68,14,4,Engineering and computer science
69,15,0,R programming from scratch
70,15,3,Meta-analysis in R
71,15,3,Python for evidence synthesis
72,15,4,Advanced computational reproducibility
73,16,3,Scientific visualization
74,16,3,Interpretation and communication
75,17,5,Scientific writing
76,17,5,Reporting guidelines
77,17,5,Journal selection
78,17,5,Submission and peer review
79,17,5,Research dissemination and impact
80,18,5,Research integrity
81,18,5,Responsible AI-assisted evidence synthesis
82,18,5,Open science and data governance
83,18,5,Research collaboration and leadership
84,18,5,Independent evidence synthesis mastery (capstone)"""
MODULES = []
for line in _M.splitlines():
    i, p, l, t = line.split(",", 3)
    MODULES.append(dict(id=int(i), part=int(p), part_name=PARTS[int(p)], level=int(l),
                        level_name=LEVELS[int(l)], title=t, status="outline"))
# Modules proposed beyond the 84 in the master specification, each with a documented justification (learning.PROPOSED_NEW_MODULES)
_PROPOSED = [(85, 6, 2, "Units of analysis, pseudoreplication and hierarchical data in laboratory biology"),
             (86, 9, 4, "Survival data and lifespan synthesis: hazard ratios, medians and curve reconstruction"),
             (87, 9, 4, "Sex as a biological variable in evidence synthesis"),
             (88, 2, 1, "Scanning the literature before committing: topic scans, query translation pitfalls and feasibility triage")]
for i, p, l, t in _PROPOSED:
    MODULES.append(dict(id=i, part=p, part_name=PARTS[p], level=l, level_name=LEVELS[l], title=t, status="outline", proposed=True))
BY_ID = {m["id"]: m for m in MODULES}

def mark_drafted(ids):
    for i in ids:
        BY_ID[i]["status"] = "drafted"

def counts():
    d = sum(m["status"] == "drafted" for m in MODULES)
    prop = sum(bool(m.get("proposed")) for m in MODULES)
    return dict(total=len(MODULES), specified=len(MODULES) - prop, proposed=prop, drafted=d, outline=len(MODULES) - d)
