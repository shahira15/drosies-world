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


def filter_resources(q="", types=(), disciplines=(), levels=(), access_free=False, categories=()):
    out = []
    for d in RESOURCES:
        text = " ".join([d["title"], d["org"], d["type"], d["topic"], d["why"], d["discipline"]]).lower()
        if q and not all(t in text for t in q.lower().split()): continue
        if types and d["type"] not in types: continue
        if categories and category(d) not in categories: continue
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


# ======================= v0.3 expansion: CANDIDATE resources (author knowledge; NOT verified) =======================
RESOURCES += [
 # ---- free textbooks / open educational resources
 R("R for Data Science (2nd ed.)","H. Wickham, M. Çetinkaya-Rundel, G. Grolemund","Free online textbook","R data import, tidying, visualisation","Beginner","All","https://r4ds.hadley.nz/","Free online (verify)","Learn data handling before meta-analysis code.",[69]),
 R("OpenIntro Statistics","OpenIntro","Free textbook","Introductory statistics","Beginner","All","https://www.openintro.org/book/os/","Free PDF/online (verify)","Core stats for Modules 24-26.",[24,25,26]),
 R("The Turing Way: handbook for reproducible research","The Turing Way community","Open handbook","Reproducibility, open research, collaboration","Intermediate","All","https://book.the-turing-way.org/","Free, open (verify licence)","Practical reproducibility guidance.",[72,82]),
 R("Happy Git with R","J. Bryan","Free online book","Git/GitHub for analysts","Beginner","All","https://happygitwithr.com/","Free online (verify)","Version control for analysis projects.",[72]),
 R("Quarto guide","Posit","Software documentation","Reproducible documents","Intermediate","All","https://quarto.org/docs/guide/","Free","Write manuscripts with code.",[72,75]),
 R("GO FAIR: FAIR principles","GO FAIR initiative","Guidance","FAIR data principles","Intermediate","All","https://www.go-fair.org/fair-principles/","Free","Explains FAIR.",[82]),
 # ---- statistical tutorials / documentation
 R("metafor analysis examples","W. Viechtbauer","Statistical tutorial / worked examples","Reproducing published meta-analyses in metafor","Intermediate","All","https://www.metafor-project.org/doku.php/analyses","Free (verify)","Worked examples used as validation targets.",[70,32,35,37,38,39]),
 R("metafor package documentation (CRAN PDF)","CRAN","Software documentation","rma, rma.mv, escalc, regtest","Intermediate","All","https://cran.r-project.org/web/packages/metafor/metafor.pdf","Free","Authoritative function reference.",[70]),
 R("R Project","R Foundation","Statistical software","R language","All","All","https://www.r-project.org/","Free, open source","Install R.",[69]),
 R("Posit (RStudio)","Posit","Software","RStudio IDE","Beginner","All","https://posit.co/","Free desktop IDE (verify)","IDE for R.",[69]),
 R("Python","Python Software Foundation","Programming language","Python","All","All","https://www.python.org/","Free, open source","Install Python.",[71]),
 R("Stata","StataCorp","Statistical software","Meta-analysis commands (meta suite)","Intermediate","Health, economics","https://www.stata.com/","Paid (verify)","Commercial alternative.",[32]),
 R("Comprehensive Meta-Analysis","Biostat","Statistical software","Meta-analysis GUI","Beginner","All","https://www.meta-analysis.com/","Paid (verify)","Commercial GUI.",[32]),
 # ---- video / courses (SEARCH links are not endorsements; they let you find current courses)
 R("Cochrane Interactive Learning","Cochrane Training","Online course","Conducting systematic reviews (modules)","Beginner","Health","https://training.cochrane.org/interactivelearning","Free/paid parts (verify)","Structured modules on review conduct.",[3,4,7,10,15,22,32]),
 R("Cochrane Training hub","Cochrane","Training portal","Webinars, courses, resources","All","Health","https://training.cochrane.org/","Mixed (verify)","Find current training and recorded webinars.",[3]),
 R("JBI education and training","JBI","Training portal","Evidence synthesis training","Intermediate","Health","https://jbi.global/education","Mixed (verify)","JBI training offerings.",[55]),
 R("SEARCH: YouTube - meta-analysis in R tutorials","YouTube search link","Video search (not a channel)","Recorded tutorials","All","All","https://www.youtube.com/results?search_query=meta-analysis+in+R+metafor+tutorial","Free; quality varies","No channel is endorsed or verified here - evaluate presenter, date and method correctness (compare with benchmarked MetaLab outputs).",[70]),
 R("SEARCH: YouTube - systematic review methods lectures","YouTube search link","Video search (not a channel)","Recorded lectures","All","All","https://www.youtube.com/results?search_query=systematic+review+methods+lecture","Free; quality varies","Starting point to find lectures from universities and Cochrane/JBI.",[3,10]),
 R("SEARCH: Coursera - meta-analysis / systematic review courses","Coursera search link","Online course search","Courses","All","All","https://www.coursera.org/search?query=meta-analysis","Free audit / paid certificates (verify)","Find current courses; check syllabus, instructor and date before enrolling.",[3]),
 R("SEARCH: edX - systematic review courses","edX search link","Online course search","Courses","All","All","https://www.edx.org/search?q=systematic%20review","Mixed (verify)","Find current university courses.",[3]),
 # ---- datasets
 R("SRDR+ (Systematic Review Data Repository)","AHRQ","Data repository / tool","Shared systematic-review data","Intermediate","Health","https://srdrplus.ahrq.gov/","Free (verify)","Example extraction data and a free extraction tool.",[17]),
 R("Dryad","Dryad","Data repository","Research datasets (incl. ecology/evolution)","All","All","https://datadryad.org/","Fees may apply to depositors (verify)","Find datasets; deposit your data.",[82]),
 R("FlyBase","FlyBase Consortium","Model organism database","Drosophila genes, stocks, nomenclature","All","Genetics, Drosophila","https://flybase.org/","Free","Gene/symbol synonyms for search strategies.",[10,60]),
 R("Alliance of Genome Resources","Alliance of Genome Resources","Model organism data portal","Cross-species gene/phenotype data","All","Genetics","https://www.alliancegenome.org/","Free","Cross-species gene info.",[60]),
 R("DrugAge / Human Ageing Genomic Resources","Human Ageing Genomic Resources","Database","Compounds affecting longevity in model organisms","All","Ageing biology","https://genomics.senescence.info/drugs/","Free (verify licence)","Source of primary studies; check overlap with existing meta-analyses.",[5,59]),
 R("Open Tree of Life","Open Tree of Life","Phylogeny resource","Phylogenies for comparative/ecological analyses","Advanced","Ecology, evolution","https://tree.opentreeoflife.org/","Free","Phylogenetic dependence (Module 49/63).",[63]),
 R("GBIF","GBIF","Biodiversity data","Species occurrence data","All","Ecology","https://www.gbif.org/","Free","Biodiversity data for ecology reviews.",[63]),
 R("TRY plant trait database","TRY","Trait database","Plant traits","Intermediate","Plant science","https://www.try-db.org/","Free on request (verify terms)","Plant functional traits.",[61]),
 # ---- registries / animal study resources
 R("preclinicaltrials.eu","PREPARE/consortium","Preregistration platform","Preregistration of animal studies","All","Preclinical","https://preclinicaltrials.eu/","Free (verify)","Preregistration for preclinical studies.",[8,59]),
 R("Animal Study Registry","German Centre for the Protection of Laboratory Animals (Bf3R)","Registry","Preregistration of animal studies","All","Preclinical","https://www.animalstudyregistry.org/","Free (verify)","Animal-study registry.",[8,59]),
 R("ARRIVE guidelines (NC3Rs)","NC3Rs","Reporting guideline","Reporting animal research","All","Preclinical","https://arriveguidelines.org/","Free","Reporting guideline for PRIMARY animal studies (not a risk-of-bias tool).",[22,59]),
 R("CAMARADES","CAMARADES collaboration","Research group","Systematic review of animal studies","Intermediate","Preclinical","https://www.ed.ac.uk/clinical-brain-sciences/research/camarades","Free (verify)","Preclinical meta-research group.",[59]),
 R("CONSORT statement","CONSORT group","Reporting guideline","Reporting randomised trials","All","Clinical","https://www.consort-statement.org/","Free","Reporting guideline for primary trials.",[76]),
 R("STROBE statement","STROBE group","Reporting guideline","Reporting observational studies","All","Epidemiology","https://www.strobe-statement.org/","Free","Reporting guideline for primary observational studies.",[76]),
 # ---- software for reviews / bibliometrics
 R("Systematic Review Toolbox","SR Toolbox","Software directory","Tools for systematic reviews","All","All","https://systematicreviewtools.com/","Free (verify)","Catalogue of review tools.",[15,17]),
 R("DistillerSR","Evidence Partners","Review software","Screening and extraction","Beginner","Health","https://www.distillersr.com/","Paid (verify)","Commercial review platform.",[15,17]),
 R("Mendeley","Elsevier","Reference manager","Reference management","Beginner","All","https://www.mendeley.com/","Free tier (verify)","Reference manager.",[13]),
 R("EndNote","Clarivate","Reference manager","Reference management and dedup","Beginner","All","https://endnote.com/","Paid (verify)","Reference manager with dedup workflows.",[13,14]),
 R("Paperpile","Paperpile","Reference manager","Reference management","Beginner","All","https://paperpile.com/","Paid (verify)","Reference manager.",[13]),
 R("VOSviewer","CWTS Leiden University","Bibliometric software","Citation networks and maps","Intermediate","All","https://www.vosviewer.com/","Free (verify)","Visualise literature networks.",[5,55]),
 # ---- research integrity / ethics / publishing
 R("COPE: Committee on Publication Ethics","COPE","Ethics resources","Publication ethics guidance","All","All","https://publicationethics.org/","Free guidance; membership paid (verify)","Authorship disputes, misconduct, corrections.",[80]),
 R("ICMJE Recommendations","ICMJE","Authorship criteria","Authorship and publication standards","All","Health, biomedical","https://www.icmje.org/recommendations/","Free","Authorship criteria many journals use.",[80,83]),
 R("CRediT: Contributor Roles Taxonomy","NISO","Taxonomy","Contributor roles","All","All","https://credit.niso.org/","Free","14 contributor roles.",[83]),
 R("Retraction Watch Database","Center for Scientific Integrity","Database","Retractions","All","All","https://retractiondatabase.org/","Free access (verify terms)","Check retractions before citing.",[13,80]),
 R("ORCID","ORCID","Researcher identifier","Persistent author IDs","All","All","https://orcid.org/","Free","Persistent identifier for you.",[79]),
 R("DORA: San Francisco Declaration on Research Assessment","DORA","Policy resource","Responsible research assessment","All","All","https://sfdora.org/","Free","Responsible bibliometrics.",[79]),
 R("Think. Check. Submit.","Think. Check. Submit. coalition","Checklist","Journal selection","All","All","https://thinkchecksubmit.org/","Free","Journal-trust checklist.",[77]),
 R("Directory of Open Access Journals (DOAJ)","DOAJ","Journal directory","OA journal vetting","All","All","https://doaj.org/","Free","Check OA journals.",[77]),
 R("Sherpa Romeo","Jisc","Policy database","Journal open-access/self-archiving policies","All","All","https://v2.sherpa.ac.uk/romeo/","Free (verify)","Check archiving rules.",[77,82]),
 R("ORI: Responsible Conduct of Research","US Office of Research Integrity","Ethics resources","Responsible conduct of research","All","All","https://ori.hhs.gov/","Free","Integrity training resources.",[80]),
 # ---- journals (candidate venues for evidence synthesis; verify scope/policies/fees on official pages)
 R("Research Synthesis Methods","Cambridge University Press (verify)","Scientific journal","Methodology of research synthesis","Advanced","Methodology","https://www.cambridge.org/core/journals/research-synthesis-methods","Verify access/fees","Venue for methods papers.",[75,77]),
 R("Systematic Reviews","BMC (Springer Nature)","Scientific journal","Systematic review reports/protocols","All","Health","https://systematicreviewsjournal.biomedcentral.com/","Open access; fees (verify)","Publishes protocols and reviews.",[77]),
 R("Environmental Evidence","BMC (Springer Nature)","Scientific journal","Environmental systematic reviews/maps","All","Ecology, environment","https://environmentalevidencejournal.biomedcentral.com/","Open access; fees (verify)","Ecology/environment venue.",[63,77]),
 R("Campbell Systematic Reviews","Campbell Collaboration / Wiley","Scientific journal","Social-science systematic reviews","All","Social science, education","https://onlinelibrary.wiley.com/journal/18911803","Verify access/fees","Social-science venue.",[65,77]),
 R("JBI Evidence Synthesis","JBI / Wolters Kluwer","Scientific journal","Evidence synthesis (various types)","All","Health","https://journals.lww.com/jbisrir/","Verify access/fees","JBI venue.",[55,77]),
 R("Methods in Ecology and Evolution","British Ecological Society / Wiley","Scientific journal","Methods incl. meta-analysis in ecology","Advanced","Ecology, evolution","https://besjournals.onlinelibrary.wiley.com/journal/2041210x","Verify access/fees","Methods venue for ecology.",[63,77]),
 R("Aging Cell","Wiley","Scientific journal","Ageing biology (incl. lifespan meta-analyses)","All","Ageing biology","https://onlinelibrary.wiley.com/journal/14749726","Verify access/fees","Venue for ageing biology; appeared in the topic scan.",[77]),
 R("Journal of Clinical Epidemiology","Elsevier","Scientific journal","Epidemiology and review methods","Advanced","Health","https://www.jclinepi.com/","Verify access/fees","Methods venue.",[77]),
]
ORGS += [
 dict(name="EPPI-Centre (UCL)", url="https://eppi.ioe.ac.uk/", focus="Evidence synthesis methods and tools (social policy and health)", discipline="Social science, health"),
 dict(name="AHRQ Evidence-based Practice Centers", url="https://www.ahrq.gov/research/findings/evidence-based-reports/", focus="US evidence reports", discipline="Health"),
 dict(name="Evidence Synthesis Hackathon", url="https://www.eshackathon.org/", focus="Open-source tools/events for evidence synthesis (environmental focus)", discipline="Ecology, methodology"),
 dict(name="CAMARADES", url="https://www.ed.ac.uk/clinical-brain-sciences/research/camarades", focus="Systematic review/meta-analysis of animal studies", discipline="Preclinical"),
 dict(name="Medical Library Association", url="https://www.mlanet.org/", focus="Health sciences librarians (find systematic-review librarians via your institution first)", discipline="Library science"),
 dict(name="ReproducibiliTea", url="https://reproducibilitea.org/", focus="Journal clubs on open science and reproducibility", discipline="All"),
 dict(name="Open Life Science", url="https://openlifesci.org/", focus="Open science mentoring/training programme for life scientists", discipline="Life sciences"),
 dict(name="The Carpentries", url="https://carpentries.org/", focus="Data/coding workshops", discipline="All"),
 dict(name="rOpenSci", url="https://ropensci.org/", focus="Open-source R tools and community for science", discipline="All"),
 dict(name="R-Ladies", url="https://rladies.org/", focus="R community and local chapters", discipline="All"),
 dict(name="National Research Mentoring Network", url="https://nrmnet.net/", focus="Mentoring resources (US-focused)", discipline="Biomedical"),
 dict(name="CIMER (Center for the Improvement of Mentored Experiences in Research)", url="https://cimerproject.org/", focus="Research-mentoring training resources", discipline="All"),
]
COMMUNITIES += [
 dict(name="Reddit r/PhD", url="https://www.reddit.com/r/PhD/", focus="Graduate-student community (public; quality varies)", kind="forum"),
 dict(name="Reddit r/statistics", url="https://www.reddit.com/r/statistics/", focus="Statistics discussion (public; quality varies)", kind="forum"),
 dict(name="Reddit r/bioinformatics", url="https://www.reddit.com/r/bioinformatics/", focus="Bioinformatics community (public; quality varies)", kind="forum"),
 dict(name="Reddit r/labrats", url="https://www.reddit.com/r/labrats/", focus="Lab-science community (public; quality varies)", kind="forum"),
 dict(name="metadat GitHub", url="https://github.com/wviechtb/metadat", focus="Meta-analysis datasets package issues", kind="software community"),
 dict(name="rOpenSci community forum", url="https://discuss.ropensci.org/", focus="R tools for open science", kind="forum"),
 dict(name="Posit Community", url="https://forum.posit.co/", focus="R/RStudio/Quarto Q&A", kind="forum"),
]
# Directories (not opportunities): where to look for events/funding/training. No specific call, deadline, fee or eligibility is asserted.
OPPORTUNITY_DIRECTORIES = [
 dict(kind="Conference (recurring)", name="Cochrane Colloquium", url="https://colloquium.cochrane.org/", note="Recurring evidence-synthesis meeting; dates/location/cost not verified."),
 dict(kind="Conference (recurring)", name="Evidence Live", url="https://evidencelive.org/", note="Recurring evidence-based medicine conference; details not verified."),
 dict(kind="Conference (recurring)", name="ESMARConf", url="https://esmarconf.org/", note="Online conference on evidence synthesis in R; details not verified."),
 dict(kind="Society meeting", name="Society for Research Synthesis Methodology", url="https://www.srsm.org/", note="Methodology society; meetings/membership not verified."),
 dict(kind="Workshops / hackathons", name="Evidence Synthesis Hackathon", url="https://www.eshackathon.org/", note="Events not verified."),
 dict(kind="Funder portal (directory)", name="NIH Grants & Funding", url="https://grants.nih.gov/", note="Directory of US NIH funding; no specific opportunity is asserted."),
 dict(kind="Funder portal (directory)", name="NSF funding", url="https://www.nsf.gov/funding/", note="Directory of US NSF funding; no specific opportunity is asserted."),
 dict(kind="Training directory", name="The Carpentries workshops", url="https://carpentries.org/workshops/", note="Workshop listings change; check dates and eligibility."),
 dict(kind="Search link (not an opportunity)", name="Search: summer school meta-analysis", url="https://www.google.com/search?q=summer+school+meta-analysis+evidence+synthesis", note="Search engine link; evaluate each result critically."),
 dict(kind="Search link (not an opportunity)", name="Search: fellowships research synthesis", url="https://www.google.com/search?q=fellowship+research+synthesis+evidence+synthesis", note="Search engine link; verify every call on the official funder page."),
]
for _d in RESOURCES[53:] + ORGS[11:] + COMMUNITIES[6:] + OPPORTUNITY_DIRECTORIES:
    _d.setdefault("verified_on", None); _d.setdefault("cost", "not verified"); _d.setdefault("membership", "not verified")

