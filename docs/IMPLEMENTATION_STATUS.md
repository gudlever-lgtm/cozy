# Implementation status — development toward V2.0

Baseline: `35a3e91`, Android/iOS only. The approved ambient artwork through `19aa34b` was preserved and integrated. Public app version is 1.7.9; this is a development increment, not a completed V2.0 release.

| Milestone / feature | Actual status | Remaining acceptance work | Dependencies / tests | Acceptance |
|---|---|---|---|---|
| V1.0 Klondike | Implemented; rules/component tested; original vector card faces/backs | Device landscape touch QA | Deck conservation, legal/illegal moves, flip, undo, safe finish, victory | Complete playable deal on native device |
| V1.1 economy | Implemented/tested, including expansion spending of every resource | Signed-binary/device regression | Validated central ledger and idempotent receipts | Earn/spend without negative balances or duplicate rewards |
| V1.2 garden/quests | Implemented/tested | Native visual/interaction QA | Initial three chains and visible purchases | Quest completion changes scene |
| V1.3 seasons | Approved seasonal scenes plus independent Reanimated engine implemented/tested | Real FPS/memory/low-end device QA; exact foreground masks absent | Manual/calendar mode, density, lifecycle and reduced-motion tests | Cosmetic effects never interrupt gameplay |
| V1.4 Garden Match | Implemented/tested with three target/move variants and persisted session | Device interaction/balancing QA | Match rules, rewards, restart | Repeatable valid rewards |
| V1.5 native | Configuration, JS/Hermes exports and local APK build verified | Production AAB/IPA and device validation | Local ARM64 test APK builds succeed; EAS login/production signing unavailable | Actual native binary/job evidence |
| V1.6 localization/profile | Implemented/tested including expansion narratives | Native accessibility review | Full DA/EN key/interpolation completeness, Unicode and migrations | Live switch without progression loss |
| V1.7 mini-games/quests | Three games, three levels per game, six initial quests and interrupted-session restore implemented/tested | Native real-touch QA | Tea solvability, hidden completion, medals, duplicate rewards, resume without abandoning puzzle | Every initial chain and mini-game can complete |
| V1.8 polish | Supplied ambient sprites at 3 densities, portrait idle, illustrated cards/themes, subtle victory glimmers/chime, touch feedback implemented | Hardware audio/visual/performance approval | Motion/mute settings; functional native component tests | Pleasant consistent presentation without compulsory effects |
| V1.9 reliability/release prep | Schema-3 migration, last-known-good local backup, lifecycle save, DA/EN privacy/store-copy/release-note drafts implemented | SDK advisory resolution/review, real screenshots, signing, device/store QA | Recovery, migration, corruption, save ordering and progression tests | No unresolved release blockers before release claim |
| V2.0 world | Four additional areas, eight buildings at 3 levels, eight extended stories, friendships, evergreen festivals, four additional achievements, themes, seeded challenges implemented/tested | Native UX/content/balance and artwork approval; production builds | Full progression completed in engine tests using earned resources; area/build/story/restart UI integration | Every area has real persistent interactions |

## Verified checks

- 47 engine/localization/asset/progression/presentation tests, no skips.
- 100 React Native component test runs across iOS and Android Jest Expo presets, no skips.
- TypeScript and formatting pass.
- Native JS/Hermes exports include all seven ambient sprites at all three densities. These are not signed native app builds.
- Existing Solitaire move rules and reward values remain unchanged; only optional challenge metadata was added to the game type.

## Concrete blockers and next steps

1. Local Android ARM64 APK compilation succeeds after the published environment applied the allowed dependency host. APKs use a test signing key; production signing remains outstanding.
2. No authorized Expo account/project and Android/iOS production signing are configured. EAS jobs have not run.
3. No physical device/emulator test or real frame-time/memory measurement is claimed. Actual store screenshots therefore remain missing.
4. The SDK 54 dependency-advisory review remains a production release gate. Do not label this app release ready based on component tests.
5. No high-quality separated foreground tree mask was supplied. Birds use safe sky bands. Existing high-quality seasonal/NPC art is retained; expansion scenes and cards are original vectors and require product/device visual approval.

Next acceptance step: review the 1.7.1 landscape APK on actual phones/tablets, including long card columns, foundation drop/double tap, Garden Match swipes, safe areas and system-bar resume. See `LANDSCAPE_GAMEPLAY.md` and `TEST_RESULTS.md`.

Latest usability acceptance: original icon/resource atlases integrated, native modal/HUD layering, board-level Garden Match swipe capture, compact inventory/high-contrast scrolling and large single-suit card faces. See `USABILITY_1.7.4.md` for executed checks and remaining physical-device review.

1.7.5 adds local cascade animation with stable piece identities and interruption-safe input recovery. Decorations and Statistics now use fixed viewport pages without scrolling. See `GARDEN_MATCH_MOTION_1.7.5.md`. Device acceptance is still outstanding.

1.7.6 replaces the clipped stack list with measured full-card pages, compacts the world map, gives exact unlock guidance and exposes card design/season/motion previews. System reduced motion is now live policy rather than copied into the saved manual flag. See `WORLD_CLARITY_1.7.6.md`; device verification remains required.

1.7.7 defaults new free deals to draw-three, adds a sparse particle surface below cards and confirms gathering gains. Existing deals and explicit draw-one remain supported. See `PLAY_DEFAULTS_1.7.7.md`.
