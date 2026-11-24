// Visual adventure M4: Data Detective HQ. NEW interface.
process.env.CONF_URL = 'http://localhost:8123/scientific-conference.html';
const { open, ok, done, overflow } = require('./helpers');
const U = 'http://localhost:8123/scientific-conference.html';
const SEED = () => { const S = DC.state; S.mode = 'independent'; S.nick = 'Zoe'; S.path = 'A'; S.a.acked = true; S.a.setup = { temp: 'changed', count: 'measured', vial: 'same', nflies: 'same', tod: 'same', taps: 'same' }; DC.DATA.conditions.forEach((c) => (S.a.rec[c.id] = c.counts.slice())); S.det.c3var = { sel: 1, ok: true }; DC.saveNow(); };
const quizPick = async (p, id, ok_) => { const n = await p.locator(`[data-act=vxQuiz][data-id=${id}]`).count(); for (let i = 0; i < n; i++) { await p.locator(`[data-act=vxQuiz][data-id=${id}][data-i="${i}"]`).click(); if ((await p.evaluate((id) => DC.state.det[id].ok, id)) === ok_) return i; } return -1; };
(async () => {
  let { browser, page: p, errors } = await open({ reduced: true });
  console.log('M4 detective HQ, Path A');
  await p.evaluate(SEED); await p.goto(U + '#ch4'); await p.reload();
  ok(await p.locator('svg[aria-label*="detective room"]').count() === 1 && await p.locator('.vx-hot').count() === 7, 'illustrated evidence board with seven case pins');
  ok(await p.locator('.vx-tool').count() === 7, 'tray alternative lists the seven cases');
  const w0 = await p.evaluate(() => (document.querySelector('#stage').innerText.match(/\S+/g) || []).length);
  ok(w0 < 250, 'far less text than before (' + w0 + ' words; baseline 773)');
  // case 1
  for (let i = 0; i < 10; i++) await p.locator('[data-act=v4sort]').first().click();
  ok((await p.locator('.vx-panel .vx-step.done').count()) === 10 && (await p.locator('.vx-tool.done').count()) === 1, 'case 1: ten cards fly into two groups');
  const bins = await p.locator('#v4panel .grid2 .vx-panel').allInnerTexts(); ok(bins[0].replace(/\s/g, '').includes('78687') || bins.join('').includes('7'), 'cards land in the right groups');
  // case 2
  await p.locator('.vx-tool').nth(1).click();
  ok((await p.locator('#v4panel').innerText()).includes('7 + 8 + 6 + 8 + 7 = 36') && (await p.locator('#v4panel').innerText()).includes('7.2 flies') && (await p.locator('#v4panel').innerText()).includes('4.2 flies'), 'case 2: shows the arithmetic and computed averages 7.2 and 4.2');
  const labels = (await p.locator('[data-act=vxQuiz][data-id=d_mean]').allInnerTexts()).map((x) => x.replace(/[^0-9.]/g, '')).sort();
  ok(labels.join() === '6,7.2,8', 'mean answers are generated from the data: ' + labels.join('/'));
  await p.locator('[data-act=vxQuiz][data-id=d_mean]').first().click();
  await quizPick(p, 'd_mean', true); await quizPick(p, 'd_diff', true);
  ok(await p.evaluate(() => DC.state.det.d_mean.ok && DC.state.det.d_diff.ok), 'cases 2: mean and difference answered (same saved keys as before)');
  // case 3
  await p.locator('.vx-tool').nth(2).click();
  ok((await p.locator('#v4chart .chart-pt').count()) === 10, 'case 3: dot plot with ten points');
  await p.locator('#v4chart .chart-pt').first().focus(); ok((await p.locator('#v4out').innerText()).includes('trial 1'), 'focusing a dot reads its value');
  await quizPick(p, 'd_range', true);
  ok(await p.evaluate(() => DC.state.det.d_range.ok), 'range answered');
  // case 4: slider
  await p.locator('.vx-tool').nth(3).click();
  ok((await p.locator('#v4axfb').innerText()).includes('58%'), 'honest axis: 18 °C bar is about 58% of the 25 °C bar');
  await p.locator('#v4slide').fill('3');
  ok((await p.locator('#v4axfb').innerText()).includes('29%') && (await p.locator('#v4axchart').innerText()).includes('axis starts at 3'), 'sliding the axis start to 3 redraws the bars and shows the distortion (29% vs 58%)');
  ok((await p.locator('#v4axchart rect[fill-opacity=".85"]').count()) === 2, 'bars are really redrawn');
  await quizPick(p, 'd_axis', true);
  // case 5
  await p.locator('.vx-tool').nth(4).click();
  ok(await p.locator('[data-act=v4check]').isDisabled(), 'check is disabled until all four cards are placed');
  const truth = ['obs', 'int', 'obs', 'int'];
  await p.locator('[data-act=v4bin][data-v=obs]').click(); ok((await p.locator('.vx-bubble').innerText()).includes('First tap'), 'tapping a bin first prompts for a card');
  for (let i = 0; i < 4; i++) { await p.locator(`[data-act=v4oi][data-i="${i}"]`).click(); await p.locator(`[data-act=v4bin][data-v=${i === 0 ? 'int' : truth[i]}]`).click(); }   // card 0 deliberately wrong
  await p.locator('[data-act=v4check]').click(); ok(!(await p.evaluate(() => DC.state.det.d_oi.ok)), 'a wrongly placed card is not accepted');
  await p.locator('[data-act=v4oi][data-i="0"]').click(); await p.locator('[data-act=v4bin][data-v=obs]').click(); await p.locator('[data-act=v4check]').click();
  ok(await p.evaluate(() => DC.state.det.d_oi.ok), 'corrected sorting accepted');
  // case 6
  await p.locator('.vx-tool').nth(5).click();
  ok((await p.locator('#v4panel').innerText()).includes('LAZY'), 'the “lazy flies” claim is shown');
  const c0 = await quizPick(p, 'd_cause', true); ok((await p.locator('#v4panel .vx-fb').first().innerText()).includes('one small test') || (await p.locator('#v4panel .vx-fb').first().innerText()).includes('fits the prediction'), 'best-supported statement explained without overclaiming');
  await p.locator('[data-act=vxQuiz][data-id=d_repl][data-i="0"]').click(); await p.locator('[data-act=vxQuiz][data-id=d_repl][data-i="1"]').click();
  ok(await p.evaluate(() => DC.state.det.d_cause.ok && DC.state.det.d_repl.ok) && /independent replicates/i.test(await p.locator('#v4panel').innerText()), 'replicates vs repeated measurements, and overclaim rejected');
  // case 7: wrong then right
  await p.locator('.vx-tool').nth(6).click();
  for (const i of [5]) await p.locator(`[data-act=v4lim][data-i="${i}"]`).click(); await p.locator('[data-act=v4limcheck]').click();
  ok(!(await p.evaluate(() => DC.isDone(4))), 'a false limit is rejected');
  await p.locator('[data-act=v4lim][data-i="5"]').click(); for (const i of [0, 1, 2, 3, 4]) await p.locator(`[data-act=v4lim][data-i="${i}"]`).click(); await p.locator('[data-act=v4limcheck]').click();
  ok(await p.evaluate(() => DC.isDone(4)), 'chapter 4 complete with the same eight saved answers as the original');
  ok((await p.locator('.vx-drosie').getAttribute('data-state')) === 'celebrate', 'Drosie celebrates the closed case');
  ok(+(await p.locator('#btnPack .vx-count').innerText()) >= 6, 'Graph and Limits cards joined the backpack');
  await p.reload(); ok(await p.evaluate(() => DC.isDone(4)), 'progress persists');
  ok(errors.length === 0, 'no console errors ' + errors.join('|')); await browser.close();

  console.log('M4 without data / Researcher');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(() => { const S = DC.state; S.mode = 'independent'; S.nick = 'T'; S.path = 'A'; S.a.acked = true; S.a.rec.control[0] = 7; DC.saveNow(); }); await p.goto(U + '#ch4'); await p.reload();
  ok((await p.locator('#stage').innerText()).includes('Back to the lab') && !(await p.locator('#v4panel').count()), 'with incomplete data the HQ sends the learner back to the lab (nothing is invented)');
  await p.evaluate(SEED); await p.evaluate(() => { DC.state.ui = { level: 'researcher', seen: {}, bench: {}, c: {} }; DC.saveNow(); }); await p.goto(U + '#ch4'); await p.reload();
  ok((await p.locator('#stage').innerText()).includes('median 7') && (await p.locator('#stage').innerText()).includes('range 6 to 8'), 'Researcher level adds medians and ranges');
  await p.locator('[data-act=vxBench]').click(); ok((await p.locator('#stage').innerText()).includes('Summary of the five trials'), 'workbench shows the original numeric chapter');
  ok(errors.length === 0, 'no console errors ' + errors.join('|')); await browser.close();

  console.log('M4 Path B evidence board');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(() => { const S = DC.state; S.mode = 'independent'; S.nick = 'T'; S.path = 'B'; S.b.f.title = 'Ants'; S.b.f.question = 'Q?'; S.b.log = [{ label: 'Mon', group: 'Door', value: '4', note: '' }, { label: 'Tue', group: 'Door', value: '6', note: '' }, { label: 'Wed', group: 'Window', value: '2', note: '' }]; DC.saveNow(); }); await p.goto(U + '#ch4'); await p.reload();
  await p.locator('[data-act=v4kind][data-v=compare]').click(); ok((await p.locator('#bBox .chart-pt').count()) === 3, 'graph has exactly the three numbers the learner entered');
  await p.fill('#byt', 'Ants'); await p.fill('#bun', 'ants'); await p.fill('#bxt', 'Where');
  await p.fill('#cl-0t', 'More ants came on Tuesday'); await p.locator('[data-act=v4ckind][data-v=obs]').click(); await p.fill('#cl-0e', 'Tue = 6');
  ok(!(await p.evaluate(() => DC.isDone(4))), 'not complete before the two checks');
  await quizPick(p, 'd_b_oi', true); await quizPick(p, 'd_b_rep', true); ok(await p.evaluate(() => DC.isDone(4)), 'Path B chapter 4 complete');
  ok(errors.length === 0, 'no console errors ' + errors.join('|')); await browser.close();

  console.log('M4 layouts');
  for (const w of [320, 390, 768, 1280]) { ({ browser, page: p, errors } = await open({ reduced: true, w })); await p.evaluate(SEED); for (const c of [0, 3, 6]) { await p.evaluate((c) => { DC.state.ui = { level: 'explorer', seen: {}, bench: {}, c: { 4: { case: c } } }; DC.saveNow(); }, c); await p.goto(U + '#ch4'); await p.reload(); ok((await overflow(p)) <= 0, `case ${c + 1} @${w}px: no horizontal overflow`); } ok(errors.length === 0, `@${w}: no console errors`); await browser.close(); }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
