// Visual adventure M5: Abstract Story Workshop. NEW interface.
process.env.CONF_URL = 'http://localhost:8123/scientific-conference.html';
const { open, ok, done, overflow } = require('./helpers');
const U = 'http://localhost:8123/scientific-conference.html';
const SEED = () => { const S = DC.state; S.mode = 'independent'; S.nick = 'Zoe'; S.path = 'A'; S.a.acked = true; S.a.setup = { temp: 'changed', count: 'measured', vial: 'same', nflies: 'same', tod: 'same', taps: 'same' }; DC.DATA.conditions.forEach((c) => (S.a.rec[c.id] = c.counts.slice())); S.det.c3var = { sel: 1, ok: true }; ['d_mean', 'd_diff', 'd_range', 'd_oi', 'd_cause', 'd_repl', 'limits', 'd_axis'].forEach((k) => (S.det[k] = { ok: true })); DC.saveNow(); };
const cards = (p) => p.locator('#v5panel .vx-choice').evaluateAll((e) => e.map((x) => x.innerText));
(async () => {
  let { browser, page: p, errors } = await open({ reduced: true });
  console.log('M5 workshop, Path A');
  await p.evaluate(SEED); await p.goto(U + '#ch5'); await p.reload();
  ok(await p.locator('.vx-hot').count() === 5 && await p.locator('.vx-tool').count() === 5, 'five story slots in the scene (with a tray alternative)');
  const w0 = await p.evaluate(() => (document.querySelector('#stage').innerText.match(/\S+/g) || []).length);
  ok(w0 < 330, 'much less compulsory reading at the start (' + w0 + ' words, baseline 742)');
  ok(await p.locator('textarea').count() === 0, 'no text fields are needed in Explorer: the learner chooses cards');
  ok(!(await p.evaluate(() => DC.absComplete())), 'abstract empty at the start');
  const results = [];
  for (let slot = 0; slot < 5; slot++) {
    await p.locator(`.vx-tool`).nth(slot).click();
    const texts = await cards(p); results.push(texts);
    // pick every wrong card first (must be refused and leave the slot empty), then the right one
    const meta = await p.evaluate((slot) => { const k = ['bg', 'obj', 'methods', 'results', 'conclusion'][slot]; return { k }; }, slot);
    for (let i = 0; i < texts.length; i++) {
      await p.locator(`[data-act=v5pick][data-i="${i}"]`).click();
      const filled = await p.evaluate((k) => DC.words(DC.state.abs[k]) >= 6, meta.k);
      const fb = await p.locator('#v5panel .vx-fb').innerText();
      if (filled) { ok(fb.startsWith('Yes'), `slot ${slot + 1}: the accepted card is confirmed`); break; }
      else if (!/Not quite/.test(fb)) ok(false, `slot ${slot + 1}: wrong card should explain why`);
    }
  }
  ok(results.every((t) => t.length >= 3), 'every slot offers 3 or more cards including distractors');
  ok(results[3].some((t) => t.includes('7.5')) && results[3].some((t) => t.includes('lazy')) && results[4].some((t) => t.includes('proves')), 'distractors include a wrong number, an interpretation and an overclaim');
  ok(await p.evaluate(() => DC.absComplete()), 'assembling five accepted cards completes the abstract (same rule as before)');
  const abs = await p.evaluate(() => DC.state.abs);
  ok(abs.results.includes('7.2') && abs.results.includes('4.2') && abs.results.includes('6 to 8') && abs.results.includes('3 to 5'), 'results card uses the exact means and ranges 7.2 / 4.2');
  ok(/simulat/i.test(abs.obj + abs.methods) && !/prove|lazy|7\.5/i.test(Object.values(abs).join(' ')), 'abstract says it is simulated and contains no overclaim, interpretation or invented number');
  ok((await p.locator('#v5doc').innerText()).includes('Simulated data') && (await p.locator('#v5doc').innerText()).includes('7.2'), 'the assembled abstract is shown as a document');
  ok(!(await p.evaluate(() => DC.absFeedback().some((f) => f.lvl === 'warn'))), 'the original checker finds no warnings in the card-built abstract');
  ok((await p.locator('.vx-drosie').getAttribute('data-state')) === 'celebrate', 'Drosie celebrates');
  ok(+(await p.locator('#btnPack .vx-count').innerText()) >= 7, 'Findings and Abstract cards joined the backpack');
  // revise: change the conclusion
  await p.locator('.vx-tool').nth(4).click(); await p.locator('[data-act=v5pick]').evaluateAll((els) => els.forEach((e) => e.click()));
  ok(await p.evaluate(() => DC.absComplete()), 'the learner can change a card and the abstract stays valid');
  // own words: overclaim is caught by the original checker
  await p.locator('[data-act=v5own]').click(); await p.fill('#ab-conclusion', 'This proves all flies are lazy in the cold.');
  ok((await p.locator('#v5chk').innerText()).includes('proves') && !(await p.evaluate(() => DC.absComplete())), 'writing it myself: the original overclaim check applies');
  await p.fill('#ab-conclusion', 'In this simulation the 18 °C group had fewer flies above the line, which fits the prediction. More groups are needed.');
  ok(await p.evaluate(() => DC.absComplete()), 'a careful self-written conclusion is accepted');
  await p.reload(); ok(await p.evaluate(() => DC.absComplete()), 'progress persists');
  ok(errors.length === 0, 'no console errors ' + errors.join('|')); await browser.close();

  console.log('M5 without recorded data');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(() => { const S = DC.state; S.mode = 'independent'; S.nick = 'T'; S.path = 'A'; S.a.acked = true; DC.saveNow(); }); await p.goto(U + '#ch5'); await p.reload(); await p.locator('.vx-tool').nth(3).click();
  ok((await p.locator('#v5panel').innerText()).includes('Record all ten counts') && !(await p.locator('[data-act=v5pick]').count()), 'results slot is locked until the data are recorded (numbers are never invented)');
  ok(errors.length === 0, 'no console errors'); await browser.close();

  console.log('M5 Path B and Researcher');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(() => { const S = DC.state; S.mode = 'independent'; S.nick = 'T'; S.path = 'B'; S.b.f.title = 'Ants'; S.b.f.question = 'When do ants come?'; S.b.f.background = 'Ants live in colonies near doors.'; S.b.log = [{ label: 'Mon', group: '', value: '4', note: '' }]; DC.saveNow(); }); await p.goto(U + '#ch5'); await p.reload();
  await p.locator('[data-act=absDraft]').click(); ok(await p.evaluate(() => DC.state.abs.bg === 'Ants live in colonies near doors.' && DC.state.abs.obj === 'When do ants come?' && DC.state.abs.results === '' && DC.state.abs.conclusion === ''), 'Path B: slots fill only from the learner\u2019s own words; results and conclusion stay empty');
  await p.locator('.vx-tool').nth(3).click(); await p.fill('#ab-results', 'On Monday I counted 99 ants at the door.'); ok((await p.locator('#v5chk').innerText()).includes('99'), 'Path B: a number that is not in the learner’s data is flagged');
  ok(errors.length === 0, 'no console errors'); await browser.close();
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(SEED); await p.evaluate(() => { DC.state.ui = { level: 'researcher', seen: {}, bench: {}, c: {} }; DC.saveNow(); }); await p.goto(U + '#ch5'); await p.reload(); await p.locator('[data-act=vxBench]').click();
  ok(await p.locator('textarea').count() === 5 && (await p.locator('#absWc, .wc').count()) >= 1, 'Researcher workbench: the original five editable fields, word counters and live preview');
  ok(errors.length === 0, 'no console errors'); await browser.close();

  console.log('M5 layouts');
  for (const w of [320, 390, 768, 1280]) { ({ browser, page: p, errors } = await open({ reduced: true, w })); await p.evaluate(SEED); await p.goto(U + '#ch5'); await p.reload(); for (const s of [0, 3]) { await p.locator('.vx-tool').nth(s).click(); ok((await overflow(p)) <= 0, `slot ${s + 1} @${w}px: no horizontal overflow`); } ok(errors.length === 0, `@${w}: no console errors`); await browser.close(); }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
