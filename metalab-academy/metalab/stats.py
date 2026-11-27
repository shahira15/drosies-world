"""Effect sizes and meta-analysis estimators.

Formulas follow Borenstein et al. (2009) Introduction to Meta-Analysis,
Cochrane Handbook ch. 6/10, and Viechtbauer (2005, 2010) for tau^2 estimators.
Validated by tests/test_stats.py (see TESTING_REPORT.md for what is and is
not independently validated).
"""
from __future__ import annotations
import math
from dataclasses import dataclass, field
import numpy as np
from scipy import stats, optimize


# ---------------------------------------------------------------- effect sizes
def mean_difference(m1, sd1, n1, m2, sd2, n2):
    """Raw MD (group1 - group2) and sampling variance (unequal variances)."""
    _pos(n1, n2); _nonneg(sd1, sd2)
    return m1 - m2, sd1**2 / n1 + sd2**2 / n2


def hedges_j(df):
    """Exact small-sample correction (Hedges 1981): J = Gamma(df/2) / (sqrt(df/2) * Gamma((df-1)/2)).
    The common approximation 1 - 3/(4*df - 1) is accurate for df >~ 20 but off by ~1% at df = 2."""
    if df < 2:
        raise ValueError("Need df = n1 + n2 - 2 >= 2 for the small-sample correction.")
    return math.exp(math.lgamma(df / 2) - math.lgamma((df - 1) / 2)) / math.sqrt(df / 2)


def hedges_j_approx(df):
    return 1 - 3 / (4 * df - 1)


def smd(m1, sd1, n1, m2, sd2, n2, hedges=True, vtype="LS"):
    """Standardised mean difference (pooled SD). Returns (d_or_g, variance, J).

    d = (m1-m2)/Sp ; g = J*d with exact Hedges (1981) J.
    Variance (two published large-sample approximations; they differ by up to ~8% at tiny n):
      vtype="LS" (Hedges & Olkin 1985; metafor default):  (n1+n2)/(n1 n2) + es^2/(2(n1+n2)),  es = g (or d)
      vtype="borenstein" (Borenstein et al. 2009):         J^2 * [(n1+n2)/(n1 n2) + d^2/(2(n1+n2))]
    """
    _pos(n1, n2); _nonneg(sd1, sd2)
    if vtype not in ("LS", "borenstein"):
        raise ValueError("vtype must be 'LS' or 'borenstein'")
    df = n1 + n2 - 2
    sp = math.sqrt(((n1 - 1) * sd1**2 + (n2 - 1) * sd2**2) / df)
    if sp == 0:
        raise ValueError("Pooled SD is zero; SMD undefined.")
    d = (m1 - m2) / sp
    base = (n1 + n2) / (n1 * n2)
    if not hedges:
        return d, base + d**2 / (2 * (n1 + n2)), 1.0
    j = hedges_j(df)
    g = j * d
    v = base + g**2 / (2 * (n1 + n2)) if vtype == "LS" else j**2 * (base + d**2 / (2 * (n1 + n2)))
    return g, v, j


def log_response_ratio(m1, sd1, n1, m2, sd2, n2):
    """lnRR = ln(m1/m2); Var = sd1^2/(n1 m1^2) + sd2^2/(n2 m2^2) (Hedges 1999).
    Requires both means strictly positive and on a ratio scale."""
    _pos(n1, n2); _nonneg(sd1, sd2)
    if m1 <= 0 or m2 <= 0:
        raise ValueError("lnRR requires strictly positive means (ratio-scale data).")
    return math.log(m1 / m2), sd1**2 / (n1 * m1**2) + sd2**2 / (n2 * m2**2)


def _bin(a, n1, c, n2, cc):
    if min(n1, n2) <= 0 or a < 0 or c < 0 or a > n1 or c > n2:
        raise ValueError("Invalid event counts / sample sizes.")
    b, d = n1 - a, n2 - c
    if cc and 0 in (a, b, c, d):
        a, b, c, d = a + cc, b + cc, c + cc, d + cc
    if 0 in (a, b, c, d):
        raise ValueError("Zero cell: apply a continuity correction or use a rare-event method.")
    return a, b, c, d


