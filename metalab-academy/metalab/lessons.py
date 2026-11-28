import importlib, pkgutil
from pathlib import Path
from . import curriculum

_CACHE = {}
def load():
    if _CACHE:
        return _CACHE
    cdir = Path(__file__).resolve().parent.parent / "content"
    for m in pkgutil.iter_modules([str(cdir)]):
        if m.name.startswith("lesson_"):
            L = importlib.import_module(f"content.{m.name}").LESSON
            _CACHE[L["id"]] = L
        elif m.name.startswith("lessons_"):           # multi-lesson modules: LESSONS = [dict, ...]
            for L in importlib.import_module(f"content.{m.name}").LESSONS:
                if L["id"] in _CACHE: raise ValueError(f"duplicate lesson id {L['id']}")
                _CACHE[L["id"]] = L
    _apply_extensions(_CACHE)
    curriculum.mark_drafted(_CACHE.keys())
    return _CACHE


_LIST_FIELDS = ("mistakes", "misconceptions", "exercises", "checklist", "controversies", "assumptions", "decision_tree", "examples", "quiz", "further")
def _apply_extensions(cache):
    """content/extensions.py: deepening paragraphs/items appended to existing lessons (never replaces)."""
    try: from content.extensions import EXT
    except ImportError: return
    for n, e in EXT.items():
        L = cache[n]
        for k, v in e.items():
            if k.endswith("_add"):
                f = k[:-4]
                if f in ("plain", "intermediate", "advanced", "worked_example"): L[f] = L[f] + "\n\n" + v
                elif f in _LIST_FIELDS: L[f] = list(L[f]) + list(v)
                else: raise ValueError(f"unknown extension field {k}")
            else: L[k] = v
