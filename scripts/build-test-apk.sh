#!/usr/bin/env bash
# Build Cozy Solitaire for Android internal testing, then print an installation QR code.
# Usage: bash scripts/build-test-apk.sh
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v node >/dev/null; then echo "Node.js required (use nvm use 24)" >&2; exit 1; fi
echo "Node: $(node -v)"
echo "Checking dependencies..."
if [[ ! -x node_modules/.bin/tsc || ! -x node_modules/.bin/tsx ]]; then
  npm ci --include=dev --no-audit --no-fund
fi
npm run typecheck
npm test
echo
echo "Building signed Android preview APK through Expo EAS..."
echo "If this is the first build, log in to Expo and approve Android signing-key creation."
npx --no-install eas-cli build --platform android --profile preview --wait
echo
echo "Retrieving the newest finished preview APK..."
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
npx --no-install eas-cli build:list --platform android --build-profile preview --status finished --limit 1 --json > "$tmp"
url="$(node - "$tmp" <<'JS'
const fs=require('node:fs');
const list=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const build=Array.isArray(list)?list[0]:null;
const url=build?.artifacts?.buildUrl ?? build?.artifacts?.applicationArchiveUrl ?? '';
if (!/^https:\/\//.test(url) || !url.includes('.apk')) {
  // URLs can be signed and have querystrings; do not substitute an unverified URL.
  process.stderr.write('The EAS build is not exposing a verifiable APK URL. Open its build details in Expo.\n');
  process.exit(1);
}
process.stdout.write(url);
JS
)"
printf '\nAPK download: %s\n\n' "$url"
printf '%s\n' "$url" > cozy-test-apk-url.txt
echo "Scan this QR code with your Android phone:"
npx --yes --package=qrcode-terminal qrcode-terminal "$url"
echo
echo "The APK link is also saved locally in cozy-test-apk-url.txt (do not commit that file)."
