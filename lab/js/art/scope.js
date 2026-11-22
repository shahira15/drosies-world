/* scope.js (art): original illustration of a pillar-stand STEREOMICROSCOPE (dissecting microscope).
 * Parts follow real stereomicroscope terminology: eyepieces (binocular head), zoom (magnification) dial,
 * focus knob (one focusing mechanism that raises/lowers the whole optical head), objective, stage plate with clips,
 * and a transmitted-light base (illuminator) with power switch and brightness dial.
 *
 * Every dynamic piece has an id built from the prefix p so the same artwork can be used twice on the page.
 *   {p}focusG   group that slides up/down with the focus knob
 *   {p}fknob    focus knob (rotates)          {p}ridges  zoom-ring grip pattern (slides)
 *   {p}dial     brightness dial (rotates)     {p}sw      power rocker     {p}led  power lamp
 *   {p}glow     light under the stage plate   {p}spec    specimen on the stage
 */
(function () {
  'use strict';
  const DW = window.DW;
  const A = (DW.art = DW.art || {});

  A.scopeInner = function (p) {
    p = p || 'sc-';
    const notches = [...Array(20)].map((_, i) => `<rect x="-3" y="-41" width="6" height="9" rx="2" transform="rotate(${i * 18})" fill="#1d2a32"/>`).join('');
    const dialTicks = [...Array(9)].map((_, i) => `<rect x="-1" y="-24" width="2" height="5" transform="rotate(${-120 + i * 30})" fill="#6c8791"/>`).join('');
    const ridgeLines = [...Array(26)].map((_, i) => `<rect x="${i * 9}" y="0" width="3.200" height="30" fill="#0e171d" opacity=".75"/>`).join('');
    return `
    <defs>
      <linearGradient id="${p}base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e5ecea"/><stop offset=".25" stop-color="#bccaca"/><stop offset="1" stop-color="#7d9396"/></linearGradient>
      <linearGradient id="${p}metal" x1="0" x2="1"><stop offset="0" stop-color="#7f949a"/><stop offset=".3" stop-color="#e8f0ef"/><stop offset=".6" stop-color="#b3c4c6"/><stop offset="1" stop-color="#6f858b"/></linearGradient>
      <linearGradient id="${p}body" x1="0" x2="1"><stop offset="0" stop-color="#b9c8c8"/><stop offset=".35" stop-color="#f3f7f5"/><stop offset=".7" stop-color="#cbd8d8"/><stop offset="1" stop-color="#8ea3a7"/></linearGradient>
      <linearGradient id="${p}tube" x1="0" x2="1"><stop offset="0" stop-color="#16222b"/><stop offset=".4" stop-color="#3b5260"/><stop offset="1" stop-color="#101922"/></linearGradient>
      <radialGradient id="${p}plate" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c8d4d2"/></radialGradient>
      <radialGradient id="${p}glowg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4c4" stop-opacity=".95"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient>
      <radialGradient id="${p}knob" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#5d7782"/><stop offset="1" stop-color="#1c2a33"/></radialGradient>
      <clipPath id="${p}zclip"><rect x="240" y="286" width="108" height="30" rx="6"/></clipPath>
    </defs>
    <ellipse cx="300" cy="680" rx="255" ry="13" fill="#000" opacity=".35"/>

    <!-- BASE with transmitted illuminator -->
    <g class="part" data-part="light" tabindex="-1">
      <path d="M58 646Q58 602 108 598H492Q542 602 542 646V664Q542 676 524 676H76Q58 676 58 664Z" fill="url(#${p}base)" stroke="#5d777c" stroke-width="3"/>
      <path d="M112 600H488" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
      <g transform="translate(148 638)">
        <circle r="27" fill="#a9bbbc" stroke="#5d777c" stroke-width="2"/>
        <g id="${p}dial"><circle r="20" fill="url(#${p}knob)" stroke="#0f1b22" stroke-width="2"/>${dialTicks}<rect x="-2.200" y="-19" width="4.400" height="12" rx="2" fill="#ffd36b"/></g>
      </g>
      <g transform="translate(103 626)" fill="#35505a"><circle r="3"/><g stroke="#35505a" stroke-width="2" stroke-linecap="round"><path d="M0 -8v-3M0 8v3M-8 0h-3M8 0h3M-6 -6l-2 -2M6 6l2 2M6 -6l2 -2M-6 6l-2 2"/></g></g>
      <g transform="translate(446 638)">
        <rect x="-26" y="-16" width="52" height="32" rx="9" fill="#a9bbbc" stroke="#5d777c" stroke-width="2"/>
        <g id="${p}sw"><rect x="-19" y="-10" width="38" height="20" rx="7" fill="#1d2a32"/><rect id="${p}swk" x="-17" y="-8" width="19" height="16" rx="5" fill="#8fa5ad"/></g>
      </g>
      <circle id="${p}led" cx="392" cy="638" r="5" fill="#33454d"/>
      <ellipse class="halo" cx="148" cy="638" rx="42" ry="34"/><rect class="halo" x="404" y="610" width="82" height="56" rx="16"/>
    </g>

    <!-- STAGE with glass plate and clips -->
    <g class="part" data-part="stage" tabindex="-1">
      <path d="M150 604V574Q150 562 168 560H432Q450 562 450 574V604Z" fill="#2b3e48" stroke="#12202a" stroke-width="3"/>
      <ellipse id="${p}glow" cx="300" cy="556" rx="150" ry="26" fill="url(#${p}glowg)" opacity="0"/>
      <ellipse cx="300" cy="556" rx="132" ry="15" fill="url(#${p}plate)" stroke="#6e8a90" stroke-width="3"/>
      <ellipse cx="300" cy="553" rx="104" ry="9" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>
      <g fill="#7b9096" stroke="#3b525a" stroke-width="2"><path d="M168 552l40-9v7l-40 8z"/><path d="M432 552l-40-9v7l40 8z"/></g>
      <ellipse class="halo" cx="300" cy="556" rx="160" ry="30"/>
    </g>

    <!-- PILLAR -->
    <rect x="470" y="150" width="42" height="452" rx="12" fill="url(#${p}metal)" stroke="#53696f" stroke-width="3"/>
    <rect x="456" y="586" width="70" height="20" rx="8" fill="#9cb0b2" stroke="#53696f" stroke-width="3"/>

    <!-- FOCUS GROUP: knob block, arm, optical head, eyepieces, zoom, objective (slides up and down) -->
    <g id="${p}focusG">
      <rect x="268" y="316" width="190" height="40" rx="15" fill="url(#${p}metal)" stroke="#53696f" stroke-width="3"/>
      <rect x="434" y="296" width="98" height="132" rx="18" fill="url(#${p}body)" stroke="#53696f" stroke-width="3.500"/>
      <path d="M232 340L242 236Q244 212 268 210H334Q358 212 360 236L352 340Z" fill="url(#${p}body)" stroke="#53696f" stroke-width="3.500"/>
      <path d="M240 336L238 300H354L350 336Z" fill="#c4d2d2"/>

      <g class="part" data-part="eyepieces" tabindex="-1">
        <g transform="translate(262 224) rotate(-24)"><rect x="-23" y="-120" width="46" height="126" rx="9" fill="url(#${p}tube)" stroke="#0b1319" stroke-width="3"/><rect x="-26" y="-134" width="52" height="22" rx="8" fill="#10181e" stroke="#000" stroke-width="2"/><ellipse cx="0" cy="-136" rx="19" ry="6" fill="#8fd0e6" opacity=".85"/><path d="M-14 -100V-8" stroke="#fff" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/></g>
        <g transform="translate(330 224) rotate(20)"><rect x="-23" y="-120" width="46" height="126" rx="9" fill="url(#${p}tube)" stroke="#0b1319" stroke-width="3"/><rect x="-26" y="-134" width="52" height="22" rx="8" fill="#10181e" stroke="#000" stroke-width="2"/><ellipse cx="0" cy="-136" rx="19" ry="6" fill="#8fd0e6" opacity=".85"/><path d="M-14 -100V-8" stroke="#fff" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/></g>
        <ellipse class="halo" cx="268" cy="122" rx="104" ry="76"/>
      </g>

      <g class="part" data-part="zoom" tabindex="-1">
        <rect x="238" y="284" width="112" height="34" rx="8" fill="#1d2b33" stroke="#0b1319" stroke-width="3"/>
        <g clip-path="url(#${p}zclip)"><g id="${p}ridges">${ridgeLines}</g></g>
        <rect x="240" y="286" width="108" height="30" rx="6" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
        <rect class="halo" x="226" y="276" width="136" height="50" rx="16"/>
      </g>

      <g class="part" data-part="objective" tabindex="-1">
        <rect x="270" y="340" width="60" height="30" rx="7" fill="#27363f" stroke="#0b1319" stroke-width="3"/>
        <rect x="280" y="366" width="40" height="28" rx="6" fill="#1c2a32" stroke="#0b1319" stroke-width="3"/>
        <ellipse cx="300" cy="394" rx="16" ry="5.500" fill="#aee8ff" stroke="#0b1319" stroke-width="2"/>
        <path d="M284 350H316" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
        <ellipse class="halo" cx="300" cy="370" rx="44" ry="40"/>
      </g>

      <g class="part" data-part="focus" tabindex="-1">
        <g transform="translate(484 362)">
          <circle r="46" fill="#10191f" stroke="#0b1319" stroke-width="3"/>
          <g id="${p}fknob"><circle r="42" fill="url(#${p}knob)" stroke="#0b1319" stroke-width="2"/>${notches}<circle r="22" fill="#31454f" stroke="#0b1319" stroke-width="2"/><rect x="-3" y="-20" width="6" height="14" rx="3" fill="#ffd36b"/></g>
        </g>
        <circle class="halo" cx="484" cy="362" r="58"/>
      </g>
    </g>

    <!-- SPECIMEN ON STAGE -->
    <g id="${p}spec" opacity="0" transform="translate(300 547)">
      <g class="specmark"></g>
    </g>
    <g id="${p}callouts"></g>`;
  };

  /** Standalone SVG (workstation view) */
  A.scopeSVG = function (p, cls) {
    return `<svg class="scopesvg ${cls || ''}" viewBox="0 0 600 700" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stereomicroscope">${A.scopeInner(p)}</svg>`;
  };
})();
