"""Pure functions behind the review workflow (no UI, no DB): agreement statistics, fuzzy duplicate candidates,
PRISMA flow diagram, extraction validation, effect-size building, reproducibility export."""
from __future__ import annotations
import csv, difflib, hashlib, io, json, math, re, zipfile, datetime
from collections import defaultdict
from html import escape
from . import stats as S

# ------------------------------------------------------------------ agreement
def cohens_kappa(r1, r2):
    """Cohen's kappa for two raters over the same items (nominal categories).
    kappa = (po - pe)/(1 - pe). SE uses the large-sample approximation sqrt(po(1-po)/(n(1-pe)^2)); treat the CI as rough.
    Returns dict; kappa is None if undefined (pe == 1). Benchmarks such as Landis & Koch are conventions, not thresholds of validity;
    kappa depends on prevalence/marginals, so also report percent agreement."""
    if len(r1) != len(r2) or not len(r1):
        raise ValueError("Ratings must be non-empty and the same length.")
    n = len(r1); cats = sorted(set(r1) | set(r2))
    po = sum(a == b for a, b in zip(r1, r2)) / n
    pe = sum((sum(a == c for a in r1) / n) * (sum(b == c for b in r2) / n) for c in cats)
    if math.isclose(pe, 1.0):
        return dict(kappa=None, po=po, pe=pe, n=n, se=None, ci=None, note="Undefined: expected agreement is 1 (no variation).")
    k = (po - pe) / (1 - pe)
    se = math.sqrt(po * (1 - po) / (n * (1 - pe) ** 2))
    return dict(kappa=k, po=po, pe=pe, n=n, se=se, ci=(k - 1.96 * se, k + 1.96 * se), note="")


# ------------------------------------------------------------ fuzzy dedup
_STOP = {"the", "of", "and", "for", "with", "from", "that", "this", "their", "between", "among", "into", "using"}
PREPRINT_HINTS = ("biorxiv", "medrxiv", "arxiv", "research square", "ssrn", "preprints.org", "europe pmc preprint")

def _norm(t): return re.sub(r"[^a-z0-9 ]", "", re.sub(r"\s+", " ", (t or "").lower())).strip()
def _first_author(a): return re.split(r"[;,]", (a or "").strip())[0].strip().lower()

def fuzzy_pairs(refs, threshold=0.88):
    """Yield (ref_id_a, ref_id_b, score, reasons, relation_guess). Candidates only - a HUMAN must confirm each.
    Blocking via rare shared tokens keeps this near-linear for realistic library sizes."""
    toks = {}; index = defaultdict(list)
    for r in refs:
        t = [w for w in _norm(r["title"]).split() if len(w) >= 5 and w not in _STOP]
        toks[r["id"]] = set(t)
        for w in set(t): index[w].append(r["id"])
    byid = {r["id"]: r for r in refs}; seen = set()
    for w, ids in index.items():
        if len(ids) > 60: continue          # skip very common tokens
        for i in range(len(ids)):
            for j in range(i + 1, len(ids)):
                a, b = sorted((ids[i], ids[j]))
                if (a, b) in seen: continue
                seen.add((a, b))
                if len(toks[a] & toks[b]) < 3: continue
                ra, rb = byid[a], byid[b]
                score = difflib.SequenceMatcher(None, _norm(ra["title"]), _norm(rb["title"])).ratio()
                if score < threshold: continue
                try: dy = abs(int(ra["year"]) - int(rb["year"]))
                except (TypeError, ValueError): dy = None
                if dy is not None and dy > 1 and score < 0.97: continue
                reasons = [f"title similarity {score:.2f}"]
                if dy is not None: reasons.append(f"year difference {dy}")
                if _first_author(ra["authors"]) and _first_author(ra["authors"]) == _first_author(rb["authors"]): reasons.append("same first author")
                da, db_ = (ra["doi"] or "").lower().strip(), (rb["doi"] or "").lower().strip()
                if da and db_ and da != db_: reasons.append("DIFFERENT DOIs (may be preprint vs article, or distinct papers) - check")
                ja, jb = (ra["journal"] or "").lower(), (rb["journal"] or "").lower()
                relation = "possible duplicate record"
                if any(h in ja or h in jb for h in PREPRINT_HINTS) and ja != jb: relation = "possible preprint <-> published article"
                elif bool(ra["abstract"]) != bool(rb["abstract"]): relation = "possible conference abstract <-> full article"
                yield a, b, score, "; ".join(reasons), relation


