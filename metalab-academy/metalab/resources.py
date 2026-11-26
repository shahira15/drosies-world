"""Resource, organisation and community registries.

VERIFICATION LEVELS (kept separate, never conflated):
  bibliographic  - record exists with matching metadata (PubMed/Crossref)  -> refs_verified.json / references.py
  link           - the URL responded on a stated date (tools/check_links.py -> link_checks.json). Says NOTHING about content.
  full_text      - a person/agent read the source: not claimed for any entry here unless `examined` is set.
  claim_support  - the source supports a specific claim: see claims.json.
`verified_on` stays None for entries never checked. Costs/eligibility/deadlines are deliberately not stated
unless examined. Entries were chosen from author knowledge of well-known sources; the user must check currency.
"""
import json
from pathlib import Path
def R(title, org, type_, topic, level, discipline, url, access, why, modules, audience="Researchers", doi=None):
    return dict(title=title, org=org, type=type_, topic=topic, level=level, discipline=discipline, url=url, access=access, why=why,
                modules=modules, audience=audience, doi=doi)
RESOURCES = [
 # ---- handbooks / guidance
 R("Cochrane Handbook for Systematic Reviews of Interventions","Cochrane","Methodological handbook","Intervention reviews; effect measures; meta-analysis","All","Health","https://training.cochrane.org/handbook","Free online (check current version)","Reference standard for intervention-review methods.",[3,4,7,10,18,27,32,35,52]),
 R("JBI Manual for Evidence Synthesis","JBI","Methodological handbook","Many review types incl. scoping, qualitative, prevalence","All","Health","https://jbi-global-wiki.refined.site/space/MANUAL","Free online (verify)","Covers review types beyond effectiveness.",[3,55,54]),
 R("Campbell Collaboration methods resources","Campbell Collaboration","Methodological guidance","Social, education, policy reviews","Intermediate","Social science, education","https://www.campbellcollaboration.org/","Free (verify)","Standards for social-science syntheses.",[65]),
 R("Collaboration for Environmental Evidence guidance","CEE","Methodological guidance","Environmental systematic reviews/maps","Intermediate","Ecology, environment","https://environmentalevidence.org/","Free (verify)","Discipline guidance for ecology/environment.",[63]),
 R("GRADE Working Group","GRADE","Certainty framework","Certainty of evidence","Intermediate","Health","https://www.gradeworkinggroup.org/","Free (verify)","Home of GRADE guidance.",[52]),
 R("SYRCLE resources","SYRCLE, Radboudumc","Methodology/RoB tool","Systematic reviews of animal studies","Intermediate","Preclinical","https://www.syrcle.nl/","Free (verify)","Animal-study methodology incl. risk-of-bias tool.",[22,59]),
 # ---- reporting guidelines (hub sites)
 R("PRISMA statement website","PRISMA group","Reporting guideline","Reporting systematic reviews","All","All","https://www.prisma-statement.org/","Free","Official PRISMA 2020 and extensions.",[16,76]),
 R("EQUATOR Network library","EQUATOR Network","Reporting guideline directory","Reporting guidelines for all designs","All","All","https://www.equator-network.org/","Free","Find the right reporting guideline.",[76]),
 R("ROSES reporting standards","ROSES","Reporting guideline","Environmental evidence syntheses","Intermediate","Ecology, environment","https://www.roses-reporting.com/","Free (verify)","Reporting standard used with CEE methods.",[63,76]),
 # ---- textbooks / courses
 R("Doing Meta-Analysis with R: A Hands-On Guide","Harrer, Cuijpers, Furukawa, Ebert","Free online textbook","Meta-analysis in R","Beginner-Intermediate","All","https://bookdown.org/MathiasHarrer/Doing_Meta_Analysis_in_R/","Free online","Practical R walkthrough.",[69,70,32,35]),
 R("Introduction to Meta-Analysis (Borenstein et al.)","Wiley","Paid textbook","Meta-analysis foundations","Beginner","All","https://www.wiley.com/","Paid (check publisher page)","Widely used textbook; do not copy.",[32,33,34]),
 R("Handbook of Meta-analysis in Ecology and Evolution (Koricheva, Gurevitch, Mengersen)","Princeton University Press","Paid textbook","Ecological meta-analysis","Intermediate","Ecology, evolution","https://press.princeton.edu/","Paid (check publisher page)","Standard ecology/evolution reference.",[63,27,38]),
 # ---- R packages
 R("metafor (R package) - official site","W. Viechtbauer","R package / documentation","General meta-analysis, meta-regression, multilevel","Intermediate","All","https://www.metafor-project.org/","Free","Gold-standard R package; MetaLab's validation target.",[70,32,37,38,39]),
 R("metafor on CRAN","CRAN","R package","Meta-analysis","Intermediate","All","https://cran.r-project.org/package=metafor","Free","Current release, manual and vignettes.",[70]),
 R("meta (R package) on CRAN","G. Schwarzer","R package","Meta-analysis (common/random effects, forest plots)","Beginner-Intermediate","All","https://cran.r-project.org/package=meta","Free","Alternative to metafor; useful for cross-checks.",[70]),
 R("metadat (R package): datasets for meta-analysis","W. Viechtbauer et al.","Public datasets","Published meta-analytic datasets","All","All","https://cran.r-project.org/package=metadat","Free","Used by MetaLab for validation (examined: dat.bcg, dat.raudenbush1985, ...).",[70,35]),
 R("clubSandwich (R package)","J. Pustejovsky","R package","Cluster-robust variance estimation","Advanced","All","https://cran.r-project.org/package=clubSandwich","Free","Robust variance estimation for dependent effects.",[40]),
 R("netmeta (R package)","G. Rücker, G. Schwarzer et al.","R package","Network meta-analysis","Advanced","Health","https://cran.r-project.org/package=netmeta","Free","Frequentist NMA.",[42]),
 R("bayesmeta (R package)","C. Röver","R package","Bayesian random-effects meta-analysis","Advanced","All","https://cran.r-project.org/package=bayesmeta","Free","Bayesian MA with heterogeneity priors.",[41]),
 R("dosresmeta (R package)","A. Crippa, N. Orsini","R package","Dose-response meta-analysis","Advanced","Epidemiology","https://cran.r-project.org/package=dosresmeta","Free","Dose-response syntheses.",[43]),
 R("robvis (R package / web app)","McGuinness & Higgins","R package","Risk-of-bias visualisation","Beginner","Health","https://cran.r-project.org/package=robvis","Free","Traffic-light plots for RoB tools.",[23]),
 R("orchaRd (R package)","S. Nakagawa et al.","R package","Ecological/evolutionary meta-analysis visualisation","Intermediate","Ecology, evolution","https://cran.r-project.org/package=orchaRd","Free (CRAN availability: verify)","Orchard plots for multilevel meta-analyses.",[39,73]),
 R("renv (R package)","Posit","R package","Reproducible R environments","Intermediate","All","https://cran.r-project.org/package=renv","Free","Lock package versions.",[72]),
 # ---- Python
 R("statsmodels: meta-analysis","statsmodels developers","Python package documentation","Meta-analysis in Python","Intermediate","All","https://www.statsmodels.org/stable/meta_analysis.html","Free","Python implementation of common meta-analysis; compare with R before relying on it.",[71]),
 R("PyMARE","NiMARE developers","Python package","Meta-regression estimators","Advanced","Neuroimaging, general","https://pymare.readthedocs.io/","Free (verify)","Python meta-regression estimators.",[71]),
 # ---- screening/software
 R("Rayyan","Rayyan","Screening software","Title/abstract screening","Beginner","All","https://www.rayyan.ai/","Free tier + paid (verify)","Collaborative screening; check current pricing and terms.",[15]),
 R("Covidence","Covidence","Review management software","Screening, extraction, RoB","Beginner","Health","https://www.covidence.org/","Paid / institutional (verify)","Common in Cochrane-style reviews.",[15,17]),
 R("EPPI-Reviewer","EPPI-Centre, UCL","Review software","Screening, coding, synthesis","Intermediate","Social science, health","https://eppi.ioe.ac.uk/","Paid (verify)","Supports diverse synthesis types.",[15,17,54]),
 R("ASReview","Utrecht University","Open-source screening prioritisation","Active-learning screening","Intermediate","All","https://asreview.nl/","Free, open source","Prioritisation tool; AI is never an independent reviewer.",[15,81]),
 R("WebPlotDigitizer","A. Rohatgi","Software","Graph data extraction","Beginner","All","https://automeris.io/","Free to use (verify licence)","Digitise figures; label values 'reconstructed'.",[19]),
 R("GRADEpro GDT","McMaster/Evidence Prime","Software","Summary-of-findings tables, GRADE","Intermediate","Health","https://www.gradepro.org/","Free tier (verify)","SoF tables.",[52]),
 R("RevMan","Cochrane","Software","Cochrane review authoring and meta-analysis","Beginner","Health","https://training.cochrane.org/online-learning/core-software/revman","Free for Cochrane authors (verify)","Cochrane's review software.",[32]),
 R("JASP","JASP Team","Statistical software","Point-and-click statistics incl. meta-analysis","Beginner","All","https://jasp-stats.org/","Free, open source","GUI alternative.",[32]),
 R("jamovi","jamovi project","Statistical software","Point-and-click statistics (MAJOR module for meta-analysis)","Beginner","All","https://www.jamovi.org/","Free, open source","GUI alternative.",[32]),
 R("Zotero","Roy Rosenzweig Center for History and New Media / Corporation for Digital Scholarship","Reference manager","Reference management","Beginner","All","https://www.zotero.org/","Free, open source","RIS/BibTeX export.",[13]),
 R("Quarto","Posit","Publishing system","Reproducible documents","Intermediate","All","https://quarto.org/","Free, open source","Reproducible manuscripts.",[72,75]),
 # ---- databases / registries / repositories
 R("PubMed","NCBI / NLM","Bibliographic database","Biomedical & life-science literature","All","Life sciences, medicine","https://pubmed.ncbi.nlm.nih.gov/","Free","MeSH; used in the MetaLab topic scan.",[9,10]),
 R("Europe PMC","EMBL-EBI","Bibliographic database","Life sciences incl. preprints","All","Life sciences","https://europepmc.org/","Free","Preprints and full-text search.",[9,11]),
 R("OpenAlex","OurResearch","Open bibliographic index / API","Scholarly metadata, citations","Intermediate","All","https://openalex.org/","Free","Open API for citation chasing.",[9,11]),
 R("Crossref REST API","Crossref","DOI registry / API","Bibliographic metadata verification","Intermediate","All","https://www.crossref.org/documentation/retrieve-metadata/rest-api/","Free","Used by MetaLab's reference verifier.",[13]),
 R("Semantic Scholar","Allen Institute for AI","Bibliographic database","Computer-science/biomedical literature","Beginner","All","https://www.semanticscholar.org/","Free","Citation graph; AI summaries are not evidence.",[9,11]),
 R("ERIC","Institute of Education Sciences","Bibliographic database","Education research","All","Education","https://eric.ed.gov/","Free","Primary database for education reviews.",[9,65]),
 R("ClinicalTrials.gov","NLM","Trial registry","Registered clinical trials","All","Clinical","https://clinicaltrials.gov/","Free","Search for unpublished trials.",[9,11]),
 R("WHO ICTRP search portal","WHO","Trial registry portal","International trial registrations","All","Clinical","https://www.who.int/tools/clinical-trials-registry-platform","Free","Multi-registry search.",[9,11]),
 R("AGRIS","FAO","Bibliographic database","Agricultural science","All","Agriculture, plant science","https://agris.fao.org/","Free","Agricultural literature.",[9,61]),
 R("bioRxiv","Cold Spring Harbor Laboratory","Preprint server","Biology preprints","All","Life sciences","https://www.biorxiv.org/","Free","Preprints; not peer-reviewed.",[11]),
 R("medRxiv","Cold Spring Harbor Laboratory / Yale / BMJ","Preprint server","Medical preprints","All","Medicine","https://www.medrxiv.org/","Free","Preprints; not peer-reviewed.",[11]),
 R("PROSPERO","CRD, University of York","Protocol registry","Review registration","All","Health-related","https://www.crd.york.ac.uk/prospero/","Free (check scope/eligibility yourself)","Read current eligibility before planning.",[8]),
 R("OSF Registries","Center for Open Science","Protocol registry","Preregistration, any discipline","All","All","https://osf.io/registries","Free","Discipline-agnostic registration.",[8,82]),
 R("INPLASY","INPLASY","Protocol registry","Review protocol registration","All","All","https://inplasy.com/","Check fees/terms yourself","Alternative registry; verify terms.",[8]),
 R("Zenodo","CERN / OpenAIRE","Research repository","Archiving data/code with DOIs","All","All","https://zenodo.org/","Free","Archive reproducibility packages.",[72,82]),
 R("Open Science Framework","Center for Open Science","Research repository / project tool","Projects, preprints, registrations","All","All","https://osf.io/","Free","Project management and sharing.",[82]),
 R("GitHub","GitHub","Code hosting","Version control and sharing","Intermediate","All","https://github.com/","Free tier","Reproducible code.",[72]),
 # ---- foundational/methodological papers are in references.py (verified records)
]
ORGS = [
 dict(name="Cochrane", url="https://www.cochrane.org/", focus="Health evidence synthesis", discipline="Health"),
 dict(name="Campbell Collaboration", url="https://www.campbellcollaboration.org/", focus="Social-science evidence synthesis", discipline="Social science, education"),
 dict(name="JBI", url="https://jbi.global/", focus="Evidence-based healthcare; multiple review types", discipline="Health"),
 dict(name="Collaboration for Environmental Evidence", url="https://environmentalevidence.org/", focus="Environmental evidence synthesis", discipline="Ecology, environment"),
 dict(name="Society for Research Synthesis Methodology", url="https://www.srsm.org/", focus="Research-synthesis methodology (society)", discipline="Methodology"),
 dict(name="EQUATOR Network", url="https://www.equator-network.org/", focus="Reporting guidelines", discipline="All"),
 dict(name="Center for Open Science", url="https://www.cos.io/", focus="Open science, OSF", discipline="All"),
 dict(name="Evidence Synthesis International", url="https://evidencesynthesis.org/", focus="Global evidence synthesis coordination", discipline="All"),
 dict(name="SYRCLE", url="https://www.syrcle.nl/", focus="Systematic reviews of animal studies", discipline="Preclinical"),
 dict(name="ESMARConf (Evidence Synthesis & Meta-Analysis in R Conference)", url="https://esmarconf.org/", focus="Community conference on R tools for evidence synthesis (dates/cost not verified)", discipline="Methodology, R"),
 dict(name="CRD, University of York", url="https://www.york.ac.uk/crd/", focus="Reviews and dissemination; hosts PROSPERO", discipline="Health"),
]
COMMUNITIES = [
 dict(name="Reddit r/rstats", url="https://www.reddit.com/r/rstats/", focus="R programming Q&A (public forum; quality varies)", kind="forum"),
 dict(name="Reddit r/AskStatistics", url="https://www.reddit.com/r/AskStatistics/", focus="Statistics questions (public forum; quality varies)", kind="forum"),
 dict(name="Cross Validated (Stack Exchange)", url="https://stats.stackexchange.com/", focus="Statistics Q&A; search before asking", kind="forum"),
 dict(name="metafor GitHub repository", url="https://github.com/wviechtb/metafor", focus="Issues/discussions for the metafor package", kind="software community"),
 dict(name="ASReview GitHub", url="https://github.com/asreview/asreview", focus="Open-source screening tool community", kind="software community"),
 dict(name="R-hub / R community resources", url="https://r-hub.github.io/", focus="R package development help", kind="community"),
]
for _d in RESOURCES + ORGS + COMMUNITIES:
    _d.setdefault("verified_on", None)       # bibliographic/full-text verification: never set automatically
    _d.setdefault("cost", "not verified"); _d.setdefault("membership", "not verified")
