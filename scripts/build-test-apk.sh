#!/usr/bin/env bash
# Local standalone Android APK build (no EAS / Expo cloud).
# Usage: bash scripts/build-test-apk.sh
# Optional: APK_DEST_DIR=/other/path APK_BASE_URL=https://host/downloads bash scripts/build-test-apk.sh
set -euo pipefail
cd "$(dirname "$0")/.."
export CI=1 EXPO_NO_TELEMETRY=1
echo "== Cozy Solitaire — local Android APK =="
command -v node >/dev/null || { echo "Node.js 24 is required; run nvm use 24" >&2; exit 1; }
command -v java >/dev/null || { echo "Java/JDK 17 is required" >&2; exit 1; }
command -v python3 >/dev/null || { echo "Python 3 is required" >&2; exit 1; }
echo "Node: $(node --version)"
java -version 2>&1 | head -n 1
if [[ ! -x node_modules/.bin/tsc || ! -x node_modules/.bin/tsx ]]; then
  echo "Installing locked dependencies..."
  npm ci --include=dev --no-audit --no-fund
fi
npm run typecheck
npm test

# Expo prebuild generates the native Android project locally.
# It does NOT build through EAS or require Expo account login.
if [[ ! -f android/gradlew || ! -f android/app/build.gradle ]]; then
  echo "Generating local native Android project..."
  npx --no-install expo prebuild --platform android --no-install
fi
[[ -f android/gradlew ]] || { echo "Missing android/gradlew after prebuild" >&2; exit 1; }
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [[ -z "$SDK" && -f android/local.properties ]]; then
  SDK="$(sed -n 's/^sdk.dir=//p' android/local.properties | head -n1)"
fi
[[ -n "$SDK" && -d "$SDK" ]] || {
  echo "Android SDK not found. Set ANDROID_HOME (or ANDROID_SDK_ROOT) to your installed SDK directory." >&2
  exit 1
}
export ANDROID_HOME="$SDK" ANDROID_SDK_ROOT="$SDK"
echo "SDK: $ANDROID_HOME"
echo "Building standalone release APK with Gradle..."
(cd android && bash ./gradlew :app:assembleRelease --no-daemon)
APK="android/app/build/outputs/apk/release/app-release.apk"
[[ -s "$APK" ]] || {
  echo "No APK at $APK — inspect android/app/build/outputs/apk/release/." >&2
  exit 1
}

# Release APK must be signed to install on an Android phone.
SIGNER="$SDK/build-tools"
APK_SIGNER="$(find "$SIGNER" -type f -name apksigner 2>/dev/null | sort -V | tail -1 || true)"
if [[ -z "$APK_SIGNER" ]]; then
  echo "Missing Android SDK build-tools/apksigner — install Android SDK build-tools." >&2; exit 1
fi
if ! "$APK_SIGNER" verify "$APK" >/dev/null 2>&1; then
  echo "APK is unsigned. Configure a local signingConfig in android/app/build.gradle and rebuild." >&2
  echo "Do not distribute this APK. For a private test, a local debug keystore may be used; do not use it for Play Store releases." >&2
  exit 1
fi
# Publish only after the release APK has passed signature verification.
APK_DEST_DIR="${APK_DEST_DIR:-/var/www/dulmens.dk/downloads}"
APK_BASE_URL="${APK_BASE_URL:-https://dulmens.dk/downloads}"
if ! mkdir -p "$APK_DEST_DIR"; then
  echo "Cannot create $APK_DEST_DIR. Grant the build user write access." >&2
  exit 1
fi
if [[ ! -w "$APK_DEST_DIR" ]]; then
  echo "Cannot write to $APK_DEST_DIR. Fix ownership/permissions first." >&2
  exit 1
fi
APK_OUT="$APK_DEST_DIR/cozy-solitaire-test.apk"
install -m 0644 "$APK" "$APK_OUT"
sha256sum "$APK_OUT"
echo
echo "APK READY: $APK_OUT"
echo "Size: $(du -h "$APK_OUT" | cut -f1)"
echo
URL="${APK_BASE_URL%/}/cozy-solitaire-test.apk"
echo "Expected download URL: $URL"
echo "Verify your lighttpd vhost serves $APK_DEST_DIR at /downloads/."
if command -v qrencode >/dev/null; then
  echo "Scan this QR code to download the APK:"
  qrencode -t ANSIUTF8 "$URL"
  qrencode -o "$APK_DEST_DIR/cozy-solitaire-qr.png" -s 8 -m 2 "$URL"
  echo "QR image: $APK_DEST_DIR/cozy-solitaire-qr.png"
else
  echo "Install qrencode for QR output: apt-get install qrencode"
fi