# ------------------------------------------------------------ PRISMA flow
def prisma_svg(c, title="PRISMA 2020 flow diagram (new review, databases only)"):
    """Accessible SVG from verified counts (store.prisma_counts). Records/reports/studies are distinct in PRISMA 2020;
    this simplified diagram uses 'records' for screening and 'reports' for full-text; 'reports not retrieved' is not tracked."""
    def box(x, y, w, h, lines, fill="#eef3f8"):
        t = "".join(f'<tspan x="{x + w/2}" dy="{1.25 if i else 0}em">{escape(str(l))}</tspan>' for i, l in enumerate(lines))
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="#34506b" stroke-width="1.5"/><text x="{x + w/2}" y="{y + 20}" text-anchor="middle" font-size="13" fill="#10202f">{t}</text>'
    def arrow(x1, y1, x2, y2): return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#34506b" stroke-width="1.5" marker-end="url(#a)"/>'
    reasons = c.get("exclusion_reasons") or {}
    rl = [f"{k}: n={v}" for k, v in list(reasons.items())[:6]] or ["(none recorded)"]
    parts = [box(40, 20, 280, 56, ["Identification", f"Records identified: n = {c['identified']}"]),
             box(360, 20, 300, 56, [f"Duplicate records removed: n = {c['duplicates_removed']}"], "#fdf3e7"),
             box(40, 120, 280, 56, ["Screening", f"Records screened: n = {c['screened']}"]),
             box(360, 120, 300, 56, [f"Records excluded (title/abstract): n = {c['excluded_title_abstract']}"], "#fdf3e7"),
             box(40, 220, 280, 56, [f"Reports sought for retrieval: n = {c['reports_sought']}", "(reports not retrieved: not tracked)"]),
             box(360, 220, 300, 56 + 16 * len(rl), [f"Reports excluded: n = {c['excluded_full_text']}"] + rl, "#fdf3e7"),
             box(40, 320, 280, 56, ["Included", f"Studies/reports included: n = {c['included']}"], "#e8f4ea"),
             arrow(180, 76, 180, 120), arrow(320, 48, 360, 48), arrow(180, 176, 180, 220), arrow(320, 148, 360, 148), arrow(180, 276, 180, 320), arrow(320, 248, 360, 248)]
    h = 400 + 16 * len(rl)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="t d" viewBox="0 0 700 {h}" font-family="Helvetica,Arial,sans-serif">'
            f'<title id="t">{escape(title)}</title><desc id="d">Flow of records: identified {c["identified"]}, duplicates removed {c["duplicates_removed"]}, screened {c["screened"]}, '
            f'excluded at title/abstract {c["excluded_title_abstract"]}, reports sought {c["reports_sought"]}, excluded at full text {c["excluded_full_text"]}, included {c["included"]}.</desc>'
            '<defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#34506b"/></marker></defs>'
            f'<rect width="700" height="{h}" fill="white"/>' + "".join(parts) + "</svg>")


