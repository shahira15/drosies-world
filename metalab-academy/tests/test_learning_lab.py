import io, json, math, zipfile
import numpy as np, pytest
from scipy import stats as sps
from metalab import learning_lab as LL, learning, lessons, stats as S, advanced as A, curriculum, assessments as AS
from metalab.store import Store

@pytest.mark.parametrize("kind", LL.DRILLS)
@pytest.mark.parametrize("seed", [1, 2, 3, 4, 5, 6])
def test_every_drill_has_a_unique_correct_option_equal_to_independent_formula(kind, seed):
    d = LL.drill(kind, seed); assert len(d["opts"]) == 4 and len(set(d["opts"])) == 4 and 0 <= d["ans"] < 4 and d["why"] and d["numeric"]
    assert float(d["opts"][d["ans"]]) == pytest.approx(d["answer"], abs=6e-4)
    assert LL.drill(kind, seed) == d                                     # deterministic

def test_drill_answers_match_independent_calculations():
    import re
    d = LL.drill("se_from_ci", 7); lo, hi, n = [float(x) for x in re.findall(r"CI ([\d.]+) to ([\d.]+) \(n = (\d+)", d["q"])[0]]; assert d["answer"] == pytest.approx((hi - lo) / (2 * 1.96) * math.sqrt(n), abs=6e-4)
    d = LL.drill("lnrr", 7); a, b = [float(x) for x in re.findall(r"mean lifespan ([\d.]+) d, control ([\d.]+) d", d["q"])[0]]; assert d["answer"] == pytest.approx(math.log(a / b), abs=6e-4)
    d = LL.drill("nnt", 7); pc, rr = [float(x) for x in re.findall(r"risk is (\d+)% and the risk ratio is ([\d]+\.?[\d]*)\.", d["q"])[0]]; assert d["answer"] == pytest.approx(1 / (pc / 100 * (1 - rr)), abs=6e-2)
    d = LL.drill("fisher_z", 7); n = int(re.findall(r"n = (\d+)", d["q"])[0]); assert d["answer"] == pytest.approx(1 / (n - 3), abs=6e-5)
    with pytest.raises(ValueError): LL.drill("nope")

def test_method_items_agree_with_the_wizard_and_keys_are_valid():
    for i, it in enumerate(LL.METHOD_ITEMS):
        assert 0 <= it["ans"] < len(it["opts"]) and len(set(it["opts"])) == len(it["opts"]) and all(n in curriculum.BY_ID for n in it["lessons"])
        w = learning.wizard(*it["wiz"]); txt = " ".join(w["review_types"] + w["measures"] + w["models"] + w["available"] + w["cautions"] + w["not_supported"]).lower()
        key = it["opts"][it["ans"]].lower(); anchor = {"ms1": "log response ratio", "ms2": "smd", "ms3": "mantel", "ms4": "cluster-robust", "ms5": "network", "ms6": "hartung", "ms7": "hazard", "ms8": "bivariate", "ms9": "fisher", "ms10": "logit", "ms11": "swim", "ms12": "scoping"}[it["id"]]
        assert anchor in txt, (it["id"], anchor)                          # the keyed answer is what the wizard itself recommends
        m = LL.method_item(i, 5); assert m["opts"][m["ans"]] == it["opts"][it["ans"]]

def test_interpretation_items_are_computed_and_balanced():
    it = LL.interpretation_items(); assert len(it) >= 8 and {x["ans"] for x in it} == {0, 1}
    y, v = LL._bcg(); r = S.meta_analyze(y, v, "random", "REML", hksj=True); assert f"{r.I2:.0f}" in it[1]["q"] and it[0]["ans"] == 0 and it[2]["ans"] == 1 and it[5]["ans"] == 1   # PI includes 1; tau2 not zero

def test_final_exam_is_stratified_deterministic_and_scored_by_section():
    qs = LL.final_exam(1); assert qs == LL.final_exam(1) and qs != LL.final_exam(2)
    secs = {q["section"] for q in qs}; assert secs == set(LL.SECTIONS) and len({q["part"] for q in qs if q["part"]}) == 18
    sc = LL.score_final(qs, [q["ans"] for q in qs]); assert sc["pct"] == 1.0 and sc["passed_internal_benchmark"] and not sc["weak_sections"] and len(sc["by_part"]) == 18
    wrong = [(q["ans"] + 1) % len(q["opts"]) for q in qs]; sw = LL.score_final(qs, wrong); assert sw["pct"] == 0 and not sw["passed_internal_benchmark"] and set(sw["weak_sections"]) == set(LL.SECTIONS)
    mixed = [q["ans"] if q["section"] != "Calculation" else None for q in qs]; sm = LL.score_final(qs, mixed); assert sm["weak_sections"] == ["Calculation"] and not sm["passed_internal_benchmark"]
    with pytest.raises(ValueError): LL.score_final(qs, [0])
    for q in qs: assert 0 <= q["ans"] < len(q["opts"]) and q["why"] and q["module"] in curriculum.BY_ID

def test_capstone_rubric_blockers_and_thresholds():
    items = {k: dict(score=2, note="x") for k, _, _ in LL.RUBRIC}; s = LL.capstone_status(items); assert s["total"] == s["max"] == 26 and s["ready_for_expert_review"] and not s["blockers"]
    items["protocol_before_search"]["score"] = 0; s = LL.capstone_status(items); assert s["total"] == 24 and not s["ready_for_expert_review"] and s["blockers"]
    s0 = LL.capstone_status({}); assert s0["total"] == 0 and len(s0["unscored"]) == 13 and len(s0["blockers"]) == 3
    assert len(LL.RUBRIC) == 13 and LL.BENCHMARK == 20

