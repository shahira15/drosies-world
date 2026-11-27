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
    curriculum.mark_drafted(_CACHE.keys())
    return _CACHE
