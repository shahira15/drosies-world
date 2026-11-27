import shutil, pytest
from metalab import coding as C

PY = [t for t in C.T if t["lang"] == "python"]; RR = [t for t in C.T if t["lang"] == "r"]
def test_registry_is_consistent():
    assert len({t["id"] for t in C.T}) == len(C.T) and len(PY) >= 8 and len(RR) >= 3
    assert all(t["hints"] and t["goal"] and t["check"] for t in C.T)

@pytest.mark.parametrize("t", PY, ids=lambda t: t["id"])
def test_python_reference_solution_passes_and_starter_fails(t):
    r = C.run(t, t["solution"]); assert r["ok"], r["error"]
    r2 = C.run(t, t["starter"]); assert not r2["ok"]

@pytest.mark.skipif(not shutil.which("Rscript"), reason="R not installed")
@pytest.mark.parametrize("t", RR, ids=lambda t: t["id"])
def test_r_reference_solution_passes_and_starter_fails(t):
    r = C.run(t, t["solution"]); assert r["ok"], r["error"]
    assert not C.run(t, t["starter"])["ok"]

def test_wrong_answer_gives_useful_message():
    t = C.BY_ID["py_sd_se"]; bad = t["starter"].replace("sd = None", "sd = x.std()").replace("se = None", "se = sd/len(x)**0.5")
    r = C.run(t, bad); assert not r["ok"] and "ddof=1" in r["error"]

def test_timeout_and_cwd_isolation(tmp_path):
    t = dict(C.BY_ID["py_sd_se"]); r = C.run(t, "while True: pass\n", timeout=2); assert not r["ok"] and ("Timed out" in r["error"] or "CPU" in r["error"] or r["error"])
    r = C.run(dict(t, check="pass"), "import os\nopen('x.txt','w').write('a')\nprint(os.getcwd())\n"); assert r["ok"] and not (C.ROOT / "x.txt").exists()
