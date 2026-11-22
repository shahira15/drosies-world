/**
 * Research missions. Each mission is driven by REAL experiments: steps are completed by
 * events emitted from the stations (crosses, inspections, Punnett checks, chi-square tests,
 * notebook entries), and the final assessment is checked against the player's own data or
 * against the engine's exact model — never against a hard-coded random outcome.
 */
import { flyKey, parseGenotype, chiSquareGOF, LOCI } from './engine/index.js';

const key = (fly) => flyKey(fly);
const g = (text, sex) => key(parseGenotype(text, { sex }));
export const isGeno = (fly, text) => { if (!fly) return false; try { return key(fly) === g(text, fly.sex); } catch { return false; } };
const crossIs = (rec, mText, fText) => isGeno(rec.mother, mText) && isGeno(rec.father, fText);
const count = (rec, pred) => rec.classCounts.filter(pred).reduce((s, c) => s + c.count, 0);
const total = rec => rec.classCounts.reduce((s, c) => s + c.count, 0);
const has = (rec, label) => rec.classCounts.some(c => c.label.includes(label) && c.count > 0);
const anyVg = f => f.chromosomes['2'].some(h => h.alleles.vg === 'vg1');

export const MODES = {
  little: { name: 'Little Geneticist', ages: 'Ages 5–8', color: '#ffb84d' },
  junior: { name: 'Junior Geneticist', ages: 'Ages 9–12', color: '#58d6ff' },
  researcher: { name: 'Genetics Researcher', ages: 'Ages 13–17', color: '#a6f08a' },
  university: { name: 'University Fly Genetics', ages: 'Undergraduate', color: '#d7a6ff' }
};

