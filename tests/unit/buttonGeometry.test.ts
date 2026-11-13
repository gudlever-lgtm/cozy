import assert from "node:assert/strict";
import test from "node:test";
import { buttonLabelBounds } from "../../src/ui/theme/buttonGeometry";

const safe = { left: 0.21, right: 0.92 };

test("label follows full-size painted button without gutters", () => {
  assert.deepEqual(buttonLabelBounds(180, 58, safe), { left: 37.8, right: 165.6 });
});

test("wide button label remains inside the centered SVG, not the blank gutters", () => {
  const bounds = buttonLabelBounds(300, 58, safe);
  // A 440:110 viewBox can paint only 232dp wide at 58dp high.
  assert.ok(bounds.left >= 34);
  assert.ok(bounds.right <= 266);
  assert.ok(bounds.right > bounds.left);
});

test("all approved widths keep text within visible button bounds", () => {
  for (const height of [54, 58, 64, 66]) {
    for (const width of [150, 180, 220, 260, 300]) {
      const { left, right } = buttonLabelBounds(width, height, safe);
      const paintedWidth = Math.min(width, 4 * height);
      const gutter = (width - paintedWidth) / 2;
      assert.ok(left >= gutter && right <= gutter + paintedWidth);
    }
  }
});
