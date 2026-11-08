import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("the Cozy V2 Metro manifest resolves to 105 real WebP assets", () => {
  const source = fs.readFileSync(
    path.resolve("src/assets/cozyRedesignImages.ts"),
    "utf8",
  );
  const matches = [...source.matchAll(/require\("([^"]+\.webp)"\)/g)];
  assert.equal(matches.length, 105, "Expected all 105 V2 production graphics");
  const seen = new Set<string>();
  const categories = new Set<string>();
  let totalBytes = 0;
  for (const [, relative] of matches) {
    assert.ok(!seen.has(relative), "Duplicate bundled graphic: " + relative);
    seen.add(relative);
    assert.match(relative, /^\.\.\/\.\.\/assets\/cozy-redesign\/illustrations\//);
    const file = path.resolve("src/assets", relative);
    assert.ok(fs.existsSync(file), "Missing bundled image: " + file);
    const bytes = fs.readFileSync(file);
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", "Invalid RIFF header: " + file);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", "Invalid WebP header: " + file);
    assert.ok(bytes.length > 64 && bytes.length < 1024 * 1024, "Unexpected image size: " + file);
    totalBytes += bytes.length;
    categories.add(relative.split("illustrations/")[1].split("/")[0]);
  }
  assert.deepEqual(
    [...categories].sort(),
    ["backgrounds", "cards", "characters", "decorations", "effects", "ui"],
  );
  assert.ok(totalBytes < 4 * 1024 * 1024, "Bundled illustration art should remain optimized");
});

test("new cozy assets are actually referenced by UI components", () => {
  const imageRegistry = fs.readFileSync(path.resolve("src/assets/images.ts"), "utf8");
  const mainMenu = fs.readFileSync(path.resolve("src/MainMenu.tsx"), "utf8");
  const cards = fs.readFileSync(path.resolve("src/CardArtwork.tsx"), "utf8");
  const badges = fs.readFileSync(path.resolve("src/ui/ResourceBadge.tsx"), "utf8");
  assert.match(imageRegistry, /characters_millie_idle_webp/);
  assert.match(imageRegistry, /characters_marmalade_idle_webp/);
  assert.match(imageRegistry, /cards_card_back_blue_webp/);
  assert.match(mainMenu, /decorations_pink_hydrangea_webp/);
  assert.match(cards, /cozyImages\.cardBacks/);
  assert.match(badges, /cozyImages\.rewardShimmer/);
});
