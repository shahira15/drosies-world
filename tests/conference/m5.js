const { open, ok, done, overflow } = require('./helpers');
const SEED_A = () => { DC.state.mode = 'independent'; DC.state.nick = 'Zoe'; DC.state.path = 'A'; DC.state.a.acked = true; DC.DATA.conditions.forEach((c) => (DC.state.a.rec[c.id] = c.counts.slice())); DC.saveNow(); };
(async () => {
  let { browser, page, errors } = await open({});
  console.log('M5 path A');
  await page.evaluate(SEED_A); await page.goto('http://localhost:8123/scientific-conference.html#ch5'); await page.reload();
  ok((await page.locator('#absFb').innerText()).includes('is empty'), 'empty abstract: feedback lists missing parts');
  await page.locator('[data-act=absDraft]').click();
  const res = await page.inputValue('#ab-results');
  ok(res.includes('7.2') && res.includes('4.2') && res.includes('6 to 8') && res.includes('3 to 5'), 'drafted results use the recorded numbers: ' + res);
  ok((await page.inputValue('#ab-conclusion')) === '', 'conclusion is NOT auto-written');
  ok(!(await page.evaluate(() => DC.absComplete())), 'incomplete without a conclusion');
  // starter chip
  await page.locator('[data-act=absStarter][data-k=conclusion]').first().click();
  ok((await page.inputValue('#ab-conclusion')).startsWith('These results suggest'), 'sentence starter inserted');
  ok((await page.locator('#wc-conclusion').innerText()) === '3 words', 'per-section word counter');
  // overclaim + fabricated number
  await page.fill('#ab-conclusion', 'This proves all fruit flies climb less in the cold.');
  ok((await page.locator('#absFb').innerText()).includes('proves'), 'overclaim flagged');
  await page.fill('#ab-results', 'At 25 °C the mean was 7.5 flies above the line. At 18 °C the mean was 4.2.');
  ok((await page.locator('#absFb').innerText()).includes('"7.5"'), 'number not in data is flagged');
  await page.fill('#ab-results', 'At 25 °C the mean was 7.2 flies, so cold made them tired. At 18 °C the mean was 4.2.');
  ok((await page.locator('#absFb').innerText()).includes('describe what was measured'), 'explanations in results flagged');
  await page.fill('#ab-results', res);
  const keepObj = await page.inputValue('#ab-obj'), keepMeth = await page.inputValue('#ab-methods');
  await page.fill('#ab-obj', 'I asked whether fewer flies climb above a line in cooler air.'); await page.fill('#ab-methods', 'Two groups of 10 flies were tapped in a vial and counted after 10 seconds in 5 trials.');
  ok((await page.locator('#absFb').innerText()).includes('simulated'), 'missing "simulated" flagged when no section says it');
  await page.fill('#ab-obj', keepObj); await page.fill('#ab-methods', keepMeth);
  await page.fill('#ab-conclusion', 'In this simulation the 18 °C group had fewer flies above the line, which fits the prediction. One vial per temperature is a limit, so more groups are needed.');
  const fb = await page.locator('#absFb').innerText();
  ok(!/Check:/.test(fb), 'no blocking problems after revision: ' + fb.replace(/\s+/g, ' '));
  ok(await page.evaluate(() => DC.absComplete()), 'abstract complete');
  const prev = await page.locator('#absPrev').innerText();
  ok(prev.includes('Zoe') && prev.includes('Simulated data') && prev.includes('7.2'), 'live preview shows name, simulation notice and numbers');
  ok((await page.locator('#absWc').innerText()).includes('words'), 'overall word counter');
  // example is labeled as simulated
  ok((await page.locator('details summary').first().innerText()).includes('simulated example'), 'simulated example abstract offered');
  // persists
  await page.reload();
  ok(await page.evaluate(() => DC.absComplete()), 'abstract persists across reload');
  // print sheet
  const sheet = await page.evaluate(() => { DC.print(DC.abstractSheet(), 'portrait', true); return document.querySelector('#printRoot').innerText; });
  ok(sheet.includes('not been peer reviewed') && sheet.includes('simulated'), 'printable abstract carries simulation / not-peer-reviewed notice');
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 800 }); ok((await overflow(page)) <= 0, `no overflow ${w}px (ch5)`); }
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  ({ browser, page, errors } = await open({}));
  console.log('M5 path B');
  await page.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'Zoe'; DC.state.path = 'B'; DC.state.b.f.title = 'Ants'; DC.state.b.f.question = 'When do ants come?'; DC.state.b.f.background = 'Ants live in colonies.'; DC.state.b.log = [{ label: 'Mon', group: '', value: '4', note: '' }]; DC.saveNow(); });
  await page.goto('http://localhost:8123/scientific-conference.html#ch5'); await page.reload();
  await page.locator('[data-act=absDraft]').click();
  ok((await page.inputValue('#ab-obj')) === 'When do ants come?' && (await page.inputValue('#ab-bg')) === 'Ants live in colonies.', 'B draft copies learner’s own words only');
  ok((await page.inputValue('#ab-results')) === '', 'B results left empty (no invented results)');
  ok(!(await page.locator('details summary').first().innerText()).includes('simulated example'), 'B shows a fictional example instead');
  await page.fill('#ab-results', 'On Monday I counted 99 ants at the door.');
  ok((await page.locator('#absFb').innerText()).includes('"99"'), 'B: number not in own log flagged');
  await page.fill('#ab-results', 'On Monday I counted 4 ants at the door.');
  ok(!(await page.locator('#absFb').innerText()).includes('"4"'), 'B: number matching log accepted');
  ok(errors.length === 0, 'no console errors (B) ' + errors.join('|'));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
