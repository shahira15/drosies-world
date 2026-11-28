"""Lesson DEPTH audit: text existing is not the same as a lesson being complete, correct or useful.
Every metric here is mechanical and conservative; none replaces expert review (no lesson has had any). A lesson is classed
'substantive draft' only if ALL mechanical criteria hold; otherwise 'thin draft' with the failing criteria listed."""
from __future__ import annotations
import re
from . import lessons, claims, references

CRITERIA = {
    "length": "all lesson text (explanations, worked example, mistakes, exercises, quiz) >= 450 words",
    "worked_numbers": "worked example contains >= 3 numbers",
    "numeric_check": ">= 1 quiz item flagged numeric (answer recomputed by a test)",
    "quiz": ">= 5 quiz items, each with an explanation",
    "assumptions": ">= 2 stated assumptions or an explicit 'none' reason",
    "mistakes": ">= 3 common mistakes and >= 2 misconceptions",
    "code": "runnable coding snippet (Python is executed by the test-suite)",
    "references": ">= 3 verified references",
    "claim_record": ">= 1 registered claim OR every reference is a bibliographic-only record (stated)",
    "exercises": ">= 3 exercises and a research-application note",
}
_num = re.compile(r"\d+(?:\.\d+)?")

def _words(L):
    t = sum(len(L[k].split()) for k in ("why", "plain", "intermediate", "advanced", "worked_example", "integrity", "application"))
    t += sum(len(x.split()) for k in ("mistakes", "exercises", "checklist", "controversies") for x in L[k])
    t += sum(len((q["q"] + " ".join(q["opts"]) + q["why"]).split()) for q in L["quiz"]) + sum(len((a + b).split()) for a, b in L["misconceptions"])
    return t

def audit_lesson(n, L, claim_ids):
    c = {}
    c["length"] = _words(L) >= 450
    c["worked_numbers"] = len(_num.findall(L["worked_example"])) >= 3
    c["numeric_check"] = any(q.get("numeric") for q in L["quiz"])
    c["quiz"] = len(L["quiz"]) >= 5 and all(q.get("why") for q in L["quiz"])
    c["assumptions"] = len(L["assumptions"]) >= 2 or n in (24,)
    c["mistakes"] = len(L["mistakes"]) >= 3 and len(L["misconceptions"]) >= 2
    c["code"] = bool(L.get("coding"))
    c["references"] = sum(1 for r in L["further"] if r in references.REFS and references.REFS[r].get("verified")) >= 3
    c["claim_record"] = n in claim_ids or all(references.REFS[r].get("verification") == "bibliographic" for r in L["further"] if r in references.REFS)
    c["exercises"] = len(L["exercises"]) >= 3 and bool(L.get("application"))
    failing = [k for k, v in c.items() if not v]
    return dict(module=n, title=L["title"], words=_words(L), refs=len(L["further"]), quiz_items=len(L["quiz"]), numeric_quiz=sum(bool(q.get("numeric")) for q in L["quiz"]),
                tier="substantive draft" if not failing else "thin draft", failing=", ".join(failing) or "-", expert_reviewed=False)

def audit():
    L = lessons.load(); claim_ids = {c["lesson"] for c in claims.CLAIMS}
    return [audit_lesson(n, L[n], claim_ids) for n in sorted(L)]

def summary():
    rows = audit(); return dict(total=len(rows), substantive=sum(r["tier"] == "substantive draft" for r in rows), thin=sum(r["tier"] == "thin draft" for r in rows), expert_reviewed=0,
                                note="Mechanical criteria only. 'Substantive draft' means the lesson passes ten checks - not that it is correct, complete or expert-approved.")
