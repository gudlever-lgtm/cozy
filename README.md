# Cozy Solitaire — latest Android preview

[Download cozy-solitaire.apk](https://raw.githubusercontent.com/gudlever-lgtm/cozy/android-download/cozy-solitaire.apk)

![Download QR](cozy-solitaire-qr.png)

Current app: **1.7.10**, Android versionCode **11**. Filename and QR URL are unchanged.

An original illustrated firefly demonstrates a legal move after 12 idle seconds in Solitaire and all three mini-games, once per pause. It clears on input and pauses for gameplay gestures, dialogs and background state. Animation-off disables it; reduced motion uses a stationary outline. Existing deals, rules, resources and progression are preserved.

ARM64 Android 7.0+, same test-signing certificate/package as earlier previews. Install as an update without uninstalling.

49 engine/presentation and 112 native component tests pass. Native JS exports and local APK build passed; signature, ZIP integrity, 16KB alignment, version and standalone bundle verified. Physical-device rendering, touch and FPS remain unverified.

Source on main: [d8ab1ca](https://github.com/gudlever-lgtm/cozy/commit/d8ab1ca). See BUILD_INFO.json and SHA256SUMS.txt.
