import io, json, math, zipfile, xml.dom.minidom
import numpy as np, pytest
from metalab import workflow as W, stats as S, workflows, rob_tools
from metalab.store import Store

# ---------------------------------------------------------------- kappa
def test_kappa_textbook_example():
    # 2x2 table [[20,5],[10,15]] n=50: po=0.70, pe=0.5 -> kappa=0.40 (hand-calculated)
    r1 = ["y"] * 20 + ["y"] * 5 + ["n"] * 10 + ["n"] * 15
    r2 = ["y"] * 20 + ["n"] * 5 + ["y"] * 10 + ["n"] * 15
    k = W.cohens_kappa(r1, r2)
    assert k["kappa"] == pytest.approx(0.4) and k["po"] == pytest.approx(0.7) and k["pe"] == pytest.approx(0.5)

def test_kappa_perfect_and_degenerate():
    assert W.cohens_kappa(list("aabb"), list("aabb"))["kappa"] == pytest.approx(1.0)
    assert W.cohens_kappa(list("aaaa"), list("aaaa"))["kappa"] is None
    with pytest.raises(ValueError): W.cohens_kappa([1], [1, 2])

def test_kappa_chance_agreement_near_zero():
    rng = np.random.default_rng(3); a = rng.integers(0, 2, 4000); b = rng.integers(0, 2, 4000)
    assert abs(W.cohens_kappa(list(a), list(b))["kappa"]) < 0.05

# ------------------------------------------------------------ fuzzy dedup
def _refs():
    base = dict(authors="Smith, A", journal="J Aging", doi="", pmid="", abstract="x")
    return [dict(base, id=1, title="Endurance exercise extends lifespan in Drosophila melanogaster males", year="2020", doi="10.1/a"),
            dict(base, id=2, title="Endurance exercise extends lifespan in Drosophila melanogaster male flies", year="2021", journal="bioRxiv", doi="10.1/b"),
            dict(base, id=3, title="Dietary restriction and microbiome composition in flies", year="2020"),
            dict(base, id=4, title="Rapamycin treatment alters mitochondrial function in mice", year="2019")]

def test_fuzzy_pairs_finds_near_duplicate_and_flags_preprint_and_doi_conflict():
    pairs = list(W.fuzzy_pairs(_refs(), 0.88))
    assert len(pairs) == 1
    a, b, score, reasons, rel = pairs[0]
    assert (a, b) == (1, 2) and "preprint" in rel and "DIFFERENT DOIs" in reasons and "same first author" in reasons

def test_fuzzy_threshold_and_distinct_titles():
    assert list(W.fuzzy_pairs(_refs(), 0.999)) == []
    assert not any(3 in (p[0], p[1]) or 4 in (p[0], p[1]) for p in W.fuzzy_pairs(_refs(), 0.5))

@pytest.fixture
def st_():
    s = Store(":memory:"); return s, s.create_project("P", "Bio", "Systematic review")

def test_fuzzy_requires_human_confirmation_and_is_reversible(st_):
    s, pid = st_
    ris = "".join(f"TY  - JOUR\nTI  - {r['title']}\nAU  - {r['authors']}\nPY  - {r['year']}\nJO  - {r['journal']}\nER  -\n\n" for r in _refs()[:2])
    s.import_refs(pid, ris)
    assert s.find_dup_candidates(pid) == 1
    assert len(s.refs(pid, include_dups=False)) == 2          # nothing merged automatically
    cid = s.dup_candidates(pid)[0]["id"]
    with pytest.raises(ValueError): s.decide_dup(pid, cid, True, "AI helper")
    s.decide_dup(pid, cid, True, "human:me")
    assert len(s.refs(pid, include_dups=False)) == 1
    dup = [r for r in s.refs(pid) if r["dup_of"]][0]; s.undo_duplicate(dup["id"], pid)
    assert len(s.refs(pid, include_dups=False)) == 2

# ---------------------------------------------------------------- PRISMA svg
def test_prisma_svg_is_valid_xml_with_counts_and_accessibility(st_):
    s, pid = st_
    c, _ = s.prisma_counts(pid)
    c.update(identified=120, duplicates_removed=20, screened=100, excluded_title_abstract=80, reports_sought=20, excluded_full_text=12, included=8, exclusion_reasons={"wrong organism": 7, "no lifespan <outcome>": 5})
    svg = W.prisma_svg(c); xml.dom.minidom.parseString(svg)
    assert "n = 120" in svg and "n = 8" in svg and 'role="img"' in svg and "&lt;outcome&gt;" in svg

# ---------------------------------------------------------- extraction rules
def _ex(s, pid, sid, field, val, **kw):
    kw.setdefault("source_doc", "Smith2020.pdf"); kw.setdefault("page", "4"); kw.setdefault("table_fig", "Table 2")
    return s.extract(pid, sid, field, val, unit_raw=kw.pop("unit_raw", ""), **kw)

def test_extraction_rules(st_):
    s, pid = st_; sid = s.new_study(pid, "Smith 2020"); assert sid == "S001"
    with pytest.raises(ValueError): _ex(s, pid, sid, "treat_mean", "5", source_doc="")                      # provenance required
    with pytest.raises(ValueError): _ex(s, pid, sid, "treat_sd", "")                                        # missing needs reason
    with pytest.raises(ValueError): _ex(s, pid, sid, "treat_sd", "2", uncertainty="reconstructed")           # needs method note
    with pytest.raises(ValueError): _ex(s, pid, sid, "treat_mean", "5", reviewer="AI model")
    e1 = _ex(s, pid, sid, "treat_mean", "5.5", unit_raw="days")
    e2 = _ex(s, pid, sid, "treat_mean", "5.6", unit_raw="days", notes="corrected typo")                      # supersedes, history kept
    assert [r["id"] for r in s.current_extracted(pid)] == [e2] and len(s.extraction_history(pid, sid, "E1", "treat_mean")) == 2
    with pytest.raises(ValueError): s.verify_extraction(pid, e2, "human:self", True)                         # self-verification refused
    s.verify_extraction(pid, e2, "human:B", True); assert s.current_extracted(pid)[0]["verification"] == "verified"
    _ex(s, pid, sid, "treat_sd", "", missing_reason="not reported; author contact planned")
    assert s.current_extracted(pid)[-1]["value_clean"] is None                                                # missing != zero

def _full(s, pid, sid, exp="E1", tn=10, tm=12, tsd=3, cn=10, cm=10, csd=2, ctrl_id="C1", unit="days"):
    for f, v in dict(treat_n=tn, treat_mean=tm, treat_sd=tsd, ctrl_n=cn, ctrl_mean=cm, ctrl_sd=csd).items():
        _ex(s, pid, sid, f, v, experiment_id=exp, unit_raw=unit if "mean" in f or "sd" in f else "")
    _ex(s, pid, sid, "control_group_id", ctrl_id, experiment_id=exp)

def test_validation_flags_problems(st_):
    s, pid = st_; a = s.new_study(pid, "A"); b = s.new_study(pid, "B")
    _full(s, pid, a, "E1"); _full(s, pid, a, "E2")                    # shared control C1
    _full(s, pid, b, "E1", tsd=0.05, csd=0.04, unit="hours")          # tiny CV + unit mismatch
    _ex(s, pid, b, "treat_n", "10.5", experiment_id="E2")             # non-integer n
    _ex(s, pid, b, "ctrl_sd", "-1", experiment_id="E2")
    msgs = " | ".join(i["message"] for i in W.validate_extraction(s.current_extracted(pid)))
    for needle in ["Shared control", "CV=", "Unit mismatch", "positive integer", "SD cannot be negative", "not yet independently verified"]:
        assert needle in msgs, needle

def test_validation_detects_duplicate_publication_and_missing_sd(st_):
    s, pid = st_; a = s.new_study(pid, "A"); b = s.new_study(pid, "B")
    _full(s, pid, a); _full(s, pid, b)
    _ex(s, pid, a, "treat_mean", "12", experiment_id="E9"); 
    msgs = " | ".join(i["message"] for i in W.validate_extraction(s.current_extracted(pid)))
    assert "duplicate publication" in msgs and "SD missing" in msgs

