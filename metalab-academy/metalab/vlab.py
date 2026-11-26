"""Virtual Research Laboratory: a complete SIMULATED systematic review.

EVERYTHING HERE IS FICTIONAL: compound 'Nx-7', the journals, authors, studies and numbers do not exist.
Records carry 'SIM' identifiers (never DOI-like), the project is flagged is_teaching, and nothing is
mixed with real projects. Planted problems (listed in KEY) let learners practise screening conflicts,
duplicates, extraction errors, missing data, shared controls, unit mismatches and RoB judgements.
"""
from __future__ import annotations
import math
from . import stats as S, workflow as W

BANNER = "SIMULATED (fictional) - not real research"
# --- fictional primary data (lifespan in days unless noted); mean/SD per group, n = VIALS ----------
STUDIES = {
 "SIM-S001": dict(label="SIM-S001 Aldrin 2019", E={"E1": dict(ctrl=(10, 52.0, 3.2), treat=(10, 56.8, 3.6))}, note="Vial-level data in Table 2 (n=10 vials/group, 20 flies/vial). Text also quotes fly-level n=200 with SD 11.5 / 12.9 - WRONG unit for analysis."),
 "SIM-S002": dict(label="SIM-S002 Brandt 2020", E={"E1": dict(ctrl=(8, 48.5, 4.0), treat=(8, 52.0, 4.4))}, note="Clean report."),
 "SIM-S003": dict(label="SIM-S003 Castillo 2020", E={"E1": dict(ctrl=(8, 50.2, 1.2 * math.sqrt(8)), treat=(8, 53.9, 1.4 * math.sqrt(8)))}, reported_as_sem={"ctrl": 1.2, "treat": 1.4}, note="Table reports mean ± SEM (1.2 and 1.4), n=8 vials. SD must be derived."),
 "SIM-S004": dict(label="SIM-S004 Dube 2021", E={"E1": dict(ctrl=(12, 55.0, 4.1), treat=(12, 57.0, 4.5)), "E2": dict(ctrl=(12, 55.0, 4.1), treat=(12, 60.1, 4.8))}, note="Low and high dose share ONE control cohort (dependent effect sizes)."),
 "SIM-S005": dict(label="SIM-S005 Eriksen 2022", E={"E1": dict(ctrl=(6, 49.0, 4.0), treat=(6, 53.0, 4.5))}, reported_in_hours={"ctrl": (1176, 96), "treat": (1272, 108)}, note="Lifespan reported in HOURS (1176 h = 49.0 d)."),
 "SIM-S007": dict(label="SIM-S007 Farouk 2022", E={"E1": dict(ctrl=(10, 51.0, None), treat=(10, 54.5, None))}, note="Means and n reported; SD NOT reported anywhere (planned author contact; do not invent)."),
}
DUPLICATE_OF = {"SIM-S006": "SIM-S002"}   # a second report of Brandt 2020 (e.g. conference version) - link, don't double count
ELIGIBLE_FOR_ANALYSIS = ["SIM-S001", "SIM-S002", "SIM-S003", "SIM-S004", "SIM-S005"]   # S007 lacks SD

def _rec(i, title, authors, year, journal, abstract, doi=""):
    return dict(i=i, title=title, authors=authors, year=year, journal=journal, abstract=abstract, doi=doi)

