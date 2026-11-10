# GARDEN — scene, interaction and overlay contract v1

**Current code:** `src/screens/GardenScreen.tsx`, `src/domain/garden/*`, `src/ui/theme/premiumArt.ts`.

## Visual architecture

1. **Scene background**: currently 4 `assets/v3-premium/backgrounds/garden-*-premium.png`. Images are 768×1280 and are imperfect flattened paintings, not movable layers.
2. **World objects**: decorations `assets/v3/decorations/*`, rendered in world coordinates, behind fixed HUD and in front of ground. Respect artwork proportions.
3. **Character actors**: `assets/v3-premium/characters/millie-premium.png` and `marmalade-premium.png`, only once per character; full visible bounds inside scene. Avoid placing characters over large baked-in objects that imply physical collisions.
4. **Interaction highlights**: soft selection glow and a visually appropriate edit toolbar, not black rectangular outlines.
5. **Fixed overlays**: `CozyHUDChip`, build button, settings and bottom navigation. Fixed overlays **must not scale with camera**.
6. **Contextual build palette**: `CozyPanel` or approved consistent cream panel with opaque/readable backing.

## Camera + world geometry

- Scene units: 768 × 1280 (not device dp). Inbound positions stored normalised 0..1.
- Cover zoom `max(viewportW/sceneW, viewportH/sceneH)`; clamp all pan offsets to filled image extents.
- When the player changes screen orientation, recompute cover zoom/bounds and preserve a meaningful scene focal point; old saved camera offsets must not produce blank edges.
- Pinch should retain world coordinates under the user's fingers; one-finger pan must not trigger accidental placement.
- Press decoration to select; selected move, rotate, remove use clearly distinct actions. **Undo icon should not masquerade as Rotate** — artwork required or native approved UI label until supplied.
- Decoration visual size should be measured against buildings/scene, not intrinsic 220×220 SVG viewBox; report ground-truth pixel dimensions on the screenshot.
- The provided background already contains flowers, benches, paths and buildings baked into scenery. Those elements are **not user-owned and cannot be tapped or edited**. They must not be advertised as editable objects.
- Asset limitation: blurring top/bottom of images cannot be fixed by repositioning; real replacement scenery must be designed if this remains visible.

## Fixed UI composition for 390 × 844

- HUD top row below safe-area inset; left: current Lysglimt from ledger. Right: Build and Settings, each with minimum 44dp hit target.
- Floating 4-tab bottom navigation: `assets/v3/ui/tab-background.svg`, 4 accessible hit targets, independently anchored to bottom safe area.
- Build palette only when build mode active; bottom panel displayed **above nav**, never underneath it, with 8 visible decoration options in a 4×2 grid or horizontally paged list. Artwork 36–48dp, individual interactive area ≥ 44dp.
- Selected object toolbar should be placed within viewport bounds and not cover target object or key nav buttons.
- Top/mid/bottom overlay occlusion and text overlap tests are mandatory.

## Behaviours and non-goals

- Persist coordinates and active season/scene across navigation and app relaunch.
- Do not create another game currency or pretend 0 Lysglimt is earned.
- No semantic collision between pan and decoration drag.
- **Not done:** full multilayer independently explorable garden scenery. Only correct existing flatten background and overlays until replacement art approved.
