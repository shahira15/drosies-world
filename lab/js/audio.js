/* audio.js: all sound is synthesized with WebAudio (no audio files, no downloads, no licences).
 * Includes: UI/tactile SFX, a gentle generative music bed, lab ambience, and optional narration (speechSynthesis).
 */
(function () {
  'use strict';
  const DW = window.DW;
  const S = (DW.audio = {
    ctx: null, master: null, sfx: null, mus: null, echo: null, noiseBuf: null,
    on: { sfx: true, music: true, narr: true },
    musicTimer: null, ambient: null, lastTick: 0,
  });

  S.init = function () {
    if (S.ctx) { S.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    const c = (S.ctx = new C());
    S.master = c.createGain(); S.master.gain.value = 0.85; S.master.connect(c.destination);
    S.sfx = c.createGain(); S.sfx.gain.value = S.on.sfx ? 1 : 0; S.sfx.connect(S.master);
    S.mus = c.createGain(); S.mus.gain.value = S.on.music ? 1 : 0; S.mus.connect(S.master);
    // soft echo bus for the music
    const d = c.createDelay(1); d.delayTime.value = 0.38;
    const fb = c.createGain(); fb.gain.value = 0.32;
    const wet = c.createGain(); wet.gain.value = 0.55;
    d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(S.mus);
    S.echo = d;
    // noise buffer
    const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    S.noiseBuf = buf;
    S.startMusic();
    S.startAmbient();
  };
  S.resume = function () { if (S.ctx && S.ctx.state === 'suspended') S.ctx.resume(); };
  S.suspend = function () { if (S.ctx && S.ctx.state === 'running') S.ctx.suspend(); };

  S.setSfx = (v) => { S.on.sfx = v; if (S.sfx) S.sfx.gain.value = v ? 1 : 0; };
  S.setMusic = (v) => { S.on.music = v; if (S.mus) S.mus.gain.value = v ? 1 : 0; };
  S.setNarr = (v) => { S.on.narr = v; if (!v && 'speechSynthesis' in window) speechSynthesis.cancel(); };

  function tone(o) {
    const c = S.ctx; if (!c) return;
    const t0 = c.currentTime + (o.d || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.t);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.v || 0.2, t0 + (o.a || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.t);
    osc.connect(g); g.connect(o.out || S.sfx);
    if (o.echo && S.echo) g.connect(S.echo);
    osc.start(t0); osc.stop(t0 + o.t + 0.05);
  }
  function noise(o) {
    const c = S.ctx; if (!c) return;
    const t0 = c.currentTime + (o.d || 0);
    const src = c.createBufferSource(); src.buffer = S.noiseBuf;
    const f = c.createBiquadFilter(); f.type = o.ft || 'lowpass';
    f.frequency.setValueAtTime(o.f || 800, t0);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.t);
    f.Q.value = o.q || 1;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.v || 0.2, t0 + (o.a || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.t);
    src.connect(f); f.connect(g); g.connect(S.sfx);
    src.start(t0, Math.random()); src.stop(t0 + o.t + 0.05);
  }

  const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568 };

  const SFX = {
    click() { tone({ f: 640, f2: 520, t: 0.08, type: 'triangle', v: 0.16 }); noise({ t: 0.03, f: 3000, ft: 'highpass', v: 0.05 }); },
    hover() { tone({ f: 900, t: 0.04, type: 'sine', v: 0.04 }); },
    tick() { // knob detent
      const now = performance.now(); if (now - S.lastTick < 40) return; S.lastTick = now;
      tone({ f: 1500, f2: 1100, t: 0.025, type: 'triangle', v: 0.05 });
    },
    pop() { tone({ f: 380, f2: 900, t: 0.12, type: 'sine', v: 0.2 }); },
    pickup() { tone({ f: 420, f2: 840, t: 0.16, type: 'triangle', v: 0.18 }); tone({ f: 840, f2: 1260, t: 0.18, type: 'sine', v: 0.1, d: 0.07 }); },
    drop() { tone({ f: 200, f2: 90, t: 0.14, type: 'sine', v: 0.3 }); noise({ t: 0.06, f: 500, v: 0.12 }); },
    snap() { tone({ f: 260, f2: 130, t: 0.1, type: 'sine', v: 0.3 }); tone({ f: 1320, t: 0.12, type: 'triangle', v: 0.12, d: 0.04 }); },
    switchOn() { noise({ t: 0.05, f: 1800, ft: 'bandpass', q: 3, v: 0.25 }); tone({ f: 180, f2: 120, t: 0.1, type: 'square', v: 0.07 }); tone({ f: 70, t: 0.5, type: 'sawtooth', v: 0.03, d: 0.06 }); },
    switchOff() { noise({ t: 0.05, f: 1400, ft: 'bandpass', q: 3, v: 0.22 }); tone({ f: 150, f2: 90, t: 0.1, type: 'square', v: 0.07 }); },
    whoosh() { noise({ t: 0.55, f: 300, f2: 2600, ft: 'bandpass', q: 0.8, v: 0.22, a: 0.2 }); },
    whooshBack() { noise({ t: 0.5, f: 2600, f2: 300, ft: 'bandpass', q: 0.8, v: 0.2, a: 0.1 }); },
    ding() { tone({ f: N.A5, t: 0.5, v: 0.2, echo: true }); tone({ f: N.E6, t: 0.6, v: 0.12, d: 0.06, echo: true }); },
    success() { [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone({ f, t: 0.45, type: 'triangle', v: 0.17, d: i * 0.08, echo: true })); },
    nope() { tone({ f: 330, f2: 262, t: 0.22, type: 'sine', v: 0.1 }); tone({ f: 262, f2: 247, t: 0.25, type: 'sine', v: 0.08, d: 0.14 }); },
    sparkle() { for (let i = 0; i < 4; i++) tone({ f: 1800 + Math.random() * 1800, t: 0.25, type: 'sine', v: 0.05, d: i * 0.05 + Math.random() * 0.04, echo: true }); },
    fanfare() {
      [[N.C5, N.E5, N.G5], [N.D5, N.G5, N.A5], [N.E5, N.G5, N.C6], [N.G5, N.C6, N.E6]].forEach((ch, i) =>
        ch.forEach((f) => tone({ f, t: i === 3 ? 1.4 : 0.38, type: 'triangle', v: 0.13, d: i * 0.2, echo: true })));
      for (let i = 0; i < 8; i++) tone({ f: 1500 + i * 220, t: 0.3, v: 0.05, d: 0.8 + i * 0.07, echo: true });
    },
    buzz() { tone({ f: 190, f2: 230, t: 0.35, type: 'sawtooth', v: 0.035 }); tone({ f: 380, f2: 460, t: 0.35, type: 'sawtooth', v: 0.015 }); },
    pageflip() { noise({ t: 0.18, f: 2500, f2: 800, ft: 'bandpass', q: 0.6, v: 0.12 }); },
    zap() { tone({ f: 1200, f2: 300, t: 0.2, type: 'triangle', v: 0.12 }); },
  };
  S.play = function (n) { if (!S.ctx || !S.on.sfx) return; S.resume(); try { (SFX[n] || SFX.click)(); } catch (e) { /* ignore */ } };

  /* gentle pentatonic music bed */
  S.startMusic = function () {
    if (S.musicTimer || !S.ctx) return;
    const scale = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
    let i = 2, step = 0;
    const pad = [[130.81, 196, 329.63], [110, 164.81, 261.63], [174.61, 261.63, 329.63], [98, 196, 293.66]];
    S.musicTimer = setInterval(() => {
      if (!S.ctx || S.ctx.state !== 'running' || DW.paused) return;
      i = DW.clamp(i + Math.round((Math.random() - 0.5) * 4), 0, scale.length - 1);
      tone({ f: scale[i], t: 1.6, type: 'sine', v: 0.03, a: 0.04, out: S.mus, echo: true });
      if (step % 4 === 0) pad[(step / 4) % 4].forEach((f) => tone({ f, t: 3.4, type: 'sine', v: 0.012, a: 0.6, out: S.mus }));
      step++;
    }, 1300);
  };
  /* quiet laboratory hum */
  S.startAmbient = function () {
    const c = S.ctx; if (!c || S.ambient) return;
    const src = c.createBufferSource(); src.buffer = S.noiseBuf; src.loop = true;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180;
    const g = c.createGain(); g.gain.value = 0.045;
    src.connect(f); f.connect(g); g.connect(S.mus);
    src.start(); S.ambient = src;
  };

  /* narration: optional text-to-speech from the browser (free, offline on most devices) */
  let voice = null;
  function pickVoice() {
    if (voice || !('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
    voice = vs.find((v) => /samantha|aria|jenny|zira|google us english|female|natural/i.test(v.name)) || vs[0] || null;
  }
  if ('speechSynthesis' in window) { speechSynthesis.onvoiceschanged = pickVoice; pickVoice(); }
  S.speak = function (text, who) {
    if (!S.on.narr || !('speechSynthesis' in window) || !text) return;
    try {
      speechSynthesis.cancel(); pickVoice();
      const u = new SpeechSynthesisUtterance(text.replace(/[★✓]/g, ''));
      if (voice) u.voice = voice;
      u.rate = who === 'drosie' ? 1.08 : 0.93;
      u.pitch = who === 'drosie' ? 1.6 : 1.1;
      speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  };
  S.stopSpeak = function () { if ('speechSynthesis' in window) speechSynthesis.cancel(); };
})();
