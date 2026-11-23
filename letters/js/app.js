/*
 * LETTERS FROM DROSIE: experience controller
 * Scenes: room → envelope → letter (+ keepsake). Animations use the Web Animations
 * API (transform/opacity only) so they can be skipped, shortened for reduced
 * motion, and awaited in sequence.
 */
(function () {
  'use strict';

  const L = window.DROSIE_LETTER;
  const Sfx = window.DrosieSfx;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------- preferences (minimal, non-identifying) ---------------- */
  const STORE = 'drosie-letters:v1';
  const prefs = Object.assign({ sound: true, ts: 1, opened: false }, safeLoad());
  function safeLoad() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function savePrefs() { try { localStorage.setItem(STORE, JSON.stringify(prefs)); } catch (e) { /* storage unavailable: fine */ } }

  /* ---------------- motion helpers ---------------- */
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = mq.matches;
  mq.addEventListener?.('change', e => { reduce = e.matches; document.documentElement.classList.toggle('reduce-motion', reduce); });
  document.documentElement.classList.toggle('reduce-motion', reduce);
  let seq = 0;                 // sequence token: bumping it aborts a running sequence
  const live = new Set();      // animations we started (so Skip can stop them)
  function anim(el, frames, opts = {}) {
    if (!el) return Promise.resolve();
    const o = Object.assign({ fill: 'forwards', easing: 'cubic-bezier(.22,.61,.36,1)' }, opts);
    if (reduce) { o.duration = 1; o.delay = 0; }
    const a = el.animate(frames, o);
    live.add(a);
    return a.finished.then(() => live.delete(a), () => live.delete(a)).then(() => a);
  }
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  class Aborted extends Error {}
  function guard(token) { if (token !== seq) throw new Aborted(); }

  /* ---------------- elements ---------------- */
  const body = document.body;
  const scenes = { room: $('#scene-room'), envelope: $('#scene-envelope'), letter: $('#scene-letter') };
  const stage = $('#stage'), viewport = $('.room-viewport');
  const door = $('#mb-door'), mbEnv = $('.mb-envelope'), mailbox = $('#mailbox');
  const envelope = $('#envelope'), flap = $('#env-flap'), envLetter = $('#env-letter');
  const sealTop = $('.seal-top'), sealBottom = $('.seal-bottom'), sealBtn = $('#seal-button');
  const letterEl = $('#letter'), pagesEl = $('#pages'), foldSheet = $('#fold-sheet');
  const frame = $('#drosie-frame'), say = $('#companion-say');
  const btn = { read: $('#btn-read'), pause: $('#btn-pause'), resume: $('#btn-resume'), replay: $('#btn-replay'), mute: $('#btn-mute'), silent: $('#btn-silent'), reveal: $('#btn-reveal') };

  /* ================================================================
     Content rendering
     ================================================================ */
  const splitPhrases = window.DrosiePhrases.split;
  const phrases = [];
  function renderLetter() {
    $('#letter-no').textContent = L.number;
    $('#letter-title').textContent = L.title;
    $('#letter-sub').textContent = L.subtitle;
    $('#draft-note').hidden = !L.draft;
    $('.env-address .to').textContent = L.envelope.to;
    $('.env-address .where').textContent = L.envelope.where;
    $('.env-address .from').textContent = L.envelope.from;
    pagesEl.innerHTML = '';
    phrases.length = 0;
    L.pages.forEach((page, pi) => {
      const sec = document.createElement('section');
      sec.className = 'page';
      sec.setAttribute('aria-label', `Page ${pi + 1} of ${L.pages.length}`);
      sec.dataset.page = pi;
      page.forEach((block, bi) => {
        const p = document.createElement('p');
        p.className = `block block-${block.type}`;
        const parts = splitPhrases(block.text);
        parts.forEach((txt, si) => {
          const span = document.createElement('span');
          span.className = 'phrase';
          const id = `p${pi + 1}-b${bi + 1}-s${si + 1}`;
          span.dataset.id = id;
          span.dataset.i = phrases.length;
          // words, with character offsets for speech-boundary highlighting
          let ci = 0;
          txt.split(/(\s+)/).forEach(tok => {
            if (/^\s+$/.test(tok)) span.appendChild(document.createTextNode(tok));
            else if (tok) { const w = document.createElement('span'); w.className = 'w'; w.dataset.ci = ci; w.textContent = tok; span.appendChild(w); }
            ci += tok.length;
          });
          p.appendChild(span);
          if (si < parts.length - 1) p.appendChild(document.createTextNode(block.type === 'closing' ? '\n' : ' '));
          if (block.type === 'closing' && si < parts.length - 1) p.appendChild(document.createElement('br'));
          phrases.push({ id, page: pi, text: txt, speak: txt.replace(/^P\.S\./, 'P.S.,'), el: span, block: p, blockEnd: si === parts.length - 1, moment: !!block.moment, type: block.type });
        });
        sec.appendChild(p);
      });
      pagesEl.appendChild(sec);
    });
    $('#page-dots').innerHTML = L.pages.map((_, i) => `<li><button type="button" data-page="${i}" aria-label="Go to page ${i + 1}"></button></li>`).join('');
    $$('#page-dots button').forEach(b => b.addEventListener('click', () => goToPage(+b.dataset.page, true)));
    // keepsake text
    $('#note-heading').textContent = L.keepsake.heading;
    $('#note-lines').innerHTML = L.keepsake.lines.map(l => `<p class="reveal">${escapeHTML(l)}</p>`).join('');
    $('#note-signoff').textContent = L.keepsake.signoff;
    $('#note-sign').textContent = L.keepsake.signature;
    ['#note-heading', '#note-signoff', '#note-sign'].forEach(s => $(s).classList.add('reveal'));
  }
  function escapeHTML(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* ================================================================
     Wax seal artwork (generated once, shared by both halves)
     ================================================================ */
  function sealSVG() {
    return `<svg class="seal-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path d="M50 4 C60 3 66 8 72 7 C80 9 86 16 90 23 C95 30 92 37 96 45 C99 54 94 60 95 67 C94 76 86 81 82 88 C75 94 67 92 60 96 C51 99 45 95 38 96 C29 96 23 90 17 86 C10 80 9 73 6 66 C2 58 5 50 3 42 C4 33 10 27 14 20 C20 12 28 10 35 7 C40 5 45 5 50 4Z" fill="url(#wax)" filter="url(#wax-texture)"/>
      <path d="M88 70 c4 2 6 7 3 10 c-3 2 -6 -2 -5 -6z M10 30 c-4 -1 -7 3 -5 6 c2 3 6 0 6 -3z" fill="#5a2142"/>
      <circle cx="50" cy="50" r="31" fill="none" stroke="#3b1229" stroke-width="2.4" opacity=".55"/>
      <circle cx="50" cy="50" r="31" fill="none" stroke="#b56a92" stroke-width="1" opacity=".45" transform="translate(-.8 -.8)"/>
      <circle cx="50" cy="50" r="27" fill="#5e2445" opacity=".55"/>
      <use href="#wing-mark" x="31" y="30" width="38" height="38" fill="#b0739a" opacity=".55" transform="translate(-.7 -.9)"/>
      <use href="#wing-mark" x="31" y="30" width="38" height="38" fill="#3b1229" opacity=".9"/>
      <ellipse cx="36" cy="26" rx="14" ry="7" fill="#fff" opacity=".22" transform="rotate(-28 36 26)"/>
      <ellipse cx="30" cy="34" rx="4" ry="2.4" fill="#fff" opacity=".35" transform="rotate(-35 30 34)"/>
    </svg>`;
  }

  /* ================================================================
     Room: stage fitting and dust
     ================================================================ */
  function fitStage() {
    const vw = window.innerWidth, vh = window.innerHeight;
    let s = Math.max(vw / 1600, vh / 1000);
    s = Math.min(s, vw / 760);
    const w = 1600 * s, h = 1000 * s;
    let x = vw / 2 - 800 * s;
    x = w >= vw ? Math.min(0, Math.max(vw - w, x)) : (vw - w) / 2;
    let y = vh * 0.44 - 615 * s;
    if (h >= vh) y = Math.min(0, Math.max(vh - h, y));
    stage.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    const split = y + 640 * s;
    viewport.style.background = `linear-gradient(180deg, #e3dac3 0 ${split}px, #7d4b2b ${split}px 100%)`;
  }
  function makeDust() {
    const d = $('.dust');
    let html = '';
    for (let i = 0; i < 26; i++) {
      const t = Math.random();
      const x = 200 + t * 700 + Math.random() * 160, y = 120 + t * 700 + Math.random() * 120;
      html += `<i style="left:${x}px;top:${y}px;--d:${10 + Math.random() * 12}s;--delay:${-Math.random() * 20}s;--dx:${(Math.random() * 80 - 30).toFixed(0)}px;--dy:${(60 + Math.random() * 120).toFixed(0)}px;--o:${(.35 + Math.random() * .5).toFixed(2)};transform:scale(${(.5 + Math.random() * .9).toFixed(2)})"></i>`;
    }
    d.innerHTML = html;
  }

  /* ================================================================
     Scene control
     ================================================================ */
  function setScene(name) {
    body.dataset.scene = name;
    for (const [k, el] of Object.entries(scenes)) el.hidden = k !== name;
  }
  function resetEnvelope() {
    for (const el of [envelope, flap, envLetter, sealTop, sealBottom, mbEnv, door, scenes.envelope]) el.getAnimations().forEach(a => a.cancel());
    flap.style.zIndex = ''; envLetter.style.visibility = ''; envelope.classList.remove('ready');
    sealBtn.disabled = false; sealBtn.hidden = false;
    $('#env-hint').textContent = 'Touch the wax seal to open your letter.';
  }
  function resetRoom() {
    mailbox.classList.remove('opened');
    for (const el of [door, mbEnv]) el.getAnimations().forEach(a => a.cancel());
    mbEnv.style.zIndex = '';
  }

  /* ---------------- Scene 1 → 2: mailbox ---------------- */
  async function openMailbox() {
    if (body.classList.contains('sequence-running')) return;
    const my = ++seq;
    body.classList.add('sequence-running');
    try {
      resetEnvelope();
      Sfx.play('hinge');
      mailbox.classList.add('opened');
      await anim(door, [
        { transform: 'rotateX(0deg)' },
        { transform: 'rotateX(-118deg)', offset: .78 },
        { transform: 'rotateX(-104deg)', offset: .9 },
        { transform: 'rotateX(-110deg)' }
      ], { duration: 1500, easing: 'cubic-bezier(.45,.05,.35,1)' });
      guard(my);
      await wait(250); guard(my);
      Sfx.play('slide');
      mbEnv.style.zIndex = 5;
      await anim(mbEnv, [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(46px) scale(1.18)', offset: .55 },
        { transform: 'translateY(118px) scale(1.42) rotate(-2deg)' }
      ], { duration: 1100, easing: 'cubic-bezier(.3,.1,.25,1)' });
      guard(my);
      await wait(200); guard(my);
      await toEnvelopeScene(my);
    } catch (e) {
      if (!(e instanceof Aborted)) { console.error(e); showLetterDirect(); }
    } finally {
      if (my === seq) body.classList.remove('sequence-running');
    }
  }

  async function toEnvelopeScene(my) {
    const from = mbEnv.getBoundingClientRect();
    scenes.envelope.hidden = false;
    body.dataset.scene = 'envelope';
    const to = envelope.getBoundingClientRect();
    const sx = from.width / to.width, sy = from.height / to.height;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    anim(scenes.envelope, [{ opacity: 0 }, { opacity: 1 }], { duration: 650, easing: 'ease-out' });
    await anim(envelope, [
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) rotate(-2deg)` },
      { transform: 'translate(0,0) scale(1) rotate(-1.2deg)' }
    ], { duration: 1000, easing: 'cubic-bezier(.2,.7,.2,1)' });
    guard(my);
    envelope.getAnimations().forEach(a => a.cancel());
    scenes.room.hidden = true;
    envelope.classList.add('ready');
    sealBtn.focus({ preventScroll: true });
  }

  /* ---------------- Scene 2 → 3: seal, flap, letter, unfold ---------------- */
  async function breakSeal() {
    if (sealBtn.disabled) return;
    const my = ++seq;
    sealBtn.disabled = true;
    body.classList.add('sequence-running');
    envelope.classList.remove('ready');
    $('#env-hint').textContent = '';
    try {
      Sfx.play('crack');
      await Promise.all([
        anim(sealTop, [{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(-50%,-53%) rotate(-5deg)' }], { duration: 260, easing: 'cubic-bezier(.2,1.6,.4,1)' }),
        anim(sealBottom, [{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(-50%,-46%) rotate(4deg)' }], { duration: 260, easing: 'cubic-bezier(.2,1.6,.4,1)' }),
        anim(envelope, [{ transform: 'rotate(-1.2deg)' }, { transform: 'rotate(-1.2deg) translateY(2px)' }, { transform: 'rotate(-1.2deg)' }], { duration: 220 })
      ]);
      guard(my);
      await wait(260); guard(my);
      Sfx.play('paper');
      const flapAnim = anim(flap, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(180deg)' }], { duration: 1050, easing: 'cubic-bezier(.45,.05,.3,1)' });
      setTimeout(() => { if (my === seq) flap.style.zIndex = 0; }, reduce ? 0 : 520);
      sealBottom.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduce ? 1 : 700, delay: reduce ? 0 : 500, fill: 'forwards' });
      await flapAnim; guard(my);
      Sfx.play('slide');
      await anim(envLetter, [{ transform: 'translateY(0)' }, { transform: 'translateY(-58%)' }], { duration: 1050, easing: 'cubic-bezier(.3,.05,.25,1)' });
      guard(my);
      await toLetterScene(my);
    } catch (e) {
      if (!(e instanceof Aborted)) { console.error(e); showLetterDirect(); }
    } finally {
      if (my === seq) body.classList.remove('sequence-running');
    }
  }

  function prepareLetterScene() {
    window.scrollTo(0, 0);
    scenes.letter.hidden = false;
    goToPage(0, false, true);
    applyNarrationVisuals(false);
  }

  async function toLetterScene(my) {
    const from = envLetter.getBoundingClientRect();
    prepareLetterScene();
    body.dataset.scene = 'letter';   // final layout (sticky top bar) before measuring the target
    scenes.room.hidden = true;
    letterEl.style.opacity = 0;
    const S = letterEl.getBoundingClientRect();
    // fold sheet becomes a fixed overlay above everything for the hand-off
    Object.assign(foldSheet.style, { position: 'fixed', left: S.left + 'px', top: S.top + 'px', width: S.width + 'px', height: S.height + 'px', zIndex: 40 });
    foldSheet.classList.add('active');
    const p1 = $('.fold.p1', foldSheet), p3 = $('.fold.p3', foldSheet);
    p1.style.transform = 'rotateX(-180deg) translateZ(-2px)';
    p3.style.transform = 'rotateX(180deg) translateZ(-1px)';
    envLetter.style.visibility = 'hidden';
    const sx = from.width / S.width, sy = from.height / (S.height / 3);
    const tx = from.left - S.left, ty = from.top - S.top - (S.height / 3) * sy;
    anim(scenes.envelope, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease-in' });
    anim(envelope, [{ transform: 'rotate(-1.2deg)' }, { transform: 'rotate(-1.2deg) translateY(60px) scale(.96)' }], { duration: 700 });
    await anim(foldSheet, [
      { transform: `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})` },
      { transform: 'translate(0,0) scale(1,1)' }
    ], { duration: 1050, easing: 'cubic-bezier(.2,.7,.2,1)' });
    guard(my);
    setScene('letter');
    Sfx.play('paper');
    await anim(p1, [{ transform: 'rotateX(-180deg) translateZ(-2px)' }, { transform: 'rotateX(0deg) translateZ(0)' }], { duration: 900, easing: 'cubic-bezier(.4,.1,.25,1)' });
    guard(my);
    Sfx.play('paper');
    await anim(p3, [{ transform: 'rotateX(180deg) translateZ(-1px)' }, { transform: 'rotateX(0deg) translateZ(0)' }], { duration: 900, easing: 'cubic-bezier(.4,.1,.25,1)' });
    guard(my);
    await Promise.all([
      anim(letterEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: 'none' }),
      anim(foldSheet, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 })
    ]);
    finishLetterEntrance();
  }

  function finishLetterEntrance() {
    foldSheet.classList.remove('active');
    foldSheet.getAnimations().forEach(a => a.cancel());
    $$('.fold', foldSheet).forEach(f => { f.getAnimations().forEach(a => a.cancel()); f.style.transform = ''; });
    foldSheet.removeAttribute('style');
    letterEl.style.opacity = '';
    setScene('letter');
    scenes.envelope.getAnimations().forEach(a => a.cancel());
    resetEnvelope(); resetRoom();
    prefs.opened = true; savePrefs();
    if (location.hash !== '#letter') history.pushState({ scene: 'letter' }, '', '#letter');
    say.textContent = 'Would you like me to read it to you?';
    $('#letter-title').setAttribute('tabindex', '-1');
    $('#letter-title').focus({ preventScroll: true });
    body.classList.remove('sequence-running');
    if (onLastPage()) maybeFinishSilently();
  }

  /** Jump straight to the open letter (Skip animation, reopen, reload with #letter). */
  function showLetterDirect(withUnfold = false) {
    seq++;
    live.forEach(a => { try { a.cancel(); } catch (e) { /* ignore */ } });
    live.clear();
    body.classList.remove('sequence-running');
    prepareLetterScene();
    setScene('letter');
    if (withUnfold && !reduce) {
      const my = seq;
      const S = letterEl.getBoundingClientRect();
      letterEl.style.opacity = 0;
      Object.assign(foldSheet.style, { position: 'absolute', left: 0, top: 0, width: S.width + 'px', height: S.height + 'px', zIndex: 5 });
      foldSheet.classList.add('active');
      const p1 = $('.fold.p1', foldSheet), p3 = $('.fold.p3', foldSheet);
      (async () => {
        try {
          Sfx.play('paper');
          await anim(p1, [{ transform: 'rotateX(-180deg) translateZ(-2px)' }, { transform: 'rotateX(0deg)' }], { duration: 750 }); guard(my);
          await anim(p3, [{ transform: 'rotateX(180deg) translateZ(-1px)' }, { transform: 'rotateX(0deg)' }], { duration: 750 }); guard(my);
          await anim(letterEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 450, fill: 'none' });
        } catch (e) { /* aborted */ }
        finishLetterEntrance();
      })();
    } else finishLetterEntrance();
  }

  /* ---------------- back to the room ---------------- */
  async function showRoom(fromLetter) {
    seq++;
    narrator?.stop();
    closeKeepsake(false);
    setScene('room');
    fitStage();
    $('#reopen-letter').hidden = !prefs.opened;
    if (fromLetter && !reduce) {
      // the letter goes back in; the little door closes
      mailbox.classList.add('opened');
      door.animate([{ transform: 'rotateX(-110deg)' }, { transform: 'rotateX(-110deg)' }], { duration: 400, fill: 'forwards' });
      await wait(450);
      Sfx.play('hinge');
      await anim(door, [{ transform: 'rotateX(-110deg)' }, { transform: 'rotateX(4deg)', offset: .85 }, { transform: 'rotateX(0deg)' }], { duration: 1100, easing: 'cubic-bezier(.5,0,.3,1)' });
    }
    resetRoom();
    ($('#reopen-letter').hidden ? $('#open-mailbox') : $('#reopen-letter')).focus({ preventScroll: true });
  }

  /* ================================================================
     Letter: pages
     ================================================================ */
  let page = 0;
  const onLastPage = () => page === L.pages.length - 1;
  function goToPage(n, userInitiated = false, instant = false) {
    n = Math.max(0, Math.min(L.pages.length - 1, n));
    const pages = $$('.page', pagesEl);
    const old = pages[page], next = pages[n];
    const dir = n > page ? 1 : -1;
    const changed = n !== page;
    page = n;
    pages.forEach((p, i) => p.setAttribute('aria-hidden', i === n ? 'false' : 'true'));
    if (changed && !instant && !reduce) {
      Sfx.play('page');
      old.style.visibility = 'visible';
      anim(old, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-24 * dir}px)` }], { duration: 380, fill: 'none' }).then(() => { old.style.visibility = ''; });
      anim(next, [{ opacity: 0, transform: `translateX(${24 * dir}px)` }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 160, fill: 'backwards' });
    }
    $('#page-no').textContent = `${n + 1}`;
    $('#page-no').setAttribute('aria-label', `Page ${n + 1} of ${L.pages.length}`);
    $('#prev-page').disabled = n === 0;
    $('#next-page').disabled = n === L.pages.length - 1;
    $$('#page-dots button').forEach((b, i) => { if (i === n) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    updateKeepsakeTab();
    if (userInitiated && narrator && (narrator.state === 'playing' || narrator.state === 'paused')) {
      markReadUntil(phrases.findIndex(p => p.page === n));
      narrator.seekToPage(n);
    }
    if (onLastPage() && !narrating()) maybeFinishSilently();
    if (userInitiated) announce(`Page ${n + 1} of ${L.pages.length}`);
  }

  /* ================================================================
     Narration ↔ letter
     ================================================================ */
  let narrator = null;
  let finished = false;
  const narrating = () => letterEl.classList.contains('narrating') || (narrator && narrator.state === 'playing');

  function applyNarrationVisuals(on) {
    letterEl.classList.toggle('narrating', on);
    btn.reveal.hidden = !on;
    if (!on) phrases.forEach(p => p.el.classList.remove('current'));
  }
  function markReadUntil(i) {
    phrases.forEach((p, k) => {
      p.el.classList.toggle('read', k < i);
      p.el.classList.remove('current');
      $$('.w.now', p.el).forEach(w => w.classList.remove('now'));
    });
  }
  let momentTimer = 0;
  function onPhrase(i) {
    const ph = phrases[i];
    if (!ph) return;
    markReadUntil(i);
    ph.el.classList.add('read', 'current');
    if (ph.page !== page) goToPage(ph.page, false);
    say.textContent = ph.type === 'signature' ? 'That’s me!' : `Reading page ${ph.page + 1}…`;
    if (ph.moment) {
      frame.classList.remove('moment'); void frame.offsetWidth; frame.classList.add('moment');
      clearTimeout(momentTimer); momentTimer = setTimeout(() => frame.classList.remove('moment'), 2600);
    }
    // the ink drop marks Drosie signing her name (also if playback jumps past it)
    const sigIdx = phrases.findIndex(p => p.type === 'signature');
    if (sigIdx >= 0 && i >= sigIdx && !inkDone) setTimeout(() => inkDrop(), reduce ? 0 : 350);
    const r = ph.el.getBoundingClientRect();
    if (r.top < 80 || r.bottom > window.innerHeight - 40) ph.el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }
  function onWord(i, charIndex) {
    const ph = phrases[i]; if (!ph) return;
    let target = null;
    $$('.w', ph.el).forEach(w => { w.classList.remove('now'); if (+w.dataset.ci <= charIndex) target = w; });
    target?.classList.add('now');
  }
  function onState(s) {
    frame.classList.toggle('speaking', s === 'playing');
    btn.pause.disabled = s !== 'playing';
    btn.resume.disabled = s !== 'paused';
    btn.replay.disabled = s === 'idle';
    btn.read.disabled = s === 'playing' || s === 'paused';
    if (s === 'paused') say.textContent = 'I’ll wait right here.';
  }
  function onEnd() {
    markReadUntil(phrases.length);
    applyNarrationVisuals(false);
    finished = true;
    if (!inkDone) inkDrop();
    say.textContent = 'There’s something tucked inside…';
    btn.read.disabled = false;
    updateKeepsakeTab(true);
  }
  function onNotice(msg) { notice(msg); }
  function onUnavailable() { readSilently(true); updateVoiceNote(); }

  async function setupNarration() {
    narrator = new window.DrosieNarration.Narrator({ letter: L, phrases, onPhrase, onWord, onState, onEnd, onNotice, onUnavailable });
    updateVoiceNote('Getting Drosie’s voice ready…');
    try { await narrator.init(); } catch (e) { narrator.mode = 'none'; }
    updateVoiceNote();
    if (narrator.mode === 'none') { btn.read.disabled = false; }
  }
  function updateVoiceNote(text) {
    const n = $('#voice-note');
    n.textContent = text || (narrator ? narrator.describe() : '');
  }

  function readToMe() {
    if (!narrator) return;
    if (narrator.mode === 'none') { notice('Reading aloud is not available on this device, so the whole letter is shown for you to read.'); readSilently(true); return; }
    finished = false;
    updateKeepsakeTab();
    const start = phrases.findIndex(p => p.page === page);
    markReadUntil(start);
    applyNarrationVisuals(narrator.mode !== 'audio-nocues');
    narrator.play(start);
  }
  function readSilently(quiet) {
    narrator?.stop();
    markReadUntil(0);
    applyNarrationVisuals(false);
    say.textContent = 'Take your time. I’ll read along quietly with you.';
    if (!quiet) announce('Narration stopped. All the words are shown.');
    btn.read.disabled = false; btn.pause.disabled = true; btn.resume.disabled = true;
    if (onLastPage()) maybeFinishSilently();
  }
  function revealAll() {
    letterEl.classList.remove('narrating');
    btn.reveal.hidden = true;
    announce('All the words are shown.');
  }

  /* ================================================================
     The ink drop
     ================================================================ */
  let inkDone = false;
  function inkDrop() {
    if (inkDone) return;
    inkDone = true;
    const sigBlock = $('.block-signature', pagesEl);
    if (!sigBlock) return;
    const sigText = $('.phrase', sigBlock);
    const bR = sigBlock.getBoundingClientRect(), tR = sigText.getBoundingClientRect();
    const x = Math.min(tR.right - bR.left + 26, bR.width - 30), y = tR.bottom - bR.top - 6;
    const id = 'ink' + Date.now();
    const wrap = document.createElement('div');
    wrap.className = 'ink-site';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:0;height:0;pointer-events:none;z-index:2;`;
    wrap.innerHTML = `
      <svg class="ink-stain" width="120" height="120" viewBox="-60 -60 120 120" style="position:absolute;left:-60px;top:-60px;overflow:visible">
        <g filter="url(#ink-bleed)" style="mix-blend-mode:multiply">
          <g class="blot" transform="scale(0.0001)">
            <circle r="17" fill="url(#ink-blot)"/>
            <circle cx="15" cy="-9" r="4.5" fill="url(#ink-blot)"/>
            <circle cx="-13" cy="12" r="3" fill="url(#ink-blot)"/>
            <circle cx="21" cy="7" r="2.2" fill="#3d1a2e" opacity=".75"/>
            <circle cx="-22" cy="-6" r="1.6" fill="#3d1a2e" opacity=".7"/>
          </g>
        </g>
        <ellipse class="sheen" cx="-5" cy="-6" rx="6" ry="3.2" fill="#fff" opacity="0" transform="rotate(-25)"/>
      </svg>
      <svg class="ink-pen" width="90" height="200" viewBox="0 0 90 200" style="position:absolute;left:-22px;top:-210px;overflow:visible;opacity:0">
        <g transform="rotate(26 45 170)">
          <rect x="31" y="0" width="28" height="118" rx="12" fill="#2f4a3a"/>
          <rect x="31" y="84" width="28" height="12" fill="#b8954a"/>
          <path d="M33 118 L57 118 L50 160 L45 176 L40 160Z" fill="#cfb06d" stroke="#8a6a2e" stroke-width="1"/>
          <path d="M45 136 L45 172" stroke="#6d5320" stroke-width="1.2"/><circle cx="45" cy="138" r="2.4" fill="#6d5320"/>
        </g>
      </svg>
      <svg class="ink-drop" width="20" height="30" viewBox="-10 -15 20 30" style="position:absolute;left:-10px;top:-38px;overflow:visible;opacity:0">
        <path d="M0 -12 C5 -4 7 2 7 6 C7 10 4 13 0 13 C-4 13 -7 10 -7 6 C-7 2 -5 -4 0 -12Z" fill="#3d1a2e"/>
        <ellipse cx="-2.4" cy="5" rx="1.6" ry="2.6" fill="#fff" opacity=".45"/>
      </svg>`;
    sigBlock.appendChild(wrap);
    const blot = $('.blot', wrap), pen = $('.ink-pen', wrap), drop = $('.ink-drop', wrap), sheen = $('.sheen', wrap);
    if (reduce) { blot.setAttribute('transform', 'scale(1)'); blot.style.opacity = '.9'; return; }
    (async () => {
      // pen arrives above the paper
      await anim(pen, [{ opacity: 0, transform: 'translate(30px,-30px)' }, { opacity: 1, transform: 'translate(0,0)' }], { duration: 700 });
      // drop gathers at the nib (positioned just under the nib tip)
      const tipY = -210 + 176 * 1, dropStartTop = tipY - 2;
      drop.style.top = dropStartTop + 'px';
      await anim(drop, [{ opacity: 0, transform: 'scale(.15, .15)' }, { opacity: 1, transform: 'scale(.7, .9)', offset: .7 }, { opacity: 1, transform: 'scale(.8, 1.15)' }], { duration: 950, easing: 'ease-in-out' });
      // falls with gravity, stretching slightly
      const fall = -dropStartTop - 4;
      await anim(drop, [
        { transform: 'translateY(0) scale(.8, 1.15)' },
        { transform: `translateY(${fall}px) scale(.7, 1.35)` }
      ], { duration: 360, easing: 'cubic-bezier(.55,0,1,.45)' });
      drop.getAnimations().forEach(a => a.cancel());
      drop.style.display = 'none';
      Sfx.play('ink');
      // lands and soaks into the paper
      const blotGrow = blot.animate([
        { transform: 'scale(0.18)' }, { transform: 'scale(.9)', offset: .35 }, { transform: 'scale(1)' }
      ], { duration: 1900, easing: 'cubic-bezier(.15,.8,.25,1)', fill: 'forwards' });
      sheen.animate([{ opacity: 0 }, { opacity: .32, offset: .2 }, { opacity: 0 }], { duration: 2200, fill: 'forwards' });
      anim(pen, [{ opacity: 1, transform: 'translate(0,0)' }, { opacity: 0, transform: 'translate(26px,-40px)' }], { duration: 800, delay: 300 });
      await blotGrow.finished.catch(() => {});
      // drying: slightly lighter, stays as a stain
      blot.animate([{ opacity: 1 }, { opacity: .86 }], { duration: 3000, fill: 'forwards' });
    })().catch(() => { blot.setAttribute('transform', 'scale(1)'); });
  }

  /* ================================================================
     Keepsake
     ================================================================ */
  function maybeFinishSilently() {
    if (narrating()) return;
    finished = true;
    setTimeout(() => { if (onLastPage() && !narrating() && body.dataset.scene === 'letter') { inkDrop(); updateKeepsakeTab(true); } }, reduce ? 0 : 900);
  }
  function updateKeepsakeTab(animate) {
    const tab = $('#keepsake-tab');
    const show = onLastPage() && finished;
    const was = !tab.hidden;
    tab.hidden = !show;
    if (show && !was && animate) { tab.classList.remove('appear'); void tab.offsetWidth; tab.classList.add('appear'); Sfx.play('chime'); }
  }
  let keepsakeReturnFocus = null;
  function openKeepsake() {
    keepsakeReturnFocus = document.activeElement;
    const ov = $('#keepsake');
    ov.hidden = false;
    const note = $('#note'), cover = $('#note-cover');
    note.classList.remove('open');
    cover.hidden = false;
    cover.getAnimations().forEach(a => a.cancel());
    $$('.reveal', note).forEach(r => r.classList.remove('in'));
    $('#keepsake-actions').style.visibility = 'hidden';
    anim($('.keepsake-dialog'), [{ opacity: 0, transform: 'translateY(30px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 600, fill: 'none' });
    cover.focus();
    body.style.overflow = 'hidden';
  }
  async function unfoldNote() {
    const note = $('#note'), cover = $('#note-cover');
    if (note.classList.contains('open')) return;
    note.classList.add('open');
    Sfx.play('paper');
    await anim(cover, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-178deg)' }], { duration: 1300, easing: 'cubic-bezier(.45,.05,.25,1)' });
    cover.hidden = true;
    Sfx.play('chime');
    const items = $$('.reveal', note);
    for (const it of items) { it.classList.add('in'); await wait(260); }
    $('#keepsake-actions').style.visibility = '';
    $('#print-keepsake').focus();
  }
  function closeKeepsake(restoreFocus = true) {
    const ov = $('#keepsake');
    if (ov.hidden) return;
    ov.hidden = true;
    body.style.overflow = '';
    if (restoreFocus) (keepsakeReturnFocus && document.contains(keepsakeReturnFocus) ? keepsakeReturnFocus : $('#keepsake-tab')).focus?.();
  }
  function trapFocus(e) {
    const ov = $('#keepsake');
    if (ov.hidden || e.key !== 'Tab') return;
    const f = $$('button:not([hidden]):not([disabled]), a[href]', ov).filter(el => el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ================================================================
     Printing (US Letter): clean layouts without any controls
     ================================================================ */
  function sprigSVG(cls, w, h) {
    const sym = document.getElementById('sprig');
    return `<svg class="${cls}" width="${w}" height="${h}" viewBox="0 0 60 120" aria-hidden="true">${sym ? sym.innerHTML : ''}</svg>`;
  }
  function printLetter() {
    const root = $('#print-root');
    const blocks = L.pages.flat().map(b => {
      const t = Array.isArray(b.text) ? b.text.join(b.type === 'closing' ? '<br>' : ' ') : escapeHTML(b.text);
      return `<p class="block-${b.type}">${Array.isArray(b.text) ? b.text.map(escapeHTML).join(b.type === 'closing' ? '<br>' : ' ') : t}</p>`;
    }).join('');
    root.innerHTML = `<article class="print-letter">
      <header class="pl-head">${sprigSVG('pl-sprig', 26, 52)}<p class="pl-no">${escapeHTML(L.number)}</p><h1>${escapeHTML(L.title)}</h1><p class="pl-sub">${escapeHTML(L.subtitle)}</p></header>
      <div class="pl-ornament">· · ·</div>${blocks}
      <p class="pl-foot">Letters from Drosie · drosiesworld.com</p></article>`;
    doPrint();
  }
  function printKeepsake() {
    const k = L.keepsake;
    $('#print-root').innerHTML = `<div class="print-keepsake"><div class="pk-card">
      <p class="pk-head">${escapeHTML(k.heading)}</p>${k.lines.map(l => `<p class="pk-line">${escapeHTML(l)}</p>`).join('')}
      <p class="pk-line" style="margin-top:12pt">${escapeHTML(k.signoff)}</p><p class="pk-sign">${escapeHTML(k.signature)}</p>
      <p class="pk-from">A keepsake from Letters from Drosie · drosiesworld.com</p></div></div>`;
    doPrint();
  }
  function doPrint() {
    try { window.print(); }
    catch (e) { notice('Printing is not available here. Try your browser’s Print command, then choose “Save as PDF”.'); }
  }

  /* ================================================================
     Misc UI
     ================================================================ */
  let noticeTimer = 0;
  function notice(msg) {
    const n = $('#notice');
    n.textContent = msg; n.classList.add('show');
    clearTimeout(noticeTimer); noticeTimer = setTimeout(() => n.classList.remove('show'), 7000);
  }
  function announce(msg) { const n = $('#notice'); n.textContent = ''; setTimeout(() => { if (!n.classList.contains('show')) n.textContent = msg; }, 50); }
  const TS = [0.9, 1, 1.12, 1.25, 1.4];
  function applyTextSize() {
    document.documentElement.style.setProperty('--ts', prefs.ts);
    $('#text-smaller').disabled = prefs.ts <= TS[0];
    $('#text-larger').disabled = prefs.ts >= TS[TS.length - 1];
  }
  function stepText(d) {
    const i = Math.max(0, Math.min(TS.length - 1, TS.indexOf(prefs.ts) + d));
    prefs.ts = TS[i] ?? 1; savePrefs(); applyTextSize();
    announce(`Text size ${Math.round(prefs.ts * 100)} percent`);
  }
  function applySound() {
    Sfx.setOn(prefs.sound);
    const b = $('#sound-toggle');
    b.setAttribute('aria-pressed', String(prefs.sound));
    $('.label', b).textContent = prefs.sound ? 'Sounds on' : 'Sounds off';
  }

  /* ================================================================
     Boot
     ================================================================ */
  function boot() {
    renderLetter();
    $('.seal-top').innerHTML = sealSVG();
    $('.seal-bottom').innerHTML = sealSVG();
    makeDust();
    fitStage();
    window.addEventListener('resize', () => { if (!scenes.room.hidden) fitStage(); });
    applyTextSize(); applySound();
    $('#reopen-letter').hidden = !prefs.opened;

    // Drosie image (from the site root). Fall back gracefully if missing.
    const img = $('#drosie-img');
    const missing = () => { img.hidden = true; $('#drosie-missing').hidden = false; console.warn('Drosie image not found at ../images/drosie-mascot-640.webp'); };
    img.addEventListener('error', missing);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) missing();

    // room
    $('#open-mailbox').addEventListener('click', openMailbox);
    mailbox.addEventListener('click', openMailbox);
    $('#reopen-letter').addEventListener('click', () => showLetterDirect(true));
    $('#skip-anim').addEventListener('click', () => showLetterDirect(false));
    // envelope
    sealBtn.addEventListener('click', breakSeal);
    // letter
    $('#prev-page').addEventListener('click', () => goToPage(page - 1, true));
    $('#next-page').addEventListener('click', () => goToPage(page + 1, true));
    $('#back-to-desk').addEventListener('click', () => { if (history.state && history.state.scene === 'letter') history.back(); else showRoom(true); });
    btn.read.addEventListener('click', readToMe);
    btn.pause.addEventListener('click', () => narrator?.pause());
    btn.resume.addEventListener('click', () => narrator?.resume());
    btn.replay.addEventListener('click', () => { finished = false; updateKeepsakeTab(); goToPage(0); markReadUntil(0); applyNarrationVisuals(narrator.mode !== 'audio-nocues'); narrator?.replay(); });
    btn.mute.addEventListener('click', () => {
      const m = btn.mute.getAttribute('aria-pressed') !== 'true';
      btn.mute.setAttribute('aria-pressed', String(m));
      btn.mute.textContent = m ? 'Unmute' : 'Mute';
      narrator?.setMuted(m);
    });
    btn.silent.addEventListener('click', () => readSilently(false));
    btn.reveal.addEventListener('click', revealAll);
    $('#text-smaller').addEventListener('click', () => stepText(-1));
    $('#text-larger').addEventListener('click', () => stepText(1));
    $('#sound-toggle').addEventListener('click', () => { prefs.sound = !prefs.sound; savePrefs(); applySound(); if (prefs.sound) Sfx.play('chime'); });
    // keepsake
    $('#keepsake-tab').addEventListener('click', openKeepsake);
    $('#note-cover').addEventListener('click', unfoldNote);
    $('#keepsake-close').addEventListener('click', () => closeKeepsake());
    $('#keepsake').addEventListener('click', e => { if (e.target.id === 'keepsake') closeKeepsake(); });
    $('#print-keepsake').addEventListener('click', printKeepsake);
    $('#print-letter').addEventListener('click', printLetter);
    $('#read-again').addEventListener('click', () => { closeKeepsake(false); narrator?.stop(); finished = false; goToPage(0, false); markReadUntil(0); applyNarrationVisuals(false); say.textContent = 'Shall we read it again together?'; btn.read.focus(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !$('#keepsake').hidden) { closeKeepsake(); return; }
      trapFocus(e);
      if (body.dataset.scene === 'letter' && $('#keepsake').hidden && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        if (e.key === 'ArrowRight' && !e.altKey) goToPage(page + 1, true);
        if (e.key === 'ArrowLeft' && !e.altKey) goToPage(page - 1, true);
      }
    });
    window.addEventListener('afterprint', () => { $('#print-root').innerHTML = ''; });
    // history: back button returns to the room
    window.addEventListener('popstate', () => {
      if (location.hash === '#letter' && prefs.opened) { if (body.dataset.scene !== 'letter') showLetterDirect(false); }
      else if (body.dataset.scene === 'letter') showRoom(true);
    });

    setupNarration();

    if (location.hash === '#letter' && prefs.opened) showLetterDirect(false);
    else {
      if (location.hash === '#letter') history.replaceState(null, '', location.pathname + location.search);
      setScene('room');
    }
  }

  // expose a tiny surface for automated QA only
  window.__drosieLetters = { get page() { return page; }, get narrator() { return narrator; }, phrases, goToPage, prefs };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
