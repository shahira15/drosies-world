"""Interactive coding tutorials (Python and R) with hidden checks.

SAFETY: learner code runs in a separate process (python -I / Rscript --vanilla) with a timeout, CPU and memory limits and a temporary
working directory. This is NOT a security sandbox - it runs with your user's privileges on YOUR machine. Do not run code you do not understand
or that someone else gave you. No network restrictions are applied.
Every tutorial's reference solution is executed in the test-suite so a broken tutorial cannot ship."""
from __future__ import annotations
import os, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
T = []
def tut(**k): T.append(k)

tut(id="py_sd_se", lang="python", module=25, title="SD versus SE", goal="Compute the sample SD (n-1 denominator) and the standard error of the mean.",
 starter='import numpy as np\nx = np.array([12.1, 9.8, 11.4, 10.2, 13.0, 9.5, 10.9, 11.7])\nsd = None   # sample standard deviation\nse = None   # standard error of the mean\n',
 solution='import numpy as np\nx = np.array([12.1, 9.8, 11.4, 10.2, 13.0, 9.5, 10.9, 11.7])\nsd = x.std(ddof=1)\nse = sd / np.sqrt(len(x))\n',
 check='assert sd is not None and abs(sd - 1.2045) < 1e-3, "SD should use ddof=1 (sample SD). Expected about 1.2045"\nassert abs(se - sd/len(x)**0.5) < 1e-9, "SE = SD / sqrt(n)"',
 hints=["numpy's std uses ddof=0 by default; the sample SD needs ddof=1.", "SE = SD / sqrt(n)."])
tut(id="py_hedges", lang="python", module=27, title="Hedges' g by hand", goal="Compute pooled SD, Cohen's d, the exact Hedges correction J and g with its LS variance.",
 starter='import math\nm1, sd1, n1 = 12.0, 3.0, 10\nm2, sd2, n2 = 10.0, 2.0, 10\ndf = n1 + n2 - 2\nsp = None\nd = None\nJ = None   # exact: Gamma(df/2) / (sqrt(df/2) * Gamma((df-1)/2)); use math.lgamma\ng = None\nvar_g = None   # LS: (n1+n2)/(n1*n2) + g**2 / (2*(n1+n2))\n',
 solution='import math\nm1, sd1, n1 = 12.0, 3.0, 10\nm2, sd2, n2 = 10.0, 2.0, 10\ndf = n1 + n2 - 2\nsp = math.sqrt(((n1-1)*sd1**2 + (n2-1)*sd2**2) / df)\nd = (m1 - m2) / sp\nJ = math.exp(math.lgamma(df/2) - math.lgamma((df-1)/2)) / math.sqrt(df/2)\ng = J * d\nvar_g = (n1+n2)/(n1*n2) + g**2 / (2*(n1+n2))\n',
 check='assert abs(sp - 2.5495) < 1e-3, "pooled SD"\nassert abs(d - 0.7845) < 1e-3, "d"\nassert abs(J - 0.9576) < 1e-3, "J (exact gamma form)"\nassert abs(g - 0.7512) < 1e-3, "g = J*d"\nassert abs(var_g - 0.2141) < 1e-3, "LS variance"',
 hints=["sp = sqrt(((n1-1)*sd1^2 + (n2-1)*sd2^2)/df)", "math.lgamma(x) is log Gamma(x); exponentiate a difference of logs."])
tut(id="py_ivpool", lang="python", module=32, title="Inverse-variance pooling", goal="Pool three studies with weights 1/variance.",
 starter='import numpy as np\ny = np.array([0.2, 0.5, 0.8])\nv = np.array([0.04, 0.04, 0.16])\nw = None\nest = None\nse = None\n',
 solution='import numpy as np\ny = np.array([0.2, 0.5, 0.8])\nv = np.array([0.04, 0.04, 0.16])\nw = 1 / v\nest = (w * y).sum() / w.sum()\nse = (1 / w.sum()) ** 0.5\n',
 check='assert abs(est - 0.4) < 1e-9, "pooled estimate should be 0.40 (not the simple mean 0.50)"\nassert abs(se - 0.13333) < 1e-4, "SE = sqrt(1/sum(w))"',
 hints=["Weights are 1/variance.", "est = sum(w*y)/sum(w)."])
