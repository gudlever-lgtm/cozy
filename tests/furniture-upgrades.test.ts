import { test } from "node:test";
import assert from "node:assert/strict";
import {
  furnitureLevel,
  upgradeFurniture,
  transact,
  place,
} from "../src/engine/world";

test("owned furniture upgrades through persisted transaction receipts", () => {
  const initial = {
    wallet: { glimmers: 500, wood: 20, stone: 0, flowers: 0, seeds: 0 },
    receipts: [] as string[],
    inventory: [] as string[],
  };
  const bought = transact(
    initial,
    "buy:bench",
    { glimmers: -30, wood: -2 },
    "bench",
  );
  assert.equal(furnitureLevel(bought, "bench"), 1);
  const upgraded = upgradeFurniture(bought, "bench");
  assert.equal(furnitureLevel(upgraded, "bench"), 2);
  assert.equal(upgraded.wallet.glimmers, 410);
  assert.equal(upgraded.wallet.wood, 16);
  assert.equal(furnitureLevel(upgradeFurniture(upgraded, "bench"), "bench"), 3);
  assert.throws(() =>
    upgradeFurniture(upgradeFurniture(upgraded, "bench"), "bench"),
  );
});

test("placement validates ownership and normalized garden coordinates", () => {
  const placed = place(["bench"], [], { id: "bench", x: 30, y: 70 });
  assert.deepEqual(placed, [{ id: "bench", x: 30, y: 70 }]);
  assert.deepEqual(place(["bench"], placed, { id: "bench", x: 60, y: 40 }), [
    { id: "bench", x: 60, y: 40 },
  ]);
  assert.throws(() => place([], [], { id: "bench", x: 50, y: 50 }));
  assert.throws(() => place(["bench"], [], { id: "bench", x: 101, y: 50 }));
});
