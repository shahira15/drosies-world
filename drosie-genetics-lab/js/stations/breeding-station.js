import { flySVG, sexSymbol, traitSwatch } from '../phenotype-renderer.js';
import { cross, simulateOffspring, mulberry32, sampleFromClass, segregatingLoci, projectGametes, formatProjectedGamete, formatGenotype, plainDescription, phenotypeOf, flyKey } from '../engine/index.js';
import { parentTray, bindTray } from './stocks-station.js';
import { toFraction, pct, total } from './util.js';

const SIZES = [20, 50, 100, 500, 1000];

export function renderBreeding(app, el, params) {
  const s = app.state, mode = app.mode(), esc = app.esc;
  const rec = params.recordId ? app.getRecord(params.recordId) : (params.showLast ? s.records[s.records.length - 1] : null);
  const n = s.viewMode.n || 100;
  const ready = s.mother && s.father;

  el.innerHTML = `
    ${parentTray(app).replace(/<button class="btn primary" data-go-breed[^>]*>.*?<\/button>/, '<button class="btn" data-pick>Change parents</button>')}
    <section class="panel breed-controls">
      <h3>${mode === 'little' ? 'How many babies should we count?' : 'Number of adult offspring to score'}</h3>
      <div class="seg" role="radiogroup" aria-label="Offspring number">
        ${SIZES.map(v => `<button role="radio" aria-checked="${n === v}" class="${n === v ? 'on' : ''}" data-n="${v}">${v.toLocaleString()}</button>`).join('')}
        ${mode !== 'little' ? `<label class="inline">Custom <input type="number" min="1" max="100000" value="${SIZES.includes(n) ? '' : n}" id="n-custom" style="width:6.5em"></label>` : ''}
      </div>
      ${mode !== 'little' ? `<div class="row seed-row">
        <label>Random seed <input type="number" id="seed" value="${s.viewMode.seed ?? s.nextSeed}" min="0" max="4294967295" class="mono" style="width:9em"></label>
        <button class="btn" id="new-seed" title="Pick a new random seed">🎲 New seed</button>
        <label class="switch"><input type="checkbox" id="lock-seed" ${s.viewMode.lockSeed ? 'checked' : ''}> Keep this seed</label>
        ${mode === 'university' ? `<label>Map → RF function <select id="mapping">${['kosambi', 'haldane', 'linear'].map(m => `<option ${s.engine.mapping === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label>` : ''}
      </div><p class="small muted">The same parents + seed + number always give the same simulated result — so results can be reproduced and checked.</p>` : ''}
      <button class="btn primary big" id="run" ${ready ? '' : 'disabled'}>${mode === 'little' ? '🪰 Let the flies have babies!' : 'Set up the vial & incubate'}</button>
      ${!ready ? `<p class="hint">Choose a ♀ mother and a ♂ father at the Fly Stock Center first.</p>` : ''}
    </section>
    <div id="incubate" aria-live="polite"></div>
    <section id="results">${rec ? results(app, rec) : historyList(app)}</section>`;

  bindTray(app, el);
  el.querySelector('[data-pick]').onclick = () => app.open('stocks');
  el.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { s.viewMode.n = +b.dataset.n; app.save(); app.rerender(); });
  const nc = el.querySelector('#n-custom'); if (nc) nc.onchange = () => { const v = Math.max(1, Math.min(100000, parseInt(nc.value, 10) || 100)); s.viewMode.n = v; app.save(); app.rerender(); };
  const seedIn = el.querySelector('#seed');
  if (seedIn) seedIn.onchange = () => { s.viewMode.seed = (Number(seedIn.value) >>> 0); app.save(); };
  el.querySelector('#new-seed')?.addEventListener('click', () => { s.viewMode.seed = app.nextSeed(); app.save(); app.rerender(); });
  el.querySelector('#lock-seed')?.addEventListener('change', e => { s.viewMode.lockSeed = e.target.checked; app.save(); });
  el.querySelector('#mapping')?.addEventListener('change', e => { s.engine.mapping = e.target.value; app.save(); });
  el.querySelector('#run').onclick = () => runCross(app, el);
  bindResults(app, el, rec);
  el.querySelectorAll('[data-open-rec]').forEach(b => b.onclick = () => app.open('breeding', { recordId: b.dataset.openRec }));
}

function runCross(app, el) {
  const s = app.state;
  const seed = s.viewMode.seed != null ? s.viewMode.seed >>> 0 : s.nextSeed;
  const n = s.viewMode.n || 100;
  const opts = { mapping: s.engine.mapping };
  let res;
  try { res = cross(s.mother.fly, s.father.fly, opts); }
  catch (e) { app.toast(e.message, 'bad'); return; }
  const sim = simulateOffspring(res, n, seed, { keepIndividuals: 40 });
  if (sim.sterileVial) { app.toast('No offspring survived — every zygote genotype in this cross is lethal.', 'bad'); }
  const rec = {
    id: 'C' + (s.records.length + 1) + '-' + Date.now().toString(36).slice(-4), num: s.records.length + 1, created: new Date().toISOString(),
    mother: s.mother.fly, father: s.father.fly, motherName: s.mother.name, fatherName: s.father.name,
    motherStockId: s.mother.stockId || null, fatherStockId: s.father.stockId || null, motherOrigin: s.mother.origin, fatherOrigin: s.father.origin,
    motherHidden: !!s.mother.hidden, n: sim.nAdults, seed, opts, inviable: sim.inviable, survival: res.survival,
    classCounts: sim.classCounts.map(c => ({ label: c.label, sex: c.sex, traits: c.traits, count: c.count, expectedP: c.expectedP })),
    individuals: sim.individuals
  };
  s.records.push(rec);
  app.crossCache.set(rec.id, res);
  if (!s.viewMode.lockSeed) s.viewMode.seed = app.nextSeed();
  app.save();
  const done = () => { app.emit({ type: 'cross', record: rec }); app.open('breeding', { recordId: rec.id }); document.getElementById('results')?.scrollIntoView({ behavior: s.settings.reducedMotion ? 'auto' : 'smooth' }); };
  if (s.settings.reducedMotion) { done(); return; }
  app.sfx('buzz');
  const inc = el.querySelector('#incubate');
  inc.innerHTML = `<div class="incubation"><div class="vial-anim"><div class="vial-food"></div><div class="vial-plug"></div><div class="vial-flies"><i></i><i></i></div></div>
    <ol class="life">${['Mating', 'Eggs', 'Larvae', 'Pupae', 'Adults!'].map((t, i) => `<li style="animation-delay:${i * 0.33}s">${t}</li>`).join('')}</ol>
    <p class="small muted">About 10 days at 25 °C in a real lab — a couple of seconds here.</p></div>`;
  setTimeout(done, 1900);
}

function historyList(app) {
  const r = [...app.state.records].reverse().slice(0, 12);
  if (!r.length) return `<div class="empty">Your crosses will appear here.</div>`;
  return `<h3>Recent crosses</h3><ul class="history">${r.map(x => `<li><button class="link" data-open-rec="${x.id}">Cross #${x.num}: ${app.esc(x.motherName)} × ${app.esc(x.fatherName)} — ${x.n} offspring</button></li>`).join('')}</ul>`;
}

export function results(app, rec) {
  const mode = app.mode(), esc = app.esc;
  const N = total(rec);
  const res = app.crossFor(rec);
  const header = `<div class="results-head"><h3>Cross #${rec.num}: ${esc(rec.motherName)} × ${esc(rec.fatherName)}</h3>
    <span class="badge sim" title="Generated by a probability model, not observed in a real laboratory">SIMULATED DATA</span>
    ${mode !== 'little' ? `<span class="muted small">seed ${rec.seed} · ${N.toLocaleString()} adults scored${mode === 'university' ? ' · ' + rec.opts.mapping + ' mapping' : ''}</span>` : ''}</div>`;

  let body;
  if (mode === 'little') {
    body = `<div class="pictos">${rec.classCounts.filter(c => c.count).map(c => `
      <div class="picto">${flySVG({ ...c.traits, sex: c.sex }, { size: 90 })}<div class="picto-n">${c.count}</div>
      <div class="small">${sexSymbol(c.sex)} ${esc(plainDescription({ traits: c.traits }))}</div></div>`).join('')}</div>
      <p class="lead">We counted <b>${N}</b> babies.</p>`;
  } else {
    body = `<table class="data"><thead><tr><th scope="col">Phenotype</th><th scope="col">Sex</th><th scope="col">Observed</th><th scope="col">Observed %</th><th scope="col">Expected %</th><th scope="col">Expected count</th></tr></thead><tbody>
      ${rec.classCounts.map(c => `<tr><td>${traitSwatch(c.traits)} ${esc(c.label)}</td><td>${sexSymbol(c.sex)}</td><td class="num"><b>${c.count}</b></td><td class="num">${pct(c.count / N)}</td>
        <td class="num">${mode === 'junior' ? pct(c.expectedP) : toFraction(c.expectedP)}</td><td class="num">${(c.expectedP * N).toFixed(1)}</td></tr>`).join('')}
      </tbody><tfoot><tr><td colspan="2">Total adults</td><td class="num">${N}</td><td></td><td></td><td></td></tr></tfoot></table>
      ${rec.inviable ? `<div class="callout warn"><b>${rec.inviable.toLocaleString()} simulated zygotes did not survive</b> (expected fraction ${toFraction(1 - rec.survival)} of fertilizations). In a real vial you would never see them — you would only notice that some classes are missing or the ratio is unusual.</div>` : ''}`;
  }

  const gametes = mode === 'little' ? '' : gameteDetails(app, rec, res);
  const zyg = mode === 'university' ? zygoteTable(app, res) : '';
  const keepOpts = rec.classCounts.filter(c => c.count > 0).map((c, i) => `<option value="${i}">${esc(c.label)} ${sexSymbol(c.sex)} (${c.count})</option>`).join('');
  return `${header}${body}
    <div class="row actions">
      ${mode !== 'little' ? `<button class="btn primary" data-analyze>📊 Analyze data</button>` : ''}
      <button class="btn" data-notebook>📓 Add to notebook</button>
      <button class="btn" data-scope>🔬 Look at offspring</button>
      <span class="keep" ${mode === 'little' ? 'hidden' : ''}><label>Keep flies <select data-keep-class aria-label="Which offspring to keep">${keepOpts}</select></label><button class="btn" data-keep>Keep one</button></span>
    </div>
    ${gametes}${zyg}
    <p class="small muted">Simulated offspring drawn at random from the exact probabilities of this cross. They are not real laboratory measurements.</p>`;
}

function gameteDetails(app, rec, res) {
  const loci = segregatingLoci(rec.mother, rec.father);
  const eggs = projectGametes(res.eggs, loci), sperm = projectGametes(res.sperm, loci);
  const rules = res.eggs[0].rules, srules = res.sperm[0].rules;
  const hiddenM = rec.motherHidden;
  const list = (gs, hid) => hid ? '<li>Hidden until you solve the mystery.</li>' : gs.map(g => `<li><span class="geno">${formatProjectedGamete(g.proj, loci)}</span> <span class="muted">${toFraction(g.p)}</span>${g.recombinant ? ' <span class="tag rec">recombinant</span>' : ''}</li>`).join('');
  const recNote = Object.values(rules).filter(r => !r.crossingOver && /balancer/.test(r.reason)).map(r => r.reason)[0];
  return `<details class="panel"><summary>Gamete formation & fertilization</summary>
    <div class="cols"><div><h4>♀ Eggs (meiosis with crossing over${recNote ? ' — suppressed by balancer' : ''})</h4><ul class="gametes">${list(eggs, hiddenM)}</ul></div>
    <div><h4>♂ Sperm (no crossing over in males)</h4><ul class="gametes">${list(sperm)}</ul></div></div>
    <p class="small">${app.esc(srules.X.reason)} ${recNote ? app.esc(recNote) : ''} Each egg is equally likely to be fertilized by each sperm, so the probability of an offspring genotype is the product of the two gamete probabilities (summed over all combinations giving it).</p>
    <p class="small">Fraction of zygotes surviving: <b>${toFraction(res.survival)}</b>.</p></details>`;
}

function zygoteTable(app, res) {
  return `<details class="panel"><summary>Zygote genotypes (before and after viability)</summary>
    <table class="data compact"><thead><tr><th>Genotype</th><th>Sex</th><th>P(fertilization)</th><th>Viable?</th><th>P(among adults)</th></tr></thead><tbody>
    ${res.zygotes.map(z => `<tr class="${z.viable ? '' : 'dead'}"><td><span class="geno">${formatGenotype(z.fly, { style: 'html' })}</span></td><td>${sexSymbol(z.fly.sex)}</td><td class="num">${toFraction(z.p)}</td>
      <td>${z.viable ? 'yes' : '✝ ' + app.esc(z.lethalReasons.join('; '))}</td><td class="num">${z.viable ? toFraction(z.p / res.survival) : '—'}</td></tr>`).join('')}
    </tbody></table></details>`;
}

function bindResults(app, el, rec) {
  if (!rec) return;
  el.querySelector('[data-analyze]')?.addEventListener('click', () => app.open('analysis', { recordId: rec.id }));
  el.querySelector('[data-notebook]').onclick = () => app.open('notebook', { newFor: rec.id });
  el.querySelector('[data-scope]').onclick = () => app.open('microscope', { recordId: rec.id });
  el.querySelector('[data-keep]').onclick = () => {
    const c = rec.classCounts.filter(c => c.count > 0)[+el.querySelector('[data-keep-class]').value];
    if (!c) return;
    const res = app.crossFor(rec);
    const pc = res.phenotypeClasses.find(x => x.label === c.label && x.sex === c.sex);
    const rng = mulberry32((rec.seed ^ (app.state.collected.length * 2654435761)) >>> 0);
    const fly = sampleFromClass(pc, rng);
    const possible = pc.genotypes.map(g => ({ html: formatGenotype(g.fly, { style: 'html' }), p: g.pWithinClass, key: flyKey(g.fly) }));
    const k = { id: 'k' + Date.now().toString(36), fly, name: `${c.label} ${c.sex === 'F' ? '♀' : '♂'} (from cross #${rec.num})`, fromRecord: rec.id, possible };
    app.state.collected.push(k); app.save();
    app.toast(`Kept: ${k.name}. Find it under "Your kept flies" in the Stock Center.`, 'good');
    app.emit({ type: 'collect', fly, fromRecord: rec.id });
    const use = app.state[fly.sex === 'F' ? 'mother' : 'father'];
    void use;
    app.modal(`<p>You kept a ${app.esc(c.label)} ${c.sex === 'F' ? 'female' : 'male'}. Use it as a parent now?</p>
      ${app.mode() !== 'little' && possible.length > 1 ? `<p class="small">Its phenotype fits ${possible.length} genotypes; which one it carries is hidden — just as in a real lab. Real geneticists also make sure kept females are <b>virgins</b> (collected within ~8 h of eclosion), because females store sperm.</p>` : ''}
      <div class="row"><button class="btn primary" id="use-now">Use as ${fly.sex === 'F' ? 'mother ♀' : 'father ♂'}</button><button class="btn" id="later">Later</button></div>`,
    { title: 'Fly kept', onMount: b => {
      b.querySelector('#use-now').onclick = () => { app.closeModal(); app.setParent(fly.sex === 'F' ? 'mother' : 'father', { fly, name: k.name, origin: 'kept' }); app.rerender(); };
      b.querySelector('#later').onclick = app.closeModal;
    } });
  };
  void phenotypeOf;
}
