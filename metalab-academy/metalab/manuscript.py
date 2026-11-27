"""Manuscript Studio: a living manuscript connected to stored research outputs.

RULES (enforced in code and tests):
  * Numbers enter the text only through {{result.key}} tokens that resolve to stored results; unresolved tokens stay visible as [[MISSING:key]].
  * A computed result must be VERIFIED by a human (with a stated method) before it renders in a final export. Re-computing a changed value
    resets its verification. Draft exports may show unverified values only inside an explicit ⟦UNVERIFIED …⟧ marker.
  * Results become stale when the effect-size inputs change (input hash) - stale results never render as verified.
  * Hard-coded numbers in prose, missing citations, unresolved claims, unverified references and unfinished checklist items are flagged
    as prompts for human review (not infallible judgements). Nothing is invented to fill a section.
"""
from __future__ import annotations
import hashlib, html, io, json, re
from . import references, stats as S, workflow as W

SECTIONS = [
 ("title", "Title"), ("abstract", "Abstract"), ("introduction", "Introduction"), ("methods", "Methods"), ("results", "Results"),
 ("discussion", "Discussion"), ("limitations", "Limitations"), ("conclusions", "Conclusions"), ("declarations", "Declarations")]

TEMPLATES = {
 "title": "[Topic]: a systematic review{{ and meta-analysis}} of [population/organism] — write your own title",
 "abstract": "<!-- Write last. Background / Objectives / Methods / Results / Conclusions. Numbers only via tokens. -->\nObjectives: ...\nMethods: Searches of databases ({{search.n_databases}}) ... {{prisma.included}} studies were included.\nResults: ...\nConclusions: ... (state certainty and limitations)",
 "introduction": "<!-- Rationale (what is known; why a review is needed - cite the closest existing reviews you found in the novelty assessment). Objectives with PICO/PECO. -->\n",
 "methods": "## Protocol and registration\n<!-- State whether and where the protocol was registered, its date relative to data extraction, and deviations (from your Decisions log). -->\n## Eligibility criteria\n## Information sources and search\nWe searched {{search.n_databases}} sources (see Supplement; PRISMA-S). Last search: {{search.last_date}}.\n## Selection and data collection\n## Risk of bias\n## Effect measures and synthesis\nEffect measure: {{analysis.measure}}. Model: {{analysis.model}}. <!-- justify; cite lessons' sources you verified -->\n## Reporting bias and certainty\n",
 "results": "## Study selection\n{{prisma.identified}} records were identified; {{prisma.duplicates}} duplicates were removed; {{prisma.screened}} records were screened; {{prisma.reports_sought}} reports were assessed in full; {{prisma.included}} studies were included (Figure 1).\n## Study characteristics\n## Risk of bias\n## Synthesis\nPooled estimate: {{analysis.est}} (95% CI {{analysis.ci_lo}} to {{analysis.ci_hi}}); τ² = {{analysis.tau2}}; I² = {{analysis.I2}}%; prediction interval {{analysis.pi_lo}} to {{analysis.pi_hi}}; k = {{analysis.k}}.\n## Reporting biases and certainty\n",
 "discussion": "<!-- Interpret using the verified results only; avoid causal language for between-study moderators; discuss heterogeneity and the prediction interval. -->\n",
 "limitations": "<!-- Single-reviewer limitation if applicable; dependence; few studies; reconstructed data; search limitations (databases not accessible). -->\n",
 "conclusions": "<!-- Every conclusion must trace to a verified result or cited source. Do not guarantee anything about impact. -->\n",
 "declarations": "## Registration\n## Funding\n## Competing interests\n## Data and code availability\n## Use of AI tools\n<!-- Disclose any AI assistance according to the target journal's policy; you remain responsible for every statement and citation. -->\n## Author contributions (CRediT)\n",
}

