import { test } from "node:test";
import assert from "node:assert/strict";
import {
  gardenCameraFit,
  gardenPanBy,
  gardenPanLimits,
} from "../src/presentation/gardenCamera";

test("100% shows all four original image edges in portrait and landscape", () => {
  for (const image of [
    { width: 836, height: 470 },
    { width: 836, height: 471 },
    { width: 1672, height: 941 },
  ]) {
    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 844, height: 390 },
    ]) {
      const scale = gardenCameraFit(viewport, image);
      assert.ok(image.width * scale <= viewport.width + 1e-8);
      assert.ok(image.height * scale <= viewport.height + 1e-8);
      assert.ok(
        Math.abs(image.width * scale - viewport.width) < 1e-8 ||
          Math.abs(image.height * scale - viewport.height) < 1e-8,
      );
      assert.deepEqual(gardenPanLimits(viewport, image, 0.5), { x: 0, y: 0 });
    }
  }
});
test("pan follows the fitted image, so portrait zoom cannot pan into empty vertical margins", () => {
  const limits = gardenPanLimits(
    { width: 390, height: 844 },
    { width: 836, height: 470 },
    2,
  );
  assert.equal(limits.x, 195);
  assert.equal(limits.y, 0);
});

test("the actual portrait spring artwork fills a portrait viewport without distortion", () => {
  const portraitArt = { width: 941, height: 1672 };
  const viewport = { width: 390, height: 844 };
  const fit = gardenCameraFit(viewport, portraitArt);
  assert.ok(fit > 0);
  assert.ok(portraitArt.width * fit <= viewport.width + 1e-8);
  assert.ok(portraitArt.height * fit <= viewport.height + 1e-8);
  assert.deepEqual(gardenPanLimits(viewport, portraitArt, 1), { x: 0, y: 0 });
  const zoomed = gardenPanLimits(viewport, portraitArt, 2);
  assert.ok(zoomed.x > 0);
  assert.ok(zoomed.y > 0);
});

test("dragging a zoomed garden moves the viewport while staying within the image", () => {
  const viewport = { width: 390, height: 844 };
  const image = { width: 941, height: 1672 };
  const limits = gardenPanLimits(viewport, image, 2);
  assert.ok(limits.x > 0 && limits.y > 0);
  const moved = gardenPanBy(viewport, image, 2, 0, 0, 65, -48);
  assert.deepEqual(moved, { x: 65, y: -48 });
  const clamped = gardenPanBy(viewport, image, 2, 0, 0, 50000, -50000);
  assert.deepEqual(clamped, { x: limits.x, y: -limits.y });
  assert.deepEqual(gardenPanBy(viewport, image, 1, 0, 0, 50, 50), { x: 0, y: 0 });
});
