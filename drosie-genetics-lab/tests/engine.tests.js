/**
 * Automated scientific validation suite for the Drosie genetics engine.
 * Deterministic (analytic) tests are kept separate from stochastic (convergence) tests.
 * Shared by tests/run-tests.mjs (Node) and tests/index.html (browser).
 */
import * as G from '../js/engine/index.js';

const EPS = 1e-12;
export const tests = [];
const T = (group, name, fn, kind = 'deterministic') => tests.push({ group, name, fn, kind });

/* ---------- helpers ---------- */
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg || 'values differ'}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function near(a, b, tol = EPS, msg = '') { if (!(Math.abs(a - b) <= tol)) throw new Error(`${msg} expected ${b} ± ${tol}, got ${a}`); }
function ok(c, msg) { if (!c) throw new Error(msg || 'assertion failed'); }
function throws(fn, msg) { let t = false; try { fn(); } catch { t = true; } if (!t) throw new Error(msg || 'expected an error'); }
const P = (s, o) => G.parseGenotype(s, /\bY\b/.test(s) ? undefined : (o || { sex: 'F' }));
const X = (m, f, o) => G.cross(P(m, { sex: 'F' }), P(f, { sex: 'M' }), o);
function classP(res, label, sex) {
  return res.phenotypeClasses.filter(c => c.label === label && (!sex || c.sex === sex)).reduce((s, c) => s + c.pAdult, 0);
}
function genoP(res, genoText, { adults = false } = {}) {
  const key = G.flyKey(P(genoText));
  const z = res.zygotes.find(z => z.key === key);
  if (!z) return 0;
  return adults ? (z.viable ? z.p / res.survival : 0) : z.p;
}
const sum = a => a.reduce((x, y) => x + y, 0);

/* ---------- Parsing ---------- */
T('Genotype parsing', 'parses FlyBase-style X-linked male', () => {
  const f = P('w[1118]/Y'); eq(f.sex, 'M'); eq(G.allelesAt(f, 'w').length, 1); eq(G.allelesAt(f, 'w')[0], 'w1118');
});
T('Genotype parsing', 'infers female when no Y is present', () => eq(P('w[1118]/+').sex, 'F'));
T('Genotype parsing', 'coupling vs repulsion are different genotypes', () => {
  const c = P('b[1] vg[1]/+ +', { sex: 'F' }), r = P('b[1] +/+ vg[1]', { sex: 'F' });
  ok(G.flyKey(c) !== G.flyKey(r), 'coupling and repulsion should differ');
  const h = c.chromosomes['2'].find(h => h.alleles.b === 'b1'); eq(h.alleles.vg, 'vg1');
  const h2 = r.chromosomes['2'].find(h => h.alleles.b === 'b1'); eq(h2.alleles.vg, 'vg+');
});
T('Genotype parsing', 'shorthand symbols resolve to the single modeled allele', () => {
  eq(G.flyKey(P('vg/vg', { sex: 'M' })), G.flyKey(P('vg[1]/vg[1]', { sex: 'M' })));
  eq(G.flyKey(P('Cy/+', { sex: 'F' })), G.flyKey(P('Cy[1]/+', { sex: 'F' })));
});
T('Genotype parsing', 'balancer token is understood', () => {
  const f = P('l(2)DEMO[1]/CyO', { sex: 'F' });
  ok(f.chromosomes['2'].some(h => h.balancer === 'CyO')); ok(G.allelesAt(f, 'Cy').includes('Cy1'), 'CyO carries Cy1');
});
T('Genotype parsing', 'rejects malformed or impossible genotypes', () => {
  throws(() => P('vg[1]'), 'missing slash'); throws(() => P('zz[9]/+', { sex: 'F' }), 'unknown gene');
  throws(() => P('vg[7]/+', { sex: 'F' }), 'unknown allele'); throws(() => P('b[1] e[1]/+ +', { sex: 'F' }), 'loci on different chromosomes');
  throws(() => G.parseGenotype('vg/+'), 'sex unknown'); throws(() => G.parseGenotype('w[1118]/Y', { sex: 'F' }), 'conflicting sex');
});
T('Genotype parsing', 'format → parse round trip', () => {
  for (const s of ['w[1118]/Y ; vg[1]/+', 'y[1] w[1118]/+ + ; b[1] vg[1]/+ + ; e[1]/e[1]', 'w[1118]/Y ; l(2)DEMO[1]/CyO', 'b[1] +/+ vg[1]']) {
    const f = P(s, { sex: 'F' }); const back = P(G.formatGenotype(f), { sex: f.sex });
    eq(G.flyKey(back), G.flyKey(f), `round trip of ${s}`);
  }
});