def log_risk_ratio(a, n1, c, n2, cc=0.0):
    """ln RR with Var = 1/a - 1/n1 + 1/c - 1/n2. cc added to all cells if any is 0."""
    a, b, c, d = _bin(a, n1, c, n2, cc)
    n1, n2 = a + b, c + d
    return math.log((a / n1) / (c / n2)), 1/a - 1/n1 + 1/c - 1/n2


def log_odds_ratio(a, n1, c, n2, cc=0.0):
    """ln OR with Var = 1/a + 1/b + 1/c + 1/d."""
    a, b, c, d = _bin(a, n1, c, n2, cc)
    return math.log((a * d) / (b * c)), 1/a + 1/b + 1/c + 1/d


def risk_difference(a, n1, c, n2, cc=0.0):
    """RD with Var = p1(1-p1)/n1 + p2(1-p2)/n2. If cc>0 it is added to all four
    cells of a table that has a zero cell (n1, n2 grow by 2*cc), as metafor does."""
    a, b, c, d = _bin(a, n1, c, n2, cc)
    n1, n2 = a + b, c + d
    p1, p2 = a / n1, c / n2
    return p1 - p2, p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2


def fisher_z(r, n):
    """Fisher z = atanh(r), Var = 1/(n-3)."""
    if not -1 < r < 1:
        raise ValueError("|r| must be < 1.")
    if n <= 3:
        raise ValueError("n must be > 3.")
    return math.atanh(r), 1 / (n - 3)


def sd_from_se(se, n):
    _pos(n); return se * math.sqrt(n)


def se_from_sd(sd, n):
    _pos(n); return sd / math.sqrt(n)


def se_from_ci(lower, upper, n=None, level=0.95):
    """SE from a CI. Normal approx unless n (<=100 suggested) given -> t with n-1 df.
    Only valid for symmetric CIs on the analysis scale (log first for ratios)."""
    if upper <= lower:
        raise ValueError("upper must exceed lower.")
    crit = stats.t.ppf(1 - (1 - level) / 2, n - 1) if n else stats.norm.ppf(1 - (1 - level) / 2)
    return (upper - lower) / (2 * crit)


def se_from_p(estimate, p, df=None):
    """SE from an estimate and its EXACT two-sided p-value: SE = |estimate| / z (or t with df). Invalid for inequalities ('p<0.05'), rounded
    p-values near 0/1, one-sided tests, or tests that are not a Wald/t test of that estimate. Treat results as estimated (label them)."""
    if not 0 < p < 1: raise ValueError("p must be strictly between 0 and 1 (an exact two-sided p-value).")
    if estimate == 0: raise ValueError("SE cannot be recovered when the estimate is 0.")
    q = stats.t.isf(p / 2, df) if df else stats.norm.isf(p / 2)
    return abs(estimate) / q


def combine_groups(n1, m1, sd1, n2, m2, sd2):
    """Combine two groups into one (Cochrane Handbook Table 6.5.a)."""
    _pos(n1, n2)
    n = n1 + n2
    m = (n1 * m1 + n2 * m2) / n
    ss = (n1 - 1) * sd1**2 + (n2 - 1) * sd2**2 + n1 * n2 / n * (m1 - m2) ** 2
    return n, m, math.sqrt(ss / (n - 1))


def _pos(*xs):
    for x in xs:
        if not x > 0:
            raise ValueError("Sample sizes must be positive.")


def _nonneg(*xs):
    for x in xs:
        if x < 0:
            raise ValueError("SD cannot be negative.")


# ------------------------------------------------------------- meta-analysis
class ConvergenceError(RuntimeError):
    """Raised when a tau^2 estimator cannot be bracketed/solved. Never silently ignored."""


@dataclass
class MetaResult:
    k: int
    model: str
    method: str
    est: float
    se: float
    ci: tuple
    z: float
    p: float
    tau2: float
    I2: float            # Q-based (Higgins & Thompson 2002): max(0,(Q-df)/Q)
    H2: float            # Q/df
    Q: float
    Q_df: int
    Q_p: float
    weights: np.ndarray = field(repr=False, default=None)  # percent
    pred_int: tuple | None = None
    hksj: bool = False
    notes: list = field(default_factory=list)
    I2_tau: float = 0.0  # tau^2-based, as printed by metafor: tau2/(tau2+s2)
    H2_tau: float = 1.0
    pi_method: str = "riley"


