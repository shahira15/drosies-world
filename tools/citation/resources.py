"""Single source of truth for Drosie's World citation data.

Every entry below corresponds to a page or file that exists in this repository
(checked by tests/citation/validate.py). Do not add an entry for a page that
does not exist, and do not add dates or identifiers that are not documented.

Documented facts used here:
  * Creator: Shahira Helal Arzoo, Department of Biological Sciences, Texas Tech University
    (site Team page and JSON-LD on team.html).
  * Only the storybook is dated (published 2026-10-22, Version 1.0, Zenodo DOI), per the Zenodo API record
    supplied by the author (metadata.json).
  * Every other resource is cited as undated (n.d.) with an access date. Copyright years and git commit
    dates are NOT used as publication dates.
  * `first_commit` is kept for maintainers only and is never shown or used in citations.
"""

import json as _json
import os as _os

META_PATH = _os.environ.get("DROSIE_CITE_METADATA") or _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "metadata.json")
META = _json.load(open(META_PATH, encoding="utf-8"))
_A, _B = META["author"], META["book"]
SITE = META["site"]["url"]
REPO = META["repository"]["url"]
PUBLISHER = META["site"]["name"]
PUB_DATE = _B["published_date"]        # applies ONLY to the storybook; everything else is undated
YEAR = PUB_DATE[:4]
AUTHOR_FAMILY = _A["family_names"]
AUTHOR_GIVEN = _A["given_names"]
AUTHOR_APA = _A["apa_name"]
AUTHOR_FULL = _A["display_name"]
AFFILIATION = _A["affiliation"]
AFFILIATION_ORG = _A["affiliation_org"]
ORCID = _A["orcid"]
AUTHOR_ID = SITE + "/team.html#author"
BOOK_DOI = _B["doi"]
CONCEPT_DOI = _B["concept_doi"]
BOOK_CREATOR = _B["creator_as_published"]
BOOK_LICENSE = _B["license"]
BOOK_LICENSE_SPDX = _B["license_spdx"]
BOOK_LICENSE_URL = _B["license_url"]
ILLUSTRATOR = _B["illustrator"]
SOFTWARE = META["software"]
LICENSE = META["license"]

# kind -> (schema.org types, RIS type, bib type)
GROUPS = [
    ("platform", "Platform"),
    ("storybook", "Storybook"),
    ("software", "Archived software"),
    ("simulation", "Simulations and games"),
    ("teacher", "Teacher resources"),
    ("lesson", "Individual lesson plans"),
    ("more", "More published resources"),
]

R = []


def add(**kw):
    kw.setdefault("doi", None)
    kw.setdefault("date", None)
    kw.setdefault("creator", None)    # author string as published, when it differs from the professional name
    kw.setdefault("year", None)       # None = undated (cited as n.d.)
    kw.setdefault("version", None)
    kw.setdefault("note", None)
    kw.setdefault("schema", None)
    kw.setdefault("file", None)       # repo file backing the URL
    kw.setdefault("first_commit", None)
    kw.setdefault("ages", None)
    kw.setdefault("status", "published")
    R.append(kw)


add(id="platform", group="platform", short="Drosie's World (whole platform)",
    title="Drosie's World", medium="Educational website",
    url=SITE + "/", file="index.html", first_commit="2026-11-02", ris="ELEC", bib="misc",
    desc="Free fruit fly science games, an illustrated storybook, lessons and teacher resources for children ages 5 to 8, families and teachers.",
    schema="WebSite", ages="5-8", note="Cite this entry when you refer to the platform as a whole.")

add(id="storybook", group="storybook", short="Drosie, the Fruit Fly (storybook)",
    title="Drosie, the Fruit Fly", medium="Illustrated storybook", version="1.0",
    doi=BOOK_DOI, year=YEAR, date=PUB_DATE, creator=BOOK_CREATOR, illustrator=ILLUSTRATOR, url="https://doi.org/" + BOOK_DOI, read_url=SITE + "/storybook.html",
    file="storybook.html", first_commit="2026-11-02", ris="BOOK", bib="misc", publisher="Zenodo",
    desc="An illustrated children's storybook that follows Drosie the fruit fly through the life cycle, the laboratory and the discoveries scientists have made with fruit flies.",
    schema="Book", ages="5-8", status="archived",
    note="Archived on Zenodo with a DOI. Illustrated by %s; the illustrations are used with the illustrator's permission, and citing the book does not grant permission to reproduce them." % ILLUSTRATOR)

add(id="secret-fly-lab", group="simulation", short="The Secret Fly Lab",
    title="The Secret Fly Lab", medium="Interactive educational game",
    url=SITE + "/lab/", file="lab/index.html", first_commit="2026-11-22", ris="COMP", bib="misc",
    desc="A story-led science game for ages 5 to 8: a Safety Academy, a stereomicroscope, fly anatomy and an observation mystery. It is a simulation made for learning.",
    schema="SoftwareApplication", ages="5-8")

