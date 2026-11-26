import sqlite3, pytest
from metalab.store import Store, parse_ris, norm_doi

RIS = """TY  - JOUR
TI  - Exercise extends lifespan in flies
AU  - Smith, A
PY  - 2020
DO  - 10.1000/abc
ER  -

TY  - JOUR
TI  - Exercise Extends Lifespan in Flies.
AU  - Smith, A
PY  - 2020
DO  - https://doi.org/10.1000/ABC
ER  -

TY  - JOUR
TI  - Different paper
AU  - Lee, B
PY  - 2021
ER  -
"""

@pytest.fixture
def s():
    st = Store(":memory:"); return st, st.create_project("T", "Biology", "Systematic review")

def test_persistence_across_reopen(tmp_path):
    p = str(tmp_path / "x.sqlite")
    a = Store(p); a.set_profile(discipline="Biology"); a.set_complete(3); a.record_quiz(3, [1, 2], [1, 2]); del a
    b = Store(p)
    assert b.profile()["discipline"] == "Biology" and 3 in b.completed() and b.best_quiz(3) == 1.0

def test_quiz_scoring(s):
    st, _ = s
    assert st.record_quiz(3, [0, 1, 2, 3], [0, 1, 0, 3]) == 3

def test_audit_is_append_only(s):
    st, pid = s
    assert len(st.audit_rows(pid)) >= 1
    with pytest.raises(sqlite3.DatabaseError):
        st.x("UPDATE audit_log SET action='x'")
    with pytest.raises(sqlite3.DatabaseError):
        st.x("DELETE FROM audit_log")

def test_ris_parse_and_import_preserves_raw(s):
    st, pid = s
    assert len(parse_ris(RIS)) == 3
    assert st.import_refs(pid, RIS, "a.ris") == 3
    assert all(r["raw"] for r in st.refs(pid))

def test_bad_import_rejected(s):
    st, pid = s
    with pytest.raises(ValueError):
        st.import_refs(pid, "hello")

def test_dedup_exact_and_reversible(s):
    st, pid = s
    st.import_refs(pid, RIS)
    assert norm_doi("https://doi.org/10.1000/ABC") == "10.1000/abc"
    assert st.deduplicate(pid) == 1
    assert len(st.refs(pid)) == 3 and len(st.refs(pid, include_dups=False)) == 2   # originals preserved
    dup = [r for r in st.refs(pid) if r["dup_of"]][0]
    st.undo_duplicate(dup["id"], pid)
    assert len(st.refs(pid, include_dups=False)) == 3

def test_screening_rules(s):
    st, pid = s
    st.import_refs(pid, RIS); rid = st.refs(pid)[0]["id"]
    with pytest.raises(ValueError):
        st.screen(pid, rid, "full_text", "exclude", reason="")
    with pytest.raises(ValueError):
        st.screen(pid, rid, "title_abstract", "include", reviewer="AI assistant")
    with pytest.raises(ValueError):
        st.screen(pid, rid, "title_abstract", "maybe")

def test_prisma_counts_and_warnings(s):
    st, pid = s
    st.import_refs(pid, RIS); st.deduplicate(pid)
    ids = [r["id"] for r in st.refs(pid, include_dups=False)]
    c, w = st.prisma_counts(pid)
    assert c["identified"] == 3 and c["duplicates_removed"] == 1 and c["screened"] == 2
    assert any("no title/abstract decision" in x for x in w)
    st.screen(pid, ids[0], "title_abstract", "include")
    st.screen(pid, ids[1], "title_abstract", "exclude")
    st.screen(pid, ids[0], "full_text", "exclude", "wrong organism")
    c, w = st.prisma_counts(pid)
    assert c["excluded_title_abstract"] == 1 and c["reports_sought"] == 1
    assert c["excluded_full_text"] == 1 and c["exclusion_reasons"] == {"wrong organism": 1} and c["included"] == 0
    assert w == []
    assert c["identified"] - c["duplicates_removed"] == c["screened"]

def test_reviewer_conflict_detected(s):
    st, pid = s
    st.import_refs(pid, RIS); rid = st.refs(pid)[2]["id"]
    st.screen(pid, rid, "title_abstract", "include", reviewer="human:A")
    st.screen(pid, rid, "title_abstract", "exclude", reviewer="human:B")
    c, w = st.prisma_counts(pid)
    assert c["conflicts"] == 1 and any("conflict" in x for x in w)

def test_search_log_requires_fields(s):
    st, pid = s
    with pytest.raises(ValueError):
        st.log_search(pid, "PubMed", "", "", "", "", 0, 0, "me")
    st.log_search(pid, "PubMed", "NCBI", "2026-11-26", "drosophila AND lifespan", "", 10, 10, "me")
    assert len(st.searches(pid)) == 1

def test_backup_restore_roundtrip(tmp_path, s):
    st, pid = s
    st.import_refs(pid, RIS); st.deduplicate(pid); st.add_decision(pid, "Chose scoping review")
    data = st.backup_json()
    st2 = Store(":memory:"); st2.restore_json(data)
    assert len(st2.refs(pid)) == 3 and st2.decisions(pid)[0]["text"] == "Chose scoping review"
    with pytest.raises(ValueError):
        st2.restore_json('{"format":"other"}')

def test_csv_export(s):
    st, pid = s
    st.import_refs(pid, RIS)
    assert st.to_csv(st.refs(pid)).startswith("id,project_id,title")


def test_restore_rejects_malicious_columns(s):
    st, pid = s
    import json
    bad = json.dumps({"format": "metalab-backup", "tables": {"profile": [{"key) VALUES('a','b'); DROP TABLE refs; --": 1}]}})
    with pytest.raises(ValueError):
        st.restore_json(bad)
    assert st.refs(pid) == []   # table still exists
