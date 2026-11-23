const { open, ok, done, overflow } = require('./helpers');
const { SEED_ALL } = require('./seed');
const fs = require('fs');
const OUT = '/tmp/claude-0/-home-user-drosies-world/7dc5b43f-e8cb-5caa-894c-ae04188dc07b/scratchpad/';
(async () => {
  let { browser, ctx, page, errors } = await open({});
  console.log('M9 finale (path A)');
  await page.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'Zoe'; DC.state.path = 'A'; DC.saveNow(); });
  await page.goto('http://localhost:8123/scientific-conference.html#ch10'); await page.reload();
  ok((await page.locator('.callout.warn').first().innerText()).includes('certificate unlocks'), 'certificate locked until chapters 1-9 are done');
  ok(await page.locator('.cert').count() === 0, 'no certificate before completion');
  await page.evaluate(SEED_ALL, 'A'); await page.reload();
  const flags = await page.evaluate(() => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => DC.isDone(n)));
  ok(flags.every(Boolean), 'seeded state completes chapters 1-9: ' + flags.join());
  ok(await page.locator('[data-act=finCert]').count() === 1, 'claim button offered');
  await page.locator('[data-act=finCert]').click();
  const cert = await page.locator('.cert').innerText();
  ok(cert.includes('Zoe') && cert.includes('simulated educational event') && cert.includes('not a professional certification') && cert.includes('does not mean that any university'), 'certificate states simulated event, participation only, no endorsement');
  ok(await page.evaluate(() => DC.isDone(10)), 'ch10 complete after claim');
  ok(await page.locator('#stage a[href="lab-notebook-academy.html"]').count() === 1 && await page.locator('#stage a[href="climbing-game.html"]').count() === 1, 'links to other Drosie’s World resources');
  // print sheets
  for (const [act, orient, must] of [['finPrintCert', 'landscape', 'Certificate of Participation'], ['finPrintAbs', 'portrait', 'Abstract'], ['finPrintPoster', 'landscape', 'Simulated data'], ['finPrintRefl', 'portrait', 'My Research Reflection'], ['finPrintBadge', 'portrait', 'Zoe']]) {
    await page.evaluate((a) => { const orig = window.print; window.__printed = 0; window.print = () => { window.__printed++; }; document.querySelector('[data-act=' + a + ']').click(); }, act);
    await page.waitForTimeout(250);
    ok(await page.evaluate(() => window.__printed === 1), act + ' calls the browser print dialog');
    const txt = await page.evaluate(() => document.querySelector('#printRoot').innerText); ok(txt.includes(must), act + ' sheet contains "' + must + '"');
    await page.emulateMedia({ media: 'print' }); const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true }); await page.emulateMedia({ media: 'screen' });
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    fs.writeFileSync(OUT + act + '.pdf', pdf);
    ok(pdf.length > 3000 && pages === 1, act + ' PDF is 1 page (' + pages + ')');
  }
  // portfolio download
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('[data-act=finPortfolio]').click()]);
  const path = OUT + 'portfolio.html'; await dl.saveAs(path); const html = fs.readFileSync(path, 'utf8');
  ok(dl.suggestedFilename() === 'drosie-conference-portfolio.html', 'portfolio filename');
  ok(html.includes('Certificate of Participation') && html.includes('7.2') && html.includes('class="poster"') && html.includes('Reflection') && html.includes('was not sent anywhere'), 'portfolio holds certificate, data, poster and reflection');
  ok(!/<script/i.test(html), 'portfolio contains no scripts');
  const pp = await ctx.newPage(); const perr = []; pp.on('console', (m) => m.type() === 'error' && perr.push(m.text())); pp.on('pageerror', (e) => perr.push(e.message));
  await pp.goto('file://' + path);
  ok((await pp.locator('.poster svg').count()) === 1 && (await pp.locator('.poster').evaluate((e) => getComputedStyle(e).display)) === 'grid', 'standalone portfolio renders the poster with styles');
  ok(perr.length === 0, 'portfolio opens with no console errors');
  await pp.screenshot({ path: OUT + 'portfolio.png', fullPage: false }); await pp.close();
  // JSON backup round trip
  const [dl2] = await Promise.all([page.waitForEvent('download'), page.locator('[data-act=exportJson]').click()]);
  await dl2.saveAs(OUT + 'backup.json'); const j = JSON.parse(fs.readFileSync(OUT + 'backup.json', 'utf8'));
  ok(j.v === 1 && j.nick === 'Zoe' && j.abs.results.includes('7.2'), 'backup JSON contains the learner’s work');
  await page.locator('[data-act=resetAsk]').count();
  await page.evaluate(() => DC.acts.backup()); await page.locator('[data-act=resetAsk]').click(); await page.locator('[data-act=resetGo]').click();
  ok(await page.evaluate(() => DC.state.nick === '' && !DC.isDone(1) && DC.state.abs.results === ''), 'reset erases state');
  await page.waitForTimeout(300);
  await page.evaluate(() => DC.acts.backup()); await page.locator('#imp').setInputFiles(OUT + 'backup.json'); await page.waitForTimeout(400);
  ok(await page.evaluate(() => DC.state.nick === 'Zoe' && DC.isDone(9)), 'restore from backup brings back all completed work');
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 800 }); ok((await overflow(page)) <= 0, `no overflow ${w}px (ch10)`); }
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  ({ browser, page, errors } = await open({}));
  console.log('M9 finale (path B)');
  await page.evaluate(() => { DC.state.mode = 'independent'; DC.saveNow(); });
  await page.goto('http://localhost:8123/scientific-conference.html#ch10'); await page.evaluate(SEED_ALL, 'B'); await page.reload();
  const fb = await page.evaluate(() => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => DC.isDone(n)));
  ok(fb.every(Boolean), 'B seeded state completes chapters 1-9: ' + fb.join());
  await page.locator('[data-act=finCert]').click();
  ok((await page.locator('.cert').innerText()).includes('own research project'), 'B certificate describes own research, not simulated fruit flies');
  ok(!(await page.locator('.cert').innerText()).includes('simulated fruit fly'), 'B certificate does not mention simulated fruit fly data');
  ok(errors.length === 0, 'no console errors (B) ' + errors.join('|'));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
