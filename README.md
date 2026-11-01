# Cozy Solitaire — latest Android preview

[Download cozy-solitaire.apk](https://raw.githubusercontent.com/gudlever-lgtm/cozy/android-download/cozy-solitaire.apk)

![Download QR](cozy-solitaire-qr.png)

Current app: **1.7.7**, Android versionCode **8**. Filename and QR URL are unchanged.

New free deals default to draw-three; existing deals retain their draw mode. Sparse seasonal particles run underneath card piles and follow motion settings. Gathering confirms +1 wood and +1 stone, with no Glimmer charge/reward.

ARM64 Android 7.0+, same test-signing certificate/package as earlier previews. Install as an update without uninstalling.

45 engine/presentation and 72 native component tests pass. Native JS exports and local APK build passed; signature, ZIP integrity, 16KB alignment, version and standalone bundle verified. Physical-device rendering, touch and FPS remain unverified.

Source on main: [ef7b8c8](https://github.com/gudlever-lgtm/cozy/commit/ef7b8c8). See BUILD_INFO.json and SHA256SUMS.txt.
