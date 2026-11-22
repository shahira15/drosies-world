/**
 * Genotype parsing and formatting.
 *
 * Accepted input (FlyBase-like), chromosomes separated by ';', homologs by '/':
 *    "w[1118]/Y"                       male, white
 *    "w[1118]/+ ; b[1] vg[1]/+ +"      female (sex inferred: no Y), b vg in coupling over + +
 *    "b[1] +/+ vg[1]"                  repulsion phase (positional '+')
 *    "l(2)DEMO[1]/CyO"                 balanced lethal
 *    "vg/vg", "Cy/+", "w1118/Y", "e^1/e^1"  shorthand accepted when unambiguous
 * Unlisted chromosomes are wild type. If no X pair is written, pass {sex:'F'|'M'}.
 */
import { LOCI, BALANCERS, MODELED_CHROMOSOMES, lociOn } from './trait-database.js';
import { makeFly } from './chromosome-model.js';

export class GenotypeParseError extends Error {}

function resolveToken(tok) {
  if (tok === 'Y') return { y: true };
  if (BALANCERS[tok]) return { balancer: tok, chrom: BALANCERS[tok].chromosome };
  if (tok === '+') return { plus: true };
  let m = tok.match(/^(.+?)\[(.+)\]$/) || tok.match(/^(.+?)\^(.+)$/);
  if (m) {
    const [, sym, sup] = m;
    const L = LOCI[sym];
    if (!L) throw new GenotypeParseError(`Unknown gene symbol "${sym}"`);
    const id = sup === '+' ? `${sym}+` : `${sym}${sup}`;
    if (!L.alleles[id]) throw new GenotypeParseError(`"${tok}" is not a modeled allele of ${sym}`);
    return { locus: sym, allele: id, chrom: L.chromosome };
  }
  if (tok.endsWith('+') && LOCI[tok.slice(0, -1)]) {
    const sym = tok.slice(0, -1);
    return { locus: sym, allele: `${sym}+`, chrom: LOCI[sym].chromosome };
  }
  for (const L of Object.values(LOCI)) {
    if (L.alleles[tok] && !L.alleles[tok].wild) return { locus: L.symbol, allele: tok, chrom: L.chromosome };
  }
  if (LOCI[tok]) {
    const muts = Object.values(LOCI[tok].alleles).filter(a => !a.wild);
    if (muts.length === 1) return { locus: tok, allele: muts[0].id, chrom: LOCI[tok].chromosome, shorthand: true };
  }
  throw new GenotypeParseError(`Cannot interpret "${tok}"`);
}

function parseHomolog(str) { return str.trim().split(/\s+/).filter(Boolean).map(resolveToken); }

export function parseGenotype(input, opts = {}) {
  if (typeof input !== 'string' || !input.trim()) throw new GenotypeParseError('Empty genotype');
  const segs = input.split(';').map(s => s.trim()).filter(Boolean);
  const chromosomes = {};
  if (segs.length === 1 && /^(\+\s*\/\s*\+|\+|wild[\s-]?type|\+ \(wild type\))$/i.test(segs[0])) {
    if (!opts.sex) throw new GenotypeParseError('Sex unknown: choose a sex for an all-wild-type fly');
    return makeFly({ sex: opts.sex });
  }
  for (const seg of segs) {
    const homs = seg.split('/');
    if (homs.length !== 2) throw new GenotypeParseError(`"${seg}" must contain exactly one "/" separating two homologs`);
    const [A, B] = homs.map(parseHomolog);
    if (!A.length || !B.length) throw new GenotypeParseError(`"${seg}": both homologs must be written`);
    const known = [...A, ...B].find(t => t.chrom || t.y);
    if (!known) throw new GenotypeParseError(`"${seg}": cannot tell which chromosome this is`);
    const chrom = known.y ? 'X' : known.chrom;
    for (const t of [...A, ...B]) if (t.chrom && t.chrom !== chrom) throw new GenotypeParseError(`"${seg}" mixes loci from chromosomes ${chrom} and ${t.chrom}`);
    if (chromosomes[chrom]) throw new GenotypeParseError(`Chromosome ${chrom} written twice`);
    const build = (mine, other) => {
      if (mine.length === 1 && mine[0].y) return { kind: 'Y' };
      if (mine.length === 1 && mine[0].balancer) return { balancer: mine[0].balancer, alleles: {} };
      const alleles = {};
      mine.forEach((t, i) => {
        if (t.plus) {
          const ref = other[i];
          if (!ref || !ref.locus) {
            if (mine.length === 1 && other.every(o => o.locus || o.y || o.balancer)) return; // "+/Y" or "+/CyO": wild homolog
            throw new GenotypeParseError(`"+" in "${seg}" has no matching locus on the other homolog`);
          }
          alleles[ref.locus] = `${ref.locus}+`;
        } else if (t.locus) {
          if (alleles[t.locus]) throw new GenotypeParseError(`${t.locus} listed twice on one homolog`);
          alleles[t.locus] = t.allele;
        } else throw new GenotypeParseError(`Unexpected token in "${seg}"`);
      });
      return { alleles };
    };
    chromosomes[chrom] = [build(A, B), build(B, A)];
  }
  const hasY = chromosomes.X && chromosomes.X.some(h => h.kind === 'Y');
  let sex = opts.sex;
  if (chromosomes.X) sex = hasY ? 'M' : 'F';
  if (opts.sex && chromosomes.X && opts.sex !== sex) throw new GenotypeParseError('Declared sex conflicts with the written sex chromosomes');
  if (!sex) throw new GenotypeParseError('Sex unknown: write the X chromosomes (e.g. "+/Y") or choose a sex');
  try { return makeFly({ sex, chromosomes }); }
  catch (e) { throw new GenotypeParseError(e.message); }
}