PRISMA_ITEMS = [  # short paraphrased labels; use the official checklist for exact wording (Page et al. 2021)
 "1 Title identifies the report as a systematic review", "2 Abstract (structured summary)", "3 Rationale", "4 Objectives", "5 Eligibility criteria", "6 Information sources",
 "7 Search strategy (full strategies)", "8 Selection process", "9 Data collection process", "10 Data items", "11 Risk-of-bias assessment methods", "12 Effect measures",
 "13 Synthesis methods", "14 Reporting-bias assessment methods", "15 Certainty assessment methods", "16 Study selection (flow diagram)", "17 Study characteristics",
 "18 Risk of bias in studies", "19 Results of individual studies", "20 Results of syntheses", "21 Reporting biases (results)", "22 Certainty of evidence",
 "23 Discussion (interpretation, limitations, implications)", "24 Registration and protocol", "25 Support", "26 Competing interests", "27 Availability of data, code and other materials"]

TOKEN = re.compile(r"\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}")


def effects_hash(effects, settings=""):
    h = hashlib.sha256(); h.update(settings.encode())
    for e in sorted(effects, key=lambda r: r["effect_id"]): h.update(f"{e['effect_id']}|{e['yi']:.12g}|{e['vi']:.12g}".encode())
    return h.hexdigest()[:16]


def compute_results(store, pid, model="random", method="REML", hksj=True, back_transform=None):
    """Compute traceable results from stored records (PRISMA counts, search log, saved effect sizes). Returns list of keys stored.
    back_transform: None | 'exp' (e.g. for lnRR/ln OR) -> adds exponentiated versions as analysis.est_exp etc."""
    keys = []
    c, _warn = store.prisma_counts(pid)
    for k, key in (("identified", "prisma.identified"), ("duplicates_removed", "prisma.duplicates"), ("screened", "prisma.screened"), ("reports_sought", "prisma.reports_sought"),
                   ("excluded_full_text", "prisma.excluded_full_text"), ("included", "prisma.included")):
        store.set_result(pid, key, c[k], "PRISMA counts derived from stored screening decisions", input_hash=str(c[k])); keys.append(key)
    searches = store.searches(pid)
    if searches:
        store.set_result(pid, "search.n_databases", len({s["database"] for s in searches}), "Search Log (distinct databases)", str(len(searches))); keys.append("search.n_databases")
        store.set_result(pid, "search.last_date", max(s["searched_on"] for s in searches), "Search Log (latest search date)", str(len(searches))); keys.append("search.last_date")
    eff = store.effects(pid)
    if len(eff) >= 2:
        y = [e["yi"] for e in eff]; v = [e["vi"] for e in eff]; ih = effects_hash(eff)
        r = S.meta_analyze(y, v, model, method, hksj, pi_method="riley")
        fm = lambda x: f"{x:.3f}"
        vals = {"analysis.k": r.k, "analysis.est": fm(r.est), "analysis.ci_lo": fm(r.ci[0]), "analysis.ci_hi": fm(r.ci[1]), "analysis.tau2": fm(r.tau2), "analysis.I2": f"{r.I2:.1f}",
                "analysis.model": f"{model}-effects ({method}{', Hartung-Knapp CI' if hksj and model == 'random' else ''})", "analysis.measure": eff[0]["measure"]}
        if r.pred_int: vals["analysis.pi_lo"], vals["analysis.pi_hi"] = fm(r.pred_int[0]), fm(r.pred_int[1])
        if back_transform == "exp":
            import math
            vals["analysis.est_exp"] = fm(math.exp(r.est)); vals["analysis.ci_lo_exp"] = fm(math.exp(r.ci[0])); vals["analysis.ci_hi_exp"] = fm(math.exp(r.ci[1]))
        for k, val in vals.items():
            store.set_result(pid, k, val, f"MetaLab stats engine on {len(eff)} saved effect sizes ({model}, {method}); reproduce in R/metafor before verifying", ih); keys.append(k)
    return keys


