// End-to-end: a learner completes the guided path (A) from a blank browser using only the UI.
const { open, ok, done, overflow } = require('./helpers');
const title = (p) => p.locator('#chTitle').innerText();
const next = async (p) => { const before = await p.locator('.nav-foot .btn.primary').getAttribute('aria-disabled'); const t0 = await p.locator('#chTitle').innerText(); await p.locator('.nav-foot .btn.primary').click(); await p.waitForFunction((t) => document.querySelector('#chTitle').innerText !== t, t0, { timeout: 3000 }).catch(() => console.log('   (errors so far: ' + JSON.stringify(global.__errs) + '; next did not navigate; aria-disabled before click = ' + before + ', from ' + t0 + ')')); };
async function bruteMcq(p, qsel) { const n = await p.locator(qsel + ' .opt').count(); for (let i = 0; i < n; i++) { await p.locator(qsel + ' .opt').nth(i).click(); if (await p.locator(qsel + ' .fb.ok').count()) return i; } return -1; }
(async () => {
  const { browser, page: p, errors } = await open({ reduced: true }); global.__errs = errors;
  console.log('e2e: path A from a blank browser');
  // Ch1
  await p.fill('#nick', 'Robin'); await p.locator('input[name=mode][value=guided]').check({ force: true });
  await p.locator('[data-q=c1peer] .opt').nth(1).click(); await next(p);
  ok(await title(p) === 'Choose Your Research Path', 'ch1 -> ch2');
  // Ch2
  await p.locator('[data-act=pickPath][data-p=A]').click();
  ok(await bruteMcq(p, '[data-q=c2hyp]') === 1 && await bruteMcq(p, '[data-q=c2iv]') === 1, 'ch2 understanding checks');
  await p.locator('#ack').check(); await next(p);
  ok(await title(p) === 'The Research Investigation', 'ch2 -> ch3');
  // Ch3: count flies from the picture itself
  const ans = { temp: 'changed', count: 'measured', vial: 'same', nflies: 'same', tod: 'same', taps: 'same' };
  for (const [k, v] of Object.entries(ans)) await p.selectOption('#su-' + k, v);
  let miscounts = 0;
  for (const c of ['control', 'cool']) {
    await p.locator(`[data-act=c3cond][data-c=${c}]`).click();
    for (let t = 0; t < 5; t++) {
      await p.locator(`[data-act=c3trial][data-i="${t}"]`).click(); await p.locator('#startBtn').click();
      const seen = await p.evaluate(() => { const svg = document.querySelector('#labSvg').innerHTML; const ys = [...svg.matchAll(/<g transform="translate\(([\d.]+) ([\d.]+)\) rotate/g)].map((m) => parseFloat(m[2])); return ys.filter((y) => y < 380 - 8 * 34).length; });
      await p.fill('#cnt', String(seen)); await p.locator('[data-act=c3record]').click();
      if (!(await p.locator('#cntMsg').innerText()).startsWith('✓')) miscounts++;
    }
  }
  ok(miscounts === 0, 'counting the flies in the picture reproduces every recorded value (miscounts: ' + miscounts + ')');
  ok(await bruteMcq(p, '[data-q=c3var]') === 1, 'variation question'); await next(p);
  ok(await title(p) === 'Become a Data Detective', 'ch3 -> ch4');
  // Ch4
  const nums = await p.evaluate(() => DC.DATA.conditions.map((c) => DC.stats(c.counts)));
  await p.fill('#d_mean', String(nums[0].mean)); await p.locator('[data-act=numQ][data-id=d_mean]').click();
  await p.fill('#d_diff', String(nums[0].mean - nums[1].mean)); await p.locator('[data-act=numQ][data-id=d_diff]').click();
  for (const q of ['d_range', 'd_cause', 'd_repl', 'd_axis']) ok((await bruteMcq(p, `[data-q=${q}]`)) >= 0, 'ch4 ' + q);
  for (const [i, v] of ['obs', 'int', 'obs', 'int'].entries()) await p.selectOption('#d_oi' + i, v); await p.locator('[data-act=oiCheck]').click();
  for (const i of [0, 1, 2, 3, 4]) await p.locator(`[data-bind="det.limits_sel.${i}"]`).check(); await p.locator('[data-act=limCheck]').click();
  ok(await p.evaluate(() => DC.isDone(4)), 'ch4 complete'); await next(p);
  ok(await title(p) === 'The Abstract Studio', 'ch4 -> ch5');
  // Ch5
  await p.locator('[data-act=absDraft]').click();
  await p.fill('#ab-conclusion', 'In this simulation the 18 °C group had fewer flies above the line, which fits the prediction. One vial per temperature is a limit, so more groups are needed.');
  ok(await p.evaluate(() => DC.absComplete()), 'ch5 abstract complete: ' + (await p.locator('#absFb').innerText()).replace(/\s+/g, ' ').slice(0, 120)); await next(p);
  // Ch6
  ok(await title(p) === 'The Scientific Poster Studio', 'ch5 -> ch6 (title: ' + (await title(p)) + ', gate: ' + (await p.locator('#gateMsg').count() ? await p.locator('#gateMsg').innerText() : 'none') + ', toast: ' + (await p.locator('.toast').count() ? await p.locator('.toast').innerText() : 'none') + ', foot: ' + (await p.locator('.nav-foot').innerHTML()) + ', first open: ' + (await p.evaluate(() => DC.firstOpen())) + ' dones: ' + (await p.evaluate(() => [1,2,3,4,5,6].map((n) => DC.isDone(n)))) + ')');
  await p.locator('[data-act=postStart]').click();
  ok(await p.evaluate(() => DC.isDone(6)), 'ch6 poster complete after starting from my work: ' + (await p.locator('#posterChecks').innerText()).replace(/\s+/g, ' ').slice(0, 200)); await next(p);
  // Ch7
  ok(await title(p) === 'Registration and Preparation', 'ch6 -> ch7');
  await p.locator('[data-act=checkIn]').click();
  const ANS = ['hello', 'why', 'how', 'found', 'means', 'next'];
  for (let i = 0; i < 6; i++) for (let g = 0; g < 8; g++) { const o = await p.evaluate(() => DC.state.reg.order); const at = o.indexOf(ANS[i]); if (at <= i) break; await p.locator(`#ordBox [data-act=ordMove][data-i="${at}"][data-d="-1"]`).click(); }
  await p.locator('[data-act=ordCheck]').click(); ok(await p.evaluate(() => DC.isDone(7)), 'ch7 complete'); await next(p);
  // Ch8
  ok(await title(p) === 'The Interactive Conference Hall', 'ch7 -> ch8');
  for (const a of ['reg', 'booth', 'posters', 'stage', 'talk', 'reflect']) await p.locator(`.areabtn[data-a=${a}]`).click();
  await p.locator('.areabtn[data-a=talk]').click();
  for (const s of ['quill', 'anand', 'waverly']) { await p.locator(`[data-act=sciPick][data-s=${s}]`).click(); for (let i = 0; i < 4; i++) { await p.locator(`[data-act=sciAns][data-i="${i}"]`).click(); if (await p.locator('#sciPanel .fb.ok').count()) break; } }
  ok(await p.evaluate(() => DC.isDone(8)), 'ch8 complete'); await next(p);
  // Ch9
  ok(await title(p) === 'Present, Discuss, and Revise', 'ch8 -> ch9');
  for (let i = 0; i < 6; i++) await p.locator('[data-act=pracStep]').click();
  await p.fill('#explain', 'We tapped 10 flies in a warm room and 10 in a cool room. In the warm room about 7 flies climbed past the line, but in the cool room about 4 did. That suggests cool air makes flies climb less.'); await p.locator('[data-act=explCheck]').click();
  await p.fill('#qa-q1', 'My data show more flies above the line at 25 °C on average, but they cannot tell us what all flies do, because I only used 10 flies in one vial.'); await p.locator('[data-act=qaCheck][data-id=q1]').click();
  await p.fill('#qa-q2', 'I am fairly sure but not completely sure, because I only had one vial for each temperature, so I would need more groups.'); await p.locator('[data-act=qaCheck][data-id=q2]').click();
  await p.fill('#qa-q3', 'That would require another experiment: I would test several new groups of flies at both temperatures to see if the pattern holds.'); await p.locator('[data-act=qaCheck][data-id=q3]').click();
  await p.fill('#revNote', 'I kept my careful conclusion on purpose because one vial per temperature limits what I can say.'); await p.locator('[data-act=revAdd]').click();
  await p.fill('#r9-learned', 'Scientists share their work, listen to questions and improve it.');
  ok(await p.evaluate(() => DC.isDone(9)), 'ch9 complete: ' + (await p.locator('#gateMsg').count() ? await p.locator('#gateMsg').innerText() : 'no gate')); await next(p);
  // Ch10
  ok(await title(p) === 'The Conference Finale', 'ch9 -> ch10');
  await p.locator('[data-act=finCert]').click();
  ok((await p.locator('.cert').innerText()).includes('Robin'), 'certificate carries the learner nickname');
  ok(await p.evaluate(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every((n) => DC.isDone(n))), 'all ten chapters complete');
  // progress survives a reload and rail shows all done
  await p.reload();
  ok(await p.locator('#railList .rbtn.done').count() === 10, 'rail shows 10 completed chapters after reload');
  for (const w of [320, 390, 768, 1280]) { await p.setViewportSize({ width: w, height: 800 }); ok((await overflow(p)) <= 0, `no overflow ${w}px (finale)`); }
  ok(errors.length === 0, 'no console errors in the whole run ' + errors.join('|'));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
