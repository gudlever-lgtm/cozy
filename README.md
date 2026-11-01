# Cozy Solitaire 1.7

An offline-first Expo / React Native / React Native Web game: Klondike, a cottage garden, three repeatable mini-games, local player profiles, and Danish / English localization. There are no accounts, ads, payments, energy meters, or timers restricting play.

## Development

Use Node 24 and the committed npm lockfile. Work in the existing checkout; a cloud task is already isolated and does not need another worktree.

```sh
npm ci
npm start                   # Expo; open with a compatible Expo Go / development client
npm run web                 # browser development
npm run typecheck
npm test
EXPO_NO_TELEMETRY=1 npm run build:web
```

The cloud checkout is `/workspace/cozy`. `/home/lakn/games/cozy` in the product brief is a separate server path, not this environment. Expo telemetry is optional and disabled for the validation commands above. No application credential is required for local development.

For browser tests, serve the **production build** in one terminal, then run Playwright in another:

```sh
python3 -m http.server 8081 --bind 127.0.0.1 --directory dist
npm run test:browser
```

Locally the Playwright config uses `/usr/bin/chromium`. In CI it uses the browser installed with `npx playwright install --with-deps chromium`. The test projects cover 1440×1000 desktop and 390×844 touch layouts. The service worker requires HTTPS in production (loopback is permitted for local validation). Deploy all of `dist` at the origin root. Offline web use requires one completed online load to cache assets; native assets are bundled. Clearing site/app data removes the local profile and progress.

## Gameplay

- **Klondike:** draw one or three (Settings controls the next deal), seven columns, suit foundations, tap or drag moves, exposed-card flips, undo, hints, restart/new deal, victory rewards and conservative auto-finish. Safe finish acts only when stock/waste are empty and all tableau cards are exposed. Random deals are not guaranteed winnable.
- **Garden:** speak to Millie, Marmalade and Pip; gather supplies without waiting; earn an optional daily greeting reward; unlock and reposition decorations; repair the bridge and unlock the forest scene. Botanical backs change the actual playing cards.
- **Garden Match:** swap adjacent tiles, match at least three, collect 30 blooms in 18 valid moves. Invalid swaps cost no moves. Refresh flowers if stuck, preserving score and remaining moves.
- **Hidden Treasures:** find five objects in the illustrated garden/forest scene.
- **Tea Time:** sort three types of treats into complete trays. Only the same type or an empty tray receives a move. The initial arrangement is solvable.
- **Quests:** six quests form three prerequisite chains, with objective counts, material rewards, and persistent completion. Repeat mini-games to earn more Glimmers; gather wood and stone freely. All upgrades are earnable.
- **Ambience:** calendar/manual seasons, four times of day, adjustable particles, reduced motion, original local music and nature sounds. Rain/snow are cosmetic. Browser audio resumes after a user gesture when autoplay policy requires it.

## Structure and save safety

`src/engine/` contains platform-independent rules, economy, quest progression, mini-game logic and save migration. UI is in `src/App.tsx`; the Expo Router root is in `app/`. `src/i18n/da.ts` is the Danish source dictionary, `en.ts` is its complete English counterpart; i18next applies immediate language changes, interpolation and pluralization with Danish fallback. Formatting uses `Intl`.

A single serialized document in AsyncStorage (`cozy.save`, browser localStorage on web) holds schema version 2, profile, current deal/history, balances, reward receipts, inventory, quests, placements, results and preferences. Serialized writes prevent older saves overtaking newer saves. Unsupported/corrupt saves show a retry screen rather than being replaced. Version 1 documents in the same shape without a profile migrate to username onboarding while retaining progress. There was no previous application or save format in the repository; arbitrary third-party save formats are not imported. Profile edits retain the original local ID, creation date and all game state. Usernames are normalized Unicode text, validated centrally and rendered as text. Profile information is never sent to an application server.

Rewards and purchases are committed alongside receipt IDs, preventing repeat claims across undo, restarts and app reloads. This is local gameplay validation, not protection against deliberate save-file editing. No server is required.

## Artwork and audio

The initial repository had **no artwork**. `src/Art.tsx` contains original scalable cottage/forest scenes and animal portraits. `src/assets.ts` is the asset manifest; PNG icons/splash are original local raster illustrations. `scripts/audio.py` generates the two original WAV loops. Unicode symbols are used for cards, mini-game pieces and decoration icons; their rendering can differ by platform. No illustration downloads, placeholder file paths, or third-party licensed art are required.

## Android and iOS builds

`app.json` sets version 1.7.0, tablet support, icons/splash, the `cozysolitaire` scheme and `com.gudlever.cozy` identifiers. Confirm identifier ownership before the first store release. `eas.json` defines production store distribution, Android AAB, and physical-device iOS builds. Microphone recording permissions are disabled; audio is playback-only.

On an authorized release machine, authenticate to your Expo account, link the project using `npx eas init` (which records the real project ID), and configure your Android / Apple signing credentials securely with EAS. Never commit signing keys or tokens. Then:

```sh
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
npx eas build --platform all --profile production
```

EAS CLI is also installed locally, so the brief's `eas build …` commands work inside an npm script / shell with `node_modules/.bin` on PATH. Cloud builds, store signing, and physical-device testing have **not** been completed by this implementation. JavaScript/Hermes export success does not establish a successful AAB/IPA build.

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for validation evidence and release limitations.
