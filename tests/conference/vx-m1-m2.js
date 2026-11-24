// Visual adventure: framework (map, backpack, level, migration) + chapters 1 and 2. Runs the NEW (non-legacy) interface.
process.env.CONF_URL = 'http://localhost:8123/scientific-conference.html';
const { open, ok, done, overflow } = require('./helpers');
const U = 'http://localhost:8123/scientific-conference.html';
(async () => {
  let { browser, page: p, errors } = await open({ reduced: true });
  console.log('M1: framework');
  ok((await p.locator('.vx-scene').count()) === 1 && (await p.locator('.vx-drosie img').getAttribute('alt')).startsWith('Drosie'), 'scene and Drosie companion render');
  ok((await p.evaluate(() => DC.vx.level())) === 'explorer', 'default level is Explorer');
  ok((await p.locator('#vxLevel button[aria-pressed=true]').innerText()) === 'Explorer', 'level switch shows Explorer');
  ok((await p.locator('#btnPack').innerText()).includes('0'), 'backpack starts empty');
  await p.locator('#btnMap').click();
  ok((await p.locator('#dlg[open] .vx-node').count()) === 10, 'map dialog has 10 places');
  ok((await p.locator('#dlg .vx-node.lock').count()) === 9 && (await p.locator('#dlg .vx-node.cur').count()) === 1, 'map: only place 1 is open, others show locked');
  ok((await p.locator('#dlg .vx-maplist button').count()) === 10, 'map has a text/list alternative with 10 entries');
  const lockedLabel = await p.locator('#dlg .vx-node.lock').first().getAttribute('aria-label');
  ok(/locked/.test(lockedLabel), 'locked places are announced as locked (not only by colour): ' + lockedLabel);
  await p.locator('#dlg .vx-node.lock').first().click({ force: true });
  ok((await p.locator('#chTitle').innerText()) === 'The Conference Invitation', 'clicking a locked place does not navigate');
  await p.keyboard.press('Escape');
  await p.locator('#btnPack').click(); ok((await p.locator('#dlg .vx-card.locked').count()) === 10, 'backpack shows 10 locked card slots'); await p.keyboard.press('Escape');

  console.log('M2 chapter 1: envelope -> conference -> badge -> adventure');
  ok((await p.locator('[data-act=c1open]').count()) >= 1, 'a meaningful visual action is available immediately (the envelope)');
  const words0 = await p.evaluate(() => (document.querySelector('#stage').innerText.match(/\S+/g) || []).length);
  await p.locator('.vx-env').click();
  ok((await p.locator('.vx-invite').innerText()).includes('First Scientific Conference'), 'envelope opens and reveals the invitation');
  ok(await p.locator('[data-act=c1vig]').count() === 3, 'three clickable conference scenes');
  await p.locator('[data-act=c1vig][data-k=share]').click(); await p.locator('[data-act=c1vig][data-k=discuss]').click(); await p.locator('[data-act=c1vig][data-k=audience]').click();
  ok((await p.locator('.vx-tool.done').count()) === 3 && (await p.locator('#c1vig svg').count()) === 1, 'each scene shows an illustration and is marked done');
  ok((await p.locator('details.vx-learn summary').innerText()).includes('peer reviewed'), 'peer-review honesty is kept as optional Learn more');
  ok(await p.locator('[data-act=c1step][data-i="3"]').isDisabled(), 'adventure step is locked until a badge name exists');
  await p.locator('[data-act=c1step][data-i="2"]').click();
  await p.fill('#nick', 'me@example.com'); ok((await p.inputValue('#nick')) === '' && (await p.locator('#nickWarn').innerText()).length > 0, 'personal info (email) is refused');
  await p.fill('#nick', 'Zoe'); await p.locator('[data-act=c1color][data-v="#b5483c"]').click(); await p.locator('[data-act=c1icon]').nth(2).click();
  ok((await p.locator('#c1badge .badge').getAttribute('style')).includes('#b5483c') && (await p.locator('#c1badge .nm').innerText()) === 'Zoe' && (await p.locator('#c1badge .ic').innerText()) === '🌱', 'badge updates live with colour, picture and nickname');
  await p.locator('[data-act=c1anon]').click(); ok((await p.locator('#c1badge .nm').innerText()) === 'Young Researcher', 'anonymous option changes the badge');
  await p.locator('[data-act=c1anon]').click();
  await p.locator('[data-act=c1step][data-i="3"]').click();
  ok(!(await p.evaluate(() => DC.isDone(1))), 'not complete until an adventure style is chosen');
  await p.locator('[data-act=c1mode][data-v=guided]').click();
  ok(await p.evaluate(() => DC.isDone(1)), 'chapter 1 complete (same completion rule as before)');
  ok((await p.locator('.vx-drosie').getAttribute('data-state')) === 'celebrate', 'Drosie celebrates');
  await p.locator('[data-act=c1level][data-v=researcher]').click();
  ok((await p.locator('#vxLevel button[aria-pressed=true]').innerText()) === 'Researcher' && (await p.evaluate(() => DC.state.ui.level)) === 'researcher', 'level can be changed in chapter 1 and the header follows');
  await p.locator('[data-act=c1level][data-v=explorer]').click();
  await p.reload();
  ok((await p.evaluate(() => DC.state.nick === 'Zoe' && DC.state.mode === 'guided')) && (await p.evaluate(() => DC.isDone(1))), 'chapter 1 progress persists');
  await p.locator('.nav-foot .btn.primary').click();
  ok((await p.locator('#chTitle').innerText()) === 'Choose Your Research Path', 'Next place opens the doors');

  console.log('M2 chapter 2: doors, Path A');
  ok((await p.locator('.vx-hot').count()) === 2, 'two clickable doors in the scene');
  ok((await p.locator('.vx-tool').count()) === 2, 'plus a tray alternative for the doors (keyboard/phone)');
  await p.locator('.vx-tool[data-v=A]').click();
  ok((await p.locator('#c2panel svg[aria-label*="25 °C"]').count()) === 1 && (await p.locator('#c2panel svg[aria-label*="18 °C"]').count()) === 1, 'Path A preview shows the 25 °C and 18 °C lab rooms');
  await p.locator('[data-act=c2pred][data-i="0"]').click(); await p.waitForTimeout(150); ok((await p.locator('#sr').innerText()).includes('idea'), 'wrong prediction card gets an explanation (announced)');
  await p.locator('[data-act=c2pred][data-i="1"]').click(); ok(await p.evaluate(() => DC.state.det.c2hyp.ok), 'right prediction card recorded');
  ok(!(await p.evaluate(() => DC.isDone(2))), 'not complete before the simulation is stamped');
  await p.locator('[data-act=c2seal]').click();
  ok((await p.evaluate(() => DC.state.path === 'A' && DC.state.a.acked)) && (await p.evaluate(() => DC.isDone(2))), 'stamping the SIMULATION seal chooses Path A and completes chapter 2');
  ok((await p.locator('#btnPack').innerText()).includes('2'), 'backpack now holds the Question and Prediction cards');

  console.log('M2 chapter 2: Path B (own project) and repeated path switching');
  await p.locator('.vx-tool[data-v=B]').click();
  await p.fill('#bt', 'Ants at my door'); await p.locator('.vx-btn[data-act=c2bstep][data-i="1"]').click(); await p.locator('[data-act=c2type][data-v=observation]').click(); await p.locator('.vx-btn[data-act=c2bstep][data-i="2"]').click();
  await p.locator('[data-act=c2starter]').first().click(); await p.keyboard.type('ants walk by my door');
  ok(await p.evaluate(() => DC.state.path === 'B' && DC.state.b.f.title === 'Ants at my door' && DC.state.b.type === 'observation' && DC.state.b.f.question.startsWith('What happens when')), 'Path B built step by step (name, kind, question) without any invented data');
  ok(await p.evaluate(() => DC.isDone(2)), 'chapter 2 complete on Path B');
  ok(await p.evaluate(() => DC.state.a.acked === true && DC.state.b.log.length === 1 && DC.state.b.log[0].label === ''), 'Path A flags kept; Path B has no fabricated data');
  // switch A -> B -> A -> B repeatedly with distinct per-path work
  await p.evaluate(() => { DC.state.abs.bg = 'B background words that are long enough here.'; DC.saveNow(); });
  for (let i = 0; i < 3; i++) {
    await p.locator('.vx-tool[data-v=A]').click(); await p.locator('[data-act=c2seal]').click();
    const a = await p.evaluate(() => ({ path: DC.state.path, bg: DC.state.abs.bg })); if (i === 0) await p.evaluate(() => { DC.state.abs.bg = 'A background words that are long enough here.'; DC.saveNow(); });
    await p.locator('.vx-tool[data-v=B]').click(); await p.locator('.vx-step[data-act=c2bstep][data-i="0"]').click();
    const b = await p.evaluate(() => ({ path: DC.state.path, bg: DC.state.abs.bg, title: DC.state.b.f.title }));
    ok(a.path === 'A' && b.path === 'B' && /^B background/.test(b.bg) && b.title === 'Ants at my door', `switch round ${i + 1}: Path B work restored, nothing from Path A leaked (${b.bg.slice(0, 12)})`);
  }
  ok(errors.length === 0, 'no console errors ' + errors.join('|'));
  await browser.close();

  console.log('migration: an old (pre-redesign) save loads, keeps its progress and does not replay card animations');
  ({ browser, page: p, errors } = await open({ reduced: false, init: () => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); const old = { v: 1, nick: 'Old', anon: false, mode: 'guided', path: 'A', cur: 3, badge: { color: '#1d5a5a', icon: '🔬' }, checked: false, a: { acked: true, setup: { temp: 'changed', count: 'measured', vial: 'same', nflies: 'same', tod: 'same', taps: 'same' }, ran: { control: [1, 1, 1, 1, 1], cool: [0, 0, 0, 0, 0] }, rec: { control: [7, 8, 6, 8, 7], cool: [4, 5, 3, 5, 4] }, varQ: null }, det: { c3var: { sel: 1, ok: true } } }; localStorage.setItem('drosieConference.v1', JSON.stringify(old)); } } }));
  await p.waitForTimeout(600);
  ok((await p.evaluate(() => DC.state.nick === 'Old' && DC.state.a.rec.control.join() === '7,8,6,8,7' && DC.state.a.rec.cool.join() === '4,5,3,5,4')), 'old save: nickname and the exact dataset are intact');
  ok(await p.evaluate(() => DC.state.ui && DC.state.ui.level === 'explorer' && typeof DC.state.ui.seen === 'object'), 'old save gains the new ui defaults');
  ok((await p.locator('.vx-fly').count()) === 0 && (await p.locator('.vx-toast').count()) === 0, 'earned cards from old progress are added silently (no replayed animations)');
  ok((await p.locator('#btnPack').innerText()).replace(/\D/g, '') !== '' && +(await p.locator('#btnPack .vx-count').innerText()) >= 3, 'backpack reflects old progress (question, prediction, methods, data...)');
  ok(errors.length === 0, 'no console errors ' + errors.join('|')); await browser.close();

  console.log('layout at phone, tablet, desktop');
  for (const w of [320, 390, 768, 1280]) {
    ({ browser, page: p, errors } = await open({ reduced: true, w }));
    for (const act of [null, 'open']) { if (act) await p.locator('.vx-env').click(); ok((await overflow(p)) <= 0, `chapter 1 ${act || 'start'} @${w}px: no horizontal overflow`); }
    await p.evaluate(() => { DC.state.mode = 'guided'; DC.state.nick = 'T'; DC.saveNow(); }); await p.goto(U + '#ch2'); await p.reload(); await p.locator('.vx-tool[data-v=A]').click();
    ok((await overflow(p)) <= 0, `chapter 2 Path A preview @${w}px: no horizontal overflow`);
    ok(errors.length === 0, `@${w}: no console errors ` + errors.join('|')); await browser.close();
  }
  done();
})().catch((e) => { console.error(e); process.exit(1); });
