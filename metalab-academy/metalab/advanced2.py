"""Advanced synthesis methods (v0.4). Benchmarked against R (metafor 4.4.0 / clubSandwich 0.5.10 / ape / base R) - see validation/make_reference_v04.R.

Honest scope notes (also in KNOWN_LIMITATIONS.md):
  * Benchmarks check that THIS CODE reproduces established software for the SAME model; they do not prove the model suits your data.
  * Packages that are the field's usual tools for NMA (netmeta), DTA (mada), Bayesian MA (bayesmeta), dose-response (dosresmeta) and selection models
    (metasens/metafor selmodel) could not be installed in the build sandbox, so those methods are benchmarked against metafor rma.mv / independent
    numerical integration, NOT against the dedicated package. Re-run the external workflows in the lessons on your own machine before relying on them.
  * Nothing here is expert-reviewed.
"""
from __future__ import annotations
import math
import numpy as np
from scipy import optimize, stats, special
from . import stats as S


# ======================================================================================================================
# generic REML for  y ~ N(X b, V + sum_k theta_k G_k)
# ======================================================================================================================
def _loglik_reml(y, V, X):
    n, p = X.shape
    L = np.linalg.cholesky(V)
    Vi_X = np.linalg.solve(V, X); A = X.T @ Vi_X
    beta = np.linalg.solve(A, X.T @ np.linalg.solve(V, y)); r = y - X @ beta
    ll = (-0.5 * (n - p) * math.log(2 * math.pi) + 0.5 * np.linalg.slogdet(X.T @ X)[1] - np.log(np.diag(L)).sum()
          - 0.5 * np.linalg.slogdet(A)[1] - 0.5 * r @ np.linalg.solve(V, r))
    return float(ll), beta, np.linalg.inv(A), r


def _check_inputs(y, V, X):
    y = np.asarray(y, float)
    if y.ndim != 1 or len(y) < 3: raise ValueError("y must be a 1-D vector with at least 3 effects.")
    if not np.all(np.isfinite(y)): raise ValueError("Non-finite effect sizes: remove/handle missing values explicitly first.")
    V = np.asarray(V, float)
    if V.ndim == 1: V = np.diag(V)
    if V.shape != (len(y), len(y)): raise ValueError("V must be n or n x n.")
    if not np.all(np.isfinite(V)) or np.any(np.diag(V) <= 0): raise ValueError("Sampling variances must be finite and positive.")
    if not np.allclose(V, V.T, atol=1e-10): raise ValueError("V must be symmetric.")
    X = np.ones((len(y), 1)) if X is None else np.asarray(X, float)
    if X.ndim != 2 or X.shape[0] != len(y): raise ValueError("X must be n x p.")
    if np.linalg.matrix_rank(X) < X.shape[1]: raise ValueError("Design matrix is rank deficient.")
    if len(y) - X.shape[1] < 2: raise ValueError("Too few effects for the number of coefficients.")
    return y, V, X


def reml_varcomp(y, V, X=None, Gs=(), names=None):
    """REML for Sigma = V + sum theta_k G_k, theta_k >= 0 (G_k fixed PSD matrices). Generic engine for multilevel, phylogenetic and CS-type models.
    Multi-start L-BFGS-B; raises ConvergenceError if no start converges. Variance components on the boundary (=0) are reported, not hidden."""
    y, V, X = _check_inputs(y, V, X); Gs = [np.asarray(G, float) for G in Gs]; m = len(Gs); n = len(y)
    for G in Gs:
        if G.shape != (n, n): raise ValueError("Each G must be n x n.")
    names = list(names) if names else [f"theta{i+1}" for i in range(m)]
    def nll(par):
        Sg = V + sum(t * G for t, G in zip(par, Gs))
        try: return -_loglik_reml(y, Sg, X)[0]
        except np.linalg.LinAlgError: return 1e10
    if m == 0: theta = np.zeros(0)
    else:
        scale = float(np.mean(np.diag(V))); best = None
        starts = [np.full(m, 0.5), np.full(m, 0.05), np.full(m, 2.0), np.full(m, 0.01)] + [np.eye(m)[i] * 0.5 + 0.02 for i in range(m)]
        for s in starts:
            res = optimize.minimize(nll, s * scale, method="L-BFGS-B", bounds=[(0, None)] * m, options=dict(ftol=1e-15, gtol=1e-10, maxiter=1000))
            if res.success or res.status == 2:
                if best is None or res.fun < best.fun - 1e-10: best = res
        if best is None: raise S.ConvergenceError("REML did not converge from any starting value.")
        theta = np.maximum(best.x, 0.0)
    Sg = V + sum((t * G for t, G in zip(theta, Gs)), np.zeros((n, n)))
    ll, beta, vb, r = _loglik_reml(y, Sg, X)
    warn = [f"{nm} estimated at the boundary (0): its likelihood is flat/uninformative; do not read this as 'no variance'." for nm, t in zip(names, theta) if t <= 1e-9 * max(1.0, float(np.mean(np.diag(V))))]
    return dict(theta=dict(zip(names, map(float, theta))), beta=beta, vcov=vb, se=np.sqrt(np.diag(vb)), loglik_reml=ll, Sigma=Sg, resid=r, X=X, n=n, warnings=warn)