add(id="climbing-challenge", group="simulation", short="Drosie's Climbing Challenge",
    title="Drosie's Climbing Challenge", medium="Interactive educational game",
    url=SITE + "/climbing-game.html", file="climbing-game.html", first_commit="2026-11-02", ris="COMP", bib="misc",
    desc="A virtual-lab game in which learners predict, observe and record the climbing of ten simulated fruit flies.",
    schema="SoftwareApplication", ages="5-12")

add(id="genetics-lab", group="simulation", short="Drosie Genetics Lab",
    title="Drosie Genetics Lab", medium="Interactive educational simulation",
    url=SITE + "/drosie-genetics-lab/", file="drosie-genetics-lab/index.html", first_commit="2026-11-22", ris="COMP", bib="misc",
    desc="A browser-based Drosophila genetics simulator: breed virtual flies, predict offspring with Punnett squares, explore chromosomes and test data with chi-square. Offspring data are simulated.",
    schema="SoftwareApplication", ages="5-undergraduate")

add(id="notebook-academy", group="simulation", short="Drosie's Lab Notebook Academy",
    title="Drosie's Lab Notebook Academy", medium="Interactive educational simulation",
    url=SITE + "/lab-notebook-academy.html", file="lab-notebook-academy.html", first_commit="2026-11-23", ris="COMP", bib="misc",
    desc="An interactive apprenticeship on how scientists keep honest laboratory notebooks, with printable notebook pages and a teacher and parent guide. It is not a validated professional electronic lab notebook.",
    schema="SoftwareApplication", ages="5-12")

add(id="conference", group="simulation", short="Drosie's First Scientific Conference",
    title="Drosie's First Scientific Conference", medium="Interactive educational simulation",
    url=SITE + "/scientific-conference.html", file="scientific-conference.html", first_commit="2026-11-23", ris="COMP", bib="misc",
    desc="A simulated scientific conference for ages 7 to 12: investigate a simulated fruit fly experiment or your own project, write an abstract, build a poster and practise presenting.",
    schema="LearningResource", ages="7-12")

add(id="life-cycle-adventure", group="simulation", short="Drosie's Life Cycle Adventure",
    title="Drosie's Life Cycle Adventure", medium="Interactive educational game",
    url=SITE + "/life-cycle-game.html", file="life-cycle-game.html", first_commit="2026-11-02", ris="COMP", bib="misc",
    desc="An interactive game about the fruit fly life cycle (egg, larva, pupa and adult). Illustrations are simplified and times are approximate.",
    schema="SoftwareApplication", ages="5-8")

add(id="grow-your-own", group="simulation", short="Grow Your Own Fruit Fly",
    title="Grow Your Own Fruit Fly", medium="Interactive educational simulation",
    url=SITE + "/grow-your-own-fruit-fly.html", file="grow-your-own-fruit-fly.html", first_commit="2026-11-02", ris="COMP", bib="misc",
    desc="A virtual fruit fly laboratory for ages 5 to 10: prepare food, set up a culture, observe development and make a lab report. It is a simulation with no live animals.",
    schema="SoftwareApplication", ages="5-10")

add(id="teacher-resources", group="teacher", short="Teacher resources (lesson-plan hub)",
    title="Free Fruit Fly Lesson Plans and Printable Science Worksheets for Teachers", medium="Educator resource collection",
    url=SITE + "/teacher-resources/", file="teacher-resources/index.html", first_commit="2026-11-23", ris="ELEC", bib="misc",
    desc="The hub for the seven lesson activity sheets, grade-band guidance, classroom activities and links to the teacher guides.",
    schema="CollectionPage", ages="5-8")

add(id="conference-guide", group="teacher", short="Conference teacher and parent guide",
    title="Teacher and Parent Guide: Drosie's First Scientific Conference", medium="Teacher guide",
    url=SITE + "/conference-teacher-guide.html", file="conference-teacher-guide.html", first_commit="2026-11-23", ris="ELEC", bib="misc",
    desc="Learning objectives, time estimates, discussion questions, assessment ideas, and privacy and accessibility notes for the conference simulation.",
    schema="LearningResource", ages="7-12")

add(id="genetics-teacher", group="teacher", short="Genetics Lab teacher and instructor resources",
    title="Teacher and Instructor Resources: Drosie Genetics Lab", medium="Teacher guide",
    url=SITE + "/drosie-genetics-lab/teacher/", file="drosie-genetics-lab/teacher/index.html", first_commit="2026-11-22", ris="ELEC", bib="misc",
    desc="Teacher guides, worksheets and printable resources for the Drosie Genetics Lab.",
    schema="LearningResource", ages="5-undergraduate")

add(id="genetics-worksheets", group="teacher", short="Genetics Lab printable worksheets",
    title="Drosie Genetics Lab: Printable Worksheets", medium="Printable worksheets",
    url=SITE + "/drosie-genetics-lab/teacher/worksheets.html", file="drosie-genetics-lab/teacher/worksheets.html", first_commit="2026-11-22", ris="ELEC", bib="misc",
    desc="Printable fruit fly genetics worksheets for ages 5 to undergraduate, with optional answer keys.",
    schema="LearningResource", ages="5-undergraduate")