RECORDS = [  # key: ta = title/abstract decision, ft = full-text decision (+reason)
 (_rec("SIM-R01", "Compound Nx-7 extends adult lifespan in Drosophila: a vial-level experiment", "Aldrin, X", "2019", "Simulated Journal of Fly Aging (fictional)", "Controlled experiment with concurrent controls; lifespan of adult flies measured in vials."), dict(study="SIM-S001", ta="include", ft="include")),
 (_rec("SIM-R02", "Nx-7 and longevity in adult fruit flies", "Brandt, Y", "2020", "Simulated Journal of Fly Aging (fictional)", "Adult D. melanogaster fed Nx-7; controls fed vehicle; survival recorded."), dict(study="SIM-S002", ta="include", ft="include")),
 (_rec("SIM-R03", "Nx-7 and longevity in adult fruit flies (conference abstract)", "Brandt, Y", "2020", "Simulated Congress on Aging Biology (fictional)", ""), dict(study="SIM-S006", ta="include", ft="exclude", reason="duplicate report of SIM-S002 (link to study, do not count twice)")),
 (_rec("SIM-R04", "Nx-7 supplementation and median lifespan in Drosophila", "Castillo, Z", "2020", "Simulated Biogerontology Letters (fictional)", "Vial-based lifespan assay with vehicle controls."), dict(study="SIM-S003", ta="include", ft="include")),
 (_rec("SIM-R05", "Dose-dependent effects of Nx-7 on fly lifespan", "Dube, W", "2021", "Simulated Journal of Fly Aging (fictional)", "Two doses compared with a common control."), dict(study="SIM-S004", ta="include", ft="include")),
 (_rec("SIM-R06", "Nx-7 and lifespan in Drosophila, measured in hours", "Eriksen, V", "2022", "Simulated Metabolic Biology (fictional)", "Lifespan assay; survival in hours."), dict(study="SIM-S005", ta="include", ft="include")),
 (_rec("SIM-R07", "Effects of Nx-7 on lifespan in flies", "Farouk, U", "2022", "Simulated Metabolic Biology (fictional)", "Lifespan of Nx-7-fed adult flies."), dict(study="SIM-S007", ta="include", ft="include")),
 (_rec("SIM-R08", "Nx-7 and survival in Drosophila (preprint)", "Brandt, Y", "2020", "SimRxiv preprint server (fictional)", "Adult D. melanogaster fed Nx-7; controls fed vehicle; survival recorded."), dict(study="SIM-S002", ta="include", ft="exclude", reason="preprint of included report SIM-R02")),
 (_rec("SIM-R09", "Nx-7 improves climbing but lifespan was not measured", "Gomez, T", "2021", "Simulated Behavior Letters (fictional)", "Flies fed Nx-7 show improved climbing; lifespan not assessed."), dict(study=None, ta="uncertain", ft="exclude", reason="lifespan not reported")),
 (_rec("SIM-R10", "Nx-7 and lifespan in mice", "Hansen, S", "2019", "Simulated Rodent Gerontology (fictional)", "Mice fed Nx-7; survival recorded."), dict(study=None, ta="uncertain", ft="exclude", reason="wrong organism (mice)")),
 (_rec("SIM-R11", "Nx-7 supplementation and flies: uncontrolled observations", "Ibrahim, R", "2018", "Simulated Journal of Fly Aging (fictional)", "Flies fed Nx-7 lived longer than expected from literature values; no concurrent control."), dict(study=None, ta="uncertain", ft="exclude", reason="no concurrent control group")),
 (_rec("SIM-R12", "A narrative review of lifespan compounds", "Jensen, Q", "2021", "Simulated Reviews in Aging (fictional)", "Narrative overview of compounds studied in model organisms."), dict(study=None, ta="exclude", ft=None)),
 (_rec("SIM-R13", "Nx-7 in yeast replicative lifespan", "Kim, P", "2020", "Simulated Yeast Biology (fictional)", "Yeast cells exposed to Nx-7."), dict(study=None, ta="exclude", ft=None)),
 (_rec("SIM-R14", "Cell culture toxicity of Nx-7", "Lopez, O", "2019", "Simulated Toxicology (fictional)", "In vitro cell viability assays."), dict(study=None, ta="exclude", ft=None)),
 (_rec("SIM-R15", "Wing development in Drosophila under heat stress", "Muller, N", "2021", "Simulated Developmental Biology (fictional)", "Wing morphology after heat stress."), dict(study=None, ta="exclude", ft=None)),
 (_rec("SIM-R16", "Gene expression after Nx-7 exposure in worms", "Nakamura, M", "2020", "Simulated Worm Biology (fictional)", "C. elegans transcriptomics."), dict(study=None, ta="exclude", ft=None)),
 (_rec("SIM-R17", "Education outcomes of fly husbandry classes", "Okafor, L", "2022", "Simulated Science Teaching (fictional)", "Student attitudes after fly lab activities."), dict(study=None, ta="exclude", ft=None)),
 (_rec("SIM-R18", "Metabolic rate of flies at different temperatures", "Park, K", "2018", "Simulated Metabolic Biology (fictional)", "Respirometry in flies."), dict(study=None, ta="exclude", ft=None)),
]
# Simulated second reviewer (FICTIONAL), disagreeing on three records so conflicts can be practised
SIM_REVIEWER = "SIM:reviewer-B (fictional)"
SIM_B_TA = {"SIM-R03": "exclude", "SIM-R09": "exclude", "SIM-R11": "include"}   # disagreements with the key

