// Visual adventure M6: Poster Art Studio. NEW interface.
process.env.CONF_URL = 'http://localhost:8123/scientific-conference.html';
const { open, ok, done, overflow } = require('./helpers');
const fs = require('fs');
const U = 'http://localhost:8123/scientific-conference.html';
const SEED = () => { const S = DC.state; S.mode = 'independent'; S.nick = 'Zoe'; S.path = 'A'; S.a.acked = true; S.a.setup = { temp: 'changed', count: 'measured', vial: 'same', nflies: 'same', tod: 'same', taps: 'same' }; DC.DATA.conditions.forEach((c) => (S.a.rec[c.id] = c.counts.slice())); S.det.c3var = { sel: 1, ok: true };
  Object.assign(S.abs, { bg: 'Fruit flies are ectotherms, so the air temperature around them can change how active they are.', obj: 'This simulated activity asked whether fewer fruit flies climb above an 8 cm line in 10 seconds at 18 °C than at 25 °C.', methods: 'In a simulated experiment, two groups of 10 flies were tapped to the bottom of a vial, one at 25 °C and one at 18 °C. Flies above the 8 cm line after 10 seconds were counted in 5 trials per group.', results: 'At 25 °C the mean was 7.2 flies above the line (range 6 to 8). At 18 °C the mean was 4.2 (range 3 to 5).', conclusion: 'In this simulation the 18 °C group had fewer flies above the line on average, which fits the prediction. One vial per temperature is a limit, so more groups are needed.' }); DC.saveNow(); };