def render(store, pid, text, final=True):
    """Resolve tokens. final=True: only human-verified, non-stale values render; others become [[UNVERIFIED:key]] / [[MISSING:key]].
    final=False (draft): unverified values show inside ⟦UNVERIFIED value⟧. Returns (rendered_text, problems)."""
    res = {r["key"]: r for r in store.results(pid)}; eff = store.effects(pid); problems = []
    cur_hash = {}
    def fn(m):
        key = m.group(1)
        r = res.get(key)
        if r is None: problems.append(("missing", key)); return f"[[MISSING:{key}]]"
        # stale = the saved effect sizes changed after this value was computed (analysis.* keys only)
        stale = key.startswith("analysis.") and len(eff) >= 2 and r["input_hash"] != effects_hash(eff)
        if stale: problems.append(("stale", key))
        if r["verified_by"] and not stale: return str(r["value"])
        problems.append(("unverified", key))
        return f"[[UNVERIFIED:{key}]]" if final else f"⟦UNVERIFIED {r['value']}⟧"
    return TOKEN.sub(fn, text), problems


def assemble(store, pid, final=True, order=None):
    out, problems = [], []
    for key, label in (order or SECTIONS):
        t = store.section(pid, key)
        if t is None: t = TEMPLATES.get(key, "")
        rt, pr = render(store, pid, t, final); problems += pr
        out.append((key, label, rt))
    return out, problems


def qc(store, pid):
    """Quality prompts for the manuscript. Returns list of dict(severity, check, message)."""
    issues = []; add = lambda sev, chk, msg: issues.append(dict(severity=sev, check=chk, message=msg))
    secs, problems = assemble(store, pid, final=True)
    full_raw = "\n".join((store.section(pid, k) or TEMPLATES.get(k, "")) for k, _ in SECTIONS)
    for kind, key in problems:
        add({"missing": "error", "stale": "error", "unverified": "warning"}[kind], f"result:{kind}", f"{kind.upper()} result '{key}' " + {"missing": "has no stored value - compute it or remove the token.", "stale": "was computed from different effect sizes - recompute and re-verify.", "unverified": "is not yet verified by a human."}[kind])
    # hard-coded numbers: strip tokens, comments, years, reference markers and headings
    body = TOKEN.sub("", re.sub(r"<!--.*?-->", "", full_raw, flags=re.S)); body = re.sub(r"\[@[^\]]+\]|\[cite:[^\]]*\]|\b(19|20)\d\d\b|^#+.*$", "", body, flags=re.M)
    nums = [n for n in re.findall(r"(?<![\w.])\d+(?:\.\d+)?%?(?![\w])", body) if n not in ("1", "2")]
    drafted = [k for k, _ in SECTIONS if store.section(pid, k)]
    if nums and drafted: add("warning", "hard_coded_numbers", f"{len(nums)} number(s) typed directly into prose (e.g. {', '.join(nums[:5])}): numbers should come from {{{{tokens}}}} so they stay traceable (ignore counts such as 'two reviewers' if intentional).")
    cites = set(re.findall(r"\[@([A-Za-z0-9_:\-]+)\]", full_raw)); projects_refs = {f"ref{r['id']}": r for r in store.refs(pid)}
    for c in sorted(cites):
        if c in references.REFS:
            continue
        if c not in projects_refs: add("error", "citation_unknown", f"Citation [@{c}] matches no project reference or verified registry key.")
        else:
            r = projects_refs[c]
            if not (r["doi"] or r["pmid"]): add("warning", "citation_unverified", f"Reference [@{c}] has no DOI/PMID - verify it against the source record.")
    if re.search(r"\[cite:\?\]", full_raw): add("error", "missing_citation", "Text contains [cite:?] placeholders (missing citations).")
    for cl in store.ms_claims(pid):
        if cl["status"] != "resolved": add("warning", "unresolved_claim", f"Unresolved claim: '{cl['claim'][:90]}'")
    decl = (store.section(pid, "declarations") or "").lower()
    if "use of ai" not in decl and "ai tools" not in decl: add("warning", "ai_disclosure", "No AI-use statement in Declarations (state 'none' if none was used).")
    if "availability" not in decl: add("warning", "data_availability", "No data/code availability statement.")
    if "registration" not in decl: add("warning", "registration", "No registration/protocol statement (state clearly if not registered).")
    cl = store.checklist(pid); done = sum(1 for it in PRISMA_ITEMS if cl.get(it, {}).get("status") in ("reported", "not applicable"))
    if done < len(PRISMA_ITEMS): add("info", "checklist", f"PRISMA 2020 checklist: {done}/{len(PRISMA_ITEMS)} items located or marked not applicable.")
    for it, r in cl.items():
        if r["status"] == "not applicable" and not r["location"].strip(): add("warning", "checklist_na", f"Checklist item '{it}' marked not applicable without a reason.")
    c, w = store.prisma_counts(pid)
    for x in w: add("warning", "prisma", x)
    if not store.decisions(pid): add("info", "decisions", "No decisions/deviations logged - report deviations from the protocol if any.")
    return issues