/* ---------- Gametes ---------- */
const GAMETE_FLIES = ['+/+', 'y[1] w[1118]/+ + ; b[1] vg[1]/+ + ; Sb[1] e[1]/+ +', 'w[1118]/Y ; Cy[1] b[1] vg[1]/+ + + ; e[1]/+', 'y[1] +/+ w[1118] ; l(2)DEMO[1]/CyO ; e[1]/+', 'y[1] w[1118]/Y ; Cy[1] l(2)DEMO[1] b[1] vg[1]/+ + + +'];
T('Gamete normalization', 'gamete probabilities sum to 1 for diverse genotypes', () => {
  for (const s of GAMETE_FLIES) { const g = G.gameteDistribution(P(s, { sex: 'F' })); near(sum(g.map(x => x.p)), 1, 1e-12, s); ok(g.every(x => x.p > 0)); }
});
T('Gamete normalization', 'triple heterozygous female on chromosome 2 yields 16 haplotypes from one chromosome', () => {
  const f = P('Cy[1] l(2)DEMO[1] b[1] vg[1]/+ + + +', { sex: 'F' });
  eq(G.gameteDistribution(f).length, 16);
});
T('Gamete normalization', 'every gamete carries exactly one of each chromosome', () => {
  for (const g of G.gameteDistribution(P(GAMETE_FLIES[1], { sex: 'F' }))) for (const c of G.MODELED_CHROMOSOMES) ok(g.chroms[c], `missing ${c}`);
});
T('Gamete normalization', 'XY male makes X and Y sperm 1:1', () => {
  const g = G.gameteDistribution(P('w[1118]/Y'));
  near(sum(g.filter(x => x.chroms.X.kind === 'Y').map(x => x.p)), 0.5); near(sum(g.filter(x => x.chroms.X.kind === 'X').map(x => x.p)), 0.5);
});

