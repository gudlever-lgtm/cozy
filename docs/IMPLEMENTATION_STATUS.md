# Implementation audit — development toward V2.0

Baseline: `35a3e91`, Android/iOS only. Evidence: 18 engine/asset tests, eight React Native component tests across iOS/Android presets, and native JS/Hermes exports. No signed EAS job or physical-device run is verified. Local APK compilation is blocked by the policy-denied `repo.reactnative.dev` AAR destination; Java 17 and SDK/NDK/Gradle prerequisites are installed with verification. The domain addition is saved in the environment draft but is not active.

| Milestone / feature | Current status | Missing work | Dependencies / tests | Acceptance |
|---|---|---|---|---|
| V1.0 Klondike | Implemented; engine and component tested | Device gesture validation, richer card illustrations | Native device; legal/illegal moves, conservation, undo, victory | Complete playable deal on device |
| V1.1 economy | Implemented/tested | Expansion spending for all resources | Ledger regression and duplicate reward tests | No negative balances or duplicate rewards |
| V1.2 garden/quests | Implemented/tested | Richer world expansion | Asset catalog, objective tests | Quest completion changes scene |
| V1.3 seasons | Implemented; native exports pass | Device performance/visual QA | Four seasons, reduced motion/lifecycle | No interference with gameplay |
| V1.4 Garden Match | Implemented/tested | Additional levels and interrupted-session persistence | Match engine and save migration | Replayable valid rewards |
| V1.5 native | Configuration and native exports verified | Actual APK/AAB/IPA and device validation | Java 17, Android SDK; Expo/Apple credentials for EAS | Proven native build evidence |
| V1.6 localization/profile | Implemented/tested | Translate expansion content | Key completeness, Unicode/migration tests | Live switch, no progress loss |
| V1.7 mini-games/quests | Implemented/tested | Persist in-progress puzzles, more puzzle levels | Session schema, solvability and reward tests | Restart restores puzzle without duplicate rewards |
| V1.8 polish | Partial | Illustrated cards, victory/touch/character feedback | Motion/mute settings, component checks | Consistent feedback without compulsory effects |
| V1.9 release preparation | Partial | Backup recovery, release metadata/privacy docs, native QA | Persistence/failure tests; SDK security review | No unresolved release blockers |
| V2.0 world | Planned | Four areas, upgrades, relationships, stories, evergreen festivals, challenges, achievements/themes | Data-driven progression, full DA/EN, migration and completion tests | Every area has real persistent interactions |

Execution order: preserve and strengthen saves → add expansion rules/content → integrate interactive UI/art → polish and release material → rerun native compilation. Do not advance the public version or mark V2.0 release ready while native signing/device/security gates remain open.

## Living World V1 increment

Implemented and tested: all seven approved SVG sources rasterized at three native densities, independent Reanimated seasonal schedules/layers, character idle translations, app pause/resume, system/user reduced motion, accessible persisted DA/EN animation and quality controls. 24 engine/asset tests and 14 native component tests pass; actual hardware performance and EAS builds remain unverified. No production foreground tree mask was supplied; birds stay in safe sky bands. See `LIVING_WORLD.md` and `TEST_RESULTS.md`.
