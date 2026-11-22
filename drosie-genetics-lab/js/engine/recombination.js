/**
 * Recombination: from map distances to haplotype (gamete chromosome) distributions.
 *
 * Model
 *  - Loci on a chromosome are ordered by classical map position.
 *  - Each ADJACENT interval i has recombination fraction r_i, converted from its map
 *    distance d_i (cM) with a mapping function (default Kosambi; Haldane and linear available).
 *  - Crossovers in different intervals are treated as independent (no interference
 *    between intervals). Therefore for two non-adjacent loci the recombination fraction is
 *    r = (1 - Π(1 - 2 r_i)) / 2, which never exceeds 0.5.
 *  - Explicit overrides of interval RFs may be supplied (e.g. to match a published dataset).
 */
import { lociOn, LOCI } from './trait-database.js';
import { hapKey } from './chromosome-model.js';

export const MAPPING_FUNCTIONS = {
  kosambi: d => 0.5 * Math.tanh((2 * d) / 100),
  haldane: d => 0.5 * (1 - Math.exp((-2 * d) / 100)),
  linear: d => Math.min(d / 100, 0.5)
};

export function intervalRF(dCM, mapping = 'kosambi') {
  const f = MAPPING_FUNCTIONS[mapping];
  if (!f) throw new Error(`Unknown mapping function ${mapping}`);
  if (dCM < 0) throw new Error('Map distance must be non-negative');
  return f(dCM);
}

/** Recombination fraction between two loci on the same chromosome under this model. */
export function pairwiseRF(locusA, locusB, opts = {}) {
  const A = LOCI[locusA], B = LOCI[locusB];
  if (A.chromosome !== B.chromosome) return 0.5;
  const loci = lociOn(A.chromosome).map(l => l.symbol);
  const ia = loci.indexOf(locusA), ib = loci.indexOf(locusB);
  const [lo, hi] = ia < ib ? [ia, ib] : [ib, ia];
  const rs = intervalRFs(A.chromosome, opts).slice(lo, hi);
  return (1 - rs.reduce((p, r) => p * (1 - 2 * r), 1)) / 2;
}

/** Adjacent-interval RFs for every modeled locus pair on a chromosome. */
export function intervalRFs(chrom, opts = {}) {
  const loci = lociOn(chrom);
  const out = [];
  for (let i = 0; i < loci.length - 1; i++) {
    const key = `${loci[i].symbol}|${loci[i + 1].symbol}`;
    const ov = opts.rfOverrides && opts.rfOverrides[key];
    out.push(ov != null ? ov : intervalRF(loci[i + 1].mapPosition - loci[i].mapPosition, opts.mapping || 'kosambi'));
  }
  return out;
}

/**
 * Distribution of chromosomes transmitted to a gamete from one homolog pair.
 * @returns [{hap, p, crossovers:[intervalIndex...]}] merged by haplotype identity.
 */
export function haplotypeDistribution(pair, chrom, { crossingOver, ...opts }) {
  const [h1, h2] = pair;
  if (!crossingOver || h1.kind === 'Y' || h2.kind === 'Y') {
    return merge([{ hap: h1, p: 0.5 }, { hap: h2, p: 0.5 }]);
  }
  const loci = lociOn(chrom).map(l => l.symbol);
  if (loci.length <= 1) return merge([{ hap: h1, p: 0.5 }, { hap: h2, p: 0.5 }]);
  const rs = intervalRFs(chrom, opts);
  const results = [];
  // Enumerate the strand path: which homolog supplies each locus.
  const n = loci.length;
  const total = 1 << (n - 1);
  for (const start of [0, 1]) {
    for (let mask = 0; mask < total; mask++) {
      let p = 0.5, src = start;
      const alleles = {};
      alleles[loci[0]] = (src ? h2 : h1).alleles[loci[0]];
      for (let i = 0; i < n - 1; i++) {
        const sw = (mask >> i) & 1;
        p *= sw ? rs[i] : 1 - rs[i];
        if (sw) src = 1 - src;
        alleles[loci[i + 1]] = (src ? h2 : h1).alleles[loci[i + 1]];
      }
      if (p === 0) continue;
      const recombinant = mask !== 0;
      const hap = { kind: h1.kind, chrom, alleles,
        balancer: recombinant ? null : (start ? h2.balancer : h1.balancer) };
      results.push({ hap, p });
    }
  }
  return merge(results);
}

function merge(list) {
  const m = new Map();
  for (const { hap, p } of list) {
    const k = hapKey(hap);
    if (m.has(k)) m.get(k).p += p; else m.set(k, { hap, p, key: k });
  }
  return [...m.values()];
}

/** Sample which intervals crossed over (for animation) given a random source. */
export function sampleCrossoverIntervals(chrom, rng, opts = {}) {
  return intervalRFs(chrom, opts).map((r, i) => (rng() < r ? i : -1)).filter(i => i >= 0);
}
