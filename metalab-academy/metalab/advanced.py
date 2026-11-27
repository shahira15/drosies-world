"""Advanced methods (v0.3). Each function is benchmarked against R/metafor 4.4.0 in tests/test_advanced_r.py.
Scope notes are in each docstring; anything NOT implemented is listed in KNOWN_LIMITATIONS.md."""
from __future__ import annotations
import math
import numpy as np
from scipy import stats, optimize
from . import stats as S


# ----------------------------------------------------- rate / prevalence effect sizes
def log_irr(x1, t1, x2, t2, cc=0.5):
    """ln incidence rate ratio and variance 1/x1 + 1/x2. cc is added to the counts (not person-time) of a study with a zero count (metafor to='only0')."""
    if min(t1, t2) <= 0 or x1 < 0 or x2 < 0: raise ValueError("Person-time must be positive and counts non-negative.")
    if (x1 == 0 or x2 == 0) and cc: x1, x2 = x1 + cc, x2 + cc
    if x1 == 0 or x2 == 0: raise ValueError("Zero count: apply a continuity correction or use a rare-event method.")
    return math.log((x1 / t1) / (x2 / t2)), 1 / x1 + 1 / x2


def proportion_es(x, n, measure="PLO", cc=0.5):
    """Prevalence/proportion effect sizes: PR raw, PLO logit, PFT Freeman-Tukey double-arcsine, PAS arcsine.
    Zero/full counts get cc added to x and 2*cc to n for PR/PLO (metafor to='only0').
    CAUTION (Module 47): PFT back-transformation depends on a single 'n' (harmonic mean) and can mislead; GLMM/logit are often preferred."""
    if n <= 0 or x < 0 or x > n: raise ValueError("Need 0 <= x <= n and n > 0.")
    if measure in ("PR", "PLO") and (x == 0 or x == n) and cc: x, n = x + cc, n + 2 * cc
    if measure == "PR": p = x / n; return p, p * (1 - p) / n
    if measure == "PLO":
        if x in (0, n): raise ValueError("Zero/full count requires a correction.")
        return math.log(x / (n - x)), 1 / x + 1 / (n - x)
    if measure == "PFT": return 0.5 * (math.asin(math.sqrt(x / (n + 1))) + math.asin(math.sqrt((x + 1) / (n + 1)))), 1 / (4 * (n + 0.5))
    if measure == "PAS": return math.asin(math.sqrt(x / n)), 1 / (4 * n)
    raise ValueError("measure must be PR, PLO, PFT or PAS")


def design_effect(m, icc):
    """Kish design effect for equal clusters of size m: 1 + (m-1)*ICC. Effective n = n / DEFF (approximate; assumes equal cluster sizes)."""
    if m < 1 or not 0 <= icc <= 1: raise ValueError("m>=1 and 0<=ICC<=1 required.")
    return 1 + (m - 1) * icc


# ------------------------------------------------------------ Mantel-Haenszel / Peto
def _raw_tables(a, b, c, d):
    a, b, c, d = (np.asarray(x, float) for x in (a, b, c, d))
    if not (a.shape == b.shape == c.shape == d.shape): raise ValueError("Cell vectors must have equal length.")
    if np.any(np.array([a, b, c, d]) < 0): raise ValueError("Counts must be non-negative.")
    if np.any((a + b + c + d) == 0): raise ValueError("A table with zero total cannot be used.")
    return a, b, c, d


def _study_effects(a, b, c, d, measure, cc, drop00):
    """Per-study effects used ONLY for Cochran's Q: cc added to all cells of studies with a zero cell; double-zero tables dropped (metafor escalc defaults)."""
    zero = (a == 0) | (b == 0) | (c == 0) | (d == 0)
    a2, b2, c2, d2 = (x + cc * zero for x in (a, b, c, d))
    ok = np.ones(len(a), bool)
    if drop00: ok = ~(((a == 0) & (c == 0)) | ((b == 0) & (d == 0)))
    n1, n2 = a2 + b2, c2 + d2
    with np.errstate(all="ignore"):
        if measure == "OR": yi, vi = np.log(a2 * d2 / (b2 * c2)), 1 / a2 + 1 / b2 + 1 / c2 + 1 / d2
        elif measure == "RR": yi, vi = np.log((a2 / n1) / (c2 / n2)), 1 / a2 - 1 / n1 + 1 / c2 - 1 / n2
        else: p1, p2 = a2 / n1, c2 / n2; yi, vi = p1 - p2, p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2
    ok &= np.isfinite(yi) & np.isfinite(vi) & (vi > 0)
    return yi[ok], vi[ok]


