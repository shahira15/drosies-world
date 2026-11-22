# Integration with drosiesworld.com

The existing game at `https://drosiesworld.com/lab/` ("Drosie's World: The Secret Fly Lab") renders entirely with JavaScript, so its source files could not be inspected from outside. Its page metadata gives the theme colour `#0d1a26`, which Drosie Genetics Lab uses as its base colour.

**The new simulator is fully self-contained.** It shares no file names, global variables, CSS selectors or `localStorage` keys with other pages: its storage key is `drosie-genetics-lab:v1`, its only global is `window.__drosie`, and all CSS is scoped to its own document. Installing it cannot break existing games.

## Recommended placement
```
drosiesworld.com/
├── lab/                 ← existing Secret Fly Lab (unchanged)
└── genetics-lab/        ← copy this whole folder here
```
1. Copy the contents of `drosie-genetics-lab/` into `genetics-lab/` in the site's repository.
2. Commit and push. GitHub Pages serves it at `https://drosiesworld.com/genetics-lab/`.
3. Keep the `.nojekyll` file (harmless if the site already has one at the root).
4. Add a link from the site's navigation or from the Secret Fly Lab, for example:
   ```html
   <a href="/genetics-lab/">Drosie Genetics Lab — Breed. Predict. Discover.</a>
   ```

## Checklist after deploying
- Open `/genetics-lab/` and choose a level. The illustrated lab should appear.
- Open `/genetics-lab/tests/`. It should report **58 / 58 tests passed**.
- Open `/genetics-lab/teacher/` and `/genetics-lab/docs/`.
- Confirm `/lab/` still works (it shares nothing with the new folder).

## Optional deep links for the site
`/genetics-lab/?mode=little&mission=L1` · `/genetics-lab/?mode=researcher&mission=R1` · `/genetics-lab/?mode=university&demo=1`

## Branding hooks
The brand colours are CSS variables at the top of `css/styles.css` (`--bg`, `--amber`, `--cyan`). The Drosie character art is in `js/lab-scene.js` (`drosieSVG`) and `assets/favicon.svg`. If the main site uses a different Drosie design, replace the SVG paths there; nothing else depends on them.
