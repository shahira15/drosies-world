# Accessibility
Target: WCAG 2.2 AA. **Status: partially tested, not certified.**
## What was tested (2026-11-27)
- **axe-core in real Chromium** (tools/audit_ui.py): 18 page views (15 pages at 1366 px + 3 at 390 px). Initial run found 2 rule types (serious `color-contrast` on 15 views; moderate `heading-order` on 4). Fixed (stronger caption colour, real h2 headings). Re-run: **0 violations** (audit/ui_audit_v0.3_after.json; before-state kept in audit/ui_audit_v0.3_before.json).
- **Keyboard walk** (40 Tab presses on Home): focus moves through distinct real controls (20 distinct targets), no keyboard trap, visible focus ring (global 3 px outline added).
- Visual inspection of screenshots at desktop and mobile widths; RoB plots print text in cells; PRISMA and forest plots are SVG with title/description; colour is never the only signal.
- Reduced-motion media query honoured.
## Not done / limits
- Automated tools find only a subset of problems; **no screen-reader (NVDA/JAWS/VoiceOver) test, no manual keyboard test of every control, no zoom/reflow audit at 400%, no cognitive-accessibility review.**
- Plotly charts lack long text alternatives; Streamlit components are third-party; no skip-to-content link (Streamlit controls the page shell).
- Run `METALAB_UI_AUDIT=1 python3 -m pytest -q tests/test_ui_audit.py` after UI changes (CI job included, not yet run on GitHub).
