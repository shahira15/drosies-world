import io, zipfile
import pytest
from metalab import expert as EX, lessons, claims, lesson_audit

def test_eight_areas_exist_each_with_signoff_questions_and_honest_status():
    assert len(EX.AREAS) == 8
    for name, fn in EX.AREAS.items():
        t = fn(); assert "## Reviewer sign-off" in t and "## Questions for you" in t and "Ground rules" in t and "Nothing in MetaLab is currently expert-reviewed" in t, name
        assert t.count("\n") > 40 and "AI-drafted" in t or "AI-drafted" in "".join(l["status"] for l in lessons.load().values())
        assert all(w not in t.lower() for w in ("expert-reviewed by", "approved by experts", "validated by"))

def test_statistics_package_lists_unexecuted_external_workflows_and_features_honestly():
    t = EX.area_statistics(); assert "NOT executed" in t and "requires_external_validation" in t and "benchmarked" in t and "advanced2" in t and "clubSandwich" in t

def test_education_package_embeds_the_mechanical_audit_numbers():
    s = lesson_audit.summary(); t = EX.area_education(); assert f"{s['substantive']} substantive, {s['thin']} thin of {s['total']}" in t and "| 42 |" in t

def test_integrity_package_includes_claim_counts_and_corrections():
    sm = claims.summary(); t = EX.area_integrity(); assert f"{sm['total']} claims" in t and "P-score ranking direction" in t or "ranking direction" in t and "CR2" in t

def test_usability_package_has_task_script_and_accessibility_limits():
    t = EX.area_usability(); assert "Usability task script" in t and "no screen-reader" in t.lower() and "backup WITHOUT personal data" in t

def test_zip_contains_index_areas_all_lessons_and_core_packages():
    z = zipfile.ZipFile(io.BytesIO(EX.expert_zip())); names = z.namelist(); L = lessons.load()
    assert "INDEX.md" in names and sum(n.startswith("areas/") for n in names) == 8 and sum(n.startswith("lessons/") for n in names) == len(L) and "statistics_engine_core.md" in names
    idx = z.read("INDEX.md").decode(); assert "self-contained" in idx and "Nothing is labelled 'expert-reviewed'" in idx and "never contacts reviewers" in idx

def test_available_lists_areas_first_and_all_callables_work():
    a = EX.available(); keys = list(a); assert keys[:8] == [f"AREA - {k}" for k in EX.AREAS] and len(keys) == 8 + len(lessons.load()) + 2
    for k in keys[:12]: assert "Reviewer sign-off" in a[k]()
