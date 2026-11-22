/* icons.js: original line-icon set (24x24, stroke based). No emoji anywhere in the game UI. */
(function () {
  'use strict';
  const DW = window.DW;
  const P = {
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 22H20v-4"/><path d="M9 8h7M9 11.5h5"/>',
    bag: '<path d="M5 8h14l1 12.5H4z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
    pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    restart: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
    sound: '<path d="M4 9.5v5h4l5 4V5.5l-5 4z"/><path d="M16.5 9a4.5 4.5 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>',
    mute: '<path d="M4 9.5v5h4l5 4V5.5l-5 4z"/><path d="M17 9.5l4 5M21 9.5l-4 5"/>',
    music: '<path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    speech: '<path d="M4 5h16v11H11l-5 4v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    bulb: '<path d="M9.5 18h5M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
    scope: '<path d="M6.5 3.5l3 5M15 3l-1.5 5.5"/><rect x="8" y="8.5" width="8" height="5.5" rx="1.5"/><path d="M12 14v3.5"/><path d="M5 21h14M7.5 18.5h9"/><path d="M18 9v12"/>',
    lens: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    vial: '<path d="M8.5 3h7M9.5 3v15a2.5 2.5 0 0 0 5 0V3"/><path d="M9.5 12h5"/>',
    brush: '<path d="M20.5 3.5L11 13"/><path d="M11 13c-3-.5-5 1.5-5 3.5 0 1.5-1 2.5-2.5 4 3.5.5 8 0 8.5-3.5.3-1.5-.2-2.9-1-4z"/>',
    pad: '<rect x="3" y="8" width="18" height="9" rx="2.5"/><path d="M7 12.5h.01M11 12.5h.01M15 12.5h.01M19 12.5h.01"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.8l-5.4 3 1.1-6.1L3.2 9.4l6.1-.8z"/>',
    medal: '<circle cx="12" cy="14.5" r="5.5"/><path d="M8 3l4 6.5L16 3"/><path d="M10 14.5l1.6 1.6 2.6-3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    lock: '<rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    left: '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    right: '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
    up: '<path d="M5.5 14.5L12 8l6.5 6.5"/>',
    down: '<path d="M5.5 9.5L12 16l6.5-6.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    flask: '<path d="M9 3h6M10 3v6L4.7 18.5a2 2 0 0 0 1.7 3h11.2a2 2 0 0 0 1.7-3L14 9V3"/><path d="M7.5 15h9"/>',
    fly: '<ellipse cx="12" cy="14.5" rx="3" ry="5"/><circle cx="12" cy="8" r="2.3"/><path d="M9.2 12.5C5 11 3 7 5 5.5s5 2 5 5M14.8 12.5c4.2-1.5 6.200-5.500 4.200-7s-5 2-5 5"/>',
    pin: '<path d="M12 21s-6.500-5.800-6.500-11a6.500 6.500 0 0 1 13 0c0 5.200-6.500 11-6.500 11z"/><circle cx="12" cy="10" r="2.300"/>',
    hand: '<path d="M9 11V5.500a1.500 1.500 0 0 1 3 0V10l5.200 1.100a2 2 0 0 1 1.500 2.400L17.500 19H9.500L5 14l1.300-1.300L9 14.500z"/>',
    sparkle: '<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z"/><path d="M19 17v4M17 19h4"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.500"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M18.700 5.300l-1.800 1.800M7.100 16.900l-1.800 1.800"/>',
    home: '<path d="M3.500 11.500L12 4l8.500 7.500"/><path d="M6 10v10h12V10"/>',
    note: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/>',
    female: '<circle cx="12" cy="8.500" r="5"/><path d="M12 13.500V21M8.500 17.500h7"/>',
    male: '<circle cx="10" cy="14" r="5"/><path d="M13.500 10.500L20 4M14.500 4H20v5.500"/>',
  };
  DW.icon = function (name, size) {
    const s = size || 22;
    return '<svg class="ic" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  };
  DW.iconNames = Object.keys(P);
})();
