"""UI audit in real Chromium: axe-core accessibility scan + keyboard-navigation checks for every page.
Usage: python3 tools/audit_ui.py [out.json]   (needs: pip install playwright axe-playwright-python; browsers installed)
Automated tools find only a subset of accessibility problems (commonly cited as ~30-40%); this does NOT replace manual testing with a screen reader."""
import json, os, subprocess, sys, tempfile, time, urllib.request, glob
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent; sys.path.insert(0, str(ROOT))
from playwright.sync_api import sync_playwright
from axe_playwright_python.sync_playwright import Axe
PAGES = ["Home", "Onboarding", "Learning Academy", "Practice", "Coding Lab", "Virtual Lab", "Method Wizard", "Research Workspace", "Manuscript Studio", "First Paper Plan",
         "Statistics Lab", "Knowledge Universe", "Network & Collaboration", "Quality & Expert Review", "Status & Limitations"]
def chromium():
    c = glob.glob("/opt/pw-browsers/chromium-*/chrome-linux*/chrome") + glob.glob("/opt/pw-browsers/chromium_headless_shell-*/chrome-linux*/headless_shell")
    return c[0] if c else None
def main(out):
    tmp = tempfile.mkdtemp(); env = {**os.environ, "METALAB_DB": f"{tmp}/a.sqlite"}
    from metalab.store import Store; from metalab import vlab; s = Store(env["METALAB_DB"]); vlab.solve_perfectly(s, vlab.load(s)); s.create_project("Audit project", "Biology", "Systematic review")
    port = "8799"; srv = subprocess.Popen([sys.executable, "-m", "streamlit", "run", str(ROOT / "app.py"), "--server.headless", "true", "--server.port", port, "--browser.gatherUsageStats", "false"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(40):
            try: urllib.request.urlopen(f"http://localhost:{port}/_stcore/health", timeout=1); break
            except Exception: time.sleep(1)
        report = dict(pages={}, keyboard={})
        with sync_playwright() as p:
            b = p.chromium.launch(executable_path=chromium()) if chromium() else p.chromium.launch(); axe = Axe()
            for vp_name, vp in (("desktop", {"width": 1366, "height": 900}), ("mobile", {"width": 390, "height": 844})):
                pg = b.new_page(viewport=vp); pg.goto(f"http://localhost:{port}"); pg.wait_for_selector("text=MetaLab Academy", timeout=30000); pg.wait_for_timeout(2000)
                def open_sidebar():
                    if vp_name != "mobile": return
                    for sel in ('[data-testid="stExpandSidebarButton"]', '[data-testid="collapsedControl"]', 'button[aria-label*="sidebar" i]'):
                        try: pg.locator(sel).first.click(timeout=2500); pg.wait_for_timeout(800); return
                        except Exception: continue
                for name in PAGES if vp_name == "desktop" else ["Home", "Learning Academy", "Research Workspace"]:
                    try:
                        for attempt in range(3):
                            try: pg.locator('[data-testid="stSidebar"]').get_by_text(name).first.click(timeout=3000); break
                            except Exception:
                                if attempt == 2: raise
                                open_sidebar(); pg.wait_for_timeout(600)
                        pg.wait_for_timeout(2500)
                    except Exception as e: report["pages"][f"{vp_name}:{name}"] = {"error": "could not open: " + str(e)[:80]}; continue
                    if os.environ.get("AUDIT_SHOTS") and name in ("Home", "Manuscript Studio", "Research Workspace"): pg.screenshot(path=str(ROOT / "audit" / f"shot_{vp_name}_{name.replace(' ', '_')}.png"))
                    try: pass
                    except Exception as e: report["pages"][f"{vp_name}:{name}"] = {"error": "could not open: " + str(e)[:80]}; continue
                    res = axe.run(pg); v = res.response["violations"]
                    report["pages"][f"{vp_name}:{name}"] = dict(violations=[dict(id=x["id"], impact=x["impact"], help=x["help"], nodes=len(x["nodes"]), example=(x["nodes"][0]["html"][:140] if x["nodes"] else "")) for x in v], passes=len(res.response["passes"]))
                if vp_name == "desktop":   # keyboard walk on Home
                    pg.locator('[data-testid="stSidebar"]').get_by_text("Home").first.click(); pg.wait_for_timeout(1500); pg.mouse.click(700, 5); seen = []
                    for _ in range(40):
                        pg.keyboard.press("Tab"); d = pg.evaluate("() => { const e=document.activeElement; if(!e) return null; const cs=getComputedStyle(e); return {tag:e.tagName, role:e.getAttribute('role'), label:(e.getAttribute('aria-label')||e.innerText||e.getAttribute('title')||'').slice(0,40), outline:cs.outlineStyle+' '+cs.outlineWidth+' '+cs.boxShadow.slice(0,30)} }")
                        seen.append(d)
                    uniq = {json.dumps(x, sort_keys=True) for x in seen if x}
                    report["keyboard"] = dict(tab_presses=40, distinct_focus_targets=len(uniq), reached_body_only=all((x or {}).get("tag") == "BODY" for x in seen), sample=[x for x in seen[:12] if x],
                                              focus_style_missing=[x for x in seen if x and x["tag"] not in ("BODY",) and x["outline"].startswith("none 0px") and x["outline"].endswith(" ")][:5])
                pg.close()
            b.close()
    finally: srv.terminate()
    Path(out).write_text(json.dumps(report, indent=1)); return report
if __name__ == "__main__":
    r = main(sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "audit" / "ui_audit.json"))
    agg = {}
    for k, v in r["pages"].items():
        for x in v.get("violations", []): agg.setdefault((x["id"], x["impact"]), []).append(k)
    print("pages audited:", sum(1 for v in r["pages"].values() if "violations" in v), "| distinct violation types:", len(agg))
    for (i, imp), ps in sorted(agg.items(), key=lambda t: str(t[0][1])): print(f"  {imp:9} {i:32} on {len(ps)} page(s)")
    print("keyboard:", {k: r["keyboard"].get(k) for k in ("distinct_focus_targets", "reached_body_only")})
    failed = [k for k, v in r["pages"].items() if "error" in v]
    print("pages that could NOT be opened (not audited):", failed or "none")
    sys.exit(1 if failed else 0)