def _design(X, k):
    X = np.ones((k, 1)) if X is None else np.asarray(X, float)
    if X.ndim != 2 or X.shape[0] != k:
        raise ValueError("Design matrix must be k x p.")
    return X


def _wls(y, v, X, tau2):
    w = 1 / (v + tau2)
    A = X.T @ (w[:, None] * X)
    Ainv = np.linalg.inv(A)
    beta = Ainv @ (X.T @ (w * y))
    return w, beta, Ainv


def _scale(y, v):
    """Scale so mean(v)=1 (tau2 scales identically) - makes root finding scale-free."""
    c = 1.0 / math.sqrt(float(np.mean(v)))
    return y * c, v * c * c, c


def _reml_score(t, y, v, X):
    w, beta, Ainv = _wls(y, v, X, t)
    r = y - X @ beta
    h = np.einsum("ij,jk,ik->i", X, Ainv, X)
    return -0.5 * (np.sum(w) - np.sum(w**2 * h)) + 0.5 * np.sum((w * r) ** 2)


def _q_resid(t, y, v, X):
    w, beta, _ = _wls(y, v, X, t)
    return float(np.sum(w * (y - X @ beta) ** 2))


def _bracket(f, hi0, maxdoub=80):
    """f(0)>0 assumed. Find hi with f(hi)<=0 by doubling."""
    hi = hi0
    for _ in range(maxdoub):
        if f(hi) <= 0:
            return hi
        hi *= 2
    raise ConvergenceError("Could not bracket the tau^2 root (likelihood/estimating equation does not turn over).")


def tau2_estimate(y, v, method="REML", X=None):
    y = np.asarray(y, float); v = np.asarray(v, float)
    k = len(y); X = _design(X, k); pcol = X.shape[1]
    if k - pcol < 1:
        raise ValueError("Need more studies than model coefficients.")
    ys, vs, c = _scale(y, v)
    if method == "DL":
        w = 1 / vs
        A = X.T @ (w[:, None] * X)
        beta = np.linalg.solve(A, X.T @ (w * ys))
        QE = float(np.sum(w * (ys - X @ beta) ** 2))
        trP = float(np.sum(w) - np.trace(np.linalg.solve(A, X.T @ ((w**2)[:, None] * X))))
        t = max(0.0, (QE - (k - pcol)) / trP)
    elif method == "PM":
        f = lambda t: _q_resid(t, ys, vs, X) - (k - pcol)
        if f(0.0) <= 0:
            t = 0.0
        else:
            t = float(optimize.brentq(f, 0.0, _bracket(f, 1.0), xtol=1e-14, rtol=1e-13, maxiter=500))
    elif method == "REML":
        f = lambda t: _reml_score(t, ys, vs, X)
        if f(0.0) <= 0:
            t = 0.0
        else:
            t = float(optimize.brentq(f, 0.0, _bracket(f, 1.0), xtol=1e-14, rtol=1e-13, maxiter=500))
    else:
        raise ValueError(f"Unknown tau^2 estimator: {method}")
    return t / (c * c)


def tau2_dl(y, v): return tau2_estimate(y, v, "DL")
def tau2_pm(y, v, tol=None): return tau2_estimate(y, v, "PM")
def tau2_reml(y, v, tol=None): return tau2_estimate(y, v, "REML")


TAU2 = {"DL": tau2_dl, "PM": tau2_pm, "REML": tau2_reml}


def drop_missing(y, v):
    """Listwise deletion like metafor's na.omit. Returns y, v, kept_idx, dropped_idx.
    The UI/analysis must REPORT dropped studies; this never happens silently."""
    y = np.asarray(y, float); v = np.asarray(v, float)
    ok = np.isfinite(y) & np.isfinite(v)
    return y[ok], v[ok], np.flatnonzero(ok), np.flatnonzero(~ok)