CATEGORIES = {"Free online textbook": "Textbooks", "Free online book": "Textbooks", "Free textbook": "Textbooks", "Paid textbook": "Textbooks", "Open handbook": "Textbooks", "Methodological handbook": "Handbooks & guidance", "Methodological guidance": "Handbooks & guidance", "Guidance": "Handbooks & guidance",
 "Online course": "Courses & training", "Training portal": "Courses & training", "Online course search": "Courses & training", "Video search (not a channel)": "Videos & lectures",
 "Statistical tutorial / worked examples": "Tutorials", "Software documentation": "Software & packages", "R package": "Software & packages", "R package / documentation": "Software & packages", "Python package": "Software & packages", "Python package documentation": "Software & packages",
 "Statistical software": "Software & packages", "Software": "Software & packages", "Review software": "Software & packages", "Review management software": "Software & packages", "Screening software": "Software & packages", "Open-source screening prioritisation": "Software & packages", "Reference manager": "Software & packages", "Software directory": "Software & packages", "Bibliometric software": "Software & packages", "Publishing system": "Software & packages", "Programming language": "Software & packages",
 "Reporting guideline": "Reporting guidelines", "Reporting guideline directory": "Reporting guidelines", "Methodology/RoB tool": "Risk-of-bias & appraisal tools", "Certainty framework": "Risk-of-bias & appraisal tools",
 "Bibliographic database": "Databases", "Open bibliographic index / API": "Databases", "DOI registry / API": "Databases", "Preprint server": "Databases", "Trial registry": "Registries", "Trial registry portal": "Registries", "Protocol registry": "Registries", "Registry": "Registries", "Preregistration platform": "Registries",
 "Research repository": "Repositories & datasets", "Research repository / project tool": "Repositories & datasets", "Code hosting": "Repositories & datasets", "Public datasets": "Repositories & datasets", "Data repository": "Repositories & datasets", "Data repository / tool": "Repositories & datasets", "Model organism database": "Repositories & datasets", "Model organism data portal": "Repositories & datasets", "Database": "Repositories & datasets", "Phylogeny resource": "Repositories & datasets", "Biodiversity data": "Repositories & datasets", "Trait database": "Repositories & datasets",
 "Ethics resources": "Integrity & ethics", "Authorship criteria": "Integrity & ethics", "Taxonomy": "Integrity & ethics", "Researcher identifier": "Integrity & ethics", "Policy resource": "Integrity & ethics", "Policy database": "Integrity & ethics", "Checklist": "Journals & publishing", "Journal directory": "Journals & publishing", "Scientific journal": "Journals & publishing", "Research group": "Organisations"}
def category(d): return CATEGORIES.get(d["type"], "Other")


# ======================= v0.4 expansion (see _resources_v04.py): CANDIDATES, never verified automatically =======================
from . import _resources_v04 as _v4
def _extend():
    have = {d["url"] for d in RESOURCES}
    for d in _v4.NEW_RESOURCES:
        if d["url"] not in have: d.setdefault("verified_on", None); d.setdefault("cost", "not verified"); d.setdefault("membership", "not verified"); RESOURCES.append(d); have.add(d["url"])
    for d in RESOURCES:
        extra = _v4.EXTRA_MODULES.get(d["url"])
        if extra: d["modules"] = sorted(set(d["modules"]) | set(extra))
    for lst, new, key in ((ORGS, _v4.NEW_ORGS, "name"), (COMMUNITIES, _v4.NEW_COMMUNITIES, "name"), (OPPORTUNITY_DIRECTORIES, _v4.NEW_OPPS, "name")):
        seen = {x["url"] for x in lst}
        for d in new:
            if d["url"] not in seen: d.setdefault("verified_on", None); d.setdefault("cost", "not verified"); d.setdefault("membership", "not verified"); lst.append(d); seen.add(d["url"])
_extend()
