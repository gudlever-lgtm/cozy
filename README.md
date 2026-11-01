# Cozy Solitaire 1.7

An offline-first Expo / React Native game for Android and iOS only: Klondike, a cottage garden, three repeatable mini-games, local player profiles, and Danish / English localization. There are no accounts, ads, payments, energy meters, or timers restricting play.

## Development

Use Node 24 and the committed npm lockfile. Work in the existing checkout; a cloud task is already isolated and does not need another worktree.

```sh
npm ci
npm start                   # Expo; open with a compatible Expo Go / development client
npm run android             # open Android emulator/device
npm run ios                 # open iOS simulator (macOS)
npm run typecheck
npm test
npm run test:native         # React Native component tests
EXPO_NO_TELEMETRY=1 npm run export:native
```

The cloud checkout is `/workspace/cozy`. `/home/lakn/games/cozy` in the product brief is a separate server path, not this environment. Expo telemetry is optional and disabled for the validation commands above. No application credential is required for local development.

`app.json` explicitly enables only `ios` and `android`. `npm run export:native` compiles the JavaScript/Hermes bundles and bundled assets for both configured platforms. This checks native module resolution; it does not create a signed AAB or IPA. There is no browser/PWA target, service worker, or web deployment workflow.

`npm run test:native` renders React Native components under both iOS and Android Jest Expo presets using React Native Testing Library, with mocked storage/platform bindings. It covers onboarding, draw/undo, immediate language switching, profile edits, restart persistence, hidden-object rewards and migration. It does not emulate physical touch gestures or audio hardware.

## Gameplay

- **Klondike:** draw one or three (Settings controls the next deal), seven columns, suit foundations, tap or drag moves, exposed-card flips, undo, hints, restart/new deal, victory rewards and conservative auto-finish. Safe finish acts only when stock/waste are empty and all tableau cards are exposed. Random deals are not guaranteed winnable.
- **Garden:** speak to Millie, Marmalade and Pip; gather supplies without waiting; earn an optional daily greeting reward; unlock and reposition decorations; repair the bridge and unlock the forest scene. Botanical backs change the actual playing cards.
- **Garden Match:** swap adjacent tiles, match at least three, collect 30 blooms in 18 valid moves. Invalid swaps cost no moves. Refresh flowers if stuck, preserving score and remaining moves.
- **Hidden Treasures:** find five objects in the illustrated garden/forest scene.
- **Tea Time:** sort three types of treats into complete trays. Only the same type or an empty tray receives a move. The initial arrangement is solvable.
- **Quests:** six quests form three prerequisite chains, with objective counts, material rewards, and persistent completion. Repeat mini-games to earn more Glimmers; gather wood and stone freely. All upgrades are earnable.
- **Ambience:** calendar/manual seasons, four times of day, adjustable particles, reduced motion, original local music and nature sounds. Rain/snow are cosmetic. Audio pauses when the app moves to the background.

## Structure and save safety

`src/engine/` contains platform-independent rules, economy, quest progression, mini-game logic and save migration. UI is in `src/App.tsx`; the Expo Router root is in `app/`. `src/i18n/da.ts` is the Danish source dictionary, `en.ts` is its complete English counterpart; i18next applies immediate language changes, interpolation and pluralization with Danish fallback. Formatting uses `Intl`.

A single serialized document in AsyncStorage (`cozy.save`) holds schema version 3, profile, current deal/history, balances, reward receipts, inventory, quests, placements, results and preferences. Serialized writes prevent older saves overtaking newer saves. Unsupported/corrupt saves show a retry screen rather than being replaced. Version 1 documents without a profile migrate to username onboarding while retaining progress; version 2 saves migrate additively to persistent world and mini-game state. A last-known-good local backup can recover a corrupt primary save, with an explicit recovery notice. There was no previous application or save format in the repository; arbitrary third-party save formats are not imported. Profile edits retain the original local ID, creation date and all game state. Usernames are normalized Unicode text, validated centrally and rendered as text. Profile information is never sent to an application server.

Rewards and purchases are committed alongside receipt IDs, preventing repeat claims across undo, restarts and app reloads. This is local gameplay validation, not protection against deliberate save-file editing. No server is required.

## Artwork and audio

The initial audit found **no artwork**. While implementation was underway, new commits added the seasonal artwork pack; those commits were merged and preserved. The garden now uses its four illustrated seasonal backgrounds, Solitaire uses subtle seasonal board art, and Millie/Marmalade use their supplied transparent illustrations. `src/assets/images.ts` statically bundles every supplied image for Android and iOS; `src/assets.ts` re-exports that manifest alongside local assets. `src/Art.tsx` supplies the forest, welcome scene and Pip portrait. The 1.7.1 launcher/splash and in-app logo use a new Millie-derived storybook rabbit illustration. `scripts/audio.py` generates the two original WAV loops. Mini-game pieces use original native vector artwork; some legacy resource/decoration labels still use Unicode symbols. No runtime illustration downloads or placeholder file paths are required. Source sprite sheets are retained intact, without arbitrary cropping. See `docs/ASSETS.md` for the imported art’s resolution and provenance limitations.