def _validate(y, v):
    y = np.asarray(y, float); v = np.asarray(v, float)
    if y.shape != v.shape or y.ndim != 1:
        raise ValueError("y and v must be 1-D arrays of equal length.")
    if not (np.all(np.isfinite(y)) and np.all(np.isfinite(v))):
        raise ValueError("Missing/non-finite values present: remove them with drop_missing() and report which studies were dropped.")
    if np.any(v <= 0):
        raise ValueError("Sampling variances must be strictly positive (a zero or negative variance is invalid; check the effect-size inputs).")
    return y, v


def _typical_v(v, X):
    w = 1 / v
    A = X.T @ (w[:, None] * X)
    trP = float(np.sum(w) - np.trace(np.linalg.solve(A, X.T @ ((w**2)[:, None] * X))))
    return (len(v) - X.shape[1]) / trP


def meta_analyze(y, v, model="random", method="REML", hksj=False, level=0.95, pi_method="riley"):
    """Pool effect sizes y with sampling variances v (inverse variance).

    model: 'common' (a.k.a. fixed-effect) or 'random'.
    method: tau^2 estimator. REML is the default as a reasonable general choice (Langan 2019), NOT a universally
        optimal one: pre-specify it and check sensitivity to another (e.g. 'PM'). See Lesson 32.
    hksj: Hartung-Knapp-Sidik-Jonkman adjustment (t with k-1 df, q*-scaled variance, NOT truncated at q*<1).
    pi_method: 'riley' -> t_{k-2} (Riley et al. 2011; k>=3); 'metafor' -> z (or t_{k-1} with HKSJ) as metafor::predict.
    """
    y, v = _validate(y, v)
    k = len(y)
    if k < 2:
        raise ValueError("At least 2 studies are needed to pool.")
    notes = []
    X = np.ones((k, 1))
    w0 = 1 / v
    yb0 = np.sum(w0 * y) / np.sum(w0)
    Q = float(np.sum(w0 * (y - yb0) ** 2)); df = k - 1
    Qp = float(stats.chi2.sf(Q, df))
    tau2 = 0.0 if model == "common" else float(tau2_estimate(y, v, method))
    w = 1 / (v + tau2)
    est = float(np.sum(w * y) / np.sum(w))
    se = float(math.sqrt(1 / np.sum(w)))
    alpha = 1 - level
    if hksj and model == "random":
        qstar = float(np.sum(w * (y - est) ** 2) / (k - 1))
        se = float(math.sqrt(qstar / np.sum(w)))
        crit = stats.t.ppf(1 - alpha / 2, k - 1)
        p = float(2 * stats.t.sf(abs(est / se), k - 1)) if se > 0 else float("nan")
        if qstar < 1:
            notes.append("HKSJ q* < 1: the interval is narrower than the Wald interval. Some software truncates q* at 1; this implementation does not (matches metafor's default).")
    else:
        crit = stats.norm.ppf(1 - alpha / 2)
        p = float(2 * stats.norm.sf(abs(est / se))) if se > 0 else float("nan")
    ci = (est - crit * se, est + crit * se)
    if se == 0:
        notes.append("Degenerate: standard error is exactly 0 (e.g. HKSJ with identical effects, q* = 0). Test statistic undefined; do not interpret this interval.")
        zstat, p = float("nan"), float("nan")
    else:
        zstat = est / se
    I2 = max(0.0, (Q - df) / Q) * 100 if Q > 0 else 0.0
    H2 = Q / df
    vt = _typical_v(v, X)
    I2_tau = 100 * tau2 / (tau2 + vt); H2_tau = (tau2 + vt) / vt
    pi = None
    if model == "random":
        if pi_method == "riley":
            if k >= 3:
                tcrit = stats.t.ppf(1 - alpha / 2, k - 2)
                half = tcrit * math.sqrt(tau2 + se**2); pi = (est - half, est + half)
        elif pi_method == "metafor":
            pc = stats.t.ppf(1 - alpha / 2, k - 1) if hksj else stats.norm.ppf(1 - alpha / 2)
            half = pc * math.sqrt(tau2 + se**2); pi = (est - half, est + half)
        else:
            raise ValueError("pi_method must be 'riley' or 'metafor'")
        if k < 5:
            notes.append("Fewer than 5 studies: tau^2 and the prediction interval are very imprecise.")
    wp = 100 * w / w.sum()
    return MetaResult(k, model, method if model == "random" else "IV", est, se, ci,
                      zstat, p, tau2, I2, H2, Q, df, Qp, wp, pi, hksj, notes, I2_tau, H2_tau, pi_method)


