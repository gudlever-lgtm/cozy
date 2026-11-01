# Executed validation — 1.7.1 landscape preview

2026-11-01. User-requested landscape/full-screen presentation, Millie-derived logo, integrated garden/game panels, card interaction fixes and swipe-controlled Garden Match. Details: [LANDSCAPE_GAMEPLAY.md](LANDSCAPE_GAMEPLAY.md).

| Check | Result | Evidence / limit |
|---|---|---|
| TypeScript and formatting | Passed | Full application and test sources; `git diff --check` clean |
| Engine/localization/assets/presentation | 37 passed, 0 skipped | Existing game/progression/migration coverage plus phone/tablet geometry, swipe boundary/threshold and single legal forgiving drop selection |
| Native component integration | 32 passed, 0 skipped across Android/iOS | Six suites; includes double-tap ace/two promotion and undo, Garden Match responder swipes, animation locking, tap/boundary rejection, invalid return, sequential swipes to victory, native Tea Time solution and existing hidden-object/reward/resume tests |
| Native JS/Hermes exports | Passed for Android and iOS | Both native bundles and offline assets exported with Expo; no browser target |
| Local Android APK | Passed | Gradle `:app:assembleRelease -PreactNativeArchitectures=arm64-v8a`, final build 1m 5s; Java 17, SDK/target 36, min SDK 24, NDK 27.1, Gradle 8.14.3 |
| APK metadata | Verified | `com.gudlever.cozy`, version 1.7.1 / code 2, ARM64, compiled manifest requests landscape |
| APK integrity and signing | Verified | ZIP integrity, APK v2 signing, 16 KB alignment, embedded Hermes JS, all seven compiled ambient sprite resources |
| APK upgrade signing | Same certificate as 1.7.0 | Android test certificate SHA256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`; not production signing |
| APK SHA256 | `b1508f50ea5b40e270a38f1a12105b101cbffb2e3e2d8e5de20f6435ecff91c7` | 56,092,933 bytes |
| EAS Android/iOS jobs, iOS IPA | Not run | No Expo project/account or production signing configured |
| Physical device appearance/touch/system bars/FPS | Unverified | Jest invokes responder callbacks with a timed animation-driver substitute. This does not establish actual touchscreen feel, rendered native screenshots, full-screen behavior on OEM devices or frame rate |
| Store submission | Not performed | Preview distribution only |

The previous dependency-host network blocker was resolved when the user published the environment configuration. The 1.7.0 APK was already distributed on a separate Git download branch. 1.7.1 remains a test-signed native preview for device review, not a claim of production readiness or completed visual approval.

Public download branch: `android-download-1.7.1`. Binary and QR verification metadata accompany the download. Source and main branches do not contain the APK.

## 1.7.2 scroll regression

TypeScript and formatting passed; 37 engine/presentation tests and 36 Android/iOS native component tests passed. See [SCROLL_FIX_1.7.2.md](SCROLL_FIX_1.7.2.md). Native tests do not perform native layout or establish physical-device scrolling behavior. The 1.7.1 APK checksum above remains historical evidence for that version; the new APK has its own BUILD_INFO.json and SHA256SUMS.txt on `android-download-1.7.2`.

## 1.7.3 measured board and collapsed columns

40 engine/presentation tests and 38 native component tests passed across Android/iOS presets. The board uses measured dimensions, shows only the first/last exposed cards per column and offers a picker for intermediate cards. New native coverage selects a hidden queen from a 19-card column, moves its suffix onto a king and undoes the move. Geometry covers complete initial/long columns in small measured viewports. Physical-device rendering and gesture comfort remain unverified. See [COMPACT_COLUMNS_1.7.3.md](COMPACT_COLUMNS_1.7.3.md).

## 1.7.4 usability regression

42 engine/presentation and 52 Android/iOS native component tests pass, alongside TypeScript, formatting, both native JS/Hermes exports and the local Android APK build (1m 19s). See [USABILITY_1.7.4.md](USABILITY_1.7.4.md) for actual coverage, original atlas use and explicit device-testing limits.

## 1.7.5 Garden Match motion and fixed pages

44 engine/presentation tests and 62 native component tests pass. New coverage checks local cascade mappings, stationary identities, input recovery after interrupted/missing callbacks and lost releases, plus Decorations/Statistics page geometry/navigation and preserved purchase/placement behavior. See [GARDEN_MATCH_MOTION_1.7.5.md](GARDEN_MATCH_MOTION_1.7.5.md). Physical-device appearance, gesture feel and FPS remain unverified.

1.7.5 native build evidence: local ARM64 Gradle APK build succeeded in 59 seconds, and Expo native JS/Hermes exports passed for Android and iOS. This does not replace physical-device gesture/performance verification.
