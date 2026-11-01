# Cozy Solitaire — latest Android preview

[Download cozy-solitaire.apk](https://raw.githubusercontent.com/gudlever-lgtm/cozy/android-download/cozy-solitaire.apk)

![Download QR](cozy-solitaire-qr.png)

Current app: **1.7.14**, Android versionCode **15**, save schema **4**. Filename and QR URL are unchanged.

Compact inverse-delta Solitaire undo reduces a fresh 200-action save to about 12.5 KB. Duplicate saves are skipped and safe backups use a 30-second interval. Blocked stock cycles offer Undo/New game. New game can choose among 100 verified winnable deals per draw mode; the offline solver is not bundled. Tea Time uses varied BFS-verified minimum 6/7/8-pour layouts, and treasures/hints/butterfly departures share stable round-seeded authored positions. Existing progression, artwork, economy and saved mini-game layouts are preserved; versions 1–3 migrate to schema 4.

ARM64 Android 7.0+, same test-signing certificate/package as earlier previews. Install as an update without uninstalling.

76 engine/presentation/asset tests and 166 Android/iOS component runs pass. TypeScript, formatting and offline native JS/Hermes exports pass. The clean Android release build succeeded in 5m 3s; the final functional-state correction was rebuilt in 45s and regression-tested with two batched stock actions. Signature continuity, ZIP integrity, 16KB alignment, package/version, standalone bundle and regional resources are verified. Physical-device gestures, audio, appearance and performance remain unverified. This is a test-signed preview, not a production store release.

Source: [25a3540](https://github.com/gudlever-lgtm/cozy/commit/25a354053b0f6b0d8fb41014ca85b72d30d096f8). [Per-task report](https://github.com/gudlever-lgtm/cozy/blob/main/docs/OPTIMIZATION_REPORT.md). Original challenge seeds 17017/23111 remain unknown at 150,000 nodes; 98173 is solved. No seeds were replaced. See BUILD_INFO.json and SHA256SUMS.txt for this binary.
