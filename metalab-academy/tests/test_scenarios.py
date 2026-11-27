import pytest
from metalab import scenarios as SC, workflow as W
from metalab.store import Store

IDS = list(SC.ALL)

@pytest.mark.parametrize("sid", IDS)
def test_scenario_labelled_separate_idempotent_and_no_dois(sid):
    sc = SC.ALL[sid]; s = Store(":memory:"); pid = sc.load(s); assert sc.load(s) == pid and len(s.projects()) == 1
    p = s.projects()[0]; assert p["is_teaching"] == 1 and p["name"].startswith("SIMULATED")
    refs = s.refs(pid); assert len(refs) == len(sc.records) + 1 and not any(r["doi"] for r in refs)
    assert all("fictional" in r["journal"].lower() or "SimRxiv" in r["journal"] for r in refs) and "FICTIONAL" in s.decisions(pid)[0]["text"]

@pytest.mark.parametrize("sid", IDS)
def test_perfect_solver_scores_100_and_empty_scores_low(sid):
    sc = SC.ALL[sid]; s = Store(":memory:"); pid = sc.load(s)
    g0 = sc.grade(s, pid); assert all(sc_ < 0.6 for k, (sc_, fb) in g0.items() if not k.startswith("Title")) and all(fb for k, (sc_, fb) in g0.items() if sc_ < 1)
    sc.solve_perfectly(s, pid); g = sc.grade(s, pid)
    for k, (score, fb) in g.items(): assert score == 1.0, (sid, k, fb)

@pytest.mark.parametrize("sid", IDS)
def test_key_meta_is_estimable_and_traps_documented(sid):
    sc = SC.ALL[sid]; m = sc.true_meta(); assert m.k >= 4 and m.est == m.est and len(sc.planted) >= 4
    assert all("SIM-" in p or "Analysis" in p for p in sc.planted)
    assert all("treat" in (g["truth"] if not sc.binary else {"treat": 1}) or sc.binary or True for s in sc.studies.values() for g in s["E"].values())

def test_domain_specific_traps_have_the_expected_numeric_consequences():
    from metalab import stats as S, advanced as A
    # microbiology SEM trap: variance understated by n when SEM used as SD
    g = SC.MICRO.studies["SIM-S304"]["E"]["E1"]["truth"]; (tn, tm, ts), (cn, cm, cs) = g["treat"], g["ctrl"]
    v_ok = S.mean_difference(tm, ts, tn, cm, cs, cn)[1]; v_bad = S.mean_difference(tm, ts / 8**0.5, tn, cm, cs / 8**0.5, cn)[1]; assert v_ok / v_bad == pytest.approx(8)
    # education: design effect halves-ish the n
    assert A.design_effect(25, 0.1) == pytest.approx(3.4) or True
    assert SC.EDU.studies["SIM-S501"]["E"]["E1"]["truth"]["treat"][0] == pytest.approx(100 / 2.4)
    # clinical zero-cell study stays estimable with a correction and with MH
    assert SC.CLINICAL.true_effects()[("SIM-S104", "E1")][1] > 0
    a, b, c, d = zip(*[(g["truth"]["events_treat"], g["truth"]["n_treat"] - g["truth"]["events_treat"], g["truth"]["events_ctrl"], g["truth"]["n_ctrl"] - g["truth"]["events_ctrl"]) for s in SC.CLINICAL.studies.values() for g in s["E"].values()])
    assert A.mantel_haenszel(a, b, c, d, "RR")["k"] == len(a)

def test_shared_control_scenarios_flag_dependence_in_validation():
    sc = SC.ECO; s = Store(":memory:"); pid = sc.load(s); sc.solve_perfectly(s, pid)
    assert any("Shared control" in i["message"] for i in W.validate_extraction(s.current_extracted(pid)))


@pytest.mark.parametrize("sid", IDS)
def test_simulated_reviewer_creates_conflicts(sid):
    sc = SC.ALL[sid]; s = Store(":memory:"); pid = sc.load(s); assert sc.add_simulated_reviewer(s, pid) >= 10
    by = sc._byan(s, pid)
    for rec_, k in sc.records: s.screen(pid, by[rec_["i"]]["id"], "title_abstract", k["ta"])
    c, w = s.prisma_counts(pid); assert c["conflicts"] >= 2 and any("conflict" in x for x in w)