# ======================================================================================================================
# trim-and-fill (Duval & Tweedie 2000) - metafor algorithm (L0, R0, Q0), WITH warnings
# ======================================================================================================================
TRIMFILL_WARNING = ("Trim-and-fill assumes that asymmetry is caused ONLY by suppression of the smallest/most extreme results; funnel asymmetry can also arise from "
                    "heterogeneity, small-study effects, differences in methodological quality, chance or the effect measure used. It performs poorly under substantial "
                    "heterogeneity and can adjust spuriously. Report it as a sensitivity analysis ('what would the estimate be if...'), never as the corrected true effect.")


def trim_fill(y, v, estimator="L0", side=None, method="REML", maxiter=100):
    y, v = S._validate(y, v); k = len(y)
    if k < 3: raise ValueError("Trim-and-fill needs at least 3 studies; interpretation needs many more (>= ~10).")
    if estimator not in ("L0", "R0", "Q0"): raise ValueError("estimator must be L0, R0 or Q0")
    if side is None:
        X = np.column_stack([np.ones(k), np.sqrt(v)]); t2 = S.tau2_estimate(y, v, method, X); w = 1 / (v + t2)
        slope = np.linalg.solve(X.T @ (w[:, None] * X), X.T @ (w * y))[1]; side = "right" if slope < 0 else "left"
    if side not in ("left", "right"): raise ValueError("side must be 'left' or 'right'")
    yy = -y if side == "right" else y.copy()
    ix = np.argsort(yy, kind="stable"); yy = yy[ix]; vv = v[ix]
    k0 = 0; k0_sav = -1; it = 0
    while abs(k0 - k0_sav) > 0:
        k0_sav = k0; it += 1
        if it > maxiter: raise S.ConvergenceError("Trim-and-fill did not converge.")
        t = slice(0, k - k0); beta = S.meta_analyze(yy[t], vv[t], "random", method).est if (k - k0) >= 2 else float(yy[0])
        yc = yy - beta; rk = stats.rankdata(np.abs(yc), method="ordinal"); rs = np.sign(yc) * rk
        if estimator == "R0":
            neg = rs[rs < 0]; k0f = 0.0 if len(neg) == 0 else (k - np.max(-neg)) - 1
        elif estimator == "L0":
            Sr = rs[rs > 0].sum(); k0f = (4 * Sr - k * (k + 1)) / (2 * k - 1)
        else:
            Sr = rs[rs > 0].sum(); k0f = k - 0.5 - math.sqrt(max(2 * k ** 2 - 4 * Sr + 0.25, 0))
        k0 = int(max(0, round(k0f)))   # numpy/R both round half to even
    centre = (-beta if side == "right" else beta)
    if k0 > 0:
        yo = (-yy if side == "right" else yy); fill_y = 2 * centre - yo[k - k0:]; fill_v = vv[k - k0:]
        y_all = np.concatenate([(-yy if side == "right" else yy), fill_y]); v_all = np.concatenate([vv, fill_v])
    else: y_all = (-yy if side == "right" else yy); v_all = vv
    fit0 = S.meta_analyze(y, v, "random", method); fit1 = S.meta_analyze(y_all, v_all, "random", method)
    notes = [TRIMFILL_WARNING]
    if k < 10: notes.append(f"Only {k} studies: asymmetry tests/adjustments have very low power and are unreliable (<10 studies).")
    if fit0.I2 > 50: notes.append("Substantial heterogeneity (I2 > 50%): trim-and-fill is especially unreliable here.")
    return dict(k0=k0, side=side, estimator=estimator, est=fit1.est, se=fit1.se, ci=fit1.ci, tau2=fit1.tau2, est_unadjusted=fit0.est, ci_unadjusted=fit0.ci,
                filled_y=(y_all[k:] if k0 else np.array([])), filled_v=(v_all[k:] if k0 else np.array([])), y_all=y_all, v_all=v_all, notes=notes)


# ======================================================================================================================
# regression-based small-study adjustment: PET / PEESE (Stanley & Doucouliagos 2014)
# ======================================================================================================================
def _wls(y, X, w):
    W = w[:, None] * X; A = X.T @ W; beta = np.linalg.solve(A, W.T @ y); r = y - X @ beta; df = len(y) - X.shape[1]
    s2 = float(np.sum(w * r ** 2) / df); vb = s2 * np.linalg.inv(A); se = np.sqrt(np.diag(vb)); t = beta / se
    return beta, se, 2 * stats.t.sf(np.abs(t), df), df


def pet_peese(y, v):
    """PET: y = b0 + b1*se (WLS, weights 1/v, multiplicative residual variance as in base R lm). PEESE: y = b0 + b1*v. b0 estimates the effect of a hypothetical
    infinitely precise study. Conditional PET-PEESE (use PEESE if PET intercept is significant) is NOT recommended as a default: both are biased in many
    realistic scenarios (esp. with heterogeneity, few studies, or when the true effect is ~0), so report as sensitivity analyses only."""
    y, v = S._validate(y, v)
    if len(y) < 5: raise ValueError("PET/PEESE need >= 5 studies (>= 10 for any interpretation).")
    w = 1 / v; ones = np.ones(len(y))
    bp, sp, pp, dfp = _wls(y, np.column_stack([ones, np.sqrt(v)]), w); be, se_, pe, dfe = _wls(y, np.column_stack([ones, v]), w)
    return dict(pet=dict(coef=bp, se=sp, p=pp, df=dfp), peese=dict(coef=be, se=se_, p=pe, df=dfe),
                warning="PET/PEESE intercepts are model-dependent extrapolations to zero sampling variance; with heterogeneity or <10 studies treat as exploratory.")


