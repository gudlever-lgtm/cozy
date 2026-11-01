# Cozy Solitaire — Living World Visual Integration (approved art direction)

## Priority and truthfulness
Visual direction has been approved: premium, lush storybook garden with beautiful illustrated seasonal landscapes and warm lighting, Millie gardening, Marmalade relaxing, birds, butterflies, fireflies, occasional petals/leaves/snowflakes. **The approved composite concept illustration is a visual reference, not a playable card board or separated sprite atlas. Do not crop playing cards, UI text or entire characters from its mockup and claim that they are native game assets.**

Existing usable native artwork:
- `public/assets/backgrounds/seasons/{spring,summer,autumn,winter}_cottage_garden.webp`
- `public/assets/backgrounds/seasons/{summer_evening_board,autumn_rain_board,winter_snow_board}.png`
- `public/assets/characters/{millie_rabbit,marmalade_cat}.png`
- `public/assets/{icons/ui_icons_sheet,resources/resources_sheet}.png`
- `public/assets/manifest.json`
- **New original illustration-source sprites** in `artwork/ambient/`: `firefly.svg`, `bird.svg`, `butterfly.svg`, `autumn-leaf.svg`, `snowflake.svg`, `flower-petal.svg`, `glimmer.svg`.

The SVGs are source illustrations. For the lowest-risk Expo native pipeline, generate well-antialiased transparent PNG (1x/2x/3x as appropriate) from the source SVGs during an asset preparation step, committing them under `assets/ambient/` and loading them with literal `require()`. Alternatively, use correctly installed/configured react-native-svg to render static SVG artwork natively. Do **not** refer to `/artwork/*.svg` as web URLs in the mobile app. Do not introduce React Native Web, web bundling, PWA or Capacitor. Use Expo EAS for Android AAB and iOS IPA only.

## Codex/Claude implementation request
1. Inspect the **latest** repo contents, do not assume source code or Expo app already exists. Read `docs/COZY_MASTER_GAME_DESIGN.md` and `docs/COZY_MASTER_CODEX_PROMPT.md`.
2. Safely scaffold/extend Expo + React Native + TypeScript if necessary, preserving existing assets and modules.
3. Build and document a static native asset catalog: four season scenes, two NPC portraits, seven ambient sprites, optional board variants. Validate all paths; generate optimized native-compatible assets and ensure transparent edges are clean.
4. Use seasonal backgrounds in Cottage Garden and behind playable card areas with a carefully controlled contrast/scrim so suits/ranks remain legible at phone sizes.
5. Add a **Living World Ambient Engine** with independent, sparse, graceful animations:
   - Summer dusk: 6–12 fireflies drift and softly brighten, not all synchronized.
   - Spring daytime: an occasional butterfly and single small bird.
   - Autumn: a handful of drifting leaves, optional light rain drawn efficiently.
   - Winter: gentle snowfall at variable depth/speed; window and lantern glow.
   - Millie: subtle idle poses near flowers, Marmalade: subtle sleeping/breathing; do not fake skeletal animation using one image if it creates distortion. Smooth translations/blinks are acceptable until proper frames exist.
6. Birds should follow curved paths where practical; true behind-tree occlusion requires independently authored foreground tree mask/layer. Without such an asset, keep bird motion within safe background sky bands rather than pretending to occlude.
7. Overlay layers use `pointerEvents="none"`, do not intercept drag/tap, pause when app is backgrounded, respect system reduced-motion, and support off/low/medium/high settings. Never animate every sprite with React state every frame.
8. Weather remains cosmetic only; no modifications to Solitaire rules, reward values or quest eligibility.
9. Full Danish and English labels and accessible settings. Persist ambience selection and manual/automatic season override independently of current game and username.
10. Test on representative phone sizes, check offline loading, app pause/resume, effect density and native performance. Verify actual EAS builds before claiming build readiness.
11. Generate missing sprite sizes/foreground masks only when art quality can be maintained. Report missing production assets distinctly; do not use mockups as game sprites.
12. Run available type checks/tests; commit completed, tested changes to a feature branch or safely push if working alone, preserving concurrent work.

## Suggested catalog
```ts
const AMBIENT_SPRITES = {
  firefly: require('../../assets/ambient/firefly.png'),
  bird: require('../../assets/ambient/bird.png'),
  butterfly: require('../../assets/ambient/butterfly.png'),
  leaf: require('../../assets/ambient/autumn-leaf.png'),
  snowflake: require('../../assets/ambient/snowflake.png'),
  petal: require('../../assets/ambient/flower-petal.png'),
  glimmer: require('../../assets/ambient/glimmer.png'),
} as const;
```
The require paths above are an **example** relative to `src/assets`; adapt to actual repo layout. Native `require` references must use literal paths.

## Definition of done
Actual bundled assets exist, manual and automatic seasonal selection works in Settings, sparse ambient animation works independently in all four seasons, Millie and Marmalade are integrated without obscuring the board, DA/EN text is complete, offline/resume/reduced-motion behavior is verified, and successful native builds are evidenced if available. Any gaps must be explicitly marked unverified or not implemented.
