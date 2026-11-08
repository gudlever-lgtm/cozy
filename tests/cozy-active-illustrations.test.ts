import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const read = (name: string) => fs.readFileSync(path.resolve(name), "utf8");

test("main menu styles all six primary destinations as primary actions", () => {
  const source = read("src/MainMenu.tsx");
  assert.match(source, /\{primary\.map\(\(item\)/);
  assert.match(source, /\{secondary\.map\(\(item\)/);
  assert.match(source, /\bquiet\s+style=/);
  assert.match(source, /t\("menuMore"\)/);
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
  assert.match(garden, /gardenImageSize\(season, portrait && cottage\)/);
  assert.match(images, /gardenPortrait: cozyRedesignImages\.backgrounds_garden_home_spring_webp/);
  assert.match(read("src/App.tsx"), /\? cozyImages\.gardenPortrait/);
});

test("solitaire toolbar icons use separate transparent production graphics", () => {
  const icon = read("src/GameIcon.tsx");
  const source = read("src/assets/cozyRedesignImages.ts");
  for (const key of ["new_game", "undo", "hint", "auto_finish"]) {
    const assetKey = "cards_icon_" + key + "_webp";
    assert.ok(icon.includes("cozyRedesignImages." + assetKey), "Missing active icon: " + assetKey);
    assert.ok(source.includes('"' + assetKey + '"'), "Missing bundled icon: " + assetKey);
  }
});
