# Stage 5 Visual Audit — Cozy Solitaire 3.0

**Date:** 2026-11-10
**Scope:** every file in `assets/v3/` (57 total, per `assets/v3/manifest.json`), as actually
used by the current implementation on branch `claude/nifty-keller-o5b8bd`.

**Method:** read each SVG's own markup directly (intrinsic `width`/`height`, shapes,
colors) rather than trusting the manifest's `approved: true` flag as a proxy for visual
quality — per this stage's explicit instruction. Verified rendering with real screenshots
(Expo web bundle, react-native-web, rendered headlessly via the pre-installed Playwright
Chromium — **not** native iOS/Android, see the caveat in §4).

**No approved reference mockup image exists on disk** (`docs/DESIGN_APPROVAL_2026-11-10.md`
says so explicitly: "the image has not yet been committed to repository"). Every judgement
below about whether something "matches the visual concept" is against the written design
docs (`DESIGN_CONTRACT.md`, `docs/ASSET_SPEC.md`, `docs/UI_COMPONENT_CONTRACT_V3.md`) and
ordinary visual-design judgement, not against a pixel reference — I'm not claiming a
comparison that wasn't possible.

## 1. Classification legend

- **READY** — artwork and current rendering are both fine.
- **LAYOUT FIX** — artwork is fine; the component's sizing/positioning needed correcting
  (fixed in this pass unless noted).
- **ART REPLACEMENT REQUIRED** — the artwork itself doesn't deliver the intended look, no
  amount of rendering correction fixes it.
- **MISSING** — a asset the concept needs doesn't exist at all in `assets/v3/`.

## 2. Backgrounds — SUPERSEDED by Premium Art V1 (see §11)

