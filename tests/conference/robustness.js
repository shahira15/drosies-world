// Robustness + security probes a reviewer would try.
const { chromium } = require('playwright');
const fs = require('fs');
const { open, ok, done, overflow } = require('./helpers');
const { SEED_ALL } = require('./seed');
const OUT = '/tmp/claude-0/-home-user-drosies-world/7dc5b43f-e8cb-5caa-894c-ae04188dc07b/scratchpad/';
const URL = 'http://localhost:8123/scientific-conference.html?legacy=1';
(async () => {
  console.log('robustness: navigation and storage');
  let { browser, page: p, errors } = await open({ reduced: true });
  await p.goto(URL + '#ch7'); await p.reload();
  ok((await p.locator('#chTitle').innerText()) === 'The Conference Invitation', 'deep link to a locked chapter falls back to chapter 1 (no error)');
  await p.goto(URL + '#ch99'); await p.reload(); ok(await p.locator('#chTitle').count() === 1, 'garbage hash does not break the app');
  await p.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'T'; DC.saveNow(); });
  await p.goto(URL + '#ch2'); await p.reload(); await p.evaluate(() => DC.go(3)); await p.goBack();
  ok((await p.locator('#chTitle').innerText()) === 'Choose Your Research Path', 'browser Back returns to the previous chapter');
  await browser.close();
  ({ browser, page: p, errors } = await open({ reduced: true, init: () => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('drosieConference.v1', '{not json'); } } }));
  ok((await p.locator('#chTitle').innerText()) === 'The Conference Invitation' && errors.length === 0, 'corrupt saved data: app starts fresh without errors ' + errors.join('|'));
  await browser.close();
  ({ browser, page: p, errors } = await open({ reduced: true, init: () => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('drosieConference.v1', JSON.stringify({ v: 1, nick: 'Old', mode: 'guided', abs: { bg: 5 }, poster: null, a: null })); } } }));
  ok((await p.locator('#chTitle').count()) === 1 && errors.length === 0, 'structurally wrong saved data does not crash the app ' + errors.join('|'));
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.context().addInitScript(() => { Storage.prototype.setItem = function () { throw new Error('blocked'); }; Storage.prototype.getItem = function () { throw new Error('blocked'); }; });
  await p.goto(URL); await p.fill('#nick', 'Zed'); await p.waitForTimeout(400);
  ok((await p.locator('#saveNote').innerText()).includes('Not saving'), 'blocked storage: learner is told work is not being saved');
  ok((await p.locator('.badge .nm').innerText()) === 'Zed' && errors.filter((e) => !/blocked/.test(e)).length === 0, 'blocked storage: the app still works in memory');
  await browser.close();

  console.log('robustness: mid-animation navigation, timers, large text');
  ({ browser, page: p, errors } = await open({ reduced: false }));
  await p.goto(URL + '#ch1'); await p.evaluate(SEED_ALL, 'A'); await p.evaluate(() => { DC.state.mode = 'independent'; DC.state.a.rec = { control: [null, null, null, null, null], cool: [null, null, null, null, null] }; ['temp', 'count', 'vial', 'nflies', 'tod', 'taps'].forEach((k, i) => (DC.state.a.setup[k] = ['changed', 'measured', 'same', 'same', 'same', 'same'][i])); DC.saveNow(); });
  await p.goto(URL + '#ch3'); await p.reload();
  await p.locator('#fast').check(); await p.locator('#startBtn').click(); await p.waitForTimeout(300);
  await p.evaluate(() => DC.go(5)); await p.waitForTimeout(1800);
  ok(errors.length === 0 && (await p.locator('#chTitle').innerText()) === 'The Abstract Studio', 'leaving the lab mid-trial: no errors, stays on the new chapter');
  await p.evaluate(() => DC.go(3)); await p.locator('#startBtn').click(); await p.locator('[data-act=c3trial][data-i="2"]').click();
  ok((await p.locator('#cnt').count()) === 0 && (await p.locator('#startBtn').innerText()).startsWith('Tap'), 'switching trial mid-animation cancels cleanly');
  await p.goto(URL + '#ch9'); await p.reload(); await p.locator('#pracBtn').click(); await p.evaluate(() => DC.go(2)); await p.waitForTimeout(2300);
  ok(errors.length === 0, 'leaving chapter 9 while the timer runs: timer stops, no errors ' + errors.join('|'));
  await p.evaluate((S) => { }, 0);
  for (const n of [3, 4, 6, 8, 9]) { await p.evaluate(() => { DC.state.settings.large = true; DC.applySettings(); }); await p.setViewportSize({ width: 320, height: 800 }); await p.goto(URL + '#ch' + n); await p.reload(); ok((await overflow(p)) <= 0, 'larger-text setting at 320px: no horizontal overflow on chapter ' + n); }
  await browser.close();

  console.log('security: XSS payloads in every free-text field');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  const ctx = p.context(); ctx.on('page', (pg) => pg.on('dialog', (d) => d.dismiss()));
  p.on('dialog', async (d) => { await p.evaluate(() => (window.__xss = 'dialog')); await d.dismiss(); });
  await p.goto(URL + '#ch1');
  await p.evaluate(SEED_ALL, 'B');
  await p.evaluate(() => {
    const X = '"><img src=x onerror="window.__xss=1"><svg onload="window.__xss=2"><script>window.__xss=3</script>'; const S = DC.state;
    S.nick = X; S.b.f.title = X; S.b.f.question = X; S.b.f.background = X; S.b.f.methods = X; S.b.f.results = X; S.b.f.limitations = X; S.b.steps = [X]; S.b.vars.changed = X; S.b.log = [{ label: X, group: X, value: '5', note: X }, { label: X + '2', group: X, value: '6', note: X }]; S.b.chart = { kind: 'compare', yTitle: X, xTitle: X, unit: X }; S.b.claims = [{ text: X, kind: 'obs', evidence: X }];
    Object.keys(S.abs).forEach((k) => (S.abs[k] = X + ' words words words words words')); Object.keys(S.poster.f).forEach((k) => (S.poster.f[k] = X)); S.poster.figCaption = X; Object.keys(S.refl).forEach((k) => (S.refl[k] = X)); S.prac.explain = X; S.prac.qa = { q1: X, q2: X, q3: X }; S.revs = [{ note: X, changed: true }]; S.fin.claimed = true; DC.saveNow();
  });
  for (let n = 1; n <= 10; n++) { await p.goto(URL + '#ch' + n); await p.evaluate(() => { DC.state.mode = 'independent'; DC.saveNow(); }); await p.reload(); if (n === 8) { for (const a of ['reg', 'posters', 'talk', 'reflect']) await p.locator('.areabtn[data-a=' + a + ']').click(); } await p.waitForTimeout(60); }
  const inj = await p.evaluate(() => ({ x: window.__xss, imgs: document.querySelectorAll('img[src="x"]').length, svgs: document.querySelectorAll('svg[onload]').length, scripts: [...document.querySelectorAll('script')].filter((s) => /__xss/.test(s.textContent)).length }));
  ok(inj.x === undefined && inj.imgs === 0 && inj.svgs === 0 && inj.scripts === 0, 'no payload executed or injected into any chapter (' + JSON.stringify(inj) + ')');
  const html = await p.evaluate(() => { window.print = () => {}; document.querySelector('[data-act=finPrintCert]') && 0; return DC.portfolioHTML() + DC.certHTML() + DC.posterHTML() + DC.abstractHTML() + DC.reflectionHTML(); });
  ok(!/<img src=x|<svg onload|<script>window/.test(html) && html.includes('&lt;img'), 'portfolio, certificate, poster, abstract and reflection HTML escape all learner text');
  fs.writeFileSync(OUT + 'xss-portfolio.html', await p.evaluate(() => DC.portfolioHTML()));
  const pp = await p.context().newPage(); await pp.goto('file://' + OUT + 'xss-portfolio.html'); await pp.waitForTimeout(200);
  ok((await pp.evaluate(() => window.__xss)) === undefined && (await pp.locator('img[src="x"]').count()) === 0, 'opening the downloaded portfolio executes nothing');
  ok(errors.filter((e) => !/Failed to load resource/.test(e)).length === 0, 'no unexpected console errors ' + errors.join('|'));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