def leave_one_out(y, v, **kw):
    y, v = _validate(y, v)
    rows = []
    for i in range(len(y)):
        m = np.ones(len(y), bool); m[i] = False
        r = meta_analyze(y[m], v[m], **kw)
        rows.append((i, r.est, r.ci[0], r.ci[1], r.tau2, r.I2))
    return rows


@dataclass
class RegResult:
    k: int
    names: list
    beta: np.ndarray
    se: np.ndarray
    stat: np.ndarray       # z, or t if hksj
    p: np.ndarray
    ci: np.ndarray         # p x 2
    QM: float
    QM_df: int
    QM_p: float
    QE: float
    QE_df: int
    QE_p: float
    tau2: float
    tau2_total: float      # intercept-only tau^2, same estimator
    R2: float
    I2_tau: float
    H2_tau: float
    hksj: bool
    method: str
    notes: list = field(default_factory=list)


def meta_regression(y, v, X, names=None, method="REML", hksj=False, level=0.95):
    """Mixed-effects meta-regression. X must include an intercept column (first) and
    already-coded moderators (dummy-code categoricals yourself or use design_matrix()).
    Omnibus test QM covers all non-intercept coefficients (metafor's default btt)."""
    y, v = _validate(y, v)
    k = len(y); X = _design(X, k); pcol = X.shape[1]
    if pcol < 2:
        raise ValueError("Meta-regression needs at least one moderator besides the intercept.")
    if k - pcol < 2:
        raise ValueError(f"Only {k} studies for {pcol} coefficients: residual df < 2; model is not estimable/meaningful.")
    notes = []
    if k < 10 * (pcol - 1):
        notes.append(f"{k} studies for {pcol-1} moderator(s): fewer than ~10 studies per moderator -> high risk of spurious/unstable results (Cochrane Handbook guidance).")
    if np.linalg.matrix_rank(X) < pcol:
        raise ValueError("Design matrix is rank-deficient (collinear moderators).")
    tau2 = tau2_estimate(y, v, method, X)
    w, beta, Ainv = _wls(y, v, X, tau2)
    vcov = Ainv
    r = y - X @ beta
    df_res = k - pcol
    alpha = 1 - level
    if hksj:
        s2 = float(np.sum(w * r**2) / df_res)
        vcov = Ainv * s2
        stat = beta / np.sqrt(np.diag(vcov))
        pv = 2 * stats.t.sf(np.abs(stat), df_res)
        crit = stats.t.ppf(1 - alpha / 2, df_res)
    else:
        stat = beta / np.sqrt(np.diag(vcov))
        pv = 2 * stats.norm.sf(np.abs(stat))
        crit = stats.norm.ppf(1 - alpha / 2)
    se = np.sqrt(np.diag(vcov))
    ci = np.column_stack([beta - crit * se, beta + crit * se])
    b = beta[1:]; V = vcov[1:, 1:]; m = len(b)
    qm = float(b @ np.linalg.solve(V, b))
    if hksj:
        QM = qm / m; QMp = float(stats.f.sf(QM, m, df_res))
    else:
        QM = qm; QMp = float(stats.chi2.sf(qm, m))
    # residual heterogeneity with 1/v weights (metafor QE)
    w0 = 1 / v
    b0 = np.linalg.solve(X.T @ (w0[:, None] * X), X.T @ (w0 * y))
    QE = float(np.sum(w0 * (y - X @ b0) ** 2))
    tau2_tot = tau2_estimate(y, v, method, None)
    R2 = max(0.0, 100 * (tau2_tot - tau2) / tau2_tot) if tau2_tot > 0 else 0.0
    vt = _typical_v(v, X)
    return RegResult(k, names or [f"b{i}" for i in range(pcol)], beta, se, stat, pv, ci, QM, m, QMp, QE, df_res,
                     float(stats.chi2.sf(QE, df_res)), tau2, tau2_tot, R2, 100 * tau2 / (tau2 + vt), (tau2 + vt) / vt,
                     hksj, method, notes)