# RoB key (SYRCLE, simulated)
ROB_KEY = {("SIM-S001", "Random housing"): "low", ("SIM-S002", "Random housing"): "unclear", ("SIM-S003", "Random housing"): "unclear",
           ("SIM-S001", "Blinding (outcome assessor)"): "low", ("SIM-S002", "Blinding (outcome assessor)"): "unclear", ("SIM-S003", "Blinding (outcome assessor)"): "high"}
ROB_TEXT = {"SIM-S001": "Vials were placed in positions chosen by random number table; death scoring done by a technician blind to group (fictional text).",
            "SIM-S002": "Methods do not state how vials were positioned or who scored deaths (fictional).",
            "SIM-S003": "The experimenter who prepared the food also scored all deaths (fictional)."}

def planted_errors():
    return [
        "SIM-S001: text quotes fly-level n=200; the independent units are 10 vials/group (pseudoreplication trap).",
        "SIM-S003: values are mean ± SEM, not SD (SD = SEM × sqrt(8)).",
        "SIM-S004: E1 and E2 share one control cohort -> dependent effect sizes.",
        "SIM-S005: lifespan in hours (÷24 for days).",
        "SIM-R03 / SIM-R08: a conference abstract and a preprint are extra reports of SIM-S002 - link them, do not extract twice.",
        "SIM-S007: SD missing -> record missing with reason; do not impute; exclude from the quantitative synthesis or run labelled sensitivity.",
        "Screening: three records (SIM-R03, SIM-R09, SIM-R11) provoke reviewer conflicts."]

def ris():
    out = []
    for r, _ in RECORDS:
        out.append(f"TY  - JOUR\nTI  - {r['title']}\nAU  - {r['authors']}\nPY  - {r['year']}\nJO  - {r['journal']}\nAN  - {r['i']}\nAB  - {r['abstract']}\nER  - \n")
    # an exact duplicate (different case) of R01 to practise exact dedup
    r = RECORDS[0][0]
    out.append(f"TY  - JOUR\nTI  - {r['title'].upper()}\nAU  - {r['authors']}\nPY  - {r['year']}\nJO  - {r['journal']}\nAN  - SIM-R01b\nAB  - {r['abstract']}\nER  - \n")
    return "\n".join(out)

def fulltext(study_id):
    s = STUDIES.get(study_id)
    if not s: return "(No full text provided for this record in the simulation.)"
    lines = [f"[{BANNER}] {s['label']} - full-text excerpt (file name: {study_id}.pdf)", s["note"], "Table 2:"]
    for e, g in s["E"].items():
        for grp in ("ctrl", "treat"):
            n, m, sd = g[grp]
            if "reported_as_sem" in s: lines.append(f"  {e} {grp}: n={n} vials, mean={m} d, SEM={s['reported_as_sem'][grp]}")
            elif "reported_in_hours" in s: hm, hs = s["reported_in_hours"][grp]; lines.append(f"  {e} {grp}: n={n} vials, mean={hm} h, SD={hs} h")
            else: lines.append(f"  {e} {grp}: n={n} vials, mean={m} d, SD={'not reported' if sd is None else round(sd, 2)}")
    if study_id in ROB_TEXT: lines.append("Methods excerpt: " + ROB_TEXT[study_id])
    return "\n".join(lines)

def true_effects(measure="lnRR"):
    out = {}
    for sid in ELIGIBLE_FOR_ANALYSIS:
        for e, g in STUDIES[sid]["E"].items():
            (cn, cm, cs), (tn, tm, ts) = g["ctrl"], g["treat"]
            out[(sid, e)] = S.log_response_ratio(tm, ts, tn, cm, cs, cn) if measure == "lnRR" else S.smd(tm, ts, tn, cm, cs, cn)[:2]
    return out