# ======================================================================================================================
# CR2 robust variance estimation with Satterthwaite df (Pustejovsky & Tipton 2018), working model = fitted marginal covariance
# ======================================================================================================================
def _sqrtm_psd(M):
    w, U = np.linalg.eigh((M + M.T) / 2); return (U * np.sqrt(np.clip(w, 0, None))) @ U.T


def _inv_sqrtm_psd(M, tol=1e-10):
    w, U = np.linalg.eigh((M + M.T) / 2); wi = np.where(w > tol * max(w.max(), 1e-300), 1 / np.sqrt(np.clip(w, tol * max(w.max(), 1e-300), None)), 0.0)
    return (U * wi) @ U.T


def robust_cr2(X, y, Sigma, cluster, contrast_index=None):
    """CR2 sandwich with Satterthwaite df for each coefficient. Working covariance Sigma (typically the fitted marginal covariance of a multilevel/ rma.mv model),
    weights W = Sigma_j^{-1}. Few clusters (<~20) is exactly where CR2+Satterthwaite is recommended over CR1/model-based SEs; df < ~4 means p-values are unreliable."""
    X = np.asarray(X, float); y = np.asarray(y, float); n, p = X.shape; cl = np.asarray(cluster)
    if len(cl) != n: raise ValueError("cluster must have one label per effect.")
    labels = list(dict.fromkeys(cl.tolist())); m = len(labels)
    if m < 3: raise ValueError("CR2 needs >= 3 clusters (>= ~10-20 for stable inference).")
    idx = [np.where(cl == lab)[0] for lab in labels]
    Wfull = np.zeros((n, n)); Phi = np.zeros((n, n))
    for ii in idx:
        Phi[np.ix_(ii, ii)] = Sigma[np.ix_(ii, ii)]; Wfull[np.ix_(ii, ii)] = np.linalg.inv(Sigma[np.ix_(ii, ii)])
    M = np.linalg.inv(X.T @ Wfull @ X); beta = M @ X.T @ Wfull @ y; H = X @ M @ X.T @ Wfull; IH = np.eye(n) - H
    Gj = []; meat = np.zeros((p, p)); resid = y - X @ beta
    for ii in idx:
        Phij = Phi[np.ix_(ii, ii)]; D = _sqrtm_psd(Phij)
        Bj = D @ (IH[ii, :] @ Phi @ IH[ii, :].T) @ D.T            # B_j = D_j (I-H)_j Phi (I-H)_j' D_j'   (Pustejovsky & Tipton 2018, eq. for CR2)
        A = D.T @ _inv_sqrtm_psd(Bj) @ D                           # A_j = D_j' B_j^{-1/2} D_j
        Wj = Wfull[np.ix_(ii, ii)]; Xj = X[ii]
        u = Xj.T @ Wj @ A @ resid[ii]; meat += np.outer(u, u)
        Gj.append((ii, A, Wj, Xj))
    V = M @ meat @ M
    se = np.sqrt(np.diag(V)); dfs = np.zeros(p)
    for c in range(p):
        cvec = M[:, c]                                              # M e_c
        g = []
        for ii, A, Wj, Xj in Gj:
            gj = IH[ii, :].T @ (A @ (Wj @ (Xj @ cvec)))              # n-vector
            g.append(gj)
        Pm = np.array([[gi @ Phi @ gk for gk in g] for gi in g])
        dfs[c] = np.trace(Pm) ** 2 / np.sum(Pm ** 2)
    t = beta / se; pv = 2 * stats.t.sf(np.abs(t), dfs)
    warn = []
    if m < 10: warn.append(f"Only {m} clusters: even CR2 can be unreliable; report df and treat as exploratory.")
    if np.any(dfs < 4): warn.append("Satterthwaite df < 4 for at least one coefficient: p-values and CIs are not trustworthy (low-leverage-information moderators).")
    return dict(beta=beta, se=se, t=t, df=dfs, p=pv, vcov=V, clusters=m, warnings=warn)


def multilevel_cr2(y, v, cluster, school=None, X=None):
    """Convenience: three-level REML fit (advanced.multilevel_meta) + CR2 by cluster."""
    from . import advanced as A
    fit = A.multilevel_meta(y, v, cluster, X)
    out = robust_cr2(fit["X"], np.asarray(y, float), fit["Sigma"], cluster)
    out["fit"] = fit; return out


