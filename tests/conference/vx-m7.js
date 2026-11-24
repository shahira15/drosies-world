// Visual adventure M7a: Registration Lobby (Chapter 7). NEW interface.
process.env.CONF_URL = 'http://localhost:8123/scientific-conference.html';
const { open, ok, done, overflow } = require('./helpers');
const U = 'http://localhost:8123/scientific-conference.html';
const SEED = () => { const S = DC.state; S.mode = 'independent'; S.nick = 'Zoe'; S.path = 'A'; S.a.acked = true; DC.saveNow(); };
(async () => {
  let { browser, page: p, errors } = await open({ reduced: true });
  console.log('M7a lobby');
  await p.evaluate(SEED); await p.goto(U + '#ch7'); await p.reload();
  ok(!(await p.evaluate(() => DC.isDone(7))), 'not complete at start');
  ok(!(await p.evaluate(() => DC.state.checked)), 'not checked in before scanning');
  await p.locator('[data-act=v7scan]:visible').first().click();
  ok(await p.evaluate(() => DC.state.checked === true), 'scanning the badge checks in');
  const b1 = await p.evaluate(() => DC.assignment().board);
  await p.reload(); ok((await p.evaluate(() => DC.assignment().board)) === b1 && (await p.locator('#v7badge').innerText()).includes('#' + b1), 'board number is stable and shown');
  ok(!(await p.evaluate(() => DC.isDone(7))), 'check-in alone does not finish the chapter');
  // wrong order
  const wrong = ['why', 'hello', 'how', 'found', 'means', 'next'];
  for (const id of wrong) await p.locator(`#v7strip [data-act=v7add][data-id=${id}]`).click();
  await p.locator('[data-act=v7check]').click();
  ok(!(await p.evaluate(() => DC.isDone(7))) && !(await p.evaluate(() => DC.state.reg.orderOk)), 'wrong talk order is not accepted');
  for (const id of wrong) await p.locator(`#v7strip [data-act=v7drop][data-id=${id}]`).click();
  for (const id of ['hello', 'why', 'how', 'found', 'means', 'next']) await p.locator(`#v7strip [data-act=v7add][data-id=${id}]`).click();
  await p.locator('[data-act=v7check]').click();
  ok(await p.evaluate(() => DC.state.reg.orderOk === true && DC.isDone(7)), 'correct order completes the chapter (checked && reg.orderOk)');
  for (const v of ['v7prog', 'v7board', 'v7map']) { await p.locator(`[data-act=${v}]`).first().click(); }
  ok(await p.locator('.vx-scene [data-act=v7scan]').count() >= 1, 'scene hotspot present');
  ok(errors.length === 0, 'no console errors: ' + errors.join(';')); await browser.close();

  console.log('M7a keyboard');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(SEED); await p.goto(U + '#ch7'); await p.reload();
  await p.locator('[data-act=v7scan]:visible').first().focus(); await p.keyboard.press('Enter');
  ok(await p.evaluate(() => DC.state.checked === true), 'scan works from the keyboard');
  await browser.close();

  console.log('M7a layouts');
  for (const w of [320, 390, 768, 1280]) { ({ browser, page: p, errors } = await open({ reduced: true, w })); await p.evaluate(SEED); await p.goto(U + '#ch7'); await p.reload(); ok((await overflow(p)) <= 0, `lobby @${w}px: no overflow`); await p.locator('[data-act=v7scan]:visible').first().click(); ok((await overflow(p)) <= 0, `checked-in lobby @${w}px: no overflow`); ok(errors.length === 0, `@${w}: no console errors: ${errors.join(';')}`); await browser.close(); }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
