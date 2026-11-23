const { open, ok, done, overflow } = require('./helpers');
const SEED = (path) => { DC.state.mode = 'independent'; DC.state.nick = 'Zoe'; DC.state.path = path; DC.state.a.acked = true; DC.DATA.conditions.forEach((c) => (DC.state.a.rec[c.id] = c.counts.slice())); DC.state.b.f.title = 'Ants at my door'; DC.state.b.f.question = 'When do ants come to my door?'; DC.saveNow(); };
const seed = (page, p) => page.evaluate(SEED, p);
(async () => {
  let { browser, page, errors } = await open({});
  console.log('M7 registration (ch7)');
  await seed(page, 'A'); await page.goto('http://localhost:8123/scientific-conference.html#ch7'); await page.reload();
  ok((await page.locator('#stage').innerText()).includes('Everything here is pretend'), 'fictional notice shown');
  const a1 = await page.evaluate(() => JSON.stringify(DC.assignment())); await page.reload();
  ok(a1 === await page.evaluate(() => JSON.stringify(DC.assignment())), 'poster assignment is stable across reloads');
  ok(!(await page.evaluate(() => DC.isDone(7))), 'ch7 incomplete at start');
  await page.locator('[data-act=checkIn]').click();
  ok((await page.locator('#checkedMsg').innerText()).includes('checked in'), 'check-in works');
  ok((await page.locator('.badge .nm').first().innerText()) === 'Zoe', 'badge shows nickname');
  await page.locator('[data-act=ordCheck]').click();
  ok((await page.locator('#ordMsg').innerText()).includes('of 6 are in the right place'), 'wrong order is rejected with a count');
  ok(!(await page.evaluate(() => DC.isDone(7))), 'not complete with wrong order');
  const ANS = ['hello', 'why', 'how', 'found', 'means', 'next'];
  for (let i = 0; i < 6; i++) {
    for (let guard = 0; guard < 8; guard++) {
      const order = await page.evaluate(() => DC.state.reg.order); const at = order.indexOf(ANS[i]); if (at <= i) break;
      await page.locator(`#ordBox [data-act=ordMove][data-i="${at}"][data-d="-1"]`).click();
    }
  }
  await page.locator('[data-act=ordCheck]').click();
  ok((await page.locator('#ordMsg').innerText()).startsWith('Yes!'), 'correct order accepted (moved with buttons only, no dragging)');
  ok(await page.evaluate(() => DC.isDone(7)), 'ch7 complete');
  await page.reload(); ok(await page.evaluate(() => DC.isDone(7)), 'ch7 completion persists');
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 800 }); ok((await overflow(page)) <= 0, `no overflow ${w}px (ch7)`); }
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  ({ browser, page, errors } = await open({}));
  console.log('M7 hall (ch8) path A');
  await seed(page, 'A'); await page.goto('http://localhost:8123/scientific-conference.html#ch8'); await page.reload();
  ok(await page.locator('.hot').count() === 6 && await page.locator('.areabtn').count() === 6, '6 map hotspots and 6 list buttons');
  ok(!(await page.evaluate(() => DC.isDone(8))), 'ch8 incomplete at start');
  // keyboard: tab to a hotspot and press Enter
  await page.locator('.hot').first().focus(); await page.keyboard.press('Enter');
  ok(await page.locator('#areaH').count() === 1, 'hotspot works with keyboard Enter');
  ok(await page.evaluate(() => document.activeElement.id) === 'areaH', 'focus moves to the area heading');
  const names = ['reg', 'booth', 'posters', 'stage', 'talk', 'reflect'];
  for (const n of names) { await page.locator(`.areabtn[data-a=${n}]`).click(); ok(await page.evaluate((n) => !!DC.state.hall.visited[n], n), 'visited ' + n); }
  ok((await page.locator('#visitedCount').innerText()) === '6', 'visited counter 6');
  // posters
  await page.locator('.areabtn[data-a=posters]').click();
  await page.locator('[data-q=hp_p1] .opt').nth(1).click();
  ok((await page.locator('[data-q=hp_p1] .fb').innerText()).startsWith('Not quite'), 'wrong poster diagnosis gets feedback');
  await page.locator('[data-q=hp_p1] .opt').nth(0).click();
  ok((await page.locator('[data-q=hp_p1] .fb').innerText()).includes('One pot per place')||(await page.locator('[data-q=hp_p1] .fb').innerText()).includes('one pot in each place'), 'right poster diagnosis explained');
  ok(await page.locator('#areaH').count() === 1, 'hall stays open after answering (no full re-render)');
  // stage claims
  await page.locator('.areabtn[data-a=stage]').click();
  ok((await page.locator('#areaPanel').innerText()).includes('61') === false, 'stage shows means not hidden totals');
  await page.locator('[data-q=ht_2] .opt').nth(0).click();
  ok(/always/i.test(await page.locator('[data-q=ht_2] .fb').innerText()), 'overclaim claim rejected with reason');
  // scientists
  await page.locator('.areabtn[data-a=talk]').click();
  ok((await page.locator('#areaPanel').innerText()).includes('fictional'), 'scientists labeled fictional');
  ok(await page.locator('.sci').count() === 5, 'five scientists');
  await page.locator('[data-act=sciPick][data-s=quill]').click();
  ok((await page.locator('#sciQ').innerText()).includes('question were you investigating'), 'Quill asks the question');
  await page.locator('[data-act=sciAns][data-i="2"]').click();
  ok((await page.locator('#sciPanel .fb').innerText()).includes('Not quite') && (await page.locator('#sciPanel .fb').innerText()).includes('lazy'), 'prove/lazy answer gets specific correction');
  ok((await page.locator('#sciCount').innerText()) === '0', 'wrong answer does not count');
  await page.locator('[data-act=sciAns][data-i="0"]').click();
  ok((await page.locator('#sciPanel .fb').innerText()).startsWith('Strong'), 'strong answer praised for the right reasons');
  ok(!(await page.evaluate(() => DC.isDone(8))), 'one strong answer is not enough');
  const best = { anand: 0, waverly: 0, okoro: 0 };
  for (const [s, i] of Object.entries(best)) { await page.locator(`[data-act=sciPick][data-s=${s}]`).click(); await page.locator(`[data-act=sciAns][data-i="${i}"]`).click(); }
  await page.locator('[data-act=sciPick][data-s=waverly]').click(); const wav = await page.locator('#sciPanel .opt').first().innerText();
  ok(wav.includes('7.2') && wav.includes('4.2'), 'Waverly answer uses the computed means 7.2 and 4.2');
  ok(await page.evaluate(() => DC.isDone(8)), 'ch8 complete after 6 areas and 4 strong answers');
  // reflection persists
  await page.locator('.areabtn[data-a=reflect]').click(); await page.fill('#rf-learned', 'Scientists share and revise.');
  await page.reload(); ok((await page.evaluate(() => DC.state.refl.learned)) === 'Scientists share and revise.', 'reflection saved');
  ok(await page.evaluate(() => DC.isDone(8)), 'ch8 completion persists');
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 800 }); ok((await overflow(page)) <= 0, `no overflow ${w}px (ch8)`); }
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  ({ browser, page, errors } = await open({ reduced: true }));
  console.log('M7 hall path B');
  await seed(page, 'B'); await page.goto('http://localhost:8123/scientific-conference.html#ch8'); await page.reload();
  await page.locator('.areabtn[data-a=talk]').click(); await page.locator('[data-act=sciPick][data-s=quill]').click();
  ok((await page.locator('#sciQ').innerText()).includes('When do ants come to my door?'), 'B: Quill quotes the learner’s own question');
  await page.locator('[data-act=sciPick][data-s=anand]').click();
  ok((await page.locator('#sciQ').innerText()).includes('comparison in your project'), 'B: Anand asks the pathway-appropriate control question');
  await page.locator('[data-act=sciAns][data-i="2"]').click();
  ok((await page.locator('#sciPanel .fb').innerText()).includes('Without a comparison'), 'B: claiming cause without comparison is corrected');
  ok(errors.length === 0, 'no console errors (B) ' + errors.join('|'));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
