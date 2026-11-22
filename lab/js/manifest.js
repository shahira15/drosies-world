/* manifest.js: ASSET MANIFEST.
 *
 * Every piece of art that can be swapped for your original illustrations is listed here.
 * The game ships with clearly labelled TEMPORARY vector placeholders for Drosie and Dr. Maya.
 *
 * To use your real artwork:
 *   1. Drop the PNG/WebP/SVG files into the folder named in "base".
 *   2. Use the exact file names listed under "states".
 *   3. Change "provided" from false to true.
 * Nothing else needs to change. The portrait system, dialogue box, HUD and companion will use your art.
 *
 * Recommended: transparent background, 512x512 px (portraits), same canvas size for every state
 * so the character does not jump when the expression changes.
 */
(function () {
  window.DW = window.DW || {};
  window.DW.manifest = {
    version: 1,
    characters: {
      maya: {
        name: 'Dr. Maya',
        provided: false,
        base: 'assets/characters/maya/',
        size: [512, 512],
        states: {
          neutral: 'neutral.png',     // standing / listening
          talk: 'talk.png',           // mid-sentence (mouth open). Optional: falls back to neutral
          happy: 'happy.png',         // pleased reaction
          think: 'think.png',         // hint / puzzled
          celebrate: 'celebrate.png', // badge and mission complete
        },
      },
      drosie: {
        name: 'Drosie',
        provided: false,
        base: 'assets/characters/drosie/',
        size: [512, 512],
        states: {
          idle: 'idle.png',
          happy: 'happy.png',
          think: 'think.png',
          celebrate: 'celebrate.png',
          fly: 'fly.png', // small flying pose used as the cursor companion in the lab
        },
      },
    },
    // Optional replacement art for big scene pieces (the game draws all of these itself, so these are not required).
    images: {},
    // Optional audio files. The game synthesizes all sound effects itself, so these are not required.
    audio: {},
  };
})();