# ======================================================================================================================
# multivariate / bivariate meta-analysis with unstructured between-study covariance (+ DTA wrapper)
# ======================================================================================================================
def multivariate_meta(y, V_blocks, outcome, study, n_outcomes=None, X=None):
    """Unstructured multivariate REML (metafor rma.mv(struct='UN')). y: stacked effects; outcome: integer 0..p-1; study: study label per row; V_blocks: dict
    study label -> within-study covariance matrix of that study's rows (in row order). Studies may report subsets of outcomes. X default: one mean per outcome."""
    y = np.asarray(y, float); outcome = np.asarray(outcome, int); study = np.asarray(study); n = len(y)
    p = int(outcome.max()) + 1 if n_outcomes is None else int(n_outcomes)
    if not np.all(np.isfinite(y)): raise ValueError("Non-finite effects.")
    labels = list(dict.fromkeys(study.tolist())); V = np.zeros((n, n)); blocks = {}
    for lab in labels:
        ii = np.where(study == lab)[0]; B = np.asarray(V_blocks[lab], float)
        if B.shape != (len(ii), len(ii)): raise ValueError(f"V block for study {lab} has wrong shape.")
        if len(set(outcome[ii])) != len(ii): raise ValueError("Duplicate outcome within a study: not supported.")
        V[np.ix_(ii, ii)] = B; blocks[lab] = ii
    if X is None:
        X = np.zeros((n, p)); X[np.arange(n), outcome] = 1.0
    if len(labels) < 5: warn_k = [f"Only {len(labels)} studies: between-study covariance is poorly estimable."]
    else: warn_k = []
    if n - X.shape[1] < 2: raise ValueError("Too few effects.")
    ntri = p * (p + 1) // 2; tril = np.tril_indices(p)
    def T_from(par):
        L = np.zeros((p, p)); L[tril] = par; return L @ L.T
    def Sigma_of(T):
        Sg = V.copy()
        for lab, ii in blocks.items(): oo = outcome[ii]; Sg[np.ix_(ii, ii)] += T[np.ix_(oo, oo)]
        return Sg
    def nll(par):
        try: return -_loglik_reml(y, Sigma_of(T_from(par)), X)[0]
        except np.linalg.LinAlgError: return 1e10
    sc = math.sqrt(float(np.mean(np.diag(V)))); best = None
    for s0 in (0.5, 0.1, 1.0, 2.0):
        init = np.zeros(p * (p + 1) // 2); init[[i for i, (a, b) in enumerate(zip(*tril)) if a == b]] = s0 * sc
        for opt in ("BFGS", "Nelder-Mead"):
            res = optimize.minimize(nll, init, method=opt, options=(dict(gtol=1e-9, maxiter=2000) if opt == "BFGS" else dict(xatol=1e-9, fatol=1e-12, maxiter=20000)))
            if best is None or res.fun < best.fun - 1e-10: best = res
            if opt == "BFGS" and res.success: break
    if not np.isfinite(best.fun) or best.fun >= 1e9: raise S.ConvergenceError("Multivariate REML did not converge.")
    T = T_from(best.x); ll, beta, vb, r = _loglik_reml(y, Sigma_of(T), X)
    tau2 = np.diag(T); sd = np.sqrt(np.clip(tau2, 1e-300, None)); R = T / np.outer(sd, sd)
    warn = list(warn_k)
    if p > 1 and np.any(np.abs(R[np.triu_indices(p, 1)]) > 0.99): warn.append("Between-study correlation at/near +-1: the likelihood is flat there, the estimate is on the boundary and its SE/CI are unreliable (typical with few studies).")
    if np.any(tau2 < 1e-8): warn.append("A between-study variance is at zero: its correlations are undefined.")
    return dict(beta=beta, se=np.sqrt(np.diag(vb)), vcov=vb, tau2=tau2, rho=(R[0, 1] if p == 2 else R), T=T, loglik_reml=ll, studies=len(labels), warnings=warn)


def dta_bivariate(tp, fn, fp, tn, cc=0.5):
    """Reitsma/bivariate model for diagnostic test accuracy: logit(sens), logit(spec) with unstructured between-study covariance (metafor rma.mv equivalent of
    mada::reitsma / Reitsma 2005). Continuity correction cc added to ALL cells of ALL studies (cc=0.5), same as the reference benchmark. Summary points only;
    hierarchical SROC curves and the HSROC parametrisation are NOT implemented (use mada/ HSROC externally)."""
    tp, fn, fp, tn = (np.asarray(a, float) for a in (tp, fn, fp, tn))
    if not (tp.shape == fn.shape == fp.shape == tn.shape): raise ValueError("Cell vectors must have equal length.")
    if np.any(np.array([tp, fn, fp, tn]) < 0): raise ValueError("Counts must be non-negative.")
    K = len(tp)
    if np.any((tp + fn) == 0) or np.any((tn + fp) == 0): raise ValueError("A study with no diseased or no non-diseased participants cannot contribute.")
    sens = (tp + cc) / (tp + fn + 2 * cc); spec = (tn + cc) / (tn + fp + 2 * cc)
    yi = np.concatenate([special.logit(sens), special.logit(spec)])
    vi = np.concatenate([1 / (tp + cc) + 1 / (fn + cc), 1 / (tn + cc) + 1 / (fp + cc)])
    outcome = np.repeat([0, 1], K); study = np.tile(np.arange(K), 2)
    # reorder study-major as in the reference (rows sorted by study then outcome)
    order = np.lexsort((outcome, study)); yi, vi, outcome, study = yi[order], vi[order], outcome[order], study[order]
    blocks = {s: np.diag(vi[study == s]) for s in range(K)}
    fit = multivariate_meta(yi, blocks, outcome, study, 2)
    b, vb = fit["beta"], fit["vcov"]; z = stats.norm.ppf(0.975)
    ci = lambda i: (float(special.expit(b[i] - z * math.sqrt(vb[i, i]))), float(special.expit(b[i] + z * math.sqrt(vb[i, i]))))
    dor = math.exp(b[0] + b[1]); sens_s, spec_s = float(special.expit(b[0])), float(special.expit(b[1]))
    out = dict(fit); out.update(sens=sens_s, spec=spec_s, sens_ci=ci(0), spec_ci=ci(1), dor=dor, lr_pos=sens_s / (1 - spec_s), lr_neg=(1 - sens_s) / spec_s)
    out["warnings"] = list(fit["warnings"]) + ["Summary sensitivity/specificity depend on the threshold(s) used across studies; heterogeneity in threshold shows as negative correlation. Pooled estimates apply to a 'typical' study, not to a specific clinical setting."]
    return out


# ======================================================================================================================
# network meta-analysis (contrast-based, arm-level input; common- and random-effects with common tau^2; multi-arm correlations handled)
# ======================================================================================================================
def nma_contrasts(study, treat, y, v, reference=None):
    """Build the contrast data set from arm-level (y, v) (independent arms). Baseline = first listed arm of each study. Multi-arm studies: shared-baseline
    covariance v_baseline for every pair of comparisons. Returns y_c, V (block-diagonal), X (basic parameters d_{reference->t}), comparison index, study index."""
    study = np.asarray(study); treat = np.asarray(treat).astype(str); y = np.asarray(y, float); v = np.asarray(v, float)
    if not (len(study) == len(treat) == len(y) == len(v)): raise ValueError("Arm vectors must have equal length.")
    if np.any(v <= 0) or not np.all(np.isfinite(v)) or not np.all(np.isfinite(y)): raise ValueError("Arm effects/variances must be finite, variances > 0.")
    trts = list(dict.fromkeys(treat.tolist()))
    if reference is None: reference = trts[0]
    if reference not in trts: raise ValueError("reference treatment not in data")
    trts = [reference] + [t for t in trts if t != reference]; col = {t: i - 1 for i, t in enumerate(trts) if i > 0}
    rows_y, rows_X, comp, sidx, Vblocks = [], [], [], [], []
    for s in dict.fromkeys(study.tolist()):
        ii = np.where(study == s)[0]
        if len(set(treat[ii])) != len(ii): raise ValueError(f"Study {s}: a treatment appears twice (merge arms first).")
        if len(ii) < 2: continue
        b = ii[0]; oth = ii[1:]; m = len(oth); Vs = np.full((m, m), v[b]); Vs[np.diag_indices(m)] += v[oth]
        for j, a in enumerate(oth):
            x = np.zeros(len(trts) - 1)
            if treat[a] != reference: x[col[treat[a]]] += 1
            if treat[b] != reference: x[col[treat[b]]] -= 1
            rows_y.append(y[a] - y[b]); rows_X.append(x); comp.append(j); sidx.append(s)
        Vblocks.append(Vs)
    if not rows_y: raise ValueError("No study with >= 2 arms.")
    n = len(rows_y); V = np.zeros((n, n)); o = 0
    for Vb in Vblocks: m = len(Vb); V[o:o + m, o:o + m] = Vb; o += m
    return np.array(rows_y), V, np.array(rows_X), np.array(comp), np.array(sidx, dtype=object), trts


def _network_connected(X, sidx_unused=None):
    return np.linalg.matrix_rank(X) == X.shape[1]


def nma(study, treat, y, v, reference=None, model="random", *, higher_is_better):
    """Frequentist contrast-based NMA. model 'common' or 'random' (REML, ONE common tau^2; within multi-arm studies tau^2/2 covariance).
    higher_is_better (REQUIRED, no default: the ranking direction is a substantive decision) states whether larger effects favour the treatment (e.g. cessation OR) or smaller ones (e.g. mortality OR).
    Returns basic parameters, full league table (all pairwise contrasts with SE), P-scores (Rucker & Schwarzer 2015), and global heterogeneity Q.
    NOT implemented: node-splitting / design-by-treatment inconsistency tests, component NMA, meta-regression, class effects -> use netmeta/gemtc externally
    (lesson 'Network meta-analysis' gives the R workflow). Consistency is ASSUMED, not tested, by this function."""
    yc, V, X, comp, sidx, trts = nma_contrasts(study, treat, y, v, reference)
    if not _network_connected(X): raise ValueError("The treatment network is disconnected: effects between disconnected components are not estimable.")
    n, p = X.shape
    if model == "common":
        ll, beta, vb, r = _loglik_reml(yc, V, X); tau2 = 0.0; Sg = V
        Qe = float(r @ np.linalg.solve(V, r)); warn = []
    elif model == "random":
        # G: comparisons in the same study covary tau2/2, variance tau2 -> (I + J)/2 within each study
        G = np.zeros((n, n))
        for s in dict.fromkeys(sidx.tolist()):
            ii = np.where(sidx == s)[0]; G[np.ix_(ii, ii)] = 0.5 * (np.ones((len(ii), len(ii))) + np.eye(len(ii)))
        fit = reml_varcomp(yc, V, X, [G], ["tau2"]); beta, vb, tau2, Sg = fit["beta"], fit["vcov"], fit["theta"]["tau2"], fit["Sigma"]; warn = fit["warnings"]
        Vcf = V; r0 = yc - X @ np.linalg.solve(X.T @ np.linalg.solve(V, X), X.T @ np.linalg.solve(V, yc)); Qe = float(r0 @ np.linalg.solve(V, r0))
    else: raise ValueError("model must be 'common' or 'random'")
    df_Q = n - p
    nt = len(trts); D = np.zeros((nt, p)); D[1:, :] = np.eye(p)            # d_t = D beta (reference = 0)
    d = D @ beta; Vd = D @ vb @ D.T; se_pair = np.sqrt(np.maximum(np.diag(Vd)[:, None] + np.diag(Vd)[None, :] - 2 * Vd, 0))
    diff = d[:, None] - d[None, :]            # diff[i,j] = d_i - d_j  (effect of i vs j)
    with np.errstate(all="ignore"):
        zz = diff / se_pair
        Pij = stats.norm.cdf(zz if higher_is_better else -zz)
    np.fill_diagonal(Pij, np.nan); pscore = np.nanmean(Pij, axis=1)
    warn = list(warn) + ["Consistency (transitivity) is assumed and NOT tested here: compare patient/study characteristics across comparisons and run node-splitting/design-by-treatment tests in netmeta before interpreting rankings.",
                         "P-scores/SUCRA rank on point estimates and uncertainty only; they ignore certainty of evidence (use CINeMA/GRADE-NMA) and can mislead with sparse networks."]
    if model == "random" and len(set(map(str, sidx))) < 10: warn.append("Few studies: tau^2 and its CI are poorly estimable in NMA; consider sensitivity with a different estimator / Bayesian prior.")
    return dict(treatments=trts, beta=beta, se=np.sqrt(np.diag(vb)), vcov=vb, tau2=tau2, d=d, league=diff, league_se=se_pair, pscore=dict(zip(trts, map(float, pscore))),
                Q=Qe, Q_df=df_Q, Q_p=float(stats.chi2.sf(Qe, df_Q)) if df_Q > 0 else float("nan"), n_contrasts=n, warnings=warn)


# ======================================================================================================================
# phylogenetic multilevel meta-analysis
# ======================================================================================================================
def phylogenetic_meta(y, v, species, A, species_levels, X=None):
    """y_i = mu + a_{species(i)} + s_{species(i)} + e_i + sampling error. a ~ N(0, sigma2_phylo * A) with A the phylogenetic correlation matrix (e.g. ape::vcv(tree, corr=TRUE));
    s: species-specific non-phylogenetic effect; e: observation-level. Equivalent to metafor rma.mv(random=list(~1|species, ~1|species2, ~1|obs), R=list(species=A)).
    Phylogenetic signal H2 = sigma2_phylo / total (Nakagawa & Santos 2012); depends on the tree, branch lengths (Brownian motion assumption) and the clade sampled."""
    y = np.asarray(y, float); v = np.asarray(v, float); species = np.asarray(species).astype(str); A = np.asarray(A, float); lv = [str(s) for s in species_levels]
    if A.shape != (len(lv), len(lv)): raise ValueError("A must be species x species in the order of species_levels.")
    if not np.allclose(A, A.T, atol=1e-8): raise ValueError("A must be symmetric.")
    if np.min(np.linalg.eigvalsh(A)) < -1e-8: raise ValueError("A is not positive semi-definite.")
    missing = set(species) - set(lv)
    if missing: raise ValueError(f"Species missing from the phylogenetic matrix: {sorted(missing)[:3]}")
    n = len(y); Z = np.zeros((n, len(lv))); Z[np.arange(n), [lv.index(s) for s in species]] = 1.0
    Gs = [Z @ A @ Z.T, Z @ Z.T, np.eye(n)]
    fit = reml_varcomp(y, v, X, Gs, ["sigma2_phylogeny", "sigma2_species", "sigma2_effect"])
    th = fit["theta"]; typ = float(((len(v) - 1) * np.sum(1 / v)) / (np.sum(1 / v) ** 2 - np.sum(1 / v ** 2)))
    tot = sum(th.values()) + typ
    fit["H2_phylo"] = th["sigma2_phylogeny"] / tot; fit["typical_within_variance"] = typ
    fit["warnings"] = list(fit["warnings"]) + ["Phylogenetic signal estimates depend on the assumed evolutionary model (Brownian motion), tree quality and the number of species; interpret as descriptive, not as proof of heritability."]
    return fit


# ======================================================================================================================
# Bayesian normal-normal random-effects meta-analysis (flat prior on mu, proper prior on tau), exact numerical integration
# ======================================================================================================================
def bayes_meta(y, v, prior="halfnormal", scale=0.5, upper=10.0, n_grid=6000, level=0.95):
    """Posterior for (mu, tau) under y_i ~ N(mu, v_i + tau^2), mu ~ flat, tau ~ half-normal(scale) or half-Cauchy(scale). mu is integrated analytically; tau by
    composite Gauss-Legendre quadrature on [0, upper] (reproduces independent R integrate() reference to ~1e-6). Posterior is NOT sampled with MCMC here.
    The prior on tau matters, especially with few studies (<10): ALWAYS report it and run a sensitivity analysis with a second prior. 'scale' must be on the effect-size scale."""
    y, v = S._validate(y, v)
    if prior not in ("halfnormal", "halfcauchy"): raise ValueError("prior must be 'halfnormal' or 'halfcauchy'")
    if not scale > 0 or not upper > 0: raise ValueError("scale and upper must be > 0")
    nodes, wts = np.polynomial.legendre.leggauss(40); edges = np.linspace(0, upper, n_grid // 40 + 1); a, b = edges[:-1], edges[1:]
    t = ((b - a)[:, None] * nodes[None, :] + (a + b)[:, None]).ravel() / 2; wq = ((b - a)[:, None] * wts[None, :]).ravel() / 2
    W = 1 / (v[None, :] + t[:, None] ** 2); sw = W.sum(1); mh = (W * y).sum(1) / sw
    loglik = -0.5 * np.log(v[None, :] + t[:, None] ** 2).sum(1) - 0.5 * np.log(sw) - 0.5 * (W * (y - mh[:, None]) ** 2).sum(1)
    lp = (stats.halfnorm.logpdf(t, scale=scale) if prior == "halfnormal" else stats.halfcauchy.logpdf(t, scale=scale))
    lg = loglik + lp; lg -= lg.max(); post = np.exp(lg); Zc = np.sum(wq * post); pw = wq * post / Zc          # posterior weights on the nodes
    sdm = 1 / np.sqrt(sw)
    tau_mean = float(np.sum(pw * t)); tau_sd = float(math.sqrt(max(np.sum(pw * t ** 2) - tau_mean ** 2, 0)))
    mu_mean = float(np.sum(pw * mh)); mu_sd = float(math.sqrt(max(np.sum(pw * (sdm ** 2 + mh ** 2)) - mu_mean ** 2, 0)))
    cdf_mu = lambda m: float(np.sum(pw * stats.norm.cdf(m, mh, sdm)))
    q_mu = lambda p: optimize.brentq(lambda m: cdf_mu(m) - p, mh.min() - 10 * sdm.max() - 10, mh.max() + 10 * sdm.max() + 10, xtol=1e-12)
    # tau quantiles: cumulative trapezoid on a fine uniform grid (200k points)
    tg = np.linspace(0, upper, 200001); Wg = 1 / (v[None, :] + tg[:, None] ** 2); swg = Wg.sum(1); mhg = (Wg * y).sum(1) / swg
    llg = -0.5 * np.log(v[None, :] + tg[:, None] ** 2).sum(1) - 0.5 * np.log(swg) - 0.5 * (Wg * (y - mhg[:, None]) ** 2).sum(1)
    lpg = (stats.halfnorm.logpdf(tg, scale=scale) if prior == "halfnormal" else stats.halfcauchy.logpdf(tg, scale=scale))
    # use the same normaliser as the node quadrature (lg was shifted by max over nodes)
    shift = (loglik + lp).max(); dg = np.exp(llg + lpg - shift) / Zc
    cg = np.concatenate([[0], np.cumsum((dg[1:] + dg[:-1]) / 2 * np.diff(tg))])
    q_tau = lambda p: float(np.interp(p, cg, tg))
    al = (1 - level) / 2
    return dict(prior=prior, scale=scale, tau_mean=tau_mean, tau_sd=tau_sd, tau_median=q_tau(0.5), tau_ci=(q_tau(al), q_tau(1 - al)),
                mu_mean=mu_mean, mu_sd=mu_sd, mu_median=q_mu(0.5), mu_ci=(q_mu(al), q_mu(1 - al)), tail_mass_beyond_upper=float(1 - cg[-1]),
                warning="Posterior depends on the prior for tau; with < 10 studies the prior can dominate tau inference. Report the prior and a sensitivity analysis. No MCMC diagnostics are needed (numerical integration), but the model is still normal-normal with known variances.")


# ======================================================================================================================
# power / sample size for meta-analysis (Hedges & Pigott 2001, 2004), with Monte-Carlo check helper
# ======================================================================================================================
def smd_variance(n1, n2, d):
    return (n1 + n2) / (n1 * n2) + d ** 2 / (2 * (n1 + n2))


def power_meta(theta, v_typ, k, tau2=0.0, alpha=0.05):
    """Power of the z-test of the mean effect in a (random-effects) meta-analysis with k studies of typical sampling variance v_typ (assumed equal) and
    between-study variance tau2: se = sqrt((v_typ + tau2)/k). Assumes tau2 is KNOWN (true power is lower when it is estimated - especially with HKSJ and few studies)."""
    if k < 1 or v_typ <= 0 or tau2 < 0 or not 0 < alpha < 1: raise ValueError("invalid arguments")
    se = math.sqrt((v_typ + tau2) / k); zc = stats.norm.ppf(1 - alpha / 2); lam = abs(theta) / se
    return float(stats.norm.sf(zc - lam) + stats.norm.cdf(-zc - lam))


def k_for_power(theta, v_typ, tau2=0.0, power=0.8, alpha=0.05, kmax=100000):
    if not 0 < power < 1: raise ValueError("power in (0,1)")
    lo = 1
    for k in range(1, kmax + 1):
        if power_meta(theta, v_typ, k, tau2, alpha) >= power: return k
    raise ValueError("Power not reachable below kmax.")


def power_Q_test(k, v_typ, tau2, alpha=0.05):
    """Approximate power of Cochran's Q test of homogeneity for k equal-variance studies when the true tau2 > 0: Q ~ (1 + tau2/v) * chi2(k-1) (exact for equal variances)."""
    if k < 2 or v_typ <= 0 or tau2 < 0: raise ValueError("invalid arguments")
    crit = stats.chi2.ppf(1 - alpha, k - 1); return float(stats.chi2.sf(crit / (1 + tau2 / v_typ), k - 1))


# ======================================================================================================================
# IPD two-stage helper; rare-event continuity-correction sensitivity; survival (time-to-event) effect extraction
# ======================================================================================================================
def ipd_two_stage(study, group, y):
    """Stage 1: per-study OLS treatment-effect (group coded 0/1) with SE; stage 2: random-effects (REML) pooling via stats.meta_analyze. One-stage mixed models are
    NOT implemented (use lme4/ nlme: see the IPD lesson's tested R workflow)."""
    study = np.asarray(study); g = np.asarray(group, float); y = np.asarray(y, float)
    ests, vs = [], []
    for s in dict.fromkeys(study.tolist()):
        ii = study == s; gi, yi = g[ii], y[ii]
        if len(set(gi.tolist())) != 2 or min((gi == 0).sum(), (gi == 1).sum()) < 2: raise ValueError(f"Study {s}: need >= 2 participants in each group.")
        X = np.column_stack([np.ones(len(gi)), gi]); beta, se, _, _ = _wls(yi, X, np.ones(len(gi))); ests.append(beta[1]); vs.append(se[1] ** 2)
    return dict(stage1_est=np.array(ests), stage1_se=np.sqrt(vs), pooled=S.meta_analyze(ests, vs, "random", "REML"))


def cc_sensitivity(a, b, c, d, measure="OR", adds=(0.01, 0.1, 0.5, 1.0), method="REML"):
    """Re-pool after adding each continuity correction to all cells of studies with a zero cell (double-zero studies dropped by effect-size NaN). Large movement of
    the estimate across `adds` is the signal that the zero-handling, not the data, drives the result. Mantel-Haenszel/Peto (advanced.py) avoid this dependence."""
    a, b, c, d = (np.asarray(x, float) for x in (a, b, c, d)); out = {}
    zero = (a == 0) | (b == 0) | (c == 0) | (d == 0)
    for ad in adds:
        a2, b2, c2, d2 = (x + ad * zero for x in (a, b, c, d))
        with np.errstate(all="ignore"):
            if measure == "OR": yi, vi = np.log(a2 * d2 / (b2 * c2)), 1 / a2 + 1 / b2 + 1 / c2 + 1 / d2
            elif measure == "RR": yi, vi = np.log((a2 / (a2 + b2)) / (c2 / (c2 + d2))), 1 / a2 - 1 / (a2 + b2) + 1 / c2 - 1 / (c2 + d2)
            else: raise ValueError("measure must be OR or RR")
        ok = np.isfinite(yi) & np.isfinite(vi) & (vi > 0)
        r = S.meta_analyze(yi[ok], vi[ok], "random", method); out[ad] = dict(est=r.est, se=r.se, tau2=r.tau2, k=int(ok.sum()))
    return out


def log_variability_ratio(sd1, n1, sd2, n2):
    """lnVR (log ratio of SDs with small-sample bias correction; metafor measure 'VR'; Nakagawa et al. variability effect sizes): yi = ln(sd1/sd2) + 1/(2(n1-1)) - 1/(2(n2-1)); vi = 1/(2(n1-1)) + 1/(2(n2-1)).
    Questions about VARIABILITY (not means). Only meaningful when SDs are comparable (same scale) and not mechanically tied to the mean (use lnCVR when they are)."""
    if min(n1, n2) < 2 or sd1 <= 0 or sd2 <= 0: raise ValueError("Need n >= 2 and positive SDs.")
    return math.log(sd1 / sd2) + 1 / (2 * (n1 - 1)) - 1 / (2 * (n2 - 1)), 1 / (2 * (n1 - 1)) + 1 / (2 * (n2 - 1))


def loghr_from_ci(hr, lo, hi, level=0.95):
    """log HR and its SE from a published HR with CI (CI assumed symmetric on the log scale; check that the reported CI is not from a robust/ Firth/ exact method)."""
    if not (lo > 0 and hi > lo and lo <= hr <= hi): raise ValueError("Need 0 < lo <= hr <= hi.")
    z = stats.norm.ppf(1 - (1 - level) / 2); return math.log(hr), (math.log(hi) - math.log(lo)) / (2 * z)


def loghr_from_oe(observed, expected, variance):
    """Peto-type log HR = (O - E)/V with Var = 1/V from log-rank statistics (Parmar 1998; Tierney 2007). V is the log-rank variance."""
    if variance <= 0: raise ValueError("variance must be > 0")
    return (observed - expected) / variance, 1 / variance
