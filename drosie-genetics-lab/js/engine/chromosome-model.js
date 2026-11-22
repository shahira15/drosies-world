/**
 * Chromosome model: haplotypes (single homologs) and diploid flies.
 *
 * Haplotype  { kind: 'X'|'Y'|'A', chrom: 'X'|'2'|'3', alleles: {locus: alleleId}, balancer: null|'CyO' }
 *   - Y haplotypes carry no modeled loci (kind 'Y', chrom 'X' slot = sex-chromosome pair).
 * Fly        { sex: 'F'|'M', chromosomes: { X: [h, h], '2': [h, h], '3': [h, h] } }
 *   - Homolog order inside a pair carries no meaning for inheritance; for display the
 *     canonical form places X before Y and otherwise sorts by key.
 */
import { LOCI, BALANCERS, MODELED_CHROMOSOMES, lociOn, wildAllele } from './trait-database.js';

export function makeHaplotype(chrom, alleles = {}, opts = {}) {
  if (opts.kind === 'Y') return { kind: 'Y', chrom: 'X', alleles: {}, balancer: null };
  const balancer = opts.balancer || null;
  const out = {};
  const base = balancer ? (BALANCERS[balancer]?.alleles || {}) : {};
  if (balancer && !BALANCERS[balancer]) throw new Error(`Unknown balancer ${balancer}`);
  if (balancer && BALANCERS[balancer].chromosome !== chrom) throw new Error(`${balancer} is a chromosome ${BALANCERS[balancer].chromosome} balancer`);
  for (const L of lociOn(chrom)) {
    const a = alleles[L.symbol] ?? base[L.symbol] ?? wildAllele(L.symbol);
    if (!L.alleles[a]) throw new Error(`Allele ${a} is not an allele of ${L.symbol}`);
    out[L.symbol] = a;
  }
  for (const k of Object.keys(alleles)) {
    if (!LOCI[k]) throw new Error(`Unknown locus ${k}`);
    if (LOCI[k].chromosome !== chrom) throw new Error(`${k} is on chromosome ${LOCI[k].chromosome}, not ${chrom}`);
  }
  return { kind: chrom === 'X' ? 'X' : 'A', chrom, alleles: out, balancer };
}

export function hapKey(h) {
  if (h.kind === 'Y') return 'Y';
  const parts = Object.keys(h.alleles).sort().map(k => `${k}=${h.alleles[k]}`);
  return `${h.chrom}${h.balancer ? '{' + h.balancer + '}' : ''}:${parts.join(',')}`;
}

export function sexOf(chromosomes) {
  const sx = chromosomes.X;
  const nY = sx.filter(h => h.kind === 'Y').length;
  const nX = sx.filter(h => h.kind === 'X').length;
  if (nX === 2 && nY === 0) return 'F';
  if (nX === 1 && nY === 1) return 'M';
  throw new Error('Only XX females and XY males are modeled (XXY females and XO sterile males exist in Drosophila but are outside this model).');
}

/** Build a fly from per-chromosome haplotype pairs; missing chromosomes are wild type. */
export function makeFly(spec) {
  const chromosomes = {};
  const sexIn = spec.sex;
  for (const c of MODELED_CHROMOSOMES) {
    if (spec.chromosomes && spec.chromosomes[c]) {
      chromosomes[c] = spec.chromosomes[c].map(h => (h.kind === 'Y' ? makeHaplotype('X', {}, { kind: 'Y' })
        : makeHaplotype(c, h.alleles || {}, { balancer: h.balancer })));
    } else if (c === 'X') {
      if (!sexIn) throw new Error('Sex must be given when the X pair is not specified');
      chromosomes.X = sexIn === 'F' ? [makeHaplotype('X'), makeHaplotype('X')] : [makeHaplotype('X'), makeHaplotype('X', {}, { kind: 'Y' })];
    } else {
      chromosomes[c] = [makeHaplotype(c), makeHaplotype(c)];
    }
  }
  const sex = sexOf(chromosomes);
  if (sexIn && sexIn !== sex) throw new Error(`Declared sex ${sexIn} conflicts with sex chromosomes`);
  return canonicalize({ sex, chromosomes });
}

export function canonicalize(fly) {
  const chromosomes = {};
  for (const c of MODELED_CHROMOSOMES) {
    const pair = [...fly.chromosomes[c]];
    pair.sort((a, b) => {
      if (a.kind === 'Y') return 1; if (b.kind === 'Y') return -1;
      const ka = hapKey(a), kb = hapKey(b);
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
    chromosomes[c] = pair;
  }
  return { sex: fly.sex, chromosomes };
}

export function flyKey(fly) {
  return MODELED_CHROMOSOMES.map(c => fly.chromosomes[c].map(hapKey).sort().join('|')).join(' ; ');
}

/** All allele copies a fly carries at a locus (1 copy for X loci in males). */
export function allelesAt(fly, locus) {
  const c = LOCI[locus].chromosome;
  return fly.chromosomes[c].filter(h => h.kind !== 'Y').map(h => h.alleles[locus]);
}

export function isHomozygousAll(fly) {
  return MODELED_CHROMOSOMES.every(c => {
    const [a, b] = fly.chromosomes[c];
    if (a.kind === 'Y' || b.kind === 'Y') return true;
    return hapKey(a) === hapKey(b);
  });
}

export function cloneFly(f) { return JSON.parse(JSON.stringify(f)); }
