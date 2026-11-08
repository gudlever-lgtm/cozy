import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const read = (name: string) => fs.readFileSync(path.resolve(name), "utf8");

test("main menu styles all six primary destinations as primary actions", () => {
  const source = read("src/MainMenu.tsx");
  assert.match(source, /quiet=\{index >= primary\.length\}/);
  for (const key of ["newGame", "garden", "buildGarden", "quests", "world", "settings"]) {
    assert.ok(source.includes('key: "' + key + '"'), "Missing primary menu action: " + key);
  }
});

test("illustrated menu, primary controls, and portrait garden use bundled art", () => {
  const button = read("src/ui/CozyButton.tsx");
  const garden = read("src/ui/GardenHome.tsx");
  const images = read("src/assets/images.ts");
  assert.match(button, /cozyRedesignImages\.ui_flower_corner_left_webp/);
  assert.match(button, /!compact && !quiet && !disabled/);
  assert.match(garden, /portrait && season === "spring" \? cozyImages\.gardenPortrait/);
  assert.match(images, /gardenPortrait: cozyRedesignImages\.backgrounds_garden_home_spring_webp/);
});