def mantel_haenszel(a, b, c, d, measure="OR", cc=0.5, drop00=True, level=0.95):
    """Mantel-Haenszel pooled OR/RR/RD from 2x2 tables (a,b = treated events/non-events; c,d = control).
    As in metafor::rma.mh, the MH estimate and its variance are computed from the UNCORRECTED tables (MH needs no continuity correction, so
    zero-cell and double-zero studies are retained); cc/drop00 affect only the per-study effects behind Cochran's Q.
    Variances: Robins-Breslow-Greenland (OR), Greenland-Robins (RR), Sato et al. 1989 (RD, as metafor). Estimate is on the log scale for OR/RR.
    Assumes ONE common effect (no tau^2): not a random-effects method; heterogeneity is reported via Q only."""
    a, b, c, d = _raw_tables(a, b, c, d); k = len(a)
    n1, n2 = a + b, c + d; N = n1 + n2
    if measure == "OR":
        R, Sx = a * d / N, b * c / N; P, Q_ = (a + d) / N, (b + c) / N
        if R.sum() == 0 or Sx.sum() == 0: raise ValueError("MH OR undefined: no informative tables (all products zero).")
        est = math.log(R.sum() / Sx.sum())
        var = (P * R).sum() / (2 * R.sum() ** 2) + ((P * Sx + Q_ * R).sum()) / (2 * R.sum() * Sx.sum()) + (Q_ * Sx).sum() / (2 * Sx.sum() ** 2)
    elif measure == "RR":
        A_, B_ = (a * n2 / N).sum(), (c * n1 / N).sum()
        if A_ == 0 or B_ == 0: raise ValueError("MH RR undefined: no events in one arm across all tables.")
        est = math.log(A_ / B_); var = ((n1 * n2 * (a + c) - a * c * N) / N**2).sum() / (A_ * B_)
    elif measure == "RD":
        W = (n1 * n2 / N).sum(); est = ((a * n2 - c * n1) / N).sum() / W
        num = est * (c * (n1 / N) ** 2 - a * (n2 / N) ** 2 + (n1 / N) * (n2 / N) * (n2 - n1) / 2).sum() + (a * (n2 - c) / N + c * (n1 - a) / N).sum() / 2
        var = num / W**2
    else: raise ValueError("measure must be OR, RR or RD")
    se = math.sqrt(var); z = est / se; crit = stats.norm.ppf(1 - (1 - level) / 2)
    yi, vi = _study_effects(a, b, c, d, measure, cc, drop00)
    Q = float(np.sum((yi - est) ** 2 / vi)); df = len(yi) - 1
    return dict(est=est, se=se, z=z, p=float(2 * stats.norm.sf(abs(z))), ci=(est - crit * se, est + crit * se), k=k, Q=Q, Q_df=df,
                Q_p=float(stats.chi2.sf(Q, df)) if df > 0 else float("nan"), measure=measure)


def peto_or(a, b, c, d, cc=0.5, drop00=True, level=0.95):
    """Peto one-step log OR: sum(O-E)/sum(V), from uncorrected tables (as metafor::rma.peto). Appropriate for rare events with balanced arms and small
    effects; biased with large effects or very unbalanced arms (Module 33/48). Tables with no events contribute zero information."""
    a, b, c, d = _raw_tables(a, b, c, d)
    n1, n2 = a + b, c + d; N = n1 + n2; m1, m2 = a + c, b + d
    with np.errstate(all="ignore"):
        E = n1 * m1 / N; V = np.where(N > 1, n1 * n2 * m1 * m2 / (N**2 * (N - 1)), 0.0)
    if V.sum() == 0: raise ValueError("Peto OR undefined: no informative tables.")
    est = (a - E).sum() / V.sum(); se = 1 / math.sqrt(V.sum()); z = est / se; crit = stats.norm.ppf(1 - (1 - level) / 2)
    ok = V > 0; yi = (a - E)[ok] / V[ok]; vi = 1 / V[ok]; Q = float(np.sum((yi - est) ** 2 / vi)); df = int(ok.sum()) - 1
    return dict(est=est, se=se, z=z, p=float(2 * stats.norm.sf(abs(z))), ci=(est - crit * se, est + crit * se), k=len(a), Q=Q, Q_p=float(stats.chi2.sf(Q, df)) if df > 0 else float("nan"))


# --------------------------------------------------------- small-study effects
def egger_test(y, v):
    """Egger regression test for funnel-plot asymmetry: OLS of y/se on 1/se; tests the intercept (t, k-2 df).
    Asymmetry is NOT proof of publication bias; low power with k<10; inflated false positives for some effect measures (e.g. log OR)."""
    y, v = S._validate(y, v); k = len(y)
    if k < 3: raise ValueError("Need at least 3 studies.")
    se = np.sqrt(v); X = np.column_stack([np.ones(k), 1 / se]); z = y / se
    beta, *_ = np.linalg.lstsq(X, z, rcond=None); res = z - X @ beta
    s2 = (res @ res) / (k - 2); cov = s2 * np.linalg.inv(X.T @ X)
    t = beta[0] / math.sqrt(cov[0, 0])
    out = dict(intercept=float(beta[0]), se=float(math.sqrt(cov[0, 0])), t=float(t), df=k - 2, p=float(2 * stats.t.sf(abs(t), k - 2)), k=k)
    if k < 10: out["warning"] = "k < 10: the test has very low power; do not interpret a non-significant result as no asymmetry."
    return out


