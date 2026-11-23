/*
 * LETTERS FROM DROSIE: phrase splitting (shared by the letter and tools/cue-maker.html)
 * Phrase IDs: "p<page>-b<block>-s<phrase>", counted from 1.
 */
(function () {
  'use strict';
  function split(text) {
    if (Array.isArray(text)) return text.slice();
    // protect abbreviations so "Dr. Maya" and "P.S." are not split mid-sentence
    const safe = String(text).replace(/\b(?:Dr|Mr|Mrs|Ms|Prof|St)\.|\bP\.S\./g, m => m.replace(/\./g, '\u0001'));
    const out = safe.match(/[^.!?…]+(?:[.!?…]+)[”’"')]*\s*|[^.!?…]+$/g) || [safe];
    return out.map(s => s.replace(/\u0001/g, '.').trim()).filter(Boolean);
  }
  function list(letter) {
    const out = [];
    letter.pages.forEach((page, pi) => page.forEach((block, bi) => split(block.text).forEach((text, si) => {
      out.push({ id: `p${pi + 1}-b${bi + 1}-s${si + 1}`, page: pi, block: bi, index: si, text, type: block.type });
    })));
    return out;
  }
  window.DrosiePhrases = { split, list };
})();
