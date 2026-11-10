# Cozy Solitaire V3 — Real tabletop art, created by the design workstream

The design branch includes two **standalone, real renderable SVG assets**:

- `assets/v3-premium/tabletop/solitaire-felt-portrait.svg` (768×1280)
- `assets/v3-premium/tabletop/solitaire-felt-landscape.svg` (1280×720)

They contain only: textured green felt, wood/gold edge, botanical frame and a subtle emblem. **No cards, controls, text or HUD are baked in.** These are authored design assets rather than cropped screenshot artwork. They are visual source candidates for owner review, not pixel-exact raster illustrations from prior concept sheets.

A design-only `SolitaireScreen.tsx` integration sample on this branch uses the actual SVGs and moves landscape buttons away from tableau into their own right-side action area. It also adds a scrollable tableau viewport for long piles while preserving the game engine.

**Validation status:** Source reviewed; no TypeScript, Expo runtime or native device test has been run in this ChatGPT integration environment. **Do not merge into Claude's active UI until his latest changes have been reconciled and tests run.**

**Review gates:** 360×800, 390×844, 844×390. Verify actual drag/drop with scrolled columns and all four foundation piles. The current screen still requires native-device verification and final visual owner approval.
