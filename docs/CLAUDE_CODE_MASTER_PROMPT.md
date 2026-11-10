# CLAUDE CODE — COZY SOLITAIRE 3.0 GAME MECHANICS MASTER PROMPT

## Role and objective
You are an expert Expo/React Native, TypeScript and deterministic-game-engine developer. Implement **Cozy Solitaire 3.0** in `gudlever-lgtm/cozy` using the existing V3 design documents and **approved** SVG asset package. Your focus is game mechanics, app architecture, persistence, tests, accessibility and safe asset integration—not redesigning the visual direction.

## Absolute gates and non-negotiable constraints
1. Read `README.md`, `DESIGN_CONTRACT.md`, `ROADMAP.md`, `SCREENS.md`, `DECISIONS.md`, `docs/ASSET_SPEC.md`, `assets/v3/README.md`, and `assets/v3/manifest.json` FIRST.
2. The **57 V3 SVG assets are approved by the owner on 2026-11-10** and locked as the graphic baseline. Do not alter assets, colors, icon mappings or invent replacement UI artwork. The **overall mobile UI layout was approved by the owner on 2026-11-10** and is the fixed visual target. Device-specific rendering is still subject to screenshots, usability tests and on-device acceptance. Do not redesign any screen; continue engine work independently before UI integration.
3. Build for **Android + iOS** using one React Native + Expo + TypeScript codebase. No web product.
4. **100% free**, no ads, real-money purchases or microtransactions, no dark patterns. All progression achievable through play.
5. `Lysglimt ✨` is the primary earned currency. Keep reward accounting deterministic and auditable.
6. Languages: Danish and English, with complete parity and long-label layouts.
7. Preserve current `main` as the clean V3 project. V2 is available solely for reference under `archive/cozy-v2-final-2026-11-09`; **do not merge or copy V2 wholesale**.
8. Never run/build an APK, delete repository contents, create external accounts, alter credentials or publish a release without the owner's explicit instruction.
9. No asynchronous work promises. Make small reviewable commits after each completed stage.

## Implementation architecture
Keep logic independent of the interface:
```
src/
  domain/
    solitaire/          # pure Klondike engine and variants
    rewards/            # immutable reward ledger
    minigames/          # pluggable mini game contracts
    garden/             # placements, unlocks, inventory, camera
    quests/             # progression & achievements
    profile/            # avatar/locale/preferences
  application/          # use cases, events and controller interfaces
  persistence/          # schemas, migrations, save/load
  ui/                   # presentational components after design acceptance
  assets/               # V3 manifest integration and validation
tests/
  unit/
  integration/
  native/
```
Domain code must not import React Native, gesture libraries, UI graphics or time-dependent browser APIs.

## Stage 1 — Engine and rules, no UI
Implement a fully deterministic, well-tested Klondike solitaire:
- Fresh shuffled 52-card deck, unique cards, seed-based RNG injectable for reproducing games.
- Seven tableau columns, four foundations, stock/waste, correct face-up/face-down dealing and rules.
- Deal 1 and deal 3 options, with clear turn/recycle counting and configurable restrictions.
- Moves: stock draw/recycle, waste-to-tableau/foundation, tableau-to-tableau runs, tableau-to-foundation, foundation-to-tableau where permitted, and automatic movement to foundations under safe rules.
- Expose `legalMoves(state)`, `applyMove(state, move)`, `undo(state)`, `hint(state)`, `isWon(state)`, and serializable snapshots. Invalid moves must not mutate state.
- Undo restores EXACTLY the prior card/turn/score state; it must NOT mint currency, reroll the deal, or consume game rewards unless specifically defined in domain policy.
- Hint suggests a real legal move, or a truthful explanation when none exists.
- No arbitrary guarantee that random deals are winnable. If "guaranteed solvable" is later required, implement a genuine solvability-constrained generator with reproducible evidence and separate tests.
- Support touch and click controller semantics conceptually, but keep event mapping outside the engine.

Tests: 52 cards unique; proper deal distribution; rank/suit/color legality; foundation sequences; move sequence invariants; draw-3 wrap/recycle; undo exact state round-trip; auto-finish legality; deterministic seed; save/load equality; win detection.

## Stage 2 — Rewards and progression
Implement a transactional `RewardLedger`:
- Achievements, quests and minigame victories yield `Lysglimt` and optional **in-game resources**.
- No real-money payments, purchase frameworks or advertising SDKs.
- Idempotent rewards (duplicate event/retry never pays twice).
- Undo points and minigame moves, if adopted, are separate tracked resources with explicit earn/use rules and visible explanations.
- Inventory/decorations only purchaseable with earned resources. Balance can never become negative.
- Versioned event-based/atomic local save with replay safety and migration tests.

## Stage 3 — Garden world
- Garden uses full-screen scene under a fixed HUD.
- Pan + pinch zoom with focal-point stability, bounded translation and independent decoration dragging.
- Place/move/rotate/remove decorations; consistent hitboxes and scene coordinates independent of screen resolution.
- Seasonal artwork switching Spring/Summer/Autumn/Winter; manual/automatic options.
- Millie and Marmalade visible as characters; optional gentle ambient animation; reduced motion support.
- Deterministic garden state, offline save, no hidden progression losses.

## Stage 4 — Pluggable minigames
Create a modular minigame interface and at least one fully playable minigame with deterministic tests (prefer Flower Match first). Keep future game types behind stable contracts (puzzle, find differences, memory).
- Explain available moves, requirements, rewards and blocked/unavailable actions.
- Prevent double rewarding/repeating win events.
- Switch to and from Solitaire without discarding the deal; save progress.

## Stage 5 — Profiles, settings, cards
- One local player profile with display name, selectable illustrative avatar, language and accessibility preferences.
- Card designs are independently selectable **face style** and **back style**: Classic, Botanical, Woodland + available back themes. Use common 190×270 logical ratio and consistent rank/suit placements.
- Gameplay must NEVER depend on selected visuals; a theme switch must not mutate a game or invalidate a save.
- Names, buttons, warnings, dialogues, aria/accessibility labels must exist in DA and EN.

## Stage 6 — UI implementation only after design signoff
- The 57 V3 SVGs are approved graphic assets under `assets/v3/`; final screen compositions still require approval. They require a vetted React Native-compatible pipeline (e.g., `react-native-svg` with compatible transformer, or deterministic PNG/WebP exports). Never pass SVG straight to native `Image` without support.
- Do not stretch decorated button graphics arbitrarily, and do not bake labels into images.
- Establish reusable button, panel, HUD, tab, card, dialog, avatar and game components with documented hitboxes and safe areas.
- Match owner-approved screenshots and exact asset roles, not a developer-invented visual approximation.
- Add long-press help for icon-only controls, localization and screen reader labels.
- Use consistent portrait layouts for 360×800 and 390×844, and explicit adaptation for landscape.

## Acceptance and validation
Every stage must deliver:
1. Description and exact changed files.
2. Deterministic tests run with real output; never claim unrun tests passed.
3. Gameplay acceptance table + edge cases.
4. Visual comparison against approved designs where relevant (screenshots, no cropped text/icons, actual art bounds).
5. Branch/commit SHA, known issues and remaining work.
6. No APK build without explicit instruction.

Start immediately with stage 1 ENGINE ONLY, but first read design docs and report any contradictions. Do not create UI/graphic replacements or launch native builds. Keep implementation incremental and commit/push tested work.
