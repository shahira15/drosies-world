/* chars.js (art): TEMPORARY placeholder vector characters for Dr. Maya and Drosie.
 *
 * THESE ARE NOT THE FINAL CHARACTERS. They are deliberately generic stand-ins, clearly tagged "TEMP ART",
 * so the dialogue, animation and HUD systems can be developed and tested. Your original illustrations replace
 * them by setting "provided": true for each character in js/manifest.js (see README). No game code changes needed.
 */
(function () {
  'use strict';
  const DW = window.DW;
  const A = (DW.art = DW.art || {});

  const tag = '<g class="tempTag"><rect x="52" y="226" width="96" height="20" rx="10" fill="#0d1a26" opacity=".85"/><text x="100" y="240" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10.500" font-weight="800" fill="#ffd36b" letter-spacing="1">TEMP ART</text></g>';

  A.maya = function (state) {
    state = state || 'neutral';
    const happy = state === 'happy' || state === 'celebrate';
    const think = state === 'think';
    const eyes = happy
      ? '<path d="M70 104q9-11 18 0M112 104q9-11 18 0" stroke="#2b1a14" stroke-width="4" fill="none" stroke-linecap="round"/>'
      : `<g class="blink"><ellipse cx="79" cy="104" rx="6" ry="7.500" fill="#2b1a14"/><ellipse cx="121" cy="104" rx="6" ry="7.500" fill="#2b1a14"/><circle cx="81" cy="101" r="2" fill="#fff"/><circle cx="123" cy="101" r="2" fill="#fff"/></g>`;
    const mouth = happy
      ? '<path d="M82 128q18 20 36 0z" fill="#8a2f3b" stroke="#6a1f2b" stroke-width="2.500" stroke-linejoin="round"/>'
      : '<g class="mouthA"><path d="M86 128q14 10 28 0" stroke="#8a2f3b" stroke-width="4" fill="none" stroke-linecap="round"/></g><g class="mouthB"><ellipse cx="100" cy="132" rx="9" ry="7" fill="#8a2f3b"/></g>';
    const brow = think ? '<path d="M66 90q12-8 24-2M108 86q12-6 26 2" stroke="#2b1a14" stroke-width="4" fill="none" stroke-linecap="round"/>' : '<path d="M66 92q12-6 24-2M110 90q12-4 24 2" stroke="#2b1a14" stroke-width="3.500" fill="none" stroke-linecap="round"/>';
    return `<svg class="char maya ${state}" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dr. Maya (temporary art)">
      <g class="bob">
        <circle cx="100" cy="46" r="22" fill="#2b1a14"/>
        <path d="M46 104C40 50 70 24 100 24S160 50 154 104C150 70 130 56 100 56S50 70 46 104Z" fill="#2b1a14"/>
        <path d="M30 250V214Q30 176 76 168H124Q170 176 170 214V250Z" fill="#f4f8f6" stroke="#b9cdd0" stroke-width="3"/>
        <path d="M76 168L100 206L124 168Z" fill="#2f8f8a"/><path d="M72 168L100 214L82 250H30V214Q30 176 72 168Z" fill="#f4f8f6" stroke="#b9cdd0" stroke-width="3"/><path d="M128 168L100 214L118 250H170V214Q170 176 128 168Z" fill="#f4f8f6" stroke="#b9cdd0" stroke-width="3"/>
        <rect x="88" y="152" width="24" height="22" rx="8" fill="#b9754f"/>
        <ellipse cx="100" cy="108" rx="48" ry="52" fill="#c98660" stroke="#a96a46" stroke-width="3"/>
        <path d="M54 96C60 60 90 50 100 50C122 50 146 62 148 98C134 78 116 72 100 72S66 78 54 96Z" fill="#2b1a14"/>
        ${eyes}${brow}
        <g fill="none" stroke="#3a5560" stroke-width="3.500"><rect x="60" y="92" width="38" height="28" rx="12"/><rect x="102" y="92" width="38" height="28" rx="12"/><path d="M98 104h4"/></g>
        <circle cx="68" cy="124" r="7" fill="#e8907a" opacity=".45"/><circle cx="132" cy="124" r="7" fill="#e8907a" opacity=".45"/>
        ${mouth}
        <rect x="128" y="190" width="26" height="30" rx="4" fill="#e9f3f2" stroke="#9fb9bd" stroke-width="2"/><path d="M134 200h14M134 207h10" stroke="#6fa0b3" stroke-width="2.500"/>
      </g>${tag}</svg>`;
  };

  A.drosie = function (state) {
    state = state || 'idle';
    const happy = state === 'happy' || state === 'celebrate';
    const mouth = happy ? '<path d="M84 134q16 20 32 0z" fill="#7a2230" stroke="#5a1520" stroke-width="2.500" stroke-linejoin="round"/>' : '<path d="M86 134q14 12 28 0" stroke="#5a1520" stroke-width="4" fill="none" stroke-linecap="round"/>';
    return `<svg class="char drosie ${state}" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Drosie the fruit fly (temporary art)">
      <g class="bob">
        <g class="wingL" style="transform-origin:78px 168px"><path d="M78 168C30 150 6 110 22 84C46 74 80 112 78 168Z" fill="#eaf6f2" fill-opacity=".72" stroke="#9fc3bd" stroke-width="3"/><path d="M72 160C50 136 36 112 30 92" stroke="#9fc3bd" stroke-width="2" fill="none"/></g>
        <g class="wingR" style="transform-origin:122px 168px"><path d="M122 168C170 150 194 110 178 84C154 74 120 112 122 168Z" fill="#eaf6f2" fill-opacity=".72" stroke="#9fc3bd" stroke-width="3"/><path d="M128 160C150 136 164 112 170 92" stroke="#9fc3bd" stroke-width="2" fill="none"/></g>
        <ellipse cx="100" cy="186" rx="40" ry="46" fill="#d9a560" stroke="#8a5d2a" stroke-width="3.500"/>
        <path d="M64 176Q100 190 136 176M62 194Q100 208 138 194M68 212Q100 224 132 212" stroke="#6b4720" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>
        <path d="M90 58Q82 36 62 30M110 58Q118 36 138 30" stroke="#6b4720" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="62" cy="30" r="5" fill="#d9a560" stroke="#6b4720" stroke-width="2.500"/><circle cx="138" cy="30" r="5" fill="#d9a560" stroke="#6b4720" stroke-width="2.500"/>
        <ellipse cx="100" cy="106" rx="56" ry="52" fill="#e0b06c" stroke="#8a5d2a" stroke-width="3.500"/>
        <ellipse cx="68" cy="100" rx="26" ry="32" transform="rotate(12 68 100)" fill="#c8283a" stroke="#7a1522" stroke-width="3.500"/><ellipse cx="132" cy="100" rx="26" ry="32" transform="rotate(-12 132 100)" fill="#c8283a" stroke="#7a1522" stroke-width="3.500"/>
        <g class="blink"><circle cx="72" cy="104" r="11" fill="#fff"/><circle cx="128" cy="104" r="11" fill="#fff"/><circle cx="75" cy="106" r="6.500" fill="#2b1218"/><circle cx="125" cy="106" r="6.500" fill="#2b1218"/><circle cx="77" cy="103" r="2.200" fill="#fff"/><circle cx="127" cy="103" r="2.200" fill="#fff"/></g>
        <circle cx="86" cy="130" r="6" fill="#ff8c7a" opacity=".5"/><circle cx="114" cy="130" r="6" fill="#ff8c7a" opacity=".5"/>
        ${mouth}
      </g>${tag}</svg>`;
  };

  /** Small flying Drosie used as the cursor companion in the lab (no tag, tiny). */
  A.drosieFly = function () {
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g class="wingL" style="transform-origin:50px 62px"><path d="M50 62C22 52 8 30 18 14C34 12 54 34 50 62Z" fill="#eaf6f2" fill-opacity=".8" stroke="#9fc3bd" stroke-width="2"/></g>
      <g class="wingR" style="transform-origin:70px 62px"><path d="M70 62C98 52 112 30 102 14C86 12 66 34 70 62Z" fill="#eaf6f2" fill-opacity=".8" stroke="#9fc3bd" stroke-width="2"/></g>
      <ellipse cx="60" cy="78" rx="19" ry="22" fill="#d9a560" stroke="#8a5d2a" stroke-width="2.500"/>
      <ellipse cx="60" cy="50" rx="25" ry="22" fill="#e0b06c" stroke="#8a5d2a" stroke-width="2.500"/>
      <ellipse cx="46" cy="48" rx="12" ry="15" fill="#c8283a" stroke="#7a1522" stroke-width="2.500"/><ellipse cx="74" cy="48" rx="12" ry="15" fill="#c8283a" stroke="#7a1522" stroke-width="2.500"/>
      <circle cx="48" cy="50" r="5" fill="#fff"/><circle cx="72" cy="50" r="5" fill="#fff"/><circle cx="49" cy="51" r="2.800" fill="#2b1218"/><circle cx="71" cy="51" r="2.800" fill="#2b1218"/>
      <path d="M52 62q8 7 16 0" stroke="#5a1520" stroke-width="2.500" fill="none" stroke-linecap="round"/>
    </svg>`;
  };
})();