tut(id="py_het", lang="python", module=35, title="Q, I-squared and DerSimonian-Laird tau-squared", goal="Compute Cochran's Q, Q-based I², and the DL estimate of tau² for the four-study example.",
 starter='import numpy as np\ny = np.array([0.10, 0.30, 0.55, 0.90])\nv = np.array([0.02, 0.03, 0.025, 0.04])\nk = len(y)\nQ = None\nI2 = None      # percent, max(0, (Q-(k-1))/Q)*100\ntau2_dl = None # (Q-(k-1)) / (sum(w) - sum(w^2)/sum(w)), floored at 0\n',
 solution='import numpy as np\ny = np.array([0.10, 0.30, 0.55, 0.90])\nv = np.array([0.02, 0.03, 0.025, 0.04])\nk = len(y)\nw = 1 / v\nmu = (w * y).sum() / w.sum()\nQ = (w * (y - mu) ** 2).sum()\nI2 = max(0.0, (Q - (k - 1)) / Q) * 100\ntau2_dl = max(0.0, (Q - (k - 1)) / (w.sum() - (w ** 2).sum() / w.sum()))\n',
 check='from metalab import stats as S\nassert abs(Q - 11.98) < 0.01, "Q"\nassert abs(I2 - 75.0) < 0.1, "I2"\nassert abs(tau2_dl - S.tau2_dl(y, v)) < 1e-9, "tau2 must equal the library DL estimate"',
 hints=["First compute the common-effect mean with weights 1/v.", "Q = sum(w*(y-mu)^2)."])
tut(id="py_library", lang="python", module=34, title="Use the validated engine", goal="Run a REML random-effects meta-analysis with Hartung-Knapp CI and extract the prediction interval.",
 starter='import numpy as np\nfrom metalab import stats as S\ny = np.array([0.10, 0.30, 0.55, 0.90])\nv = np.array([0.02, 0.03, 0.025, 0.04])\nres = None   # S.meta_analyze(...)\npi = None    # prediction interval (lo, hi)\n',
 solution='import numpy as np\nfrom metalab import stats as S\ny = np.array([0.10, 0.30, 0.55, 0.90])\nv = np.array([0.02, 0.03, 0.025, 0.04])\nres = S.meta_analyze(y, v, "random", "REML", hksj=True)\npi = res.pred_int\n',
 check='assert res.hksj and res.method == "REML", "use model=random, method=REML, hksj=True"\nassert abs(pi[0] + 1.006) < 5e-3 and abs(pi[1] - 1.899) < 5e-3, "prediction interval expected about (-1.006, 1.899)"',
 hints=["S.meta_analyze(y, v, 'random', 'REML', hksj=True)", "The result object has a pred_int attribute."])
tut(id="py_loo", lang="python", module=51, title="Leave-one-out by hand", goal="Loop over studies and re-estimate the common-effect pooled mean without each one.",
 starter='import numpy as np\ny = np.array([0.10, 0.30, 0.55, 0.90])\nv = np.array([0.02, 0.03, 0.025, 0.04])\nloo = []   # pooled estimate omitting study i, for i = 0..3\n',
 solution='import numpy as np\ny = np.array([0.10, 0.30, 0.55, 0.90])\nv = np.array([0.02, 0.03, 0.025, 0.04])\nloo = []\nfor i in range(len(y)):\n    keep = np.arange(len(y)) != i\n    w = 1 / v[keep]\n    loo.append((w * y[keep]).sum() / w.sum())\n',
 check='assert len(loo) == 4, "one estimate per omitted study"\nassert abs(loo[3] - 0.3000) < 2e-3 and abs(loo[0] - 0.5542) < 2e-3, "check each leave-one-out mean"',
 hints=["Use a boolean mask to drop one study.", "Recompute weights from the remaining variances."])
