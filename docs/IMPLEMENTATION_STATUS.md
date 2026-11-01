# Implementation status — development toward V2.0

Baseline: `35a3e91`, Android/iOS only. The approved ambient artwork through `19aa34b` was preserved and integrated. Public app version remains 1.7.0; this is a development increment, not a completed V2.0 release.

| Milestone / feature | Actual status | Remaining acceptance work | Dependencies / tests | Acceptance |
|---|---|---|---|---|
| V1.0 Klondike | Implemented; rules/component tested; original vector card faces/backs | Device touch/portrait QA | Deck conservation, legal/illegal moves, flip, undo, safe finish, victory | Complete playable deal on native device |
| V1.1 economy | Implemented/tested, including expansion spending of every resource | Signed-binary/device regression | Validated central ledger and idempotent receipts | Earn/spend without negative balances or duplicate rewards |
| V1.2 garden/quests | Implemented/tested | Native visual/interaction QA | Initial three chains and visible purchases | Quest completion changes scene |
| V1.3 seasons | Approved seasonal scenes plus independent Reanimated engine implemented/tested | Real FPS/memory/low-end device QA; exact foreground masks absent | Manual/calendar mode, density, lifecycle and reduced-motion tests | Cosmetic effects never interrupt gameplay |
| V1.4 Garden Match | Implemented/tested with three target/move variants and persisted session | Device interaction/balancing QA | Match rules, rewards, restart | Repeatable valid rewards |
| V1.5 native | Configuration and JS/Hermes exports verified | APK/AAB/IPA and device validation | Local Android tools installed; React Native AAR host currently denied; EAS login/signing unavailable | Actual native binary/job evidence |
| V1.6 localization/profile | Implemented/tested including expansion narratives | Native accessibility review | Full DA/EN key/interpolation completeness, Unicode and migrations | Live switch without progression loss |
| V1.7 mini-games/quests | Three games, three levels per game, six initial quests and interrupted-session restore implemented/tested | Native real-touch QA | Tea solvability, hidden completion, medals, duplicate rewards, resume without abandoning puzzle | Every initial chain and mini-game can complete |
| V1.8 polish | Supplied ambient sprites at 3 densities, portrait idle, illustrated cards/themes, subtle victory glimmers/chime, touch feedback implemented | Hardware audio/visual/performance approval | Motion/mute settings; functional native component tests | Pleasant consistent presentation without compulsory effects |
| V1.9 reliability/release prep | Schema-3 migration, last-known-good local backup, lifecycle save, DA/EN privacy/store-copy/release-note drafts implemented | SDK advisory resolution/review, real screenshots, signing, device/store QA | Recovery, migration, corruption, save ordering and progression tests | No unresolved release blockers before release claim |
| V2.0 world | Four additional areas, eight buildings at 3 levels, eight extended stories, friendships, evergreen festivals, four additional achievements, themes, seeded challenges implemented/tested | Native UX/content/balance and artwork approval; production builds | Full progression completed in engine tests using earned resources; area/build/story/restart UI integration | Every area has real persistent interactions |

## Verified checks

- 34 engine/localization/asset/progression tests, no skips.
- 20 React Native component test runs across iOS and Android Jest Expo presets, no skips.
- TypeScript and formatting pass.
- Native JS/Hermes exports include all seven ambient sprites at all three densities. These are not signed native app builds.
- Existing Solitaire move rules and reward values remain unchanged; only optional challenge metadata was added to the game type.

## Concrete blockers and next steps

1. Local APK compilation reaches Gradle dependency resolution but React Native/Hermes AAR downloads redirect to `repo.reactnative.dev`, returning policy denial 403. Only this domain has been added to the environment **draft**; it is not active. Review/save environment settings and publish the environment, then retry the APK build with the already-installed Java 17/SDK/NDK/Gradle prerequisites.
2. No authorized Expo account/project and Android/iOS production signing are configured. EAS jobs have not run.
3. No physical device/emulator test or real frame-time/memory measurement is claimed. Actual store screenshots therefore remain missing.
4. The SDK 54 dependency-advisory review remains a production release gate. Do not label this app release ready based on component tests.
5. No high-quality separated foreground tree mask was supplied. Birds use safe sky bands. Existing high-quality seasonal/NPC art is retained; expansion scenes and cards are original vectors and require product/device visual approval.

Next exact implementation action after network activation: rerun `:app:assembleRelease` for ARM64 with the verified local toolchain, verify the resulting APK signature/package/assets, and provide the actual binary. See `TEST_RESULTS.md` for build evidence and `RELEASE_CHECKLIST.md` for release requirements.
