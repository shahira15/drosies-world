"""Comprehensive assessments built from the written lessons' quizzes, plus personal/discipline pathways and notes bundles.
Scores are for self-assessment; they are internal learning records, NOT qualifications. Question quality is AI-drafted and not psychometrically validated."""
from __future__ import annotations
import io, json, random, zipfile
from . import learning, lessons, curriculum

MASTERY = 0.80


def exam(module_ids, n_per_module=3, seed=1):
    """Deterministic exam: n questions per module (or all if fewer) from the lessons' quizzes; options shuffled per seed (answer key tracked)."""
    L = lessons.load(); rng = random.Random(seed); qs = []
    for m in module_ids:
        if m not in L: continue
        pool = list(enumerate(L[m]["quiz"])); rng.shuffle(pool)
        for qi, q in pool[:n_per_module]:
            order = list(range(len(q["opts"]))); rng.shuffle(order)
            qs.append(dict(module=m, qid=f"{m}:{qi}", q=q["q"], opts=[q["opts"][i] for i in order], ans=order.index(q["ans"]), why=q["why"], numeric=bool(q.get("numeric"))))
    rng.shuffle(qs); return qs


def score(qs, answers):
    """answers: list of chosen indices (or None). Returns dict(total, correct, pct, by_module, weak_modules, mastery)."""
    if len(answers) != len(qs): raise ValueError("One answer (or None) per question.")
    by = {}
    for q, a in zip(qs, answers):
        d = by.setdefault(q["module"], [0, 0]); d[1] += 1; d[0] += int(a == q["ans"])
    c = sum(v[0] for v in by.values()); t = len(qs)
    weak = sorted([m for m, (k, n) in by.items() if k / n < MASTERY])
    return dict(total=t, correct=c, pct=(c / t if t else 0.0), by_module={m: (k, n) for m, (k, n) in by.items()}, weak_modules=weak, mastery=bool(t and c / t >= MASTERY))


def feedback(qs, answers):
    return [dict(qid=q["qid"], module=q["module"], correct=a == q["ans"], your=None if a is None else q["opts"][a], right=q["opts"][q["ans"]], why=q["why"]) for q, a in zip(qs, answers)]


# ---------------------------------------------------------------- pathways
DISCIPLINE_TRACKS = {
 "Preclinical / model organisms": dict(core=learning.CORE_PATH, extra=[59, 60, 85, 86, 87, 38, 39, 40, 21, 22, 23], note="Vial/cage units, sex as a variable, survival outcomes, dependence."),
 "Clinical medicine": dict(core=learning.CORE_PATH, extra=[57, 28, 30, 33, 42, 44, 52], note="Binary/time-to-event outcomes, RoB 2, GRADE, diagnostic accuracy."),
 "Plant science & agriculture": dict(core=learning.CORE_PATH, extra=[61, 27, 85, 38, 63], note="Plot/pot units, split-plot designs, log response ratio, field heterogeneity."),
 "Microbiology": dict(core=learning.CORE_PATH, extra=[62, 85, 48, 49, 18], note="Replicates, log scales, detection limits, rare events."),
 "Ecology & evolution": dict(core=learning.CORE_PATH, extra=[63, 38, 39, 40, 49, 27, 50], note="Dependence, phylogeny/space, lnRR, small-study effects."),
 "Public health": dict(core=learning.CORE_PATH, extra=[58, 28, 43, 47, 33, 52], note="Observational evidence, prevalence, dose-response."),
 "Education & social science": dict(core=learning.CORE_PATH, extra=[65, 64, 27, 85, 38], note="Clustering, SMD, quasi-experiments."),
 "Statisticians / methodologists": dict(core=[32, 33, 34, 35, 36, 37, 50, 51], extra=[38, 39, 40, 41, 42, 43, 44, 46, 47, 48, 49], note="Core pooling then advanced methods (many are outline-only)."),
}

def personal_pathway(profile):
    """Combine the core path with discipline tracks suggested by the profile (discipline text, chosen pathway, stats/coding experience). Users may combine tracks."""
    text = " ".join(str(profile.get(k, "")) for k in ("discipline", "pathway", "goal")).lower()
    rules = {"Preclinical / model organisms": ("drosophila", "fly", "mouse", "mice", "preclinical", "animal", "model organism", "aging", "ageing", "longevity", "genetic", "molecular"), "Clinical medicine": ("clinic", "medic", "patient", "surg", "nurs"),
             "Plant science & agriculture": ("plant", "crop", "agricult", "botan"), "Microbiology": ("microb", "bacteri", "infect", "virol"), "Ecology & evolution": ("ecolog", "evolution", "environment", "biodivers"),
             "Public health": ("public health", "epidemi"), "Education & social science": ("educat", "social", "psycholog", "teaching"), "Statisticians / methodologists": ("statistic", "biostat", "methodolog")}
    tracks = [k for k, kw in rules.items() if any(w in text for w in kw)] or []
    core = list(learning.CORE_PATH); skip_note = []
    if profile.get("stats_exp") in ("intermediate", "advanced") and profile.get("sr_fam") in ("done one",): skip_note.append("You reported experience: you may test out of Modules 3-4 using the assessments.")
    L = lessons.load(); extra = []
    for t in tracks:
        for m in DISCIPLINE_TRACKS[t]["extra"]:
            if m not in core and m not in extra: extra.append(m)
    return dict(tracks=tracks, core=core, extra=extra, notes=skip_note + [DISCIPLINE_TRACKS[t]["note"] for t in tracks],
                available_core=[m for m in core if m in L], available_extra=[m for m in extra if m in L], outline_only=[m for m in core + extra if m not in L])


def notes_bundle(module_ids):
    """ZIP of study notes (Markdown) for the given modules (written lessons only) + a formula cheat sheet + a README stating what is missing."""
    L = lessons.load(); buf = io.BytesIO(); have = [m for m in module_ids if m in L]; missing = [m for m in module_ids if m not in L]
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for m in have: z.writestr(f"module_{m:02d}_notes.md", learning.lesson_notes(m))
        z.writestr("formula_cheat_sheet.md", learning.cheat_sheet())
        z.writestr("README.txt", f"MetaLab Academy study notes (AI-drafted, not expert-reviewed).\nIncluded modules: {have}\nNot yet written (outline only): {missing}\nNotes are summaries; read the lessons and the verified references.\n")
    return buf.getvalue()
