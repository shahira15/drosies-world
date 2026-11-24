const { open, ok, done, overflow } = require('./helpers');
const fs = require('fs');
const SEED = () => { DC.state.mode = 'independent'; DC.state.nick = 'Zoe'; DC.state.path = 'A'; DC.state.a.acked = true; DC.DATA.conditions.forEach((c) => (DC.state.a.rec[c.id] = c.counts.slice()));
  Object.assign(DC.state.abs, { bg: 'Fruit flies are ectotherms, so air temperature can change how active they are.', obj: 'This simulated activity asked whether fewer flies climb above an 8 cm line at 18 °C than at 25 °C.', methods: 'In a simulated experiment, two groups of 10 flies were tapped to the bottom of a vial and counted after 10 seconds in 5 trials.', results: 'At 25 °C the mean was 7.2 flies above the line (range 6 to 8). At 18 °C the mean was 4.2 (range 3 to 5).', conclusion: 'In this simulation the 18 °C group had fewer flies above the line, which fits the prediction. One vial per temperature is a limit, so more groups are needed.' }); DC.saveNow(); };
(async () => {
  let { browser, page, errors } = await open({});
  console.log('M6 poster');
  await page.evaluate(SEED); await page.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch6'); await page.reload();
  ok(!(await page.evaluate(() => DC.isDone(6))), 'poster incomplete before starting');
  await page.locator('[data-act=postStart]').click();
  ok((await page.inputValue('#pf-title')).includes('fruit flies') && (await page.inputValue('#pf-author')) === 'Zoe', 'start fills title and nickname');
  ok((await page.inputValue('#pf-results')).includes('7.2'), 'results come from the abstract (recorded numbers)');
  ok((await page.inputValue('#pf-refs')).includes('Gargano') && (await page.inputValue('#pf-refs')).includes('Nichols'), 'verified references inserted for path A');
  const pts = await page.locator('#posterLive .poster svg [data-tip]').evaluateAll((e) => e.map((x) => x.getAttribute('data-tip')));
  ok(pts.length === 10, 'poster figure has 10 data markers (' + pts.length + ')');
  ok(pts.filter((p) => p.startsWith('25')).map((p) => p.match(/: (\d+) flies/)[1]).join() === '7,8,6,8,7' && pts.filter((p) => p.startsWith('18')).map((p) => p.match(/: (\d+) flies/)[1]).join() === '4,5,3,5,4', 'poster figure values equal the recorded dataset');
  ok((await page.locator('#posterLive figcaption').innerText()).includes('Simulated data'), 'caption says simulated');
  ok((await page.locator('#posterLive .poster').innerText()).includes('has not been peer reviewed'), 'poster footer says not peer reviewed');
  ok(await page.evaluate(() => DC.isDone(6)), 'poster complete when required parts written');
  // layouts
  for (const l of ['story', 'banner', 'columns']) { await page.locator(`input[name=lay][value=${l}]`).check({ force: true }); ok((await page.locator('#posterLive .poster').getAttribute('data-layout')) === l, 'layout ' + l); }
  // palettes
  await page.locator('input[name=pal][value=mono]').check({ force: true });
  ok((await page.locator('#posterChecks').innerText()).includes('21.0:1'), 'high-contrast palette shows computed 21:1 ratio');
  await page.locator('input[name=pal][value=teal]').check({ force: true });
  // bar view is zero-based
  await page.selectOption('#pfv', 'bar');
  ok(!(await page.locator('#posterLive').innerText()).includes('axis starts at'), 'poster bars start at zero');
  await page.selectOption('#pfv', 'dot');
  // overclaim blocks
  await page.fill('#pf-conclusions', 'This proves all flies like warm rooms.');
  ok(!(await page.evaluate(() => DC.isDone(6))), 'overclaiming conclusion blocks completion');
  ok((await page.locator('#posterChecks').innerText()).includes('proves'), 'overclaim flagged in checklist');
  await page.fill('#pf-conclusions', 'These simulated results suggest cooler flies climb less. More groups are needed.');
  // PII
  await page.fill('#pf-ack', 'Thanks to mom, call 5551234567');
  ok(!(await page.evaluate(() => DC.isDone(6))), 'phone number in thanks blocks completion');
  await page.fill('#pf-ack', 'Thanks to my teacher.');
  ok(await page.evaluate(() => DC.isDone(6)), 'complete again after fix');
  // overfull poster is detected
  await page.fill('#pf-background', Array(120).fill('word').join(' '));
  const chk = await page.locator('#posterChecks').innerText();
  ok(chk.includes('Too many words') && chk.includes('taller than one landscape page'), 'overlong text flagged and page-fit check fails honestly');
  await page.fill('#pf-background', 'Fruit flies are ectotherms.');
  ok((await page.locator('#posterChecks').innerText()).includes('fits on one landscape page'), 'normal poster fits one page');
  // B path: no data -> no figure invented
  // full-size preview dialog
  await page.locator('[data-act=postFull]').click();
  ok(await page.locator('#dlg[open] .poster').count() === 1, 'full-size preview dialog opens');
  await page.keyboard.press('Escape');
  // PDF
  await page.evaluate(() => DC.print('<div class="pg">' + DC.posterHTML() + '</div>', 'landscape', true));
  await page.emulateMedia({ media: 'print' });
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  fs.writeFileSync('/tmp/claude-0/-home-user-drosies-world/7dc5b43f-e8cb-5caa-894c-ae04188dc07b/scratchpad/poster.pdf', pdf);
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  ok(pdf.length > 5000 && pages === 1, 'poster PDF generated, 1 page (' + pages + ' page, ' + pdf.length + ' bytes)');
  const vis = await page.evaluate(() => ({ app: getComputedStyle(document.querySelector('#stage')).display, root: getComputedStyle(document.querySelector('#printRoot')).display }));
  ok(vis.app === 'none' && vis.root === 'block', 'print media hides the app and shows only the print sheet');
  await page.emulateMedia({ media: 'screen' });
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 800 }); ok((await overflow(page)) <= 0, `no page overflow ${w}px (ch6)`); }
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  ({ browser, page, errors } = await open({}));
  console.log('M6 path B');
  await page.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'Zoe'; DC.state.path = 'B'; DC.state.b.f.title = 'Ants at my door'; DC.state.b.f.question = 'When do ants come?'; DC.saveNow(); });
  await page.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch6'); await page.reload();
  await page.locator('[data-act=postStart]').click();
  ok(await page.locator('#posterLive figure').count() === 0, 'B without numeric data: no figure is invented');
  ok((await page.inputValue('#pf-refs')) === '', 'B: no references inserted for learner');
  await page.locator('input[name=fig][value=draw]').check({ force: true });
  ok(await page.locator('#posterLive .figbox').count() === 1, 'B: drawing frame offered');
  await page.evaluate(() => { DC.state.b.log = [{ label: 'Mon', group: '', value: '4', note: '' }, { label: 'Tue', group: '', value: '6', note: '' }]; DC.state.b.chart = { kind: 'time', yTitle: 'Ants', xTitle: 'Day', unit: 'ants' }; DC.saveNow(); });
  await page.reload(); await page.locator('input[name=fig][value=auto]').check({ force: true });
  ok(await page.locator('#posterLive figure svg').count() === 1 && (await page.locator('#posterLive figcaption').innerText()).includes('Data collected by the researcher'), 'B with data: figure and honest caption');
  ok(errors.length === 0, 'no console errors (B) ' + errors.join('|'));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
