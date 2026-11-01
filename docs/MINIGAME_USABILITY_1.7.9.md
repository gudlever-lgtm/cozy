# Mini-game input and bounded play areas — 1.7.9

User-reported device evidence showed Tea Time with a selected tray but no visible explanation of why a destination did not accept it. The original control silently rejected invalid pours and allowed empty source selection. Non-Match games also lived inside a scrolling play area, and Hidden Treasures requested a scene taller than the available game viewport.

## Changes

- Tea Time now has a dedicated fixed five-tray board. Every selection, empty-source tap and rejected move has localized visible guidance. Legal destinations have green borders and downward arrows; tapping the selected source cancels selection. Trays expose their actual contents to accessibility. SVG pieces cannot capture touch events. Local undo restores previous valid moves while the puzzle is active; completion disables further interaction. Existing pour rules, difficulty layouts and saved tray state are preserved. Undo history is session-local and is not restored after leaving the screen.
- All three mini-games use a bounded native View for their interactive stage, with no ancestor ScrollView competing for board gestures. An icon rail with a strong scrollbar handles supplementary controls separately. Title and progress/completion feedback stay above the measured play area.
- Hidden Treasures fills the remaining stage, with a fixed illustrated five-item checklist below it. Its scene has no screen-height minimum or season label covering objects. Targets have 44-point hit areas centered on their authored coordinates and pointer-transparent artwork. Decoration placement responders are explicitly excluded from the hidden-object game.
- Garden Match retains its independent local swap/clear/fall animation system and swipe-only control. A dead board now explains the existing Refresh flowers action, which preserves score, remaining moves, session identity and earned resources. Measured board sizing uses the space after the compact controls/status header.
- No Solitaire engine, currency values, quest requirements, save schema or supplied artwork changed.

## Executed validation

47 engine/presentation tests and 100 component test runs across Android/iOS Jest Expo presets pass. TypeScript and formatting pass. Tea Time is solved through UI controls at all three levels, followed by restart and duplicate-reward checks. Separate tests cover empty sources, invalid moves, legal-target hints, cancellation, undo and disabled completed controls. Hidden Treasures is completed at each level, verifies fixed scene/no scroll ancestor and target sizes, and retains existing partial-session/reward-idempotency tests. Garden Match integration tests deliver responder callbacks at measured dimensions at each difficulty, resolve a near-win, verify rewards/medals once and preserve Solitaire; a separate dead-board test verifies shuffle invariants. Existing interruption, missing-callback, lost-release and invalid-swipe component tests also pass.

Both native JS/Hermes exports and the local ARM64 Gradle APK build were run. Distribution separately verifies Android package/version, unchanged test certificate, ZIP integrity, embedded bundle and 16 KB alignment. Internal app version 1.7.9; Android versionCode/iOS buildNumber 10. Stable APK filename and QR payload are unchanged.

These are component/rule/build checks, not physical-touch or rendered-device validation. Native timed animations are substituted in Jest. No physical device or running emulator is available; device layout, actual input comfort, animation appearance/FPS and iOS IPA remain unverified. This is a test-signed Android preview, not a store release.
