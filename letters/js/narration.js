/*
 * LETTERS FROM DROSIE — narration engine
 * ---------------------------------------------------------------------
 * Three modes, chosen automatically:
 *
 *  'audio'  A recorded narration file plus a cue file. Highlighting follows the
 *           audio clock (audio.currentTime), so pause, resume, seek and replay
 *           always stay in sync.
 *  'audio-nocues'  Audio exists but no cue file: it plays, and all text is shown
 *           in full (no guessed timing).
 *  'tts'    The browser's built-in voice (SpeechSynthesis). Each phrase is spoken
 *           as its own utterance, so phrase-level highlighting is exact: it
 *           starts when the device actually starts speaking that phrase. Word
 *           highlighting is added only when the browser reports word
 *           boundaries. Pause stops at the current phrase, and Resume restarts
 *           that phrase (reliable across browsers).
 *  'none'   No voice available: the child reads silently.
 *
 * Audio never starts without a user gesture: play() is only called from buttons.
 */
(function () {
  'use strict';

  const VOICE_PREFERENCES = [
    /samantha/i, /ava/i, /allison/i, /susan/i, /karen/i, /moira/i, /tessa/i,
    /google us english/i, /google uk english female/i, /aria/i, /jenny/i, /zira/i, /female/i
  ];

  class Narrator {
    constructor(opts) {
      this.letter = opts.letter;
      this.phrases = opts.phrases; // [{id, page, text, blockEnd}]
      this.cb = opts;              // onPhrase, onWord, onState, onEnd, onNotice
      this.mode = 'none';
      this.state = 'idle';         // idle | playing | paused | ended
      this.index = 0;
      this.muted = false;
      this.audio = null;
      this.cues = null;            // array aligned with phrases: start time or null
      this.voice = null;
      this.token = 0;
      this.raf = 0;
      this.timer = 0;
    }

    /* ---------- detection ---------- */
    async init() {
      const n = this.letter.narration || {};
      if (n.audio && await this._probeAudio(n.audio)) {
        this.cues = await this._loadCues(n.cues);
        this.mode = this.cues ? 'audio' : 'audio-nocues';
      } else if ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
        this.voice = await this._pickVoice();
        this.mode = this.voice !== undefined ? 'tts' : 'none';
      } else {
        this.mode = 'none';
      }
      return this.mode;
    }

    _probeAudio(src) {
      return new Promise(resolve => {
        const a = new Audio();
        let done = false;
        const finish = ok => { if (done) return; done = true; clearTimeout(t); if (ok) { this.audio = a; this._wireAudio(); } resolve(ok); };
        const t = setTimeout(() => finish(false), 5000);
        a.preload = 'metadata';
        a.addEventListener('loadedmetadata', () => finish(isFinite(a.duration) && a.duration > 0), { once: true });
        a.addEventListener('error', () => finish(false), { once: true });
        a.src = src;
      });
    }

    async _loadCues(url) {
      if (!url) return null;
      try {
        const r = await fetch(url, { cache: 'no-cache' });
        if (!r.ok) return null;
        const data = await r.json();
        const byId = new Map((data.cues || []).map(c => [c.id, Number(c.start)]));
        const aligned = this.phrases.map(p => (byId.has(p.id) && isFinite(byId.get(p.id)) ? byId.get(p.id) : null));
        if (!aligned.some(x => x != null)) return null;
        return aligned;
      } catch (e) { return null; }
    }

    _pickVoice() {
      return new Promise(resolve => {
        const synth = window.speechSynthesis;
        const choose = () => {
          const voices = synth.getVoices();
          if (!voices.length) return null;
          const lang = (this.letter.narration?.tts?.lang || 'en-US').slice(0, 2);
          const en = voices.filter(v => (v.lang || '').toLowerCase().startsWith(lang));
          for (const re of VOICE_PREFERENCES) { const v = en.find(x => re.test(x.name)); if (v) return v; }
          return en.find(v => v.default) || en[0] || voices[0];
        };
        const first = choose();
        if (first) return resolve(first);
        const t = setTimeout(() => { synth.removeEventListener?.('voiceschanged', on); resolve(choose() || null); }, 1500);
        const on = () => { const v = choose(); if (v) { clearTimeout(t); synth.removeEventListener?.('voiceschanged', on); resolve(v); } };
        synth.addEventListener?.('voiceschanged', on);
      }).then(v => (v === null ? null : v));
    }

    describe() {
      switch (this.mode) {
        case 'audio': return 'Recorded narration';
        case 'audio-nocues': return 'Recorded narration (text shown in full: no timing file yet)';
        case 'tts': return `Your device’s built-in voice${this.voice ? ' (' + this.voice.name + ')' : ''}. It may not sound like Drosie: voices differ between devices.`;
        default: return 'Reading aloud is not available on this device.';
      }
    }

    /* ---------- public controls ---------- */
    play(fromIndex = 0) {
      this.stop(true);
      this.index = Math.max(0, Math.min(fromIndex, this.phrases.length - 1));
      if (this.mode === 'audio' || this.mode === 'audio-nocues') return this._audioPlayFrom(this.index);
      if (this.mode === 'tts') return this._ttsSpeak(this.index);
      this.cb.onNotice?.('Reading aloud is not available on this device, so the whole letter is shown for you to read.');
      return false;
    }
    pause() {
      if (this.state !== 'playing') return;
      if (this.audio && this.mode.startsWith('audio')) this.audio.pause();
      else { this.token++; clearTimeout(this.timer); try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
      cancelAnimationFrame(this.raf);
      this._setState('paused');
    }
    resume() {
      if (this.state !== 'paused') return;
      if (this.audio && this.mode.startsWith('audio')) { this._safePlay(); }
      else this._ttsSpeak(this.index);
    }
    replay() { this.play(0); }
    playFromPage(page) {
      const i = this.phrases.findIndex(p => p.page === page);
      if (i >= 0) this.play(i);
    }
    /** Called when the child turns the page while narration is running/paused. */
    seekToPage(page) {
      const i = this.phrases.findIndex(p => p.page === page);
      if (i < 0) return;
      const wasPlaying = this.state === 'playing';
      if (this.state === 'idle' || this.state === 'ended') return;
      if (this.mode === 'audio' || this.mode === 'audio-nocues') {
        const t = this._startTimeFor(i);
        if (t != null) this.audio.currentTime = t;
        this.index = i;
        this.cb.onPhrase?.(i);
        if (!wasPlaying) return;
      } else if (this.mode === 'tts') {
        this.index = i;
        if (wasPlaying) this._ttsSpeak(i); else this.cb.onPhrase?.(i);
      }
    }
    stop(silent) {
      this.token++;
      clearTimeout(this.timer);
      cancelAnimationFrame(this.raf);
      if (this.audio) { try { this.audio.pause(); } catch (e) { /* ignore */ } }
      if (this.mode === 'tts') { try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
      if (!silent) this._setState('idle');
    }
    setMuted(m) {
      this.muted = m;
      if (this.audio) this.audio.muted = m;
      if (this.mode === 'tts' && this.state === 'playing') this._ttsSpeak(this.index); // re-speak current phrase at new volume
    }

    /* ---------- audio mode ---------- */
    _wireAudio() {
      const a = this.audio;
      a.addEventListener('ended', () => { cancelAnimationFrame(this.raf); this._setState('ended'); this.cb.onEnd?.(); });
      a.addEventListener('pause', () => cancelAnimationFrame(this.raf));
      a.addEventListener('playing', () => { this._setState('playing'); this._tick(); });
      a.addEventListener('error', () => {
        if (this.state === 'playing' || this.state === 'paused') {
          this.cb.onNotice?.('The recorded narration stopped loading. Switching to the device voice.');
          this.audio = null; this.mode = 'tts';
          this._pickVoice().then(v => { this.voice = v; this._ttsSpeak(this.index); });
        }
      });
    }
    _startTimeFor(i) {
      if (!this.cues) return i === 0 ? 0 : null;
      for (let k = i; k < this.cues.length; k++) if (this.cues[k] != null) return this.cues[k];
      return null;
    }
    _audioPlayFrom(i) {
      const t = this._startTimeFor(i);
      this.audio.currentTime = t != null ? t : 0;
      this.audio.muted = this.muted;
      this.index = i;
      if (this.mode === 'audio-nocues') this.cb.onNotice?.('No timing file was found for this recording, so the whole letter is shown while Drosie reads.');
      return this._safePlay();
    }
    _safePlay() {
      const p = this.audio.play();
      if (p && p.catch) p.catch(() => { this.cb.onNotice?.('The narration could not start. Please press Read to Me again.'); this._setState('idle'); });
      return true;
    }
    _tick() {
      if (!this.audio || this.audio.paused) return;
      if (this.cues) {
        const now = this.audio.currentTime;
        let idx = -1;
        for (let k = 0; k < this.cues.length; k++) if (this.cues[k] != null && this.cues[k] <= now + 0.02) idx = k;
        if (idx >= 0 && idx !== this.lastIdx) { this.lastIdx = idx; this.index = idx; this.cb.onPhrase?.(idx); }
      }
      this.raf = requestAnimationFrame(() => this._tick());
    }

    /* ---------- built-in voice mode ---------- */
    _ttsSpeak(i) {
      const synth = window.speechSynthesis;
      const my = ++this.token;
      clearTimeout(this.timer);
      try { synth.cancel(); } catch (e) { /* ignore */ }
      if (i >= this.phrases.length) { this._setState('ended'); this.cb.onEnd?.(); return; }
      this.index = i;
      const ph = this.phrases[i];
      const cfg = this.letter.narration?.tts || {};
      const u = new SpeechSynthesisUtterance(ph.speak || ph.text);
      if (this.voice) u.voice = this.voice;
      u.lang = this.voice?.lang || cfg.lang || 'en-US';
      u.rate = cfg.rate ?? 0.86;
      u.pitch = cfg.pitch ?? 1.18;
      u.volume = this.muted ? 0 : 1;
      let started = false;
      u.onstart = () => { if (my !== this.token) return; started = true; this.everStarted = true; this._setState('playing'); this.cb.onPhrase?.(i); };
      u.onboundary = e => { if (my !== this.token || e.name && e.name !== 'word') return; this.cb.onWord?.(i, e.charIndex, e.charLength); };
      u.onend = () => {
        if (my !== this.token) return;
        const gap = ph.blockEnd ? (cfg.pauseAfterBlock ?? 650) : (cfg.pauseAfterPhrase ?? 260);
        this.timer = setTimeout(() => { if (my === this.token) this._ttsSpeak(i + 1); }, gap);
      };
      u.onerror = e => {
        if (my !== this.token || e.error === 'interrupted' || e.error === 'canceled') return;
        if (!started && !this.everStarted) { this._ttsUnavailable(); return; } // never worked on this device
        this.cb.onNotice?.('The device voice stopped unexpectedly. You can press Resume, or keep reading on your own.');
        this._setState('paused');
      };
      // Watchdog: some devices accept speak() but never start. Fail honestly.
      setTimeout(() => {
        if (my === this.token && !started && this.state !== 'paused' && !this.everStarted) this._ttsUnavailable();
      }, 3500);
      synth.speak(u);
      if (this.state !== 'playing') this._setState('playing');
    }

    _ttsUnavailable() {
      this.token++;
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
      this.mode = 'none';
      this._setState('idle');
      this.cb.onNotice?.('Reading aloud isn\u2019t available on this device, so the whole letter is shown for you to read.');
      this.cb.onUnavailable?.();
    }

    _setState(s) { if (this.state === s) return; this.state = s; this.cb.onState?.(s); }
  }

  window.DrosieNarration = { Narrator };
})();
