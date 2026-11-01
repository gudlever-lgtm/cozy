# Executed validation — Living World V1 and world progression

Baseline gameplay is preserved. The living-world change adds the approved seven-sprite native catalog, Reanimated scheduling/layers, portrait idle behavior and persisted DA/EN motion controls.

| Check | Result | Evidence / limit |
|---|---|---|
| TypeScript | Passed | Full application and test sources |
| Engine/localization/assets | 34 passed, 0 skipped | Gameplay regressions, source/density/motion policy, full area/story progression through earned resources, festivals, themes, seeded challenges, puzzle solvability, schema migration and backup recovery |
| React Native integration | 20 passed, 0 skipped | iOS and Android Jest Expo presets: game/profile flows, settings persistence, layer order/no input capture, background/resume, reduced motion, partial puzzle restore, world area/build/story purchases and victory idempotency |
| Native JS/Hermes exports | Passed for Android and iOS | Includes the seven ambient sprites at all three native densities; no browser bundle |
| Sprite generation | Passed | CairoSVG 2.8.2/Pillow 13.0.0, supersampling; RGBA transparency checked during generation; source SHA-256 recorded |
| Local Android APK compilation | Blocked | SDK 36, NDK 27.1, CMake, verified Gradle 8.14.3 and verified Java 17 installed. React Native/Hermes AAR downloads redirect to `repo.reactnative.dev`, denied by current policy (403). No APK has been produced |
| EAS Android / iOS cloud jobs | Not run | No authenticated Expo session/project/signing credentials are configured |
| Real device FPS, memory and touch | Unverified | Mocked Reanimated tests establish policy/integration, not frame-rate or actual gestures |
| Store submission | Not performed | No publication or paid services authorized |

Only `repo.reactnative.dev` was added to the environment configuration **draft** to unblock the local APK download dependency. Saving that draft does not apply the running policy or publish it. The user must review/save the environment settings and publish the environment before the affected build can be retried. No network protections, TLS checks or artifact checksums were bypassed.

Remaining scope from the V2.0 execution roadmap is in `IMPLEMENTATION_STATUS.md`; these results do not imply V2.0 or either store release is complete.
