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
    const name = `${character}_avatar.webp`;
    const file = path.join(avatarRoot, name);
    assert.ok(fs.existsSync(file), "Missing avatar: " + file);
    const data = fs.readFileSync(file);
    assert.equal(data.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(data.subarray(8, 12).toString("ascii"), "WEBP");
    assert.ok(data.length < 30_000, "Avatar is oversized: " + name);
    assert.ok(registry.includes(name), "Missing static Metro require: " + name);
    assert.ok(
      garden.includes(`cozyImages.avatars.${character}`),
      "Garden should use the new preview sprite: " + character,
    );
  }
});
