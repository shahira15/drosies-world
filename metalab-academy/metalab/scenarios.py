"""Additional Virtual Lab scenarios. EVERYTHING IS FICTIONAL (compounds, trials, journals, authors, numbers). Records use SIM ids and no DOIs.
Each scenario ships planted problems appropriate to its discipline and a grading key; tests prove a reference solver scores 100%."""
from __future__ import annotations
import math
from . import stats as S, advanced as A

BANNER = "SIMULATED (fictional) - not real research"
CONT = ("treat_n", "treat_mean", "treat_sd", "ctrl_n", "ctrl_mean", "ctrl_sd")
BIN = ("events_treat", "n_treat", "events_ctrl", "n_ctrl")


class Scenario:
    def __init__(self, id, title, discipline, workflow, measure, intro, studies, records, planted, rob_tool="CUSTOM", rob_key=None, rob_text=None, unit="", binary=False, analysis_ids=None, dup_of=None):
        self.id, self.title, self.discipline, self.workflow, self.measure, self.intro = id, title, discipline, workflow, measure, intro
        self.studies, self.records, self.planted, self.rob_tool = studies, records, planted, rob_tool
        self.rob_key, self.rob_text, self.unit, self.binary = rob_key or {}, rob_text or {}, unit, binary
        self.analysis_ids = analysis_ids or list(studies); self.dup_of = dup_of or {}

    # ---------- records / text
    def ris(self):
        out = []
        for r, _ in self.records:
            out.append(f"TY  - JOUR\nTI  - {r['title']}\nAU  - {r['authors']}\nPY  - {r['year']}\nJO  - {r['journal']}\nAN  - {r['i']}\nAB  - {r['abstract']}\nER  - \n")
        r = self.records[0][0]
        out.append(f"TY  - JOUR\nTI  - {r['title'].upper()}\nAU  - {r['authors']}\nPY  - {r['year']}\nJO  - {r['journal']}\nAN  - {r['i']}b\nAB  - {r['abstract']}\nER  - \n")
        return "\n".join(out)

    def fulltext(self, sid):
        s = self.studies.get(sid)
        if not s: return "(No full text provided for this record in the simulation.)"
        lines = [f"[{BANNER}] {s['label']} - full-text excerpt (file name: {sid}.pdf)", s["note"], "Table 2:"]
        for e, g in s["E"].items():
            if self.binary: lines.append(f"  {e}: {g['report']}")
            else: lines.append(f"  {e}: {g['report']}")
        if sid in self.rob_text: lines.append("Methods excerpt: " + self.rob_text[sid])
        return "\n".join(lines)

    # ---------- truth
    def _eff(self, g):
        if self.binary:
            return S.log_risk_ratio(g["events_treat"], g["n_treat"], g["events_ctrl"], g["n_ctrl"], cc=0.5)
        (tn, tm, ts), (cn, cm, cs) = g["treat"], g["ctrl"]
        return {"lnRR": lambda: S.log_response_ratio(tm, ts, tn, cm, cs, cn), "SMD": lambda: S.smd(tm, ts, tn, cm, cs, cn)[:2], "MD": lambda: S.mean_difference(tm, ts, tn, cm, cs, cn)}[self.measure]()

    def true_effects(self):
        return {(sid, e): self._eff(self.studies[sid]["E"][e]["truth"]) for sid in self.analysis_ids for e in self.studies[sid]["E"]}

    def true_meta(self):
        eff = self.true_effects(); return S.meta_analyze([v[0] for v in eff.values()], [v[1] for v in eff.values()], "random", "REML", True)

    # ---------- project
    def load(self, store):
        name = f"SIMULATED [{self.discipline}]: {self.title}"
        for p in store.projects():
            if p["is_teaching"] and p["name"] == name: return p["id"]
        pid = store.create_project(name, "Simulation", "Systematic review + meta-analysis", True)
        store.import_refs(pid, self.ris(), f"simulated_{self.id}.ris"); store.add_decision(pid, "This project is entirely FICTIONAL training material. Do not mix with real data.", "note")
        return pid

    def _byan(self, store, pid):
        d = {}
        for r in store.refs(pid):
            m = [x for x in r["raw"].splitlines() if x.startswith("AN  -")]
            if m: d[m[0].split("-", 1)[1].strip()] = r
        return d

    SIM_REVIEWER = "SIM:reviewer-B (fictional)"

    def add_simulated_reviewer(self, store, pid):
        """FICTIONAL second reviewer who disagrees with the key on three records, to practise conflicts and kappa."""
        by = self._byan(store, pid); flip = {self.records[2][0]["i"], self.records[-6][0]["i"], self.records[-1][0]["i"]}; n = 0
        for rec_, k in self.records:
            if rec_["i"] not in by: continue
            dec = k["ta"]
            if rec_["i"] in flip: dec = "exclude" if dec != "exclude" else "include"
            store.screen(pid, by[rec_["i"]]["id"], "title_abstract", dec, "", self.SIM_REVIEWER); n += 1
        return n

    def fields(self): return BIN if self.binary else CONT

    def _truth_fields(self, g):
        if self.binary: return {k: g["truth"][k] for k in BIN}
        (tn, tm, ts), (cn, cm, cs) = g["truth"]["treat"], g["truth"]["ctrl"]
        return dict(treat_n=tn, treat_mean=tm, treat_sd=ts, ctrl_n=cn, ctrl_mean=cm, ctrl_sd=cs)

    def grade(self, store, pid):
        out = {}; by = self._byan(store, pid)
        r1 = by.get(self.records[0][0]["i"] + "b"); out["Deduplication"] = (1.0 if r1 and r1["dup_of"] else 0.0, [] if r1 and r1["dup_of"] else ["The exact duplicate (upper-case copy of the first record) is not marked as a duplicate."])
        def decisions(stage): return {rid: row for (rid, rev), row in store.latest_decisions(pid, stage).items() if not rev.startswith("SIM:")}
        ta, ft = decisions("title_abstract"), decisions("full_text")
        fb, ok, tot = [], 0, 0
        for rec, k in self.records:
            r = by.get(rec["i"]); tot += 1; d = ta.get(r["id"]) if r else None; want = k["ta"] in ("include", "uncertain")
            got = d and d["decision"] in ("include", "uncertain", "awaiting_full_text", "needs_translation", "needs_author_clarification")
            if d and bool(got) == want: ok += 1
            else: fb.append(f"{rec['i']}: expected {'advance to full text' if want else 'exclude'} at title/abstract.")
        out["Title/abstract screening"] = (ok / tot, fb)
        fb, ok, tot = [], 0, 0
        for rec, k in self.records:
            if k["ft"] is None: continue
            r = by.get(rec["i"]); tot += 1; d = ft.get(r["id"]) if r else None
            if d and d["decision"] == k["ft"] and (k["ft"] != "exclude" or d["reason"].strip()): ok += 1
            else: fb.append(f"{rec['i']}: expected full-text '{k['ft']}'" + (f" with a reason (e.g. {k['reason']})" if k["ft"] == "exclude" else "") + ".")
        out["Full-text screening"] = (ok / max(tot, 1), fb)
        studies = {s["label"]: s["study_id"] for s in store.studies(pid)}; cur = store.current_extracted(pid); fb, ok, tot = [], 0, 0
        for sid, s in self.studies.items():
            mine = next((v for k, v in studies.items() if sid in k), None)
            for e, g in s["E"].items():
                for fld, true in self._truth_fields(g).items():
                    tot += 1; row = next((r for r in cur if r["study_id"] == mine and r["experiment_id"] == e and r["field"] == fld), None) if mine else None
                    if true is None:
                        if row and row["value_clean"] is None and row["missing_reason"].strip(): ok += 1
                        else: fb.append(f"{sid}/{e}/{fld}: not reported - record as missing with a reason (never invent).")
                    elif row and row["value_clean"] is not None and abs(row["value_clean"] - true) <= 0.02 * max(abs(true), 1) + 1e-9: ok += 1
                    else: fb.append(f"{sid}/{e}/{fld}: expected ≈ {round(true, 3)}" + (f" ({self.unit})" if self.unit and not fld.endswith('_n') else "") + ".")
        out["Extraction"] = (ok / max(tot, 1), fb[:12] + (["... more"] if len(fb) > 12 else []))
        # shared-control dependence flag (control_group_id) where the scenario has one
        shared = [(sid, list(s["E"])) for sid, s in self.studies.items() if s.get("shared_control")]
        if shared:
            fb, ok = [], 0
            for sid, exps in shared:
                mine = next((v for k, v in studies.items() if sid in k), None)
                ids = {r["value_raw"].strip() for r in cur if r["study_id"] == mine and r["field"] == "control_group_id" and r["experiment_id"] in exps and r["value_raw"].strip()}
                if len(ids) == 1 and sum(1 for r in cur if r["study_id"] == mine and r["field"] == "control_group_id" and r["value_raw"].strip()) == len(exps): ok += 1
                else: fb.append(f"{sid}: experiments {', '.join(exps)} share one control cohort - record the SAME control_group_id for each (dependence).")
            out["Dependence flagged"] = (ok / len(shared), fb)
        if self.rob_key:
            rob = {(r["study_id"], r["domain"]): r["judgement"] for r in store.rob_current(pid) if r["tool"] == self.rob_tool}; fb, ok = [], 0
            for (sid, dom), want in self.rob_key.items():
                mine = next((v for k, v in studies.items() if sid in k), None)
                if rob.get((mine, dom)) == want: ok += 1
                else: fb.append(f"{sid} / {dom}: key says '{want}' (supported by the methods excerpt).")
            out[f"Risk of bias ({self.rob_tool})"] = (ok / len(self.rob_key), fb)
        eff = store.effects(pid); fb, ok = [], 0; want = self.true_effects()
        for (sid, e), (y, v) in want.items():
            mine = next((vv for k, vv in studies.items() if sid in k), None)
            got = next((x for x in eff if x["study_id"] == mine and x["experiment_id"] == e and x["measure"] == self.measure), None)
            if got and abs(got["yi"] - y) < 2e-3 and abs(got["vi"] - v) < 2e-3 * max(1, abs(v) * 10): ok += 1
            else: fb.append(f"{sid}/{e}: expected {self.measure} ≈ {y:.4f}, variance ≈ {v:.5f}.")
        out[f"Effect sizes ({self.measure})"] = (ok / len(want), fb)
        return out

    def solve_perfectly(self, store, pid):
        by = self._byan(store, pid); store.deduplicate(pid)
        for rec, k in self.records:
            rid = by[rec["i"]]["id"]; store.screen(pid, rid, "title_abstract", k["ta"])
            if k["ft"]: store.screen(pid, rid, "full_text", k["ft"], k.get("reason", ""))
        sids = {}
        for sid, s in self.studies.items():
            sids[sid] = store.new_study(pid, s["label"])
            for e, g in s["E"].items():
                for fld, val in self._truth_fields(g).items():
                    conv = g.get("converted", ()) and fld in g.get("converted", ())
                    if val is None: store.extract(pid, sids[sid], fld, "", "", "", experiment_id=e, missing_reason="not reported; author contact planned")
                    else: store.extract(pid, sids[sid], fld, round(val, 6), self.unit, f"{sid}.pdf", "2", "Table 2", experiment_id=e, uncertainty="calculated" if conv else "reported", notes="converted per lesson 18/31" if conv else "")
                if s.get("shared_control"): store.extract(pid, sids[sid], "control_group_id", f"{sid}-C1", "", f"{sid}.pdf", "2", "Methods", experiment_id=e)
        for (sid, dom), j in self.rob_key.items(): store.rate_rob(pid, sids[sid], self.rob_tool, dom, j, self.rob_text[sid])
        for (sid, e), (y, v) in self.true_effects().items(): store.save_effect(pid, sids[sid], e, self.measure, y, v)
        return sids