export const MISSIONS = [
  /* ---------------- LITTLE GENETICIST ---------------- */
  {
    id: 'L1', mode: 'little', title: 'Why do these flies look different?', station: 'microscope',
    objectives: ['Observe that living things have traits you can see', 'Compare two flies carefully'],
    background: 'Scientists look very closely at living things. Fruit flies are tiny, so we use a microscope. Even flies of the same kind can look a little different!',
    model: 'Observation only — no crosses. The white-eyed stock carries the X-linked recessive allele w1118.',
    steps: [
      { id: 'a', text: 'Look at the Everyday fly under the microscope.', where: 'microscope', check: ev => ev.type === 'inspect' && ev.stockId === 'wt' },
      { id: 'b', text: 'Look at the Snowy-eyed fly under the microscope.', where: 'microscope', check: ev => ev.type === 'inspect' && ev.stockId === 'white' }
    ],
    quiz: { prompt: 'What is different about the two flies?', kind: 'choice', picture: true,
      options: ['Their eye color', 'Their number of legs', 'Their wing size', 'Nothing is different'], answer: () => 0 },
    feedback: { correct: 'Yes! One fly has red eyes and one has white eyes. Eye color is a TRAIT — something you can observe.', incorrect: 'Look again at the heads. Use the zoom slider to get closer to the eyes!' }
  },
  {
    id: 'L2', mode: 'little', title: 'Predict the offspring', station: 'breeding',
    objectives: ['Make a prediction before an experiment', 'Compare a prediction with what really happened'],
    background: 'Scientists guess what will happen BEFORE they do an experiment. That guess is called a prediction. Then they check!',
    model: 'vg1/vg1 × vg1/vg1 → all vg1/vg1 offspring (true-breeding stock).',
    prediction: { prompt: 'Two tiny-wing flies will have babies. What will the babies look like?', options: ['Tiny wings', 'Long wings', 'Some of each'] },
    steps: [
      { id: 'p', text: 'Make your prediction (below).', check: ev => ev.type === 'prediction' },
      { id: 'a', text: 'Mate a tiny-wing mom with a tiny-wing dad at the Breeding Station.', where: 'breeding', check: ev => ev.type === 'cross' && crossIs(ev.record, 'vg[1]/vg[1]', 'vg[1]/vg[1]') },
      { id: 'b', text: 'Look at one of the babies under the microscope.', where: 'microscope', check: ev => ev.type === 'inspect' && ev.source === 'offspring' }
    ],
    quiz: { prompt: 'What did the babies look like?', kind: 'choice', options: ['All had tiny wings', 'All had long wings', 'Some of each'], answer: () => 0 },
    feedback: { correct: 'Right! Tiny-wing parents had tiny-wing babies. Parents and offspring can share traits. Was your prediction right?', incorrect: 'Check the results at the Breeding Station again — count the pictures!' }
  },
  {
    id: 'L3', mode: 'little', title: 'The hide-and-seek trait', station: 'breeding',
    objectives: ['Notice that a trait can seem to disappear in children', 'Compare observations with a partner (or Drosie!)'],
    background: 'Sometimes babies do not look like one of their parents. Where did that trait go? Let’s find out!',
    model: 'e1/e1 × +/+ → all e1/+ (wild-type looking). The ebony allele is recessive; it returns in the next generation.',
    steps: [
      { id: 'a', text: 'Mate a Dark fly with an Everyday fly.', where: 'breeding', check: ev => ev.type === 'cross' && ((crossIs(ev.record, 'e[1]/e[1]', '+/Y')) || crossIs(ev.record, '+/+', 'e[1]/e[1]')) },
      { id: 'b', text: 'Look at a baby under the microscope.', where: 'microscope', check: ev => ev.type === 'inspect' && ev.source === 'offspring' }
    ],
    quiz: { prompt: 'Did any babies have a dark body?', kind: 'choice', options: ['No — they all looked tan', 'Yes — all of them', 'Yes — about half'], answer: () => 0 },
    feedback: { correct: 'The dark color is hiding! The babies carry it, but you can’t see it. When older, scientists call this a "recessive" trait. Try mating two of the babies later in Junior mode!', incorrect: 'Look closely at the baby pictures. Are their bodies tan or dark?' }
  },
  /* ---------------- JUNIOR ---------------- */
  {
    id: 'J1', mode: 'junior', title: 'Discover a recessive trait', station: 'breeding',
    objectives: ['Perform a P (parental), F1 and F2 cross', 'Identify dominant and recessive alleles', 'Recognize a 3:1 ratio'],
    background: 'Gregor Mendel found that some traits disappear in one generation and return in the next. A "recessive" allele only shows when an organism has two copies. Repeat Mendel’s experiment with fruit flies!',
    model: 'P: vg1/vg1 × +/+ → F1 vg1/+ (all normal wings). F1 × F1 → 1 +/+ : 2 vg1/+ : 1 vg1/vg1, phenotypes 3 normal : 1 vestigial.',
    steps: [
      { id: 'a', text: 'P cross: vestigial × wild type (either way round).', where: 'breeding', check: ev => ev.type === 'cross' && (crossIs(ev.record, 'vg[1]/vg[1]', '+/Y') || crossIs(ev.record, '+/+', 'vg[1]/vg[1]')) },
      { id: 'b', text: 'Collect an F1 female AND an F1 male from that vial ("Keep flies").', where: 'breeding', check: (ev, ctx) => { if (ev.type === 'collect' && isGeno(ev.fly, 'vg[1]/+')) ctx.mem[ev.fly.sex] = true; return ctx.mem.F && ctx.mem.M; } },
      { id: 'c', text: 'F1 × F1 cross (use your collected flies), with at least 100 offspring.', where: 'breeding', check: ev => ev.type === 'cross' && crossIs(ev.record, 'vg[1]/+', 'vg[1]/+') && total(ev.record) >= 100 }
    ],
    quiz: { prompt: 'Which allele is recessive, and what ratio did the F2 approach?', kind: 'choice',
      options: ['vestigial is recessive; about 3 normal : 1 vestigial', 'vestigial is dominant; about 3 vestigial : 1 normal', 'normal wings are recessive; about 1 : 1', 'Neither; all F2 looked the same'], answer: () => 0 },
    feedback: { correct: 'Excellent! The vestigial trait vanished in the F1 and returned in about 1/4 of the F2. Your numbers were not EXACTLY 3:1 — that is normal random variation.', incorrect: 'Look at the F1: what did every fly look like? That trait is dominant.' }
  },
  {
    id: 'J2', mode: 'junior', title: 'Predict with a Punnett square', station: 'punnett',
    objectives: ['Write the gametes each parent can make', 'Use a Punnett square to predict offspring proportions', 'Test the prediction with a real (simulated) cross'],
    background: 'A Punnett square lists each parent’s possible gametes (eggs or sperm) along its edges. Each box is one equally likely combination.',
    model: 'e1/+ × e1/+ → 1/4 e1/e1 (ebony), 3/4 wild type.',
    steps: [
      { id: 'a', text: 'Choose two ebony carriers (e¹/+) as parents at the Stock Center.', where: 'stocks', check: (ev) => ev.type === 'parents' && ev.mother && ev.father && isGeno(ev.mother, 'e[1]/+') && isGeno(ev.father, 'e[1]/+') },
      { id: 'b', text: 'At the Punnett Workbench, enter your prediction in Prediction mode and check it.', where: 'punnett', check: ev => ev.type === 'punnett-check' && ev.correct && isGeno(ev.mother, 'e[1]/+') && isGeno(ev.father, 'e[1]/+') },
      { id: 'c', text: 'Breed them with at least 100 offspring.', where: 'breeding', check: ev => ev.type === 'cross' && crossIs(ev.record, 'e[1]/+', 'e[1]/+') && total(ev.record) >= 100 }
    ],
    quiz: { prompt: 'What fraction of offspring did the Punnett square predict would be ebony?', kind: 'choice', options: ['1/4', '1/2', '3/4', '0'], answer: () => 0 },
    feedback: { correct: 'Yes — one box in four. Compare that prediction with the observed fraction in your results.', incorrect: 'Count the boxes with e/e in the Punnett square.' }
  },
  {
    id: 'J3', mode: 'junior', title: 'Why aren’t my numbers perfect?', station: 'breeding',
    objectives: ['Understand that chance causes variation', 'See that larger samples usually land closer to the expected ratio'],
    background: 'A Punnett square gives probabilities, not guarantees. Flipping a coin 10 times rarely gives exactly 5 heads!',
    model: 'Same cross repeated with different sample sizes; sampling error shrinks roughly as 1/√N.',
    steps: [
      { id: 'a', text: 'Do any single-gene intercross with exactly 20 offspring.', where: 'breeding', check: (ev, ctx) => { if (ev.type === 'cross' && total(ev.record) === 20) { ctx.mem.small = ev.record.id; return true; } return false; } },
      { id: 'b', text: 'Repeat the SAME parents with 1,000 offspring.', where: 'breeding', check: (ev, ctx) => { if (ev.type === 'cross' && total(ev.record) >= 1000 && ctx.mem.small) { const s = ctx.app.getRecord(ctx.mem.small); if (s && key(s.mother) === key(ev.record.mother) && key(s.father) === key(ev.record.father)) { ctx.mem.big = ev.record.id; return true; } } return false; } }
    ],
    quiz: { prompt: 'Which of YOUR two experiments came closer to the expected proportions?', kind: 'choice', options: ['The 20-offspring experiment', 'The 1,000-offspring experiment'],
      answer: ctx => { const d = id => { const r = ctx.app.getRecord(id); const n = total(r); return r.classCounts.reduce((s, c) => s + Math.abs(c.count / n - c.expectedP), 0); }; return d(ctx.mem.small) < d(ctx.mem.big) ? 0 : 1; } },
    feedback: { correct: 'Right — based on your own data. Bigger samples USUALLY land closer, but chance means not always!', incorrect: 'Compare the "observed" and "expected" columns for both runs in the Data computer.' }
  },
  /* ---------------- RESEARCHER ---------------- */
  {
    id: 'R1', mode: 'researcher', title: 'The mystery of white eyes', station: 'breeding',
    objectives: ['Reproduce T. H. Morgan’s 1910 experiment', 'Explain X-linked inheritance and male hemizygosity'],
    background: 'In 1910 Thomas Hunt Morgan found a white-eyed male among red-eyed flies. When he bred its descendants, white eyes reappeared — but only in males. This was key evidence that genes are on chromosomes.',
    model: 'P: +/+ ♀ × w/Y ♂ → F1 w/+ ♀ and +/Y ♂ (all red). F2: 1/2 red ♀, 1/4 red ♂, 1/4 white ♂.',
    steps: [
      { id: 'a', text: 'P cross: red-eyed female × white-eyed male.', where: 'breeding', check: ev => ev.type === 'cross' && crossIs(ev.record, '+/+', 'w[1118]/Y') },
      { id: 'b', text: 'Keep an F1 female and an F1 male.', where: 'breeding', check: (ev, ctx) => { if (ev.type === 'collect' && (isGeno(ev.fly, 'w[1118]/+') || isGeno(ev.fly, '+/Y'))) ctx.mem[ev.fly.sex] = true; return ctx.mem.F && ctx.mem.M; } },
      { id: 'c', text: 'F1 × F1 with at least 200 offspring.', where: 'breeding', check: ev => ev.type === 'cross' && crossIs(ev.record, 'w[1118]/+', '+/Y') && total(ev.record) >= 200 }
    ],
    quiz: { prompt: 'In your F2, which flies had white eyes?', kind: 'choice', options: ['Only males', 'Only females', 'Males and females equally', 'None'],
      answer: ctx => { const r = ctx.app.lastRecordWhere(r => crossIs(r, 'w[1118]/+', '+/Y')); const f = count(r, c => c.sex === 'F' && c.label.includes('white')), m = count(r, c => c.sex === 'M' && c.label.includes('white')); return m > 0 && f === 0 ? 0 : f > 0 && m === 0 ? 1 : m && f ? 2 : 3; } },
    feedback: { correct: 'Exactly as Morgan saw. Males have one X (they are hemizygous), so a single recessive w allele is expressed. F1 daughters carried w on one X and passed it to half their sons.', incorrect: 'Split your F2 results by sex at the Data computer.' }
  },
  {
    id: 'R2', mode: 'researcher', title: 'Compare reciprocal crosses', station: 'breeding',
    objectives: ['Perform reciprocal crosses', 'Use them to distinguish X-linked from autosomal inheritance'],
    background: 'A reciprocal cross swaps which parent carries the trait. For autosomal genes the results match; for X-linked genes they differ.',
    model: 'w/w ♀ × +/Y ♂ → w/+ ♀ (red), w/Y ♂ (white). Reciprocal +/+ ♀ × w/Y ♂ → all red.',
    steps: [
      { id: 'a', text: 'White-eyed female × red-eyed male.', where: 'breeding', check: ev => ev.type === 'cross' && crossIs(ev.record, 'w[1118]/w[1118]', '+/Y') },
      { id: 'b', text: 'Reciprocal: red-eyed female × white-eyed male.', where: 'breeding', check: ev => ev.type === 'cross' && crossIs(ev.record, '+/+', 'w[1118]/Y') },
      { id: 'c', text: 'For comparison, do both reciprocal crosses for vestigial (autosomal).', where: 'breeding', check: (ev, ctx) => { if (ev.type !== 'cross') return false; if (crossIs(ev.record, 'vg[1]/vg[1]', '+/Y')) ctx.mem.v1 = 1; if (crossIs(ev.record, '+/+', 'vg[1]/vg[1]')) ctx.mem.v2 = 1; return ctx.mem.v1 && ctx.mem.v2; } }
    ],
    quiz: { prompt: 'Why did the white-eye reciprocal crosses give different results?', kind: 'choice',
      options: ['w is on the X chromosome: sons get their only X from their mother', 'White eyes are dominant in males', 'Mothers always pass more genes than fathers', 'Random chance'], answer: () => 0 },
    feedback: { correct: 'Correct. The vestigial reciprocals matched because vg is on an autosome (chromosome 2), which both sexes carry in two copies.', incorrect: 'Think about which parent gives a son his X chromosome.' }
  },
  {
    id: 'R3', mode: 'researcher', title: 'Solve a dihybrid cross', station: 'analysis',
    objectives: ['Follow two genes at once', 'Recognize independent assortment (9:3:3:1)', 'Test data with chi-square'],
    background: 'Genes on different chromosomes assort independently in meiosis. vestigial is on chromosome 2 and ebony on chromosome 3.',
    model: 'vg1/+ ; e1/+ intercross → 9 wild : 3 ebony : 3 vestigial : 1 vestigial ebony.',
    steps: [
      { id: 'a', text: 'Cross vestigial-ebony with wild type to make F1 double heterozygotes.', where: 'breeding', check: ev => ev.type === 'cross' && (crossIs(ev.record, 'vg[1]/vg[1] ; e[1]/e[1]', '+/Y') || crossIs(ev.record, '+/+', 'vg[1]/vg[1] ; e[1]/e[1]')) },
      { id: 'b', text: 'Keep F1 flies and intercross them (≥ 400 offspring).', where: 'breeding', check: (ev, ctx) => { if (ev.type === 'cross' && crossIs(ev.record, 'vg[1]/+ ; e[1]/+', 'vg[1]/+ ; e[1]/+') && total(ev.record) >= 400) { ctx.mem.rec = ev.record.id; return true; } return false; } },
      { id: 'c', text: 'At the Data computer, test the F2 against 9:3:3:1 with chi-square.', where: 'analysis', check: (ev, ctx) => ev.type === 'chi' && ev.recordId === ctx.mem.rec && ev.k === 4 }
    ],
    quiz: { prompt: 'How many degrees of freedom does a chi-square test of four phenotype classes against 9:3:3:1 have?', kind: 'number', answer: () => 3, tol: 0 },
    feedback: { correct: 'df = classes − 1 = 3 (no parameters were estimated from the data).', incorrect: 'df = (number of classes) − 1 − (parameters estimated from the data).' }
  },
  {
    id: 'R4', mode: 'researcher', title: 'Testcross the mystery fly', station: 'breeding',
    objectives: ['Design a testcross', 'Infer an unknown genotype from offspring', 'Reason about the strength of evidence'],
    background: 'A dominant phenotype can hide two genotypes (+/+ or vg/+). Crossing to a homozygous recessive "tester" reveals which alleles the unknown parent passes on.',
    model: 'Mystery ♀ × vg1/vg1 ♂: if she is vg1/+ → 1/2 vestigial; if +/+ → none. P(no vestigial in n offspring | vg1/+) = (1/2)^n.',
    steps: [
      { id: 'a', text: 'Cross the Mystery wild-type female to a vestigial male, with at least 20 offspring.', where: 'breeding', check: ev => ev.type === 'cross' && ev.record.motherStockId === 'mystery' && isGeno(ev.record.father, 'vg[1]/vg[1]') && total(ev.record) >= 20 }
    ],
    quiz: { prompt: 'What is the mystery female’s genotype at vestigial?', kind: 'choice', options: ['vg⁺/vg⁺ (homozygous)', 'vg¹/vg⁺ (heterozygous)'],
      answer: ctx => (anyVg(ctx.app.mysteryFly()) ? 1 : 0) },
    feedback: { correct: 'Well reasoned. One vestigial offspring proves she carries vg1. Seeing none is strong — but never absolute — evidence: with 20 offspring a heterozygote would give no vestigial flies only (1/2)^20 ≈ 1 in a million times.', incorrect: 'Did ANY offspring have vestigial wings? Each one must have received vg1 from its mother.' }
  },
  {
    id: 'R5', mode: 'researcher', title: 'Analyze experimental results', station: 'analysis',
    objectives: ['Compare observed and expected counts', 'Run a chi-square goodness-of-fit test', 'Interpret a p-value correctly'],
    background: 'Chi-square asks: if my hypothesis were true, how often would chance alone produce deviations at least this large?',
    model: 'χ² = Σ (O − E)² / E, df = k − 1 − (estimated parameters).',
    steps: [
      { id: 'a', text: 'Run any cross with at least 100 offspring.', where: 'breeding', check: ev => ev.type === 'cross' && total(ev.record) >= 100 },
      { id: 'b', text: 'Run a chi-square test at the Data computer.', where: 'analysis', check: (ev, ctx) => { if (ev.type === 'chi' && Number.isFinite(ev.result.p)) { ctx.mem.p = ev.result.p; return true; } return false; } }
    ],
    quiz: { prompt: 'Suppose p = 0.40. What may you conclude?', kind: 'choice',
      options: ['The data are consistent with the hypothesis, but this does not prove it is correct', 'The hypothesis is proven true', 'There is a 40% chance the hypothesis is true', 'The hypothesis must be rejected'], answer: () => 0 },
    feedback: { correct: 'Exactly. A p-value is the probability of data at least this extreme IF the hypothesis were true — not the probability that the hypothesis is true.', incorrect: 'A large p-value means we fail to reject. Can a test ever prove a model?' }
  },
  /* ---------------- UNIVERSITY ---------------- */
  {
    id: 'U1', mode: 'university', title: 'Identify a linked trait & discover recombination', station: 'analysis',
    objectives: ['Perform a two-point testcross', 'Identify parental and recombinant classes', 'Estimate a recombination fraction with its standard error'],
    background: 'b (2-48.5) and vg (2-67.0) are both on chromosome 2. In female meiosis, crossing over between them generates recombinant chromosomes.',
    model: 'b vg/+ + ♀ × b vg/b vg ♂. Parental classes (1−r)/2 each; recombinant classes r/2 each. Engine r for 18.5 cM (Kosambi) ≈ 0.177.',
    steps: [
      { id: 'a', text: 'Testcross: coupling heterozygous FEMALE (b vg/+ +) × black vestigial male, ≥ 500 offspring.', where: 'breeding', check: (ev, ctx) => { if (ev.type === 'cross' && crossIs(ev.record, 'b[1] vg[1]/+ +', 'b[1] vg[1]/b[1] vg[1]') && total(ev.record) >= 500) { ctx.mem.rec = ev.record.id; return true; } return false; } },
      { id: 'b', text: 'At the Data computer, mark the recombinant classes and estimate r.', where: 'analysis', check: (ev, ctx) => ev.type === 'rf' && ev.recordId === ctx.mem.rec && ev.labels.sort().join('|') === ['black body', 'vestigial wings'].join('|') }
    ],
    quiz: { prompt: 'Enter YOUR observed recombination frequency (as a %, e.g. 17.6).', kind: 'number',
      answer: ctx => { const r = ctx.app.getRecord(ctx.mem.rec); return 100 * count(r, c => c.label === 'black body' || c.label === 'vestigial wings') / total(r); }, tol: 0.15 },
    feedback: { correct: 'Correct. Compare with the classical map distance of 18.5 cM: map distances are summed from short intervals and are not identical to an observed RF; this simulator converts map distance to RF with the Kosambi function (≈ 17.7%).', incorrect: 'RF = (number of recombinant offspring) ÷ (total offspring) × 100. Recombinant classes are the non-parental combinations: black-only and vestigial-only.' }
  },
  {
    id: 'U2', mode: 'university', title: 'No crossing over in males', station: 'breeding',
    objectives: ['Test the sex-specificity of recombination', 'Explain achiasmate male meiosis in D. melanogaster'],
    background: 'Standard D. melanogaster males do not undergo meiotic crossing over. Morgan noticed this early on; it is why linkage testcrosses always use heterozygous FEMALES.',
    model: 'b vg/b vg ♀ × b vg/+ + ♂ → only parental classes (1:1), r = 0.',
    steps: [
      { id: 'a', text: 'Reverse the testcross: black vestigial FEMALE × coupling heterozygous MALE (≥ 500).', where: 'breeding', check: (ev, ctx) => { if (ev.type === 'cross' && crossIs(ev.record, 'b[1] vg[1]/b[1] vg[1]', 'b[1] vg[1]/+ +') && total(ev.record) >= 500) { ctx.mem.rec = ev.record.id; return true; } return false; } }
    ],
    quiz: { prompt: 'What recombination frequency (%) did you observe?', kind: 'number', answer: ctx => { const r = ctx.app.getRecord(ctx.mem.rec); return 100 * count(r, c => c.label === 'black body' || c.label === 'vestigial wings') / total(r); }, tol: 0.01 },
    feedback: { correct: 'Zero recombinants — male meiosis is achiasmate. (Rare male recombination can be induced, e.g. by P-element activity in dysgenic crosses; not modeled.)', incorrect: 'Count black-only and vestigial-only offspring in this cross.' }
  },
  {
    id: 'U3', mode: 'university', title: 'Why are some offspring missing?', station: 'analysis',
    objectives: ['Recognize a 2:1 ratio as a signature of recessive lethality', 'Compare competing hypotheses with chi-square'],
    background: 'Curly (Duox[Cy]) is a dominant wing marker, but Cy/Cy homozygotes die. Inviable zygotes never appear among adults.',
    model: 'Cy/+ × Cy/+ → zygotes 1 Cy/Cy : 2 Cy/+ : 1 +/+; adults 2 Curly : 1 flat.',
    steps: [
      { id: 'a', text: 'Intercross Curly (Cy/+) flies with ≥ 300 offspring.', where: 'breeding', check: (ev, ctx) => { if (ev.type === 'cross' && crossIs(ev.record, 'Cy[1]/+', 'Cy[1]/+') && total(ev.record) >= 300) { ctx.mem.rec = ev.record.id; return true; } return false; } },
      { id: 'b', text: 'Test the result against 3:1.', where: 'analysis', check: (ev, ctx) => { if (ev.type === 'chi' && ev.recordId === ctx.mem.rec && ev.ratio === '3:1') { ctx.mem.p31 = ev.result.p; return true; } return false; } },
      { id: 'c', text: 'Test the result against 2:1.', where: 'analysis', check: (ev, ctx) => { if (ev.type === 'chi' && ev.recordId === ctx.mem.rec && ev.ratio === '2:1') { ctx.mem.p21 = ev.result.p; return true; } return false; } }
    ],
    quiz: { prompt: 'What did YOUR tests show (α = 0.05)?', kind: 'choice',
      options: ['3:1 rejected; 2:1 not rejected', '3:1 not rejected; 2:1 rejected', 'Both rejected', 'Neither rejected'],
      answer: ctx => { const a = ctx.mem.p31 < 0.05, b = ctx.mem.p21 < 0.05; return a && !b ? 0 : !a && b ? 1 : a && b ? 2 : 3; } },
    feedback: { correct: 'Right. A 2:1 ratio among survivors is the classic signature of a recessive lethal allele with a dominant visible effect. Failing to reject 2:1 is consistent with — not proof of — lethality.', incorrect: 'Look at the two p-values you computed. Which one is below 0.05?' }
  },
  {
    id: 'U4', mode: 'university', title: 'Maintain a balanced stock', station: 'breeding',
    objectives: ['Explain how balancers maintain recessive lethal mutations', 'Predict outcomes of balanced-lethal crosses'],
    background: 'A recessive lethal cannot be kept homozygous. Over a balancer such as CyO — which carries a dominant marker (Curly), is itself homozygous lethal, and suppresses recovery of crossovers — the stock breeds true.',
    model: 'l/CyO × l/CyO → zygotes 1 l/l (dies) : 2 l/CyO : 1 CyO/CyO (dies). All adults l/CyO (Curly). Simplified model: crossover chromosomes are never recovered.',
    steps: [
      { id: 'a', text: 'Intercross l(2)DEMO/CyO flies.', where: 'breeding', check: ev => ev.type === 'cross' && crossIs(ev.record, 'l(2)DEMO[1]/CyO', 'l(2)DEMO[1]/CyO') },
      { id: 'b', text: 'Outcross l(2)DEMO/CyO to wild type and compare.', where: 'breeding', check: ev => ev.type === 'cross' && (crossIs(ev.record, 'l(2)DEMO[1]/CyO', '+/Y') || crossIs(ev.record, '+/+', 'l(2)DEMO[1]/CyO')) },
      { id: 'c', text: 'Check the parental chromosomes at the Chromosome Explorer (meiosis with a balancer).', where: 'chromosomes', check: ev => ev.type === 'meiosis' && ev.balancer }
    ],
    quiz: { prompt: 'Why is every surviving offspring of l/CyO × l/CyO Curly?', kind: 'choice',
      options: ['l/l and CyO/CyO zygotes die, so only l/CyO adults survive', 'Curly is dominant, so it always shows in 3/4 of offspring', 'CyO prevents the lethal allele from being transmitted', 'Balancers convert wild-type alleles into Curly'], answer: () => 0 },
    feedback: { correct: 'Yes — the stock breeds true because both homozygous classes die, and suppressed crossing over keeps l(2)DEMO on its original chromosome. In the outcross, half the progeny are CyO/+ (Curly) and half are l(2)DEMO/+ (flat wings) — and the flat ones are the heterozygous carriers you would select to study the mutation.', incorrect: 'Look at the zygote table in your results: which genotypes did not survive?' }
  },
  {
    id: 'U5', mode: 'university', title: 'Design your own genetic investigation', station: 'notebook',
    objectives: ['Pose a testable question', 'Design an appropriate cross', 'Analyze and report with limitations'],
    background: 'Real research begins with a question. Use any stocks and any cross. Your notebook entry is your lab report.',
    model: 'Player-designed. The engine computes the correct expectation for whatever you choose.',
    steps: [
      { id: 'a', text: 'Run a cross with ≥ 200 offspring.', where: 'breeding', check: ev => ev.type === 'cross' && total(ev.record) >= 200 },
      { id: 'b', text: 'Run a chi-square test on it.', where: 'analysis', check: ev => ev.type === 'chi' },
      { id: 'c', text: 'Save a notebook entry with question, hypothesis, attached cross, conclusion AND limitations.', where: 'notebook', check: ev => ev.type === 'notebook-save' && ['question', 'hypothesis', 'conclusion', 'limitations'].every(k => (ev.entry[k] || '').trim().length > 10) && ev.entry.recordId }
    ],
    quiz: null,
    feedback: { correct: 'Investigation complete. Export your report as PDF or CSV from the notebook.' }
  }
];

