// Visual adventure M3: the Fly Laboratory (Path A) and the Path B research organizer. NEW interface (non-legacy).
process.env.CONF_URL = 'http://localhost:8123/scientific-conference.html';
const { open, ok, done, overflow } = require('./helpers');
const U = 'http://localhost:8123/scientific-conference.html';
const SEED = () => { const S = DC.state; S.mode = 'independent'; S.nick = 'Zoe'; S.path = 'A'; S.a.acked = true; DC.saveNow(); };
// tap the flies the learner can SEE above the dashed line (reads the drawn geometry, not the engine's answer)
async function tapFly(p, id) { const bb = await p.locator(`#c3count [data-f="${id}"] circle`).first().boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); }
async function countByTapping(p, wrongFirst) {
  const ys = await p.locator('#c3count [data-act=v3tap]').evaluateAll((gs) => gs.map((g) => ({ id: g.dataset.f, cy: parseFloat(g.querySelector('circle').getAttribute('cy')) })));
  const above = ys.filter((f) => f.cy < 108), below = ys.filter((f) => f.cy >= 108);
  if (wrongFirst && below.length) { await tapFly(p, below[0].id); }
  for (const f of above) await tapFly(p, f.id);
  return above.length;
}
(async () => {
  let { browser, page: p, errors } = await open({ reduced: true });
  console.log('M3 lab, Path A: plan -> trials -> compare');
  await p.evaluate(SEED); await p.goto(U + '#ch3'); await p.reload();
  ok(await p.locator('svg[aria-label*="laboratory bench"]').count() === 1, 'laboratory bench scene (vials, thermometers, timer, ruler, magnifier, notebook, clipboard)');
  ok(await p.locator('.vx-hot').count() === 9, 'nine interactive objects on the bench');
  const w0 = await p.evaluate(() => (document.querySelector('#stage').innerText.match(/\S+/g) || []).length);
  ok(w0 < 230, 'Chapter 3 shows far less text at the start (' + w0 + ' words; baseline was 482)');
  ok(await p.locator('.vx-choice[data-act=v3obj]').count() === 3, 'planning game: three pictures to sort');
  await p.locator('[data-act=v3lab][data-v=measured]').click(); ok((await p.locator('.vx-bubble').innerText()).includes('tap a picture'), 'tapping a label first gives a gentle prompt');
  await p.locator('[data-act=v3obj][data-k=temp]').click(); await p.locator('[data-act=v3lab][data-v=measured]').click();
  ok((await p.locator('.vx-bubble').innerText()).includes('Not quite') && !(await p.evaluate(() => DC.state.a.setup.temp)), 'wrong pairing: hint, nothing recorded');
  await p.locator('[data-act=v3obj][data-k=temp]').click(); await p.locator('[data-act=v3lab][data-v=changed]').click();
  await p.locator('[data-act=v3obj][data-k=count]').click(); await p.locator('[data-act=v3lab][data-v=measured]').click();
  await p.locator('[data-act=v3obj][data-k=same]').click(); await p.locator('[data-act=v3lab][data-v=same]').click();
  ok(await p.evaluate(() => ['temp:changed', 'count:measured', 'vial:same', 'nflies:same', 'tod:same', 'taps:same'].every((q) => DC.state.a.setup[q.split(':')[0]] === q.split(':')[1])), 'planning game sets the same six setup answers as the original chapter');
  ok(await p.locator('#c3go').count() === 1, 'trials unlock');
  // bench objects teach
  await p.locator('.vx-hot[data-act=v3ruler]').click(); ok((await p.locator('.vx-bubble').innerText()).includes('8 cm'), 'ruler object explains the 8 cm line');
  // run a trial: cool vial, trial 1
  await p.locator('[data-act=v3cond][data-c=cool]').first().click(); await p.locator('#c3go').click();
  ok(await p.locator('#c3count').count() === 1, 'trial finishes (reduced motion: no animation required)');
  ok((await p.locator('#vxTimerTxt').textContent()).startsWith('10.0'), 'timer shows 10.0 s at the end');
  const truth = await p.evaluate(() => DC.DATA.conditions[1].counts[0]);
  const ysx = await p.locator('#c3count [data-act=v3tap]').evaluateAll((gs) => gs.map((g) => ({ id: g.dataset.f, cy: parseFloat(g.querySelector('circle').getAttribute('cy')) }))); await tapFly(p, ysx.find((f) => f.cy >= 108).id);
  ok((await p.locator('#c3count .vx-fb').innerText()).includes('below the dashed line') && (await p.locator('#c3count .vx-count').innerText()) === '0', 'tapping a fly below the line is refused with a reason and not counted');
  const n = await countByTapping(p, false);
  ok(n === truth && (await p.locator('#c3count .vx-count').innerText()) === String(truth), `tapping the flies above the line counts ${n} = dataset ${truth}`);
  // wrong record first: remove one by stepper
  await p.locator('[data-act=v3num][data-d="-1"]').click(); await p.locator('[data-act=v3record]').click();
  ok((await p.locator('#c3count .vx-fb').innerText()).includes('more flies') && !(await p.evaluate(() => DC.state.a.rec.cool[0] !== null)), 'recording a wrong count is not accepted ("more flies are above...")');
  await p.locator('[data-act=v3num][data-d="1"]').click(); await p.locator('[data-act=v3record]').click();
  ok((await p.evaluate(() => DC.state.a.rec.cool[0])) === truth, 'correct count is recorded exactly (' + truth + ')');
  ok((await p.evaluate(() => DC.state.ui.c[3].cond)) === 'cool' && (await p.locator('.vx-tray .vx-step.done').first().innerText()) === String(truth), 'trial chip shows the recorded value');
  // record the rest through the UI by counting what is drawn
  for (const c of ['control', 'cool']) {
    await p.locator(`[data-act=v3cond][data-c=${c}]`).first().click();
    for (let t = 0; t < 5; t++) {
      if (await p.evaluate(([c, t]) => DC.state.a.rec[c][t] !== null, [c, t])) continue;
      await p.locator(`[data-act=v3trial][data-i="${t}"]`).click(); await p.locator('#c3go').click(); await countByTapping(p, false); await p.locator('[data-act=v3record]').click();
    }
  }
  ok(await p.evaluate(() => JSON.stringify(DC.state.a.rec) === JSON.stringify({ control: [7, 8, 6, 8, 7], cool: [4, 5, 3, 5, 4] })), 'all ten counts, obtained only by counting the drawn flies, equal the exact dataset');
  ok((await p.locator('#c3chart .chart-pt').count()) === 10, 'compare station: graph with ten points');
  const pts = await p.locator('#c3chart .chart-pt').evaluateAll((e) => e.map((x) => x.getAttribute('aria-label')));
  ok(pts.filter((x) => x.startsWith('25')).map((x) => x.match(/: (\d+) flies/)[1]).join() === '7,8,6,8,7' && pts.filter((x) => x.startsWith('18')).map((x) => x.match(/: (\d+) flies/)[1]).join() === '4,5,3,5,4', 'graph values equal the dataset');
  ok(!(await p.evaluate(() => DC.isDone(3))), 'not complete until the variation question is answered');
  await p.locator('[data-act=v3var][data-i="0"]').click(); ok(!(await p.evaluate(() => DC.isDone(3))), 'wrong variation answer does not complete');
  await p.locator('[data-act=v3var][data-i="1"]').click(); ok((await p.locator('.vx-fb.ok').innerText()).includes('same 10 flies') && (await p.evaluate(() => DC.isDone(3))), 'right answer explains repeated measurements vs replicates; chapter 3 complete');
  ok(+(await p.locator('#btnPack .vx-count').innerText()) >= 4, 'Methods and Data cards are in the backpack');
  ok((await p.locator('details.vx-learn table').count()) >= 1 && (await p.locator('details.vx-learn table tbody tr').count()) === 5, 'accessible data table is available');
  await p.reload(); ok(await p.evaluate(() => DC.isDone(3) && JSON.stringify(DC.state.a.rec.control) === '[7,8,6,8,7]'), 'progress persists');
  ok(errors.length === 0, 'no console errors ' + errors.join('|')); await browser.close();

  console.log('M3 lab: real animation, keyboard, researcher level');
  ({ browser, page: p, errors } = await open({ reduced: false }));
  await p.evaluate(SEED); await p.evaluate(() => { DC.state.a.setup = { temp: 'changed', count: 'measured', vial: 'same', nflies: 'same', tod: 'same', taps: 'same' }; DC.saveNow(); });
  await p.goto(U + '#ch3'); await p.reload(); await p.locator('#c3fast').check(); const before = await p.locator('#vxV-control').innerHTML();
  await p.locator('#c3go').click(); await p.waitForTimeout(250);
  ok(await p.locator('.vx-vshake').count() === 1, 'the vial shakes when tapped (animation)');
  await p.waitForTimeout(1500); const mid = await p.locator('#vxV-control').innerHTML(); ok(mid !== before, 'flies move during the 10 second observation');
  ok(!(await p.locator('#c3count').count()) && (await p.locator('#c3go').isDisabled()), 'counting stays hidden and the button is disabled while the trial runs');
  await p.waitForSelector('#c3count', { timeout: 7000 });
  ok((await p.locator('#vxTimerTxt').textContent()).startsWith('10.0'), 'timer reaches 10.0 s');
  // leave mid-trial and come back: nothing stuck
  await p.evaluate(() => DC.go(5)); await p.evaluate(() => DC.go(3)); ok(await p.locator('#c3go').isEnabled(), 'returning to the lab leaves a usable Start button');
  // keyboard counting
  await p.locator('#c3go').click(); await p.waitForSelector('#c3count'); const first = await p.locator('#c3count [data-act=v3tap]').first(); await first.focus(); await p.keyboard.press('Enter');
  ok((await p.locator('#c3count [aria-pressed=true]').count()) + (await p.locator('.vx-fb').count()) >= 1, 'a fly can be activated with the keyboard (Enter)');
  ok(errors.length === 0, 'no console errors ' + errors.join('|')); await browser.close();

  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(SEED); await p.evaluate(() => { const S = DC.state; S.a.setup = { temp: 'changed', count: 'measured', vial: 'same', nflies: 'same', tod: 'same', taps: 'same' }; DC.DATA.conditions.forEach((c) => (S.a.rec[c.id] = c.counts.slice())); S.det.c3var = { sel: 1, ok: true }; S.ui = { level: 'researcher', seen: {}, bench: {}, c: {} }; DC.saveNow(); });
  await p.goto(U + '#ch3'); await p.reload();
  await p.locator('details.vx-learn summary').first().click();
  ok((await p.locator('details.vx-learn[open]').innerText()).includes('Means: 25 °C = 7.2') && (await p.locator('details.vx-learn[open]').innerText()).includes('18 °C = 4.2'), 'Researcher level adds computed means 7.2 and 4.2 and ranges to the table');
  await p.locator('[data-act=vxBench]').click();
  ok((await p.locator('#startBtn, #tableBox').count()) >= 1 && (await p.locator('#tableBox').innerText()).includes('7'), 'Researcher workbench opens the original lab/table tools with the same data');
  await p.locator('[data-act=vxBench]').first().click(); ok(await p.locator('.vx-scene').count() === 1, 'and returns to the scene');
  ok(errors.length === 0, 'no console errors ' + errors.join('|')); await browser.close();

  console.log('M3 Path B organizer');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(() => { const S = DC.state; S.mode = 'independent'; S.nick = 'Zoe'; S.path = 'B'; S.b.f.title = 'Ants'; S.b.f.question = 'When do ants come?'; DC.saveNow(); });
  await p.goto(U + '#ch3'); await p.reload();
  ok(await p.locator('.vx-panel textarea').count() === 3 && await p.locator('#stepCards .vx-panel').count() === 3, 'planning cards (change / look at / same) and step cards');
  ok(!(await p.evaluate(() => DC.isDone(3))), 'not complete yet');
  await p.fill('#st-0', 'Watch the door at 8am'); await p.locator('[data-act=bAddLog]').click(); await p.fill('#lg-0label', 'Mon'); await p.fill('#lg-0value', '4'); await p.locator('[data-act=bAddLog]').click(); await p.fill('#lg-1label', 'Tue'); await p.fill('#lg-1value', '6');
  ok((await p.locator('.vx-panel.gold').innerText()).includes('Everything needed'), 'readiness card updates as evidence cards are added');
  await p.locator('[data-bind="b.organizerSeen"]').check(); ok(await p.evaluate(() => DC.isDone(3)), 'chapter 3 complete on Path B');
  ok(await p.evaluate(() => DC.state.b.log.map((r) => r.value).join() === '4,6,'), 'only the numbers the learner typed are stored (nothing invented)');
  ok(errors.length === 0, 'no console errors ' + errors.join('|')); await browser.close();

  console.log('M3 layouts');
  for (const w of [320, 390, 768, 1280]) {
    ({ browser, page: p, errors } = await open({ reduced: true, w }));
    await p.evaluate(SEED); await p.evaluate(() => { DC.state.a.setup = { temp: 'changed', count: 'measured', vial: 'same', nflies: 'same', tod: 'same', taps: 'same' }; DC.saveNow(); });
    await p.goto(U + '#ch3'); await p.reload(); await p.locator('#c3go').click();
    ok((await overflow(p)) <= 0, `lab with counting panel @${w}px: no horizontal overflow`);
    const cnt = await p.locator('#c3count svg[viewBox="0 0 260 420"]').boundingBox(); ok(cnt.width >= 140 && cnt.x >= 0 && cnt.x + cnt.width <= w, `@${w}px the counting close-up is usable (${Math.round(cnt.width)}px wide)`);
    ok(errors.length === 0, `@${w}: no console errors ` + errors.join('|')); await browser.close();
  }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