def true_meta(measure="lnRR"):
    eff = true_effects(measure); y = [v[0] for v in eff.values()]; v = [v[1] for v in eff.values()]
    return S.meta_analyze(y, v, "random", "REML", hksj=True)

def load(store):
    """Create the teaching project (idempotent) and import the simulated records. Returns project id."""
    for p in store.projects():
        if p["is_teaching"] and p["name"].startswith("SIMULATED"):
            return p["id"]
    pid = store.create_project("SIMULATED review: Nx-7 and Drosophila lifespan (fictional)", "Simulation", "Systematic review + meta-analysis", True)
    store.import_refs(pid, ris(), "simulated_records.ris")
    store.add_decision(pid, "This project is entirely FICTIONAL training material. Do not mix with real data.", "note")
    return pid

def add_simulated_reviewer(store, pid):
    byan = {}
    for r in store.refs(pid):
        m = [x for x in r["raw"].splitlines() if x.startswith("AN  -")]
        if m: byan[m[0].split("-", 1)[1].strip()] = r["id"]
    n = 0
    for rec, k in RECORDS:
        if rec["i"] in byan and k["ta"] in ("include", "exclude", "uncertain"):
            dec = SIM_B_TA.get(rec["i"], k["ta"])
            store.screen(pid, byan[rec["i"]], "title_abstract", dec, "", SIM_REVIEWER); n += 1
    return n

def grade(store, pid):
    """Compare learner work with the key. Returns dict(section -> (score 0-1, [feedback]))."""
    out = {}; byan = {}
    for r in store.refs(pid):
        m = [x for x in r["raw"].splitlines() if x.startswith("AN  -")]
        if m: byan[m[0].split("-", 1)[1].strip()] = r
    # dedup
    fb = []; ok = 0
    r01b = byan.get("SIM-R01b")
    if r01b and r01b["dup_of"]: ok += 1
    else: fb.append("The exact duplicate (upper-case copy of SIM-R01) is not marked as a duplicate.")
    out["Deduplication"] = (ok / 1, fb)
    # screening T/A + FT (reviewer human:self by default - uses the most recent decision from any non-simulated reviewer)
    def decisions(stage):
        d = {}
        for (rid, rev), row in store.latest_decisions(pid, stage).items():
            if rev != SIM_REVIEWER: d[rid] = row
        return d
    ta, ft = decisions("title_abstract"), decisions("full_text")
    fb = []; tot = ok = 0
    for rec, k in RECORDS:
        r = byan.get(rec["i"]);
        if not r: continue
        tot += 1; d = ta.get(r["id"])
        want_in = k["ta"] in ("include", "uncertain")
        got_in = d and d["decision"] in ("include", "uncertain", "awaiting_full_text", "needs_translation", "needs_author_clarification")
        if d and bool(got_in) == want_in: ok += 1
        else: fb.append(f"{rec['i']}: expected {'advance to full text' if want_in else 'exclude'} at title/abstract.")
    out["Title/abstract screening"] = (ok / max(tot, 1), fb)
    fb = []; tot = ok = 0
    for rec, k in RECORDS:
        if k["ft"] is None: continue
        r = byan.get(rec["i"]); tot += 1; d = ft.get(r["id"]) if r else None
        if d and d["decision"] == k["ft"] and (k["ft"] != "exclude" or d["reason"].strip()): ok += 1
        else: fb.append(f"{rec['i']}: expected full-text '{k['ft']}'" + (f" with a reason (e.g. {k['reason']})" if k["ft"] == "exclude" else "") + ".")
    out["Full-text screening"] = (ok / max(tot, 1), fb)
    # extraction
    studies = {s["label"]: s["study_id"] for s in store.studies(pid)}
    cur = store.current_extracted(pid); fb = []; tot = ok = 0
    for sid, s in STUDIES.items():
        mine = next((v for k, v in studies.items() if sid in k), None)
        for e, g in s["E"].items():
            for grp, pre in (("ctrl", "ctrl"), ("treat", "treat")):
                n, m, sd = g[grp]
                for fld, true in ((f"{pre}_n", n), (f"{pre}_mean", m), (f"{pre}_sd", sd)):
                    tot += 1
                    row = next((r for r in cur if r["study_id"] == mine and r["experiment_id"] == e and r["field"] == fld), None) if mine else None
                    if true is None:
                        if row and row["value_clean"] is None and row["missing_reason"].strip(): ok += 1
                        else: fb.append(f"{sid}/{e}/{fld}: SD is not reported - record it as missing with a reason (never invent).")
                    elif row and row["value_clean"] is not None and abs(row["value_clean"] - true) <= 0.02 * max(abs(true), 1) + 1e-9: ok += 1
                    else: fb.append(f"{sid}/{e}/{fld}: expected ≈ {round(true, 2)} (days / vial-level n).")
    out["Extraction"] = (ok / max(tot, 1), fb[:12] + (["... more"] if len(fb) > 12 else []))
    # RoB
    rob = {(r["study_id"], r["domain"]): r["judgement"] for r in store.rob_current(pid) if r["tool"] == "SYRCLE"}
    fb = []; ok = 0
    for (sid, dom), want in ROB_KEY.items():
        mine = next((v for k, v in studies.items() if sid in k), None)
        if rob.get((mine, dom)) == want: ok += 1
        else: fb.append(f"{sid} / {dom}: key says '{want}' (supported by the methods excerpt).")
    out["Risk of bias (SYRCLE)"] = (ok / len(ROB_KEY), fb)
    # effect sizes
    eff = store.effects(pid); fb = []; ok = 0; want = true_effects("lnRR")
    for (sid, e), (y, v) in want.items():
        mine = next((vv for k, vv in studies.items() if sid in k), None)
        got = next((x for x in eff if x["study_id"] == mine and x["experiment_id"] == e and x["measure"] == "lnRR"), None)
        if got and abs(got["yi"] - y) < 1e-3 and abs(got["vi"] - v) < 1e-4: ok += 1
        else: fb.append(f"{sid}/{e}: expected lnRR ≈ {y:.4f}, variance ≈ {v:.5f}.")
    out["Effect sizes (lnRR)"] = (ok / len(want), fb)
    return out