## Android and iOS builds

`app.json` sets version 1.7.0, tablet support, icons/splash, the `cozysolitaire` scheme and `com.gudlever.cozy` identifiers. Confirm identifier ownership before the first store release. `eas.json` defines production store distribution, Android AAB, and physical-device iOS builds. Microphone recording permissions are disabled; audio is playback-only.

On an authorized release machine, authenticate to your Expo account, link the project using `npx eas init` (which records the real project ID), and configure your Android / Apple signing credentials securely with EAS. Never commit signing keys or tokens. Then:

```sh
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
npx eas build --platform all --profile production
```

EAS CLI is also installed locally, so the brief's `eas build …` commands work inside an npm script / shell with `node_modules/.bin` on PATH. Cloud builds, store signing, and physical-device testing have **not** been completed by this implementation. JavaScript/Hermes export success does not establish a successful AAB/IPA build.

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for validation evidence and release limitations. The native-only platform decision follows `docs/COZY_MASTER_GAME_DESIGN.md` and the user’s confirmed scope.

## Living world animations

The garden uses the seven approved ambient illustrations as transparent native PNG sprites at 1x/2x/3x. Settings offers Animations On/Off and Low/Medium/High quality in Danish and English. Independent Reanimated motion pauses in the background and respects reduced motion. Millie and Marmalade have whole-portrait idle translations. See [LIVING_WORLD.md](docs/LIVING_WORLD.md) for layers, source provenance, sprite regeneration and explicit device/performance limits. These decorative layers never mount over the card board or change game/economy rules.

## Expanded world development increment

World Map opens the Enchanted Forest, Riverside Garden, Cozy Village and Winter Wonderland through earned materials and story prerequisites. Eight buildings have three levels and visible upgrades; eight further stories develop friendships. Four seasonal festivals stay available throughout the year. Earn four more achievements and choose among four original vector card themes. Solitaire offers three seeded challenge deals (randomized deals are not guaranteed winnable). Mini-games have three level variants and retain the current puzzle when returning to the hub or restarting the app.

The public version remains 1.7.0 while signed builds, hardware QA, dependency review and final visual/store approval are outstanding. See [IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md), [TEST_RESULTS.md](docs/TEST_RESULTS.md), [PRIVACY.md](docs/PRIVACY.md) and [RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md).

## Landscape preview 1.7.1

Full-screen landscape with the seasonal scene throughout, a central Solitaire board and side controls. Double tap a card for a legal foundation move. Garden Match uses swipe-to-swap with paced motion and input locking. See [layout and gesture changes](docs/LANDSCAPE_GAMEPLAY.md) and [executed validation](docs/TEST_RESULTS.md). Real-device visual and gesture approval remains outstanding.

Preview 1.7.2 adds a compact native icon tab dock, timed/tap-dismissable labels, icon actions around the game, and fixes overflow scrolling by bounding each landscape panel. See [scroll validation](docs/SCROLL_FIX_1.7.2.md).

Preview 1.7.3 fits Solitaire to the measured board viewport and collapses each exposed run to its first and last cards. Tap +count to select an intermediate card when moving part of a run. See [compact column validation](docs/COMPACT_COLUMNS_1.7.3.md).

Preview 1.7.4 restores original illustrated icons/resource pieces, uses a native modal/HUD above the board, gives Garden Match one dedicated swipe surface, simplifies card faces to one large suit, improves card-footprint drop handling and compacts inventory with a persistent overflow scrollbar. See [usability validation](docs/USABILITY_1.7.4.md).

Preview 1.7.5 animates Garden Match as local swaps, clears and column falls rather than a whole-board fade, with interruption-safe input recovery. Decorations and Statistics fit measured pages without scrolling. See [motion and page validation](docs/GARDEN_MATCH_MOTION_1.7.5.md).

Preview 1.7.6 uses full-card stack-picker pages and a compact world map with precise next-step guidance. Header shortcuts expose card designs and seasonal/motion previews; system reduced motion no longer latches the saved manual preference. See [world clarity validation](docs/WORLD_CLARITY_1.7.6.md).

Preview 1.7.7 defaults new free Solitaire deals to draw-three, adds sparse seasonal particles beneath the cards, and confirms gathering (+1 wood/+1 stone). Existing deals are preserved. See [play defaults validation](docs/PLAY_DEFAULTS_1.7.7.md).

Preview 1.7.8 adds illustrated quest details and objective shortcuts, a shared progression ribbon, compact inventory/mini-game/settings panels and earlier, clearer seasonal ambience. Existing progress and deals are preserved. See [quest and journey validation](docs/QUEST_JOURNEY_1.7.8.md).

Preview 1.7.9 makes Tea Time selections, legal destinations and invalid moves explicit, adds undo, fits Hidden Treasures and its checklist in the game viewport, and keeps all three boards outside scrolling gesture containers. Garden Match explains dead-board recovery without losing score or turns. See [mini-game validation](docs/MINIGAME_USABILITY_1.7.9.md).
