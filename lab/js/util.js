/* util.js: tiny helpers shared by every module. No dependencies. */
(function () {
  'use strict';
  const DW = (window.DW = window.DW || {});

  DW.$ = (s, r = document) => r.querySelector(s);
  DW.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /** Create a DOM element: h('div', {class:'x', onclick:fn, html:'<b>hi</b>'}, child, child...) */
  DW.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const c of kids.flat()) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(c));
    }
    return el;
  };

  DW.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  DW.lerp = (a, b, t) => a + (b - a) * t;
  DW.ease = {
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    linear: (t) => t,
  };

  DW.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  DW.paused = false;

  /** Pause-aware sleep. */
  DW.sleep = (ms) => new Promise((res) => {
    let t = 0, last = performance.now();
    (function tick(now) {
      if (!DW.paused) t += now - last;
      last = now;
      if (t >= ms) res(); else requestAnimationFrame(tick);
    })(last);
  });

  /** Animate 0..1 over ms. fn(easedT). */
  DW.tween = (ms, fn, ease = DW.ease.inOut) => new Promise((res) => {
    if (DW.reduced) ms = Math.min(ms, 60);
    const t0 = performance.now();
    (function f(now) {
      const t = Math.min(1, (now - t0) / ms);
      fn(ease(t), t);
      if (t < 1) requestAnimationFrame(f); else res();
    })(t0);
  });

  /** Seeded random generator (mulberry32). */
  DW.rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  DW.shuffle = (a, r = Math.random) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  /** Tiny event bus with promise-style waiting; lets mission code read top-to-bottom. */
  DW.bus = (function () {
    const L = {};
    const api = {
      on(e, f) { (L[e] = L[e] || new Set()).add(f); return () => L[e].delete(f); },
      emit(e, d) { (L[e] ? Array.from(L[e]) : []).forEach((f) => { try { f(d); } catch (err) { console.error(err); } }); },
      wait(e, pred) {
        return new Promise((res) => {
          const off = api.on(e, (d) => { if (!pred || pred(d)) { off(); res(d); } });
        });
      },
    };
    return api;
  })();

  /** Safe localStorage (settings only; never personal info). */
  DW.store = {
    get(k, d) { try { const v = localStorage.getItem('dw.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dw.' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };
})();
