import { test } from "node:test";
import assert from "node:assert/strict";
import { upgrades, transact, place, furnitureLevel, upgradeFurniture } from "../src/engine/world";
import { DECORATION_ANCHORS } from "../src/presentation/decorations";

test("new garden furniture is purchasable and has a valid visual anchor", () => {
  for (const id of ["birdhouse", "teaTable"] as const) {
    const item = upgrades.find(u => u.id === id);
    assert.ok(item);
    assert.ok(DECORATION_ANCHORS[id]);
    const wallet = { glimmers: 1000, wood: 100, stone: 0, flowers: 0, seeds: 0 };
    const e = transact({wallet, receipts:[], inventory:[]}, "buy:" + id, {glimmers:-item.cost, wood:-item.wood}, id);
    assert.equal(furnitureLevel(e,id),1);
    assert.deepEqual(place(e.inventory,[],{id,x:item.x,y:item.y}),[{id,x:item.x,y:item.y}]);
    assert.equal(furnitureLevel(upgradeFurniture(e,id),id),2);
  }
});
