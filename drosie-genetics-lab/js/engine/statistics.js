/**
 * Statistics: chi-square goodness-of-fit with exact upper-tail p-values
 * (regularized incomplete gamma, Numerical Recipes series + continued fraction).
 */

export function logGamma(x) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += c[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/** Regularized lower incomplete gamma P(a, x). */
export function gammaP(a, x) {
  if (x < 0 || a <= 0) throw new Error('Invalid arguments to gammaP');
  if (x === 0) return 0;
  if (x < a + 1) {
    let ap = a, sum = 1 / a, del = sum;
    for (let n = 0; n < 1000; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-15) break; }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  }
  return 1 - gammaQcf(a, x);
}
function gammaQcf(a, x) {
  const FPMIN = 1e-300;
  let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a); b += 2;
    d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

/** Upper-tail probability of the chi-square distribution: P(X² ≥ x | df). */
export function chiSquarePValue(x, df) {
  if (df <= 0) return NaN;
  if (x <= 0) return 1;
  return x < df / 2 + 1 ? 1 - gammaP(df / 2, x / 2) : gammaQcf(df / 2, x / 2);
}

/** Critical value by bisection. */
export function chiSquareCritical(alpha, df) {
  let lo = 0, hi = 1000;
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (chiSquarePValue(mid, df) > alpha) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

/**
 * Chi-square goodness of fit.
 * @param observed  counts
 * @param expected  either proportions (summing to ~1) or ratio weights (e.g. [9,3,3,1]) — normalized here
 * @param opts.estimatedParams number of parameters estimated from the same data (reduces df)
 */
export function chiSquareGOF(observed, expected, { estimatedParams = 0, alpha = 0.05 } = {}) {
  if (observed.length !== expected.length) throw new Error('observed and expected must have equal length');
  if (observed.length < 2) throw new Error('At least two classes are required');
  if (observed.some(o => o < 0 || !Number.isFinite(o))) throw new Error('Counts must be non-negative numbers');
  const N = observed.reduce((a, b) => a + b, 0);
  const W = expected.reduce((a, b) => a + b, 0);
  if (N <= 0) throw new Error('No observations');
  if (W <= 0) throw new Error('Expected ratios must be positive');
  const warnings = [];
  const expCounts = expected.map(w => (N * w) / W);
  if (expCounts.some(e => e === 0)) {
    const impossible = observed.some((o, i) => expCounts[i] === 0 && o > 0);
    warnings.push(impossible ? 'A class with expected count 0 was observed: the hypothesis is contradicted outright (chi-square is infinite).' : 'Classes with expected count 0 were dropped from the test.');
    if (impossible) return { N, chi2: Infinity, df: NaN, p: 0, expectedCounts: expCounts, contributions: [], warnings, reject: true, alpha };
  }
  const keep = expCounts.map((e, i) => e > 0 ? i : -1).filter(i => i >= 0);
  const contributions = observed.map((o, i) => expCounts[i] > 0 ? ((o - expCounts[i]) ** 2) / expCounts[i] : 0);
  const chi2 = contributions.reduce((a, b) => a + b, 0);
  const df = keep.length - 1 - estimatedParams;
  if (df < 1) { warnings.push('Degrees of freedom < 1: the test cannot be performed.'); return { N, chi2, df, p: NaN, expectedCounts: expCounts, contributions, warnings, alpha }; }
  const p = chiSquarePValue(chi2, df);
  const small = expCounts.filter(e => e > 0 && e < 5).length;
  if (small) warnings.push(`${small} class(es) have expected counts below 5; the chi-square approximation may be unreliable. Consider a larger sample, merging classes, or an exact multinomial test.`);
  if (N < 30) warnings.push('Small sample (N < 30): the test has low power to detect departures from the hypothesis.');
  return { N, chi2, df, p, expectedCounts: expCounts, contributions, warnings, reject: p < alpha, alpha, critical: chiSquareCritical(alpha, df) };
}

/** Careful, non-overclaiming interpretation text. */
export function interpretChiSquare(res) {
  if (!Number.isFinite(res.p)) return res.warnings.join(' ');
  const pTxt = res.p < 0.001 ? 'p < 0.001' : `p = ${res.p.toFixed(3)}`;
  if (res.reject) return `χ² = ${res.chi2.toFixed(3)}, df = ${res.df}, ${pTxt}. Deviations this large would arise less than ${(res.alpha * 100).toFixed(0)}% of the time if the hypothesized ratio were true, so we reject the hypothesis at α = ${res.alpha}. This does not tell us which alternative model is correct.`;
  return `χ² = ${res.chi2.toFixed(3)}, df = ${res.df}, ${pTxt}. The data are consistent with the hypothesized ratio (we fail to reject it at α = ${res.alpha}). This is NOT proof that the model is correct: other models might fit equally well, and small samples have little power.`;
}

/** Recombination-fraction estimate with binomial standard error. */
export function recombinationEstimate(recombinants, total) {
  if (total <= 0) throw new Error('Total must be positive');
  const r = recombinants / total;
  const se = Math.sqrt((r * (1 - r)) / total);
  return { r, se, ci95: [Math.max(0, r - 1.96 * se), Math.min(1, r + 1.96 * se)], mapUnits: 100 * r };
}

export function parseRatio(text) {
  const parts = String(text).split(/[:,\s]+/).filter(Boolean).map(Number);
  if (parts.length < 2 || parts.some(x => !(x >= 0) || !Number.isFinite(x))) throw new Error('Write a ratio like 9:3:3:1');
  return parts;
}
