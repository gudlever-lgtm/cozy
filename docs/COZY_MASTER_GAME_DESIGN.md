# Cozy Solitaire — Master Game Design
Version 2.0 design baseline · 2026-11-01 · **Specification, not implementation status**

## 1. Vision
Cozy Solitaire is a calm storybook Solitaire adventure for **Android and iOS only**. Players enjoy fully functional Klondike, collect Lysglimt ✨ (English: Glimmers), develop a cottage garden, help friendly animals and explore repeatable mini-games and gentle seasonal ambience.

**Non-negotiable distribution:** native Android and iOS apps only, via Expo EAS Build. No browser version, web deployment, React Native Web or PWA. Use Expo + React Native + TypeScript, with platform-independent pure TypeScript game logic.

## 2. Core principles
- Always free: no advertisements, sponsored content, real-money transactions, microtransactions, paid subscriptions, loot boxes or premium currencies.
- No energy systems, progression timers, obligatory login streaks, paid advantages or artificial scarcity.
- Offline-first: Solitaire, quests, mini-games, Lysglimt earning/spending and persistence must work without a network.
- Relaxing and accessible: clearly readable cards, comfortable touch targets, reduced-motion, separate sound/music controls and minimal interruptions.
- All feature claims must be confirmed by actual implementation and tests.

## 3. Player loop
Enter Cottage Garden → pick Solitaire or a mini-game → earn Lysglimt and resources → help NPCs and unlock meaningful upgrades → see the world visually improve. Free Solitaire always remains accessible, regardless of balance or quest progress.

## 4. Solitaire
Classic Klondike with 52 cards, seven tableau piles, four foundations, stock/waste, draw-one/draw-three, validated legal moves and moving face-up sequences. Touch drag-and-drop and tap-to-move, undo, hints, new game, restart, automatic card flipping, win detection, optional safe auto-complete, persistent game and statistics. Seeded decks for deterministic testing. No mandatory countdown.

## 5. Cottage Garden and quests
One interconnected living garden with scene upgrades, paths, decoration placement and accessible NPC interactions.
- Millie the rabbit: gardening and flowers; quest chain "Millie's Flower Garden".
- Marmalade the cat: cozy furniture; "Marmalade's Cozy Corner".
- Pip the hedgehog: collecting and bridge restoration; "Pip's Forest Supplies".
Quests have prerequisites, localized dialogue, multiple objectives, progress, rewards and durable completion. Optional and non-disruptive; completed purchases and quests must produce observable world changes. Further connected areas and characters are V2.0 expansion goals.

## 6. Mini-games
- Garden Match: a playable match-3 with flowers, berries, leaves.
- Hidden Treasures: actual hidden-object puzzle.
- Tea Time Puzzle: short sorting/logic puzzle.
Each is repeatable, touch-friendly, testable, completeable and awards controlled Lysglimt. No energy gate. Avoid duplicate reward exploits.

## 7. Lysglimt economy
- Only universal currency: **Lysglimt ✨** in Danish and **Glimmers** in English.
- Secondary materials: wood, stone, flowers and seeds are crafting inputs, not premium currencies.
- Earn unlimited resources through meaningful repeatable play: Solitaire wins, mini-games, quests and optional objectives.
- Spend on authentic world expansion, repairs, decoration and cosmetic card designs.
- Central atomic transaction ledger, unique event IDs, nonnegative balances, persisted state, migrations and recovery. No progression deadlocks or permanent seasonal lockouts.
- Illustrative balance only (not final): Solitaire 50; Garden Match 20; Hidden Treasures 25; Tea Time 20; quests 75–150.

Current user direction (1.7.12): remove instant resource gathering. New game wins grant all four craft materials; mini-game difficulty scales their quantities x1/x2/x3, while Solitaire draw-one/draw-three uses x1/x2. Existing quest/story rewards and saved collection progress remain valid. No UI action may grant free craft materials merely by tapping Collect. Exact reward values and receipt protection are defined in the engine.

