import io, re, zipfile, xml.dom.minidom
import pytest
from metalab import manuscript as M, workflow as W
from metalab.store import Store

def project_with_analysis():
    s = Store(":memory:"); pid = s.create_project("P", "Bio", "Systematic review + meta-analysis")
    s.log_search(pid, "PubMed", "NCBI", "2026-11-26", "q", "", 100, 100, "me"); s.log_search(pid, "Europe PMC", "EBI", "2026-11-27", "q2", "", 50, 50, "me")
    for i, (m1, m2) in enumerate([(12, 10), (11, 10), (13, 10), (12.5, 10.2)]):
        sid = s.new_study(pid, f"S{i}")
        for f, v in dict(treat_n=10, treat_mean=m1, treat_sd=3, ctrl_n=10, ctrl_mean=m2, ctrl_sd=2.5).items():
            s.extract(pid, sid, f, v, "days", "x.pdf", "2", "T1")
    eff, _ = W.build_effects(s.current_extracted(pid), "lnRR")
    for e in eff: s.save_effect(pid, e["study_id"], e["experiment_id"], e["measure"], e["yi"], e["vi"])
    return s, pid

def test_tokens_resolve_only_when_verified_and_missing_is_visible():
    s, pid = project_with_analysis(); keys = M.compute_results(s, pid, back_transform="exp")
    assert "analysis.est" in keys and "prisma.identified" in keys and "search.n_databases" in keys
    txt = "Estimate {{analysis.est}} from {{search.n_databases}} sources; {{analysis.nonexistent}}."
    out, pr = M.render(s, pid, txt, final=True)
    assert "[[UNVERIFIED:analysis.est]]" in out and "[[MISSING:analysis.nonexistent]]" in out and ("unverified", "analysis.est") in pr
    d, _ = M.render(s, pid, txt, final=False); assert "⟦UNVERIFIED" in d
    with pytest.raises(ValueError): s.verify_result(pid, "analysis.est", "AI model", "x")
    with pytest.raises(ValueError): s.verify_result(pid, "analysis.est", "human:me", "")
    s.verify_result(pid, "analysis.est", "human:me", "reproduced in R/metafor")
    out, _ = M.render(s, pid, "{{analysis.est}}", final=True); assert re.fullmatch(r"-?\d+\.\d{3}", out)

def test_recompute_same_value_keeps_verification_but_changed_inputs_reset_and_mark_stale():
    s, pid = project_with_analysis(); M.compute_results(s, pid); s.verify_result(pid, "analysis.est", "human:me", "checked")
    M.compute_results(s, pid); assert {r["key"]: r for r in s.results(pid)}["analysis.est"]["verified_by"] == "human:me"      # unchanged -> still verified
    e = s.effects(pid)[0]; s.x("UPDATE effect_sizes SET yi=yi+1 WHERE effect_id=?", (e["effect_id"],))                           # inputs change behind the manuscript's back
    out, pr = M.render(s, pid, "{{analysis.est}}", final=True); assert ("stale", "analysis.est") in pr and "UNVERIFIED" in out
    M.compute_results(s, pid); assert {r["key"]: r for r in s.results(pid)}["analysis.est"]["verified_by"] is None             # recomputed -> must re-verify

def test_results_match_stats_engine():
    from metalab import stats as S
    s, pid = project_with_analysis(); M.compute_results(s, pid); eff = s.effects(pid)
    r = S.meta_analyze([e["yi"] for e in eff], [e["vi"] for e in eff], "random", "REML", True)
    res = {x["key"]: x["value"] for x in s.results(pid)}
    assert float(res["analysis.est"]) == pytest.approx(r.est, abs=5e-4) and int(res["analysis.k"]) == 4 and float(res["analysis.tau2"]) == pytest.approx(r.tau2, abs=5e-4)

def test_qc_flags_hard_coded_numbers_citations_claims_and_declarations():
    s, pid = project_with_analysis(); M.compute_results(s, pid)
    s.save_section(pid, "results", "The pooled estimate was 0.42 (n = 37) [@unknownkey] and [cite:?]. {{analysis.est}}")
    s.save_section(pid, "declarations", "## Funding\nnone")
    s.add_ms_claim(pid, "Exercise extends lifespan in all strains")
    checks = {i["check"] for i in M.qc(s, pid)}
    assert {"hard_coded_numbers", "citation_unknown", "missing_citation", "unresolved_claim", "ai_disclosure", "data_availability", "registration", "result:unverified"} <= checks
    cid = s.ms_claims(pid)[0]["id"]
    with pytest.raises(ValueError): s.resolve_ms_claim(cid, "")
    s.resolve_ms_claim(cid, "analysis.est"); assert "unresolved_claim" not in {i["check"] for i in M.qc(s, pid)}

def test_checklist_tracking_and_na_needs_reason():
    s, pid = project_with_analysis()
    assert len(M.PRISMA_ITEMS) == 27
    s.set_checklist(pid, M.PRISMA_ITEMS[0], "Title", "reported"); s.set_checklist(pid, M.PRISMA_ITEMS[1], "", "not applicable")
    ch = {i["check"] for i in M.qc(s, pid)}; assert "checklist_na" in ch and "checklist" in ch

def test_exports_markdown_quarto_latex_docx_with_draft_banner():
    s, pid = project_with_analysis(); M.compute_results(s, pid)
    s.save_section(pid, "title", "Exercise and lifespan in flies"); s.save_section(pid, "results", "Estimate {{analysis.est}} [@hedges1999].")
    md, pr = M.to_markdown(s, pid, final=True); assert md.startswith("> **DRAFT") and "[[UNVERIFIED:analysis.est]]" in md and "Hedges" in md
    for k in ("analysis.est",): s.verify_result(pid, k, "human:me", "reproduced")
    md2, pr2 = M.to_markdown(s, pid, final=True); assert "[[UNVERIFIED:analysis.est]]" not in md2
    q, _ = M.to_quarto(s, pid); assert q.startswith("---") and "format: docx" in q
    tex, _ = M.to_latex(s, pid); assert "\\begin{document}" in tex and "\\section{Results}" in tex
    data, _ = M.to_docx(s, pid); z = zipfile.ZipFile(io.BytesIO(data)); assert "word/document.xml" in z.namelist() and b"Results" in z.read("word/document.xml")

def test_forest_svg_valid_and_accessible_and_study_table():
    s, pid = project_with_analysis(); eff = s.effects(pid); from metalab import stats as S
    r = S.meta_analyze([e["yi"] for e in eff], [e["vi"] for e in eff])
    svg = M.forest_svg([e["study_id"] for e in eff], [e["yi"] for e in eff], [e["vi"] for e in eff], r.est, r.ci, back_transform="exp"); xml.dom.minidom.parseString(svg)
    assert 'role="img"' in svg and "Forest plot of 4 effect sizes" in svg
    assert len(M.study_table(s, pid)) == 4

def test_backup_restores_manuscript_state_and_versions_are_append_only():
    s, pid = project_with_analysis(); M.compute_results(s, pid); s.save_section(pid, "methods", "v1"); s.save_section(pid, "methods", "v2")
    assert s.section(pid, "methods") == "v2" and len(s.section_history(pid, "methods")) == 2
    s2 = Store(":memory:"); s2.restore_json(s.backup_json()); assert s2.section(pid, "methods") == "v2" and len(s2.results(pid)) == len(s.results(pid))
    s.save_section(pid, "methods", "x", author="AI assistant"); assert s.section_history(pid, "methods")[0]["author"] == "human:self"