def rec(i, title, authors, year, journal, abstract, ta, ft=None, reason="", study=None):
    return (dict(i=i, title=title, authors=authors, year=str(year), journal=journal, abstract=abstract, doi=""), dict(study=study, ta=ta, ft=ft, reason=reason))


def distractors(prefix, topic, n_start):
    ts = [("A narrative review of " + topic, "Narrative overview.", "exclude"), (topic.capitalize() + " in an unrelated organism/setting", "Different population entirely.", "exclude"),
          ("Laboratory methods note on " + topic, "Technical protocol; no comparison.", "exclude"), ("Opinion: why " + topic + " matters", "Commentary without data.", "exclude"), ("Modelling study of " + topic, "Simulation only; no participants/samples.", "exclude")]
    return [rec(f"SIM-{prefix}{n_start+i:02d}", t, f"Distractor{i}, X", 2018 + i, "Simulated Journal (fictional)", a, ta) for i, (t, a, ta) in enumerate(ts)]


def ex_records(prefix, topic, studies, extra_ft):
    """Eligible records for each study, plus FT-excluded lookalikes (extra_ft: list of (title, abstract, reason))."""
    out = []; n = 1
    for sid, s in studies.items():
        out.append(rec(f"SIM-{prefix}{n:02d}", s["title"], s["label"].split()[1] + ", A", s["year"], "Simulated Journal (fictional)", s["abstract"], "include", "include", study=sid)); n += 1
    for t, a, why in extra_ft:
        out.append(rec(f"SIM-{prefix}{n:02d}", t, "Lookalike, B", 2021, "Simulated Journal (fictional)", a, "uncertain", "exclude", why)); n += 1
    return out, n