/* ---------------- Formatting ---------------- */

function alleleText(locus, alleleId, style) {
  const a = LOCI[locus].alleles[alleleId];
  if (a.wild) return '+';
  if (style === 'html') return a.display.replace(/\[(.+)\]/, '<sup>$1</sup>');
  return a.display;
}

/**
 * FlyBase-style genotype. Only chromosomes carrying mutant alleles/balancers are shown,
 * except the X pair of males, which is always shown (…/Y).
 * style: 'text' (w[1118]) | 'html' (w<sup>1118</sup>)
 */
export function formatGenotype(fly, { style = 'text', showWildChromosomes = false } = {}) {
  const parts = [];
  for (const c of MODELED_CHROMOSOMES) {
    const pair = fly.chromosomes[c];
    const segLoci = lociOn(c).map(l => l.symbol).filter(l => pair.some(h => h.kind !== 'Y' && !h.balancer && !LOCI[l].alleles[h.alleles[l]].wild));
    const hasBal = pair.some(h => h.balancer);
    const isMaleX = c === 'X' && fly.sex === 'M';
    if (!segLoci.length && !hasBal && !isMaleX && !showWildChromosomes) continue;
    const homolog = h => {
      if (h.kind === 'Y') return 'Y';
      if (h.balancer) return h.balancer;
      if (!segLoci.length) return '+';
      return segLoci.map(l => alleleText(l, h.alleles[l], style)).join(' ');
    };
    // conventional order: mutant-bearing homolog first, then +, balancer, Y last
    const sorted = [...pair].sort((a, b) => rank(a, segLoci) - rank(b, segLoci));
    parts.push(sorted.map(homolog).join('/'));
  }
  return parts.length ? parts.join(' ; ') : '+ (wild type)';
}
function rank(h, loci) {
  if (h.kind === 'Y') return 3;
  if (h.balancer) return 2;
  const mut = loci.filter(l => !LOCI[l].alleles[h.alleles[l]].wild).length;
  return mut ? -mut : 1;
}

/**
 * Classroom shorthand (Junior mode): capital = wild-type allele, lowercase = recessive mutant,
 * dominant mutants written with a capital symbol and wild type as "+". X-linked as X^W/X^w.
 */
export function formatShorthand(fly) {
  const parts = [];
  for (const locus of Object.keys(LOCI)) {
    const L = LOCI[locus];
    if (L.illustrative) continue;
    const pair = fly.chromosomes[L.chromosome];
    const seg = pair.some(h => h.kind !== 'Y' && !L.alleles[h.alleles[locus]].wild);
    if (!seg) continue;
    const mut = Object.values(L.alleles).find(a => !a.wild);
    const sym = a => {
      const rec = L.alleles[a];
      if (mut.dominance === 'dominant') return rec.wild ? '+' : L.symbol;
      const cap = L.symbol.charAt(0).toUpperCase() + L.symbol.slice(1);
      return rec.wild ? cap : L.symbol;
    };
    if (L.chromosome === 'X') {
      parts.push(pair.map(h => (h.kind === 'Y' ? 'Y' : `X<sup>${sym(h.alleles[locus])}</sup>`)).join(' '));
    } else {
      const s = pair.map(h => sym(h.alleles[locus]));
      s.sort((a, b) => (a === a.toLowerCase()) - (b === b.toLowerCase()));
      parts.push(s.join(''));
    }
  }
  return parts.length ? parts.join(' ') : 'all wild type';
}

export function formatHaplotype(h, loci, style = 'html') {
  if (h.kind === 'Y') return 'Y';
  if (h.balancer) return h.balancer;
  const shown = loci.filter(l => LOCI[l].chromosome === h.chrom);
  return shown.length ? shown.map(l => alleleText(l, h.alleles[l], style)).join(' ') : '+';
}

export function formatProjectedGamete(proj, loci, style = 'html') {
  const bits = [];
  for (const c of MODELED_CHROMOSOMES) {
    const cl = loci.filter(l => LOCI[l].chromosome === c);
    if (c === 'X') {
      if (proj.sexChrom === null) { if (cl.length) bits.push(cl.map(l => alleleText(l, proj.alleles[l], style)).join(' ')); continue; }
      if (proj.sexChrom === 'Y') { bits.push('Y'); continue; }
      bits.push(cl.length ? cl.map(l => alleleText(l, proj.alleles[l], style)).join(' ') : 'X');
      continue;
    }
    if (proj.balancers.length && c === '2' && proj.balancers.includes('CyO')) { bits.push('CyO'); continue; }
    if (cl.length) bits.push(cl.map(l => alleleText(l, proj.alleles[l], style)).join(' '));
  }
  return bits.join(' ; ');
}
