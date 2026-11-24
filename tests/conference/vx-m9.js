// Visual adventure M8: Presentation Theater (Chapter 9). NEW interface.
process.env.CONF_URL = 'http://localhost:8123/scientific-conference.html';
const { open, ok, done, overflow } = require('./helpers');
const U = 'http://localhost:8123/scientific-conference.html';
const SEED = () => { const S = DC.state; S.mode = 'independent'; S.nick = 'Zoe'; S.path = 'A'; S.a.acked = true; S.checked = true; Object.assign(S.abs, { bg: 'Fruit flies are ectotherms.', obj: 'Do fewer flies climb at 18 °C?', methods: 'Two groups of 10 flies were tapped down and counted.', results: 'Mean 7.2 at 25 °C and 4.2 at 18 °C.', conclusion: 'Cooler flies climbed less in this simulation.' }); DC.saveNow(); };
(async () => {
  let { browser, page: p, errors } = await open({ reduced: true });
  console.log('M8 theater');
  await p.evaluate(SEED); await p.goto(U + '#ch9'); await p.reload();
  ok(!(await p.evaluate(() => DC.isDone(9))), 'not complete at start');
  ok(await p.locator('.vx-tray [data-act=v9step]').count() === 5, 'five stops');
  const w0 = await p.evaluate(() => (document.querySelector('#stage').innerText.match(/\S+/g) || []).length); ok(w0 < 150, 'practice stop is short (' + w0 + ' words, baseline 673)');
  // 1 practice: skip ahead 6 times
  for (let i = 0; i < 6; i++) await p.locator('[data-act=v9skip]').click();
  ok(await p.evaluate(() => DC.state.prac.timerDone === true), 'finishing the 60 s practice sets prac.timerDone');
  // real timer runs
  await p.locator('[data-act=v9reset]').click(); await p.locator('#v9go').click(); await p.waitForTimeout(2300);
  const t = await p.locator('#v9t').innerText(); ok(/5[6-8] s/.test(t), 'the timer counts down (' + t + ')'); await p.locator('#v9go').click();
  // 2 explain
  await p.locator('.vx-tray [data-act=v9step][data-i="1"]').click();
  await p.fill('#explain', 'proves everything');
  await p.locator('[data-act=v9expl]').click(); ok(!(await p.evaluate(() => DC.state.prac.explainOk)), 'weak explanation rejected');
  await p.fill('#explain', 'In my test, I counted flies that climbed above the line. At 25 °C about 7 climbed but at 18 °C about 4 did. This suggests cooler flies climb less in my test.');
  await p.locator('[data-act=v9expl]').click(); ok(await p.evaluate(() => DC.state.prac.explainOk), 'good explanation accepted by the original checker');
  // 3 audience: weak then strong
  await p.locator('.vx-tray [data-act=v9step][data-i="2"]').click();
  const goodSel = (id, k) => `[data-act=v9pick][data-id=${id}][data-k="${k}"]`;
  const pick = async (id, k, label) => { await p.locator(goodSel(id, k)).filter({ hasText: label }).click(); };
  const PIECES = { q1: ['My data show a pattern', 'They cannot show why', 'only tested a few'], q2: ['fairly sure', 'small number', 'repeat it'], q3: ['test it again', 'more groups', 'find out why'] };
  const WEAK = { q1: ['Flies are just', 'everything about all', 'Trust me'], q2: ['totally certain', 'No reason', 'I am done'], q3: ['sleep on it', 'Nothing changes', 'Who knows'] };
  for (const id of ['q1']) for (let k = 0; k < 3; k++) await pick(id, k, WEAK[id][k]);
  ok(!(await p.evaluate(() => DC.state.prac.qaDone.q1)), 'three weak cards do not pass');
  for (const id of ['q1', 'q2', 'q3']) for (let k = 0; k < 3; k++) await pick(id, k, PIECES[id][k]);
  ok(await p.evaluate(() => ['q1', 'q2', 'q3'].every((i) => DC.state.prac.qaDone[i])), 'strong cards pass all three audience questions');
  ok((await p.evaluate(() => DC.state.prac.qa.q2)).length > 20, 'assembled answer is saved as text in prac.qa');
  // 4 revise
  await p.locator('.vx-tray [data-act=v9step][data-i="3"]').click();
  await p.fill('#v9rev', 'too short'); await p.locator('[data-act=v9revadd]').click(); ok((await p.evaluate(() => DC.state.revs.length)) === 0, 'short revision note rejected');
  await p.locator('#stage [data-act=v9st]').first().click(); await p.locator('[data-act=v9revadd]').click(); ok((await p.evaluate(() => DC.state.revs.length)) === 1, 'revision note added from an example card');
  // 5 reflect
  ok(!(await p.evaluate(() => DC.isDone(9))), 'not complete until reflection');
  await p.locator('.vx-tray [data-act=v9step][data-i="4"]').click(); await p.locator('[data-act=v9st]').first().click(); await p.fill('#r9-learned', 'I learned that scientists share and improve their work.');
  ok(await p.evaluate(() => DC.isDone(9)), 'complete when all five stops are done (same rule as the original)');
  ok(errors.length === 0, 'no console errors: ' + errors.join(';')); await browser.close();

  console.log('M8 keyboard + migration');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(() => { SEED2 = 0; const S = DC.state; S.mode = 'independent'; S.nick = 'Zoe'; S.path = 'A'; S.a.acked = true; S.checked = true; Object.assign(S.prac, { timerDone: true, explainOk: true, explain: 'x', qaDone: { q1: true, q2: true, q3: true } }); S.revs = [{ note: 'changed something because reasons here', changed: true, at: 1 }]; S.refl.learned = 'I learned a lot about sharing work'; DC.saveNow(); });
  await p.goto(U + '#ch9'); await p.reload();
  ok(await p.evaluate(() => DC.isDone(9)), 'old completed Chapter 9 stays complete');
  await p.locator('.vx-tray [data-act=v9step][data-i="1"]').focus(); await p.keyboard.press('Enter'); ok(await p.locator('#explain').count() === 1, 'step tabs work from the keyboard');
  await browser.close();

  console.log('M8 layouts');
  for (const w of [320, 390, 768, 1280]) { ({ browser, page: p, errors } = await open({ reduced: true, w })); await p.evaluate(SEED); await p.goto(U + '#ch9'); await p.reload(); for (let i = 0; i < 5; i++) { await p.locator(`.vx-tray [data-act=v9step][data-i="${i}"]`).click(); ok((await overflow(p)) <= 0, `stop ${i} @${w}px: no overflow`); } ok(errors.length === 0, `@${w}: no console errors: ${errors.join(';')}`); await browser.close(); }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