def cont(treat, ctrl, rep, truth=None, converted=()):
    return dict(treat=treat, ctrl=ctrl, report=rep, truth=dict(treat=treat, ctrl=ctrl) if truth is None else truth, converted=converted)


def binr(a, n1, c, n2, rep, truth=None, converted=()):
    d = dict(events_treat=a, n_treat=n1, events_ctrl=c, n_ctrl=n2)
    return dict(**d, report=rep, truth=truth or d, converted=converted)


# ===================================================================================== CLINICAL
_cl = {
 "SIM-S101": dict(label="SIM-S101 Alvarez 2018", year=2018, title="Zorvex versus placebo for sim-fever: a randomised trial", abstract="Randomised double-blind placebo-controlled trial; 28-day mortality.", note="ITT analysis. Table 2 gives ITT numbers; per-protocol numbers appear in the text (use ITT).", E={"E1": binr(12, 100, 20, 100, "ITT: Zorvex 12/100 deaths; placebo 20/100. (Per-protocol in text: 11/92 vs 19/95 - do NOT use.)")}),
 "SIM-S102": dict(label="SIM-S102 Bakker 2019", year=2019, title="Zorvex in sim-fever: a multicentre trial", abstract="Randomised trial; 28-day mortality.", note="Clean report.", E={"E1": binr(18, 150, 27, 150, "Zorvex 18/150; placebo 27/150.")}),
 "SIM-S103": dict(label="SIM-S103 Chen 2020", year=2020, title="Zorvex for sim-fever in older adults", abstract="Randomised trial; mortality.", note="Results are reported as percentages only: 7.5% of 80 and 12.5% of 80.", E={"E1": binr(6, 80, 10, 80, "Mortality 7.5% (Zorvex, n=80) vs 12.5% (placebo, n=80).", converted=("events_treat", "events_ctrl"))}),
 "SIM-S104": dict(label="SIM-S104 Dlamini 2021", year=2021, title="Zorvex in sim-fever: a small trial with rare deaths", abstract="Randomised trial; deaths within 28 days.", note="ZERO deaths in the Zorvex arm: do not drop the study; use a method suited to zero cells and report the correction.", E={"E1": binr(0, 40, 3, 40, "Zorvex 0/40; placebo 3/40.")}),
 "SIM-S105": dict(label="SIM-S105 Eze 2021", year=2021, title="Low- and high-dose Zorvex versus placebo", abstract="Three-arm randomised trial.", note="Two Zorvex dose arms share ONE placebo arm (n=60): dependent comparisons. Record the same control_group_id.", shared_control=True,
   E={"E1": binr(8, 60, 14, 60, "Low dose 8/60 vs placebo 14/60."), "E2": binr(6, 60, 14, 60, "High dose 6/60 vs placebo 14/60 (same placebo arm).")}),
}
_cl_rec, _n = ex_records("C", "Zorvex", _cl, [("Zorvex observational cohort in sim-fever", "Cohort without randomisation or concurrent control.", "not randomised, no control group"), ("Zorvex for sim-rash (different condition)", "Different disease.", "wrong condition"), ("Zorvex trial reporting only quality of life", "No mortality outcome.", "mortality not reported")])
_cl_rec.insert(2, rec("SIM-C90", "Zorvex versus placebo for sim-fever (conference abstract)", "Alvarez, A", 2018, "Simulated Congress of Medicine (fictional)", "", "include", "exclude", "duplicate report of SIM-S101 (link to study)", study="SIM-S106"))
CLINICAL = Scenario("clinical", "Zorvex versus placebo, 28-day mortality (binary)", "Clinical", "clinical", "lnRR_binary",
 "Randomised trials with binary mortality outcomes. Practise: ITT vs per-protocol, percentages to counts, a ZERO-EVENT trial, shared placebo arms, duplicate reports; RoB 2 domains.",
 _cl, _cl_rec + distractors("C", "Zorvex", 40),
 ["SIM-S101: use the ITT table, not the per-protocol numbers in the text.", "SIM-S103: results are percentages: convert to event counts (label as calculated).", "SIM-S104: zero events in one arm: keep the study; correction/MH/Peto and sensitivity analysis (Module 28/33).", "SIM-S105: two dose arms share one placebo: same control_group_id; dependence.", "SIM-C90: a conference abstract duplicating SIM-S101: link, don't extract twice."],
 rob_tool="ROB2", rob_key={("SIM-S101", "Randomisation process"): "low", ("SIM-S102", "Randomisation process"): "some concerns", ("SIM-S104", "Measurement of the outcome"): "low"},
 rob_text={"SIM-S101": "Allocation by central web-based randomisation with concealed sequence (fictional).", "SIM-S102": "Randomisation is mentioned but the method is not described (fictional).", "SIM-S104": "Death is an objective outcome ascertained from registries (fictional)."}, binary=True, unit="events/participants")
