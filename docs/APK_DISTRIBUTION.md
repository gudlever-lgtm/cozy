# Permanent preview download naming

User preference: always publish the APK as **cozy-solitaire.apk**, without a version number in the filename. Continue increasing the app version and Android versionCode/iOS buildNumber internally.

Use the `android-download` branch for the current preview:

- APK: `https://raw.githubusercontent.com/gudlever-lgtm/cozy/android-download/cozy-solitaire.apk`
- QR: `https://raw.githubusercontent.com/gudlever-lgtm/cozy/android-download/cozy-solitaire-qr.png`

The QR encodes the permanent APK URL. Update this branch normally for future authorized APK publications; keep the QR payload and filename unchanged. Update BUILD_INFO.json, SHA256SUMS.txt and README with each verified binary. Preserve the package and signing key for update compatibility. Do not place APK binaries on source branches or rewrite historical version download branches.
