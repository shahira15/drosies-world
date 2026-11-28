import io, zipfile, pytest
from metalab import assessments as AS, lessons, curriculum, learning

def test_exam_is_deterministic_balanced_and_key_is_correct():
    L = lessons.load(); mods = [27, 32, 35]
    a, b = AS.exam(mods, 3, seed=7), AS.exam(mods, 3, seed=7); assert [q["qid"] for q in a] == [q["qid"] for q in b] and len(a) == 9
    assert {q["module"] for q in a} == set(mods) and [q["qid"] for q in a] != [q["qid"] for q in AS.exam(mods, 3, seed=8)]
    for q in a:                                   # shuffled options still point to the original correct answer text
        m, qi = map(int, q["qid"].split(":")); orig = L[m]["quiz"][qi]; assert q["opts"][q["ans"]] == orig["opts"][orig["ans"]] and sorted(q["opts"]) == sorted(orig["opts"])

def test_scoring_mastery_and_weak_modules_and_feedback():
    qs = AS.exam([27, 32], 5, seed=1); perfect = AS.score(qs, [q["ans"] for q in qs]); assert perfect["pct"] == 1.0 and perfect["mastery"] and perfect["weak_modules"] == []
    wrong = [(q["ans"] + 1) % len(q["opts"]) for q in qs]; z = AS.score(qs, wrong); assert z["pct"] == 0 and not z["mastery"] and z["weak_modules"] == [27, 32]
    half = [q["ans"] if q["module"] == 27 else None for q in qs]; h = AS.score(qs, half); assert h["weak_modules"] == [32] and h["by_module"][27][0] == 5
    fb = AS.feedback(qs, wrong); assert all(not f["correct"] and f["why"] and f["right"] for f in fb)
    with pytest.raises(ValueError): AS.score(qs, [0])

def test_every_written_lesson_can_be_examined():
    L = lessons.load(); qs = AS.exam(sorted(L), 2); assert {q["module"] for q in qs} == set(L) and len(qs) >= 2 * len(L) - 5

def test_personal_pathway_from_profile_and_honesty_about_outlines():
    p = AS.personal_pathway(dict(discipline="Biological sciences (Drosophila aging, metabolism)", pathway="Preclinical researcher", stats_exp="basic", sr_fam="none"))
    assert "Preclinical / model organisms" in p["tracks"] and p["core"] == learning.CORE_PATH and 85 in p["extra"] and 60 in p["extra"]
    L = lessons.load(); assert set(p["outline_only"]) == {m for m in p["core"] + p["extra"] if m not in L} and 60 in p["available_extra"] and 85 in p["available_extra"]
    combo = AS.personal_pathway(dict(discipline="plant microbiology and ecology")); assert {"Plant science & agriculture", "Microbiology", "Ecology & evolution"} <= set(combo["tracks"])
    assert AS.personal_pathway(dict(stats_exp="advanced", sr_fam="done one", discipline="clinical"))["notes"][0].startswith("You reported experience")
    assert all(m in curriculum.BY_ID for t in AS.DISCIPLINE_TRACKS.values() for m in t["core"] + t["extra"])

def test_notes_bundle_contents():
    z = zipfile.ZipFile(io.BytesIO(AS.notes_bundle([27, 32, 9999]))); names = set(z.namelist())
    assert {"module_27_notes.md", "module_32_notes.md", "formula_cheat_sheet.md", "README.txt"} <= names and "module_9999_notes.md" not in names
    assert "outline only" in z.read("README.txt").decode().lower() and "9999" in z.read("README.txt").decode() and b"expert-reviewed" in z.read("module_27_notes.md").lower().replace(b"not expert", b"not expert")