CLINICAL.studies = {k: v for k, v in _cl.items()}

# ===================================================================================== PLANT
_pl = {
 "SIM-S201": dict(label="SIM-S201 Adeyemi 2018", year=2018, title="MycoSim inoculation and shoot biomass of wheat under drought", abstract="Field plots; shoot dry biomass.", note="n = plots (6 per group); biomass in kg per plot.", E={"E1": cont((6, 4.8, 0.7), (6, 4.1, 0.6), "Inoculated: n=6 plots, mean 4.8 kg/plot, SD 0.7; control: n=6, 4.1, SD 0.6.")}),
 "SIM-S202": dict(label="SIM-S202 Bianchi 2019", year=2019, title="Mycorrhizal inoculant effects on maize biomass", abstract="Greenhouse pots; shoot dry mass.", note="Reported in g per PLANT; 10 plants per pot, 5 pots per treatment. The independent unit is the POT (n=5); per-pot means: 52.0 (SD 4.5) inoculated vs 46.0 (SD 4.0) control (Table 3).", E={"E1": cont((5, 52.0, 4.5), (5, 46.0, 4.0), "Table 3 (pot means): n=5 pots; 52.0 (SD 4.5) vs 46.0 (SD 4.0) g/plant. Text: n=50 plants per group (WRONG unit).")}),
 "SIM-S203": dict(label="SIM-S203 Cardoso 2020", year=2020, title="MycoSim and barley growth in drought", abstract="Pot experiment; biomass.", note="Values are mean ± SE; n = 8 pots.", E={"E1": cont((8, 31.0, 1.2 * math.sqrt(8)), (8, 27.5, 1.1 * math.sqrt(8)), "Inoculated mean 31.0 ± 1.2 (SE), control 27.5 ± 1.1 (SE), n=8 pots.", converted=("treat_sd", "ctrl_sd"))}),
 "SIM-S204": dict(label="SIM-S204 Dahl 2021", year=2021, title="Split-plot trial of MycoSim under three irrigation regimes", abstract="Split-plot design; biomass.", note="Whole-plot (irrigation) replicated 4 times; the inoculation factor is applied in subplots. Use the subplot-level table for the drought-stress comparison with n=4 blocks.", E={"E1": cont((4, 22.4, 2.0), (4, 19.8, 1.8), "Drought regime, subplot means (n=4 blocks): inoculated 22.4 (SD 2.0), control 19.8 (SD 1.8). (Text: 'n=48 subplots' is WRONG unit.)")}),
 "SIM-S205": dict(label="SIM-S205 Eliasson 2022", year=2022, title="MycoSim in drought: biomass in kg/ha", abstract="Field trial; yield-related biomass.", note="Reported in tonnes per hectare; analysis uses t/ha as the common unit across the review for field trials (no conversion needed).", E={"E1": cont((5, 6.2, 0.8), (5, 5.5, 0.7), "n=5 plots: 6.2 (SD 0.8) vs 5.5 (SD 0.7) t/ha.")}),
}
_pl_rec, _n = ex_records("P", "MycoSim", _pl, [("MycoSim and root colonisation only", "Colonisation rate; no biomass measured.", "biomass not reported"), ("MycoSim without uninoculated control", "All plots inoculated.", "no control group"), ("MycoSim effects in tomato fruit quality", "Fruit sugar content only.", "outcome not eligible")])
_pl_rec.insert(2, rec("SIM-P90", "Dataset paper: MycoSim wheat field trial", "Adeyemi, A", 2019, "Simulated Data Journal (fictional)", "Data descriptor for the field trial.", "include", "exclude", "duplicate report of SIM-S201 (link to study)", study="SIM-S206"))
PLANT = Scenario("plant", "MycoSim inoculant and drought biomass (lnRR, plots/pots as units)", "Plant biology", "ecological", "lnRR",
 "Pot and field experiments where the independent unit is the pot/plot/block, not the plant or subplot. Practise units, split-plot designs, SE vs SD, dataset-paper duplicates.",
 _pl, _pl_rec + distractors("P", "MycoSim", 40),
 ["SIM-S202: independent unit is the pot (n=5), not 50 plants.", "SIM-S203: ± values are SE; SD = SE×√8 (label calculated).", "SIM-S204: split-plot: use block-level n=4; text's 'n=48 subplots' is pseudoreplication.", "SIM-S205: units t/ha throughout field trials (consistent unit).", "SIM-P90: a dataset paper duplicating SIM-S201: link, do not extract twice."],
 rob_tool="CUSTOM", rob_key={("SIM-S201", "Randomisation of plots"): "low", ("SIM-S202", "Independence of units"): "high", ("SIM-S204", "Independence of units"): "low"},
 rob_text={"SIM-S201": "Plots were assigned to treatments by random number draw (fictional).", "SIM-S202": "Plants within each pot were analysed as independent replicates (fictional).", "SIM-S204": "Analysis accounted for the split-plot structure with block as random factor (fictional)."}, unit="kg/plot or g/plant (as stated)")