def begg_test(y, v):
    """Begg & Mazumdar rank correlation (Kendall tau between standardised effects and variances), normal approximation."""
    y, v = S._validate(y, v); w = 1 / v; mu = (w * y).sum() / w.sum()
    ystar = (y - mu) / np.sqrt(v - 1 / w.sum())
    ties = len(set(np.round(ystar, 12))) < len(ystar) or len(set(v)) < len(v)
    tau, p = stats.kendalltau(ystar, v, method="asymptotic" if (ties or len(y) >= 50) else "exact")   # R cor.test: exact when n<50 and no ties
    return dict(tau=float(tau), p=float(p), k=len(y))


def cumulative(y, v, order=None, method="REML", hksj=False):
    """Cumulative meta-analysis in the given order (e.g. by year). Row i pools studies 1..i. Order must be pre-specified; it is a
    descriptive tool, not a stopping rule (trial sequential analysis is a different, not-implemented method)."""
    y, v = S._validate(y, v)
    idx = np.arange(len(y)) if order is None else np.asarray(order)
    rows = []
    for i in range(1, len(y) + 1):
        ii = idx[:i]
        if i == 1:
            se = math.sqrt(v[ii[0]]); rows.append(dict(i=1, est=float(y[ii[0]]), se=se, ci=(y[ii[0]] - 1.959964 * se, y[ii[0]] + 1.959964 * se), tau2=0.0, I2_tau=0.0))
        else:
            r = S.meta_analyze(y[ii], v[ii], "random", method, hksj); rows.append(dict(i=i, est=r.est, se=r.se, ci=r.ci, tau2=r.tau2, I2_tau=r.I2_tau))
    return rows


# --------------------------------------------------- tau^2 uncertainty + influence
def tau2_ci_qprofile(y, v, level=0.95, tol=1e-10):
    """Q-profile (generalised-Q) confidence interval for tau^2 (Viechtbauer 2007; recommended by Veroniki 2016) and implied I^2, H^2 limits.
    Uses Q(tau2)=sum w_i (y_i - mu_w)^2 with w=1/(v+tau2). Lower/upper bounds are truncated at 0. Estimator-independent."""
    y, v = S._validate(y, v); k = len(y)
    def Q(t):
        w = 1 / (v + t); mu = (w * y).sum() / w.sum(); return float((w * (y - mu) ** 2).sum())
    q_small, q_large = stats.chi2.ppf([(1 - level) / 2, 1 - (1 - level) / 2], k - 1)   # Q decreases with tau2
    def solve(target):
        if Q(0.0) <= target: return 0.0
        hi = max(1.0, float(np.var(y)) * 10)
        n = 0
        while Q(hi) > target and n < 100: hi *= 2; n += 1
        if n >= 100: raise S.ConvergenceError("Q-profile bracket failed.")
        return float(optimize.brentq(lambda t: Q(t) - target, 0.0, hi, xtol=tol))
    lo, hi = solve(q_large), solve(q_small)      # lower bound: Q = upper chi2 quantile; upper bound: Q = lower chi2 quantile
    vt = S._typical_v(v, np.ones((k, 1)))
    f = lambda t: (100 * t / (t + vt), (t + vt) / vt)
    return dict(tau2=(lo, hi), I2=(f(lo)[0], f(hi)[0]), H2=(f(lo)[1], f(hi)[1]))


def influence_diagnostics(y, v, method="REML"):
    """Leave-one-out diagnostics for a random-effects model: externally studentised residual, Cook's distance, hat value (RE weight share), tau2 without i.
    Flags are prompts for investigation, NOT a rule for removing studies."""
    y, v = S._validate(y, v); k = len(y)
    full = S.meta_analyze(y, v, "random", method)
    w = 1 / (v + full.tau2); hat = w / w.sum(); rows = []
    for i in range(k):
        m = np.ones(k, bool); m[i] = False
        r = S.meta_analyze(y[m], v[m], "random", method)
        rs = (y[i] - r.est) / math.sqrt(v[i] + r.tau2 + r.se**2)
        rows.append(dict(i=i, rstudent=rs, cook=(full.est - r.est) ** 2 / full.se**2, hat=hat[i], weight_pct=100 * hat[i], tau2_del=r.tau2))
    return rows


