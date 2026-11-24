// Robustness, injection, privacy and reduced-motion probes for the NEW visual interface.
process.env.CONF_URL = 'http://localhost:8123/scientific-conference.html';
const { open, ok, done } = require('./helpers');
const { SEED_ALL } = require('./seed');
const U = 'http://localhost:8123/scientific-conference.html';
const EVIL = '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script>"\'><svg onload="window.__xss=3">';
(async () => {
  console.log('vx robustness: navigation + storage');
  let { browser, page: p, errors } = await open({ reduced: true });
  await p.goto(U + '#ch7'); await p.reload(); ok((await p.evaluate(() => DC.state.cur)) === 1, 'locked deep link falls back to chapter 1');
  await p.goto(U + '#ch99'); await p.reload(); ok(await p.locator('#chTitle').count() === 1, 'garbage hash does not break the app');
  await p.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'T'; DC.saveNow(); }); await p.goto(U + '#ch2'); await p.reload(); await p.evaluate(() => DC.go(3)); await p.goBack(); ok((await p.evaluate(() => DC.state.cur)) === 2, 'browser Back returns to the previous chapter');
  ok(errors.length === 0, 'no console errors ' + errors.join('|')); await browser.close();
  ({ browser, page: p, errors } = await open({ reduced: true, init: () => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('drosieConference.v1', '{not json'); } } }));
  ok(await p.locator('#chTitle').count() === 1 && errors.length === 0, 'corrupt saved data: starts fresh ' + errors.join('|')); await browser.close();
  ({ browser, page: p, errors } = await open({ reduced: true, init: () => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('drosieConference.v1', JSON.stringify({ v: 1, ui: 'bad', hall: 5, prac: null, poster: [], a: 7, b: 'x', det: [] })); } } }));
  ok(await p.locator('#chTitle').count() === 1 && errors.length === 0, 'structurally wrong saved data (incl. ui) does not crash ' + errors.join('|')); await browser.close();

  console.log('vx robustness: injection through every new free-text surface');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  let dlg = 0; p.on('dialog', (d) => { dlg = 1; d.dismiss(); });
  await p.evaluate(SEED_ALL, 'A');
  await p.evaluate((e) => { const S = DC.state; S.nick = e; S.a.setup = S.a.setup || {}; Object.keys(S.abs).forEach((k) => { if (typeof S.abs[k] === 'string') S.abs[k] = e; }); Object.keys(S.poster.f).forEach((k) => { if (typeof S.poster.f[k] === 'string') S.poster.f[k] = e; }); S.refl.learned = e; S.refl.next = e; S.prac.explain = e; S.revs = [{ note: e, changed: true, at: 1 }]; S.prac.qa = { q1: e, q2: e, q3: e }; S.fin.claimed = true; DC.saveNow(); }, EVIL);
  for (let n = 1; n <= 10; n++) { await p.goto(U + '#ch' + n); await p.reload(); await p.waitForTimeout(80); }
  await p.locator('#btnPack').click(); await p.keyboard.press('Escape'); await p.locator('#btnMap').click(); await p.keyboard.press('Escape');
  ok((await p.evaluate(() => !window.__xss)) && !dlg, 'injected markup never executes in any chapter, backpack or map');
  ok(await p.evaluate(() => !document.querySelector('#stage img[src="x"], #stage script, #stage svg[onload]')), 'injected tags are text, not elements');
  await browser.close();

  console.log('vx privacy: no outside requests across all chapters');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  const outs = []; p.on('request', (r) => { const u = r.url(); if (!u.startsWith('http://localhost') && !u.startsWith('data:') && !u.startsWith('blob:')) outs.push(u); });
  await p.evaluate(SEED_ALL, 'A'); for (let n = 1; n <= 10; n++) { await p.goto(U + '#ch' + n); await p.reload(); }
  await p.locator('#btnPack').click(); await p.keyboard.press('Escape');
  ok(outs.length === 0, 'no request left the page (' + outs.length + ')'); await browser.close();

  console.log('vx reduced motion + semantics');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(SEED_ALL, 'A'); await p.goto(U + '#ch3'); await p.reload();
  const anim = await p.evaluate(() => [...document.querySelectorAll('#stage *')].filter((e) => { const c = getComputedStyle(e); return c.animationName !== 'none' && parseFloat(c.animationDuration) > 0.05 && c.animationIterationCount === 'infinite'; }).length);
  ok(anim === 0, 'reduced motion: no looping animations in the lab scene (' + anim + ')');
  ok(await p.locator('#vxSay[aria-live=polite], #live, [aria-live]').count() >= 1, 'a live region announces progress');
  const bad = await p.evaluate(() => [...document.querySelectorAll('#stage svg')].filter((s) => s.getAttribute('role') !== 'img' && s.getAttribute('aria-hidden') !== 'true' && !s.closest('button,[role=button]')).length);
  ok(bad === 0, 'every scene svg is an image with a label or is hidden from assistive tech (' + bad + ' bad)');
  const unl = await p.evaluate(() => [...document.querySelectorAll('#stage button')].filter((b) => !(b.innerText || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length);
  ok(unl === 0, 'every button has an accessible name (' + unl + ' without)');
  const hot = await p.evaluate(() => { const hs = [...document.querySelectorAll('.vx-hot')]; return hs.every((h) => h.getAttribute('aria-label')); });
  ok(hot, 'every scene hotspot is labelled'); await browser.close();
  done();
})().catch((e) => { console.error(e); process.exit(1); });
