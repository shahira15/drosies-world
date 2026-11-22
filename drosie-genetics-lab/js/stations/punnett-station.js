import { flySVG, sexSymbol, traitSwatch } from '../phenotype-renderer.js';
import { cross, segregatingLoci, projectGametes, formatProjectedGamete, fuse, phenotypeOf, assessViability, LOCI, formatShorthand, formatGenotype } from '../engine/index.js';
import { toFraction, parseFractionInput } from './util.js';
import { parentTray, bindTray } from './stocks-station.js';

export function renderPunnett(app, el, params) {
  const s = app.state, mode = app.mode(), esc = app.esc;
  if (mode === 'little') {
    el.innerHTML = `<div class="locked">${flySVG({ sex: 'F', eye: 'red', body: 'wild', wings: 'normal', bristles: 'normal' }, { size: 120 })}<h3>The Punnett Workbench opens in Junior Geneticist mode.</h3><p>For now, try predicting with pictures in the Breeding Station!</p></div>`;
    return;
  }
  if (!s.mother || !s.father) { el.innerHTML = parentTray(app) + `<p class="empty">Choose two parents first.</p>`; bindTray(app, el); return; }
  if (s.mother.hidden || s.father.hidden) { el.innerHTML = parentTray(app) + `<div class="callout warn">This parent's genotype is a mystery! A Punnett square needs genotypes. Design a testcross at the Breeding Station instead.</div>`; bindTray(app, el); return; }

  const M = s.mother.fly, F = s.father.fly;
  const res = cross(M, F, { mapping: s.engine.mapping });
  const loci = segregatingLoci(M, F);
  const xLinked = loci.some(l => LOCI[l].chromosome === 'X');
  const eggs = projectGametes(res.eggs, loci, { includeSex: xLinked }), sperm = projectGametes(res.sperm, loci, { includeSex: xLinked });
  const pmode = s.punnettMode || 'guided';
  const step = params.step ?? (pmode === 'guided' ? 1 : 5);
  const big = eggs.length > 8 || sperm.length > 8;
  const splitSex = xLinked;
  const note = noteFor(loci, M, F, eggs);

  const gLabel = g => formatProjectedGamete(g.proj, loci);
  const unequal = arr => arr.some(g => Math.abs(g.p - arr[0].p) > 1e-12);

  // Cells (projected): build representative full genotypes from the first member gamete.
  const cell = (e, sp) => {
    const fly = fuse(e.members[0].chroms, sp.members[0].chroms);
    const ph = phenotypeOf(fly);
    const via = assessViability(fly);
    const geno = mode === 'junior' ? formatShorthand(fly) : formatGenotype(fly, { style: 'html' }).replace(xLinked ? /^$/ : /^\+\/Y ; /, '');
    return { fly, ph, via, geno, p: e.p * sp.p };
  };

  const grid = big ? '' : `<div class="punnett-wrap"><table class="punnett ${step >= 4 ? 'filled' : ''}" aria-label="Punnett square">
    <thead><tr><th class="corner">♀ eggs ↓ · ♂ sperm →</th>${sperm.map(sp => `<th scope="col" class="gam ${step >= 3 ? 'show' : ''}"><span class="geno">${gLabel(sp)}</span>${unequal(sperm) ? `<small>${toFraction(sp.p)}</small>` : `<small>${toFraction(sp.p)}</small>`}</th>`).join('')}</tr></thead>
    <tbody>${eggs.map(e => `<tr><th scope="row" class="gam ${step >= 2 ? 'show' : ''}"><span class="geno">${gLabel(e)}</span><small>${toFraction(e.p)}</small>${e.recombinant ? '<span class="tag rec">recomb.</span>' : ''}</th>
      ${sperm.map(sp => { const c = cell(e, sp); return `<td class="${c.via.viable ? '' : 'dead'} ${step >= 4 ? 'show' : ''}">
        ${pmode === 'prediction' && !params.revealed ? '<span class="q">?</span>' : `<span class="geno">${c.geno}</span>
        <span class="cell-ph">${traitSwatch(c.ph.traits)}${esc(c.ph.label)}${xLinked ? ' ' + sexSymbol(c.fly.sex) : ''}</span>
        <span class="cell-p">${toFraction(c.p)}</span>${c.via.viable ? '' : '<span class="dead-mark" title="Lethal">✝ dies</span>'}`}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;

  // Summary classes
  const classes = summarize(res, splitSex);
  const summary = `<table class="data"><thead><tr><th>Offspring phenotype</th>${splitSex ? '<th>Sex</th>' : ''}<th>Probability (adults)</th>${res.survival < 1 ? '<th>Before viability</th>' : ''}</tr></thead><tbody>
    ${classes.map(c => `<tr><td>${traitSwatch(c.traits)} ${esc(c.label)}</td>${splitSex ? `<td>${sexSymbol(c.sex)}</td>` : ''}<td class="num"><b>${toFraction(c.pAdult)}</b></td>${res.survival < 1 ? `<td class="num">${toFraction(c.pZygote)}</td>` : ''}</tr>`).join('')}
    </tbody></table>${res.survival < 1 ? `<p class="small">Some zygotes are lethal (✝). Adult proportions are renormalized over survivors (survival = ${toFraction(res.survival)}).</p>` : ''}`;

  const predict = `<form class="panel predict" id="predict"><h3>Your prediction</h3><p class="small">Enter the fraction of ADULT offspring in each class (e.g. 3/4, 0.25 or 25%).</p>
    ${classes.map((c, i) => `<label class="pred-row">${traitSwatch(c.traits)} ${esc(c.label)} ${splitSex ? sexSymbol(c.sex) : ''} <input name="c${i}" inputmode="decimal" class="mono" style="width:7em" aria-label="Predicted fraction for ${esc(c.label)}"></label>`).join('')}
    <div class="row"><button class="btn primary">Check prediction</button><button type="button" class="btn" id="reveal">Reveal square</button></div><div class="out" aria-live="polite"></div></form>`;

  const guidedText = [
    '',
    `<b>Step 1 — Parents.</b> Mother ${app.genoHTML(M)} × father ${app.genoHTML(F)}. Loci that differ from wild type: ${loci.map(l => `<i>${l}</i>`).join(', ') || 'none'}.`,
    `<b>Step 2 — Eggs.</b> In meiosis each egg receives ONE chromosome of each pair. ${note.egg}`,
    `<b>Step 3 — Sperm.</b> ${note.sperm}`,
    `<b>Step 4 — Fertilization.</b> Each box combines one egg with one sperm. Its probability is (egg probability) × (sperm probability).`,
    `<b>Step 5 — Add up.</b> Boxes with the same phenotype are added together${res.survival < 1 ? ', after removing lethal (✝) genotypes' : ''}.`
  ];

  el.innerHTML = `${parentTray(app).replace(/<button class="btn primary" data-go-breed[^>]*>.*?<\/button>/, '')}
    <div class="row"><div class="seg" role="radiogroup" aria-label="Workbench mode">
      <button role="radio" aria-checked="${pmode === 'guided'}" class="${pmode === 'guided' ? 'on' : ''}" data-pm="guided">Guided learning</button>
      <button role="radio" aria-checked="${pmode === 'prediction'}" class="${pmode === 'prediction' ? 'on' : ''}" data-pm="prediction">Prediction mode</button></div></div>
    ${pmode === 'guided' ? `<div class="guide panel" aria-live="polite">${guidedText.slice(1, step + 1).map(t => `<p>${t}</p>`).join('')}
      <div class="row">${step > 1 ? '<button class="btn" data-step="-1">‹ Back</button>' : ''}${step < 5 ? '<button class="btn primary" data-step="1">Next step ›</button>' : ''}</div></div>` : ''}
    ${big ? `<div class="callout">These parents make ${eggs.length} kinds of eggs and ${sperm.length} kinds of sperm, which is too many for a readable square. The full gamete-combination matrix is summarized below.</div>` : grid}
    ${pmode === 'prediction' ? predict : ''}
    ${step >= 5 || params.revealed ? `<section class="panel"><h3>Predicted offspring</h3>${summary}</section>` : ''}
    ${loci.length > 1 && mode !== 'junior' ? `<p class="small muted">${note.matrix}</p>` : ''}`;

  bindTray(app, el);
  el.querySelectorAll('[data-pm]').forEach(b => b.onclick = () => { s.punnettMode = b.dataset.pm; app.save(); app.open('punnett', {}); });
  el.querySelectorAll('[data-step]').forEach(b => b.onclick = () => app.open('punnett', { step: Math.max(1, Math.min(5, step + +b.dataset.step)) }));
  const form = el.querySelector('#predict');
  if (form) {
    form.onsubmit = e => {
      e.preventDefault();
      let allOk = true; const out = [];
      classes.forEach((c, i) => {
        const v = parseFractionInput(form[`c${i}`].value);
        const ok = Math.abs(v - c.pAdult) < 0.006;
        if (!ok) allOk = false;
        form[`c${i}`].classList.toggle('ok', ok); form[`c${i}`].classList.toggle('bad', !ok);
        out.push(ok);
      });
      const msg = allOk ? `<div class="callout good">All correct! Now test it with a real (simulated) cross at the Breeding Station — will the observed numbers match exactly?</div>`
        : `<div class="callout warn">${out.filter(Boolean).length} of ${out.length} correct. ${res.survival < 1 ? 'Remember lethal genotypes: adult fractions must add up to 1 among survivors. ' : ''}Try Guided mode or reveal the square.</div>`;
      form.querySelector('.out').innerHTML = msg;
      app.sfx(allOk ? 'success' : 'error');
      app.emit({ type: 'punnett-check', correct: allOk, mother: M, father: F });
    };
    el.querySelector('#reveal').onclick = () => app.open('punnett', { revealed: true });
  }
}

function summarize(res, splitSex) {
  if (splitSex) return res.phenotypeClasses.map(c => ({ ...c }));
  const m = new Map();
  for (const z of res.zygotes) {
    const k = z.phenotype.label;
    if (!m.has(k)) m.set(k, { label: k, traits: z.phenotype.traits, pAdult: 0, pZygote: 0 });
    const x = m.get(k); x.pZygote += z.p; if (z.viable) x.pAdult += z.p / res.survival;
  }
  return [...m.values()].filter(c => c.pAdult > 0).sort((a, b) => (a.label === 'wild type' ? -1 : b.label === 'wild type' ? 1 : b.pAdult - a.pAdult));
}

function noteFor(loci, M, F, eggs) {
  const chroms = [...new Set(loci.map(l => LOCI[l].chromosome))];
  const linked = loci.length > 1 && chroms.length < loci.length;
  const egg = linked
    ? `Some of these loci are on the same chromosome, so in the mother crossing over produces recombinant eggs (marked “recomb.”) at a frequency set by their map distance; parental combinations are more common.`
    : loci.length > 1 ? 'Loci on different chromosomes assort independently, so every allele combination is equally likely (Mendel\'s second law).' : 'The two alleles separate (segregate) — each egg gets one, with probability 1/2 (Mendel\'s first law).';
  const sperm = (chroms.includes('X') ? 'Half the sperm carry the father\'s X and half carry his Y. ' : 'Sex does not affect these autosomal genes, so X/Y is left out of this square. ') + 'Drosophila males have no meiotic crossing over, so sperm carry only intact parental chromosomes.';
  const matrix = 'For crosses involving several loci, the workbench uses a full gamete-combination matrix (rows = all egg types, columns = all sperm types), rather than forcing it into a 2 × 2 square.';
  void M; void F; void eggs;
  return { egg, sperm, matrix };
}
