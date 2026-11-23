# Letters from Drosie

An interactive letter-opening experience for **drosiesworld.com/letters/**. A child opens a little mailbox and breaks a wax seal. The letter unfolds, and Drosie reads it aloud while the words are inked in. A keepsake note is tucked inside at the end.

Plain HTML, CSS and JavaScript. No build step, no frameworks, no accounts, no server and no paid services.

## Deploy (GitHub Pages)
1. Copy this whole `letters/` folder into the **root** of your site repository, next to `index.html` and `drosie.png.png`:
   ```
   your-repo/
   ├── index.html          (your homepage: not modified)
   ├── drosie.png.png      (your Drosie artwork: used as-is)
   ├── lab/                (Secret Fly Lab: not touched)
   └── letters/            ← this folder
   ```
2. Commit and push. The experience appears at `https://drosiesworld.com/letters/`.
3. Optional: add the homepage invitation (see `homepage-integration/README.md`).

The page loads Drosie from `../drosie.png.png`, so it must sit one level below the site root. If the image ever fails to load, a gentle placeholder appears and nothing breaks.

## Files
```
letters/
├── index.html                  the experience (all three scenes + keepsake)
├── css/letters.css             all styles, including print (US Letter) and reduced motion
├── js/letter-data.js           ← THE LETTER TEXT (edit this to change the words)
├── js/phrases.js               splits text into phrases for narration highlighting
├── js/narration.js             recorded audio + cue sync, device-voice fallback
├── js/sfx.js                   soft synthesized sound effects (no audio files)
├── js/app.js                   scenes, animations, ink drop, keepsake, printing
├── assets/audio/README.md      ← how to add Drosie's recorded voice
├── assets/illustrations/       sprig.svg, wax-seal.svg (also used by the homepage snippet)
├── tools/cue-maker.html        tap-along tool that times a recording to the text
└── homepage-integration/       invitation snippet + instructions
```

## Replacing the letter with your final manuscript
The text after *"And suddenly, I thought of you."* is a **placeholder draft** written to match your opening. Replace it in `js/letter-data.js`:
- Each page is a list of blocks: `salutation`, `p`, `closing`, `signature`, `ps`.
- Keep pages to roughly 4–7 short paragraphs.
- Set `draft: false` to remove the "Draft text" note under the title.
- The keepsake note is in the same file (`keepsake`).

No other file needs to change.

## Drosie's voice: the remaining step for a professional narration
Right now Drosie reads with the **device's built-in voice**. The page says so, because these voices vary between devices and often won't sound like a sweet little fly.

For the real Drosie voice:
1. Record the letter with a voice actor (brief in `assets/audio/README.md`).
2. Save it as `assets/audio/letter-01.mp3`.
3. Open `tools/cue-maker.html`, tap Space as each phrase begins, and save `letter-01.cues.json` beside the MP3.

The page switches to the recording automatically. Highlighting then follows the audio clock, and pause, resume, replay, page turns and mute all stay in sync. Drosie's artwork is a still image, so there is **no lip-sync**: she floats gently and a small speaking indicator moves while she reads.

## How narration and highlighting behave
| Situation | Behavior |
|---|---|
| Recording + cue file | Phrase highlighting follows `audio.currentTime` exactly. Turning a page seeks the audio to that page. |
| Recording, no cue file | Audio plays; all words are shown in full (no guessed timing). |
| No recording | Device voice speaks one phrase at a time; each phrase lights up when the device actually starts speaking it. Word underlining appears only if the browser reports word boundaries. Pause stops at the current phrase; Resume restarts that phrase (the only behavior that is reliable across browsers). |
| No voice available | The page says so and shows the whole letter to read. |

Words that have been read **stay visible**. "Show all the words now" and "Read Silently" reveal everything at once. Audio never starts without a tap or keypress.

## Accessibility and privacy
- Every action works by keyboard. Focus moves to the next thing to do (seal → letter title → keepsake), and the keepsake dialog traps focus and closes with Esc. Arrow keys turn pages.
- Visible focus rings; touch targets at least 44 px; text-size control (90–140%); real HTML text throughout.
- `prefers-reduced-motion`: sequences become instant, there is no floating dust, and the ink stain appears without the falling drop. "Skip animation" is always available during the opening.
- No autoplay, no flashing. Sound effects are soft, synthesized, and can be switched off.
- **Stored on the device only** (`localStorage` key `drosie-letters:v1`): sound on/off, text size, and whether the letter has been opened. No names, emails, recordings, analytics or tracking. The only outside request is Google Fonts; the page falls back to Georgia if fonts can't load.

## Printing
"Print my keepsake" and "Print the whole letter" open the browser's print window with clean US Letter layouts (0.75 in margins, no buttons). To get a PDF, choose **"Save as PDF"** as the printer. A built-in PDF generator was not added, because it would need an extra library and browsers' "Save as PDF" gives better-quality text.

## Tested (headless Chrome, November 2026)
Opening sequence by mouse, touch and keyboard; Skip animation mid-sequence; seal → flap → letter → unfold hand-off; ink drop; audio-cue sync (play, pause, resume, page-turn seek, mute, replay, auto page turn, end); no-voice fallback; phone (360/390 px) and tablet layouts with no horizontal scroll; reduced motion; print layouts rendered to PDF; reload with `#letter`; browser Back/Forward; missing-image fallback; homepage popup once-per-browser behavior; cue maker.

**Not tested:** Safari/iOS and Firefox, real screen readers (VoiceOver/NVDA), and how built-in voices sound on actual phones and tablets. Please try it on the devices your readers use.
