"""End-to-end simulated systematic review (fictional Virtual Lab data): every stage connected, every manuscript number traceable to verified inputs."""
import io, zipfile
import pytest
from metalab import pipeline as P, manuscript as M, vlab
from metalab.store import Store

pytestmark = pytest.mark.skipif(not P.r_available(), reason="R + metafor required for the independent cross-check")

@pytest.fixture(scope="module")
def run():
    s = Store(":memory:"); rep = P.run_simulated_review(s, require_r=True); return s, rep

def test_all_stages_ran_in_order_and_are_connected(run):
    s, rep = run; names = [x["stage"] for x in rep["stages"]]
    assert names[0] == "search+import" and "second-extractor verification" in names and "independent PRISMA recount from exported CSV" in names and any(n.startswith("independent analysis cross-check") for n in names)
    st = {x["stage"]: x for x in rep["stages"]}; assert st["dedup+screening+extraction+RoB+effects"]["studies"] == 6 and st["second-extractor verification"]["disputed"] == 0 and st["second-extractor verification"]["verified"] == 40
    assert st["prisma"]["warnings"] == [] and 0.5 < st["agreement"]["kappa"] < 0.9
    stat = {x["stage"].split(" ", 1)[1]: x for x in rep["readiness"]}
    for name in ("Question", "Protocol / decisions", "Search log", "Records imported", "Deduplication", "Screening", "Effect sizes", "Analysis", "Manuscript", "Quality checks", "Reproducibility package"):
        assert stat[name]["status"] == "done", stat[name]
    # honest partials: two values are legitimately missing (SD not reported), the scenario rates RoB for only 3 of 6 studies
    assert stat["Extraction"]["status"] == "partial" and stat["Risk of bias"]["status"] == "partial" and "3/6" in stat["Risk of bias"]["detail"]
    assert stat["Verification"]["status"] == "done", stat["Verification"]

def test_every_manuscript_number_is_traceable_to_verified_inputs(run):
    s, rep = run; assert rep["traceable"] and not rep["problems"]
    for row in rep["trace"]:
        assert row["present"] and row["verified_by"] and row["verify_note"]
        if row["key"].startswith("analysis."): assert row["fresh"] is True and row["all_inputs_have_source"] and row["source_documents"] and row["n_effects"] >= 4
    assert "UNVERIFIED" not in rep["manuscript"] and "MISSING" not in rep["manuscript"] and "{{" not in rep["manuscript"]
    assert not [i for i in rep["qc"] if i["severity"] == "error"]

def test_independent_r_agrees_with_metalab_and_with_ground_truth(run):
    s, rep = run; x = [st for st in rep["stages"] if st["stage"].startswith("independent analysis")][0]; assert all(x["agree"].values())
    res = {r["key"]: r["value"] for r in s.results(rep["pid"])}; truth = vlab.true_meta("lnRR")
    assert abs(float(res["analysis.est"]) - truth.est) < 1e-3                                         # the stored result equals the scenario's known true pooled effect

def test_verifier_is_labelled_simulated_and_never_ai(run):
    s, rep = run; vs = {r["verified_by"] for r in s.results(rep["pid"])}; assert vs == {P.SIM_VERIFIER} and "fictional" in P.SIM_VERIFIER
    with pytest.raises(ValueError): s.verify_result(rep["pid"], "analysis.est", "AI model", "x")
    with pytest.raises(ValueError): s.verify_result(rep["pid"], "analysis.est", "system", "x")
    p = [q for q in s.projects() if q["id"] == rep["pid"]][0]; assert p["is_teaching"] and p["name"].startswith("SIMULATED")

def test_changing_an_input_breaks_traceability_until_recomputed_and_reverified(run):
    s, rep = run; pid = rep["pid"]; e = s.effects(pid)[0]
    s.x("UPDATE effect_sizes SET yi=yi+0.5 WHERE effect_id=?", (e["effect_id"],))
    rows = P.trace_report(s, pid); assert not P.traceable(rows) and any(r["fresh"] is False for r in rows)
    out, pr = M.assemble(s, pid, final=True); assert any(k == "stale" for k, _ in pr)
    M.compute_results(s, pid, back_transform="exp"); assert not P.traceable(P.trace_report(s, pid))      # recomputed values are unverified again
    s.x("UPDATE effect_sizes SET yi=yi-0.5 WHERE effect_id=?", (e["effect_id"],))

def test_export_package_is_complete_and_hashes_match(run):
    s, rep = run; from metalab import workflow as W
    z = zipfile.ZipFile(io.BytesIO(W.export_package(s, rep["pid"], "SIMULATED", "lnRR", "REML", True))); names = set(z.namelist())
    assert {"analysis_dataset.csv", "analysis.R", "screening.csv", "references.csv", "extraction_all_versions.csv", "risk_of_bias.csv", "audit_log.csv", "MANIFEST.txt", "SAP_draft.md", "prisma_flow.svg"} <= names
    import hashlib
    for line in z.read("MANIFEST.txt").decode().splitlines():
        h, n = line.split("  ", 1); assert hashlib.sha256(z.read(n)).hexdigest() == h
    pk = W.export_package(s, rep["pid"], "SIMULATED", "lnRR", "REML", True); pr = P.prisma_from_export(pk); res = {r["key"]: r["value"] for r in s.results(rep["pid"])}
    assert pr["included"] == int(res["prisma.included"]) and pr["identified"] == int(res["prisma.identified"])

def test_readiness_on_an_empty_project_is_all_todo_and_honest():
    s = Store(":memory:"); pid = s.create_project("Real-looking", "Bio", "Systematic review"); r = P.readiness(s, pid)
    assert [x["stage"][0] for x in r][:3] == ["1", "2", "3"] and all(x["status"] in ("todo", "partial") for x in r) and r[0]["status"] == "todo" and all(x["next"] for x in r if x["status"] != "done")

def test_pipeline_refuses_real_projects(run):
    s = Store(":memory:"); pid = s.create_project("My real review", "Bio", "Systematic review", is_teaching=False)
    # vlab.load creates its own teaching project; the guard protects against a mislabelled project being passed in via monkeypatching
    import metalab.vlab as V
    orig = V.load
    try:
        V.load = lambda store: pid
        with pytest.raises(ValueError, match="teaching"): P.run_simulated_review(s)
    finally: V.load = orig
