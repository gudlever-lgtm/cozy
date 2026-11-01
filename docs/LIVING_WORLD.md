# Living World Animation Engine V1

Android/iOS only. The approved source guide is `CODEX_LIVING_WORLD_ASSET_INTEGRATION.md`; native assets are catalogued by `src/assets/images.ts`, `src/assets/ambient.ts` and `public/assets/manifest.json`.

## Assets

All seven original sources in `artwork/ambient/` are preserved. `scripts/prepare-ambient.py` renders transparent, antialiased 1x/2x/3x PNG derivatives under `assets/ambient/` using CairoSVG 2.8.2 and Pillow 13.0.0, fourfold supersampling and Lanczos downsampling. `assets/ambient/provenance.json` records source hashes, sizes and densities. To regenerate, install `scripts/requirements-art.txt`, then run the script. Generated PNGs are committed, so running the app/build does not require Python or the rasterizer.

Firefly, bird, butterfly, autumn leaf, snowflake, flower petal and glimmer all render from literal native PNG `require()` references. The glimmer supplies the light layer; petals also supply the foreground flower accent. Small original vector rain and edge-branch additions use cached SVG XML. No network URLs, runtime asset downloads, emoji sprites, mockup crops or replacement of the supplied seasonal illustrations are used by this engine.

## Independent architecture

- `src/living/model.ts`: deterministic per-object schedules, cubic paths, seasonal selection and density budgets; no gameplay dependencies.
- `LivingWorldAnimationEngine.tsx`: sparse independent Reanimated timelines and UI-thread transforms/opacity, memoized sprite nodes. No React state writes per animation frame.
- `useMotionPolicy.ts`: app foreground and system reduced-motion policy. Off/reduced/background states cancel active timelines; returning to the foreground creates fresh independent cycles.
- `CharacterIdle.tsx`: gentle whole-image translations of the supplied Millie/Marmalade portraits in the NPC cards. The illustrated characters already painted into flattened backgrounds remain static. No skeletal deformation, fake pose frames or nonuniform scaling.

Layer order in the garden is static seasonal background → time tint → behind-tree/sky layer → separate edge vegetation foreground → ambient particles/light → existing garden decoration and interaction UI. The card board remains a separate opaque, readable control surface; the ambient engine is not mounted over card ranks or suits. All decorative layers and character wrappers use `pointerEvents="none"` and are hidden from accessibility navigation.

No production foreground tree mask was supplied. Birds therefore use a safe sky band; this is **not** a claim of full occlusion against the trees baked into the illustration. A separately illustrated high-quality tree mask is still needed for exact background-tree occlusion.

## Behavior and limits

Spring has an occasional bird, butterflies and petals. Summer has 6/8/12 slowly drifting, independently pulsing fireflies at low/medium/high quality, plus an occasional bird. Autumn has leaves, a small bird and sparse parallax rain. Winter has snow with variable depth/speed and warm light. Vegetation has only small rotations; portraits translate by less than 1.5 logical pixels. Birds and butterflies pause between passes. Fades and pulses are gradual, with no strobing or flashing.

The engine budgets at most 16/24/32 active objects including nine reserved vegetation/light/NPC timelines. Actual seasonal plans stay below these limits. Lantern/window flicker uses separate, unsynchronized cycles and accounts for aspect-preserving background cropping. Setting weather intensity to zero removes ambient particles; Animations Off or reduced motion stops all timelines. Existing manual/calendar season and day/evening preferences are independent of gameplay.

Persisted DA/EN controls: Animations On/Off, Animation quality Low/Medium/High, reduced motion and weather intensity. Existing schema-2 saves gain default animation preferences through additive migration; the profile, deal, balances and quests are retained.

## Evidence and limits

Automated tests cover seasonal plans/density, finite cubic curves, source provenance and all native densities, layer order, no touch interception, background/resume, reduced motion, settings persistence and game/profile preservation. Existing game/economy regressions remain required. React Native tests use mocked Reanimated/platform modules: they verify integration and policy, **not** real animation timing or FPS.

Actual hardware frame rate, GPU/memory behavior, image edge quality at all device scales and physical drag/touch interactions remain unverified until device testing. Native bundle exports and local Gradle APK compilation are reported separately from EAS jobs; neither implies an App Store build. See `TEST_RESULTS.md` for the latest executed outcomes.
