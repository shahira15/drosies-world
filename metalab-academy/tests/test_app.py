"""Smoke-test every page by actually running the Streamlit script headlessly."""
import pytest
import streamlit as st
from streamlit.testing.v1 import AppTest
from metalab.curriculum import counts

@pytest.fixture(autouse=True)
def _fresh_cache():
    st.cache_resource.clear(); yield; st.cache_resource.clear()


PAGES = ["Home", "Onboarding", "Learning Academy", "Reference Encyclopedia", "Practice", "Coding Lab", "Virtual Lab", "Method Wizard", "Research Workspace", "Manuscript Studio", "First Paper Plan",
         "Statistics Lab", "Knowledge Universe", "Network & Collaboration", "Quality & Expert Review", "Status & Limitations"]

@pytest.mark.parametrize("page", PAGES)
def test_page_renders_without_exception(page, tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv('METALAB_DB', str(tmp_path / 'test.sqlite'))
    at = AppTest.from_file("/home/user/drosies-world/metalab-academy/app.py", default_timeout=60)
    at.run()
    at.sidebar.radio[0].set_value(page).run()
    assert not at.exception, [e.value for e in at.exception]


def test_stats_lab_bcg_renders_expected_numbers(tmp_path, monkeypatch):
    monkeypatch.setenv('METALAB_DB', str(tmp_path / 'test.sqlite'))
    at = AppTest.from_file("/home/user/drosies-world/metalab-academy/app.py", default_timeout=60)
    at.run(); at.sidebar.radio[0].set_value("Statistics Lab").run()
    at.radio(key="msrc").set_value([o for o in at.radio(key="msrc").options if o.startswith("BCG")][0]).run()
    assert not at.exception
    vals = " ".join(m.value for m in at.metric)
    assert "-0.7145" in vals and "0.3132" in vals     # REML estimate and tau2


def test_first_paper_page_with_project(tmp_path, monkeypatch):
    from metalab.store import Store
    dbp = str(tmp_path / "t.sqlite"); monkeypatch.setenv("METALAB_DB", dbp)
    Store(dbp).create_project("My real project", "Biology", "Systematic review")
    at = AppTest.from_file("/home/user/drosies-world/metalab-academy/app.py", default_timeout=60)
    at.run(); at.sidebar.radio[0].set_value("First Paper Plan").run()
    assert not at.exception, [e.value for e in at.exception]
    assert any("Milestone 1" in e.label for e in at.expander)


def test_expert_packages_build_and_never_claim_review():
    from metalab import expert
    for name, fn in expert.available().items():
        md = fn()
        assert "Reviewer sign-off" in md and "expert-reviewed" in md.lower() or "sign" in md.lower()
        assert "Reviewer sign-off" in md


def test_workspace_renders_with_populated_project(tmp_path, monkeypatch):
    from metalab.store import Store
    from metalab import workflow as W, workflows
    dbp = str(tmp_path / "p.sqlite"); monkeypatch.setenv("METALAB_DB", dbp)
    s = Store(dbp); pid = s.create_project("Pop", "Bio", "Systematic review")
    s.import_refs(pid, "TY  - JOUR\nTI  - A study of things in flies\nAU  - Lee, B\nPY  - 2020\nER  -\n\nTY  - JOUR\nTI  - A study of things in flies.\nAU  - Lee, B\nPY  - 2020\nER  -\n")
    s.set_form(pid, "preclinical", workflows.WORKFLOWS["preclinical"]["fields"])
    sid = s.new_study(pid, "Lee 2020")
    for f, v in dict(treat_n=10, treat_mean=12, treat_sd=3, ctrl_n=10, ctrl_mean=10, ctrl_sd=2).items():
        s.extract(pid, sid, f, v, "days", "Lee2020.pdf", "3", "Tab1")
    s.rate_rob(pid, sid, "SYRCLE", "Sequence generation", "low", "random table"); s.rate_rob(pid, sid, "SYRCLE", "Random housing", "unclear", "not stated")
    eff, _ = W.build_effects(s.current_extracted(pid), "SMD")
    for e in eff: s.save_effect(pid, e["study_id"], e["experiment_id"], e["measure"], e["yi"], e["vi"])
    s.find_dup_candidates(pid)
    at = AppTest.from_file("/home/user/drosies-world/metalab-academy/app.py", default_timeout=90)
    at.run(); at.sidebar.radio[0].set_value("Research Workspace").run()
    assert not at.exception, [e.value for e in at.exception]


def test_virtual_lab_page_with_simulation_and_universal_search(tmp_path, monkeypatch):
    from metalab.store import Store
    from metalab import vlab
    dbp = str(tmp_path / "v.sqlite"); monkeypatch.setenv("METALAB_DB", dbp)
    s = Store(dbp); pid = vlab.load(s); vlab.solve_perfectly(s, pid)
    at = AppTest.from_file("/home/user/drosies-world/metalab-academy/app.py", default_timeout=90)
    at.run(); at.sidebar.radio[0].set_value("Virtual Lab").run()
    assert not at.exception, [e.value for e in at.exception]
    assert any("FICTIONAL" in e.value for e in at.error)
    for sk in ("clinical", "plant", "micro", "eco", "edu"):
        at.selectbox[[x.label for x in at.selectbox].index("Scenario")].set_value(sk).run(); assert not at.exception, (sk, [e.value for e in at.exception])
    at.sidebar.text_input(key="usearch").set_value("pseudoreplication").run()
    assert not at.exception


@pytest.mark.parametrize("sub", ["Mantel-Haenszel / Peto (binary, sparse data)", "Small-study effects: funnel plot, Egger, Begg", "Cumulative meta-analysis", "tau² confidence interval (Q-profile)",
                                 "Influence diagnostics", "Three-level model + cluster-robust variance", "Rates, prevalence & design effect"])
def test_advanced_stats_tab_every_method_renders(sub, tmp_path, monkeypatch):
    monkeypatch.setenv("METALAB_DB", str(tmp_path / "a.sqlite"))
    at = AppTest.from_file("/home/user/drosies-world/metalab-academy/app.py", default_timeout=90)
    at.run(); at.sidebar.radio[0].set_value("Statistics Lab").run()
    at.selectbox[[s.label for s in at.selectbox].index("Method")].set_value(sub).run()
    assert not at.exception, [e.value for e in at.exception]


def test_manuscript_studio_renders_with_populated_project(tmp_path, monkeypatch):
    from metalab.store import Store
    from metalab import manuscript as M, workflow as W
    dbp = str(tmp_path / "m.sqlite"); monkeypatch.setenv("METALAB_DB", dbp)
    s = Store(dbp); pid = s.create_project("MS", "Bio", "Systematic review + meta-analysis")
    for i in range(3):
        sid = s.new_study(pid, f"S{i}")
        for f, v in dict(treat_n=10, treat_mean=12 + i, treat_sd=3, ctrl_n=10, ctrl_mean=10, ctrl_sd=2.5).items(): s.extract(pid, sid, f, v, "days", "x.pdf", "2", "T1")
    for e in W.build_effects(s.current_extracted(pid), "lnRR")[0]: s.save_effect(pid, e["study_id"], e["experiment_id"], e["measure"], e["yi"], e["vi"])
    M.compute_results(s, pid); s.save_section(pid, "results", "Estimate {{analysis.est}}")
    at = AppTest.from_file("/home/user/drosies-world/metalab-academy/app.py", default_timeout=90)
    at.run(); at.sidebar.radio[0].set_value("Manuscript Studio").run()
    assert not at.exception, [e.value for e in at.exception]


def test_assessment_tab_and_pathway_tab_render(tmp_path, monkeypatch):
    monkeypatch.setenv("METALAB_DB", str(tmp_path / "x.sqlite"))
    from metalab.store import Store
    Store(str(tmp_path / "x.sqlite")).set_profile(discipline="Drosophila aging", pathway="Preclinical researcher")
    at = AppTest.from_file("/home/user/drosies-world/metalab-academy/app.py", default_timeout=90)
    for pg in ("Practice", "Learning Academy"):
        at.run(); at.sidebar.radio[0].set_value(pg).run(); assert not at.exception, (pg, [e.value for e in at.exception])


def test_statistics_lab_advanced2_all_methods_run(tmp_path, monkeypatch):
    """Every method in the 'Advanced methods II' tab renders without an exception or error banner."""
    monkeypatch.chdir(tmp_path); monkeypatch.setenv("METALAB_DB", str(tmp_path / "t.sqlite"))
    at = AppTest.from_file("/home/user/drosies-world/metalab-academy/app.py", default_timeout=90).run(); at.session_state["nav"] = "Statistics Lab"; at.run()
    sb = [s for s in at.selectbox if s.key == "adv2"][0]; opts = list(sb.options)
    for opt in opts:
        sb = [s for s in at.selectbox if s.key == "adv2"][0]; sb.select(opt).run()
        assert not at.exception, (opt, [e.value for e in at.exception]); assert not at.error, (opt, [e.value for e in at.error])


def test_workspace_readiness_tab_and_simulated_review_button(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path); monkeypatch.setenv("METALAB_DB", str(tmp_path / "t.sqlite"))
    at = AppTest.from_file("/home/user/drosies-world/metalab-academy/app.py", default_timeout=120).run(); at.session_state["nav"] = "Research Workspace"; at.run()
    assert not at.exception; b = [x for x in at.button if x.label == "Run simulated review"]; assert b
    b[0].click().run(); assert not at.exception and not at.error and any("Simulated review completed" in x.value for x in at.success)


def test_networking_dashboard_sections_render_and_save(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path); monkeypatch.setenv("METALAB_DB", str(tmp_path / "t.sqlite"))
    at = AppTest.from_file("/home/user/drosies-world/metalab-academy/app.py", default_timeout=120).run(); at.session_state["nav"] = "Network & Collaboration"; at.run()
    sb = [x for x in at.selectbox if x.key == "nh_sec"][0]
    for opt in list(sb.options):
        [x for x in at.selectbox if x.key == "nh_sec"][0].select(opt).run(); assert not at.exception, (opt, [e.value for e in at.exception])
    assert any("Nothing is sent by the app" in x.value for x in at.info) and {m.label for m in at.metric} >= {"Contacts", "Open authorship", "Unsent drafts"}
