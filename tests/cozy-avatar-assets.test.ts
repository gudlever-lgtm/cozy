import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const avatarRoot = path.resolve(
  "assets/cozy-redesign/illustrations/characters",
);

test("new Cozy character portraits are real offline WebP assets", () => {
  const registry = fs.readFileSync("src/assets/images.ts", "utf8");
  const garden = fs.readFileSync("src/ui/GardenHome.tsx", "utf8");
  for (const character of ["millie", "marmalade"]) {
    const name = `${character}_idle.webp`;
    const file = path.join(avatarRoot, name);
    assert.ok(fs.existsSync(file), "Missing avatar: " + file);
    const data = fs.readFileSync(file);
    assert.equal(data.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(data.subarray(8, 12).toString("ascii"), "WEBP");
    assert.ok(data.length < 80_000, "Avatar is oversized: " + name);
    const key = `characters_${character}_idle_webp`;
    const staticManifest = fs.readFileSync(
      "src/assets/cozyRedesignImages.ts",
      "utf8",
    );
    assert.ok(
      staticManifest.includes(`"${key}"`),
      "Missing static Metro require: " + key,
    );
    assert.ok(
      registry.includes(`cozyRedesignImages.${key}`),
      "Image registry must expose the active pose: " + key,
    );
    assert.ok(
      garden.includes(`<CharacterIdle character="${character}"`),
      "Garden must mount the animated character portrait: " + character,
    );
    const characterSource = fs.readFileSync(
      "src/living/CharacterIdle.tsx",
      "utf8",
    );
    assert.ok(
      characterSource.includes(`cozyImages.avatars.${character}`),
      "Animated character must retain the new idle pose: " + character,
    );
  }
});