tut(id="py_sem", lang="python", module=18, title="The SEM trap", goal="Convert SEM to SD and see how much the lnRR variance changes when SEM is wrongly used as SD.",
 starter='import math\nn = 8\nsem_ctrl, sem_trt = 1.2, 1.4\nm_ctrl, m_trt = 50.2, 53.9\nsd_ctrl = None\nsd_trt = None\ndef lnrr_var(m1, sd1, n1, m2, sd2, n2):\n    return sd1**2/(n1*m1**2) + sd2**2/(n2*m2**2)\nv_right = None   # using the correct SDs\nv_wrong = None   # using SEM as if it were SD\nratio = None     # v_right / v_wrong\n',
 solution='import math\nn = 8\nsem_ctrl, sem_trt = 1.2, 1.4\nm_ctrl, m_trt = 50.2, 53.9\nsd_ctrl = sem_ctrl * math.sqrt(n)\nsd_trt = sem_trt * math.sqrt(n)\ndef lnrr_var(m1, sd1, n1, m2, sd2, n2):\n    return sd1**2/(n1*m1**2) + sd2**2/(n2*m2**2)\nv_right = lnrr_var(m_trt, sd_trt, n, m_ctrl, sd_ctrl, n)\nv_wrong = lnrr_var(m_trt, sem_trt, n, m_ctrl, sem_ctrl, n)\nratio = v_right / v_wrong\n',
 check='assert abs(sd_ctrl - 3.394) < 1e-3, "SD = SEM*sqrt(n)"\nassert abs(ratio - 8.0) < 1e-9, "variance is understated by a factor of n (=8) when SEM is used as SD"',
 hints=["SD = SEM * sqrt(n).", "Both SDs are multiplied by sqrt(n), so the variance changes by exactly n."])
tut(id="py_egger", lang="python", module=50, title="Egger's regression test by hand", goal="Regress y/se on 1/se and test the intercept.",
 starter='import numpy as np\nfrom scipy import stats\ny = np.array([0.45, 0.30, 0.52, 0.18, 0.60, 0.35, 0.80, 0.25])\nse = np.array([0.10, 0.12, 0.15, 0.09, 0.30, 0.20, 0.40, 0.11])\nz = None; prec = None\nintercept = None\nt_stat = None\np = None\n',
 solution='import numpy as np\nfrom scipy import stats\ny = np.array([0.45, 0.30, 0.52, 0.18, 0.60, 0.35, 0.80, 0.25])\nse = np.array([0.10, 0.12, 0.15, 0.09, 0.30, 0.20, 0.40, 0.11])\nz = y / se; prec = 1 / se\nX = np.column_stack([np.ones(len(y)), prec])\nbeta, *_ = np.linalg.lstsq(X, z, rcond=None)\nres = z - X @ beta\ns2 = res @ res / (len(y) - 2)\ncov = s2 * np.linalg.inv(X.T @ X)\nintercept = beta[0]\nt_stat = intercept / np.sqrt(cov[0, 0])\np = 2 * stats.t.sf(abs(t_stat), len(y) - 2)\n',
 check='from metalab import advanced as A\ne = A.egger_test(y, se**2)\nassert abs(intercept - e["intercept"]) < 1e-9 and abs(p - e["p"]) < 1e-9, "must match the benchmarked implementation"',
 hints=["Design matrix columns: ones and 1/se.", "Residual variance has n-2 degrees of freedom."])
tut(id="r_escalc", lang="r", module=27, title="Effect sizes with escalc", goal="Compute Hedges' g for two groups with metafor.",
 starter='library(metafor)\ndat <- data.frame(m1i=12, sd1i=3, n1i=10, m2i=10, sd2i=2, n2i=10)\nres <- NULL   # escalc(measure="SMD", ...)\n',
 solution='library(metafor)\ndat <- data.frame(m1i=12, sd1i=3, n1i=10, m2i=10, sd2i=2, n2i=10)\nres <- escalc(measure="SMD", m1i=m1i, sd1i=sd1i, n1i=n1i, m2i=m2i, sd2i=sd2i, n2i=n2i, data=dat)\n',
 check='stopifnot("yi should be about 0.7512" = isTRUE(abs(res$yi[1] - 0.7512) < 1e-3))\nstopifnot("vi should be about 0.2141 (LS)" = isTRUE(abs(res$vi[1] - 0.2141) < 1e-3))',
 hints=["escalc(measure='SMD', m1i=..., sd1i=..., n1i=..., m2i=..., sd2i=..., n2i=..., data=dat)"])
