# Natural decorations, forest guidance and treasure celebrations — 1.7.11

## Illustrated world and one-time unlocks

Eleven new original illustrations were generated with image_gen to match the supplied cottage references: five transparent garden objects, four seasonal forest scenes and transparent greenhouse/lookout structures. Existing cottage, character, ambient and icon artwork remains bundled. Hashes, PNG dimensions, transparency statistics and reference provenance are recorded in `assets/illustration-provenance.json` and the public asset manifest. Native catalogs use literal Metro requires. The exploratory six-object reference atlas is not shipped or used as a sprite crop.

The blue bridge emoji, chair, red lantern and other emoji decoration overlays have been replaced with painterly objects using wood, stone, terracotta, greenery and soft contact shadows. Their authored image-space anchors follow background cover scaling and stay inside the ground-level scene bounds. They render before the time-of-day tint, so the same lighting applies to background and decorations. Static structures do not sway; only the lantern's optional warm glimmer moves. Android small-image rendering requests native downsampling.

Purchased decorations appear automatically once from canonical ownership, even for legacy saves whose placements are absent or arbitrary. Free placement controls/responders are removed. Owned shop items are disabled and marked Unlocked; no reapply/use action is exposed. Old placement data remains intact for save compatibility but no longer controls rendering. Card themes remain cosmetic choices rather than ground objects. The same decoration illustration is used in shop/inventory previews. Generic flat branch overlays were removed; supplied petal/particle effects remain. Large character cutouts no longer cover animals already painted into the cottage: Millie's logo and Marmalade's small HUD portrait retain dialogue access.

## Forest flow

The forest now has separate original spring, summer, autumn and winter artwork rather than the flat vector scene. Owned greenhouse/lookout levels appear as illustrated structures. A compact guide uses the existing forest story objectives and saved counters: completed Hidden Treasures rounds, gathered supplies, greenhouse level and Garden Match rounds. Its next-step action starts the relevant mini-game choice, gathers actual supplies, opens the current area's building panel, claims a ready story reward through the original ledger, or leads to the next area after both chapters. It does not invent extra tasks, timers, costs or quest gates. Oversized cottage-character cutouts are omitted in the forest.

## Hidden Treasures and useful replay rewards

A newly found object crossfades into the original butterfly and follows a curved path out of the scene. Several discoveries have independent capped lifecycles. The final discovery shows a short localized congratulations banner, accompanied by petals in spring/summer, leaves in autumn or snowflakes in winter. Density is 6/10/14 by quality. Overlays never intercept touches; animation-off/reduced-motion omit movement while retaining textual success feedback. Background state suppresses animated effects. Restoring an already-completed hunt does not replay the celebration or grant rewards again.

Unique unlocks remain one-time purchases. New completed mini-game rounds remain repeatable and pay useful existing rewards, not duplicate decor: every mini-game gives 20 Glimmers; Hidden Treasures also gives 2 wood/1 stone, and Garden Match 2 flowers/1 seed. Tea Time gives Glimmers. A shared read-only reward definition drives both the ledger and visible hub/result resource previews, with unchanged amounts. Same-round receipt protection is preserved. Starting a new round still uses a fresh attempt ID.

## Executed checks and limits

51 engine/presentation/asset checks and 142 Android/iOS native component test runs pass, alongside TypeScript and formatting. New coverage verifies authored decoration bounds, PNG provenance/transparency, owned-item deduplication and automatic placement, disabled reapplication, repeat-round materials without duplicate unlocks, forest objective/claim/build navigation, seasonal forest assets and purchased structures, independent butterfly departures, seasonal celebrations, reduced motion/background behavior and no replay on restoring completed hunts. An older randomly-dealt hint fixture was made deterministic.

Android/iOS JS/Hermes exports and the local ARM64 APK build were executed. APK distribution separately checks signature, unchanged test certificate, version/package, embedded bundle, ZIP integrity and 16 KB alignment. Internal version 1.7.11 / Android code and iOS build 12; stable APK filename and QR payload are unchanged.

Illustration source files were visually inspected and their transparency metadata checked. Actual device compositing, touch comfort, frame rate/memory and iOS IPA remain unverified. Jest substitutes native layout/animation drivers. This is an Android test-signed preview; no store submission or cloud-environment publication was performed. Other expansion areas retain their existing artwork and are not represented as having received this forest redesign.
