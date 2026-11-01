# Illustrated world, win-earned materials and main menu — 1.7.12

The update addresses mismatched backgrounds, unclear material collection and a crowded interface. Both winter scenes were redrawn using the original cottage illustrations as references. The remaining flat river, village and winter-area backgrounds are now painterly illustrations in the same visual family. All thirteen active background images were visually reviewed as source files. Cottage/forest retain four seasonal scenes each; river/village have temperate and winter variants, and the winter garden remains snowy. Runtime ambience follows the actual winter-area background. No physical-device compositing approval is claimed.

## Backgrounds and world progression

Seventeen registered original illustrations now have native catalogs, PNG checksum/dimension checks and provenance. Original supplied files remain in the repository. The unused three board-reference PNGs were removed from the native catalog so they are not unnecessarily bundled. World improvements still use owned building levels and fixed positions, with existing illustrated garden/greenhouse assets representing added furnishings and planting; these are not claims of bespoke new architectural models for every expansion building.

Both winter scenes have clearer paths, restrained snow and warm cream/amber lighting, with no snowman, purple sky or painted star pattern in the cottage scene. Winter window-glow anchors match the new cottage. Seasons still support saved manual choices and calendar mode.

## Materials are won through gameplay

The instant Gather supplies action and free daily-gift button have been removed from the UI. Win materials opens game choices and grants nothing by itself. A successful new win pays Glimmers plus all four craft materials, and advances existing material-collection objectives once. Old collection counters, completed quests, unlocks and balances remain intact; the legacy counter is described as material rewards rather than retrospectively pretending that old collection taps were wins. Quest/story progress rewards remain available through their original prerequisite/receipt checks.

Level-one rewards are:

| Game | Glimmers | Wood | Stone | Flowers | Seeds |
|---|---:|---:|---:|---:|---:|
| Solitaire | 60 | 2 | 1 | 1 | 1 |
| Garden Match | 20 | 1 | 1 | 2 | 1 |
| Hidden Treasures | 20 | 2 | 1 | 1 | 1 |
| Tea Time | 20 | 1 | 1 | 1 | 1 |

Mini-game levels 1/2/3 multiply craft materials by 1/2/3. Glimmer win amounts are unchanged. Solitaire uses the active saved deal's draw mode: draw-one pays x1 materials, draw-three pays x2. Selecting a future difficulty/deal mode does not change a resumed game's reward. The hub and active game show the exact reward amounts before completion. Receipt IDs prevent duplicate payouts or collection-objective increments for the same win.

One compact material HUD opens a labeled inventory overview. Materials and Unlocked are separate bounded tabs. Recent positive gains show actual source and amounts, newest first, in measured finite pages. `Economy.gains` is optional backward-compatible metadata, recorded atomically by successful transactions and capped at twelve entries. Spending and duplicate receipts add no gain. Legacy saves begin with an empty history while keeping balances; the UI says future finds appear there. Malformed optional history is discarded without losing valid core progress. Historical transactions and timestamps are not invented.

## Fewer persistent controls

The nine-destination dock and garden action rail are replaced by Garden, Solitaire and Main menu. The menu has Games, Garden and quests, Materials, and Player submenus. Less-used Solitaire actions, new/restart confirmation, help and challenges are in Games. The board keeps undo, hint and safe finish. Mini-game rails no longer duplicate the persistent home/play controls. Menus pause automatic hints, close back to the active deal and never silently start a new round. The game hub offers explicit resume or a new game. Language, settings, inventory, statistics, world map, quests and decorations remain reachable.

## Executed validation and limits

55 engine/presentation/asset tests and 156 Android/iOS native component test runs pass, alongside TypeScript and formatting. Coverage includes difficulty-scaled and duplicate-proof rewards, saved-deal draw-mode rewards, all-world progression using only win-earned resources, material-objective routing, every mini-game difficulty, labeled totals/persistent history, legacy saves, menu navigation/cancellation without losing the deal, offline illustration catalogs, regional/winter backgrounds and existing game gestures/lifecycle policies.

Both native JS/Hermes exports and a clean local ARM64 APK compilation were executed. Distribution separately verifies package/version, unchanged test certificate, ZIP integrity, standalone bundle, required regional assets and 16 KB alignment. Version 1.7.12 / Android code and iOS build 13; stable APK filename and QR destination are unchanged.

Physical-device appearance, real touch comfort, screen-reader behavior, FPS/memory and iOS IPA remain unverified. Jest substitutes native layout/animation drivers. No store submission or cloud-environment publication was performed.
