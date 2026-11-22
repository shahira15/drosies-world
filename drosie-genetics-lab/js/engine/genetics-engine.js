/**
 * Drosie Genetics Lab — core genetics engine (UI-independent, pure functions).
 *
 *   gameteDistribution(fly, opts)  → exact gamete probabilities (sum to 1)
 *   cross(mother, father, opts)    → exact zygote + surviving-adult distributions
 *   projectGametes(...)            → gametes restricted to loci of interest (Punnett display)
 */
import { MODELED_CHROMOSOMES, LOCI } from './trait-database.js';
import { canonicalize, flyKey, hapKey, sexOf } from './chromosome-model.js';
import { meioticRule, phenotypeOf } from './inheritance-models.js';
import { haplotypeDistribution } from './recombination.js';
import { assessViability, applyViability } from './viability.js';

export const ENGINE_VERSION = '1.0.0';

export function gameteDistribution(fly, opts = {}) {
  let dist = [{ chroms: {}, p: 1, recombinant: false }];
  const rules = {};
  for (const c of MODELED_CHROMOSOMES) {
    const rule = meioticRule(fly, c);
    rules[c] = rule;
    const hd = haplotypeDistribution(fly.chromosomes[c], c, { crossingOver: rule.crossingOver, ...opts });
    const parentalKeys = new Set(fly.chromosomes[c].map(hapKey));
    const next = [];
    for (const g of dist) for (const h of hd) {
      next.push({ chroms: { ...g.chroms, [c]: h.hap }, p: g.p * h.p,
        recombinant: g.recombinant || !parentalKeys.has(h.key) });
    }
    dist = next;
  }
  return dist.map(g => ({ ...g, key: gameteKey(g.chroms) })).filter(g => g.p > 0)
    .map((g, _, arr) => g).reduce(mergeBy('key'), []).map(g => ({ ...g, rules }));
}

export function gameteKey(chroms) {
  return MODELED_CHROMOSOMES.map(c => hapKey(chroms[c])).join(' ; ');
}

function mergeBy(field) {
  return (acc, item) => {
    const hit = acc.find(x => x[field] === item[field]);
    if (hit) hit.p += item.p; else acc.push({ ...item });
    return acc;
  };
}

export function fuse(eggChroms, spermChroms) {
  const chromosomes = {};
  for (const c of MODELED_CHROMOSOMES) chromosomes[c] = [eggChroms[c], spermChroms[c]];
  const sex = sexOf(chromosomes);
  return canonicalize({ sex, chromosomes });
}

/**
 * Exact cross. Mother must be XX female, father XY male.
 * Returns zygotes (fertilization probabilities, before viability), adults (after viability),
 * and phenotype classes split by sex.
 */
export function cross(mother, father, opts = {}) {
  if (mother.sex !== 'F') throw new Error('The mother must be a female (XX) fly.');
  if (father.sex !== 'M') throw new Error('The father must be a male (XY) fly.');
  const eggs = gameteDistribution(mother, opts);
  const sperm = gameteDistribution(father, opts);
  const zmap = new Map();
  for (const e of eggs) for (const s of sperm) {
    const fly = fuse(e.chroms, s.chroms);
    const key = flyKey(fly);
    const p = e.p * s.p;
    if (zmap.has(key)) zmap.get(key).p += p;
    else {
      const via = assessViability(fly);
      zmap.set(key, { key, fly, p, viable: via.viable, lethalReasons: via.reasons, phenotype: phenotypeOf(fly) });
    }
  }
  const zygotes = [...zmap.values()].sort((a, b) => b.p - a.p);
  const { survival, adults } = applyViability(zygotes);
  const classes = new Map();
  for (const z of zygotes) {
    const ck = `${z.phenotype.label}|${z.fly.sex}`;
    if (!classes.has(ck)) classes.set(ck, { key: ck, label: z.phenotype.label, sex: z.fly.sex, traits: z.phenotype.traits, pZygote: 0, pAdult: 0, genotypes: [] });
    const cl = classes.get(ck);
    cl.pZygote += z.p;
    if (z.viable) { cl.pAdult += z.p / survival; cl.genotypes.push({ key: z.key, fly: z.fly, pWithinClass: z.p }); }
  }
  const phenotypeClasses = [...classes.values()].filter(c => c.pAdult > 0)
    .map(c => { const t = c.genotypes.reduce((s, g) => s + g.pWithinClass, 0); c.genotypes.forEach(g => (g.pWithinClass /= t)); return c; })
    .sort(classOrder);
  return { eggs, sperm, zygotes, survival, adults, phenotypeClasses, lethalZygoteFraction: 1 - survival };
}

function classOrder(a, b) {
  const wa = a.label === 'wild type' ? 0 : 1, wb = b.label === 'wild type' ? 0 : 1;
  if (wa !== wb) return wa - wb;
  if (a.label !== b.label) return a.label < b.label ? -1 : 1;
  return a.sex === 'F' ? -1 : 1;
}

/** Pool classes ignoring sex (useful for autosomal analyses). */
export function pooledClasses(crossResult) {
  const m = new Map();
  for (const c of crossResult.phenotypeClasses) {
    if (!m.has(c.label)) m.set(c.label, { label: c.label, traits: c.traits, pAdult: 0 });
    m.get(c.label).pAdult += c.pAdult;
  }
  return [...m.values()];
}

/** Loci at which either parent carries a non-wild allele (relevant for a Punnett display). */
export function segregatingLoci(...flies) {
  const out = [];
  for (const locus of Object.keys(LOCI)) {
    const c = LOCI[locus].chromosome;
    if (flies.some(f => f.chromosomes[c].some(h => h.kind !== 'Y' && !LOCI[locus].alleles[h.alleles[locus]].wild))) out.push(locus);
  }
  return out.sort((a, b) => {
    const A = LOCI[a], B = LOCI[b];
    const order = MODELED_CHROMOSOMES.indexOf(A.chromosome) - MODELED_CHROMOSOMES.indexOf(B.chromosome);
    return order || A.mapPosition - B.mapPosition;
  });
}

/** Gametes projected onto selected loci (+ always the X/Y identity). */
export function projectGametes(gametes, loci, { includeSex = true } = {}) {
  const m = new Map();
  for (const g of gametes) {
    const proj = {};
    proj.sexChrom = includeSex ? g.chroms.X.kind : null; // 'X' | 'Y' | null (sex ignored)
    proj.balancers = MODELED_CHROMOSOMES.map(c => g.chroms[c].balancer).filter(Boolean);
    proj.alleles = {};
    for (const l of loci) {
      const h = g.chroms[LOCI[l].chromosome];
      proj.alleles[l] = h.kind === 'Y' ? null : h.alleles[l];
    }
    const key = proj.sexChrom + '|' + loci.map(l => proj.alleles[l] ?? '—').join(',') + '|' + proj.balancers.join(',');
    if (m.has(key)) { m.get(key).p += g.p; m.get(key).members.push(g); }
    else m.set(key, { key, proj, p: g.p, members: [g], recombinant: g.recombinant });
  }
  return [...m.values()].sort((a, b) => b.p - a.p);
}

/** Expected proportion of recombinant gametes from one parent (for linkage teaching). */
export function recombinantGameteFraction(fly, opts = {}) {
  return gameteDistribution(fly, opts).filter(g => g.recombinant).reduce((s, g) => s + g.p, 0);
}

export { phenotypeOf, assessViability };