def test_build_effects_matches_stats_and_never_imputes(st_):
    s, pid = st_; a = s.new_study(pid, "A"); b = s.new_study(pid, "B")
    _full(s, pid, a); _ex(s, pid, b, "treat_mean", "5")               # incomplete
    eff, skipped = W.build_effects(s.current_extracted(pid), "SMD")
    g, v, _ = S.smd(12, 3, 10, 10, 2, 10)
    assert len(eff) == 1 and eff[0]["yi"] == pytest.approx(g) and eff[0]["vi"] == pytest.approx(v)
    assert skipped and "missing fields" in skipped[0][2]
    assert W.build_effects(s.current_extracted(pid), "lnRR")[0][0]["yi"] == pytest.approx(math.log(1.2))

# ---------------------------------------------------------------- RoB
def test_rob_rules_and_current_view(st_):
    s, pid = st_; a = s.new_study(pid, "A")
    with pytest.raises(ValueError): s.rate_rob(pid, a, "SYRCLE", "Sequence generation", "low", "")
    with pytest.raises(ValueError): s.rate_rob(pid, a, "SYRCLE", "Sequence generation", "moderate", "x")
    with pytest.raises(ValueError): s.rate_rob(pid, a, "SYRCLE", "Not a domain", "low", "x")
    with pytest.raises(ValueError): s.rate_rob(pid, a, "SYRCLE", "Sequence generation", "low", "x", reviewer="AI tool")
    s.rate_rob(pid, a, "SYRCLE", "Sequence generation", "unclear", "not described", "human:A")
    s.rate_rob(pid, a, "SYRCLE", "Sequence generation", "low", "random number table p3", "human:A")   # revision
    cur = s.rob_current(pid, "human:A"); assert len(cur) == 1 and cur[0]["judgement"] == "low"
    assert not any("ARRIVE" in t["name"] for t in rob_tools.TOOLS.values())

# ------------------------------------------------------------- workflows
def test_workflows_differ_by_review_type():
    assert "events_treat" in {f["name"] for f in workflows.WORKFLOWS["clinical"]["fields"]}
    assert "species_strain_genotype" in {f["name"] for f in workflows.WORKFLOWS["preclinical"]["fields"]}
    assert not any(f["name"].endswith("_sd") for f in workflows.WORKFLOWS["qualitative"]["fields"])
    assert workflows.WORKFLOWS["scoping"]["rob"] == []

# ------------------------------------------------------- export & backup
def test_export_package_contents_and_manifest(st_):
    s, pid = st_; a = s.new_study(pid, "A"); _full(s, pid, a)
    eff, _ = W.build_effects(s.current_extracted(pid), "SMD")
    for e in eff: s.save_effect(pid, e["study_id"], e["experiment_id"], e["measure"], e["yi"], e["vi"])
    z = zipfile.ZipFile(io.BytesIO(W.export_package(s, pid, "demo")))
    names = set(z.namelist())
    assert {"analysis.R", "analysis_dataset.csv", "SAP_draft.md", "prisma_flow.svg", "audit_log.csv", "extraction_all_versions.csv", "MANIFEST.txt"} <= names
    assert "S001-E1-ES1" in z.read("analysis_dataset.csv").decode() and "rma(" in z.read("analysis.R").decode()
    import hashlib
    for line in z.read("MANIFEST.txt").decode().splitlines():
        h, n = line.split("  ", 1); assert hashlib.sha256(z.read(n)).hexdigest() == h

def test_backup_includes_new_tables(st_):
    s, pid = st_; a = s.new_study(pid, "A"); _full(s, pid, a); s.rate_rob(pid, a, "SYRCLE", "Sequence generation", "low", "q")
    s2 = Store(":memory:"); s2.restore_json(s.backup_json())
    assert len(s2.current_extracted(pid)) == 7 and len(s2.rob_current(pid)) == 1 and s2.studies(pid)[0]["study_id"] == "S001"
