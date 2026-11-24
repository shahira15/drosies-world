// Automated accessibility scan (axe-core) of the NEW visual interface: every chapter, both paths, Explorer and Researcher, plus dialogs and answered states.
// Needs AXE_PATH. Automated checks cover only part of WCAG; screen-reader and keyboard testing by people is still needed.
process.env.CONF_URL = 'http://localhost:8123/scientific-conference.html';
const { open, ok, done } = require('./helpers');
const { SEED_ALL } = require('./seed');
const fs = require('fs');
const axeSrc = fs.readFileSync(process.env.AXE_PATH, 'utf8');
const U = 'http://localhost:8123/scientific-conference.html';
const scan = async (p, label) => { await p.evaluate(axeSrc); const res = await p.evaluate(async () => { const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } }); return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes.slice(0, 2).map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n')[1]) })); }); ok(res.length === 0, 'axe ' + label + ': ' + res.length + ' violation types' + (res.length ? ' ' + JSON.stringify(res) : '')); };
(async () => {
  for (const path of ['A', 'B']) for (const lv of ['explorer', 'researcher']) {
    const { browser, page: p, errors } = await open({ reduced: true });
    await p.evaluate(SEED_ALL, path); await p.evaluate((l) => { DC.state.ui.level = l; DC.saveNow(); }, lv);
    for (let n = 1; n <= 10; n++) {
      if (path === 'B' && n === 1) continue;
      await p.goto(U + '#ch' + n); await p.reload();
      if (n === 10) await p.locator('[data-act=finCert]').click().catch(() => {});
      if (n === 8 && lv === 'explorer') { await p.locator('.vx-tray [data-act=v8area][data-id=talk]').click(); await p.locator('#v8panel [data-act=v8sci]').first().click(); await scan(p, `${path}/${lv} ch8 talk`); await p.locator('.vx-tray [data-act=v8area][data-id=booth]').click(); await p.locator('[data-act=v8ref]').first().click(); }
      if (n === 9 && lv === 'explorer') { await p.locator('.vx-tray [data-act=v9step][data-i="2"]').click(); await p.locator('[data-act=v9pick]').first().click(); }
      await scan(p, `${path}/${lv} ch${n}`);
    }
    await p.goto(U + '#ch3'); await p.reload(); await p.locator('#btnMap').click(); await scan(p, `${path}/${lv} map dialog`); await p.keyboard.press('Escape');
    await p.locator('#btnPack').click(); await scan(p, `${path}/${lv} backpack dialog`);
    ok(errors.length === 0, `${path}/${lv}: no console errors ${errors.join('|')}`); await browser.close();
  }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