# ===================================================================================== MICROBIOLOGY
_mb = {
 "SIM-S301": dict(label="SIM-S301 Almeida 2018", year=2018, title="Bactirex and log10 reduction of S. simulans in vitro", abstract="Time-kill assay; log10 CFU/mL reduction.", note="Biological replicates n=6 independent cultures.", E={"E1": cont((6, 3.1, 0.5), (6, 0.4, 0.4), "Log10 CFU/mL reduction at 24 h: Bactirex 3.1 (SD 0.5), control 0.4 (SD 0.4); n=6 independent cultures.")}),
 "SIM-S302": dict(label="SIM-S302 Bauer 2019", year=2019, title="Bactirex killing of simulated biofilms", abstract="Biofilm assay; CFU counts.", note="Reported as raw CFU/mL (geometric means). The review's outcome is log10 CFU/mL: log-transform.", E={"E1": cont((5, 2.7, 0.6), (5, 0.3, 0.5), "Final CFU/mL: control 5.0×10^6, Bactirex 1.0×10^4 -> reduction expressed here as log10 reductions 2.7 (SD 0.6) vs 0.3 (SD 0.5), n=5.", converted=("treat_mean", "ctrl_mean"))}),
 "SIM-S303": dict(label="SIM-S303 Cho 2020", year=2020, title="Bactirex time-kill with detection limit", abstract="Time-kill; some counts below detection.", note="Two Bactirex replicates were 'ND' (below the 10 CFU detection limit): do NOT enter zero. Summary data are reported using substitution at limit/2: mean 3.4 (SD 0.7), n=6; record that censoring exists.", E={"E1": cont((6, 3.4, 0.7), (6, 0.5, 0.3), "Bactirex 3.4 (SD 0.7; 2 of 6 ND, imputed at half detection limit), control 0.5 (SD 0.3); n=6.")}),
 "SIM-S304": dict(label="SIM-S304 Dvorak 2021", year=2021, title="Bactirex against resistant S. simulans", abstract="Time-kill assay.", note="Mean ± SEM, n=8 independent cultures (technical triplicates per culture are NOT independent).", E={"E1": cont((8, 2.2, 0.35 * math.sqrt(8)), (8, 0.2, 0.3 * math.sqrt(8)), "Bactirex 2.2 ± 0.35 (SEM), control 0.2 ± 0.30 (SEM); n=8 cultures x 3 technical replicates.", converted=("treat_sd", "ctrl_sd"))}),
 "SIM-S305": dict(label="SIM-S305 Eze 2022", year=2022, title="Bactirex killing at two temperatures", abstract="Time-kill; 25 and 37 °C.", note="Two temperature experiments share ONE control culture set. Record the same control_group_id.", shared_control=True,
   E={"E1": cont((6, 2.9, 0.5), (6, 0.4, 0.3), "25 °C: Bactirex 2.9 (SD 0.5) vs control 0.4 (SD 0.3), n=6."), "E2": cont((6, 3.3, 0.6), (6, 0.4, 0.3), "37 °C: Bactirex 3.3 (SD 0.6) vs the same control 0.4 (SD 0.3), n=6.")}),
}
_mb_rec, _n = ex_records("M", "Bactirex", _mb, [("Bactirex tested only in silico", "Docking study.", "no laboratory outcome"), ("Bactirex MIC determination without kill curves", "MIC only; no log reduction.", "outcome not eligible"), ("Bactirex in mice infection model", "In vivo infection; different outcome.", "wrong study system")])
_mb_rec.insert(2, rec("SIM-M90", "Bactirex and log reduction (preprint)", "Almeida, A", 2018, "SimRxiv preprint server (fictional)", "Preprint of the time-kill study.", "include", "exclude", "preprint of included report SIM-S301", study="SIM-S306"))
MICRO = Scenario("micro", "Bactirex antimicrobial: log10 CFU reduction (mean difference)", "Microbiology", "preclinical", "MD",
 "In vitro time-kill studies. Practise log transformation, biological vs technical replicates, SEM vs SD, detection limits (censoring), shared controls.",
 _mb, _mb_rec + distractors("M", "Bactirex", 40),
 ["SIM-S302: raw CFU converted to log10 reductions (label calculated).", "SIM-S303: values below detection limit were imputed at half the limit: note censoring; sensitivity analysis excluding it.", "SIM-S304: SEM with n=8 cultures; technical replicates are not independent.", "SIM-S305: the two temperatures share one control set: same control_group_id.", "SIM-M90: a preprint of SIM-S301: link, don't double count."],
 rob_tool="CUSTOM", rob_key={("SIM-S301", "Independent biological replicates"): "low", ("SIM-S304", "Independent biological replicates"): "unclear", ("SIM-S303", "Handling of non-detects"): "high"},
 rob_text={"SIM-S301": "Six independent cultures prepared on separate days (fictional).", "SIM-S304": "Replicates described as 'n=8' but the text mixes cultures and wells (fictional).", "SIM-S303": "Non-detects were substituted at half the detection limit without sensitivity analysis (fictional)."}, unit="log10 CFU/mL")

