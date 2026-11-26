"""Guards against documentation drifting from the code (a real problem: counts were once mis-stated in the README)."""
import re
from pathlib import Path
from metalab import references, resources, learning, claims, curriculum, lessons

ROOT = Path(__file__).parent.parent
def txt(n): return (ROOT / n).read_text()

def test_readme_and_changelog_counts_match_code():
    lessons.load(); c = curriculum.counts()
    r, ch = txt("README.md"), txt("CHANGELOG.md")
    assert f"{len(references.REFS)} verified references" in r and f"({len(references.REFS)} refs)" in ch
    assert f"{c['drafted']} written lessons" in r and f"{len(resources.RESOURCES)} resources" in r
    assert f"{c['total']}-module registry ({c['specified']} specified + {c['proposed']} proposed)" in r

def test_features_json_mentions_current_counts():
    f = txt("features.json")
    assert f"Searchable glossary ({len(learning.G)} terms)" in f
    assert f"{curriculum.counts()['drafted']} of {curriculum.counts()['total']} registered modules" in f

def test_status_docs_claim_no_expert_review():
    s = claims.summary(); assert s["human_reviewed"] == 0
    for name in ("README.md", "KNOWN_LIMITATIONS.md"):
        assert "expert-reviewed" in txt(name).lower() and ("not" in txt(name).lower())
