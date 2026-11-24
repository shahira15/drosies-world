// Visual adventure M9: Celebration (Chapter 10). NEW interface.
process.env.CONF_URL = 'http://localhost:8123/scientific-conference.html';
const { open, ok, done, overflow } = require('./helpers');
const { SEED_ALL } = require('./seed');
const fs = require('fs');
const U = 'http://localhost:8123/scientific-conference.html';
(async () => {
  for (const path of ['A', 'B']) {
    let { browser, page: p, errors } = await open({ reduced: true });
    console.log('M9 celebration, Path ' + path);
    await p.evaluate((x) => { DC.state.mode = 'independent'; DC.state.nick = 'Zoe'; DC.state.path = x; DC.saveNow(); }, path);
    await p.goto(U + '#ch10'); await p.reload();
    ok(await p.locator('.cert').count() === 0 && await p.locator('[data-act=finCert]').count() === 0, 'no certificate or stamp before the chapters are finished');
    ok(await p.locator('#stage [data-act=go]').count() >= 1, 'unfinished places are listed with buttons to go there');
    await p.evaluate(SEED_ALL, path); await p.reload();
    ok((await p.evaluate(() => [1, 2, 3, 4, 5, 6, 7, 8, 9].every((n) => DC.isDone(n)))), 'seeded state completes 1-9');
    ok(await p.locator('[data-act=finCert]').count() === 1 && await p.locator('.cert').count() === 0, 'certificate stamp offered, not yet revealed');
    ok(await p.locator('.vx-tray [role=listitem]').count() === 10 && (await p.locator('.vx-tray .done[role=listitem]').count()) === (await p.evaluate(() => DC.vx.cards().filter((c) => c.earned()).length)), 'backpack journey shows exactly the cards that were earned (a card is only earned by real work)');
    await p.locator('[data-act=finCert]').click();
    ok(await p.evaluate(() => DC.state.fin.claimed === true && DC.isDone(10)), 'claiming sets fin.claimed and completes chapter 10');
    const cert = await p.locator('.cert').first().innerText(); ok(/simulated/i.test(cert), 'certificate says simulated educational experience');
    ok(!/accredited|official award/i.test(cert.replace(/not (an )?(accredited|official)/ig, '')), 'certificate makes no accreditation claim');
    for (const a of ['finPrintCert', 'finPrintBadge', 'finPrintAbs', 'finPrintPoster', 'finPrintRefl', 'finPortfolio', 'exportJson']) ok(await p.locator(`[data-act=${a}]`).count() === 1, a + ' button present');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.locator('[data-act=finPortfolio]').click()]);
    const f = await dl.path(); const html = fs.readFileSync(f, 'utf8'); ok(html.includes('simulated') || html.includes('Simulated'), 'portfolio downloads and mentions simulation');
    ok(await p.locator('#stage a[href="conference-teacher-guide.html"]').count() === 1 && await p.locator('#stage a[href="science-activities/"]').count() === 1, 'links to the guide and other activities');
    const reqs = []; p.on('request', (r) => { if (!r.url().startsWith('http://localhost')) reqs.push(r.url()); });
    ok(reqs.length === 0, 'no outside requests');
    ok(errors.length === 0, 'no console errors: ' + errors.join(';')); await browser.close();
  }
  console.log('M9 migration + layouts');
  for (const w of [320, 390, 768, 1280]) { const { browser, page: p, errors } = await open({ reduced: true, w }); await p.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'Zoe'; DC.state.path = 'A'; DC.saveNow(); }); await p.goto(U + '#ch10'); await p.reload(); await p.evaluate(SEED_ALL, 'A'); await p.reload(); await p.locator('[data-act=finCert]').click(); ok((await overflow(p)) <= 0, `celebration @${w}px: no overflow`); ok(errors.length === 0, `@${w}: no console errors: ${errors.join(';')}`); await browser.close(); }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
