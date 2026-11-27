"""Helper for compact lesson definitions (all required sections still enforced by tests/test_content.py)."""
def L(id, title, last_verified, **k):
    d = dict(id=id, title=title, version="0.1.0", status="AI-drafted; awaiting qualified human expert review", content_type=k.pop("content_type", "Established methodology with educational simplifications"),
             last_verified=last_verified, time_min=k.pop("time_min", 80), coding=k.pop("coding", None), formulas=k.pop("formulas", []))
    d.update(k); return d
V = "2026-11-27 (references verified bibliographically via Crossref/PubMed; abstracts/full text of cited papers NOT examined unless stated in the claim register)"
