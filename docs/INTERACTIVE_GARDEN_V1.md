# Interactive Garden — implementation and next milestone

## Shipped in source
- `src/GardenViewport.tsx`: native React Native camera, two-finger pinch, one-finger pan when magnified, zoom in/out/reset controls, bounded camera movement.
- `src/App.tsx`: uses `GardenViewport` only on the interactive **garden screen**; Solitaire and hidden-object mini-game scenes are not wrapped.
- Existing decoration visibility, economy, quest progression and world-building files are preserved.

## Verify immediately on a real device
1. Pinch/drag in `Min have`; test zoom from 1.0 to 2.8, bounds and reset.
2. Ensure existing NPC buttons, navigation HUD and decoration interaction are not intercepted by the camera.
3. Check landscape phone and tablet sizes; small screen / safe area controls.
4. Run `npm ci && npm run typecheck && npm test`, then Android and iOS EAS preview builds.
5. If tests or touch behavior fail, fix before creating a store release.

## Next implementation — richer furniture and upgrade experience
The current `src/engine/world.ts` already supports six purchasable inventory items; `src/GardenDecorations.tsx` draws owned items. The new concept needs more than these existing items. Implement the following without introducing fake catalog entries:
- Categorized decoration collection: plants, furniture, lights, paths, structures, seasonal.
- Actual art assets for each new item, authored to match seasonal cottage illustrations, with transparent backgrounds and native bundling.
- Discover/find/unlock rewards from existing mini-games and quests, no real-money purchase.
- Placement mode with drag-to-position on an authored garden world coordinate plane, preview, cancel and save. Persist separate positions per object and preserve previous placements.
- Furniture upgrade levels 1–3 with visibly changed art or appropriate additive layers. Price in Lysglimt/materials; transactional, duplicate-proof, offline.
- Auto-layout and valid placement zones so objects do not obstruct primary touch navigation.
- Localized `da/en` names, tooltips and upgrade confirmations.
- Versioned migrations with no inventory/progression loss, tests for unlocks, affordability, placement, upgrade and save restoration.
- Keep art/scene coordinates aligned while pan and zoom are active. Do not implement a flat image-only garden and call it interactive.

## Note
Current changes are committed but **not typechecked, device-tested or EAS-build verified** in this tool session.
