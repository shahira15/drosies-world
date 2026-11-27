import ast, csv, io, re, time
from pathlib import Path
import pytest
from metalab import workflow as W, manuscript as M
from metalab.store import Store

ROOT = Path(__file__).parent.parent

def test_csv_formula_injection_is_neutralised_but_numbers_untouched():
    s = Store(":memory:"); pid = s.create_project("=cmd|' /C calc'!A0", "+SUM(1)", "Systematic review")
    s.add_decision(pid, "@HYPERLINK(\"http://evil\")", "decision"); s.add_decision(pid, "-5", "decision")
    out = s.to_csv(s.decisions(pid)); cells = [c for row in csv.reader(io.StringIO(out)) for c in row]
    assert "'@HYPERLINK(\"http://evil\")" in cells and "-5" in cells and not any(c.startswith(("=", "+", "@")) for c in cells)
    assert s.to_csv(s.projects()).count("'=cmd") == 1

def test_sql_injection_strings_are_stored_literally():
    s = Store(":memory:"); evil = "x'); DROP TABLE refs; --"; pid = s.create_project(evil, evil, evil)
    s.import_refs(pid, f"TY  - JOUR\nTI  - {evil}\nAU  - {evil}\nPY  - 2020\nER  -\n"); s.add_decision(pid, evil); s.add_contact(evil)
    assert s.projects()[0]["name"] == evil and s.refs(pid)[0]["title"] == evil and len(s.contacts()) == 1

def test_generated_svg_latex_and_markdown_escape_user_text():
    c = dict(identified=1, duplicates_removed=0, screened=1, excluded_title_abstract=0, reports_sought=1, excluded_full_text=1, included=0, exclusion_reasons={"<script>alert(1)</script>": 1})
    svg = W.prisma_svg(c); assert "<script>" not in svg and "&lt;script&gt;" in svg
    f = M.forest_svg(["<img src=x onerror=alert(1)>", "b"], [0.1, 0.2], [0.04, 0.05], 0.15, (0.0, 0.3)); assert "<img" not in f and "&lt;img" in f
    s = Store(":memory:"); pid = s.create_project("P", "B", "SR"); s.save_section(pid, "title", "100% & #1 _x_ $y$")
    tex, _ = M.to_latex(s, pid); assert "100\\% \\& \\#1 \\_x\\_ \\$y\\$" in tex

def test_unsafe_html_is_only_ever_static_strings():
    """Every st.markdown(..., unsafe_allow_html=True) in the app must receive a constant string (no f-string / concatenation / variables)."""
    tree = ast.parse((ROOT / "app.py").read_text()); bad = []
    for n in ast.walk(tree):
        if isinstance(n, ast.Call) and any(k.arg == "unsafe_allow_html" and getattr(k.value, "value", False) is True for k in n.keywords):
            arg = n.args[0] if n.args else None
            if not (isinstance(arg, ast.Constant) and isinstance(arg.value, str)): bad.append(n.lineno)
    assert bad == [], f"unsafe_allow_html with non-constant content at lines {bad}"

def test_no_network_libraries_in_app_or_core_package():
    banned = {"requests", "urllib", "urllib3", "http", "socket", "ftplib", "smtplib", "webbrowser", "httpx", "aiohttp", "xmlrpc", "telnetlib"}
    offenders = []
    for f in [ROOT / "app.py", *(ROOT / "metalab").glob("*.py"), *(ROOT / "content").glob("*.py")]:
        for n in ast.walk(ast.parse(f.read_text())):
            names = [a.name.split(".")[0] for a in n.names] if isinstance(n, ast.Import) else [n.module.split(".")[0]] if isinstance(n, ast.ImportFrom) and n.module else []
            offenders += [(f.name, x) for x in names if x in banned]
    assert offenders == [], offenders                      # the app makes no network calls (tools/ may, and are not imported by the app)

def test_import_and_restore_size_limits_and_malformed_input_is_safe_and_fast():
    s = Store(":memory:"); pid = s.create_project("P", "B", "SR"); s.MAX_IMPORT_BYTES = 1000
    with pytest.raises(ValueError, match="50 MB"): s.import_refs(pid, "TY  - JOUR\n" + "x" * 2000)
    s.MAX_RESTORE_BYTES = 100
    with pytest.raises(ValueError): s.restore_json("{" + " " * 500 + "}")
    s2 = Store(":memory:"); pid = s2.create_project("P", "B", "SR"); t0 = time.time()
    for junk in ["TY  - " + "A" * 200000, "TY  -\n" * 20000 + "ER  -", "PMID- " + "9" * 100000, "\x00\xff" * 5000 + "TY  - JOUR\nER  -", "TY  - JOUR\nTI  - " + "(" * 50000 + "\nER  -"]:
        try: s2.import_refs(pid, junk, "junk")
        except ValueError: pass
    assert time.time() - t0 < 15

def test_backup_without_personal_data_and_project_deletion():
    s = Store(":memory:"); pid = s.create_project("Secret project", "Bio", "SR"); s.set_profile(discipline="Bio"); s.add_contact("Dr Test Person (fictional)"); s.add_note(1, "private note")
    s.add_credit(pid, "Dr Test Person (fictional)", "Formal analysis", "ran stats"); s.import_refs(pid, "TY  - JOUR\nTI  - A\nPY  - 2020\nER  -\n")
    full, safe = s.backup_json(), s.backup_json(include_personal=False)
    assert "Dr Test Person" in full and "Dr Test Person" not in safe and "private note" not in safe and '"personal_data_included": false' in safe
    with pytest.raises(ValueError): s.delete_project(pid, "wrong name")
    s.delete_project(pid, "Secret project")
    assert s.projects() == [] and s.refs(pid) == [] and s.credits(pid) == [] and any(a["action"] == "project_deleted" for a in s.audit_rows())
    assert all("Dr Test Person" not in a["detail"] for a in s.audit_rows())                     # personal contact details never entered the audit log

def test_ai_labels_cannot_enter_human_only_records():
    s = Store(":memory:"); pid = s.create_project("P", "B", "SR"); sid = s.new_study(pid, "S")
    for fn in (lambda: s.extract(pid, sid, "x", "1", "", "d.pdf", reviewer="LLM"), lambda: s.rate_rob(pid, sid, "CUSTOM", "d", "low", "q", reviewer="model-x"),
               lambda: s.verify_result(pid, "k", "AI", "n"), lambda: s.add_verification("https://x", "ai", "2026-01-01", "t", "yes")):
        with pytest.raises(ValueError): fn()
