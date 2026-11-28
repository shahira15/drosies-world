import sys
from pathlib import Path
import pytest
sys.path.insert(0, str(Path(__file__).parent.parent / "tools"))
import verify_batch as VB
from metalab.store import Store
from metalab import verification as VER

def test_batch_run_records_only_what_the_human_typed_and_skips_blanks():
    s = Store(":memory:"); answers = iter(["Cochrane Handbook | Cochrane Training", "yes", "Free online", "v6.4", "chapter list seen", "", "q"]); opened = []
    rec, skip = VB.run(s, "human:Tester", batch=3, ask=lambda _: next(answers), opener=opened.append, today="2026-11-28")
    assert rec == 1 and skip == 1 and len(opened) >= 2
    v = s.verifications(); assert len(v) == 1 and v[0]["verifier"] == "human:Tester" and v[0]["page_title_seen"].startswith("Cochrane Handbook") and v[0]["verified_on"] == "2026-11-28"
    assert VER.status(v[0]["url"], s)["level"] == VER.LEVELS[2]

def test_ai_verifier_is_refused_and_pending_excludes_verified():
    s = Store(":memory:")
    with pytest.raises(SystemExit): VB.run(s, "AI model", ask=lambda _: "x", opener=lambda u: None)
    before = len(VB.pending(s)); e = VB.pending(s)[0]; s.add_verification(e["url"], "human:T", "2026-11-28", "title", "yes", "", "", "")
    assert len(VB.pending(s)) == before - 1

def test_no_pages_are_opened_with_no_open_flag_and_category_filter_works():
    s = Store(":memory:"); opened = []
    VB.run(s, "human:T", batch=2, category="Textbooks", ask=lambda _: "", opener=opened.append, open_pages=False); assert opened == []
    assert all(e["category"] == "Textbooks" for e in VB.pending(s, "Textbooks")) and VB.pending(s, "Textbooks")
