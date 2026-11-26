"""Resource & organisation registries.

HONESTY RULE: `verified_on` is None unless a person or tool actually checked the
official page on that date. URLs below were entered from author knowledge of
well-known official sites and have NOT been fetched; the UI shows them as
'unverified'. Costs/eligibility/deadlines are deliberately NOT stated.
"""
RESOURCES = [
 dict(title="Cochrane Handbook for Systematic Reviews of Interventions", org="Cochrane", type="Methodological handbook", topic="Intervention reviews; effect measures; meta-analysis", level="All", discipline="Health", url="https://training.cochrane.org/handbook", modules=[3,4,32,35], why="Reference standard for intervention-review methods; check the current version before citing."),
 dict(title="JBI Manual for Evidence Synthesis", org="JBI", type="Methodological handbook", topic="Multiple review types incl. scoping", level="All", discipline="Health", url="https://jbi-global-wiki.refined.site/space/MANUAL", modules=[3,55], why="Covers scoping, qualitative, prevalence and other review types."),
 dict(title="PRISMA statement website", org="PRISMA group", type="Reporting guideline", topic="Reporting systematic reviews", level="All", discipline="All", url="https://www.prisma-statement.org/", modules=[16,76], why="Official home of PRISMA 2020 and extensions."),
 dict(title="EQUATOR Network reporting guideline library", org="EQUATOR Network", type="Reporting guideline directory", topic="Reporting guidelines", level="All", discipline="All", url="https://www.equator-network.org/", modules=[76], why="Search for the guideline matching your design."),
 dict(title="metafor package documentation", org="W. Viechtbauer", type="Software documentation", topic="Meta-analysis in R", level="Intermediate", discipline="All", url="https://www.metafor-project.org/", modules=[70], why="Gold-standard R package; our validation target."),
 dict(title="Doing Meta-Analysis with R: A Hands-On Guide", org="Harrer, Cuijpers, Furukawa, Ebert", type="Free online textbook", topic="Meta-analysis in R", level="Beginner-Intermediate", discipline="All", url="https://bookdown.org/MathiasHarrer/Doing_Meta_Analysis_in_R/", modules=[69,70], why="Practical R walkthrough."),
 dict(title="PROSPERO", org="CRD, University of York", type="Protocol registry", topic="Review registration", level="All", discipline="Health-related", url="https://www.crd.york.ac.uk/prospero/", modules=[8], why="Check current scope/eligibility on the site before planning registration (non-health topics may not qualify)."),
 dict(title="Open Science Framework (OSF) Registries", org="Center for Open Science", type="Protocol registry", topic="Preregistration, any discipline", level="All", discipline="All", url="https://osf.io/registries", modules=[8,82], why="Discipline-agnostic registration option."),
 dict(title="PubMed", org="NCBI / NLM", type="Bibliographic database", topic="Biomedical literature", level="All", discipline="Life sciences, medicine", url="https://pubmed.ncbi.nlm.nih.gov/", modules=[9,10], why="Free; MeSH vocabulary; relevant to Drosophila work."),
 dict(title="Europe PMC", org="EMBL-EBI", type="Bibliographic database", topic="Life sciences incl. preprints", level="All", discipline="Life sciences", url="https://europepmc.org/", modules=[9], why="Free; includes preprints and full-text search."),
 dict(title="OpenAlex", org="OurResearch", type="Open bibliographic index / API", topic="Scholarly metadata", level="Intermediate", discipline="All", url="https://openalex.org/", modules=[9,11], why="Open API for citation chasing."),
 dict(title="SYRCLE resources (animal studies)", org="SYRCLE, Radboudumc", type="Methodology/RoB tool", topic="Systematic reviews of animal studies", level="Intermediate", discipline="Preclinical", url="https://www.syrcle.nl/", modules=[22,59], why="Risk-of-bias tool for animal intervention studies; relevant to model organisms."),
 dict(title="Collaboration for Environmental Evidence guidelines", org="CEE", type="Methodological handbook", topic="Environmental evidence synthesis", level="Intermediate", discipline="Ecology/Environment", url="https://environmentalevidence.org/", modules=[63], why="Discipline guidance for ecology/environment."),
 dict(title="Campbell Collaboration", org="Campbell", type="Methodological guidance", topic="Social/education/policy reviews", level="Intermediate", discipline="Social science, education", url="https://www.campbellcollaboration.org/", modules=[65], why="Standards for social-science syntheses."),
 dict(title="GRADE Working Group", org="GRADE", type="Certainty framework", topic="Certainty of evidence", level="Intermediate", discipline="Health", url="https://www.gradeworkinggroup.org/", modules=[52], why="Origin of GRADE; see also verified Guyatt 2008 in references."),
 dict(title="WebPlotDigitizer", org="A. Rohatgi", type="Software", topic="Graph data extraction", level="Beginner", discipline="All", url="https://automeris.io/WebPlotDigitizer/", modules=[19], why="Check current licence/availability before use."),
]
ORGS = [
 dict(name="Cochrane", url="https://www.cochrane.org/", focus="Health evidence synthesis"),
 dict(name="Campbell Collaboration", url="https://www.campbellcollaboration.org/", focus="Social-science evidence synthesis"),
 dict(name="JBI", url="https://jbi.global/", focus="Evidence-based healthcare; multiple review types"),
 dict(name="Collaboration for Environmental Evidence", url="https://environmentalevidence.org/", focus="Environmental evidence synthesis"),
 dict(name="Society for Research Synthesis Methodology", url="https://www.srsm.org/", focus="Synthesis methodology research"),
 dict(name="EQUATOR Network", url="https://www.equator-network.org/", focus="Reporting guidelines"),
 dict(name="Center for Open Science", url="https://www.cos.io/", focus="Open science, OSF"),
 dict(name="Evidence Synthesis International", url="https://evidencesynthesis.org/", focus="Global evidence synthesis coordination"),
]
for d in RESOURCES + ORGS:
    d.setdefault("verified_on", None)   # never set automatically
    d.setdefault("cost", "not verified")
    d.setdefault("membership", "not verified")