# ------------------------------------------------ multilevel + robust (CR1)
def _mv_blocks(cluster):
    cl = np.asarray(cluster); labels = sorted(set(cl.tolist())); return [np.flatnonzero(cl == l) for l in labels]


def _mv_sigma(v, blocks, s2c, s2e):
    n = len(v); Sg = np.diag(v + s2e)
    for ix in blocks: Sg[np.ix_(ix, ix)] += s2c
    return Sg


def multilevel_meta(y, v, cluster, X=None):
    """Three-level random-effects model by REML: y_ij = mu + u_j (cluster, var s2_c) + e_ij (effect within cluster, var s2_e) + sampling error (known v).
    Equivalent to metafor rma.mv(yi, vi, random = ~ 1 | cluster/effect). Handles dependence among effects from the same study/lab/site IF the sampling-error
    covariances within clusters are negligible or modelled separately (v is treated as diagonal: NOT appropriate for shared-control comparisons without a V matrix).
    Optimisation: multi-start L-BFGS-B on the restricted log-likelihood; non-convergence raises."""
    y, v = S._validate(y, v); n = len(y); X = np.ones((n, 1)) if X is None else np.asarray(X, float); p = X.shape[1]
    blocks = _mv_blocks(cluster); k_cl = len(blocks)
    if k_cl < 2: raise ValueError("Need at least 2 clusters.")
    def negll(par):
        Sg = _mv_sigma(v, blocks, par[0], par[1])
        try: L = np.linalg.cholesky(Sg)
        except np.linalg.LinAlgError: return 1e10
        Si_X = np.linalg.solve(Sg, X); A = X.T @ Si_X; beta = np.linalg.solve(A, X.T @ np.linalg.solve(Sg, y)); r = y - X @ beta
        return 0.5 * (2 * np.log(np.diag(L)).sum() + np.linalg.slogdet(A)[1] + r @ np.linalg.solve(Sg, r))
    scale = float(np.mean(v)); best = None
    for start in ([0.5, 0.5], [0.05, 0.5], [0.5, 0.05], [2.0, 2.0], [0.01, 0.01]):
        res = optimize.minimize(negll, np.array(start) * scale, method="L-BFGS-B", bounds=[(0, None), (0, None)], options=dict(ftol=1e-14, gtol=1e-10, maxiter=500))
        if best is None or res.fun < best.fun - 1e-10: best = res
    if not best.success and best.status not in (0, 2): raise S.ConvergenceError("Multilevel REML did not converge: " + str(best.message))
    s2c, s2e = (float(x) for x in best.x)
    Sg = _mv_sigma(v, blocks, s2c, s2e); A = X.T @ np.linalg.solve(Sg, X); beta = np.linalg.solve(A, X.T @ np.linalg.solve(Sg, y))
    L = np.linalg.cholesky(Sg); r = y - X @ beta
    ll = (-0.5 * (n - p) * math.log(2 * math.pi) + 0.5 * np.linalg.slogdet(X.T @ X)[1] - np.log(np.diag(L)).sum() - 0.5 * np.linalg.slogdet(A)[1] - 0.5 * r @ np.linalg.solve(Sg, r))
    vb = np.linalg.inv(A)
    return dict(sigma2_cluster=s2c, sigma2_effect=s2e, beta=beta, se=np.sqrt(np.diag(vb)), loglik_reml=float(ll), n=n, clusters=k_cl, X=X, Sigma=Sg, resid=r, blocks=blocks,
                warning="Few clusters (<~10): variance components and inference are unreliable." if k_cl < 10 else "")


def robust_cr1(fit):
    """Cluster-robust (CR1-type) variance for a multilevel fit, as metafor::robust(x, cluster, clubSandwich=FALSE): sandwich with working weights Sigma^-1,
    t reference with (clusters - p) df. NOT the CR2/Satterthwaite small-sample correction (clubSandwich) - with few clusters CR1 can be anti-conservative."""
    X, Sg, r, blocks = fit["X"], fit["Sigma"], fit["resid"], fit["blocks"]; n, p = X.shape; m = len(blocks)
    A = X.T @ np.linalg.solve(Sg, X); Ai = np.linalg.inv(A); meat = np.zeros((p, p))
    for ix in blocks:
        Sj = np.linalg.solve(Sg[np.ix_(ix, ix)], np.eye(len(ix))); Xj = X[ix]; rj = r[ix]
        u = Xj.T @ Sj @ rj; meat += np.outer(u, u)
    c = m / (m - p) * (n - 1) / (n - p) if False else m / (m - p)
    V = Ai @ meat @ Ai * c; se = np.sqrt(np.diag(V)); df = m - p; t = fit["beta"] / se; crit = stats.t.ppf(0.975, df)
    return dict(se=se, df=df, t=t, p=2 * stats.t.sf(abs(t), df), ci=(fit["beta"] - crit * se, fit["beta"] + crit * se))