The 4 geometric SVG season backgrounds (`garden-spring/summer/autumn/winter.svg`,
720×1280 each) and the Welcome screen's reuse of `garden-spring.svg` described in this
section when it was first written are **no longer rendered by any screen** as of the
Premium Art V1 integration (commit `889ae538` + this pass's fixes). They remain in
`assets/v3/backgrounds/` untouched (not deleted — still the owner-approved SVG baseline,
available as a fallback) but `WelcomeScreen` and `GardenScreen` now use
`assets/v3-premium/backgrounds/*.png` instead. See §11 for the full findings on the new
art. The original critique (single small vignette, not an explorable world) is **carried
forward** — the premium pack's own README says explicitly it is "raster 2D backdrops, not
a multi-layer free-roaming garden world" — so this is not resolved, only visually upgraded.

## 3. Cards (`assets/v3/cards/*.svg`)

| File | Intrinsic | Used by | Display | Aspect | Classification |
|---|---|---|---|---|---|
| `face-blank.svg`, `face-botanical.svg`, `face-woodland.svg` | 190×270 each | `PlayingCard` | `cardWidth` × `cardWidth·270/190` (SolitaireScreen) | 19:27 exact | **READY** |
| `back-botanical.svg`, `back-stars.svg`, `back-woodland.svg` | 190×270 each | `PlayingCard` | same | 19:27 | **READY** |

Plain solid fills (no gradients), simple bordered rounded rects — render correctly and
match the card-game "cozy storybook" aesthetic reasonably well. Rank/suit are native Text
in the reserved corner slots, per `docs/ASSET_SPEC.md`.

## 4. Garden decorations (`assets/v3/decorations/*.svg`)

| File | Intrinsic | Used by | Classification |
|---|---|---|---|
| `bench.svg`, `birdhouse.svg`, `flower-cart.svg`, `flower-pot.svg`, `fountain.svg`, `lantern.svg`, `trellis.svg`, `watering-can.svg` | 220×220 each | `GardenScreen` via `decorationCatalog.ts` | **LAYOUT FIX — fixed this pass** |

**The bug:** `decorationSizeFraction()` divided the asset's own intrinsic canvas size
(220×220 — just the SVG's artboard, not a "real-world" size) directly by the scene's
720×1280 units, making every decoration occupy ~30% of the scene width — essentially the
same scale as the house (~33%). A bench rendered nearly as tall as a tree. **Fixed**:
decorations now use a fixed 80-scene-unit footprint (`DECORATION_SCENE_SIZE` in
`decorationCatalog.ts`), chosen so a bench reads as roughly ⅓ the width of the house, which
is the proportion that looks right against the background's own geometry. The artwork
itself (clean, consistent line style, matches the storybook look) is fine — **READY** once
displayed at the corrected size.

## 5. Avatars (`assets/v3/avatars/*.svg`)

| File | Intrinsic | Used by | Classification |
|---|---|---|---|
| `bird.svg`, `cat.svg`, `fox.svg`, `hedgehog.svg`, `owl.svg`, `rabbit.svg` | 240×240 each | `CozyAvatar.tsx` (component exists; not yet mounted in any screen — Settings is still a Stage 5.5 placeholder) | **READY** (art), component wiring is Stage 5.5 work |

Six distinct, well-differentiated animal illustrations — no emoji fallback risk. Good fit
for a profile-avatar picker when Stage 5.5 wires it up.

## 6. Icons (`assets/v3/icons/*.svg`, 128×128 each)

| File | Used by | Classification |
|---|---|---|
| `cards.svg`, `garden.svg`, `mini.svg`, `quests.svg` | `CozyBottomNavigation` | **READY** |
| `settings.svg` | `MainScreen` header | **READY** |
| `hammer.svg` | `GardenScreen` build-mode toggle | **READY** |
| `hint.svg`, `undo.svg`, `play.svg`, `star.svg` | `SolitaireScreen` toolbar | **READY** |
| `close.svg` | `GardenScreen` decoration-remove, `CozyTooltip` dismiss | **READY** |
| `arrow-left.svg`, `basket.svg`, `chair.svg`, `flower.svg`, `home.svg`, `lock.svg`, `menu.svg` | *(none yet)* | **READY**, unused — candidates for Stage 5.4/5.5 (quest list, locked content, home/back nav, settings menu) |

All 18 icons are simple, legible, single-concept line-and-fill glyphs consistent with each
other. No icon needed a fallback or substitute.

## 7. UI chrome (`assets/v3/ui/*.svg`)

| File | Intrinsic | Used by | Classification |
|---|---|---|---|
| `button-primary.svg`, `-secondary.svg`, `-wood.svg`, `-special.svg`, `-disabled.svg` | 440×110 each | `CozyButton` | **LAYOUT FIX, partially resolved** — see the open defect below |
| `panel.svg` | 720×900 | `CozyPanel` | **LAYOUT FIX — fixed in the prior commit** (real 9-slice; see `NineSliceFrame.tsx`) |
| `panel-wide.svg` | 820×360 | `CozyPanel` (`wide` prop, not yet used by a screen) | **LAYOUT FIX — fixed**, same mechanism |
| `tab-background.svg` | 600×106 | `CozyBottomNavigation` | **LAYOUT FIX — fixed in the prior commit** (floating dock + horizontal 3-slice, not a stretched edge-to-edge strip) |
| `icon-button.svg` | 112×112 | `CozyIconButton` | **READY** |
| `hud-pill.svg` | 320×82 | `CozyHUDChip` | **READY** — confirmed rendering a real top-to-bottom gradient via direct pixel sampling, not just visual impression |
| `card-slot.svg` | 180×255 | `PlayingCard` (empty pile placeholder) | **READY** |
| `tooltip.svg` | 500×140 | `CozyTooltip` | **READY** |
| `header-banner.svg` | 680×142 | **now wired into `WelcomeScreen`** this pass (previously unused) | **READY** |
| `progress-fill.svg`, `progress-track.svg` | 460×46 each | *(none yet — no `CozyProgress` component built)* | **READY**, unused until Stage 5.4 quest progress bars |

### Open defect: `button-primary.svg` gradient intermittently invisible

Confirmed via direct screenshots and pixel sampling (not visual impression): on the
Solitaire victory overlay, specifically, `CozyButton`'s green/gold gradient fill
occasionally doesn't paint, leaving a washed-out pale pill instead. The **same component,
same file**, renders correctly on the Welcome screen. Two separate, now-fixed bugs were
ruled out (cross-asset id collisions, dangling `filter` references — see
`svgr.config.js`'s comments and the Stage 5.3 commit message for the full investigation).
What's left looks like a browser/web-SVG rendering-order quirk specific to many SVGs
mounting at once (52+ cards + the overlay), not a static markup defect — it needs
**on-device native verification** to know whether it reproduces outside the web preview
this session is limited to (react-native-svg uses a different, Skia-based renderer
natively). Classified **LAYOUT FIX, not fully resolved** — tracked, not hidden.

## 8. Summary counts

| Classification | Count | Notes |
|---|---|---|
| READY | 36 | cards (6), avatars (6), 15 of 18 icons, 9 of 15 UI chrome files |
| LAYOUT FIX (resolved this pass or earlier) | 8 | decorations (8, this pass) + panel/panel-wide/tab-background (3, prior commit) — counted once by file group |
| LAYOUT FIX (open) | 5 | the 4 button variants + disabled, pending the gradient-flicker investigation above |
| ART REPLACEMENT REQUIRED | 4 | the four seasonal garden backgrounds |
| MISSING | — | see `docs/STAGE5_MISSING_ASSETS.md` — these are assets with **no file at all**, not a classification of an existing one |

## 9. What changed this pass (files)

- `src/ui/theme/decorationCatalog.ts` — decoration scene size 220→80 units (bug fix)
- `src/screens/WelcomeScreen.tsx` — removed the invented dark overlay box; now uses
  `assets/v3/ui/header-banner.svg` (an approved, previously-unused asset) as the title
  frame; added a deliberate landscape composition (already done in the prior pass, kept)
- `src/screens/GardenScreen.tsx` — selection indicator changed from a hard black rectangle
  to a soft gold glow; the floating, backdrop-less rotate/remove buttons replaced with a
  proper `CozyPanel`-backed toolbar with an instruction label
- `src/ui/components/CozyIconButton.tsx` — `selected` prop now has a visible effect (a
  gold ring), previously silently accepted but not rendered

## 10. Visual validation performed

See screenshots sent directly to the user (not committed to the repo) at 360×800, 390×844,
844×390 landscape, and a 768×1024 tablet size, for: Welcome, Garden, Garden build/selection
mode, the bottom navigation bar, and Solitaire. All captured from the real Expo web bundle
via Playwright, not mockups. **This is web-rendered verification, not native iOS/Android
device verification** — `docs/UI_COMPONENT_CONTRACT_V3.md` requires the latter before
production, and this container has no simulator to provide it.

## 11. Premium Art V1 integration QA (this pass)

Full integration report lives in `docs/PREMIUM_ART_IMPORT.md`. This section records what
changed and what was found/fixed specifically during this QA pass (after the initial
import in commit `889ae538`):

**Two real bugs found and fixed, not cosmetic tuning:**

1. **Welcome background ignored its container size on web.** `<Image
   style={StyleSheet.absoluteFillObject} resizeMode="cover" />` rendered at the PNG's
   bundled intrinsic size (768×1280) instead of filling the screen — confirmed via
   `getBoundingClientRect()` on the live DOM `<img>`, not assumed from a screenshot. This
   was invisible in portrait by coincidence (768 vs ~390 screen width, content already
   roughly centered) but produced a visible blank grey gap on the right in landscape
   (844 screen width > 768 image width). **Fixed**: explicit `width: "100%", height:
   "100%"` in the style array alongside `absoluteFillObject`.
2. **Garden camera started anchored at the scene's top-left corner.** Harmless for the
   old uniform SVGs, but the premium backgrounds' sharp painted content sits roughly in
   the vertical middle with blurred fill above/below (measured per-row image-sharpness,
   see `docs/PREMIUM_ART_IMPORT.md`). At landscape's wide/short aspect, cover-zoom
   stretches the scene tall enough that a top-left start showed almost nothing but
   blurred sky — confirmed via screenshot. **Fixed**: a new `createCenteredGarden()`
   helper in `GardenScreen.tsx` re-centers a *freshly created* garden's camera
   vertically on the scene midpoint (reusing the existing pure `pan()` function, no
   domain changes); a loaded save keeps the player's own last camera position
   untouched.

**Checked and confirmed working, not just re-screenshotted:**
- Millie and Marmalade are visible, reasonably sized (~130 scene units, clearly smaller
  than the house) and never covered by the HUD at any of the 3 required viewport sizes.
- Zoom/pan, decoration placement, selection, move and 45°-rotation all still work
  end-to-end (verified via the same tap/drag Playwright flows as the Stage 5.3 pass).
- The Lysglimt HUD chip now reads from the real `RewardLedger`
  (`src/ui/providers/RewardLedgerContext.tsx`, AsyncStorage-backed) instead of a
  hardcoded `0` — it still *displays* 0 on a fresh install because no gameplay grants
  Lysglimt yet (that's Stage 5.4), but the plumbing is real, not a literal.
- Danish/English strings for build mode, the selection toolbar, and all 8 decoration
  accessibility labels were hardcoded Danish (or in two cases raw English or the kind's
  internal id, e.g. accessibility label `"flower-cart"`) — moved into
  `src/i18n/strings.ts` with both locales.

**Still open (unchanged from `docs/PREMIUM_ART_IMPORT.md`):** the blurred-margin seam
where cover-fit still shows some blur at certain pan positions (not eliminated, only
the worst top-left-anchored case fixed), and the character cutouts' hard-edged alpha
mask with minor stray artifacts on Marmalade.

**Verified on:** web only (Expo web bundle, react-native-web, headless Chromium via
Playwright) at 360×800, 390×844 and 844×390 landscape, for Welcome, Garden, Garden
build menu and Garden object-editing. **Not verified on Android or iOS** — this
container has no simulator/emulator for either; do not treat the web result as
equivalent to native, since `react-native-svg`'s native (Skia) renderer and
`react-native`'s native `Image` component are different code paths from their web
counterparts (the two bugs above were both web-rendering-path-specific findings).
