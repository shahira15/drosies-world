// Keyboard-only interaction checks (no mouse clicks except where noted).
const { open, ok, done } = require('./helpers');
const { SEED_ALL } = require('./seed');
async function tabTo(page, sel, max = 80) { for (let i = 0; i < max; i++) { if (await page.evaluate((s) => document.activeElement && document.activeElement.matches(s), sel)) return true; await page.keyboard.press('Tab'); } return false; }
(async () => {
  const { browser, page, errors } = await open({ reduced: true });
  console.log('keyboard: chapter 1 and navigation');
  await page.keyboard.press('Tab');
  ok(await page.evaluate(() => document.activeElement.classList.contains('skip')), 'first Tab stop is the skip link');
  await page.keyboard.press('Enter');
  ok(await page.evaluate(() => document.activeElement.id) === 'stage', 'skip link moves focus to the conference');
  ok(await tabTo(page, '#nick'), 'nickname field reachable by Tab');
  await page.keyboard.type('Kai');
  ok(await tabTo(page, 'input[name=mode]'), 'participation radios reachable by Tab');
  await page.keyboard.press('Space');
  ok(await page.evaluate(() => DC.state.mode === 'guided' && DC.state.nick === 'Kai'), 'typing and Space set nickname and mode');
  const fo = await page.evaluate(() => { const e = document.activeElement.nextElementSibling; return getComputedStyle(document.activeElement).outlineStyle; });
  ok(await tabTo(page, '.nav-foot .btn.primary'), 'Next chapter reachable');
  const outline = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; });
  ok(outline, 'focused button shows a visible focus outline (>= 2px)');
  await page.keyboard.press('Enter');
  ok((await page.locator('#chTitle').innerText()) === 'Choose Your Research Path', 'Enter on Next opens chapter 2');
  ok(await page.evaluate(() => document.activeElement.id) === 'stage', 'focus moves to the new chapter');
  ok(await tabTo(page, '[data-act=pickPath][data-p=A]'), 'path buttons reachable'); await page.keyboard.press('Enter');
  ok(await page.evaluate(() => DC.state.path) === 'A', 'path chosen with the keyboard');
  // settings dialog
  await page.evaluate(() => window.scrollTo(0, 0)); await page.locator('#btnSettings').focus(); await page.keyboard.press('Enter');
  ok(await page.locator('#dlg[open]').count() === 1, 'Settings opens with Enter');
  ok(await page.evaluate(() => document.querySelector('#dlg').contains(document.activeElement)), 'focus is inside the dialog');
  await page.keyboard.press('Escape');
  ok(await page.locator('#dlg[open]').count() === 0 && await page.evaluate(() => document.activeElement.id) === 'btnSettings', 'Escape closes it and returns focus to Settings');
  await browser.close();

  console.log('keyboard: lab, graph, hall, ordering');
  const b2 = await open({ reduced: true }); const p2 = b2.page;
  await p2.evaluate(SEED_ALL, 'A'); await p2.evaluate(() => { DC.state.a.rec = { control: [null, null, null, null, null], cool: [null, null, null, null, null] }; DC.state.a.setup = {}; DC.saveNow(); });
  await p2.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch3'); await p2.reload();
  ok(await tabTo(p2, '#su-temp'), 'setup menus reachable'); await p2.keyboard.press('ArrowDown'); // choose via keyboard
  ok((await p2.evaluate(() => DC.state.a.setup.temp)) === 'changed', 'select option chosen with ArrowDown');
  const ans = ['changed', 'measured', 'same', 'same', 'same', 'same'];
  await p2.evaluate((a) => { ['temp', 'count', 'vial', 'nflies', 'tod', 'taps'].forEach((k, i) => (DC.state.a.setup[k] = a[i])); DC.saveNow(); }, ans); await p2.reload();
  ok(await tabTo(p2, '#startBtn'), 'Start button reachable'); await p2.keyboard.press('Enter');
  ok(await tabTo(p2, '#cnt'), 'count field reachable after the trial'); await p2.keyboard.type('7'); await p2.keyboard.press('Tab'); await p2.keyboard.press('Enter');
  ok(await p2.evaluate(() => DC.state.a.rec.control[0] === 7), 'a trial was run, counted and recorded with the keyboard only');
  // graph focus
  await p2.evaluate(() => { DC.DATA.conditions.forEach((c) => (DC.state.a.rec[c.id] = c.counts.slice())); DC.saveNow(); });
  await p2.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch4'); await p2.reload();
  let reached = 0; for (let i = 0; i < 120 && reached < 10; i++) { await p2.keyboard.press('Tab'); if (await p2.evaluate(() => document.activeElement.classList.contains('chart-pt'))) { reached++; } }
  ok(reached === 10, 'all 10 graph points are keyboard reachable (' + reached + ')');
  ok((await p2.locator('#gOut').innerText()).includes('flies'), 'focus reads the value out in the readout');
  // hall
  await p2.evaluate((SEED) => 0, 0);
  await p2.evaluate(SEED_ALL, 'A'); await p2.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch8'); await p2.reload();
  await tabTo(p2, '.hot'); await p2.keyboard.press('Enter');
  ok(await p2.evaluate(() => Object.keys(DC.state.hall.visited).length) >= 1, 'hall hotspot activates with Enter');
  ok(await tabTo(p2, '.areabtn[data-a=talk]'), 'area list buttons reachable'); await p2.keyboard.press('Space');
  ok(await tabTo(p2, '.sci'), 'scientist cards reachable'); await p2.keyboard.press('Enter');
  ok(await tabTo(p2, '[data-act=sciAns]'), 'answer options reachable'); await p2.keyboard.press('Enter');
  ok(await p2.locator('#sciPanel .fb').count() === 1, 'answering a scientist works by keyboard');
  // ordering without drag
  await p2.evaluate(() => { DC.state.reg.order = ['why', 'hello', 'how', 'found', 'means', 'next']; DC.state.reg.orderOk = false; DC.saveNow(); });
  await p2.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch7'); await p2.reload();
  await tabTo(p2, '[data-act=ordMove][data-i="1"][data-d="-1"]'); await p2.keyboard.press('Enter');
  ok(await p2.evaluate(() => DC.state.reg.order[0] === 'hello'), 'reordering works with the keyboard (non-drag alternative)');
  ok(await p2.evaluate(() => document.activeElement.matches('[data-act=ordMove]')), 'focus stays on a move button after moving');
  ok(b2.errors.length === 0, 'no console errors ' + b2.errors.join('|'));
  await b2.browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
