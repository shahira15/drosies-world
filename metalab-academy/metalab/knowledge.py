"""Knowledge Universe: curated, tiered READING LISTS for every module, built from (a) the lesson's bibliographically verified references,
(b) candidate resources tagged to the module (never verified automatically), (c) built-in example datasets with provenance and (d) example reviews with verified records.
Verification levels stay separate (see resources.py / verification.py). Filters: topic/module, discipline, difficulty, cost, format, learning objective."""
from __future__ import annotations
from . import resources, references, lessons, curriculum, verification

# built-in example datasets: provenance is the package documentation of metadat (R) which cites the source paper; the record of that paper is bibliographically verified
DATASETS = [
 dict(id="BCG", name="BCG vaccine trials (13 trials)", used_in=[28, 32, 34, 35, 36, 37, 41, 70, 71], source_ref="colditz1994", where="metalab.datasets.BCG; Statistics Lab", note="Classic example for random-effects meta-analysis and meta-regression (latitude)."),
 dict(id="HASSELBLAD", name="Smoking cessation network (24 studies, 4 interventions)", used_in=[42], source_ref="hasselblad1998", where="metalab.datasets.HASSELBLAD; Statistics Lab > Advanced methods II", note="Multi-arm network meta-analysis example."),
 dict(id="BERKEY", name="Periodontal trials, two correlated outcomes", used_in=[39], source_ref="berkey1998", where="metalab.datasets.BERKEY_*; Statistics Lab > Advanced methods II", note="Multivariate meta-analysis example."),
 dict(id="KONSTANTOPOULOS", name="Multisite school trials (56 effects in 11 districts)", used_in=[39, 40], source_ref="konstantopoulos2011", where="metalab.datasets.KON_*; Statistics Lab", note="Three-level model and CR2 example."),
 dict(id="NIELWEISE", name="Catheter trials with zero cells (18 studies)", used_in=[48], source_ref="nielweise2007", where="validation/reference (metadat)", note="Rare-event/continuity-correction example."),
 dict(id="MOURA", name="Assortative mating effects with a phylogeny (subset)", used_in=[39, 63], source_ref="moura2021", where="validation/reference_v04.json (subset of 150 effects, 25 species)", note="Phylogenetic meta-analysis benchmark."),
 dict(id="DTA_SYNTHETIC", name="Synthetic DTA table (12 simulated studies)", used_in=[44], source_ref=None, where="metalab.datasets.DTA_SYNTHETIC", note="SIMULATED teaching data - not real studies."),
 dict(id="VLAB", name="Virtual Lab scenarios (fictional)", used_in=[84, 85, 86, 87, 88, 3, 4, 17, 18, 21, 22], source_ref=None, where="Virtual Lab; metalab/vlab.py; metalab/scenarios.py", note="FICTIONAL data with planted errors; never mix with real projects."),
]
# real example reviews / meta-research whose RECORDS are verified (bibliographic) - listed as examples to READ, not endorsements of their conclusions
EXAMPLE_REVIEWS = [
 dict(ref="swindell2017", why="Preclinical example: meta-analysis of rapamycin lifespan experiments in mice.", modules=[59, 35, 85, 86]),
 dict(ref="colditz1994", why="Classic clinical meta-analysis example (BCG).", modules=[28, 35, 57]),
 dict(ref="fanelli2009", why="Meta-analysis of survey data on research misconduct.", modules=[80, 47]),
 dict(ref="lundh2017", why="Methodology review: industry sponsorship and research outcome.", modules=[89, 57]),
 dict(ref="kvarven2019", why="Meta-research: meta-analyses vs preregistered multi-lab replications.", modules=[64, 49, 50]),
 dict(ref="osc2015", why="Large replication project in psychology.", modules=[64, 80]),
 dict(ref="vesterinen2014", why="Practical guide to meta-analysis of animal-study data.", modules=[59, 60]),
 dict(ref="nakagawa2017meta", why="Ten appraisal questions for meta-analyses in biology.", modules=[59, 60, 61, 62, 63]),
 dict(ref="koricheva2014", why="Uses and misuses of meta-analysis in plant ecology.", modules=[61, 63]),
]

def reading_list(module_id):
    """Tiered reading list for one module. Sections: core (verified refs), guidance/handbooks, courses & videos, tutorials & software, datasets & examples, communities & events."""
    L = lessons.load().get(module_id); m = curriculum.BY_ID[module_id]
    core = [references.REFS[k] | {"key": k} for k in (L["further"] if L else []) if k in references.REFS]
    res = [d for d in resources.RESOURCES if module_id in d["modules"]]; cat = lambda d: resources.category(d)
    sec = lambda *cs: [d for d in res if cat(d) in cs]
    ex = [dict(references.REFS[e["ref"]], key=e["ref"], why=e["why"]) for e in EXAMPLE_REVIEWS if module_id in e["modules"] and e["ref"] in references.REFS]
    ds = [d for d in DATASETS if module_id in d["used_in"]]
    events = [dict(name=o["name"], url=o["url"], kind=o["kind"], note=o["note"]) for o in resources.OPPORTUNITY_DIRECTORIES if module_id in (3, 8, 15, 32, 35, 42, 56, 70, 72, 83, 84)]
    return dict(module=module_id, title=m["title"], objectives=(L["objectives"] if L else []), core_verified_references=core,
                guidance=sec("Handbooks & guidance", "Reporting guidelines", "Risk-of-bias & appraisal tools", "Textbooks"), courses_videos=sec("Courses & training", "Videos & lectures"),
                tutorials_software=sec("Tutorials", "Software & packages"), databases_registries=sec("Databases", "Registries"), repositories_datasets=sec("Repositories & datasets"),
                integrity_publishing=sec("Integrity & ethics", "Journals & publishing"), example_reviews=ex, built_in_datasets=ds, communities_events=events,
                all_candidates=res)


def coverage():
    """Audit used by tests and the UI: per module, counts of verified references and candidate resources by section."""
    rows = []
    for m in curriculum.MODULES:
        r = reading_list(m["id"]); rows.append(dict(module=m["id"], title=m["title"], verified_refs=len(r["core_verified_references"]), candidates=len(r["all_candidates"]),
                                                   guidance=len(r["guidance"]), courses_videos=len(r["courses_videos"]), tutorials_software=len(r["tutorials_software"]), datasets_examples=len(r["built_in_datasets"]) + len(r["example_reviews"])))
    return rows


FORMATS = ["Courses & training", "Videos & lectures", "Textbooks", "Handbooks & guidance", "Tutorials", "Software & packages", "Reporting guidelines", "Risk-of-bias & appraisal tools", "Databases", "Registries",
           "Repositories & datasets", "Integrity & ethics", "Journals & publishing"]

def filter_candidates(q="", fmt=(), discipline=(), level=(), free_only=False, module=None, objective_query=""):
    """Filter by format (category), discipline, difficulty, cost (free-only is based on the UNVERIFIED access text), module and free-text over the module's learning objectives."""
    out = resources.filter_resources(q, (), discipline, level, free_only, fmt)
    if module is not None: out = [d for d in out if module in d["modules"]]
    if objective_query:
        ids = {m for m, L in lessons.load().items() if any(objective_query.lower() in o.lower() for o in L["objectives"])}
        out = [d for d in out if set(d["modules"]) & ids]
    return out
