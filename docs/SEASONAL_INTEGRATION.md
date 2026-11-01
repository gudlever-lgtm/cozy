# V1.7 seasonal integration status

Implemented on main:
- `src/assets/images.ts`: static Expo/Metro-compatible references to the eleven manifest images (4 seasons, 3 boards, 2 characters, 2 sprite sheets).
- `src/seasonal/season.ts`: northern-hemisphere calendar selection, manual season selection, weather defaults and reduced-motion behavior.
- `src/i18n/seasonal.ts`: Danish/English labels for the seasonal controls and named characters.
- Confirmed source art present in GitHub: all four seasonal backgrounds, Millie and Marmalade.

Not yet implemented:
- There is no Expo/React Native application (`package.json`, `app.json`, `eas.json`, entrypoint) in this repository. Nothing currently renders these modules.
- No settings UI, persistence adapter, garden scene, quests, animation or audio engine exists.
- Sprite sheets are not split into individual icons; do not crop arbitrarily without inspecting alpha boundaries.
- No builds or tests can be run against an application until the project is scaffolded.

Next integration tasks:
1. Scaffold and verify Expo + React Native Web and EAS configuration.
2. Import `cozyImages` statically into the garden and Solitaire board components (avoid runtime URL strings for native).
3. Persist `AmbiencePreferences` and language choice; wire settings controls.
4. Create lightweight seasonal rain/snow/leaf/firefly particle layers, pausing them for reduced motion or app backgrounding.
5. Add NPC scene components and connect quests once the quest engine exists.
6. Implement gameplay and test before claiming V1.7 completed.

Manifest source of truth: `public/assets/manifest.json`.
