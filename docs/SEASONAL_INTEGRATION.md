# V1.7 seasonal integration status

The seasonal artwork/module commits through `fcec6c1` were merged into the playable Expo implementation without removing any images or modules.

Implemented:
- `src/assets/images.ts` statically references all eleven manifest images for Metro/native and web. `src/assets.ts` re-exports the image manifest.
- The garden renders the chosen seasonal cottage background with aspect-preserving scaling. Millie and Marmalade render their supplied transparent portraits. Pip has a local vector portrait because no source raster portrait exists.
- Solitaire uses subdued seasonal board artwork behind opaque, readable cards.
- `src/seasonal/season.ts` remains the shared calendar source; the world engine delegates automatic season selection to it.
- Settings persist manual/calendar seasons, time presets, intensity, reduced motion and audio preferences. Runtime particles supply rain/snow/light ambience.
- Danish and English player-facing labels are centralized in the complete i18next dictionaries. The earlier `src/i18n/seasonal.ts` module is preserved for compatibility.
- Offline PWA caching includes every bundled image. Native exports include the static assets.
- Solitaire, economy, quests, three mini-games, profiles and garden upgrades are integrated and tested. See `IMPLEMENTATION.md` for evidence and remaining release limits.

Asset constraints:
- Keep source sprite sheets intact; no arbitrary icon crops were introduced.
- Four seasonal panels are approximately 836×470. They are not high-resolution tablet masters.
- Android/iOS JavaScript exports do not establish a signed EAS/store build. Project linking, credentials and physical-device QA remain required.

Manifest source of truth: `public/assets/manifest.json`.
