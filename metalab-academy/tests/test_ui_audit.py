"""Opt-in browser audit (axe-core accessibility + keyboard walk). Run with:  METALAB_UI_AUDIT=1 python3 -m pytest -q tests/test_ui_audit.py
Needs: pip install playwright axe-playwright-python and an installed Chromium. Skipped by default because it starts a real server."""
import os, subprocess, sys, json
from pathlib import Path
import pytest
ROOT = Path(__file__).parent.parent
@pytest.mark.skipif(not os.environ.get("METALAB_UI_AUDIT"), reason="set METALAB_UI_AUDIT=1 to run the browser audit")
def test_no_axe_violations_and_keyboard_focus_is_visible_and_untrapped(tmp_path):
    out = tmp_path / "audit.json"; r = subprocess.run([sys.executable, str(ROOT / "tools" / "audit_ui.py"), str(out)], capture_output=True, text=True, timeout=600); assert r.returncode == 0, r.stderr[-500:]
    rep = json.loads(out.read_text()); bad = {k: v["violations"] for k, v in rep["pages"].items() if v.get("violations")}
    assert not any("error" in v for v in rep["pages"].values()), "a page could not be opened"
    assert bad == {}, bad
    kb = rep["keyboard"]; assert kb["distinct_focus_targets"] >= 8 and not kb["reached_body_only"] and kb["focus_style_missing"] == []