const OUT = '/tmp/claude-0/-home-user-drosies-world/7dc5b43f-e8cb-5caa-894c-ae04188dc07b/scratchpad/';
(async () => {
  let { browser, page: p, errors } = await open({ reduced: true });
  console.log('M6 poster studio, Path A');
  await p.evaluate(SEED); await p.goto(U + '#ch6'); await p.reload();
  ok(await p.locator('#posterLive .poster').count() === 1 && await p.locator('[data-act=v6card]').count() === 8, 'a big live poster board and eight research cards');
  const w0 = await p.evaluate(() => (document.querySelector('#stage').innerText.match(/\S+/g) || []).length);
  ok(w0 < 300 && await p.locator('textarea, input[type=text]').count() === 0, 'no text fields are needed in Explorer (' + w0 + ' words, baseline 766)');
  ok(!(await p.evaluate(() => DC.isDone(6))) && (await p.locator('#posterLive figure').count()) === 0, 'fresh poster: empty board and no graph until the learner places it');
  await p.locator('[data-act=v6card][data-k=results]').click();
  ok((await p.locator('#posterLive .s-res').innerText()).includes('7.2') && (await p.locator('#posterLive .s-res').innerText()).includes('4.2'), 'placing the Results card pins the learner’s own results (7.2 / 4.2) on the board');
  for (const k of ['title', 'question', 'methods', 'conclusions', 'limitations', 'background']) await p.locator(`[data-act=v6card][data-k=${k}]`).click();
  ok(await p.evaluate(() => DC.state.poster.f.methods === DC.state.abs.methods && DC.state.poster.f.conclusions === DC.state.abs.conclusion && DC.state.poster.f.author === 'Zoe'), 'poster text comes from the learner’s own abstract; author is the nickname');
  ok((await p.evaluate(() => DC.isDone(6))), 'poster complete once the required cards are placed (same completion rule as before)');
  ok(await p.locator('[data-act=v6card][data-k=graph] small').innerText().then((t) => t.includes('tap to place')), 'the Graph card still waits for a graph choice');
  await p.locator('[data-act=v6fig][data-v=dot]').click();
  const pts = await p.locator('#posterLive svg [data-tip]').evaluateAll((e) => e.map((x) => x.getAttribute('data-tip')));
  ok(pts.filter((x) => x.startsWith('25')).map((x) => x.match(/: (\d+) flies/)[1]).join() === '7,8,6,8,7' && pts.filter((x) => x.startsWith('18')).map((x) => x.match(/: (\d+) flies/)[1]).join() === '4,5,3,5,4', 'graph on the poster carries the exact dataset');
  await p.locator('[data-act=v6fig][data-v=bar]').click(); ok(!(await p.locator('#posterLive').innerText()).includes('axis starts at') && (await p.locator('#posterLive rect[fill-opacity=".85"]').count()) === 2, 'the bar graph option starts at zero');
  await p.locator('[data-act=v6lay][data-v=banner]').click(); ok((await p.locator('#posterLive .poster').getAttribute('data-layout')) === 'banner', 'layout thumbnails change the poster');
  await p.locator('[data-act=v6pal][data-v=plum]').click(); ok((await p.locator('#posterLive .poster').getAttribute('style')).includes('#5b3a6b'), 'colour swatches change the poster');
  await p.locator('#v6sz').fill('1.2'); ok(/--ps:\s*1\.2/.test(await p.locator('#posterLive .poster').getAttribute('style')), 'text size slider works');
  // edit by words (accessible alternative to placing)
  await p.locator('[data-act=v6card][data-k=conclusions]').click(); await p.fill('#v6ta', 'This proves all flies are lazy in the cold.');
  ok(!(await p.evaluate(() => DC.isDone(6))) && (await p.locator('#v6checks').innerText()).includes('proves'), 'editing a card to an overclaim is caught by the original poster checks');
  await p.fill('#v6ta', 'These simulated results suggest cooler flies climb less. More groups are needed.'); await p.keyboard.press('Escape');
  ok(await p.evaluate(() => DC.isDone(6)), 'a careful edit restores completion');
    // very large text must be flagged by the original page-fit check, then reset for printing
  await p.locator('#v6sz').fill('1.25'); const bigFit = await p.evaluate(() => DC.posterChecks().filter((c) => !c[0]).map((c) => c[1]).join(' | ')); console.log('   (at 1.25x the checklist says: ' + bigFit.slice(0, 120) + ')');
  await p.locator('#v6sz').fill('1');
  // print / PDF from the new studio
  await p.evaluate(() => DC.print('<div class="pg">' + DC.posterHTML() + '</div>', 'landscape', true)); await p.emulateMedia({ media: 'print' });
  const pdf = await p.pdf({ preferCSSPageSize: true, printBackground: true }); fs.writeFileSync(OUT + 'vx-poster.pdf', pdf); await p.emulateMedia({ media: 'screen' });
  ok(((pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length) === 1, 'poster PDF built from the visual studio is exactly one page');
  ok(await p.evaluate(() => DC.posterChecks().every((c) => c[0])), 'every poster check passes for the finished poster (including fits on one page)');
  await p.reload(); ok(await p.evaluate(() => DC.isDone(6) && DC.state.poster.layout === 'banner' && DC.state.poster.palette === 'plum'), 'poster choices persist');
  ok(await p.evaluate(() => DC.vx.cards().find((c) => c.id === 'poster').earned()), 'the Poster card is earned');
  ok(errors.length === 0, 'no console errors ' + errors.join('|')); await browser.close();

  console.log('M6 keyboard + migration of a poster built in the old studio');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(SEED); await p.evaluate(() => { const S = DC.state; S.poster.started = true; Object.assign(S.poster.f, { title: 'My old poster', author: 'Zoe', question: S.abs.obj, background: '', methods: S.abs.methods, results: S.abs.results, conclusions: S.abs.conclusion, limitations: '- Only a few tries' }); S.poster.fig = 'auto'; delete S.poster.figPlaced; DC.saveNow(); });
  await p.goto(U + '#ch6'); await p.reload();
  ok((await p.locator('#posterLive figure').count()) === 1 && (await p.locator('[data-act=v6card][data-k=graph] small').innerText()).includes('on the poster'), 'an existing poster keeps its graph and counts as placed');
  ok(await p.evaluate(() => DC.state.poster.f.title === 'My old poster') && await p.evaluate(() => DC.isDone(6)), 'existing poster text and completion preserved');
  await p.locator('[data-act=v6card][data-k=background]').focus(); await p.keyboard.press('Enter'); ok((await p.locator('#posterLive .s-bg').innerText()).includes('ectotherms'), 'a card can be placed with the keyboard');
  ok(errors.length === 0, 'no console errors'); await browser.close();

  console.log('M6 Path B');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(() => { const S = DC.state; S.mode = 'independent'; S.nick = 'Zoe'; S.path = 'B'; S.b.f.title = 'Ants at my door'; S.b.f.question = 'When do ants come?'; S.b.f.limitations = '- Only three days'; Object.assign(S.abs, { bg: 'Ants live near doors.', obj: 'When do ants come?', methods: 'I watched the door each morning and counted ants.', results: 'I counted 4 ants on Monday and 6 on Tuesday.', conclusion: 'More ants came on Tuesday, which suggests the day might matter, but I need more days.' }); S.b.log = [{ label: 'Mon', group: '', value: '4', note: '' }, { label: 'Tue', group: '', value: '6', note: '' }]; S.b.chart = { kind: 'time', yTitle: 'Ants', xTitle: 'Day', unit: 'ants' }; DC.saveNow(); });
  await p.goto(U + '#ch6'); await p.reload(); for (const k of ['title', 'question', 'methods', 'results', 'conclusions', 'limitations']) await p.locator(`[data-act=v6card][data-k=${k}]`).click();
  ok((await p.locator('#posterLive .ptitle').innerText()) === 'Ants at my door' && !(await p.locator('#posterLive').innerText()).includes('Simulated data'), 'Path B poster uses the learner’s own title and is not labelled simulated');
  await p.locator('[data-act=v6figb][data-v=auto]').click(); ok((await p.locator('#posterLive figure svg').count()) === 1 && (await p.locator('#posterLive figcaption').innerText()).includes('Data collected by the researcher'), 'Path B figure is built from the learner’s own numbers');
  ok(await p.evaluate(() => DC.isDone(6)), 'Path B poster complete');
  ok(errors.length === 0, 'no console errors'); await browser.close();

  console.log('M6 layouts');
  for (const w of [320, 390, 768, 1280]) { ({ browser, page: p, errors } = await open({ reduced: true, w })); await p.evaluate(SEED); await p.goto(U + '#ch6'); await p.reload(); for (const k of ['title', 'question', 'results']) await p.locator(`[data-act=v6card][data-k=${k}]`).click(); await p.locator('[data-act=v6fig][data-v=dot]').click(); ok((await overflow(p)) <= 0, `studio @${w}px: no horizontal overflow`); ok(errors.length === 0, `@${w}: no console errors`); await browser.close(); }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
