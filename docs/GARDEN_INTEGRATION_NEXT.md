# Garden integration follow-through — 2026-11-02

## Implemented and committed
- `src/GardenViewport.tsx` and garden camera integration in `src/App.tsx`: pinch/zoom/pan and view reset.
- `src/engine/world.ts`: level 1–3 furniture economy using existing receipts (no save schema reset).
- `src/FurnitureControls.tsx`: move controls and upgrade UI.
- `src/GardenDecorations.tsx`: accepts optional saved `placements` and `economy`; uses saved percentage positions when present and renders a discreet glimmer accent for enhanced items.
- `tests/furniture-upgrades.test.ts`: placement and upgrade unit tests (not yet executed on device/server).

## Required App.tsx wiring — do not claim completed yet
In `gardenScene()`, pass the already persisted data to GardenDecorations:

```tsx
<GardenDecorations
  owned={s.economy.inventory}
  placements={s.placements}
  economy={s.economy}
  width={sceneSize.width}
  height={sceneSize.height}
  enabled={s.preferences.animations}
  reducedMotion={s.preferences.reducedMotion}
/>
```

On the `screen === "decorations"` ScreenPager, import `FurnitureControls` from `./FurnitureControls`. In each owned furniture item's tile, render:

```tsx
{owned && u.id !== "cards" && (
  <FurnitureControls
    save={s}
    id={u.id}
    language={language}
    onChange={(next) => update((current) => ({
      ...current,
      economy: next.economy,
      placements: next.placements,
    }))}
  />
)}
```

Use **functional** `update` and validate against current state to prevent stale-closure races. A stronger version of `FurnitureControls` should accept `onMove`/`onUpgrade` callbacks operating on the latest `Save`, instead of passing a captured full save snapshot.

### Next milestone
Add a dedicated garden editing mode with drag-to-place gestures mapped to image-world coordinates and zoom transform, snap/valid placement zones, preview/confirm/cancel and world position persistence. Keep pan/zoom vs item drag gesture ownership explicit and maintain touch access to NPCs and navigation.

### Critical performance/visual note
The scene is painted as a single flat backdrop. Building a fully editable layered garden requires independent foreground/tree layers and true decorative transparent sprites. Existing decorations can move, but embedded image furniture cannot be individually removed without editing the background artwork.

### Required verification
Run `npm ci && npm run typecheck && npm test`, check the app manually on actual Android/iOS, then EAS test builds. None of those verifications were completed in this session. No web build is needed (native only).
