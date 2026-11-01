# Cozy Solitaire — latest Android preview

[Download cozy-solitaire.apk](https://raw.githubusercontent.com/gudlever-lgtm/cozy/android-download/cozy-solitaire.apk)

![Download QR](cozy-solitaire-qr.png)

Current app: **1.7.5**, Android versionCode **6**. Filename and QR URL remain unchanged.

Garden Match uses stable pieces, local clears, falling survivors and refill from above. Input recovers from missing completion callbacks, interruption, backgrounding and lost finger releases. Decorations and Statistics use screen-sized pages without scrolling. Original illustrated artwork remains integrated.

ARM64 Android 7.0+, same test-signing certificate/package as earlier previews. Install as an update without uninstalling.

44 engine/presentation tests and 62 native component tests pass. Android/iOS JS exports and the local Android APK build pass; signature, ZIP integrity, 16KB alignment, version and standalone bundle verified. Physical-device gesture feel, native rendering and FPS remain unverified.

Source on main: [9e57c17](https://github.com/gudlever-lgtm/cozy/commit/9e57c17). See BUILD_INFO.json and SHA256SUMS.txt.
