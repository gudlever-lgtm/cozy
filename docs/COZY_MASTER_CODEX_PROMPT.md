# Cozy Solitaire — Canonical Codex / Claude Code Master Prompt
Target **Android and iOS only**. Repository: `gudlever-lgtm/cozy`. Server path: `/home/lakn/games/cozy`.

## Source of truth
Read `docs/COZY_MASTER_GAME_DESIGN.md` fully before development. It defines the original concept, complete feature scope and staged roadmap. Do not represent planned features as implemented.

## Mandatory platform decision
Use **Expo + React Native + TypeScript** and **Expo EAS Build** for Android (release AAB, testing APK) and iOS (IPA). **Do not build, configure, scaffold or maintain web or PWA targets. Do not install React Native Web, Vite or Capacitor.** All screens and assets must work on physical Android phones/tablets and iPhones/iPads. Native Expo images must use static Metro-compatible `require()` or imports, not browser `/assets/` URLs.

## Mission
Create fully playable cozy Klondike Solitaire with a beautiful seasonal cottage garden, NPC quests, three repeatable mini-games, offline local saves and fair in-game economy. Implement in vertical slices, preserving previous work.

## Invariants
- Entirely free; absolutely no advertising, real-money payment, subscriptions, loot boxes or premium currencies; no energy limits or forced waiting.
- **Lysglimt ✨** is the only universal currency (English **Glimmers**), earned indefinitely through ordinary games, mini-games and quests; spend on garden/story progression and cosmetics. Craft materials may be earned as separate non-premium inventory items.
- 100% Danish and English UI and content, switchable in Settings without restarting. First-run local username (editable later, no online login), with migration for older saves.
- Seasons: spring blooms, summer fireflies, autumn rain/leaves, winter snow/Christmas warmth. Automatic or manual modes, independent cosmetic weather, effects control and reduced motion.
- Preserve existing art in `public/assets`, including four backgrounds, Millie/Marmalade and sprite sheets. Verify the manifest, optimize assets for native Metro bundling, and avoid fake placeholders or dead buttons.
- Full Klondike rules, correct stock/foundation/tableau moves, undo, hints, drag and tap, win state, game resume, tests.
- Quest lines for Millie, Marmalade and Pip; actual visual garden upgrades.
- Garden Match, Hidden Treasures and Tea Time Puzzle must have actual rules, completion and repeatable rewards.
- Offline-first persistence, atomic reward transactions, migration and tests.

## Execution plan
1. Inspect GitHub repository including latest commits and `docs/SEASONAL_INTEGRATION.md`. Record actual state.
2. Establish a real Expo/React Native native-only app if missing; add `package.json`, Expo config, TypeScript, native navigation, dependency lockfile and tests. Keep architecture clean.
3. Implement and test complete Klondike + saved game and touch interaction.
4. Implement centralized Lysglimt ledger, persistent inventory and reward tests.
5. Integrate garden artwork, first NPC quest, scene upgrades and settings with full DA/EN translations and first-launch username.
6. Implement four seasonal presets and subtle independent particles; pause/disable appropriately for reduced motion/background app state.
7. Implement all three repeatable mini-games, additional NPC quests and progression.
8. Configure `eas.json`, production Android AAB and iOS IPA profiles, app identifiers, icons, splash screens and native permissions; use secure EAS credentials.
9. Execute TypeScript checks, unit tests, available native launch checks and **actual** EAS builds if permitted. Report exact failures and untested steps.
10. Update README, feature-status table and documentation. Commit and push coherent, tested changes. Never overwrite concurrent Codex/Claude work; use a feature branch/PR when appropriate.

## Required final report
List each feature as planned/implemented/tested/native-verified, actual test results, Android and iOS build results with evidence, remaining missing art, and next milestone. Do not stop after writing a plan; implement what the environment permits. Do not claim a store-ready app until EAS builds and device validation are proven.
