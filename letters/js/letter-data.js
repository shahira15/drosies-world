/*
 * LETTERS FROM DROSIE — letter content (Letter No. 01)
 * =====================================================================
 * This file holds ONLY the words of the letter. The rendering, animation
 * and narration code never need to change when you edit it.
 *
 * ⚠ DRAFT TEXT. Everything after "And suddenly, I thought of you." is a
 *   placeholder written to match the opening you supplied. Replace it with
 *   your approved manuscript before publishing.
 *
 * HOW TO EDIT
 *  - `pages` is a list of pages. Each page is a list of blocks.
 *  - Block types:
 *      salutation  – handwritten greeting ("My dearest little friend,")
 *      p           – an ordinary paragraph (serif, easy to read)
 *      closing     – handwritten closing lines
 *      signature   – Drosie's signature (the ink drop lands here)
 *      ps          – the P.S.
 *  - Sentences inside a block are split automatically into phrases for
 *    narration highlighting. To control the split yourself, give `text`
 *    as an array of phrases instead of a single string.
 *  - `moment: true` makes Drosie glow softly while that block is read.
 *  - Keep each page to roughly 4–7 short paragraphs so children are not
 *    faced with a wall of text.
 *
 * Narration: see assets/audio/README.md. Phrase IDs are generated as
 * "p<page>-b<block>-s<phrase>" (all counted from 1), e.g. "p1-b2-s1".
 * If you edit the text after recording cue times, re-run tools/cue-maker.html.
 */
window.DROSIE_LETTER = {
  id: 'letter-01',
  number: 'Letter No. 01',
  title: "To the Little Scientist Who Doesn’t Know It Yet",
  subtitle: 'Some letters are meant to be read once. This one is meant to be kept.',
  draft: true, // set to false once the final manuscript is in place

  envelope: {
    to: 'To my dearest little friend',
    where: 'Somewhere in this big, wonderful world',
    from: 'With love, from Drosie'
  },

  narration: {
    // Professional narration (optional). If the audio file is missing or cannot
    // play, the letter falls back to the device's built-in voice.
    audio: 'assets/audio/letter-01.mp3',
    cues: 'assets/audio/letter-01.cues.json',
    // Built-in-voice fallback settings (voices differ between devices).
    tts: { rate: 0.86, pitch: 1.18, lang: 'en-US', pauseAfterPhrase: 260, pauseAfterBlock: 650 }
  },

  pages: [
    [
      { type: 'salutation', text: 'My dearest little friend,' },
      { type: 'p', text: 'Today, I asked Dr. Maya a question.' },
      { type: 'p', text: '“Do you think there is someone out there who might become a scientist one day, but doesn’t know it yet?”' },
      { type: 'p', text: 'She smiled.' },
      { type: 'p', text: ['“Oh, Drosie,” she said.', '“There are so many.”'] },
      { type: 'p', text: 'And suddenly, I thought of you.', moment: true }
    ],
    [
      { type: 'p', text: 'Maybe you have never worn a lab coat. Maybe you have never looked through a microscope. That is all right. Science does not begin with a lab coat. It begins with a question.' },
      { type: 'p', text: 'Have you ever wondered why the sky changes color at sunset? Or where a tiny ant is hurrying to? Have you ever turned over a leaf, just to see what was hiding underneath?' },
      { type: 'p', text: 'Then you have already done what scientists do. You noticed. You wondered. You looked a little closer.', moment: true }
    ],
    [
      { type: 'p', text: 'Here is a secret that grown-up scientists know. They make mistakes all the time. Experiments go wrong. Guesses turn out to be wrong. And every time, they learn something new.' },
      { type: 'p', text: 'So if you ever get something wrong, please don’t feel small. A mistake is not the end of a discovery. Very often, it is the beginning of one.' },
      { type: 'p', text: 'And if anyone ever tells you that science is only for some people, I hope you will remember this little letter. Science belongs to everyone who is curious. That means it belongs to you.', moment: true }
    ],
    [
      { type: 'p', text: 'I am a very small fly. But I have learned that small beginnings can lead to wonderful places.' },
      { type: 'p', text: 'So keep asking questions. Keep looking closely. Keep wondering out loud.' },
      { type: 'closing', text: ['With my tiniest wings', 'and my biggest heart,'] },
      { type: 'closing', text: 'Your little friend,' },
      { type: 'signature', text: 'Drosie', moment: true },
      { type: 'ps', text: 'P.S. Do you know someone who thinks science isn’t for them? Please tell them about this letter, and remind them that they belong too.' }
    ]
  ],

  keepsake: {
    heading: 'Dear Future Me,',
    lines: [
      'Today, I am small.',
      'I don’t know everything.',
      'I haven’t discovered all the things I will love.',
      'But I am curious.',
      'And I belong.'
    ],
    signoff: 'Love,',
    signature: 'Me.'
  }
};
