/*
 * LETTERS FROM DROSIE — soft sound effects
 * Synthesized with the Web Audio API: no audio files, no network.
 * Sounds play only in response to the child's own actions, and only if sound is on.
 */
(function () {
  'use strict';
  let ctx = null;
  const state = { on: true, volume: 0.5 };

  function ac() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function noiseBuffer(a, seconds) {
    const b = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * seconds)), a.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  /** Filtered noise burst: the basis of paper, wax and hinge sounds. */
  function noise({ dur = 0.3, type = 'bandpass', f0 = 1200, f1 = f0, q = 0.8, gain = 0.15, attack = 0.01, when = 0 }) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const src = a.createBufferSource(); src.buffer = noiseBuffer(a, dur + 0.05);
    const f = a.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain * state.volume, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(a.destination); src.start(t); src.stop(t + dur + 0.05);
  }
  function tone({ freq = 440, freq1 = freq, dur = 0.4, type = 'sine', gain = 0.05, when = 0 }) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const o = a.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq1, t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain * state.volume, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
  }

  const SOUNDS = {
    // a small creaking hinge: slow, low, narrow band sweep
    hinge: () => { noise({ dur: 0.7, f0: 380, f1: 620, q: 9, gain: 0.08, attack: 0.08 }); tone({ freq: 210, freq1: 260, dur: 0.6, type: 'triangle', gain: 0.015 }); },
    // envelope sliding out over wood/paper
    slide: () => noise({ dur: 0.55, f0: 2600, f1: 1400, q: 0.6, gain: 0.07, attack: 0.12 }),
    // wax cracking: a few dry, short clicks
    crack: () => { [0, 0.045, 0.11].forEach((w, i) => noise({ dur: 0.05 + i * 0.01, type: 'highpass', f0: 1800 - i * 300, q: 0.7, gain: 0.22 - i * 0.05, attack: 0.002, when: w })); },
    // paper flap / unfold
    paper: () => { noise({ dur: 0.35, f0: 3200, f1: 1800, q: 0.5, gain: 0.06, attack: 0.03 }); noise({ dur: 0.25, f0: 2200, f1: 1500, q: 0.5, gain: 0.05, attack: 0.02, when: 0.18 }); },
    page: () => noise({ dur: 0.32, f0: 3600, f1: 2000, q: 0.45, gain: 0.05, attack: 0.04 }),
    // a soft "plip" of ink
    ink: () => { tone({ freq: 520, freq1: 260, dur: 0.18, gain: 0.035 }); noise({ dur: 0.12, type: 'lowpass', f0: 700, q: 0.5, gain: 0.05, attack: 0.005, when: 0.02 }); },
    // gentle chime when the keepsake appears
    chime: () => [784, 988, 1175].forEach((f, i) => tone({ freq: f, dur: 1.2, gain: 0.025, when: i * 0.14 }))
  };

  window.DrosieSfx = {
    play(name) { if (!state.on) return; try { SOUNDS[name]?.(); } catch (e) { /* audio unavailable: stay silent */ } },
    setOn(v) { state.on = !!v; },
    isOn() { return state.on; }
  };
})();
