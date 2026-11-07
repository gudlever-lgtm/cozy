import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, reward, migrate } from "../src/engine/save";
import { quests, claimQuest, transact, upgrades } from "../src/engine/world";
import { questView } from "../src/presentation/quests";
import { en } from "../src/i18n/en";
import { da } from "../src/i18n/da";

test("all 18 quests have reachable goals, localized stories and single-use rewards", () => {
  let save = fresh("expanded", "en");
  assert.equal(quests.length, 18);
  for (const npc of ["millie", "marmalade", "pip"])
    assert.equal(quests.filter((q) => q.npc === npc).length, 6);
  for (const kind of ["solitaire", "match", "hidden", "tea"] as const)
    for (let n = 0; n < 20; n++) save = reward(save, kind, `${kind}:${n}`);
  for (const item of upgrades)
    if (item.id !== "cards")
      save.economy = transact(
        save.economy,
        `buy:${item.id}`,
        { glimmers: -item.cost, wood: -item.wood },
        item.id,
      );
  // A high counter cannot bypass a previous chapter.
  assert.deepEqual(
    claimQuest(save.economy, [], "millie6", save.counters).completed,
    [],
  );
  for (const quest of quests) {
    for (const lang of [en, da])
      for (const suffix of ["", "Info", "Text"])
        assert.ok((lang as Record<string, string>)[quest.id + suffix]);
    assert.equal(questView(save, quest).status, "ready", quest.id);
    save = {
      ...save,
      ...claimQuest(save.economy, save.completed, quest.id, save.counters),
    };
    assert.equal(questView(save, quest).status, "completed");
    assert.equal(
      claimQuest(save.economy, save.completed, quest.id, save.counters).economy,
      save.economy,
    );
  }
  assert.equal(save.completed.length, 18);
});
test("existing quest completions and progress survive restoration and unlock new chapters", () => {
  const save = fresh("old-quests", "da");
  save.completed = [
    "millie1",
    "millie2",
    "marmalade1",
    "marmalade2",
    "pip1",
    "pip2",
  ];
  const next = migrate(JSON.stringify(save), "restored", "da");
  assert.ok(next);
  assert.deepEqual(next.completed, save.completed);
  assert.deepEqual(next.counters, save.counters);
  assert.equal(
    questView(
      next,
      quests.find((q) => q.id === "millie3")!,
    ).status,
    "active",
  );
  assert.equal(
    questView(
      next,
      quests.find((q) => q.id === "millie4")!,
    ).status,
    "locked",
  );
});