# ---------------------------------------------------------------- outputs
def study_table(store, pid):
    """Study characteristics table from extraction (current values only)."""
    rows = store.current_extracted(pid); by = {}
    for r in rows: by.setdefault((r["study_id"], r["experiment_id"]), {})[r["field"]] = r["value_raw"]
    labels = {s["study_id"]: s["label"] for s in store.studies(pid)}
    cols = ["study", "experiment", "design", "species_strain_genotype", "sex", "treat_n", "ctrl_n", "outcome_definition", "outcome_unit"]
    return [dict(study=labels.get(sid, sid), experiment=e, **{c: f.get(c, "") for c in cols[2:]}) for (sid, e), f in sorted(by.items())]


def forest_svg(labels, y, v, est, ci, title="Forest plot", xlabel="effect", back_transform=None):
    """Accessible SVG forest plot (marker area ∝ weight). back_transform='exp' plots exp(effect) on a log axis ticks-free linear scale of log values."""
    import math
    k = len(y); se = [math.sqrt(x) for x in v]; lo = [a - 1.959964 * s for a, s in zip(y, se)]; hi = [a + 1.959964 * s for a, s in zip(y, se)]
    xmin, xmax = min(lo + [ci[0]]) - 0.1 * abs(max(hi) - min(lo)), max(hi + [ci[1]]) + 0.1 * abs(max(hi) - min(lo))
    if xmax == xmin: xmax = xmin + 1
    W, left, right, rowh = 760, 230, 40, 26; H = 60 + rowh * (k + 3); px = lambda x: left + (x - xmin) / (xmax - xmin) * (W - left - right)
    w = [1 / x for x in v]; wp = [100 * a / sum(w) for a in w]; f = (lambda x: math.exp(x)) if back_transform == "exp" else (lambda x: x)
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="t d" viewBox="0 0 {W} {H}" font-family="Helvetica,Arial,sans-serif" font-size="12">',
             f'<title id="t">{html.escape(title)}</title><desc id="d">Forest plot of {k} effect sizes with a pooled estimate {f(est):.3g} (95% CI {f(ci[0]):.3g} to {f(ci[1]):.3g}).</desc><rect width="{W}" height="{H}" fill="white"/>',
             f'<text x="{left}" y="20" font-weight="bold">{html.escape(title)}</text>']
    zero = 0.0
    if xmin < zero < xmax: parts.append(f'<line x1="{px(zero)}" y1="30" x2="{px(zero)}" y2="{H-40}" stroke="#888" stroke-dasharray="4"/>')
    for i in range(k):
        yy = 40 + rowh * (i + 1)
        parts.append(f'<text x="8" y="{yy+4}">{html.escape(str(labels[i]))[:32]}</text><line x1="{px(lo[i])}" y1="{yy}" x2="{px(hi[i])}" y2="{yy}" stroke="#34506b" stroke-width="1.5"/>')
        side = 3 + 7 * wp[i] / max(wp); parts.append(f'<rect x="{px(y[i])-side/2}" y="{yy-side/2}" width="{side}" height="{side}" fill="#34506b"/><text x="{W-right+2}" y="{yy+4}" font-size="10" text-anchor="end">{f(y[i]):.2f}</text>')
    yy = 40 + rowh * (k + 2)
    parts.append(f'<text x="8" y="{yy+4}" font-weight="bold">Pooled</text><polygon points="{px(ci[0])},{yy} {px(est)},{yy-9} {px(ci[1])},{yy} {px(est)},{yy+9}" fill="#9b3d2f"/>')
    parts.append(f'<text x="{(left+W-right)/2}" y="{H-8}" text-anchor="middle">{html.escape(xlabel)}</text></svg>')
    return "".join(parts)


