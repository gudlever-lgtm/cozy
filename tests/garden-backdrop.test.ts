import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("garden and editor share a noninteractive full-bleed illustration", () => {
  const component = read("src/ui/GardenBackdrop.tsx");
  const home = read("src/ui/GardenHome.tsx");
  const editor = read("src/GardenBuildScreen.tsx");
  assert.match(component, /pointerEvents="none"/);
  assert.match(component, /style=\{StyleSheet\.absoluteFill\}/);
  assert.match(component, /resizeMode="cover"/);
  assert.match(component, /season === "spring"/);
  assert.match(home, /<GardenBackdrop season=\{season\} \/>/);
  assert.match(editor, /<GardenBackdrop season=\{season\} \/>/);
});

test("the actual interactive garden remains independently fitted and transparent", () => {
  const home = read("src/ui/GardenHome.tsx");
  const editor = read("src/GardenBuildScreen.tsx");
  const camera = read("src/GardenViewport.tsx");
  assert.match(home, /<GardenViewport/);
  assert.match(editor, /<GardenViewport/);
  assert.match(camera, /backgroundColor: "transparent"/);
  assert.match(camera, /gardenCameraFit\(bounds, imageSize\)/);
  assert.match(camera, /gardenPanLimits\(bounds, imageSize, z\)/);
  assert.match(camera, /testID="garden-zoom-level"/);
});
