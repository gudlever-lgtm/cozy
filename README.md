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

A single serialized document in AsyncStorage (`cozy.save`) holds schema version 2, profile, current deal/history, balances, reward receipts, inventory, quests, placements, results and preferences. Serialized writes prevent older saves overtaking newer saves. Unsupported/corrupt saves show a retry screen rather than being replaced. Version 1 documents in the same shape without a profile migrate to username onboarding while retaining progress. There was no previous application or save format in the repository; arbitrary third-party save formats are not imported. Profile edits retain the original local ID, creation date and all game state. Usernames are normalized Unicode text, validated centrally and rendered as text. Profile information is never sent to an application server.

Rewards and purchases are committed alongside receipt IDs, preventing repeat claims across undo, restarts and app reloads. This is local gameplay validation, not protection against deliberate save-file editing. No server is required.

## Artwork and audio

The initial audit found **no artwork**. While implementation was underway, new commits added the seasonal artwork pack; those commits were merged and preserved. The garden now uses its four illustrated seasonal backgrounds, Solitaire uses subtle seasonal board art, and Millie/Marmalade use their supplied transparent illustrations. `src/assets/images.ts` statically bundles every supplied image for Android and iOS; `src/assets.ts` re-exports that manifest alongside local assets. `src/Art.tsx` supplies the forest, welcome scene and Pip portrait. PNG icons/splash are original local raster illustrations. `scripts/audio.py` generates the two original WAV loops. Unicode symbols are used for cards, mini-game pieces and decoration icons; their rendering can differ by platform. No runtime illustration downloads or placeholder file paths are required. Source sprite sheets are retained intact, without arbitrary cropping. See `docs/ASSETS.md` for the imported art’s resolution and provenance limitations.

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