## 8. Four seasons and ambient weather
- Spring: blossoms, butterflies, mild daylight.
- Summer: warm twilight and fireflies.
- Autumn: falling amber leaves, lanterns and soft rain.
- Winter: gentle snow and warm cozy Christmas-evening details.
Optional automatic calendar season; manual overrides in Settings. Snow, rain, leaves, fireflies, mist and day/evening lighting are cosmetic only, never changing Solitaire rules or earnings. Particle effects are efficient on phones, controllable and respect reduced motion.

Source artwork already exists in `public/assets/`: four seasonal scenes, three extra board variants, Millie, Marmalade, icon/resource sheets and `manifest.json`. Native Expo should bundle images with **static require/import paths**, not runtime browser URLs. Keep original art, produce optimized native-ready derivatives as needed. Missing decorations and full card artwork must be created with proper provenance and documented.

## 9. Danish and English and local player identity
- All screens, controls, quests, dialogues, tutorials, notifications, errors, accessibility labels and game statistics translated fully into Danish (primary) and English.
- First launch: show language choice; request required local username of 3–20 visible Unicode characters (letters/digits/spaces/hyphen/underscore), then enter the garden.
- Usernames need not be globally unique; no email, password, online account or mandatory network access.
- Allow live language switch and username editing in Settings, persist safely, migrate existing saves with no progress loss.
- Centralized i18n keys, interpolation, pluralization, locale formatting and completeness tests.

## 10. Screens and experience
Onboarding; Cottage Garden; Klondike; mini-game hub plus 3 mini-games; quest journal; inventory/Lysglimt; garden customization; statistics; Settings. Smooth, pastel, low-clutter UI with rounded cards, original NPC illustration, soft sound and optional music. Native safe areas, landscape phones and tablets, full-screen game presentation (updated user direction for 1.7.1), accessible typography/touch.

Current navigation direction: only Garden, Solitaire and Main menu remain in the persistent dock. Group other destinations and less-used game actions in submenus. Keep active deals, puzzles and progression intact when opening/closing menus.

## 11. Native technical architecture
**Only Expo + React Native + TypeScript, Expo Router as appropriate, native offline local storage with migrations, EAS Build.** Shared testable pure TS modules: Solitaire / rewards / quests / mini-games / garden / seasonal ambience / persistence / localization. Android AAB and iOS IPA production builds through Expo EAS; Android debug/preview APK as useful. No web target, PWA, Vite, React Native Web or Capacitor. Avoid unnecessary permissions and do not commit signing credentials. Server checkout: `/home/lakn/games/cozy`; repo: `gudlever-lgtm/cozy`.

## 12. Release roadmap (targets, not claimed implementations)
- V1.0: Expo foundation, complete Klondike, offline save.
- V1.1: Lysglimt ledger and spending.
- V1.2: Cottage Garden and complete Millie quest.
- V1.3: seasonal art, snow/rain, manual and automatic modes.
- V1.4: repeatable Garden Match.
- V1.5: Android/iOS EAS configuration and actual native build validation.
- V1.7: 3 mini-games, 3 NPC quest chains, four seasons, complete DA/EN, first-launch username, integrated artwork.
- V1.8–V1.9: animation, sound, device QA, performance and store readiness.
- V2.0: additional areas, stories, NPCs, richer customization and optional seasonal events.

## 13. Definition of done
Validate card rules and undo/win; atomic/duplicate-proof rewards; quest and mini-game completion; save migrations and offline operation; DA/EN key completeness; touch controls and seasonal preferences. Distinguish **planned**, **implemented**, **tested** and **EAS verified**. Never claim native builds passed without actual completed EAS jobs.

## 14. Initial repo state, recheck before implementation
On 2026-11-01, `main` contained `public/assets/manifest.json`, seasonal/character images, `src/assets/images.ts`, `src/seasonal/season.ts`, `src/i18n/seasonal.ts`, and seasonal docs. `package.json` and `app.json` were not found; no working Expo application verified. Later commits may change this.