export function missionsForMode(mode) {
  const order = ['little', 'junior', 'researcher', 'university'];
  return MISSIONS.filter(m => order.indexOf(m.mode) <= order.indexOf(mode));
}

export function newProgress() { return { steps: {}, mem: {}, prediction: null, answered: false, correct: false, complete: false, attempts: 0 }; }

/** Apply one event to a mission. Steps may be completed in any order (steps that depend on an
 *  earlier result check for it through ctx.mem). Returns true if anything changed. */
export function applyEvent(mission, prog, ev, app) {
  if (prog.complete) return false;
  let changed = false;
  for (const s of mission.steps) {
    if (prog.steps[s.id]) continue;
    if (s.check(ev, { mem: prog.mem, app })) { prog.steps[s.id] = true; changed = true; }
  }
  if (!mission.quiz && mission.steps.every(s => prog.steps[s.id])) { prog.complete = true; prog.correct = true; changed = true; }
  return changed;
}

export function stepsDone(mission, prog) { return mission.steps.every(s => prog.steps[s.id]); }

export function gradeAnswer(mission, prog, value, app) {
  const q = mission.quiz;
  const expected = q.answer({ mem: prog.mem, app });
  let correct;
  if (q.kind === 'number') correct = Math.abs(Number(value) - expected) <= (q.tol ?? 0) + 1e-9;
  else correct = Number(value) === expected;
  prog.attempts++;
  prog.answered = true;
  if (correct) { prog.correct = true; prog.complete = true; }
  return { correct, expected };
}

export { chiSquareGOF, LOCI };
