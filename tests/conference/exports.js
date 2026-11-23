// Exports: poster, certificate, abstract, reflection, portfolio. Reads the REAL generated PDFs with pdftotext and checks accuracy + readability.
const { chromium } = require('playwright'); const { execFileSync } = require('child_process'); const fs = require('fs');
const { ok, done } = require('./helpers'); const { SEED_ALL } = require('./seed');
const OUT = '/tmp/claude-0/-home-user-drosies-world/7dc5b43f-e8cb-5caa-894c-ae04188dc07b/scratchpad/exp/'; fs.mkdirSync(OUT, { recursive: true });
const text = (f) => execFileSync('pdftotext', ['-layout', f, '-'], { encoding: 'utf8' });
const pages = (f) => +/Pages:\s+(\d+)/.exec(execFileSync('pdfinfo', [f], { encoding: 'utf8' }))[1];
(async () => {
  const browser = await chromium.launch();
  for (const path of ['A', 'B']) {
    console.log('exports path ' + path);
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await p.goto('http://localhost:8123/scientific-conference.html#ch10'); await p.evaluate(SEED_ALL, path); await p.evaluate(() => { DC.state.fin.claimed = true; DC.state.fin.date = 'November 23, 2026'; DC.state.refl.proud = 'I am proud that I said what my data cannot show.'; DC.saveNow(); }); await p.reload();
    const sheets = { cert: ['finPrintCert', 'landscape'], abs: ['finPrintAbs', 'portrait'], poster: ['finPrintPoster', 'landscape'], refl: ['finPrintRefl', 'portrait'], badge: ['finPrintBadge', 'portrait'] };
    const txt = {};
    for (const [k, [act, o]] of Object.entries(sheets)) {
      await p.evaluate((a) => { window.print = () => {}; document.querySelector('[data-act=' + a + ']').click(); }, act); await p.waitForTimeout(200);
      await p.emulateMedia({ media: 'print' }); const f = OUT + path + '-' + k + '.pdf'; fs.writeFileSync(f, await p.pdf({ preferCSSPageSize: true, printBackground: true })); await p.emulateMedia({ media: 'screen' });
      ok(pages(f) === 1, `${k} PDF is exactly one page`); txt[k] = text(f);
    }
    if (path === 'A') {
      ok(/7\.2/.test(txt.poster) && /4\.2/.test(txt.poster) && /Simulated data/.test(txt.poster) && /not been peer reviewed/.test(txt.poster) && /Figure 1/.test(txt.poster), 'poster PDF text: means 7.2/4.2, "Simulated data", figure caption, not-peer-reviewed footer');
      ok(/Simulated data/.test(txt.abs) && /7\.2/.test(txt.abs) && /has not been peer reviewed/.test(txt.abs), 'abstract PDF text has numbers + simulated + not peer reviewed');
      ok(/simulated educational event/.test(txt.cert) && /not a professional certification/.test(txt.cert) && /Zoe/.test(txt.cert), 'certificate PDF text has name, simulated event, no-certification disclaimer');
    } else {
      ok(/Ants/i.test(txt.poster) && !/Simulated data/.test(txt.poster) && /not been peer reviewed/.test(txt.poster), 'B poster PDF: own project, no "Simulated data" tag');
      ok(!/simulated fruit|fruit fl/i.test((txt.abs + txt.poster + txt.cert + txt.refl).replace(/Drosie the fruit fly/g, '')), 'B printables contain no fruit-fly/simulation content');
    }
    ok(/proud that I said what my data cannot show/.test(txt.refl) && /revis/i.test(txt.refl), 'reflection PDF contains the learner\'s own words and revision log');
    // printed font sizes (poster at printable width 10.2in)
    await p.evaluate(() => { document.querySelector('[data-act=finPrintPoster]').click(); }); await p.setViewportSize({ width: 979, height: 760 }); await p.emulateMedia({ media: 'print' });
    const fs_ = await p.evaluate(() => { const g = (s) => { const e = document.querySelector('#printRoot ' + s); return e ? +(parseFloat(getComputedStyle(e).fontSize) * 0.75).toFixed(1) : null; }; return { title: g('.ptitle'), head: g('.ps h4'), body: g('.ps p, .ps li'), cap: g('figcaption'), foot: g('.pfoot p') }; });
    console.log('   printed poster sizes (pt):', JSON.stringify(fs_));
    ok(fs_.body >= 10.5 && fs_.head >= 11 && fs_.title >= 20 && (fs_.cap === null || fs_.cap >= 8.5) && fs_.foot >= 8, 'poster print sizes readable: body >= 10.5pt, headings >= 11pt, title >= 20pt, caption/footer >= 8pt');
    await p.emulateMedia({ media: 'screen' }); await p.setViewportSize({ width: 1280, height: 900 });
    // portfolio file
    const [dl] = await Promise.all([p.waitForEvent('download'), p.locator('[data-act=finPortfolio]').click()]); await dl.saveAs(OUT + path + '-portfolio.html'); const html = fs.readFileSync(OUT + path + '-portfolio.html', 'utf8');
    const pp = await ctx.newPage(); await pp.goto('file://' + OUT + path + '-portfolio.html'); const body = await pp.evaluate(() => document.body.innerText);
    ok(/Certificate of Participation/.test(body) && /Abstract/.test(body) && /Reflection/.test(body) && /References/.test(body), 'portfolio has certificate, abstract, reflection and references');
    if (path === 'A') ok(/7\.2/.test(body) && /simulated/i.test(body) && /Gargano/.test(body) && /Nichols/.test(body), 'A portfolio: numbers, simulation label, both references'); else ok(/Ants at my door/.test(body) && /Tue/.test(body) && !/Gargano/.test(body.replace(/References[\s\S]*$/, '')), 'B portfolio: own project and data');
    await pp.screenshot({ path: OUT + path + '-portfolio.png' }); await pp.close();
    ok(errs.length === 0, 'no console errors ' + errs.join('|')); await ctx.close();
  }
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
