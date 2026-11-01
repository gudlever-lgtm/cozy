import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createAmbientObjects,
  ACTIVE_LIMITS,
  curve,
  shouldAnimate,
  type LivingSeason,
  type AnimationQuality,
} from "../src/living/model";
import { SPRITES } from "../src/living/sprites";
import { readFile } from "node:fs/promises";
test("living world density is bounded, deterministic and finite for every season/quality", () => {
  for (const season of [
    "spring",
    "summer",
    "autumn",
    "winter",
  ] as LivingSeason[])
    for (const quality of ["low", "medium", "high"] as AnimationQuality[]) {
      const objects = createAmbientObjects(season, quality, 1);
      assert.deepEqual(objects, createAmbientObjects(season, quality, 1));
      assert.ok(objects.length + 9 <= ACTIVE_LIMITS[quality]);
      assert.equal(new Set(objects.map((o) => o.id)).size, objects.length);
      assert.ok(objects.filter((o) => o.kind === "bird").length <= 1);
      for (const o of objects) {
        assert.ok(o.duration >= 4500 && o.pause >= 1000);
        for (const t of [0, 0.25, 0.5, 0.75, 1]) {
          const p = curve(o.points, t);
          assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
        }
      }
    }
  assert.equal(createAmbientObjects("winter", "high", 0).length, 0);
});
test("seasonal sprite selection includes spring wildlife, summer glow, autumn leaves/rain and winter snow", () => {
  const kinds = (s: LivingSeason) =>
    createAmbientObjects(s, "high", 1).map((o) => o.kind);
  for (const kind of ["bird", "butterfly", "blossom"])
    assert.ok(kinds("spring").includes(kind as never));
  assert.ok(kinds("summer").includes("firefly"));
  assert.ok(kinds("autumn").includes("rain"));
  assert.ok(kinds("autumn").includes("leaf"));
  assert.ok(kinds("winter").every((k) => k === "snowflake"));
});
test("motion gate prevents any active animation when disabled, reduced, backgrounded or inactive", () => {
  assert.equal(shouldAnimate(true, false, "active"), true);
  for (const state of ["background", "inactive", "unknown"])
    assert.equal(shouldAnimate(true, false, state), false);
  assert.equal(shouldAnimate(false, false, "active"), false);
  assert.equal(shouldAnimate(true, true, "active"), false);
});
test("transparent sprite files exactly match bundled XML and do not require network resources", async () => {
  for (const [kind, xml] of Object.entries(SPRITES)) {
    assert.equal(
      (await readFile(`assets/living/${kind}.svg`, "utf8")).trim(),
      xml,
    );
    assert.ok(xml.includes("<svg"));
    assert.ok(!xml.includes("<image"));
    assert.ok(!/https?:\/\/(?!www.w3.org)/.test(xml));
  }
});
test("animation source has no Solitaire, economy or quest imports", async () => {
  for (const file of [
    "LivingWorldAnimationEngine.tsx",
    "model.ts",
    "Sprite.tsx",
    "sprites.ts",
  ]) {
    const source = await readFile(`src/living/${file}`, "utf8");
    assert.ok(!/from ["'].*engine\/(solitaire|world|save)/.test(source));
  }
});

test("all seven approved illustrations have native transparent PNGs at three densities and verified provenance", async () => {
  const { createHash } = await import("node:crypto");
  const manifest = JSON.parse(
    await readFile("assets/ambient/provenance.json", "utf8"),
  );
  assert.equal(manifest.assets.length, 7);
  for (const asset of manifest.assets) {
    const source = await readFile(asset.source);
    assert.equal(
      createHash("sha256").update(source).digest("hex"),
      asset.source_sha256,
    );
    for (const scale of [1, 2, 3]) {
      const path = asset.native_path.replace(
          ".png",
          scale === 1 ? ".png" : `@${scale}x.png`,
        ),
        png = await readFile(path);
      assert.equal(png.subarray(1, 4).toString(), "PNG");
      assert.equal(png.readUInt32BE(16), asset.logical_size[0] * scale);
      assert.equal(png.readUInt32BE(20), asset.logical_size[1] * scale);
      assert.equal(png[25], 6, "RGBA transparency channel required");
    }
  }
});

test("weather intensity changes actual particle density and ambient opacity rather than only its setting label", () => {
  for (const season of ["winter", "autumn"] as const)
    assert.ok(
      createAmbientObjects(season, "high", 0.4).length <
        createAmbientObjects(season, "high", 1).length,
    );
  assert.ok(
    createAmbientObjects("summer", "medium", 0.4)[0].opacity <
      createAmbientObjects("summer", "medium", 1)[0].opacity,
  );
});

test("default autumn intensity retains both sparse rain and leaves", () => {
  const objects = createAmbientObjects("autumn", "medium", 0.4);
  assert.ok(objects.some((o) => o.kind === "rain"));
  assert.ok(objects.some((o) => o.kind === "leaf"));
});
