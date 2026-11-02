import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, reward, migrate } from "../src/engine/save";

test("Hidden Treasures gives a birdhouse on third distinct completion", () => {
  let save = fresh("deal", "da");
  for (let i=1; i<=3; i++) save = reward(save, "hidden", "hidden-"+i);
  assert.equal(save.counters.hidden,3);
  assert.ok(save.economy.inventory.includes("birdhouse"));
  assert.ok(save.placements.some(p=>p.id==="birdhouse"));
  const again=reward(save,"hidden","hidden-3");
  assert.equal(again.counters.hidden,3);
  assert.equal(again.economy.inventory.filter(x=>x==="birdhouse").length,1);
  assert.ok(migrate(JSON.stringify(again),"deal","da").economy.inventory.includes("birdhouse"));
});

test("Tea Time gives a tea table; buying one first avoids duplicate unlock", () => {
  let save=fresh("deal","en");
  save={...save,economy:{...save.economy,inventory:["teaTable"]},placements:[{id:"teaTable",x:39,y:65}]};
  for (let i=1;i<=3;i++) save=reward(save,"tea","tea-"+i);
  assert.equal(save.economy.inventory.filter(x=>x==="teaTable").length,1);
  assert.deepEqual(save.placements,[{id:"teaTable",x:39,y:65}]);
});

test("other game types do not unlock furniture", () => {
  let save=fresh("deal","en");
  for (let i=1;i<=3;i++) save=reward(save,"match","match-"+i);
  assert.ok(!save.economy.inventory.includes("birdhouse"));
  assert.ok(!save.economy.inventory.includes("teaTable"));
});