_lc = Path(__file__).with_name("link_checks.json")
LINKS = json.loads(_lc.read_text()) if _lc.exists() else {}
def link_status(url):
    c = LINKS.get(url)
    return "not checked" if not c else f"{c['result']} on {c['checked_on']}"


def filter_resources(q="", types=(), disciplines=(), levels=(), access_free=False):
    out = []
    for d in RESOURCES:
        text = " ".join([d["title"], d["org"], d["type"], d["topic"], d["why"], d["discipline"]]).lower()
        if q and not all(t in text for t in q.lower().split()): continue
        if types and d["type"] not in types: continue
        if disciplines and not any(x.lower() in d["discipline"].lower() or d["discipline"] == "All" for x in disciplines): continue
        if levels and not any(l in d["level"] for l in levels): continue
        if access_free and "paid" in d["access"].lower() and "free" not in d["access"].lower(): continue
        out.append(d)
    return out


def verification_levels(d):
    """The four separate levels, stated plainly for one resource."""
    return dict(bibliographic="n/a (not a paper record)" if not d.get("doi") else "see references.py", link=link_status(d["url"]),
                full_text="not examined" if not d.get("examined") else d["examined"], claim_support="not assessed (see claims registry)")


def recommend(module_id):
    """Resources tagged to a module + verified references cited by its lesson (if any)."""
    from . import lessons, references
    L = lessons.load().get(module_id)
    refs = [references.REFS[k] | {"key": k} for k in (L["further"] if L else []) if k in references.REFS]
    return dict(resources=[d for d in RESOURCES if module_id in d["modules"]], references=refs)
