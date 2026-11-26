import pytest
from metalab import vlab, stats as S
from metalab.store import Store

def fresh():
    s = Store(":memory:"); return s, vlab.load(s)

def test_simulation_is_labelled_separate_and_idempotent():
    s, pid = fresh()
    assert vlab.load(s) == pid and len(s.projects()) == 1
    p = s.projects()[0]; assert p["is_teaching"] == 1 and "SIMULATED" in p["name"]
    refs = s.refs(pid); assert len(refs) == len(vlab.RECORDS) + 1
    assert all("fictional" in r["journal"].lower() or "SimRxiv" in r["journal"] for r in refs)
    assert not any(r["doi"] for r in refs)                        # never DOI-like
    assert "FICTIONAL" in s.decisions(pid)[0]["text"]

def test_perfect_solver_scores_100_percent():
    s, pid = fresh(); vlab.solve_perfectly(s, pid)
    g = vlab.grade(s, pid)
    assert set(g) == {"Deduplication", "Title/abstract screening", "Full-text screening", "Extraction", "Risk of bias (SYRCLE)", "Effect sizes (lnRR)"}
    for k, (score, fb) in g.items(): assert score == 1.0, (k, fb)

def test_empty_learner_scores_low_with_feedback():
    s, pid = fresh(); g = vlab.grade(s, pid)
    assert all(score < 0.5 for k, (score, fb) in g.items() if k not in ("Title/abstract screening",))
    assert all(fb for k, (score, fb) in g.items() if score < 1)

def test_planted_extraction_errors_are_detected_by_grader_and_validator():
    s, pid = fresh()
    for lab, vals in (("SIM-S001 Aldrin 2019", dict(ctrl_n=10, ctrl_mean=52.0, ctrl_sd=3.2, treat_n=10, treat_mean=56.8, treat_sd=3.6)),
                      ("SIM-S002 Brandt 2020", dict(ctrl_n=8, ctrl_mean=48.5, ctrl_sd=4.0, treat_n=8, treat_mean=52.0, treat_sd=4.4)),
                      ("SIM-S003 Castillo 2020", dict(ctrl_n=8, ctrl_mean=50.2, ctrl_sd=1.2, treat_n=8, treat_mean=53.9, treat_sd=1.4))):   # S003: SEM entered as SD (the planted trap)
        sid = s.new_study(pid, lab)
        for f, v in vals.items(): s.extract(pid, sid, f, v, "days", "x.pdf", "2", "Table 2", experiment_id="E1")
    fb = " ".join(vlab.grade(s, pid)["Extraction"][1]); assert "SIM-S003/E1/ctrl_sd" in fb
    from metalab import workflow as W
    assert any("CV=" in i["message"] for i in W.validate_extraction(s.current_extracted(pid)))   # tool flags SE-as-SD

def test_second_reviewer_creates_conflicts_and_kappa():
    s, pid = fresh(); assert vlab.add_simulated_reviewer(s, pid) > 10
    for r in s.refs(pid):
        if "SIM-R03" in r["raw"] and "R03" in r["raw"]: s.screen(pid, r["id"], "title_abstract", "include")
    c, w = s.prisma_counts(pid)
    assert c["conflicts"] >= 1 and any("conflict" in x for x in w)

def test_key_meta_analysis_is_valid_and_unit_traps_matter():
    m = vlab.true_meta("lnRR"); assert m.k == 6 and 0.02 < m.est < 0.2          # plausible fictional effect (~ +7%)
    # the naive analyses a learner might do differ materially from the key
    (cn, cm, cs), (tn, tm, ts) = vlab.STUDIES["SIM-S003"]["E"]["E1"]["ctrl"], vlab.STUDIES["SIM-S003"]["E"]["E1"]["treat"]
    y_ok, v_ok = S.log_response_ratio(tm, ts, tn, cm, cs, cn)
    y_bad, v_bad = S.log_response_ratio(53.9, 1.4, 8, 50.2, 1.2, 8)               # SEM used as SD
    assert v_bad < v_ok / 5                                                         # variance understated ~7.5x
    assert vlab.fulltext("SIM-S005").lower().count("hours") >= 1 and "1176" in vlab.fulltext("SIM-S005")

def test_hours_conversion_in_key_equals_reported_hours():
    assert vlab.STUDIES["SIM-S005"]["reported_in_hours"]["ctrl"][0] / 24 == pytest.approx(49.0)
    assert vlab.STUDIES["SIM-S003"]["E"]["E1"]["ctrl"][2] == pytest.approx(1.2 * 8 ** 0.5)