# ===================================================================================== ECOLOGY
_ec = {
 "SIM-S401": dict(label="SIM-S401 Abara 2017", year=2017, title="Experimental warming and plant species richness in grassland (site A)", abstract="Open-top chambers; species richness per plot.", note="Species richness per plot; n = plots.", E={"E1": cont((8, 14.0, 2.5), (8, 16.0, 2.7), "Warmed: 8 plots, 14.0 (SD 2.5); control: 8 plots, 16.0 (SD 2.7).")}),
 "SIM-S402": dict(label="SIM-S402 Boateng 2018", year=2018, title="Warming effects on alpine plant richness", abstract="Alpine plots; richness.", note="Two elevations (E1 low, E2 high) share ONE set of control plots.", shared_control=True, E={"E1": cont((6, 12.1, 2.0), (6, 13.5, 2.2), "Low elevation warmed 12.1 (SD 2.0) vs control 13.5 (SD 2.2), n=6."), "E2": cont((6, 9.8, 1.9), (6, 13.5, 2.2), "High elevation warmed 9.8 (SD 1.9) vs the same control 13.5 (SD 2.2), n=6.")}),
 "SIM-S403": dict(label="SIM-S403 Cruz 2019", year=2019, title="Warming and richness in tundra", abstract="Field warming; richness.", note="Only a figure is available: values were read from Figure 3 (digitised; label as reconstructed): warmed 7.5 (SD 1.4), control 8.8 (SD 1.5), n=10 plots.", E={"E1": cont((10, 7.5, 1.4), (10, 8.8, 1.5), "Digitised from Fig. 3 (n=10 plots): warmed 7.5 ± SD 1.4, control 8.8 ± SD 1.5.", converted=("treat_mean", "treat_sd", "ctrl_mean", "ctrl_sd"))}),
 "SIM-S404": dict(label="SIM-S404 Dube 2020", year=2020, title="Warming and species richness in a temperate meadow", abstract="Chambers; richness.", note="Clean report; n = plots.", E={"E1": cont((9, 18.0, 3.0), (9, 19.5, 3.2), "Warmed 18.0 (SD 3.0, n=9); control 19.5 (SD 3.2, n=9).")}),
 "SIM-S405": dict(label="SIM-S405 Eriksen 2021", year=2021, title="Warming and richness in a desert shrubland", abstract="Chambers; richness.", note="Means reported but the SD is missing from text, tables and figures (author contact planned).", E={"E1": cont((7, 6.0, None), (7, 7.1, None), "Warmed 6.0, control 7.1, n=7 plots each; variability not reported.", truth=dict(treat=(7, 6.0, None), ctrl=(7, 7.1, None)))}),
}
_ec_rec, _n = ex_records("E", "warming", _ec, [("Warming and richness: observational gradient study", "Natural temperature gradient, no experiment.", "not an experimental manipulation"), ("Warming effects on plant biomass only", "Biomass; richness not measured.", "outcome not eligible"), ("Warming meta-analysis of animal abundance", "Different taxa/outcome.", "wrong outcome")])
_ec_rec.insert(2, rec("SIM-E90", "Warming and plant species richness in grassland (data paper)", "Abara, A", 2017, "Simulated Data Journal (fictional)", "Data descriptor for site A.", "include", "exclude", "duplicate report of SIM-S401 (link to study)", study="SIM-S406"))
ECO = Scenario("eco", "Experimental warming and plant species richness (lnRR; dependence)", "Ecology", "ecological", "lnRR",
 "Field warming experiments with shared control plots, digitised data and missing variance. Practise dependence (shared controls), reconstructed values, missing SD, data-paper duplicates.",
 _ec, _ec_rec + distractors("E", "warming", 40),
 ["SIM-S402: two elevation effects share one control set: same control_group_id; dependent effect sizes.", "SIM-S403: values digitised from a figure: label reconstructed; sensitivity analysis.", "SIM-S405: SD missing: record missing with reason; exclude from the primary analysis; no imputation.", "SIM-E90: a data paper duplicating SIM-S401: link, do not double count.", "Analysis: ignoring shared controls understates variance (Module 38-40)."],
 rob_tool="CUSTOM", rob_key={("SIM-S401", "Randomisation of plots"): "low", ("SIM-S403", "Randomisation of plots"): "unclear", ("SIM-S404", "Replication at the plot level"): "low"},
 rob_text={"SIM-S401": "Plots were randomly assigned to warming or control (fictional).", "SIM-S403": "Assignment of plots to treatments is not described (fictional).", "SIM-S404": "Plot is the experimental unit; n=9 per group (fictional)."}, analysis_ids=["SIM-S401", "SIM-S402", "SIM-S403", "SIM-S404"], unit="species per plot")

