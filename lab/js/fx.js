/* fx.js: full-screen particle canvas (sparkles, confetti, bursts) and drifting lab dust motes. */
(function () {
  'use strict';
  const DW = window.DW;
  const fx = (DW.fx = { cv: null, ctx: null, w: 0, h: 0, parts: [], dust: [], dustOn: false });

  fx.init = function (cv) {
    fx.cv = cv; fx.ctx = cv.getContext('2d');
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      fx.w = window.innerWidth; fx.h = window.innerHeight;
      cv.width = fx.w * dpr; cv.height = fx.h * dpr;
      fx.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); window.addEventListener('resize', resize);
    fx.dust = Array.from({ length: 44 }, () => ({
      x: Math.random() * fx.w, y: Math.random() * fx.h, r: Math.random() * 1.7 + 0.5,
      vx: (Math.random() - 0.5) * 0.14, vy: -Math.random() * 0.13 - 0.02, a: Math.random() * 0.45 + 0.12, ph: Math.random() * 6.3,
    }));
    requestAnimationFrame(loop);
  };

  function star(ctx, r) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.38 : r, a = (i * Math.PI) / 4 - Math.PI / 2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
  }

  function loop(t) {
    const ctx = fx.ctx;
    ctx.clearRect(0, 0, fx.w, fx.h);
    if (fx.dustOn && !DW.paused) {
      for (const d of fx.dust) {
        d.x += d.vx + Math.sin(t / 2200 + d.ph) * 0.1; d.y += d.vy;
        if (d.y < -4) { d.y = fx.h + 4; d.x = Math.random() * fx.w; }
        if (d.x < -4) d.x = fx.w + 4; if (d.x > fx.w + 4) d.x = -4;
        ctx.globalAlpha = d.a * (0.6 + 0.4 * Math.sin(t / 900 + d.ph));
        ctx.fillStyle = '#ffe8b0';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
      }
    }
    const P = fx.parts;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.life--; if (p.life <= 0) { P.splice(i, 1); continue; }
      p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life / (p.max * 0.4));
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
      if (p.shape === 'star') star(ctx, p.size);
      else if (p.shape === 'conf') ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
      else { ctx.beginPath(); ctx.arc(0, 0, p.size, 0, 6.283); ctx.fill(); }
      ctx.restore();
    }
    requestAnimationFrame(loop);
  }

  fx.burst = function (x, y, o = {}) {
    const n = o.n || 22, colors = o.colors || ['#ffd36b', '#7df0cf', '#ff8c7a', '#ffffff'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, sp = (o.speed || 5) * (0.3 + Math.random());
      fx.parts.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), g: o.g == null ? 0.12 : o.g, drag: 0.985,
        life: (o.life || 60) * (0.6 + Math.random() * 0.6), max: o.life || 60, size: (o.size || 5) * (0.5 + Math.random()),
        color: colors[(Math.random() * colors.length) | 0], shape: o.shape || 'star', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      });
    }
  };
  fx.sparkleAt = function (el, n) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    fx.burst(r.left + r.width / 2, r.top + r.height / 2, { n: n || 18, speed: 4, life: 50, size: 5 });
  };
  fx.confetti = function (big) {
    const cols = ['#ffd36b', '#7df0cf', '#ff8c7a', '#8ec9ff', '#ffffff', '#c9a7ff'];
    const shots = big ? 6 : 3;
    for (let k = 0; k < shots; k++) {
      setTimeout(() => {
        fx.burst(fx.w * (0.15 + Math.random() * 0.7), fx.h * 0.35, { n: 34, speed: 9, up: 4, g: 0.16, life: 110, size: 6, shape: 'conf', colors: cols });
        fx.burst(fx.w * (0.15 + Math.random() * 0.7), fx.h * 0.3, { n: 12, speed: 6, up: 3, g: 0.1, life: 80, size: 7, shape: 'star', colors: cols });
      }, k * 160);
    }
  };
})();