def to_markdown(store, pid, final=True, title=None):
    secs, problems = assemble(store, pid, final); out = []
    for key, label, text in secs:
        out.append(text if key == "title" else f"# {label}\n\n{text}")
    refs = _reference_list(store, pid)
    out.append("# References\n\n" + ("\n".join(refs) if refs else "(none cited)"))
    banner = "" if final and not problems else "> **DRAFT: contains unverified, stale or missing values. Not for submission.**\n\n"
    return banner + "\n\n".join(out) + "\n", problems


def _reference_list(store, pid):
    text = "\n".join((store.section(pid, k) or "") for k, _ in SECTIONS); out = []
    for c in sorted(set(re.findall(r"\[@([A-Za-z0-9_:\-]+)\]", text))):
        if c in references.REFS: out.append(f"- {references.link(c)}")
        else:
            m = {f"ref{r['id']}": r for r in store.refs(pid)}.get(c)
            if m: out.append(f"- {m['authors']} ({m['year']}). {m['title']}. {m['journal']}." + (f" DOI: {m['doi']}" if m["doi"] else "") + (f" PMID: {m['pmid']}" if m["pmid"] else ""))
    return out


def to_quarto(store, pid, final=True):
    md, p = to_markdown(store, pid, final)
    return "---\ntitle: \"Manuscript draft\"\nformat: docx\nbibliography: references.bib\n---\n\n" + md, p


def to_latex(store, pid, final=True):
    md, p = to_markdown(store, pid, final)
    esc = lambda s: s.replace("\\", "\\textbackslash{}").replace("&", "\\&").replace("%", "\\%").replace("_", "\\_").replace("#", "\\#").replace("$", "\\$")
    body = []
    for line in md.splitlines():
        if line.startswith("# "): body.append("\\section{%s}" % esc(line[2:]))
        elif line.startswith("## "): body.append("\\subsection{%s}" % esc(line[3:]))
        elif line.startswith("> "): body.append("\\textbf{%s}" % esc(line[2:].replace("**", "")))
        elif line.startswith("- "): body.append("\\noindent " + esc(re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", line[2:])) + "\\par")
        else: body.append(esc(line))
    return "\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\begin{document}\n" + "\n".join(body) + "\n\\end{document}\n", p


def to_docx(store, pid, final=True):
    import docx
    md, p = to_markdown(store, pid, final); d = docx.Document()
    for line in md.splitlines():
        if line.startswith("# "): d.add_heading(line[2:], level=1)
        elif line.startswith("## "): d.add_heading(line[3:], level=2)
        elif line.startswith("> "): para = d.add_paragraph(); r = para.add_run(line[2:].replace("**", "")); r.bold = True
        elif line.startswith("- "): d.add_paragraph(re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", line[2:]), style="List Bullet")
        elif line.strip(): d.add_paragraph(line)
    buf = io.BytesIO(); d.save(buf); return buf.getvalue(), p