def design_matrix(**moderators):
    """Build X (intercept + moderators). Numeric lists are used as-is; string lists are
    dummy-coded with the alphabetically first level as reference (like R's factor())."""
    cols, names = [], ["intercept"]
    n = None
    for name, vals in moderators.items():
        vals = list(vals); n = len(vals)
        if all(isinstance(x, (int, float, np.integer, np.floating)) for x in vals):
            cols.append(np.asarray(vals, float)); names.append(name)
        else:
            levels = sorted(set(map(str, vals)))
            for lv in levels[1:]:
                cols.append(np.array([1.0 if str(x) == lv else 0.0 for x in vals])); names.append(f"{name}{lv}")
    if n is None:
        raise ValueError("No moderators given.")
    return np.column_stack([np.ones(n)] + cols), names


def subgroup_analysis(y, v, groups, model="random", method="REML", hksj=False):
    """Separate pooled estimates per subgroup (own tau^2) + between-subgroup Q test on the
    subgroup estimates (chi-square, G-1 df). Also returns the common-tau^2 moderator test
    via meta_regression(). A single-study subgroup is reported but cannot estimate tau^2.
    NOTE: a subgroup difference is NOT established by 'significant in one, not in the other'."""
    y, v = _validate(y, v)
    groups = np.asarray([str(g) for g in groups])
    out, est, var = {}, [], []
    for g in sorted(set(groups)):
        i = groups == g
        if i.sum() >= 2:
            r = meta_analyze(y[i], v[i], model, method, hksj)
            out[g] = r; est.append(r.est); var.append(r.se**2)
        else:
            out[g] = dict(k=1, est=float(y[i][0]), se=float(math.sqrt(v[i][0])), note="single study: no pooling/tau^2")
            est.append(float(y[i][0])); var.append(float(v[i][0]))
    est, var = np.array(est), np.array(var)
    wg = 1 / var
    Qb = float(np.sum(wg * (est - np.sum(wg * est) / np.sum(wg)) ** 2))
    G = len(est)
    res = dict(groups=out, Q_between=Qb, Q_between_df=G - 1, Q_between_p=float(stats.chi2.sf(Qb, G - 1)))
    try:
        X, names = design_matrix(group=groups)
        res["moderator_test"] = meta_regression(y, v, X, names, method, hksj)
    except ValueError as e:
        res["moderator_test_error"] = str(e)
    return res


# ----------------------------------------------------------------- simulation
def simulate_sd_vs_se(mu, sigma, ns, reps=2000, seed=1):
    """Return per-n mean sample SD, mean SE and empirical SD of the sample mean."""
    rng = np.random.default_rng(seed)
    out = []
    for n in ns:
        x = rng.normal(mu, sigma, size=(reps, n))
        sd = x.std(axis=1, ddof=1)
        out.append((n, float(sd.mean()), float((sd / math.sqrt(n)).mean()),
                    float(x.mean(axis=1).std(ddof=1))))
    return out


def ci_coverage(mu, sigma, n, reps=2000, level=0.95, seed=1):
    """Fraction of t-based CIs containing mu, plus first 50 intervals for display."""
    rng = np.random.default_rng(seed)
    x = rng.normal(mu, sigma, size=(reps, n))
    m = x.mean(axis=1); se = x.std(axis=1, ddof=1) / math.sqrt(n)
    t = stats.t.ppf(1 - (1 - level) / 2, n - 1)
    lo, hi = m - t * se, m + t * se
    return float(np.mean((lo <= mu) & (mu <= hi))), lo[:50], hi[:50]


# -------------------------------------------------------- reproducible code
def r_code_meta(method="REML", hksj=False):
    test = ', test="knha"' if hksj else ""
    return (f'library(metafor)\n# yi = effect sizes, vi = sampling variances (same scale!)\n'
            f'res <- rma(yi, vi, data=dat, method="{method}"{test})\nsummary(res)\n'
            f'predict(res)   # includes prediction interval\nforest(res)\n')
