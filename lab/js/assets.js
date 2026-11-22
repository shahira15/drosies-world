/* assets.js: asset loader + character portrait system.
 * - Reads js/manifest.js. If a character has "provided": true, its real PNG/WebP/SVG art is preloaded and used.
 * - Otherwise the clearly-labelled TEMP vector placeholder from art/chars.js is used.
 * Portraits support: idle bob, blink, talk (mouth/swap), and reaction states (happy, think, celebrate).
 */
(function () {
  'use strict';
  const DW = window.DW, M = DW.manifest, h = DW.h;
  const imgs = {};

  function loadImg(url) {
    return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => { console.warn('[assets] missing', url); res(null); }; i.src = url; });
  }

  DW.assets = {
    async load(cb) {
      const jobs = [];
      for (const cid in M.characters) {
        const c = M.characters[cid];
        if (!c.provided) continue;
        for (const st in c.states) jobs.push({ cid, st, url: c.base + c.states[st] });
      }
      let done = 0;
      for (const j of jobs) { imgs[j.cid + ':' + j.st] = await loadImg(j.url); cb && cb(++done / jobs.length); }
      cb && cb(1);
    },
    img(cid, st) { return imgs[cid + ':' + st] || null; },
  };

  const alias = { maya: { think: 'think', celebrate: 'celebrate', happy: 'happy', talk: 'talk', neutral: 'neutral', idle: 'neutral' }, drosie: { neutral: 'idle', talk: 'idle', idle: 'idle', happy: 'happy', think: 'think', celebrate: 'celebrate' } };
  const FALLBACK = { talk: 'neutral', celebrate: 'happy', think: 'neutral', happy: 'neutral' };

  DW.chars = {
    el(cid, state) { const w = h('div', { class: 'portrait ' + cid, 'data-char': cid }); DW.chars.set(w, state || 'neutral'); return w; },
    set(wrap, state) {
      const cid = wrap.dataset.char, c = M.characters[cid];
      state = (alias[cid] && alias[cid][state]) || state;
      wrap.dataset.state = state;
      let node;
      if (c.provided) {
        let im = DW.assets.img(cid, state) || DW.assets.img(cid, FALLBACK[state] || 'neutral') || DW.assets.img(cid, 'idle');
        if (im) { node = h('img', { src: im.src, alt: c.name, draggable: 'false', class: 'char-img' }); }
      }
      if (!node) { const t = h('div', { class: 'char-svg', html: cid === 'maya' ? DW.art.maya(state) : DW.art.drosie(state) }); node = t; }
      wrap.innerHTML = ''; wrap.append(node);
    },
    talking(wrap, on) {
      if (!wrap) return;
      wrap.classList.toggle('talking', !!on);
      const cid = wrap.dataset.char, c = M.characters[cid];
      clearInterval(wrap._t);
      if (c.provided && c.states.talk) {
        if (on) { let k = 0; wrap._t = setInterval(() => DW.chars.set(wrap, k++ % 2 ? 'neutral' : 'talk'), 170); }
        else DW.chars.set(wrap, 'neutral');
      }
    },
  };
})();
