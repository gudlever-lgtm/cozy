# V1.7 native-only implementation and validation

## Repository audit

The starting `main` commit was `a0b46e00a15bd16f09ec9902d4e674417e211a2b`, containing only `README.md`. There were no existing components, assets, game saves, package manifests, tests or EAS settings. This implementation therefore establishes the Expo architecture rather than extending an existing application. A final remote check discovered concurrent artwork/module commits ending at `fcec6c1`; these were merged without overwriting them, then integrated into the playable app. Later native-only design commits through `7f891e1` were preserved. The user confirmed that native-only scope supersedes the original uploaded Web/PWA brief; all browser/PWA implementation, dependencies and workflows were subsequently removed.

## Delivered

- Shared TypeScript Klondike rules with legal/illegal move validation, 52-card distribution, both draw modes, tap/drag control, flip/undo/hints, save/restore, new/restart, victory and safe completion.
- Receipt-based Glimmers/Lysglimt economy, materials, inventory, repeatable gameplay rewards, purchases, daily greeting and an explorer achievement.
- Interactive illustrated garden, three character portraits and dialogue, six quests in three chains, persistent upgrades/placements, forest unlock and cosmetic card backs.
- Garden Match, Hidden Treasures and solvable Tea Time with genuine completion, replay, rewards and persistent result counters.
- Seasons, calendar selection, time presets, cosmetic rain/snow/light particles, intensity/reduced-motion controls, bundled original music/ambience and settings.
- All eight navigation destinations, local first-launch profile, Unicode name validation/editing, language detection and immediate Danish/English switching.
- Versioned, offline AsyncStorage persistence; missing-profile migration preserves the existing save. Artwork and audio are bundled for native offline use.
- Expo Router, native TypeScript, explicit Android/iOS platform allowlist, production AAB/store-iOS EAS profiles, icons and splash, and CI validation.

## Validation

- TypeScript: passed.
- Engine/localization/persistence suite: 18 tests passed, zero skipped. Includes full quest-chain completion using gameplay rewards and legal purchases, reachable tea victory, deck conservation, legal/illegal moves, flips/undo, victory, reward idempotency, placement bounds, seasons, migration, Unicode validation, translation completeness/interpolation and serialized offline saves.
- Android and iOS JavaScript/Hermes exports: passed. These exercise the native module graph and shared localization, but do not replace device testing.
- React Native component integration: 8 tests passed across iOS and Android presets, zero skipped. Covers onboarding, draw/undo, language switching, username editing without resetting a deal, restart persistence, hidden-object rewards and existing-save migration. Platform/storage/audio bindings are mocked; these tests do not establish device behavior.
- The earlier browser suite was removed with the Web/PWA target. Its historical results are not presented as native-device validation.

## Remaining release work and limits

This is a functional implementation, not a verified App Store / Play Store release. EAS authentication, project linking, identifier ownership and platform signing remain outside this environment; no AAB/IPA cloud build or store submission is claimed. No iPhone/iPad/Android hardware or native emulator test has run. Native gesture, audio and accessibility behavior still needs device QA. Component tests run under the React Native test renderer; no simulator or physical-device run is claimed.

The app integrates the concurrently supplied seasonal/character artwork, complemented by original vector illustration and system-rendered symbols. The seasonal source panels are approximately 836×470 and may appear soft on large tablet displays. Source sprite sheets are preserved rather than sliced without an asset specification. Transitions are lightweight and card drags are animated; there is no elaborate victory animation or voiced dialogue. Rain/snow are efficient decorative particles, not a weather simulation. There is one scene layout per garden/forest and a fixed initial tea puzzle.

The Expo SDK 54 toolchain has upstream dependency advisories. Compatible nanoid and PostCSS patches are pinned through npm overrides. Remaining advisories include image-size in Metro's local asset processor and decode-uri-component via Expo Router's query-string dependency, along with moderate toolchain issues. Do not treat this as security release approval; review supported SDK upgrades before shipping. The application has no backend, payment processing or transmitted profiles.

The new CI workflow is committed; a remote CI result is not claimed unless observed. Cloud-environment publication is intentionally not performed.

## Later development increment

The subsequent Living World and V2.0 progression work is tracked in `docs/IMPLEMENTATION_STATUS.md` and `docs/TEST_RESULTS.md`; those documents supersede the earlier test counts and schema summary above. They explicitly distinguish implemented/tested features from blocked native builds and unverified device/release gates.