tut(id="r_rma", lang="r", module=34, title="Random-effects model on the BCG trials", goal="Fit a REML random-effects model to log risk ratios.",
 starter='library(metafor)\ndat <- escalc(measure="RR", ai=tpos, bi=tneg, ci=cpos, di=cneg, data=dat.bcg)\nres <- NULL   # rma(yi, vi, data=dat, method="REML")\n',
 solution='library(metafor)\ndat <- escalc(measure="RR", ai=tpos, bi=tneg, ci=cpos, di=cneg, data=dat.bcg)\nres <- rma(yi, vi, data=dat, method="REML")\n',
 check='stopifnot("tau2 should be about 0.3132" = isTRUE(abs(res$tau2 - 0.3132) < 1e-3))\nstopifnot("estimate should be about -0.7145" = isTRUE(abs(as.numeric(res$beta) + 0.7145) < 1e-3))',
 hints=["rma(yi, vi, data=dat, method='REML')"])
tut(id="r_reg", lang="r", module=37, title="Meta-regression on latitude", goal="Fit a mixed-effects meta-regression of BCG log RR on absolute latitude.",
 starter='library(metafor)\ndat <- escalc(measure="RR", ai=tpos, bi=tneg, ci=cpos, di=cneg, data=dat.bcg)\nres <- NULL   # rma(yi, vi, mods = ~ ablat, data=dat)\n',
 solution='library(metafor)\ndat <- escalc(measure="RR", ai=tpos, bi=tneg, ci=cpos, di=cneg, data=dat.bcg)\nres <- rma(yi, vi, mods = ~ ablat, data=dat)\n',
 check='stopifnot("the latitude slope should be about -0.0291" = isTRUE(abs(as.numeric(res$beta[2]) + 0.0291) < 2e-3))\nstopifnot("residual tau2 should be about 0.076" = isTRUE(abs(res$tau2 - 0.0764) < 5e-3))',
 hints=["mods = ~ ablat", "With 13 studies and 1 moderator, remember the <10-per-moderator caution."])
BY_ID = {t["id"]: t for t in T}


def _py_limits():
    import resource
    resource.setrlimit(resource.RLIMIT_CPU, (20, 20)); resource.setrlimit(resource.RLIMIT_AS, (2 * 1024**3, 2 * 1024**3))


def run(tutorial, code, timeout=25):
    """Run learner code + hidden check. Returns dict(ok, stdout, error)."""
    t = tutorial if isinstance(tutorial, dict) else BY_ID[tutorial]
    if t["lang"] == "r" and not shutil.which("Rscript"): return dict(ok=False, stdout="", error="R is not installed on this machine (Rscript not found).")
    with tempfile.TemporaryDirectory() as d:
        ext = "py" if t["lang"] == "python" else "R"; f = Path(d) / f"snippet.{ext}"
        pre = f"import sys; sys.path.insert(0, {str(ROOT)!r})\n" if t["lang"] == "python" else ""
        f.write_text(pre + code + "\n\n# ---- hidden checks ----\n" + t["check"] + "\n")
        env = {"PATH": os.environ.get("PATH", ""), "PYTHONPATH": str(ROOT), "HOME": d, "LANG": "C.UTF-8", "MPLBACKEND": "Agg"}
        cmd = [sys.executable, "-I", str(f)] if t["lang"] == "python" else ["Rscript", "--vanilla", str(f)]
        try:
            p = subprocess.run(cmd, cwd=d, env={**env, "PYTHONPATH": str(ROOT)} if t["lang"] == "python" else env, capture_output=True, text=True, timeout=timeout,
                               preexec_fn=_py_limits if t["lang"] == "python" else None)
        except subprocess.TimeoutExpired:
            return dict(ok=False, stdout="", error=f"Timed out after {timeout} s (infinite loop?).")
    out = p.stdout[-4000:]
    if p.returncode == 0: return dict(ok=True, stdout=out, error="")
    err = p.stderr.strip().splitlines()
    msg = next((l for l in reversed(err) if l.startswith(("AssertionError", "Error", "NameError", "TypeError", "SyntaxError", "ValueError", "ModuleNotFoundError")) or "stopifnot" in l or l.startswith("Error")), err[-1] if err else "failed")
    return dict(ok=False, stdout=out, error=("\n".join(err[-6:]))[-1500:] if not msg else msg + "\n\n" + "\n".join(err[-6:])[-1200:])