add(id="genetics-reference", group="teacher", short="Genetics Lab scientific reference",
    title="Drosie Genetics Lab: Scientific Reference and Documentation", medium="Technical documentation",
    url=SITE + "/drosie-genetics-lab/docs/", file="drosie-genetics-lab/docs/index.html", first_commit="2026-11-22", ris="ELEC", bib="misc",
    desc="Genes, alleles, FlyBase identifiers, map positions and model assumptions behind the Genetics Lab, plus teacher and instructor guides.",
    schema="LearningResource", ages="5-undergraduate")

LESSONS = [
    (1, "Meet Drosie", "Observe small living things, ask questions, and begin a class Wonder Wall."),
    (2, "From Egg to Fly", "Sequence egg, larva, pupa, and adult; identify head, thorax, abdomen, wings, legs, and antennae."),
    (3, "Every Fly Is Different", "Compare sex-associated appearance, red and white eyes, and straight and curly wings."),
    (4, "Inside a Research Laboratory", "Explore how stereomicroscopes, pipettes, Petri dishes, vials, timers, and notebooks help scientists."),
    (5, "Who Can Be a Scientist?", "Explore who scientists are, what they do, and how they use task-appropriate PPE and safe practices."),
    (6, "Can Drosie Climb?", "Make predictions, observe an adult-led climbing assay or video, record trials, and interpret a graph."),
    (7, "Tiny Fly, Big Discoveries", "Discover why fruit flies are valuable for research on genes, development, movement, and aging."),
]
for n, t, d in LESSONS:
    add(id="lesson-%d" % n, group="lesson", short="Lesson %d: %s" % (n, t),
        title="Lesson %d: %s" % (n, t), medium="Lesson activity sheet with teacher mini-guide (PDF)",
        url="%s/lesson-%d-activity-sheet.pdf" % (SITE, n), file="lesson-%d-activity-sheet.pdf" % n,
        first_commit="2026-11-02", ris="GEN", bib="misc", desc=d, schema="LearningResource", ages="5-8",
        parent="teacher-resources")

add(id="life-cycle-activities", group="more", short="Fruit fly life cycle activities",
    title="Fruit Fly Life Cycle Activities for Kids: Free Games and Worksheets", medium="Educator resource page",
    url=SITE + "/fruit-fly-life-cycle-activities/", file="fruit-fly-life-cycle-activities/index.html", first_commit="2026-11-23", ris="ELEC", bib="misc",
    desc="Life cycle stages, complete metamorphosis, three classroom activities, discussion questions and assessment ideas.",
    schema="LearningResource", ages="5-14")

add(id="fruit-fly-biology", group="more", short="Fruit fly biology background",
    title="Fruit Fly Biology for Students and Teachers: Drosophila melanogaster Facts", medium="Educator resource page",
    url=SITE + "/fruit-fly-biology/", file="fruit-fly-biology/index.html", first_commit="2026-11-23", ris="ELEC", bib="misc",
    desc="Background on the Drosophila melanogaster life cycle, anatomy and genetics, with a reference list.",
    schema="LearningResource",
    note="This page summarises published science. For scientific claims, cite the primary sources in its reference list as well.")

add(id="letters", group="more", short="Letters from Drosie",
    title="Letters from Drosie", medium="Illustrated reading resource",
    url=SITE + "/letters/", file="letters/index.html", first_commit="2026-11-22", ris="ELEC", bib="misc",
    desc="Short, friendly science letters from Drosie for reading practice and family connection.",
    schema="LearningResource", ages="5-8")

add(id="discoveries", group="more", short="Drosie's Discovery Library",
    title="Drosie's Discovery Library", medium="Educational web resource",
    url=SITE + "/discoveries.html", file="discoveries.html", first_commit="2026-11-22", ris="ELEC", bib="misc",
    desc="Real fruit fly research explained for children and families.",
    schema="LearningResource",
    note="This library explains research done by others. For scientific claims, cite the original research as well.")

# Archived software appears ONLY when a verified software DOI has been entered in metadata.json.
if SOFTWARE.get("doi"):
    add(id="software-archive", group="software", short="Drosie's World (archived software release)",
        title=SOFTWARE.get("title") or "Drosie's World", medium="Software", version=SOFTWARE.get("version"),
        doi=SOFTWARE["doi"], year=(SOFTWARE.get("date_released") or "")[:4] or None, url="https://doi.org/" + SOFTWARE["doi"],
        read_url=SITE + "/", file="index.html", ris="COMP", bib="misc", publisher="Zenodo", status="archived",
        desc="A versioned release of the Drosie's World source code, archived with a DOI.", schema="SoftwareApplication")

# Fill first_commit for files that were not given one by looking at git history (done by build script).
BY_ID = {r["id"]: r for r in R}
