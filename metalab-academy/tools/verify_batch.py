#!/usr/bin/env python3
"""Batch verification of Knowledge-Universe CANDIDATES on YOUR machine (the build sandbox cannot reach most sites).

  python3 tools/verify_batch.py list   [--category "Software & packages"]            list unverified entries
  python3 tools/verify_batch.py run    --verifier "human:Your Name" [--batch 10] [--category X] [--db data/metalab.sqlite] [--no-open]
        walks through unverified entries in batches: opens each official page in your browser (macOS/Linux/Windows) and asks what you SAW.
        Nothing is recorded unless you type the page title you actually saw. Blank title = skip. 'q' = quit.
  python3 tools/verify_batch.py export --out queue.csv                                 queue for a spreadsheet; fill it in, then:
  python3 tools/verify_batch.py import queue.csv [--db ...]

This records the 'page examined by a human' level ONLY. Whether the page supports a particular claim is a separate question (claims registry).
Costs, dates, eligibility and deadlines must be copied from what you see, with the date. The tool never fetches pages itself and never invents values."""
import argparse, datetime, sys, webbrowser
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from metalab import verification as VER, resources
from metalab.store import Store


def pending(store, category=None):
    out = []
    for e in VER.entries():
        if category and e["category"] != category: continue
        if VER.status(e["url"], store)["level"] == VER.LEVELS[2]: continue
        out.append(e)
    return out


def run(store, verifier, batch=10, category=None, ask=input, opener=webbrowser.open, today=None, open_pages=True):
    """Interactive loop; `ask` and `opener` are injectable for tests. Returns (recorded, skipped)."""
    if verifier.lower().startswith(("ai", "llm", "model", "system")): raise SystemExit("The verifier must be a human name (AI/system cannot verify).")
    today = today or datetime.date.today().isoformat(); rec = skip = 0; todo = pending(store, category)[:batch]
    for i, e in enumerate(todo, 1):
        print(f"\n[{i}/{len(todo)}] {e['name']}  ({e['category']})\n  {e['url']}")
        if open_pages: opener(e["url"])
        title = ask("  Page title/heading you SAW (blank = skip, q = quit): ").strip()
        if title.lower() == "q": break
        if not title: skip += 1; continue
        match = ask("  Does the page match the description? [yes/partly/no]: ").strip().lower() or "partly"
        cost = ask("  Access/cost you saw (or blank): "); ver = ask("  Version/date on the page (or blank): "); note = ask("  Notes: ")
        try: store.add_verification(e["url"], verifier, today, title, match, cost, ver, note); rec += 1
        except ValueError as ex: print("  NOT recorded:", ex); skip += 1
    return rec, skip


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter); ap.add_argument("cmd", choices=["list", "run", "export", "import"]); ap.add_argument("file", nargs="?")
    ap.add_argument("--db", default=str(ROOT / "data" / "metalab.sqlite")); ap.add_argument("--verifier", default=""); ap.add_argument("--batch", type=int, default=10); ap.add_argument("--category"); ap.add_argument("--out"); ap.add_argument("--no-open", action="store_true")
    a = ap.parse_args(argv); store = Store(a.db)
    if a.cmd == "list":
        for e in pending(store, a.category): print(f"{e['category']:28} {e['name'][:60]:60} {e['url']}")
    elif a.cmd == "run":
        if not a.verifier: ap.error("--verifier is required (a human name)")
        print("recorded %d, skipped %d" % run(store, a.verifier, a.batch, a.category, open_pages=not a.no_open))
    elif a.cmd == "export":
        Path(a.out or "verification_queue.csv").write_text(VER.export_queue(store)); print("written", a.out or "verification_queue.csv")
    else:
        if not a.file: ap.error("import needs a CSV file"); 
        print(VER.import_results(store, Path(a.file).read_text()))


if __name__ == "__main__":
    main()
