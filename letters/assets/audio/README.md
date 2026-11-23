# Drosie's narration: where the audio goes

Put the professional recording here:

```
letters/assets/audio/letter-01.mp3        ← the narration
letters/assets/audio/letter-01.cues.json  ← when each phrase starts (made with tools/cue-maker.html)
```

The letter detects both files automatically. No code changes are needed.

| Files present | What happens |
|---|---|
| neither | The device's built-in voice reads the letter (SpeechSynthesis). Highlighting is exact per phrase, because each phrase is spoken separately and highlighted when the device starts it. Word-by-word highlighting appears only where the browser reports word positions. |
| audio only | The recording plays and all words are shown in full. There is no highlighting, because there is no timing data to follow. |
| audio + cues | The recording plays and highlighting follows `audio.currentTime`. Pause, Resume, Replay, page turns and Mute all stay in sync. |

## Recording brief for the voice actor

- **Character:** Drosie, a tiny, kind fruit fly. Warm, gentle, sweet and sincere; calm, never shrill or babyish.
- **Pace:** unhurried, about 120–140 words per minute. Leave a natural breath between sentences and roughly one second between paragraphs.
- **Script:** read the text in `js/letter-data.js` exactly, in order: title is not read; start at *"My dearest little friend,"*, end with the P.S.
- **Format:** MP3, 128–192 kbps, mono or stereo, peak about −1 dBFS, no music bed under the words. A WAV master should be kept separately.
- **Other formats:** to use M4A/OGG instead, change `narration.audio` in `js/letter-data.js`.

## Making the cue file
1. Open `letters/tools/cue-maker.html` (on your site, or locally with a small web server).
2. Load the recording, press Play, and press Space each time Drosie *starts* the highlighted phrase.
3. Adjust any time with ±0.1 s, then click Preview to check.
4. Download `letter-01.cues.json` into this folder.

If you change the letter text after timing it, phrase IDs may shift. Re-open the cue maker, load your old cue file, and re-time the changed phrases.

## Cue file format
```json
{ "letter": "letter-01", "audio": "letter-01.mp3",
  "cues": [ { "id": "p1-b1-s1", "start": 0.40, "text": "My dearest little friend," }, … ] }
```
`id` is `p<page>-b<block>-s<phrase>`, counted from 1. `start` is in seconds. `text` is for humans only.