T('Gamete normalization', 'projection without sex merges X and Y sperm', () => {
  const g = G.projectGametes(G.gameteDistribution(P('e[1]/+', { sex: 'M' })), ['e'], { includeSex: false });
  eq(g.length, 2); g.forEach(x => near(x.p, 0.5));
});
T('Genotype parsing', 'all mission/stock genotypes parse in both sexes', () => {
  for (const s of ['+/+', 'w[1118]/w[1118]', 'vg[1]/vg[1]', 'e[1]/e[1]', 'y[1]/y[1]', 'b[1]/b[1]', 'e[1]/+', 'vg[1]/vg[1] ; e[1]/e[1]', 'b[1] vg[1]/b[1] vg[1]', 'b[1] vg[1]/+ +', 'b[1] +/+ vg[1]', 'y[1] w[1118]/y[1] w[1118]', 'Cy[1]/+', 'Sb[1]/+', 'l(2)DEMO[1]/CyO'])
    for (const sex of (/^(w|y)\[/.test(s) ? ['F'] : ['F', 'M'])) eq(G.parseGenotype(s, { sex }).sex, sex, s);
  eq(G.parseGenotype('w[1118]/Y').sex, 'M'); eq(G.parseGenotype('y[1] w[1118]/Y').sex, 'M');
});

/* ---------- Monohybrid ---------- */
T('Monohybrid autosomal', 'vg/+ × vg/+ gives 1:2:1 genotypes and 3:1 phenotypes in each sex', () => {
  const res = G.cross(P('vg[1]/+', { sex: 'F' }), P('vg[1]/+', { sex: 'M' }));
  near(sum(res.zygotes.filter(z => G.allelesAt(z.fly, 'vg').every(a => a === 'vg1')).map(z => z.p)), 0.25);
  near(sum(res.zygotes.filter(z => new Set(G.allelesAt(z.fly, 'vg')).size === 2).map(z => z.p)), 0.5);
  near(sum(res.zygotes.filter(z => G.allelesAt(z.fly, 'vg').every(a => a === 'vg+')).map(z => z.p)), 0.25);
  for (const s of ['F', 'M']) { near(classP(res, 'wild type', s), 0.375); near(classP(res, 'vestigial wings', s), 0.125); }
  near(res.survival, 1);
});
T('Monohybrid autosomal', 'homozygous dominant × recessive: all heterozygous, all wild type', () => {
  const res = G.cross(P('+/+', { sex: 'F' }), P('vg[1]/vg[1]', { sex: 'M' }));
  eq(res.zygotes.length, 2); // two sexes, one genotype class each
  ok(res.zygotes.every(z => new Set(G.allelesAt(z.fly, 'vg')).size === 2)); near(classP(res, 'wild type'), 1);
});
T('Monohybrid autosomal', 'testcross e/+ × e/e gives 1:1', () => {
  const res = G.cross(P('e[1]/+', { sex: 'F' }), P('e[1]/e[1]', { sex: 'M' }));
  near(classP(res, 'wild type'), 0.5); near(classP(res, 'ebony body'), 0.5);
});
T('Monohybrid autosomal', 'dominant visible Sb/+ × +/+ gives 1:1 Stubble', () => {
  const res = G.cross(P('Sb[1]/+', { sex: 'F' }), P('+/+', { sex: 'M' }));
  near(classP(res, 'Stubble bristles'), 0.5);
});

/* ---------- X-linked ---------- */
T('X-linked inheritance', 'white female × red male: daughters red (carriers), sons white', () => {
  const res = X('w[1118]/w[1118]', '+/Y');
  near(classP(res, 'wild type', 'F'), 0.5); near(classP(res, 'white eyes', 'M'), 0.5);
  near(classP(res, 'white eyes', 'F'), 0); near(classP(res, 'wild type', 'M'), 0);
});
T('Reciprocal crosses', 'red female × white male: all offspring red', () => {
  const res = X('+/+', 'w[1118]/Y'); near(classP(res, 'wild type'), 1);
  near(sum(res.zygotes.filter(z => z.fly.sex === 'F' && new Set(G.allelesAt(z.fly, 'w')).size === 2).map(z => z.p)), 0.5, EPS, 'all daughters heterozygous');
});
T('Reciprocal crosses', 'reciprocal crosses differ (X-linked) but agree for autosomal vg', () => {
  const a = X('w[1118]/w[1118]', '+/Y'), b = X('+/+', 'w[1118]/Y');
  ok(Math.abs(classP(a, 'white eyes') - classP(b, 'white eyes')) > 0.4);
  const c = G.cross(P('vg[1]/vg[1]', { sex: 'F' }), P('+/+', { sex: 'M' })), d = G.cross(P('+/+', { sex: 'F' }), P('vg[1]/vg[1]', { sex: 'M' }));
  near(classP(c, 'wild type'), classP(d, 'wild type'));
});
T('X-linked inheritance', "Morgan's F2: 1/2 red females, 1/4 red males, 1/4 white males", () => {
  const res = X('w[1118]/+', '+/Y');
  near(classP(res, 'wild type', 'F'), 0.5); near(classP(res, 'wild type', 'M'), 0.25); near(classP(res, 'white eyes', 'M'), 0.25); near(classP(res, 'white eyes', 'F'), 0);
});
T('X-linked inheritance', 'hemizygous males express a single recessive X allele', () => {
  const f = P('w[1118]/Y'); eq(G.phenotypeOf(f).label, 'white eyes');
  eq(G.phenotypeOf(P('w[1118]/+')).label, 'wild type');
});
T('X-linked inheritance', 'sons receive their X only from the mother; daughters get the paternal X', () => {
  const res = X('+/+', 'y[1] w[1118]/Y');
  for (const z of res.zygotes) {
    const xs = z.fly.chromosomes.X.filter(h => h.kind === 'X');
    if (z.fly.sex === 'M') { eq(xs.length, 1); eq(xs[0].alleles.w, 'w+'); eq(xs[0].alleles.y, 'y+'); }
    else ok(xs.some(h => h.alleles.w === 'w1118' && h.alleles.y === 'y1'), 'daughter lacks paternal X');
  }
  near(sum(res.zygotes.filter(z => z.fly.sex === 'M').map(z => z.p)), 0.5);
});

/* ---------- Dihybrid ---------- */
T('Dihybrid (independent assortment)', 'vg/+ ; e/+ intercross gives exactly 9:3:3:1', () => {
  const res = G.cross(P('vg[1]/+ ; e[1]/+', { sex: 'F' }), P('vg[1]/+ ; e[1]/+', { sex: 'M' }));
  const pc = G.pooledClasses(res);
  const get = l => pc.find(c => c.label === l)?.pAdult ?? 0;
  near(get('wild type'), 9 / 16); near(get('ebony body'), 3 / 16); near(get('vestigial wings'), 3 / 16); near(get('ebony body, vestigial wings'), 1 / 16);
});
T('Dihybrid (independent assortment)', 'double heterozygote makes 4 equal gametes for unlinked loci', () => {
  const g = G.projectGametes(G.gameteDistribution(P('vg[1]/+ ; e[1]/+', { sex: 'F' })), ['vg', 'e']);
  eq(g.length, 4); g.forEach(x => near(x.p, 0.25));
});
T('Dihybrid (independent assortment)', 'dihybrid testcross gives 1:1:1:1', () => {
  const res = G.cross(P('vg[1]/+ ; e[1]/+', { sex: 'F' }), P('vg[1]/vg[1] ; e[1]/e[1]', { sex: 'M' }));
  for (const c of G.pooledClasses(res)) near(c.pAdult, 0.25);
});

/* ---------- Recombination ---------- */
const R_BVG = G.intervalRF(67.0 - 48.5, 'kosambi');
T('Recombination', 'mapping functions give known values', () => {
  near(G.intervalRF(18.5, 'linear'), 0.185); near(G.intervalRF(18.5, 'haldane'), 0.5 * (1 - Math.exp(-0.37)));
  near(G.intervalRF(18.5, 'kosambi'), 0.5 * Math.tanh(0.37)); near(G.intervalRF(500, 'kosambi'), 0.5, 1e-8); near(G.intervalRF(0), 0);
});
T('Recombination', 'coupling testcross (female het): parental (1−r)/2 each, recombinant r/2 each', () => {
  const res = G.cross(P('b[1] vg[1]/+ +', { sex: 'F' }), P('b[1] vg[1]/b[1] vg[1]', { sex: 'M' }));
  const pc = G.pooledClasses(res); const get = l => pc.find(c => c.label === l)?.pAdult ?? 0;
  near(get('wild type'), (1 - R_BVG) / 2); near(get('black body, vestigial wings'), (1 - R_BVG) / 2);
  near(get('black body'), R_BVG / 2); near(get('vestigial wings'), R_BVG / 2);
});
T('Recombination', 'repulsion phase swaps parental and recombinant classes', () => {
  const res = G.cross(P('b[1] +/+ vg[1]', { sex: 'F' }), P('b[1] vg[1]/b[1] vg[1]', { sex: 'M' }));
  const pc = G.pooledClasses(res); const get = l => pc.find(c => c.label === l)?.pAdult ?? 0;
  near(get('black body'), (1 - R_BVG) / 2); near(get('wild type'), R_BVG / 2);
});
T('Recombination', 'three-locus model: non-adjacent RF = (1 − Π(1−2rᵢ))/2 and ≤ 0.5', () => {
  const f = P('l(2)DEMO[1] b[1] vg[1]/+ + +', { sex: 'F' });
  const g = G.projectGametes(G.gameteDistribution(f), ['l(2)DEMO', 'vg']);
  const rec = sum(g.filter(x => (x.proj.alleles['l(2)DEMO'] === 'l(2)DEMO1') !== (x.proj.alleles.vg === 'vg1')).map(x => x.p));
  const r1 = G.intervalRF(18.5), r2 = G.intervalRF(18.5);
  near(rec, (1 - (1 - 2 * r1) * (1 - 2 * r2)) / 2); ok(rec <= 0.5);
  near(G.pairwiseRF('l(2)DEMO', 'vg'), rec);
});
T('Recombination', 'loci on different chromosomes behave as RF = 0.5', () => near(G.pairwiseRF('vg', 'e'), 0.5));
T('Recombination', 'X-linked y–w recombination in females', () => {
  const g = G.projectGametes(G.gameteDistribution(P('y[1] w[1118]/+ +')), ['y', 'w']);
  const r = G.intervalRF(1.5);
  near(sum(g.filter(x => x.recombinant).map(x => x.p)), r);
});
T('Recombination', 'rfOverrides replace the mapping-function value', () => {
  const res = G.cross(P('b[1] vg[1]/+ +', { sex: 'F' }), P('b[1] vg[1]/b[1] vg[1]', { sex: 'M' }), { rfOverrides: { 'b|vg': 0.17 } });
  near(G.pooledClasses(res).find(c => c.label === 'black body').pAdult, 0.085);
});

/* ---------- Male achiasmy ---------- */
T('No male meiotic crossing over', 'male coupling heterozygote testcross: only parental classes', () => {
  const res = G.cross(P('b[1] vg[1]/b[1] vg[1]', { sex: 'F' }), P('b[1] vg[1]/+ +', { sex: 'M' }));
  const pc = G.pooledClasses(res); const get = l => pc.find(c => c.label === l)?.pAdult ?? 0;
  near(get('wild type'), 0.5); near(get('black body, vestigial wings'), 0.5); near(get('black body'), 0); near(get('vestigial wings'), 0);
});
T('No male meiotic crossing over', 'no male of any genotype produces a recombinant gamete', () => {
  for (const s of GAMETE_FLIES) {
    const m = P(s.replace(/^[^;]*/, '+/Y'), { sex: 'M' });
    eq(G.recombinantGameteFraction(m), 0, s);
  }
});
T('No male meiotic crossing over', 'the same genotype recombines as a female', () => {
  near(G.recombinantGameteFraction(P('b[1] vg[1]/+ +', { sex: 'F' })), R_BVG);
  eq(G.recombinantGameteFraction(P('b[1] vg[1]/+ +', { sex: 'M' })), 0);
});

/* ---------- Viability ---------- */
T('Lethal alleles & viability', 'Cy/+ intercross: zygotes 1:2:1, adults 2:1 Curly:flat, survival 3/4', () => {
  const res = G.cross(P('Cy[1]/+', { sex: 'F' }), P('Cy[1]/+', { sex: 'M' }));
  near(res.survival, 0.75); near(classP(res, 'Curly wings'), 2 / 3); near(classP(res, 'wild type'), 1 / 3);
  near(sum(res.zygotes.filter(z => !z.viable).map(z => z.p)), 0.25);
});
T('Lethal alleles & viability', 'Sb/+ intercross: adults 2:1 Stubble', () => {
  const res = G.cross(P('Sb[1]/+', { sex: 'F' }), P('Sb[1]/+', { sex: 'M' }));
  near(classP(res, 'Stubble bristles'), 2 / 3);
});
T('Lethal alleles & viability', 'zygote vs adult distributions are both normalized', () => {
  const res = G.cross(P('Cy[1]/+ ; Sb[1]/+', { sex: 'F' }), P('Cy[1]/+ ; Sb[1]/+', { sex: 'M' }));
  near(sum(res.zygotes.map(z => z.p)), 1); near(sum(res.phenotypeClasses.map(c => c.pAdult)), 1); near(res.survival, 9 / 16);
  near(classP(res, 'Curly wings, Stubble bristles'), 4 / 9);
});

/* ---------- Balancers ---------- */
T('Balancer chromosomes', 'balanced lethal stock l/CyO breeds true; survival 1/2', () => {
  const res = G.cross(P('l(2)DEMO[1]/CyO', { sex: 'F' }), P('l(2)DEMO[1]/CyO', { sex: 'M' }));
  near(res.survival, 0.5); near(classP(res, 'Curly wings'), 1);
  for (const a of res.adults) eq(G.formatGenotype(a.fly).replace(/^\+\/Y ; /, ''), 'l(2)DEMO[1]/CyO');
});
T('Balancer chromosomes', 'female heterozygous for CyO makes no recombinant chromosome 2', () => {
  const f = P('l(2)DEMO[1] b[1] vg[1]/CyO', { sex: 'F' });
  eq(G.recombinantGameteFraction(f), 0);
  const g = G.gameteDistribution(f); eq(g.length, 2);
});
T('Balancer chromosomes', 'CyO/CyO and Cy/CyO are lethal', () => {
  ok(!G.assessViability(P('CyO/CyO', { sex: 'F' })).viable); ok(!G.assessViability(P('Cy[1]/CyO', { sex: 'F' })).viable);
  ok(G.assessViability(P('vg[1]/CyO', { sex: 'F' })).viable);
});

/* ---------- Phenotype mapping ---------- */
T('Phenotype mapping', 'labels and rendering traits', () => {
  eq(G.phenotypeOf(P('+/+')).label, 'wild type');
  const p = G.phenotypeOf(P('y[1] w[1118]/Y ; vg[1]/vg[1] ; Sb[1]/+'));
  eq(p.label, 'white eyes, yellow body, vestigial wings, Stubble bristles'); eq(p.traits.wings, 'vestigial'); eq(p.traits.eye, 'white');
  eq(G.phenotypeOf(P('Cy[1]/+', { sex: 'F' })).traits.wings, 'curly');
  eq(G.phenotypeOf(P('e[1]/e[1]', { sex: 'F' })).traits.body, 'ebony');
  eq(G.phenotypeOf(P('e[1]/+', { sex: 'F' })).label, 'wild type', 'heterozygous recessive is wild type');
});
T('Phenotype mapping', 'Curly is not scorable on vestigial wings', () => {
  const p = G.phenotypeOf(P('Cy[1] vg[1]/+ vg[1]', { sex: 'F' }));
  eq(p.traits.wings, 'vestigial'); ok(p.notes.length === 1);
});

/* ---------- Statistics ---------- */
T('Chi-square', 'critical-value p-values match tables', () => {
  near(G.chiSquarePValue(3.841459, 1), 0.05, 1e-6); near(G.chiSquarePValue(5.991465, 2), 0.05, 1e-6);
  near(G.chiSquarePValue(7.814728, 3), 0.05, 1e-6); near(G.chiSquarePValue(6.634897, 1), 0.01, 1e-6);
  near(G.chiSquarePValue(0, 3), 1); near(G.chiSquareCritical(0.05, 3), 7.814728, 1e-4);
  near(G.chiSquarePValue(100, 2), Math.exp(-50), 1e-25); // df=2: exact p = e^{-x/2}
});
T('Chi-square', "Mendel's dihybrid pea data (315:108:101:32) vs 9:3:3:1", () => {
  const r = G.chiSquareGOF([315, 108, 101, 32], [9, 3, 3, 1]);
  near(r.chi2, 0.470024, 1e-5); eq(r.df, 3); near(r.p, 0.925426, 1e-4); ok(!r.reject);
});
T('Chi-square', 'df accounts for estimated parameters; small expected counts warn', () => {
  eq(G.chiSquareGOF([10, 20, 30], [1, 1, 1], { estimatedParams: 1 }).df, 1);
  ok(G.chiSquareGOF([3, 1], [3, 1]).warnings.some(w => w.includes('below 5')));
  const imp = G.chiSquareGOF([5, 5], [1, 0]); eq(imp.chi2, Infinity);
});
T('Chi-square', 'worked example: 3:1 with 290 vs 110 (N=400)', () => {
  const r = G.chiSquareGOF([290, 110], [3, 1]); near(r.chi2, (290 - 300) ** 2 / 300 + (110 - 100) ** 2 / 100, 1e-12); near(r.chi2, 1.333333, 1e-6);
  ok(!G.interpretChiSquare(r).toLowerCase().includes('proves'));
});
T('Chi-square', 'interpretation never claims proof', () => {
  const t = G.interpretChiSquare(G.chiSquareGOF([75, 25], [3, 1])); ok(t.includes('NOT proof'));
});
T('Chi-square', 'recombination estimate and standard error', () => {
  const e = G.recombinationEstimate(18, 100); near(e.r, 0.18); near(e.se, Math.sqrt(0.18 * 0.82 / 100));
});

/* ---------- Random sampling ---------- */
T('Reproducible sampling', 'same seed → identical counts; different seed → different', () => {
  const res = G.cross(P('vg[1]/+ ; e[1]/+', { sex: 'F' }), P('vg[1]/+ ; e[1]/+', { sex: 'M' }));
  const a = G.simulateOffspring(res, 500, 12345), b = G.simulateOffspring(res, 500, 12345), c = G.simulateOffspring(res, 500, 54321);
  eq(JSON.stringify(a.classCounts.map(x => x.count)), JSON.stringify(b.classCounts.map(x => x.count)));
  ok(JSON.stringify(a.classCounts.map(x => x.count)) !== JSON.stringify(c.classCounts.map(x => x.count)));
  eq(sum(a.classCounts.map(x => x.count)), 500);
});
T('Reproducible sampling', 'PRNG first outputs are stable (regression)', () => {
  const r = G.mulberry32(1); const v = [r(), r(), r()];
  ok(v.every(x => x >= 0 && x < 1)); const r2 = G.mulberry32(1); eq(r2(), v[0]);
});

/* ---------- Stochastic convergence (large samples) ---------- */
T('Convergence', '3:1 monohybrid: 200,000 adults within 4 SE of 0.75', () => {
  const res = G.cross(P('vg[1]/+', { sex: 'F' }), P('vg[1]/+', { sex: 'M' }));
  const n = 200000, s = G.simulateOffspring(res, n, 2026);
  const wt = sum(s.classCounts.filter(c => c.label === 'wild type').map(c => c.count)) / n;
  near(wt, 0.75, 4 * Math.sqrt(0.75 * 0.25 / n));
}, 'stochastic');
T('Convergence', 'linkage: observed RF converges on model RF (100,000)', () => {
  const res = G.cross(P('b[1] vg[1]/+ +', { sex: 'F' }), P('b[1] vg[1]/b[1] vg[1]', { sex: 'M' }));
  const n = 100000, s = G.simulateOffspring(res, n, 77);
  const rec = sum(s.classCounts.filter(c => c.label === 'black body' || c.label === 'vestigial wings').map(c => c.count)) / n;
  near(rec, R_BVG, 4 * Math.sqrt(R_BVG * (1 - R_BVG) / n));
}, 'stochastic');
T('Convergence', 'lethal filtering: inviable fraction of zygotes ≈ 1/4 (Cy/+ intercross)', () => {
  const res = G.cross(P('Cy[1]/+', { sex: 'F' }), P('Cy[1]/+', { sex: 'M' }));
  const s = G.simulateOffspring(res, 60000, 99); const z = s.nAdults + s.inviable;
  near(s.inviable / z, 0.25, 4 * Math.sqrt(0.25 * 0.75 / z));
  const cy = sum(s.classCounts.filter(c => c.label === 'Curly wings').map(c => c.count)) / s.nAdults;
  near(cy, 2 / 3, 4 * Math.sqrt((2 / 9) / s.nAdults));
}, 'stochastic');
T('Convergence', 'X-linked F2 sex-specific frequencies (100,000)', () => {
  const res = X('w[1118]/+', '+/Y'); const n = 100000, s = G.simulateOffspring(res, n, 5);
  const wm = sum(s.classCounts.filter(c => c.label === 'white eyes' && c.sex === 'M').map(c => c.count)) / n;
  const wf = sum(s.classCounts.filter(c => c.label === 'white eyes' && c.sex === 'F').map(c => c.count));
  near(wm, 0.25, 4 * Math.sqrt(0.25 * 0.75 / n)); eq(wf, 0);
}, 'stochastic');
T('Convergence', 'chi-square calibration: Type I error ≈ α over 2,000 simulated experiments', () => {
  const res = G.cross(P('vg[1]/+ ; e[1]/+', { sex: 'F' }), P('vg[1]/+ ; e[1]/+', { sex: 'M' }));
  const reps = 2000; let rej = 0;
  for (let i = 0; i < reps; i++) {
    const s = G.simulateOffspring(res, 400, 1000 + i, { keepIndividuals: 0 });
    const pc = new Map(); s.classCounts.forEach(c => pc.set(c.label, (pc.get(c.label) || 0) + c.count));
    const obs = ['wild type', 'ebony body', 'vestigial wings', 'ebony body, vestigial wings'].map(l => pc.get(l) || 0);
    if (G.chiSquareGOF(obs, [9, 3, 3, 1]).p < 0.05) rej++;
  }
  near(rej / reps, 0.05, 4 * Math.sqrt(0.05 * 0.95 / reps));
}, 'stochastic');
T('Convergence', 'sampler reproduces arbitrary categorical distribution', () => {
  const probs = [0.1, 0.2, 0.3, 0.4], pick = G.makeSampler(probs), rng = G.mulberry32(42), n = 200000, c = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) c[pick(rng())]++;
  probs.forEach((p, i) => near(c[i] / n, p, 4 * Math.sqrt(p * (1 - p) / n)));
}, 'stochastic');

export async function runAll(log = console.log) {
  const results = [];
  for (const t of tests) {
    const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
    try { await t.fn(); results.push({ ...t, pass: true }); }
    catch (e) { results.push({ ...t, pass: false, error: e.message }); }
    results[results.length - 1].ms = Math.round((typeof performance !== 'undefined' ? performance : Date).now() - t0);
  }
  const pass = results.filter(r => r.pass).length;
  for (const r of results) log(`${r.pass ? 'PASS' : 'FAIL'}  [${r.kind}] ${r.group} — ${r.name}${r.pass ? '' : '\n      → ' + r.error} (${r.ms} ms)`);
  log(`\n${pass}/${results.length} tests passed.`);
  return { results, pass, total: results.length };
}
