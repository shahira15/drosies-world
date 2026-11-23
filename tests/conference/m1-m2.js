const { open, ok, done, overflow } = require('./helpers');
(async () => {
  const { browser, page, errors } = await open();
  console.log('M1/M2: shell, persistence, ch1, ch2');
  ok(await page.locator('#chTitle').innerText() === 'The Conference Invitation', 'chapter 1 title rendered');
  ok(await page.locator('#railList button').count() === 10, 'rail has 10 chapter buttons');
  ok(await page.locator('#railList button:not([disabled])').count() === 1, 'only chapter 1 open at start (guided gating)');
  ok(await page.locator('.nav-foot .btn.primary').getAttribute('aria-disabled') === 'true', 'next button disabled before ch1 done');
  // PII guard
  await page.fill('#nick', 'me@example.com');
  ok((await page.inputValue('#nick')) === '' && (await page.locator('#nickWarn').innerText()).length > 0, 'email-like nickname is rejected with warning');
  await page.fill('#nick', 'Zoe');
  await page.locator('#colorChoice label').nth(1).click();
  ok((await page.locator('#badgeBox .nm').innerText()) === 'Zoe', 'badge shows nickname live');
  ok((await page.locator('#badgeBox .badge').getAttribute('style')).includes('#b5483c'), 'badge color changes');
  await page.locator('input[name=mode][value=guided]').check({ force: true });
  ok(await page.locator('#railList button:not([disabled])').count() === 2, 'chapter 2 unlocks after ch1 complete');
  // quick check mcq
  await page.locator('[data-q=c1peer] .opt').nth(0).click();
  ok((await page.locator('[data-q=c1peer] .fb').innerText()).startsWith('Not quite'), 'wrong answer gives targeted feedback');
  await page.locator('[data-q=c1peer] .opt').nth(1).click();
  ok((await page.locator('[data-q=c1peer] .fb').innerText()).startsWith('Yes'), 'right answer confirmed');
  // persistence
  await page.reload();
  ok((await page.inputValue('#nick')) === 'Zoe', 'nickname persists across reload');
  ok(await page.locator('input[name=mode][value=guided]').isChecked(), 'mode persists');
  // go ch2
  await page.locator('.nav-foot .btn.primary').click();
  ok(await page.locator('#chTitle').innerText() === 'Choose Your Research Path', 'navigates to chapter 2');
  ok(page.url().endsWith('#ch2'), 'hash updated');
  await page.locator('[data-act=pickPath][data-p=A]').click();
  ok(await page.locator('dl.study dt').count() >= 11, 'path A study card lists all required design elements');
  ok(await page.locator('.callout.sim').count() > 0, 'simulation notice visible');
  ok(await page.locator('.nav-foot .btn.primary').getAttribute('aria-disabled') === 'true', 'ch2 gated until simulation acknowledged');
  await page.locator('#ack').check();
  ok(await page.locator('#railList button:not([disabled])').count() === 3, 'ch3 unlocked after ack');
  // path B
  await page.locator('[data-act=pickPath][data-p=B]').click();
  ok(await page.locator('#bf-title').count() === 1, 'path B form shown');
  ok(await page.locator('#wrap-hypothesis').isVisible(), 'hypothesis visible for experiment type');
  await page.locator('input[name=btype][value=observation]').check({ force: true });
  ok(await page.locator('#wrap-hypothesis').isHidden(), 'hypothesis hidden for observation project');
  await page.fill('#bf-title', 'Ants at my door');
  await page.fill('#bf-question', 'When do ants walk on the path?');
  ok(await page.locator('.nav-foot .btn.primary').getAttribute('aria-disabled') === null, 'ch3 opens once B has title+question');
  await page.locator('[data-bind="b.skip.methods"]').check();
  ok(await page.locator('#bf-methods').isDisabled(), 'skip disables field');
  // keyboard: rail buttons reachable
  await page.keyboard.press('Tab');
  // overflow at widths
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 800 }); ok((await overflow(page)) <= 0, `no horizontal overflow at ${w}px (ch2 path B)`); }
  ok(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
