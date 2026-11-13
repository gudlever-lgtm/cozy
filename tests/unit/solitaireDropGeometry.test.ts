import assert from "node:assert/strict";
import test from "node:test";
import { tableauColumnAt } from "../../src/ui/theme/solitaireDropGeometry";

test("drop resolves exact columns and tolerated gaps", () => {
  assert.equal(tableauColumnAt(11, 10, 40, 6), 0);
  assert.equal(tableauColumnAt(57, 10, 40, 6), 1);
  assert.equal(tableauColumnAt(10 + 6 * 46 + 20, 10, 40, 6), 6);
});

test("outside releases never snap to a column", () => {
  assert.equal(tableauColumnAt(-40, 10, 40, 6), null);
  assert.equal(tableauColumnAt(500, 10, 40, 6), null);
});