# --------------------------------------------------- extraction validation
def validate_extraction(rows, form_fields=None):
    """rows = store.current_extracted(). Returns list of issues (severity, study, experiment, field, message).
    Automated warnings are prompts for human review, not verdicts."""
    issues = []; add = lambda sev, r, msg: issues.append(dict(severity=sev, study=r.get("study_id"), experiment=r.get("experiment_id"), field=r.get("field"), message=msg))
    by = defaultdict(dict)
    for r in rows: by[(r["study_id"], r["experiment_id"])][r["field"]] = r
    units = defaultdict(set)
    for r in rows:
        f = r["field"]; v = r["value_clean"]
        if r["unit_clean"]: units[f].add(r["unit_clean"])
        if v is not None:
            if f.endswith("_n") or f == "n":
                if v <= 0 or v != int(v): add("error", r, f"Sample size must be a positive integer (got {v}).")
            if f.endswith("_sd") and v < 0: add("error", r, "SD cannot be negative.")
            if f.endswith("_sd") and v == 0: add("warning", r, "SD = 0: SMD undefined; check whether this is SD or a rounding artefact.")
        if r["uncertainty"] in ("reconstructed", "imputed", "estimated"): add("info", r, f"Value is {r['uncertainty']}: keep uncertainty label and run a sensitivity analysis.")
        if r["verification"] == "disputed": add("error", r, "Disputed by verifier - resolve before analysis.")
    for f, u in units.items():
        if len(u) > 1: issues.append(dict(severity="warning", study="*", experiment="*", field=f, message=f"Unit mismatch across records: {sorted(u)} - convert before pooling."))
    for (sid, exp), fs in by.items():
        for g in ("treat", "ctrl"):
            m, sd, n = fs.get(f"{g}_mean"), fs.get(f"{g}_sd"), fs.get(f"{g}_n")
            if m and m["value_clean"] is not None and not sd: add("error", m, f"{g}: mean present but SD missing (record missing_reason or contact authors; do not invent).")
            if m and sd and n and None not in (m["value_clean"], sd["value_clean"], n["value_clean"]) and m["value_clean"] > 0:
                cv = sd["value_clean"] / m["value_clean"]
                if cv < 0.01: add("warning", sd, f"{g}: CV={cv:.3f} very small - was an SE entered as SD?")
                if cv > 3: add("warning", sd, f"{g}: CV={cv:.1f} very large - check units/transform.")
        ts = [fs.get(k) for k in ("treat_n", "treat_mean", "treat_sd", "ctrl_n", "ctrl_mean", "ctrl_sd")]
        if all(ts) and len({(x["value_clean"]) for x in ts}) == 1: add("warning", ts[0], "All six summary values identical - copy/paste error?")
    # relative CV check: an SE entered as SD shrinks the CV by ~1/sqrt(n); compare with the typical CV of other groups
    cvs = []
    for (sid, exp), fs in by.items():
        for g in ("treat", "ctrl"):
            m, sd = fs.get(f"{g}_mean"), fs.get(f"{g}_sd")
            if m and sd and m["value_clean"] and sd["value_clean"] is not None and m["value_clean"] > 0: cvs.append((sid, exp, g, sd, sd["value_clean"] / m["value_clean"]))
    if len(cvs) >= 6:
        med = sorted(c[4] for c in cvs)[len(cvs) // 2]
        for sid, exp, g, sd, cv in cvs:
            if med > 0 and cv < 0.4 * med and cv >= 0.01:
                add("warning", sd, f"{g}: CV={cv:.3f} is much smaller than the typical CV of other groups ({med:.3f}) - was an SE entered as SD?")
    sig = defaultdict(list)
    for (sid, exp), fs in by.items():
        vals = tuple(fs.get(k, {}).get("value_clean") for k in ("treat_n", "treat_mean", "treat_sd", "ctrl_n", "ctrl_mean", "ctrl_sd"))
        if None not in vals: sig[vals].append((sid, exp))
    for vals, who in sig.items():
        if len({s for s, _ in who}) > 1: issues.append(dict(severity="warning", study=", ".join(sorted({s for s, _ in who})), experiment="*", field="*", message="Identical summary data in different studies: duplicate publication of one study?"))
    ctrl = defaultdict(list)
    for (sid, exp), fs in by.items():
        c = fs.get("control_group_id")
        if c and c["value_raw"].strip(): ctrl[(sid, c["value_raw"].strip())].append(exp)
    for (sid, cid), exps in ctrl.items():
        if len(exps) > 1: issues.append(dict(severity="warning", study=sid, experiment=", ".join(exps), field="control_group_id", message=f"Shared control '{cid}' across {len(exps)} experiments: effect sizes are dependent; split the control n or use a dependence-aware model."))
    unv = sum(1 for r in rows if r["verification"] == "unverified")
    if rows and unv: issues.append(dict(severity="info", study="*", experiment="*", field="*", message=f"{unv}/{len(rows)} values not yet independently verified."))
    return issues


def build_effects(rows, measure="SMD", vtype="LS"):
    """From current extracted rows build effect sizes. measure: SMD | MD | lnRR | lnOR | lnRR_binary.
    Returns (effects, skipped). Never imputes; incomplete experiments are skipped with a reason."""
    by = defaultdict(dict)
    for r in rows:
        if r["value_clean"] is not None: by[(r["study_id"], r["experiment_id"])][r["field"]] = r["value_clean"]
    meta = defaultdict(dict)
    for r in rows: meta[(r["study_id"], r["experiment_id"])][r["field"]] = r["value_raw"]
    out, skipped = [], []
    for (sid, exp), f in sorted(by.items()):
        try:
            if measure in ("lnOR", "lnRR_binary"):
                need = ["events_treat", "n_treat", "events_ctrl", "n_ctrl"]
                if any(k not in f for k in need): raise KeyError([k for k in need if k not in f])
                fn = S.log_odds_ratio if measure == "lnOR" else S.log_risk_ratio
                y, v = fn(f["events_treat"], f["n_treat"], f["events_ctrl"], f["n_ctrl"], cc=0.5)
            else:
                need = ["treat_n", "treat_mean", "treat_sd", "ctrl_n", "ctrl_mean", "ctrl_sd"]
                if any(k not in f for k in need): raise KeyError([k for k in need if k not in f])
                a = (f["treat_mean"], f["treat_sd"], f["treat_n"], f["ctrl_mean"], f["ctrl_sd"], f["ctrl_n"])
                if measure == "SMD": y, v, _ = S.smd(*a, vtype=vtype)
                elif measure == "MD": y, v = S.mean_difference(*a)
                elif measure == "lnRR": y, v = S.log_response_ratio(*a)
                else: raise ValueError("unknown measure")
            out.append(dict(study_id=sid, experiment_id=exp, measure=measure, yi=y, vi=v, control_group_id=meta[(sid, exp)].get("control_group_id", ""),
                            outcome=meta[(sid, exp)].get("outcome_definition", ""), timepoint=meta[(sid, exp)].get("timepoint", ""), group_label=meta[(sid, exp)].get("sex", "")))
        except KeyError as e:
            skipped.append((sid, exp, f"missing fields {e.args[0]}"))
        except ValueError as e:
            skipped.append((sid, exp, str(e)))
    return out, skipped


# ------------------------------------------------------------ SAP + export
def sap_markdown(workflow_label, measure, model="random", estimator="REML", hksj=True, moderators=(), sensitivity=("leave-one-out", "alternative estimator (PM)")):
    return f"""# Statistical analysis plan (DRAFT - pre-specify BEFORE seeing results; freeze and date it)
- Review workflow: {workflow_label}
- Effect measure and direction: {measure} (state which group is the reference and what a positive value means)
- Unit of analysis: ____ (e.g. vial/cage/plot); handling of multiple groups/outcomes/time points: ____
- Model: {model}-effects, tau^2 estimator **{estimator}** (reasonable default, not universally optimal; sensitivity analysis below)
- CI method: {'Hartung-Knapp-Sidik-Jonkman (t, k-1 df)' if hksj else 'Wald (z)'}; prediction interval reported (state convention)
- Heterogeneity: Q, tau^2 (with uncertainty), I^2 (state which definition), H^2
- Pre-specified moderators: {', '.join(moderators) or 'none'} (max ~1 per 10 studies)
- Sensitivity analyses: {'; '.join(sensitivity)}
- Dependence: shared controls / multiple effects per study handled by: ____ (not by ignoring)
- Missing data: no imputation of effect/variance without labelled sensitivity analysis
- Small-study effects/publication bias: funnel plot + method(s) ____ (asymmetry is not proof of publication bias)
- Software and versions: ____ ; code archived at: ____
- Deviations from this plan will be logged with reasons and dates.
"""

def r_script(csv_name="analysis_dataset.csv", method="REML", hksj=True):
    return f'''# Reproduces the primary analysis from analysis_dataset.csv (generated by MetaLab Academy)
library(metafor)
dat <- read.csv("{csv_name}")
res <- rma(yi, vi, data = dat, method = "{method}"{', test = "knha"' if hksj else ''})
print(summary(res)); print(predict(res))
loo <- leave1out(res); print(loo)
forest(res, slab = dat$effect_id)
sessionInfo()
'''

def export_package(store, pid, project_name="project", measure="SMD", method="REML", hksj=True):
    """Zip with CSVs of every stage, generated R script, SAP draft, audit log and a SHA-256 manifest."""
    files = {}
    tables = {"search_log.csv": store.searches(pid), "references.csv": store.refs(pid), "screening.csv": store.q("SELECT * FROM screening WHERE project_id=?", (pid,)),
              "duplicates_candidates.csv": store.dup_candidates(pid), "studies.csv": store.studies(pid), "reports.csv": store.reports(pid),
              "extraction_all_versions.csv": store.q("SELECT * FROM extracted WHERE project_id=? ORDER BY id", (pid,)), "risk_of_bias.csv": store.q("SELECT * FROM rob WHERE project_id=?", (pid,)),
              "decisions_and_deviations.csv": store.decisions(pid), "audit_log.csv": store.audit_rows(pid)}
    for n, rows in tables.items(): files[n] = store.to_csv(rows) or "(empty)\n"
    eff = store.effects(pid); files["analysis_dataset.csv"] = store.to_csv([dict(effect_id=e["effect_id"], study_id=e["study_id"], yi=e["yi"], vi=e["vi"], control_group_id=e["control_group_id"], outcome=e["outcome"], group_label=e["group_label"]) for e in eff]) or "effect_id,study_id,yi,vi\n"
    files["analysis.R"] = r_script("analysis_dataset.csv", method, hksj)
    wf, _ = store.get_form(pid)
    files["SAP_draft.md"] = sap_markdown(wf or "unspecified", measure, estimator=method, hksj=hksj)
    c, w = store.prisma_counts(pid); files["prisma_counts.json"] = json.dumps(dict(counts=c, warnings=w), indent=1)
    files["prisma_flow.svg"] = prisma_svg(c)
    files["README.txt"] = (f"MetaLab Academy reproducibility package for '{project_name}'\nGenerated {datetime.datetime.now():%Y-%m-%d %H:%M}\n"
                           "Contents: every stage's records (raw versions preserved), audit log, analysis dataset, R script, SAP draft, PRISMA counts/diagram.\n"
                           "Not included: full-text PDFs (copyright), anything not stored in the project.\nAutomated checks are prompts for human review.\nSHA-256 hashes in MANIFEST.txt.\n")
    files["MANIFEST.txt"] = "\n".join(f"{hashlib.sha256(v.encode()).hexdigest()}  {k}" for k, v in sorted(files.items()))
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for k, v in files.items(): z.writestr(k, v)
    return buf.getvalue()