def test_store_records_exams_and_capstone_with_validation_and_roundtrip():
    s = Store(":memory:"); s.record_exam("final", 1, 65, 50, {"Calculation": [7, 9]}); assert s.exam_history("final")[0]["correct"] == 50
    with pytest.raises(ValueError): s.record_exam("final", 1, 10, 11, {})
    with pytest.raises(ValueError): s.set_capstone("search_records", 3, "x")
    with pytest.raises(ValueError): s.set_capstone("search_records", 1, "")
    s.set_capstone("search_records", 2, "search_log.csv exported"); s.set_capstone("search_records", 1, "revised"); assert s.capstone_items()["search_records"]["score"] == 1
    s2 = Store(":memory:"); s2.restore_json(s.backup_json()); assert len(s2.exam_history()) == 1 and s2.capstone_items()["search_records"]["note"] == "revised"

def test_learning_record_is_not_a_certificate_and_reflects_activity():
    s = Store(":memory:"); r0 = LL.learning_record(s); assert "NOT A CERTIFICATE" in r0 and "not accredited" in r0 and "not attempted" in r0 and "none" in r0
    s.set_complete(32); s.record_exam("final", 3, 65, 52, {"Concepts (lessons)": [30, 36], "Calculation": [7, 9]}); s.set_capstone("protocol_before_search", 2, "protocol dated before search")
    r = LL.learning_record(s, "2026-11-28"); assert "52/65" in r and "Module 32" not in r.split("Modules marked complete")[0] and "32" in r and "Total 2/26" in r and "does NOT show" in r
    assert "competence" in r and "accredited" in r.lower() and all(w not in r.lower() for w in ("certified", "awarded", "diploma"))

def test_practice_datasets_are_labelled_and_parse():
    d = LL.practice_datasets(); assert len(d) >= 7
    for name, (txt, prov) in d.items():
        rows = [r.split(",") for r in txt.strip().splitlines()]; assert len(rows) >= 3 and len({len(r) for r in rows}) == 1, name
        assert any(w in prov for w in ("metadat", "SIMULATED", "FICTIONAL")), name
    assert "FICTIONAL" in d["fictional_lifespan_vials.csv"][1] and "SIMULATED" in d["dta_synthetic.csv"][1] and "metadat" in d["bcg_trials.csv"][1]
    z = zipfile.ZipFile(io.BytesIO(LL.datasets_zip())); assert "README.txt" in z.namelist() and set(d) <= set(z.namelist()) and "must not be mixed" in z.read("README.txt").decode()
    bcg = [r.split(",") for r in d["bcg_trials.csv"][0].strip().splitlines()[1:]]; assert len(bcg) == 13 and int(bcg[0][1]) == 4

def test_formula_sheets_per_pathway_come_from_lessons():
    allsheet = LL.formula_sheet(); L = lessons.load(); assert all(f["tex"] in allsheet for n in (32, 42, 48) for f in L[n]["formulas"]) and "not expert-reviewed" in allsheet
    for tr in AS.DISCIPLINE_TRACKS:
        sh = LL.formula_sheet(tr); assert tr in sh and len(sh) > 300
    assert "Hedges" in LL.formula_sheet("Preclinical / model organisms") or "response ratio" in LL.formula_sheet("Preclinical / model organisms").lower()

def test_wizard_reports_what_v04_actually_implements():
    n = learning.wizard("network of several interventions", "binary", 12, "none", "estimate an effect", True); assert 42 in n["lessons"] and any("netmeta" in x for x in n["not_supported"]) and any("NMA" in x for x in n["available"])
    d = learning.wizard("diagnostic accuracy", "binary", 8, "none", "estimate an effect", True); assert any("Bivariate" in x for x in d["available"]) and any("HSROC" in x for x in d["not_supported"])
    t = learning.wizard("randomised experiments", "time-to-event", 8, "none", "estimate an effect", True); assert any("log HR" in x for x in t["available"]) and any("Guyot" in x for x in t["not_supported"])
    k = learning.wizard("randomised experiments", "continuous (same scale)", 7, "none", "estimate an effect", True); assert any("k < 10" in c for c in k["cautions"])
    c = learning.wizard("randomised experiments", "continuous (same scale)", 12, "clustered labs/sites", "estimate an effect", True); assert any("CR2" in x for x in c["available"]) and any("sampling covariance" in x for x in c["cautions"])


def test_flashcards_cover_formulas_decisions_assumptions_worked_examples_and_effect_sizes():
    c = learning.cards(); keys = [x["key"] for x in c]; assert len(keys) == len(set(keys)) and len(c) > 700
    for pre in ("gl:", "mis:", "fm:", "dt:", "as:", "wx:", "es:"): assert any(k.startswith(pre) for k in keys), pre
    L = lessons.load(); assert sum(k.startswith("fm:") for k in keys) == sum(len(l["formulas"]) for l in L.values()) and sum(k.startswith("wx:") for k in keys) == len(L)
    assert all(x["front"].strip() and x["back"].strip() and x["module"] in curriculum.BY_ID for x in c)
