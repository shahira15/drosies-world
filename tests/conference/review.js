// Pre-merge review checks: path isolation, reduced motion, semantics, wording of gates/science text.
const { open, ok, done } = require('./helpers');
const { SEED_ALL } = require('./seed');
(async () => {
  console.log('review: path switching keeps each path\'s work separate');
  let { browser, page: p, errors } = await open({ reduced: true });
  await p.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch2'); await p.evaluate(SEED_ALL, 'A'); await p.reload();
  const aAbs = await p.evaluate(() => DC.state.abs.results);
  await p.locator('[data-act=pickPath][data-p=B]').click();
  let st = await p.evaluate(() => ({ abs: DC.state.abs.results, pt: DC.state.poster.f.title, qa: DC.state.prac.qa.q1 || '', revs: DC.state.revs.length, sci: Object.keys(DC.state.hall.sci).length, sim: /simulated/i.test(DC.portfolioHTML()) }));
  ok(st.abs === '' && st.pt === '' && st.qa === '' && st.revs === 0 && st.sci === 0, 'switching A to B starts Path B with a blank abstract, poster, answers, revisions and hall progress');
  ok(!st.sim || !/fruit fly data/i.test(await p.evaluate(() => DC.portfolioHTML())), 'Path B portfolio does not contain Path A text');
  await p.locator('[data-act=pickPath][data-p=A]').click();
  ok((await p.evaluate(() => DC.state.abs.results)) === aAbs && (await p.evaluate(() => DC.isDone(5) && DC.isDone(6) && DC.isDone(9))), 'switching back to A restores the saved abstract, poster and practice work');
  ok(await p.evaluate(() => JSON.stringify(DC.state.snaps.B) .includes('"results":""')), 'Path B snapshot saved separately');
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  console.log('review: reduced motion');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  const anim = await p.evaluate(() => getComputedStyle(document.querySelector('.invite')).animationName);
  ok(anim === 'none', 'prefers-reduced-motion: invitation animation is off (animation-name: ' + anim + ')');
  await browser.close();
  ({ browser, page: p, errors } = await open({ reduced: false }));
  const before = await p.evaluate(() => getComputedStyle(document.querySelector('.invite')).animationName);
  await p.evaluate(() => { DC.state.settings.motion = true; DC.applySettings(); });
  const after = await p.evaluate(() => getComputedStyle(document.querySelector('.invite')).animationName);
  ok(before !== 'none' && after === 'none', 'in-app "turn off animation" setting disables it (' + before + ' -> ' + after + ')');
  await browser.close();

  console.log('review: semantics on every chapter (both paths)');
  for (const path of ['A', 'B']) {
    ({ browser, page: p, errors } = await open({ reduced: true }));
    await p.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch1'); await p.evaluate(SEED_ALL, path); await p.evaluate(() => { DC.state.fin.claimed = true; DC.saveNow(); });
    for (let n = 1; n <= 10; n++) {
      await p.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch' + n); await p.reload();
      if (n === 8) { await p.locator('.areabtn[data-a=posters]').click(); }
      const r = await p.evaluate(() => {
        const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5')].filter((h) => !h.closest('#printRoot') && !h.closest('dialog')).map((h) => +h.tagName[1]);
        let skip = false; hs.forEach((h, i) => { if (i && h - hs[i - 1] > 1) skip = true; });
        const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
        return { h1: hs.filter((x) => x === 1).length, skip, dup: [...new Set(dup)], main: document.querySelectorAll('main').length, nav: document.querySelectorAll('nav').length, lang: document.documentElement.lang, live: !!document.querySelector('[role=status][aria-live]'), imgNoAlt: [...document.querySelectorAll('img:not([alt])')].length, svgUnnamed: [...document.querySelectorAll('svg[role=img]')].filter((s) => !s.getAttribute('aria-label') && !s.getAttribute('aria-labelledby') && !s.querySelector('title')).length };
      });
      ok(r.h1 === 1 && !r.skip && r.dup.length === 0 && r.main === 1 && r.lang === 'en' && r.live && r.imgNoAlt === 0 && r.svgUnnamed === 0, `path ${path} ch${n}: one h1, no skipped heading levels, no duplicate ids, one main, lang, live region, alt text, named svgs` + (r.skip ? ' [HEADING SKIP]' : '') + (r.dup.length ? ' [DUP ' + r.dup + ']' : '') + (r.h1 !== 1 ? ' [h1=' + r.h1 + ']' : ''));
    }
    ok(errors.length === 0, 'no console errors ' + errors.join('|'));
    await browser.close();
  }

  console.log('review: gate messages tell the learner what is missing');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'T'; DC.state.path = 'B'; DC.state.b.f.title = 'Ants'; DC.state.b.f.question = 'Q?'; DC.saveNow(); });
  await p.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch3'); await p.reload();
  const g = await p.evaluate(() => DC.chap[3].gate());
  ok(/method step/.test(g) && /observation or data row/.test(g) && /tick the box/.test(g), 'Path B chapter 3 gate lists exactly what is missing: ' + g);
  for (let n = 1; n <= 10; n++) { const gm = await p.evaluate((n) => { try { return DC.chap[n].gate ? DC.chap[n].gate() : ''; } catch (e) { return 'ERR ' + e.message; } }, n); ok(gm.length > 8 && !/^ERR/.test(gm), `chapter ${n} has a non-empty gate message`); }
  await browser.close();

  console.log('review: screen-reader announcements and small-screen legibility');
  ({ browser, page: p, errors } = await open({ reduced: true, w: 320 }));
  await p.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch1'); await p.evaluate(SEED_ALL, 'A'); await p.evaluate(() => { DC.state.det = {}; DC.state.mode = 'independent'; DC.state.a.acked = true; DC.saveNow(); });
  await p.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch2'); await p.reload();
  await p.locator('[data-q=c2iv] .opt').nth(0).click(); await p.waitForTimeout(150);
  ok((await p.locator('#sr').innerText()).startsWith('Not quite'), 'answer feedback is announced through the live region: "' + (await p.locator('#sr').innerText()).slice(0, 40) + '"');
  await p.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch4'); await p.reload();
  const sizes = await p.evaluate(() => { const svg = document.querySelector('#gBox svg'), k = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width; return { k, texts: [...svg.querySelectorAll('text')].map((t) => parseFloat(t.getAttribute('font-size')) * k), right: Math.max(...[...svg.querySelectorAll('text')].map((t) => { const b = t.getBoundingClientRect(); return b.right; })) - svg.getBoundingClientRect().right } });
  ok(Math.min(...sizes.texts) >= 7.5, 'chart text at 320px is at least 7.5px on screen (smallest ' + Math.min(...sizes.texts).toFixed(1) + 'px, was ~4.6px)');
  ok(sizes.right <= 1, 'no chart label is clipped at the right edge at 320px (overhang ' + sizes.right.toFixed(1) + 'px)');
  await p.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch7'); await p.reload();
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.tbl tbody th')).whiteSpace) === 'nowrap', 'program table times do not wrap mid-word');
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  console.log('review: science wording');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(() => { DC.state.mode = 'independent'; DC.state.nick = 'T'; DC.state.path = 'A'; DC.state.a.acked = true; DC.DATA.conditions.forEach((c) => (DC.state.a.rec[c.id] = c.counts.slice())); DC.saveNow(); });
  await p.goto('http://localhost:8123/scientific-conference.html?legacy=1#ch4'); await p.reload();
  const t4 = await p.locator('#stage').innerText();
  ok(t4.includes('Results do not always match the prediction'), 'Chapter 4 says results do not always confirm the prediction');
  await p.locator('[data-q=d_cause] .opt').nth(2).click();
  ok((await p.locator('[data-q=d_cause] .fb').innerText()).includes('(3 to 5) was lower than every 25'), 'feedback quotes computed ranges, not "every trial"');
  const study = await p.evaluate(() => JSON.stringify(DC.STUDY));
  ok(!/tired/i.test(study), 'study text no longer asserts that flies get tired (the cited RING paper reports no repeated-testing effect)');
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close(); done();
})().catch((e) => { console.error(e); process.exit(1); });
