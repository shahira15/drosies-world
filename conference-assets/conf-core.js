/* Drosie's First Scientific Conference · core: state, persistence, binding, navigation, utilities */
(function () {
  'use strict';
  const DC = (window.DC = window.DC || {});
  const KEY = 'drosieConference.v1';

  /* ---------- tiny helpers ---------- */
  DC.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  DC.$ = (s, r) => (r || document).querySelector(s);
  DC.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  DC.words = (t) => (String(t || '').trim().match(/\S+/g) || []).length;
  DC.fmt = (n, d) => (Math.round(n * Math.pow(10, d == null ? 1 : d)) / Math.pow(10, d == null ? 1 : d)).toString();
  DC.say = (msg) => { const s = DC.$('#sr'); if (s) { s.textContent = ''; setTimeout(() => (s.textContent = msg), 30); } };
  DC.toast = (msg) => {
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2600); DC.say(msg);
  };

  /* ---------- state ---------- */
  DC.defaults = () => ({
    v: 1, nick: '', anon: false, mode: null, path: null, badge: { color: '#1d5a5a', icon: '🔬' }, checked: false,
    a: { acked: false, setup: {}, ran: { control: [0, 0, 0, 0, 0], cool: [0, 0, 0, 0, 0] }, rec: { control: [null, null, null, null, null], cool: [null, null, null, null, null] }, varQ: null },
    b: {
      type: 'experiment', noHyp: false, skip: {}, ready: false,
      f: { title: '', question: '', background: '', hypothesis: '', methods: '', data: '', results: '', interpretation: '', limitations: '', conclusion: '' },
      vars: { changed: '', measured: '', same: '' }, steps: ['', '', ''], log: [{ label: '', group: '', value: '', note: '' }],
      chart: { kind: 'auto', yTitle: '', xTitle: '', unit: '' }, claims: [{ text: '', evidence: '', kind: '' }], organizerSeen: false
    },
    det: {}, detSeen: {}, abs: { bg: '', obj: '', methods: '', results: '', conclusion: '' }, absSaved: false,
    poster: { layout: 'columns', palette: 'teal', scale: 1, fig: 'auto', figView: 'dot', figCaption: '', started: false, previewed: false, f: { title: '', author: '', question: '', background: '', methods: '', results: '', conclusions: '', limitations: '', ack: '', refs: '' } },
    reg: { order: null, orderOk: false, prepSeen: false },
    hall: { visited: {}, sci: {}, posters: {}, talk: {}, reflect: '' },
    prac: { timerDone: false, explain: '', explainOk: false, qa: {}, qaDone: {} },
    revs: [], refl: { learned: '', surprise: '', next: '', proud: '' }, fin: { claimed: false },
    settings: { large: false, motion: false, contrast: false }, cur: 1, ts: 0
  });

  const merge = (base, over) => {
    if (Array.isArray(base)) return Array.isArray(over) ? over : base;
    if (base && typeof base === 'object') {
      const out = {};
      Object.keys(base).forEach((k) => { out[k] = over && k in over ? merge(base[k], over[k]) : base[k]; });
      if (over && typeof over === 'object') Object.keys(over).forEach((k) => { if (!(k in out)) out[k] = over[k]; });
      return out;
    }
    return over === undefined ? base : over;
  };

  let canStore = true;
  DC.load = () => {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { canStore = false; }
    let st = DC.defaults();
    if (raw) { try { st = merge(DC.defaults(), JSON.parse(raw)); } catch (e) { /* corrupt data: start fresh */ } }
    DC.state = st;
  };
  DC.stored = () => canStore;
  let saveTimer = null;
  DC.save = () => {
    DC.state.ts = Date.now();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(DC.state)); canStore = true; } catch (e) { canStore = false; }
      DC.paintSave();
    }, 120);
  };
  DC.saveNow = () => { clearTimeout(saveTimer); try { localStorage.setItem(KEY, JSON.stringify(DC.state)); canStore = true; } catch (e) { canStore = false; } DC.paintSave(); };
  DC.paintSave = () => {
    const el = DC.$('#saveNote'); if (!el) return;
    if (!canStore) { el.textContent = 'Not saving: this browser is blocking storage. Use Back up my work.'; return; }
    const d = new Date(DC.state.ts || Date.now());
    el.textContent = 'Saved on this device ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  DC.reset = () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } DC.state = DC.defaults(); DC.applySettings(); };

  DC.get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), DC.state);
  DC.set = (path, val) => {
    const ks = path.split('.'); let o = DC.state;
    for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; }
    o[ks[ks.length - 1]] = val; DC.save();
  };

  /* overclaiming: absolute words, or "all <animals> + verb" used as an assertion (not "cannot tell what all flies do") */
  DC.overclaim = (t) => /\b(prove[sd]?|proof|definitely|certainly|always|never|100 ?%|everyone)\b/i.test(t) || /\ball (fruit )?(flies|ants|plants|animals|insects|bugs|birds|pill bugs)\s+(climb|are|like|will|move|get|behave|prefer|respond)\b/i.test(t);

  /* ---------- privacy check for text that could carry personal info ---------- */
  DC.looksPersonal = (t) => /@|https?:|www\./i.test(t) || /\d{6,}/.test(String(t).replace(/[\s-]/g, ''));
  DC.name = () => (DC.state.anon || !DC.state.nick.trim() ? 'Young Researcher' : DC.state.nick.trim());

  /* ---------- settings ---------- */
  DC.applySettings = () => {
    const s = DC.state.settings, c = document.documentElement.classList;
    c.toggle('large', !!s.large); c.toggle('nomotion', !!s.motion); c.toggle('contrast', !!s.contrast);
  };

  /* ---------- action registry + event delegation ---------- */
  DC.acts = {};
  DC.bindings = {};   // path prefix -> fn called after a bound field changes
  DC.onBind = (prefix, fn) => { DC.bindings[prefix] = fn; };

  DC.initEvents = () => {
    const stage = DC.$('#stage');
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
      const fn = DC.acts[b.dataset.act]; if (fn) { if (!b.matches('input,select,textarea')) e.preventDefault(); fn(b, e); }
    });
    const onField = (e) => {
      const el = e.target.closest('[data-bind]'); if (!el) return;
      let v;
      if (el.type === 'checkbox') v = el.checked; else if (el.type === 'number' || el.dataset.num) v = el.value === '' ? '' : el.value; else v = el.value;
      if (el.type === 'radio' && !el.checked) return;
      if (el.dataset.bool) v = el.value === 'true';
      DC.set(el.dataset.bind, v);
      Object.keys(DC.bindings).forEach((p) => { if (el.dataset.bind.indexOf(p) === 0) DC.bindings[p](el, v); });
    };
    stage.addEventListener('input', onField);
    stage.addEventListener('change', onField);
  };

  /* ---------- chapters, gating, navigation ---------- */
  DC.chap = {};   // n -> {render, mount, complete}
  DC.register = (n, def) => { DC.chap[n] = def; };
  DC.isDone = (n) => { const c = DC.chap[n]; try { return !!(c && c.complete && c.complete()); } catch (e) { return false; } };
  DC.firstOpen = () => { for (let n = 1; n <= 10; n++) if (!DC.isDone(n)) return n; return 10; };
  DC.canOpen = (n) => {
    if (n === 1) return true;
    if (!DC.isDone(1)) return false;
    if (DC.state.mode === 'independent') return true;
    return n <= DC.firstOpen();
  };

  DC.paintRail = () => {
    const ol = DC.$('#railList'); if (!ol) return;
    ol.innerHTML = DC.CHAPTERS.map((c) => {
      const done = DC.isDone(c.n), open = DC.canOpen(c.n), cur = DC.state.cur === c.n;
      return '<li><button type="button" class="rbtn' + (done ? ' done' : '') + '" data-act="go" data-n="' + c.n + '"' + (cur ? ' aria-current="step"' : '') + (open ? '' : ' disabled') + ' aria-label="Chapter ' + c.n + ': ' + DC.esc(c.title) + (done ? ', complete' : open ? '' : ', locked until earlier chapters are finished') + '"><b aria-hidden="true">' + (done ? '✓' : c.n) + '</b>' + DC.esc(c.short) + '</button></li>';
    }).join('');
  };

  DC.go = (n, opts) => {
    opts = opts || {};
    n = Math.max(1, Math.min(10, n | 0));
    if (!DC.canOpen(n)) { DC.toast('Finish the earlier chapters first, or choose independent participation in Chapter 1.'); n = Math.min(n, DC.firstOpen()); }
    DC.state.cur = n; DC.save();
    if (!opts.noHash && location.hash !== '#ch' + n) { try { history.pushState(null, '', '#ch' + n); } catch (e) { /* ignore */ } }
    DC.view(opts);
  };

  DC.view = (opts) => {
    opts = opts || {};
    const n = DC.state.cur, def = DC.chap[n], stage = DC.$('#stage'), meta = DC.CHAPTERS[n - 1];
    const y = window.scrollY;
    const head = '<div class="chead"><span class="num" aria-hidden="true">' + n + '</span><div><div class="kicker">Chapter ' + n + ' of 10</div><h2 id="chTitle">' + DC.esc(meta.title) + '</h2></div></div>';
    DC.bindings = {};
    stage.innerHTML = head + (def ? def.render() : '<p>This chapter is not available.</p>') + DC.navFoot(n);
    if (def && def.mount) def.mount(stage);
    DC.paintRail();
    document.title = 'Chapter ' + n + ': ' + meta.title + ' | Drosie’s First Scientific Conference';
    if (opts.keepScroll) window.scrollTo(0, y); else if (!opts.quiet) { window.scrollTo(0, 0); stage.focus({ preventScroll: true }); DC.say('Chapter ' + n + ': ' + meta.title); }
  };
  DC.refresh = (focusSel) => {
    const act = document.activeElement, id = act && act.id;
    DC.view({ keepScroll: true, quiet: true });
    const target = focusSel ? DC.$(focusSel) : id ? document.getElementById(id) : null;
    if (target) target.focus({ preventScroll: true });
  };

  DC.navFoot = (n) => {
    const done = DC.isDone(n), next = n < 10 ? DC.canOpen(n + 1) : false;
    const gate = n < 10 && !next ? '<span class="gate" id="gateMsg">' + (DC.chap[n] && DC.chap[n].gate ? DC.esc(DC.chap[n].gate()) : 'Finish this chapter to continue.') + '</span>' : '';
    return '<div class="nav-foot">' + (n > 1 ? '<button type="button" class="btn" data-act="go" data-n="' + (n - 1) + '">← Back</button>' : '<span></span>') +
      '<span class="row">' + gate + (n < 10 ? '<button type="button" class="btn primary" data-act="go" data-n="' + (n + 1) + '"' + (next ? '' : ' aria-describedby="gateMsg" aria-disabled="true"') + '>Next chapter →</button>' : '') + '</span></div>';
  };
  DC.acts.go = (b) => DC.go(parseInt(b.dataset.n, 10));
  /* Update the footer and rail after a state change without re-rendering the whole chapter */
  DC.softUpdate = () => {
    DC.paintRail();
    const f = DC.$('#stage .nav-foot'); if (f) f.outerHTML = DC.navFoot(DC.state.cur);
  };

  /* ---------- modal dialog ---------- */
  DC.dialog = (html, onClose) => {
    const d = DC.$('#dlg'); d.innerHTML = html;
    d.onclose = () => { if (onClose) onClose(); };
    d.onclick = (e) => { if (e.target.closest('[data-close]')) d.close(); };
    if (!d.open) d.showModal();
  };
  DC.acts.settings = () => {
    const s = DC.state.settings;
    DC.dialog('<h2>Settings</h2><div class="field"><label class="skipchk"><input type="checkbox" id="sLarge"' + (s.large ? ' checked' : '') + '> Larger text</label><label class="skipchk"><input type="checkbox" id="sMotion"' + (s.motion ? ' checked' : '') + '> Turn off animation (also follows your device setting)</label><label class="skipchk"><input type="checkbox" id="sContrast"' + (s.contrast ? ' checked' : '') + '> Higher contrast</label></div><p class="hint">Your work stays in this browser on this device. Nothing is sent anywhere. Clearing your browser’s site data will erase it, so use <strong>Back up my work</strong> to keep a copy.</p><div class="row"><button class="btn primary" data-close type="button">Done</button></div>');
    ['sLarge:large', 'sMotion:motion', 'sContrast:contrast'].forEach((p) => {
      const [id, k] = p.split(':'); DC.$('#' + id).addEventListener('change', (e) => { DC.state.settings[k] = e.target.checked; DC.save(); DC.applySettings(); });
    });
  };

  /* ---------- back up / restore / reset ---------- */
  DC.download = (name, text, type) => {
    const url = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  };
  DC.acts.backup = () => {
    DC.dialog('<h2>Back up or restore my work</h2><p>Your conference work lives only in this browser. Make a backup file to keep it safe or to move it to another device.</p><div class="row"><button class="btn primary" type="button" data-act="exportJson">Download backup (.json)</button></div><div class="field" style="margin-top:.8rem"><label for="imp">Restore from a backup file</label><input type="file" id="imp" accept="application/json,.json"></div><p id="impMsg" role="status"></p><hr><p><strong>Start over.</strong> This erases your conference work from this browser.</p><div class="row"><button class="btn danger" type="button" data-act="resetAsk">Erase my work…</button><button class="btn" data-close type="button">Close</button></div>');
    DC.$('#imp').addEventListener('change', (e) => {
      const f = e.target.files[0]; if (!f) return; const r = new FileReader();
      r.onload = () => {
        try {
          const j = JSON.parse(r.result); if (!j || j.v !== 1 || typeof j !== 'object') throw new Error('x');
          DC.state = merge(DC.defaults(), j); DC.saveNow(); DC.applySettings(); DC.$('#impMsg').textContent = 'Restored. Welcome back!'; DC.go(DC.state.cur || 1, { noHash: true });
        } catch (err) { DC.$('#impMsg').textContent = 'That file is not a Drosie conference backup.'; }
      };
      r.readAsText(f);
    });
  };
  DC.acts.exportJson = () => DC.download('drosie-conference-backup.json', JSON.stringify(DC.state, null, 2), 'application/json');
  DC.acts.resetAsk = () => DC.dialog('<h2>Erase everything?</h2><p>This removes your name, research, abstract, poster and answers from this browser. It cannot be undone unless you have a backup file.</p><div class="row"><button class="btn danger" type="button" data-act="resetGo">Yes, erase my work</button><button class="btn" data-close type="button">Keep my work</button></div>');
  DC.acts.resetGo = () => { DC.reset(); DC.$('#dlg').close(); DC.go(1); DC.toast('Your conference work was erased from this browser.'); };

  /* ---------- printing: fill #printRoot, then call the browser's print dialog ---------- */
  DC.print = (html, orient, noDialog) => {
    const root = DC.$('#printRoot'); root.innerHTML = html;
    let st = DC.$('#pageRule'); if (!st) { st = document.createElement('style'); st.id = 'pageRule'; document.head.appendChild(st); }
    st.textContent = '@page{size:letter ' + (orient || 'portrait') + ';margin:' + (orient === 'landscape' ? '0.4in' : '0.6in') + '}';
    root.setAttribute('aria-hidden', 'false');
    if (noDialog) return;
    setTimeout(() => window.print(), 80);
  };

  /* ---------- seeded random numbers (deterministic simulation) ---------- */
  DC.rng = (seedStr) => {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    let a = h >>> 0;
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };

  /* ---------- statistics (plain summaries only; no significance tests) ---------- */
  DC.stats = (arr) => {
    const v = arr.filter((x) => typeof x === 'number' && isFinite(x)).slice().sort((a, b) => a - b);
    if (!v.length) return null;
    const sum = v.reduce((a, b) => a + b, 0), n = v.length;
    const med = n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2;
    return { n, sum, mean: sum / n, median: med, min: v[0], max: v[n - 1], range: v[n - 1] - v[0] };
  };
  DC.recorded = (cid) => DC.state.a.rec[cid].filter((x) => typeof x === 'number');
  DC.aComplete = () => DC.DATA.conditions.every((c) => DC.recorded(c.id).length === DC.DATA.trials);
  DC.aStats = () => { const o = {}; DC.DATA.conditions.forEach((c) => (o[c.id] = DC.stats(DC.recorded(c.id)))); return o; };

  /* ---------- boot ---------- */
  DC.boot = () => {
    DC.load(); DC.applySettings(); DC.initEvents();
    window.addEventListener('pagehide', DC.saveNow);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') DC.saveNow(); });
    DC.$('#btnSettings').addEventListener('click', DC.acts.settings);
    DC.$('#btnBackup').addEventListener('click', DC.acts.backup);
    const fromHash = () => { const m = /^#ch(\d+)$/.exec(location.hash); return m ? parseInt(m[1], 10) : null; };
    window.addEventListener('popstate', () => { const n = fromHash(); if (n) { DC.state.cur = Math.min(n, DC.canOpen(n) ? n : DC.firstOpen()); DC.view({ quiet: true }); } });
    let start = fromHash() || DC.state.cur || 1;
    if (!DC.canOpen(start)) start = DC.firstOpen();
    DC.state.cur = start; DC.paintSave();
    DC.view({ quiet: true });
  };
  document.addEventListener('DOMContentLoaded', () => { if (document.body.dataset.app === 'conference') DC.boot(); });
})();
