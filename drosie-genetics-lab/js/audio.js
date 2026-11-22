/** Contextual sound effects (Web Audio, synthesized — no audio files) and optional narration. */
let ctx = null;
export const audioSettings = { sound: false, narration: false };

function ac() {
  if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function tone(freq, dur = 0.12, type = 'sine', gain = 0.06, when = 0) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = freq;
  const t = a.currentTime + when;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}
const SOUNDS = {
  click: () => tone(660, 0.06, 'triangle', 0.04),
  open: () => { tone(520, 0.08, 'sine'); tone(780, 0.1, 'sine', 0.05, 0.06); },
  buzz: () => { tone(190, 0.25, 'sawtooth', 0.015); tone(205, 0.25, 'sawtooth', 0.012, 0.03); },
  success: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'triangle', 0.05, i * 0.09)),
  step: () => { tone(880, 0.08, 'sine', 0.05); tone(1175, 0.12, 'sine', 0.05, 0.07); },
  error: () => { tone(220, 0.15, 'square', 0.03); tone(180, 0.2, 'square', 0.03, 0.12); },
  bubble: () => [400, 520, 460].forEach((f, i) => tone(f, 0.07, 'sine', 0.03, i * 0.05))
};
export function sfx(name) { if (!audioSettings.sound) return; try { SOUNDS[name]?.(); } catch { /* ignore */ } }

export function speak(text) {
  if (!audioSettings.narration || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
    u.rate = 0.98; u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}
export function stopSpeaking() { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } }
