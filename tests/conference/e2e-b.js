// End-to-end: a learner completes Path B (own research: an observation project) using only the UI. No data is supplied by the site.
const { open, ok, done, overflow } = require('./helpers');
const title = (p) => p.locator('#chTitle').innerText();
const next = async (p) => { const t0 = await title(p); await p.locator('.nav-foot .btn.primary').click(); await p.waitForFunction((t) => document.querySelector('#chTitle').innerText !== t, t0, { timeout: 3000 }).catch(() => console.log('   (next did not navigate from ' + t0 + ')')); };
async function bruteMcq(p, qsel) { const n = await p.locator(qsel + ' .opt').count(); for (let i = 0; i < n; i++) { await p.locator(qsel + ' .opt').nth(i).click(); if (await p.locator(qsel + ' .fb.ok').count()) return i; } return -1; }
(async () => {
  const { browser, page: p, errors } = await open({ reduced: true });
  console.log('e2e: path B (own observation project) from a blank browser');
  await p.locator('input[name=mode][value=guided]').check({ force: true }); await p.locator('#anon').check(); await next(p);
  ok(await title(p) === 'Choose Your Research Path', 'anonymous guided start -> ch2');
  await p.locator('[data-act=pickPath][data-p=B]').click();
  await p.locator('input[name=btype][value=observation]').check({ force: true });
  await p.fill('#bf-title', 'Ants at my back door'); await p.fill('#bf-question', 'At what time of day do ants walk along the path?');
  await p.fill('#bf-background', 'Ants live in colonies and look for food.'); await p.fill('#bf-methods', 'I watched the path for 5 minutes at 8am on three days and counted the ants.');
  await p.locator('[data-bind="b.skip.limitations"]').check();
  ok(!(await p.locator('#wrap-hypothesis').isVisible()), 'observation project needs no hypothesis'); await next(p);
  ok(await title(p) === 'The Research Investigation', 'ch2 -> ch3 (hypothesis skipped, most optional fields blank)');
  await p.fill('#st-0', 'Stand by the path at 8am'); await p.locator('[data-act=bAddLog]').click(); await p.locator('[data-act=bAddLog]').click();
  for (const [i, [l, v]] of [['Mon', '4'], ['Tue', '7'], ['Wed', '5']].entries()) { await p.fill(`#lg-${i}label`, l); await p.fill(`#lg-${i}value`, v); await p.fill(`#lg-${i}note`, 'ants counted'); }
  await p.fill('#bv-measured', 'Number of ants passing in 5 minutes');
  await p.locator('[data-bind="b.organizerSeen"]').check(); await next(p);
  ok(await title(p) === 'Become a Data Detective', 'ch3 -> ch4');
  await p.locator('input[name=bkind][value=time]').check({ force: true });
  await p.fill('#byt', 'Ants counted'); await p.fill('#bun', 'ants'); await p.fill('#bxt', 'Day');
  ok(await p.locator('#bBox .chart-pt').count() === 3, 'graph shows exactly my 3 entries');
  await p.fill('#cl-0t', 'More ants passed on Tuesday than on Monday'); await p.selectOption('#cl-0k', 'obs'); await p.fill('#cl-0e', 'Tue = 7 ants, Mon = 4 ants');
  ok((await bruteMcq(p, '[data-q=d_b_oi]')) >= 0 && (await bruteMcq(p, '[data-q=d_b_rep]')) >= 0, 'ch4 checks'); await next(p);
  ok(await title(p) === 'The Abstract Studio', 'ch4 -> ch5');
  await p.locator('[data-act=absDraft]').click();
  await p.fill('#ab-results', 'I counted 4 ants on Monday, 7 on Tuesday and 5 on Wednesday.');
  await p.fill('#ab-conclusion', 'More ants came on Tuesday, which suggests the day might matter, but I only watched three days so I need more days.');
  ok(await p.evaluate(() => DC.absComplete()), 'ch5 abstract complete: ' + (await p.locator('#absFb').innerText()).replace(/\s+/g, ' ').slice(0, 200)); await next(p);
  await p.locator('[data-act=postStart]').click(); await p.fill('#pf-limitations', '- Only three days\n- One place');
  ok(await p.evaluate(() => DC.isDone(6)), 'ch6 poster complete: ' + (await p.locator('#posterChecks').innerText()).replace(/\s+/g, ' ').slice(0, 250));
  ok(await p.locator('#posterLive figure svg').count() === 1 && !(await p.locator('#posterLive').innerText()).includes('Simulated data'), 'poster has my figure and no "simulated" label'); await next(p);
  await p.locator('[data-act=checkIn]').click();
  const ANS = ['hello', 'why', 'how', 'found', 'means', 'next'];
  for (let i = 0; i < 6; i++) for (let g = 0; g < 8; g++) { const o = await p.evaluate(() => DC.state.reg.order); const at = o.indexOf(ANS[i]); if (at <= i) break; await p.locator(`#ordBox [data-act=ordMove][data-i="${at}"][data-d="-1"]`).click(); }
  await p.locator('[data-act=ordCheck]').click(); await next(p);
  for (const a of ['reg', 'booth', 'posters', 'stage', 'talk', 'reflect']) await p.locator(`.areabtn[data-a=${a}]`).click();
  await p.locator('.areabtn[data-a=talk]').click();
  for (const s of ['quill', 'anand', 'okoro']) { await p.locator(`[data-act=sciPick][data-s=${s}]`).click(); for (let i = 0; i < 4; i++) { await p.locator(`[data-act=sciAns][data-i="${i}"]`).click(); if (await p.locator('#sciPanel .fb.ok').count()) break; } }
  ok(await p.evaluate(() => DC.isDone(8)), 'ch8 complete'); await next(p);
  for (let i = 0; i < 6; i++) await p.locator('[data-act=pracStep]').click();
  await p.fill('#explain', 'I watched my back door and counted ants. On Tuesday I saw more ants than on Monday. That might mean ants come more on some days.'); await p.locator('[data-act=explCheck]').click();
  await p.fill('#qa-q1', 'My counts show more ants on Tuesday, but they cannot tell us why, because I only watched three mornings.'); await p.locator('[data-act=qaCheck][data-id=q1]').click();
  await p.fill('#qa-q2', 'I am not completely sure because I only watched three days, so I need more days to check.'); await p.locator('[data-act=qaCheck][data-id=q2]').click();
  await p.fill('#qa-q3', 'I would watch for two weeks and compare mornings with afternoons to see if the time of day changes the number of ants.'); await p.locator('[data-act=qaCheck][data-id=q3]').click();
  await p.fill('#revNote', 'I added that I only watched three days because that limits what my counts can say.'); await p.locator('[data-act=revAdd]').click();
  await p.fill('#r9-learned', 'Scientists keep honest counts and say what they do not know.');
  ok(await p.evaluate(() => DC.isDone(9)), 'ch9 complete'); await next(p);
  await p.locator('[data-act=finCert]').click();
  const cert = await p.locator('.cert').innerText();
  ok(cert.includes('Young Researcher') && cert.includes("learner’s own research project") , 'anonymous certificate says Young Researcher + own research');
  ok(await p.evaluate(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every((n) => DC.isDone(n))), 'all ten chapters complete');
  ok(await p.evaluate(() => !JSON.stringify(DC.state).includes('7.2')), 'no simulated fruit-fly numbers leaked into Path B state');
  for (const w of [320, 390, 768, 1280]) { await p.setViewportSize({ width: w, height: 800 }); ok((await overflow(p)) <= 0, `no overflow ${w}px (B finale)`); }
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
