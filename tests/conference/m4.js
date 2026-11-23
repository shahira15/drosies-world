const { open, ok, done, overflow } = require('./helpers');
const SEED_A = () => { DC.state.mode = 'independent'; DC.state.nick = 'T'; DC.state.path = 'A'; DC.state.a.acked = true; DC.DATA.conditions.forEach((c) => (DC.state.a.rec[c.id] = c.counts.slice())); DC.state.det.c3var = { sel: 1, ok: true }; DC.saveNow(); };
(async () => {
  let { browser, page, errors } = await open({});
  console.log('M4 path A');
  await page.evaluate(SEED_A); await page.goto('http://localhost:8123/scientific-conference.html#ch4'); await page.reload();
  const sumText = (await page.locator('.tbl').first().innerText()).replace(/\s+/g, ' ');
  ok(sumText.includes('7.2') && sumText.includes('4.2') && sumText.includes('7') && sumText.includes('36') && sumText.includes('21'), 'summary shows computed means 7.2 / 4.2 and totals 36 / 21');
  ok(sumText.includes('6 to 8') && sumText.includes('3 to 5'), 'ranges 6 to 8 and 3 to 5');
  // verify graph consistent with data: 10 markers, 5 each, aria-labels carry values
  const pts = await page.locator('#gBox .chart-pt').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
  ok(pts.length === 10, '10 interactive points on dot plot');
  ok(pts.filter((p) => p.startsWith('25 °C')).map((p) => p.match(/: (\d+) flies/)[1]).join() === '7,8,6,8,7', 'dot plot 25 °C values match dataset');
  ok(pts.filter((p) => p.startsWith('18 °C')).map((p) => p.match(/: (\d+) flies/)[1]).join() === '4,5,3,5,4', 'dot plot 18 °C values match dataset');
  // keyboard focus shows readout
  await page.locator('#gBox .chart-pt').first().focus();
  ok((await page.locator('#gOut').innerText()).includes('trial 1'), 'focusing a point updates the readout (keyboard)');
  // views
  await page.selectOption('#gView', 'bar');
  ok(await page.locator('#gBox rect[fill-opacity=".85"]').count() === 2, 'bar view draws 2 bars');
  ok((await page.locator('#gBox').innerText()).includes('mean 7.2'), 'bar label shows computed mean');
  await page.locator('[data-k=trunc]').check();
  ok((await page.locator('#gArea .callout.bad').innerText()).includes('29%') && (await page.locator('#gArea .callout.bad').innerText()).includes('58%'), 'truncated axis warning computes 29% vs 58%');
  ok((await page.locator('#gBox').innerText()).includes('axis starts at 3'), 'chart marks truncated axis');
  await page.selectOption('#gView', 'line');
  ok(await page.locator('#gBox polyline').count() === 2, 'line view draws 2 series');
  await page.selectOption('#gView', 'dot');
  // questions
  ok(!(await page.evaluate(() => DC.isDone(4))), 'ch4 incomplete before answers');
  await page.fill('#d_mean', '7'); await page.locator('[data-act=numQ][data-id=d_mean]').click();
  ok((await page.locator('#d_mean').locator('xpath=ancestor::div[contains(@class,"q")]').innerText()).includes('Not quite'), 'wrong mean rejected');
  await page.fill('#d_mean', '7.2'); await page.locator('[data-act=numQ][data-id=d_mean]').click();
  await page.fill('#d_diff', '3'); await page.locator('[data-act=numQ][data-id=d_diff]').click();
  await page.locator('[data-q=d_range] .opt').nth(0).click();
  await page.locator('[data-q=d_cause] .opt').nth(0).click();
  ok((await page.locator('[data-q=d_cause] .fb').innerText()).includes('proves'), 'overclaim answer gets targeted feedback');
  await page.locator('[data-q=d_cause] .opt').nth(1).click();
  await page.locator('[data-q=d_repl] .opt').nth(1).click();
  await page.locator('[data-q=d_axis] .opt').nth(1).click();
  // sorting
  const sel = ['obs', 'int', 'obs', 'int'];
  for (let i = 0; i < 4; i++) await page.selectOption('#d_oi' + i, sel[i]);
  await page.locator('[data-act=oiCheck]').click();
  ok((await page.locator('#d_oi0').locator('xpath=ancestor::div[contains(@class,"q")]').innerText()).includes('All sorted correctly'), 'observation/interpretation sorting accepted');
  // limits: wrong first
  await page.locator('[data-bind="det.limits_sel.5"]').check(); await page.locator('[data-act=limCheck]').click();
  ok(await page.evaluate(() => !DC.state.det.limits.ok), 'limits wrong selection not accepted');
  await page.locator('[data-bind="det.limits_sel.5"]').uncheck();
  for (const i of [0, 1, 2, 3, 4]) await page.locator(`[data-bind="det.limits_sel.${i}"]`).check();
  await page.locator('[data-act=limCheck]').click();
  ok(await page.evaluate(() => DC.isDone(4)), 'chapter 4 complete after all 8 questions correct');
  ok((await page.locator('#qprog').innerText()).includes('8 of 8'), 'progress 8 of 8');
  await page.reload();
  ok(await page.evaluate(() => DC.isDone(4)), 'ch4 completion persists after reload');
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 800 }); ok((await overflow(page)) <= 0, `no overflow ${w}px (ch4 A)`); }
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  // incomplete data: nothing manufactured
  ({ browser, page, errors } = await open({}));
  await page.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'T'; DC.state.path = 'A'; DC.state.a.acked = true; DC.state.a.rec.control[0] = 7; DC.saveNow(); });
  await page.goto('http://localhost:8123/scientific-conference.html#ch4'); await page.reload();
  ok((await page.locator('#stage .callout.warn').innerText()).includes('10 trial recordings'), 'incomplete trials: no analysis is invented, user is sent back');
  await browser.close();

  // ---- path B ----
  ({ browser, page, errors } = await open({}));
  console.log('M4 path B');
  await page.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'T'; DC.state.path = 'B'; DC.state.b.f.title = 'Ants'; DC.state.b.f.question = 'Q?'; DC.state.b.log = [{ label: 'Mon', group: 'Door', value: '4', note: '' }, { label: 'Tue', group: 'Door', value: '6', note: '' }, { label: 'Wed', group: 'Window', value: '2', note: '' }]; DC.saveNow(); });
  await page.goto('http://localhost:8123/scientific-conference.html#ch4'); await page.reload();
  ok((await page.locator('#bGraph').innerText()).includes('Pick the kind'), 'no graph until a kind is chosen');
  await page.locator('input[name=bkind][value=compare]').check({ force: true });
  ok((await page.locator('#bGraph .callout.warn').innerText()).includes('vertical axis a title'), 'warns about unlabeled axes');
  await page.fill('#byt', 'Ants counted'); await page.fill('#bun', 'ants'); await page.fill('#bxt', 'Where');
  ok(await page.locator('#bBox .chart-pt').count() === 3, 'B dot plot has exactly the 3 entered points');
  ok((await page.locator('#bBox').innerText()).includes('Ants counted (ants)'), 'axis title with unit');
  await page.locator('input[name=bkind][value=cats]').check({ force: true });
  ok(await page.locator('#bBox rect[fill-opacity=".85"]').count() === 3, 'bar chart: one bar per row');
  await page.locator('input[name=bkind][value=words]').check({ force: true });
  ok((await page.locator('#bGraph').innerText()).includes('Not every project needs a graph'), 'words option: no graph forced');
  await page.locator('input[name=bkind][value=time]').check({ force: true });
  ok(await page.locator('#bBox polyline').count() === 1, 'line over time');
  await page.fill('#cl-0t', 'Ants prove that all ants like doors because they are smart');
  ok((await page.locator('#clfb-0').innerText()).includes('Strong words'), 'overclaim flagged in claim');
  await page.selectOption('#cl-0k', 'int');
  ok((await page.locator('#clfb-0').innerText()).includes('What did you see'), 'interpretation without evidence prompts for evidence');
  await page.fill('#cl-0t', 'More ants came on Tuesday than Monday'); await page.selectOption('#cl-0k', 'obs'); await page.fill('#cl-0e', 'Row Tue = 6, Mon = 4');
  ok((await page.locator('#clfb-0').innerText()).includes('Good'), 'supported observation accepted');
  ok(!(await page.evaluate(() => DC.isDone(4))), 'B incomplete before checks');
  await page.locator('[data-q=d_b_oi] .opt').nth(0).click(); await page.locator('[data-q=d_b_rep] .opt').nth(1).click();
  ok(await page.evaluate(() => DC.isDone(4)), 'B chapter 4 complete');
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 800 }); ok((await overflow(page)) <= 0, `no overflow ${w}px (ch4 B)`); }
  ok(errors.length === 0, 'no console errors (B) ' + errors.join('|'));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
