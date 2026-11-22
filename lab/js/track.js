/* track.js: privacy-conscious GoatCounter events.
 *
 * - Sends only anonymous event names (e.g. "mission-3-completed"). No names, emails, IDs or free text.
 * - Respects the browser's Do Not Track setting.
 * - Each milestone is sent once per play session.
 * - If GoatCounter is blocked or offline, the game keeps working silently.
 * - Endpoint is set by the <script data-goatcounter="https://drosiesworld.goatcounter.com/count"> tag in index.html.
 */
(function () {
  'use strict';
  const DW = (window.DW = window.DW || {});
  const sent = new Set();
  const queue = [];
  let timer = null;

  const dnt = () => navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';

  function flush() {
    const gc = window.goatcounter;
    if (!gc || typeof gc.count !== 'function') return false;
    while (queue.length) {
      const ev = queue.shift();
      try { gc.count({ path: 'secret-fly-lab/' + ev.name, title: ev.title, event: true }); } catch (e) { /* ignore */ }
    }
    return true;
  }

  DW.track = function (name, title) {
    if (dnt() || sent.has(name)) return;
    sent.add(name);
    queue.push({ name, title: title || name });
    if (!flush() && !timer) {
      let tries = 0;
      timer = setInterval(() => {
        if (flush() || ++tries > 12) { clearInterval(timer); timer = null; }
      }, 1000);
    }
  };
  DW.track.reset = () => sent.clear();

  // Event names used by the game (documented in README)
  DW.EVENTS = {
    start: 'game-started',
    mission: (n) => 'mission-' + n + '-completed',
    microscope: 'microscope-activity-completed',
    anatomy: 'anatomy-exploration-completed',
    detective: 'fly-detective-completed',
    complete: 'game-completed',
  };
})();
