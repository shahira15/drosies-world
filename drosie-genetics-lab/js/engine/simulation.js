/**
 * Stochastic simulation of offspring from an exact cross distribution.
 *
 * Procedure: zygotes are drawn i.i.d. from the fertilization distribution; inviable zygotes
 * are discarded (they would never be seen in a real vial) and drawing continues until the
 * requested number of ADULTS has been scored. This is equivalent to sampling adults from
 * the viability-normalized distribution, while also reporting how many zygotes died.
 *
 * Randomness: Mulberry32 PRNG seeded from a 32-bit integer → fully reproducible.
 * All results produced here are SIMULATED, not laboratory measurements.
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function randomSeed() { return (Math.random() * 4294967296) >>> 0; }

/** Categorical sampler with precomputed cumulative probabilities. */
export function makeSampler(probs) {
  const cum = []; let s = 0;
  for (const p of probs) { s += p; cum.push(s); }
  return u => {
    const x = u * s;
    let lo = 0, hi = cum.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] > x) hi = mid; else lo = mid + 1; }
    return lo;
  };
}

export function simulateOffspring(crossResult, nAdults, seed, { keepIndividuals = 60, maxDraws = 1e7 } = {}) {
  if (!Number.isInteger(nAdults) || nAdults < 1) throw new Error('Number of offspring must be a positive integer');
  if (crossResult.survival <= 0) {
    return { seed, nAdults: 0, inviable: 0, zygoteCounts: {}, classCounts: [], individuals: [], sterileVial: true };
  }
  const rng = mulberry32(seed);
  const z = crossResult.zygotes;
  const pick = makeSampler(z.map(x => x.p));
  const zc = new Array(z.length).fill(0);
  let adults = 0, inviable = 0, draws = 0;
  const individuals = [];
  while (adults < nAdults) {
    if (++draws > maxDraws) throw new Error('Simulation exceeded draw limit');
    const i = pick(rng());
    zc[i]++;
    if (z[i].viable) {
      adults++;
      if (individuals.length < keepIndividuals) individuals.push({ zygoteIndex: i, sex: z[i].fly.sex, label: z[i].phenotype.label, traits: z[i].phenotype.traits });
    } else inviable++;
  }
  const zygoteCounts = {};
  z.forEach((x, i) => { if (zc[i]) zygoteCounts[x.key] = zc[i]; });
  const classCounts = crossResult.phenotypeClasses.map(c => ({
    key: c.key, label: c.label, sex: c.sex, traits: c.traits, expectedP: c.pAdult,
    count: z.reduce((s, x, i) => s + (x.viable && x.phenotype.label === c.label && x.fly.sex === c.sex ? zc[i] : 0), 0)
  }));
  return { seed, nAdults: adults, inviable, zygoteCounts, classCounts, individuals, simulated: true };
}

/** Sample one fly genotype from a given phenotype class (e.g. to keep an F1 for the next cross). */
export function sampleFromClass(phenotypeClass, rng) {
  const gs = phenotypeClass.genotypes;
  const pick = makeSampler(gs.map(g => g.pWithinClass));
  return gs[pick(rng())].fly;
}
