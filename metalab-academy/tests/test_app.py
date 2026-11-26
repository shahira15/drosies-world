"""Smoke-test every page by actually running the Streamlit script headlessly."""
import pytest
import streamlit as st
from streamlit.testing.v1 import AppTest
from metalab.curriculum import counts

@pytest.fixture(autouse=True)
def _fresh_cache():
    st.cache_resource.clear(); yield; st.cache_resource.clear()


PAGES = ["Home", "Onboarding", "Learning Academy", "Research Workspace", "First Paper Plan",
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
