import assert from "node:assert/strict";
import test from "node:test";
import { buyGardenDecoration } from "../src/engine/gardenPurchase";
import { fresh, migrate } from "../src/engine/save";
import { upgrades } from "../src/engine/world";

test("one garden purchase costs resources and places an item once", () => {
  const old = fresh("purchase-once", "da");
  old.economy.wallet.glimmers = 100;
  old.economy.wallet.wood = 10;
  const result = buyGardenDecoration(old, "birdhouse");
  assert.equal(result.economy.wallet.glimmers, 55);
  assert.equal(result.economy.wallet.wood, 7);
  assert.deepEqual(result.economy.inventory, ["birdhouse"]);
  assert.equal(result.economy.receipts.filter(id => id === "buy:birdhouse").length, 1);
  assert.deepEqual(result.placements, [{id:"birdhouse", x:61, y:69}]);
  assert.equal(buyGardenDecoration(result, "birdhouse"), result);
  const restored = migrate(JSON.stringify(result), "restored", "da");
  assert.deepEqual(restored.placements, result.placements);
  assert.equal(restored.economy.wallet.glimmers, 55);
});

test("the update rechecks current wallet balance before spending", () => {
  const save = fresh("purchase-unaffordable", "en");
  save.economy.wallet.glimmers = 100;
  save.economy.wallet.wood = 4;
  const first = buyGardenDecoration(save, "bridge");
  const second = buyGardenDecoration(first, "teaTable");
  assert.equal(second, first);
  assert.equal(first.economy.wallet.glimmers, 60);
  assert.equal(first.economy.wallet.wood, 0);
  assert.deepEqual(first.economy.inventory, ["bridge"]);
});

test("a historical purchase receipt cannot be charged again if inventory is inconsistent", () => {
  const save = fresh("receipt", "en");
  save.economy.wallet.glimmers = 200;
  save.economy.wallet.wood = 20;
  save.economy.receipts.push("buy:bench");
  assert.equal(buyGardenDecoration(save, "bench"), save);
});

test("purchase attempts with no balance or non-decoration product preserve save", () => {
  const save = fresh("zero", "da");
  for (const item of upgrades) {
    assert.equal(buyGardenDecoration(save, item.id), save);
  }
  save.economy.wallet.glimmers = 1000;
  save.economy.wallet.wood = 1000;
  assert.equal(buyGardenDecoration(save, "cards"), save);
});
