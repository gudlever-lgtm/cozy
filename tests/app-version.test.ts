import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import manifest from "../app.json";
import pkg from "../package.json";

const source = (file: string) => readFileSync(file, "utf8");

test("installed version and native Android/iOS build identifiers are consistent", () => {
  assert.equal(manifest.expo.version, pkg.version);
  assert.equal(manifest.expo.android.versionCode, Number(manifest.expo.ios.buildNumber));
  assert.ok(manifest.expo.android.versionCode > 23, "Increment versionCode when distributing a newer APK");
});

test("garden home and menu show the same manifest-sourced release identity", () => {
  const version = source("src/ui/AppVersion.tsx");
  const garden = source("src/ui/GardenHome.tsx");
  const menu = source("src/MainMenu.tsx");
  assert.match(version, /appManifest\.expo\.version/);
  assert.match(version, /appManifest\.expo\.android\.versionCode/);
  assert.match(version, /testID = "app-version"/);
  assert.match(garden, /<AppVersion\s*\/>/);
  assert.match(menu, /<AppVersion testID="menu-app-version"/);
});