def solve_perfectly(store, pid):
    """Reference solver used ONLY in tests to prove the key is internally consistent and gradable."""
    byan = {}
    for r in store.refs(pid):
        m = [x for x in r["raw"].splitlines() if x.startswith("AN  -")]
        if m: byan[m[0].split("-", 1)[1].strip()] = r["id"]
    store.deduplicate(pid)
    for rec, k in RECORDS:
        rid = byan[rec["i"]]
        store.screen(pid, rid, "title_abstract", k["ta"])
        if k["ft"]: store.screen(pid, rid, "full_text", k["ft"], k.get("reason", ""))
    sids = {}
    for sid, s in STUDIES.items():
        sids[sid] = store.new_study(pid, s["label"])
        for e, g in s["E"].items():
            for grp in ("ctrl", "treat"):
                n, m, sd = g[grp]
                for fld, val in ((f"{grp}_n", n), (f"{grp}_mean", m), (f"{grp}_sd", sd)):
                    if val is None: store.extract(pid, sids[sid], fld, "", "", "", experiment_id=e, missing_reason="SD not reported; author contact planned", reviewer="human:self")
                    else: store.extract(pid, sids[sid], fld, round(val, 6), "days", f"{sid}.pdf", "2", "Table 2", experiment_id=e, notes="derived/converted per lesson 18" if (sid in ("SIM-S003", "SIM-S005") and fld.endswith(("sd", "mean"))) else "", uncertainty="calculated" if (sid in ("SIM-S003", "SIM-S005") and fld.endswith(("sd", "mean"))) else "reported")
    for (sid, dom), j in ROB_KEY.items(): store.rate_rob(pid, sids[sid], "SYRCLE", dom, j, ROB_TEXT[sid])
    for (sid, e), (y, v) in true_effects("lnRR").items(): store.save_effect(pid, sids[sid], e, "lnRR", y, v)
    return sids
