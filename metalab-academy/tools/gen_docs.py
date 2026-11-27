"""Regenerate CURRICULUM_MAP.md and FEATURE_STATUS.md from the registries."""
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent; sys.path.insert(0, str(ROOT))
from metalab import curriculum, lessons
lessons.load()
c = curriculum.counts()
out = [f"# Curriculum map (generated)\n\n{c['specified']} modules from the master specification + {c['proposed']} proposed additions = {c['total']} registered; **{c['drafted']} have a lesson**; {c['outline']} are outlines (title/level only, no lesson).\n"]
for lvl, name in curriculum.LEVELS.items():
    out.append(f"\n## Level {lvl}: {name}\n\n| # | Module | Part | Status |\n|---|---|---|---|")
    for m in curriculum.MODULES:
        if m["level"] == lvl:
            out.append(f"| {m['id']} | {m['title']} | {m['part_name']} | {m['status']} |")
(ROOT / "CURRICULUM_MAP.md").write_text("\n".join(out) + "\n")
F = json.load(open(ROOT / "features.json"))
o = [f"# Feature status (generated from features.json)\n\n{F['_note']}\n\n| Feature | Status | Evidence | Blocker |\n|---|---|---|---|"]
for f in F["features"]:
    o.append(f"| {f['name']} | **{f['status']}** | {f.get('evidence','')} | {f.get('blocker','')} |")
(ROOT / "FEATURE_STATUS.md").write_text("\n".join(o) + "\n")
from metalab import references
r = [f"# Scientific references (generated)\n\nVerified against {references.SOURCE} on {references.VERIFIED_ON} (title, authors, journal, DOI/PMID). Only entries here may be cited in lessons.\n"]
for k, v in references.REFS.items():
    r.append(f"- `{k}`: {v['cite']} DOI: {v['doi'] or 'none recorded'} · PMID {v['pmid']}")
(ROOT / "SCIENTIFIC_REFERENCES.md").write_text("\n".join(r) + "\n")

# ---- keep human-facing counts in README / features.json truthful (tests/test_docs_truth.py verifies)
import re, json
from metalab import resources, learning, claims
c = curriculum.counts()
rd = (ROOT / "README.md").read_text()
rd = re.sub(r"\d+ verified references", f"{len(references.REFS)} verified references", rd)
rd = re.sub(r"\*\*\d+ written lessons\*\*", f"**{c['drafted']} written lessons**", rd)
rd = re.sub(r"\d+ resources \(links unchecked\)", f"{len(resources.RESOURCES)} resources (links unchecked)", rd)
rd = re.sub(r"\d+-module registry \(\d+ specified \+ \d+ proposed\)", f"{c['total']}-module registry ({c['specified']} specified + {c['proposed']} proposed)", rd)
(ROOT / "README.md").write_text(rd)
fj = json.loads((ROOT / "features.json").read_text())
for x in fj["features"]:
    if x["id"] == "academy.glossary": x["name"] = f"Searchable glossary ({len(learning.G)} terms) linked to modules"
    if x["id"] == "academy.lessons":
        x["evidence"] = f"{c['drafted']} of {c['total']} registered modules have lessons (see CURRICULUM_MAP.md). AI-drafted; numeric content machine-checked; R snippets executed in tests; {claims.summary()['total']} claims tracked ({claims.summary()['human_reviewed']} human-reviewed, {claims.summary()['unverified']} unverified)"
(ROOT / "features.json").write_text(json.dumps(fj, indent=1))
