import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  reward,
  migrate,
  setProfile,
  saveQueue,
  loadSave,
  SAVE_KEY,
  BACKUP_KEY,
} from "../src/engine/save";
import { transact, claimQuest, upgrades } from "../src/engine/world";
import {
  areas,
  enterArea,
  areaOwned,
  areaReady,
  buildings,
  improve,
  stories,
  claimStory,
  claimFestival,
  festivals,
  friendship,
  chooseTheme,
  claimWorldAchievement,
} from "../src/engine/progression";
import {
  teaForLevel,
  matchForLevel,
  treasuresForLevel,
  validSession,
} from "../src/engine/session";
import { pour, teaWon } from "../src/engine/minigames";
import { challengeGame, challenges } from "../src/engine/challenges";
import { snapshot } from "../src/engine/solitaire";
test("all expanded areas, eight stories, buildings and relationships are reachable through gameplay resources", () => {
  let s = fresh("world", "en");
  const originalGame = structuredClone(s.game);
  for (let i = 0; i < 20; i++)
    for (const type of ["solitaire", "match", "hidden", "tea"] as const)
      s = reward(s, type, `${type}-${i}`);
  for (let i = 0; i < 80; i++)
    s = {
      ...s,
      economy: transact(s.economy, `gather:${i}`, { wood: 1, stone: 1 }),
      counters: { ...s.counters, gather: s.counters.gather + 1 },
    };
  for (const id of ["millie1", "marmalade1", "pip1"])
    s = { ...s, ...claimQuest(s.economy, s.completed, id, s.counters) };
  for (const u of upgrades)
    s = {
      ...s,
      economy: transact(
        s.economy,
        "buy:" + u.id,
        { glimmers: -u.cost, wood: -u.wood },
        u.id,
      ),
    };
  for (const id of ["millie2", "marmalade2", "pip2"])
    s = { ...s, ...claimQuest(s.economy, s.completed, id, s.counters) };
  for (const area of areas.filter((a) => a.id !== "cottage")) {
    assert.ok(areaOwned(s, area.id) || areaReady(s, area.id), area.id);
    s = enterArea(s, area.id);
    for (const b of buildings.filter((b) => b.area === area.id))
      s = improve(s, b.id);
    for (const story of stories.filter((q) => q.area === area.id)) {
      s = claimStory(s, story.id);
      assert.equal(claimStory(s, story.id), s);
    }
  }
  assert.equal(s.world.areas.length, 5);
  assert.equal(s.world.stories.length, 8);
  assert.deepEqual(s.game, originalGame);
  assert.ok(
    ["millie", "pip", "marmalade"].every(
      (n) => friendship(s, n as "millie") >= 3,
    ),
  );
  s = improve(improve(s, "greenhouse"), "greenhouse");
  assert.equal(s.world.buildings.greenhouse, 3);
  assert.equal(improve(s, "greenhouse"), s);
  for (const id of [
    "builder",
    "neighbors",
    "explorer",
    "storyteller",
  ] as const) {
    s = claimWorldAchievement(s, id);
    const balance = s.economy.wallet.glimmers;
    s = claimWorldAchievement(s, id);
    assert.equal(s.economy.wallet.glimmers, balance);
  }
  assert.ok(Object.values(s.economy.wallet).every((n) => n >= 0));
  const restored = migrate(JSON.stringify(s), "other", "da");
  assert.deepEqual(restored.world, s.world);
});
test("locked areas and insufficient building/theme funds never mutate state", () => {
  const s = fresh("a", "en");
  assert.throws(() => enterArea(s, "river"), /worldLocked/);
  assert.throws(() => improve(s, "teahouse"), /worldLocked/);
  assert.throws(() => chooseTheme(s, "river"), /insufficient/);
  assert.equal(s.economy.wallet.glimmers, 0);
  assert.deepEqual(s.world.areas, ["cottage"]);
});
test("all seasonal celebrations are obtainable outside their calendar season and duplicate protected", () => {
  let s = fresh("a", "en");
  for (let i = 0; i < 3; i++)
    for (const type of ["solitaire", "match", "hidden", "tea"] as const)
      s = reward(s, type, `${type}${i}`);
  for (const f of festivals) {
    s = claimFestival(s, f.id);
    assert.ok(s.economy.inventory.includes(f.item));
    assert.equal(claimFestival(s, f.id), s);
  }
  assert.equal(s.world.events.length, 4);
});
test("version two saves migrate without changing profiles, games, wallets, legacy forest unlocks or card themes", () => {
  let s = setProfile(fresh("original", "da"), "Åse", "original-id");
  s.economy = transact(s.economy, "earned", { glimmers: 70 }, "forest");
  s.economy.inventory.push("cards");
  const { world, miniSession, ...legacy } = s;
  const restored = migrate(
    JSON.stringify({ ...legacy, version: 2 }),
    "new",
    "en",
  );
  assert.equal(restored.version, 3);
  assert.deepEqual(restored.profile, s.profile);
  assert.deepEqual(restored.game, s.game);
  assert.deepEqual(restored.economy, s.economy);
  assert.ok(restored.world.areas.includes("forest"));
  assert.equal(restored.world.theme, "botanical");
  assert.equal(restored.miniSession, null);
});
test("each tea level has a legal route to victory and levels have distinct layouts/targets", () => {
  assert.notDeepEqual(teaForLevel(1), teaForLevel(3));
  for (const level of [1, 2, 3] as const) {
    const queue = [teaForLevel(level)],
      seen = new Set<string>();
    let won = false;
    while (queue.length) {
      const g = queue.shift()!;
      if (teaWon(g)) {
        won = true;
        break;
      }
      for (let a = 0; a < 5; a++)
        for (let b = 0; b < 5; b++) {
          const next = pour(g, a, b),
            key = JSON.stringify(next);
          if (!seen.has(key)) {
            seen.add(key);
            queue.push(next);
          }
        }
    }
    assert.ok(won, `tea level ${level}`);
    assert.equal(matchForLevel(level).target, 30 + (level - 1) * 15);
    assert.equal(
      new Set(treasuresForLevel(level).map((x) => `${x.x},${x.y}`)).size,
      5,
    );
  }
});
test("partial mini-game sessions survive schema restoration and reward only once", () => {
  let s = fresh("a", "en");
  s.miniSession = {
    id: "puzzle",
    kind: "hidden",
    level: 3,
    match: matchForLevel(3),
    tea: teaForLevel(3),
    found: ["key", "acorn"],
  };
  assert.ok(validSession(s.miniSession));
  const r = migrate(JSON.stringify(s), "b", "da");
  assert.deepEqual(r.miniSession, s.miniSession);
  s = reward(s, "hidden", "puzzle");
  assert.ok(s.world.medals.includes("hidden:3"));
  assert.equal(reward(s, "hidden", "puzzle"), s);
});
test("last-known-good backup recovers a corrupt primary without overwriting progress", async () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: async (k: string) => data.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      data.set(k, v);
    },
  };
  const save = saveQueue(storage);
  let s = setProfile(fresh("a", "da"), "Ægir", "id");
  await save(s);
  s = reward(s, "tea", "one");
  await save(s);
  const backed = JSON.parse(data.get(BACKUP_KEY)!);
  assert.equal(backed.profile.username, "Ægir");
  data.set(SAVE_KEY, "corrupted");
  const recovered = await loadSave(storage, "different", "en");
  assert.ok(recovered.recovered);
  assert.equal(recovered.save.profile!.id, "id");
  assert.equal(recovered.save.game.id, "a");
  assert.equal(recovered.save.economy.wallet.glimmers, 0);
  const restore = saveQueue(storage);
  await restore(recovered.save);
  assert.equal(JSON.parse(data.get(BACKUP_KEY)!).profile.id, "id");
});
test("seeded Solitaire challenges conserve all cards and replay deterministic deals with unique reward attempts", () => {
  for (const c of challenges) {
    const a = challengeGame("attempt-1", c.id),
      b = challengeGame("attempt-2", c.id);
    assert.deepEqual(snapshot(a), snapshot(b));
    assert.equal(
      new Set([...a.stock, ...a.tableau.flat()].map((x) => x.id)).size,
      52,
    );
    assert.equal(a.draw, c.draw);
  }
});
