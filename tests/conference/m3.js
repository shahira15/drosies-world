const { open, ok, done, overflow } = require('./helpers');
(async () => {
  // ---- Path A, reduced motion for speed ----
  let { browser, page, errors } = await open({ reduced: true });
  console.log('M3 path A');
  await page.fill('#nick', 'Tester'); await page.locator('input[name=mode][value=guided]').check({ force: true });
  await page.locator('.nav-foot .btn.primary').click();
  await page.locator('[data-act=pickPath][data-p=A]').click(); await page.locator('#ack').check();
  await page.locator('.nav-foot .btn.primary').click();
  ok(await page.locator('#chTitle').innerText() === 'The Research Investigation', 'on chapter 3');
  ok((await page.locator('#startBtn').count()) === 0 && (await page.locator('#labCtl .callout.warn').count()) === 1, 'trials locked before setup sort');
  // wrong then right sort
  await page.selectOption('#su-temp', 'measured');
  ok((await page.locator('#sufb-temp').innerText()).startsWith('Not quite'), 'wrong sort gets feedback');
  const ans = { temp: 'changed', count: 'measured', vial: 'same', nflies: 'same', tod: 'same', taps: 'same' };
  for (const [k, v] of Object.entries(ans)) await page.selectOption('#su-' + k, v);
  ok(await page.locator('#startBtn').isEnabled(), 'trials unlock after correct setup');
  // consistency: dataset <-> geometry <-> rendered svg
  const geo = await page.evaluate(() => {
    const out = []; const YL = 380 - 8 * 34;
    for (const c of DC.DATA.conditions) for (let t = 0; t < 5; t++) {
      const f = DC.lab.positions(c.id, t); const svg = DC.lab.svg(c.id, t, 1, false);
      const ys = [...svg.matchAll(/<g transform="translate\(([\d.]+) ([\d.]+)\) rotate/g)].map((m) => parseFloat(m[2]));
      out.push({ c: c.id, t, expect: c.counts[t], model: f.filter((x) => x.cross).length, drawn: ys.filter((y) => y < YL).length, nFlies: ys.length, minCross: Math.min(...f.filter((x) => x.cross).map((x) => x.cm), 99), maxNon: Math.max(...f.filter((x) => !x.cross).map((x) => x.cm), -1) });
    }
    return out;
  });
  ok(geo.every((g) => g.expect === g.model && g.model === g.drawn && g.nFlies === 10), 'all 10 trials: drawn flies above line == dataset count (10 flies each)');
  ok(geo.every((g) => g.minCross >= 8.6 && g.maxNon <= 7.1), 'no ambiguous flies near the 8 cm line');
  // run trial 1 control, wrong count, then right
  await page.locator('#startBtn').click();
  ok(await page.locator('#cnt').count() === 1, 'count form appears after the trial (reduced motion skips animation)');
  await page.fill('#cnt', '3'); await page.locator('[data-act=c3record]').click();
  ok((await page.locator('#cntMsg').innerText()).includes('more flies'), 'wrong count rejected with direction hint');
  ok(await page.locator('.tb.rec').count() === 0, 'wrong count not recorded');
  await page.locator('[data-act=c3help]').click();
  ok(await page.locator('#labSvg circle[stroke="#e0a000"]').count() === 7, 'help highlights exactly 7 crossing flies');
  await page.fill('#cnt', '7'); await page.locator('[data-act=c3record]').click();
  ok((await page.locator('#cntMsg').innerText()).startsWith('✓'), 'correct count recorded');
  // record all the rest
  for (const c of ['control', 'cool']) {
    await page.locator(`[data-act=c3cond][data-c=${c}]`).click();
    for (let t = 0; t < 5; t++) {
      await page.locator(`[data-act=c3trial][data-i="${t}"]`).click(); await page.locator('#startBtn').click();
      const truth = await page.evaluate(([c, t]) => DC.cond(c).counts[t], [c, t]);
      await page.fill('#cnt', String(truth)); await page.locator('[data-act=c3record]').click();
    }
  }
  ok((await page.locator('#recTag').innerText()) === '10 of 10 recorded', 'ten recordings');
  const tbl = await page.locator('#tableBox tbody tr').allInnerTexts();
  ok(tbl.map((r) => r.replace(/\s+/g, ' ')).join('|') === '1 7 4|2 8 5|3 6 3|4 8 5|5 7 4', 'data table shows the dataset values');
  ok(await page.locator('.nav-foot .btn.primary').getAttribute('aria-disabled') === 'true', 'still gated until variation question answered');
  await page.locator('[data-q=c3var] .opt').nth(1).click();
  ok(await page.locator('.nav-foot .btn.primary').getAttribute('aria-disabled') === null, 'ch4 unlocked after all recorded + variation answered');
  // reload keeps data
  await page.reload();
  ok((await page.locator('#recTag').innerText()) === '10 of 10 recorded', 'recorded data persists after reload');
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 800 }); ok((await overflow(page)) <= 0, `no overflow at ${w}px (ch3 A)`); }
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  // ---- animation really runs (normal motion, fast) ----
  ({ browser, page, errors } = await open({}));
  console.log('M3 animation');
  await page.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'T'; DC.state.path = 'A'; DC.state.a.acked = true; ['temp','count','vial','nflies','tod','taps'].forEach((k, i) => (DC.state.a.setup[k] = ['changed','measured','same','same','same','same'][i])); DC.saveNow(); });
  await page.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch3'); await page.reload();
  await page.locator('#fast').check();
  const y0 = await page.evaluate(() => DC.$('#labSvg').innerHTML);
  await page.locator('#startBtn').click();
  await page.waitForTimeout(1200);
  const mid = await page.evaluate(() => DC.$('#labSvg').innerHTML);
  ok(mid !== y0, 'animation changes the picture mid-trial');
  ok(await page.locator('#cnt').count() === 0, 'count form hidden during measurement');
  await page.waitForSelector('#cnt', { timeout: 6000 });
  const t = await page.locator('#timer').innerText();
  ok(t.startsWith('10.0'), 'timer reaches 10.0 s: ' + t);
  ok(errors.length === 0, 'no console errors (anim) ' + errors.join('|'));
  await browser.close();

  // ---- Path B organizer ----
  ({ browser, page, errors } = await open({ reduced: true }));
  console.log('M3 path B');
  await page.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'T'; DC.state.path = 'B'; DC.state.b.f.title = 'Ants'; DC.state.b.f.question = 'When do ants come?'; DC.state.b.type = 'observation'; DC.saveNow(); });
  await page.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch3'); await page.reload();
  ok(await page.locator('#bready li.todo').count() >= 2, 'readiness list flags missing parts');
  ok(!(await page.evaluate(() => DC.isDone(3))), 'B chapter 3 not complete until organizer confirmed');
  await page.fill('#st-0', 'Watched the door at 8am'); await page.locator('[data-act=bAddLog]').click();
  await page.fill('#lg-0label', 'Mon 8am'); await page.fill('#lg-0value', '4'); await page.fill('#lg-1label', 'Tue 8am'); await page.fill('#lg-1value', '6');
  ok(await page.locator('#bready li.ok').count() >= 3, 'readiness updates live');
  await page.locator('[data-bind="b.organizerSeen"]').check();
  ok(await page.locator('.nav-foot .btn.primary').getAttribute('aria-disabled') === null, 'B ch4 unlocked after organizer confirmed');
  await page.reload();
  ok((await page.inputValue('#lg-1value')) === '6', 'B log persists');
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 800 }); ok((await overflow(page)) <= 0, `no overflow at ${w}px (ch3 B)`); }
  ok(errors.length === 0, 'no console errors (B) ' + errors.join('|'));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
