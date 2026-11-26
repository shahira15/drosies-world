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


def smd(m1, sd1, n1, m2, sd2, n2, hedges=True):
    """Standardised mean difference (pooled SD). Returns (d_or_g, variance, J).

    d = (m1-m2)/Sp ; J = 1 - 3/(4*df - 1) ; g = J*d
    Var(d) = (n1+n2)/(n1*n2) + d^2/(2(n1+n2)) ; Var(g) = J^2 * Var(d)
    """
    _pos(n1, n2); _nonneg(sd1, sd2)
    df = n1 + n2 - 2
    sp = math.sqrt(((n1 - 1) * sd1**2 + (n2 - 1) * sd2**2) / df)
    if sp == 0:
        raise ValueError("Pooled SD is zero; SMD undefined.")
    d = (m1 - m2) / sp
    v = (n1 + n2) / (n1 * n2) + d**2 / (2 * (n1 + n2))
    if not hedges:
        return d, v, 1.0
    j = 1 - 3 / (4 * df - 1)
    return j * d, j**2 * v, j


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


def risk_difference(a, n1, c, n2):
    _bin(a, n1, c, n2, 0.5)
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
    I2: float
    H2: float
    Q: float
    Q_df: int
    Q_p: float
    weights: np.ndarray = field(repr=False, default=None)  # percent
    pred_int: tuple | None = None
    hksj: bool = False
    notes: list = field(default_factory=list)


def tau2_dl(y, v):
    w = 1 / v
    ybar = np.sum(w * y) / np.sum(w)
    Q = np.sum(w * (y - ybar) ** 2)
    c = np.sum(w) - np.sum(w**2) / np.sum(w)
    return max(0.0, (Q - (len(y) - 1)) / c)


def tau2_pm(y, v, tol=1e-10):
    """Paule-Mandel: tau2 solving Q(tau2) = k-1 (Viechtbauer 2005)."""
    k = len(y)

    def q(t):
        w = 1 / (v + t)
        yb = np.sum(w * y) / np.sum(w)
        return np.sum(w * (y - yb) ** 2) - (k - 1)

    if q(0) <= 0:
        return 0.0
    hi = max(1.0, np.var(y) * 10)
    while q(hi) > 0:
        hi *= 2
    return optimize.brentq(q, 0, hi, xtol=tol)


def tau2_reml(y, v, tol=1e-10):
    """REML via maximising the restricted log-likelihood for the intercept-only model."""
    def negll(t):
        w = 1 / (v + t)
        mu = np.sum(w * y) / np.sum(w)
        return 0.5 * (np.sum(np.log(v + t)) + np.log(np.sum(w)) + np.sum(w * (y - mu) ** 2))

    ub = max(10.0, np.var(y) * 20 + v.max() * 10)
    res = optimize.minimize_scalar(negll, bounds=(0, ub), method="bounded",
                                   options={"xatol": tol})
    return 0.0 if negll(0.0) <= res.fun else float(res.x)


TAU2 = {"DL": tau2_dl, "PM": tau2_pm, "REML": tau2_reml}


def meta_analyze(y, v, model="random", method="REML", hksj=False, level=0.95):
    """Pool effect sizes y with sampling variances v (inverse variance).

    model: 'common' (a.k.a. fixed-effect) or 'random'.
    hksj: Hartung-Knapp-Sidik-Jonkman adjustment (t, k-1 df; Q-based variance).
    Prediction interval (random only): est +/- t_{k-2} sqrt(tau2 + se^2), k>=3.
    """
    y = np.asarray(y, float); v = np.asarray(v, float)
    if y.shape != v.shape or y.ndim != 1:
        raise ValueError("y and v must be 1-D arrays of equal length.")
    k = len(y)
    if k < 2:
        raise ValueError("At least 2 studies are needed to pool.")
    if np.any(v <= 0) or not np.all(np.isfinite(y)) or not np.all(np.isfinite(v)):
        raise ValueError("Variances must be positive and all values finite.")
    notes = []
    w0 = 1 / v
    yb0 = np.sum(w0 * y) / np.sum(w0)
    Q = float(np.sum(w0 * (y - yb0) ** 2)); df = k - 1
    Qp = float(stats.chi2.sf(Q, df))
    tau2 = 0.0 if model == "common" else float(TAU2[method](y, v))
    w = 1 / (v + tau2)
    est = float(np.sum(w * y) / np.sum(w))
    se = float(math.sqrt(1 / np.sum(w)))
    alpha = 1 - level
    if hksj and model == "random":
        qstar = float(np.sum(w * (y - est) ** 2) / (k - 1))
        se = float(math.sqrt(qstar / np.sum(w)))
        crit = stats.t.ppf(1 - alpha / 2, k - 1)
        p = float(2 * stats.t.sf(abs(est / se), k - 1))
        if qstar < 1:
            notes.append("HKSJ q* < 1: some software truncates at 1 (ad hoc correction); not applied here.")
    else:
        crit = stats.norm.ppf(1 - alpha / 2)
        p = float(2 * stats.norm.sf(abs(est / se)))
    ci = (est - crit * se, est + crit * se)
    # I2 and H2 (Higgins & Thompson 2002) from Q; tau2-based version for reference
    I2 = max(0.0, (Q - df) / Q) * 100 if Q > 0 else 0.0
    H2 = Q / df
    pi = None
    if model == "random":
        if k >= 3:
            t = stats.t.ppf(1 - alpha / 2, k - 2)
            half = t * math.sqrt(tau2 + se**2)
            pi = (est - half, est + half)
        if k < 5:
            notes.append("Fewer than 5 studies: tau^2 and the prediction interval are very imprecise.")
    wp = 100 * w / w.sum()
    return MetaResult(k, model, method if model == "random" else "IV", est, se, ci,
                      est / se, p, tau2, I2, H2, Q, df, Qp, wp, pi, hksj, notes)


def leave_one_out(y, v, **kw):
    y = np.asarray(y, float); v = np.asarray(v, float)
    rows = []
    for i in range(len(y)):
        m = np.ones(len(y), bool); m[i] = False
        r = meta_analyze(y[m], v[m], **kw)
        rows.append((i, r.est, r.ci[0], r.ci[1], r.tau2, r.I2))
    return rows


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
