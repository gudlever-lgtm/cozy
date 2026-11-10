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

## 2. Backgrounds (`assets/v3/backgrounds/*.svg`)

| File | Intrinsic | Used by | Display | Aspect | Classification |
|---|---|---|---|---|---|
| `garden-spring.svg` | 720×1280 | `WelcomeScreen`, `GardenScreen` | fullscreen, `preserveAspectRatio="xMidYMid slice"` (Welcome) / exact scene-unit sizing (Garden) | 9:16, matches both | **ART REPLACEMENT REQUIRED** (see below) |
| `garden-summer.svg` / `-autumn.svg` / `-winter.svg` | 720×1280 each | `GardenScreen` (season switch) | same as spring | 9:16 | **ART REPLACEMENT REQUIRED** |

**Why "art replacement required" despite being structurally correct and previously
approved as a technical baseline:** each background is one sky gradient, one sun/moon
circle, two flat hill shapes, one house, two tree-circles and 3–4 flower clusters — a
single small vignette, not a garden *world*. I measured the house (~235 scene units wide)
and each tree (~250 units wide, i.e. ⅓ of the 720-unit canvas) directly from the file's own
path/circle coordinates. On a phone screen at cover-zoom this reads as "a tiny yard with two
huge trees crowding a shed", not the "world the player can explore" the master prompt and
Stage 5 instructions call for. This is a content/composition limitation in the art itself —
rendering it correctly (which it now is, see §4) cannot fix it. It is visually serviceable
as a placeholder, not as final "Premium Cozy Storybook" art.

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
