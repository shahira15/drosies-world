const { open, ok, done, overflow } = require('./helpers');
const SEED = (path) => { DC.state.mode = 'independent'; DC.state.nick = 'Zoe'; DC.state.path = path; DC.state.a.acked = true; DC.DATA.conditions.forEach((c) => (DC.state.a.rec[c.id] = c.counts.slice()));
  Object.assign(DC.state.abs, { bg: 'Fruit flies are ectotherms.', obj: 'This simulated activity asked whether fewer flies climb above an 8 cm line at 18 °C than at 25 °C.', methods: 'Two groups of 10 simulated flies were tapped and counted after 10 seconds in 5 trials.', results: 'At 25 °C the mean was 7.2 flies above the line. At 18 °C the mean was 4.2.', conclusion: 'In this simulation the 18 °C group had fewer flies above the line, which fits the prediction. One vial per temperature is a limit.' });
  DC.state.b.f.title = 'Ants'; DC.state.b.f.question = 'When do ants come?'; DC.saveNow(); };
const seed = (page, p) => page.evaluate(SEED, p);
(async () => {
  let { browser, page, errors } = await open({});
  console.log('M8 present/discuss/revise (path A)');
  await seed(page, 'A'); await page.goto('http://localhost:8123/scientific-conference.html#ch9'); await page.reload();
  ok((await page.locator('#pracBox').innerText()).includes('7.2 flies'), 'practice cards show the learner’s own abstract text');
  ok((await page.locator('#pracBox').innerText()).includes('No microphone or camera'), 'states no mic/camera');
  ok(!(await page.evaluate(() => DC.isDone(9))), 'ch9 incomplete at start');
  // real timer ticks
  await page.locator('#pracBtn').click(); await page.waitForTimeout(2300);
  const t = parseInt(await page.locator('#pracTimer').innerText(), 10);
  ok(t <= 58 && t >= 56, 'timer counts down in real time (' + t + ' s)');
  await page.locator('#pracBtn').click(); // pause
  ok(await page.locator('#pracBtn').innerText() === 'Resume', 'pause/resume works');
  await page.locator('[data-act=pracReset]').click();
  for (let i = 0; i < 6; i++) await page.locator('[data-act=pracStep]').click();
  ok(await page.evaluate(() => DC.state.prac.timerDone), 'practice marked done after the 60 seconds are run through');
  // explain challenge
  await page.fill('#explain', 'Cold proves that all flies are lazy.');
  await page.locator('[data-act=explCheck]').click();
  const f1 = await page.locator('#explFb').innerText();
  ok(f1.includes('claim more than your data') && !(await page.evaluate(() => DC.state.prac.explainOk)), 'overclaiming explanation is not praised');
  await page.fill('#explain', 'We tapped 10 flies in a warm room and 10 in a cool room. In the warm room about 7 flies climbed past the line, but in the cool room about 4 did. That suggests cool air makes flies climb less.');
  await page.locator('[data-act=explCheck]').click();
  ok(await page.evaluate(() => DC.state.prac.explainOk), 'good plain-language explanation passes: ' + (await page.locator('#explFb').innerText()).replace(/\s+/g, ' ').slice(0, 160));
  await page.fill('#explain', 'We tapped 10 flies in a warm room and 10 in a cool room. In the warm room about 7 flies climbed past the line, but in the cool room about 4 did. That suggests cool air makes flies climb less. Also 99 flies.');
  ok(!(await page.evaluate(() => DC.state.prac.explainOk)), 'editing the explanation clears the pass until it is re-checked');
  await page.locator('[data-act=explCheck]').click();
  ok((await page.locator('#explFb').innerText()).includes('"99"'), 'invented number flagged in explanation');
  await page.fill('#explain', 'We tapped 10 flies in a warm room and 10 in a cool room. In the warm room about 7 flies climbed past the line, but in the cool room about 4 did. That suggests cool air makes flies climb less.');
  await page.locator('[data-act=explCheck]').click();
  // audience Qs
  await page.locator('[data-act=qaCheck][data-id=q1]').click();
  ok((await page.locator('#qafb-q1').innerText()).includes('at least a sentence'), 'empty answer asks for more');
  await page.locator('[data-act=qaStarter][data-id=q1]').nth(1).click();
  ok((await page.inputValue('#qa-q1')).startsWith('My data cannot answer that'), '"My data cannot answer that" starter inserted');
  await page.fill('#qa-q1', 'It proves that cold flies always climb less.');
  await page.locator('[data-act=qaCheck][data-id=q1]').click();
  ok((await page.locator('#qafb-q1').innerText()).includes('Check:') && !(await page.evaluate(() => DC.state.prac.qaDone.q1)), 'overclaiming audience answer is not accepted');
  await page.fill('#qa-q1', 'My data show more flies above the line at 25 °C on average, but they cannot tell us what all flies do, because I only used 10 flies in one vial.');
  await page.locator('[data-act=qaCheck][data-id=q1]').click();
  ok(await page.evaluate(() => DC.state.prac.qaDone.q1), 'good answer accepted (q1)');
  await page.fill('#qa-q2', 'I am fairly sure but not completely sure, because I only had one vial for each temperature, so I would need more groups.');
  await page.locator('[data-act=qaCheck][data-id=q2]').click();
  ok(await page.evaluate(() => DC.state.prac.qaDone.q2), 'good answer accepted (q2)');
  await page.fill('#qa-q3', 'That would require another experiment: I would test several new groups of flies at both temperatures to see if the pattern holds.');
  await page.locator('[data-act=qaCheck][data-id=q3]').click();
  ok((await page.locator('#qafb-q3').innerText()).includes('real scientist'), '"I don’t know yet"-style honesty is explicitly affirmed');
  ok(await page.evaluate(() => DC.state.prac.qaDone.q3), 'good answer accepted (q3)');
  await page.fill('#qa-q3', 'That would require another experiment: I would test several new groups of flies at both temperatures to see if the pattern holds. Plus.');
  ok(!(await page.evaluate(() => DC.state.prac.qaDone.q3)), 'editing an answer clears its pass until re-checked');
  await page.locator('[data-act=qaCheck][data-id=q3]').click();
  // revision
  ok((await page.locator('#reviseBox').innerText()).includes('Open Chapter'), 'revision panel links to what to improve (or shows ok)') ;
  await page.fill('#revNote', 'Too short');
  await page.locator('[data-act=revAdd]').click();
  ok((await page.locator('#revMsg').innerText()).includes('at least a sentence') && (await page.evaluate(() => DC.state.revs.length)) === 0, 'short revision note rejected');
  ok((await page.locator('#reviseBox').innerText()).includes('You have not changed'), 'honestly reports that nothing has changed yet');
  await page.evaluate(() => { DC.state.abs.conclusion += ' More groups are needed.'; DC.saveNow(); });
  await page.fill('#revNote', 'I added a sentence saying more groups are needed because one vial per temperature is a limit.');
  await page.locator('[data-act=revAdd]').click();
  ok(await page.evaluate(() => DC.state.revs.length === 1 && DC.state.revs[0].changed === true), 'revision logged and detected as a real text change');
  ok(!(await page.evaluate(() => DC.isDone(9))), 'not complete without reflection');
  await page.fill('#r9-learned', 'Scientists share, listen and then improve their work.');
  ok(await page.evaluate(() => DC.isDone(9)), 'chapter 9 complete');
  await page.reload(); ok(await page.evaluate(() => DC.isDone(9)), 'completion persists');
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 800 }); ok((await overflow(page)) <= 0, `no overflow ${w}px (ch9)`); }
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  ({ browser, page, errors } = await open({ reduced: true }));
  console.log('M8 path B');
  await seed(page, 'B'); await page.goto('http://localhost:8123/scientific-conference.html#ch9'); await page.reload();
  await page.fill('#explain', 'I watched my door and counted ants each morning. On Tuesday I saw more ants than on Monday. That might mean they like some days better.');
  await page.locator('[data-act=explCheck]').click();
  ok(await page.evaluate(() => DC.state.prac.explainOk), 'B: explanation without simulated numbers is accepted');
  ok(errors.length === 0, 'no console errors (B) ' + errors.join('|'));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
