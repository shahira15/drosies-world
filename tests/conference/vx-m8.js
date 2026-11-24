// Visual adventure M7b: Living Conference Hall (Chapter 8). NEW interface.
process.env.CONF_URL = 'http://localhost:8123/scientific-conference.html';
const { open, ok, done, overflow } = require('./helpers');
const U = 'http://localhost:8123/scientific-conference.html';
const SEED = () => { const S = DC.state; S.mode = 'independent'; S.nick = 'Zoe'; S.path = 'A'; S.a.acked = true; S.checked = true; DC.saveNow(); };
(async () => {
  let { browser, page: p, errors } = await open({ reduced: true });
  console.log('M7b hall');
  await p.evaluate(SEED); await p.goto(U + '#ch8'); await p.reload();
  ok(await p.locator('.vx-scene [data-act=v8area]').count() === 6, 'overview scene has six tappable places');
  const w0 = await p.evaluate(() => (document.querySelector('#stage').innerText.match(/\S+/g) || []).length);
  ok(w0 < 150, 'overview is mostly picture (' + w0 + ' words, baseline 673 for hall)');
  ok(!(await p.evaluate(() => DC.isDone(8))), 'not complete at start');
  const ids = ['reg', 'posters', 'stage', 'talk', 'booth', 'reflect'];
  const arts = new Set();
  for (const id of ids) {
    await p.locator(`.vx-tray [data-act=v8area][data-id=${id}]`).click();
    arts.add(await p.locator('.vx-scene .vx-art').innerHTML().then((h) => h.length));
    ok(await p.evaluate((i) => !!DC.state.hall.visited[i], id), id + ': visited recorded');
  }
  ok(arts.size >= 5, 'six areas have distinct scenes (' + arts.size + ' distinct)');
  ok(!(await p.evaluate(() => DC.isDone(8))), 'visiting all six is not enough');
  // scientists: one question at a time
  await p.locator('.vx-tray [data-act=v8area][data-id=talk]').click();
  const ps = await p.evaluate(() => DC.SCIENTISTS.map((s) => s.id));
  ok(await p.locator('#v8q').count() === 0, 'no question shown until a scientist is chosen');
  for (const id of ps.slice(0, 3)) {
    await p.locator(`#v8panel [data-act=v8sci][data-id=${id}]`).click();
    ok(await p.locator('#v8q').count() === 1 && await p.locator('[data-act=v8ans]').count() >= 3, 'one question at a time for ' + id);
    const best = await p.evaluate((i) => DC.sciQuestion(i).o.findIndex((o) => o[1] === 2), id);
    await p.locator(`[data-act=v8ans][data-i="${best}"]`).click();
  }
  ok(await p.evaluate(() => DC.isDone(8)), 'complete after six visits and three strong answers (same rule as before)');
  // weaker answer does not erase best
  const wk = await p.evaluate((i) => DC.sciQuestion(i).o.findIndex((o) => o[1] < 2), ps[0]);
  await p.locator(`#v8panel [data-act=v8sci][data-id=${ps[0]}]`).click(); await p.locator(`[data-act=v8ans][data-i="${wk}"]`).click();
  ok(await p.evaluate((i) => DC.state.hall.sci[i].best, ps[0]) === true, 'a later weaker answer keeps the earlier strong result');
  // posters + own poster
  await p.locator('.vx-tray [data-act=v8area][data-id=posters]').click();
  await p.locator('#v8panel [data-act=v8poster]').first().click();
  ok(await p.locator('#v8panel [data-act=vxQuiz]').count() >= 2, 'fictional poster has a picture-card quiz');
  await p.locator('#v8panel [data-act=v8poster][data-id=mine]').click();
  ok(await p.locator('#v8panel').innerText().then((t) => t.includes('not started') || t.includes('Look like a visitor')), 'own-poster visit works');
  // stage claims
  await p.locator('.vx-tray [data-act=v8area][data-id=stage]').click();
  ok(await p.locator('#v8chart svg').count() === 1, 'talk chart rendered');
  await p.locator('[data-act=vxQuiz][data-id=ht_2][data-i="1"]').click();
  ok(await p.evaluate(() => DC.state.det.ht_2.ok === true), 'stage claim saved under legacy id ht_2');
  // booth + reflection
  await p.locator('.vx-tray [data-act=v8area][data-id=booth]').click(); await p.locator('[data-act=v8term][data-i="0"]').first().click();
  ok((await p.locator('#v8panel .vx-fb').first().innerText()).length > 10, 'glossary word explains itself');
  await p.locator('[data-act=v8ref][data-i="0"]').first().click(); ok((await p.locator('#v8panel').innerText()).includes('PubMed'), 'references carry the honest note');
  await p.locator('.vx-tray [data-act=v8area][data-id=reflect]').click(); await p.locator('[data-act=v8start][data-k=learned]').first().click(); await p.fill('#rf-learned', 'I learned that scientists check each other.');
  ok(await p.evaluate(() => DC.state.refl.learned.includes('scientists check')), 'reflection saved to refl.learned');
  // text-only alternative to the scene: tray buttons are real buttons; keyboard
  await p.locator('[data-act=v8hall]').click(); await p.locator('.vx-scene [data-act=v8area]').first().focus(); await p.keyboard.press('Enter');
  ok(await p.evaluate(() => !!DC.state.hall.visited[DC.state.ui.c[8].area]), 'keyboard activation of a scene hotspot works');
  ok(errors.length === 0, 'no console errors: ' + errors.join(';')); await browser.close();

  console.log('M7b legacy migration');
  ({ browser, page: p, errors } = await open({ reduced: true }));
  await p.evaluate(() => { SEED2 = 0; const S = DC.state; S.mode = 'independent'; S.path = 'A'; S.a.acked = true; S.checked = true; S.hall.visited = { reg: 1, booth: 1, posters: 1, stage: 1, talk: 1, reflect: 1 }; ['sugar', 'x'].length; const sc = DC.SCIENTISTS.slice(0, 3); sc.forEach((s) => (S.hall.sci[s.id] = { sel: 0, score: 2, best: true })); DC.saveNow(); });
  await p.goto(U + '#ch8'); await p.reload();
  ok(await p.evaluate(() => DC.isDone(8)), 'a hall finished in the old interface is still complete');
  await browser.close();

  console.log('M7b layouts');
  for (const w of [320, 390, 768, 1280]) { ({ browser, page: p, errors } = await open({ reduced: true, w })); await p.evaluate(SEED); await p.goto(U + '#ch8'); await p.reload(); ok((await overflow(p)) <= 0, `hall overview @${w}px: no overflow`); for (const id of ['talk', 'booth', 'stage']) { await p.locator(`.vx-tray [data-act=v8area][data-id=${id}]`).click(); ok((await overflow(p)) <= 0, `${id} @${w}px: no overflow`); } ok(errors.length === 0, `@${w}: no console errors: ${errors.join(';')}`); await browser.close(); }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
