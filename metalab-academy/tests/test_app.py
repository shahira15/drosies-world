"""Smoke-test every page by actually running the Streamlit script headlessly."""
import pytest
from streamlit.testing.v1 import AppTest
from metalab.curriculum import counts

PAGES = ["Home", "Onboarding", "Learning Academy", "Research Workspace", "First Paper Plan",
         "Statistics Lab", "Knowledge Universe", "Network & Collaboration", "Status & Limitations"]

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
