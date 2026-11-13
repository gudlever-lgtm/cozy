import assert from "node:assert/strict";
import test from "node:test";
import { nineSliceScale } from "../../src/ui/theme/nineSliceGeometry";

test("short panel keeps top and bottom artwork from overlapping", () => {
  const scale = nineSliceScale(328, 720, 90, 140, 140);
  assert.equal(scale, 90 / 280);
  assert.ok((140 + 140) * scale <= 90);
});

test("tall panel preserves normal undistorted corners", () => {
  assert.equal(nineSliceScale(328, 720, 500, 140, 140), 328 / 720);
});

test("horizontal-only bar keeps its width-derived scale", () => {
  assert.equal(nineSliceScale(328, 600, 50, 0, 0), 328 / 600);
});
