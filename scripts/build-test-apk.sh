#!/usr/bin/env bash
# Local standalone Android APK build (no EAS / Expo cloud).
# Usage: bash scripts/build-test-apk.sh
# Optional: APK_BASE_URL=https://your-host.example/apk bash scripts/build-test-apk.sh
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
if [[ ! -f android/gradlew && ! -f android/app/build.gradle ]]; then
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
mkdir -p dist/apk
cp -f "$APK" dist/apk/cozy-solitaire-test.apk
sha256sum dist/apk/cozy-solitaire-test.apk
echo
echo "APK READY: $(pwd)/dist/apk/cozy-solitaire-test.apk"
echo "Size: $(du -h dist/apk/cozy-solitaire-test.apk | cut -f1)"
echo
echo "For LAN download, from another terminal run:"
echo "  cd $(pwd)/dist && python3 -m http.server 8765 --bind 0.0.0.0"
echo "Make port 8765 accessible ONLY to your trusted local network."
if [[ -n "${APK_BASE_URL:-}" ]]; then
  URL="${APK_BASE_URL%/}/cozy-solitaire-test.apk"
  echo "Download address (verify this URL is reachable on your phone): $URL"
  if command -v qrencode >/dev/null; then
    echo "Scan this QR code to download the APK:"
    qrencode -t ANSIUTF8 "$URL"
    qrencode -o dist/apk/cozy-solitaire-qr.png -s 8 -m 2 "$URL"
    echo "QR image: $(pwd)/dist/apk/cozy-solitaire-qr.png"
  else
    echo "To print a terminal QR code: sudo apt-get install qrencode"
  fi
else
  echo "To generate a QR code, run with:"
  echo "  APK_BASE_URL=http://YOUR_SERVER_LAN_IP:8765/apk bash scripts/build-test-apk.sh"
  echo "Choose an address reachable by your Android device (never localhost/127.0.0.1)."
fi