# ===================================================================================== EDUCATION
def _eff_n(n, m=25, icc=0.1): return n / A.design_effect(m, icc)
_ed = {
 "SIM-S501": dict(label="SIM-S501 Abbott 2018", year=2018, title="Storytelling in biology lessons: a classroom trial", abstract="Quasi-experimental; test scores.", note="Intervention and comparison were assigned at the CLASSROOM level (25 students per class). Protocol rule: adjust n by the design effect with ICC 0.10 and m=25 (effective n = n/2.4). Raw: 100 students per group, test score mean 72 (SD 12) vs 68 (SD 12).", E={"E1": cont((100, 72.0, 12.0), (100, 68.0, 12.0), "Students: 100 per group; scores 72.0 (SD 12.0) vs 68.0 (SD 12.0); classes of 25.", truth=dict(treat=(100 / 2.4, 72.0, 12.0), ctrl=(100 / 2.4, 68.0, 12.0)))}),
 "SIM-S502": dict(label="SIM-S502 Bose 2019", year=2019, title="Narrative teaching and chemistry achievement", abstract="Randomised by student.", note="Individually randomised; no clustering: use student n.", E={"E1": cont((60, 75.0, 10.0), (60, 71.0, 11.0), "Students randomised individually: n=60 per group; 75.0 (SD 10.0) vs 71.0 (SD 11.0).")}),
 "SIM-S503": dict(label="SIM-S503 Cheng 2020", year=2020, title="Story-based physics teaching", abstract="Quasi-experimental.", note="Scores reported as percent correct on a different test form; the review standardises with SMD so scales are comparable. SDs reported as SEM with n=40 each.", E={"E1": cont((40, 66.0, 1.8 * math.sqrt(40)), (40, 62.0, 1.9 * math.sqrt(40)), "Percent correct: 66.0 ± 1.8 (SEM) vs 62.0 ± 1.9 (SEM), n=40 each.", converted=("treat_sd", "ctrl_sd"))}),
 "SIM-S504": dict(label="SIM-S504 Diaz 2021", year=2021, title="Storytelling and student attitudes in STEM", abstract="Randomised classrooms; attitude scale.", note="Classroom-randomised, classes of 25 (apply the protocol design-effect rule, ICC 0.10): 125 students per group; scale scores 3.9 (SD 0.8) vs 3.6 (SD 0.8).", E={"E1": cont((125, 3.9, 0.8), (125, 3.6, 0.8), "125 students per group (classes of 25): 3.9 (SD 0.8) vs 3.6 (SD 0.8).", truth=dict(treat=(125 / 2.4, 3.9, 0.8), ctrl=(125 / 2.4, 3.6, 0.8)))}),
 "SIM-S505": dict(label="SIM-S505 Evans 2022", year=2022, title="Narrative methods in biology: median scores", abstract="Cohort comparison.", note="Medians and IQRs only (no means/SDs): record as missing for mean/SD (estimation methods are an option but not used in the primary analysis).", E={"E1": cont((50, None, None), (50, None, None), "Medians 70 (IQR 62-78) vs 66 (IQR 58-74), n=50 each.", truth=dict(treat=(50, None, None), ctrl=(50, None, None)))}),
}
_ed_rec, _n = ex_records("D", "storytelling", _ed, [("Storytelling and engagement: qualitative interviews", "Interviews; no comparison group.", "no comparison group"), ("Storytelling in primary mathematics", "Primary school mathematics; review is STEM secondary/tertiary.", "wrong population"), ("Storytelling: a teacher survey", "Survey of teacher opinions.", "no outcome data")])
_ed_rec.insert(2, rec("SIM-D90", "Storytelling in biology lessons (conference paper)", "Abbott, A", 2018, "Simulated Education Congress (fictional)", "", "include", "exclude", "duplicate report of SIM-S501 (link to study)", study="SIM-S506"))
EDU = Scenario("edu", "Storytelling in STEM teaching (SMD; classroom clustering)", "Education", "clinical", "SMD",
 "Quasi-experimental and randomised classroom studies. Practise clustering (classroom units, design effect), SEM vs SD, medians without means, different scales (SMD), conference duplicates.",
 _ed, _ed_rec + distractors("D", "storytelling", 40),
 ["SIM-S501 and SIM-S504: classroom-level assignment: apply the protocol design effect (ICC 0.10, m=25): effective n = n/2.4 (label calculated).", "SIM-S502: individually randomised: raw n is correct.", "SIM-S503: SEM -> SD (×√40).", "SIM-S505: medians/IQR only: record mean/SD as missing (no silent estimation).", "SIM-D90: a conference paper duplicating SIM-S501: link, do not double count."],
 rob_tool="CUSTOM", rob_key={("SIM-S502", "Allocation to groups"): "low", ("SIM-S501", "Allocation to groups"): "high", ("SIM-S503", "Baseline equivalence"): "unclear"},
 rob_text={"SIM-S502": "Students were individually randomised using a random-number list (fictional).", "SIM-S501": "Teachers chose which classes received the storytelling lessons (fictional).", "SIM-S503": "Baseline test scores are not reported (fictional)."}, analysis_ids=["SIM-S501", "SIM-S502", "SIM-S503", "SIM-S504"], unit="score units (as stated)")
EDU.studies["SIM-S501"]["E"]["E1"]["converted"] = ("treat_n", "ctrl_n"); EDU.studies["SIM-S504"]["E"]["E1"]["converted"] = ("treat_n", "ctrl_n")

ALL = {s.id: s for s in (CLINICAL, PLANT, MICRO, ECO, EDU)}
