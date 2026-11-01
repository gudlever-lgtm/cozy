import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newGame,
  drawCards,
  canMove,
  move,
  undo,
  restart,
  victory,
  autoComplete,
  suits,
  type Card,
  type Game,
} from "../src/engine/solitaire";
import {
  transact,
  quests,
  claimQuest,
  questProgress,
  place,
  seasonAt,
} from "../src/engine/world";
import {
  fresh,
  migrate,
  setProfile,
  setLanguage,
  validateUsername,
  reward,
  saveQueue,
  SAVE_KEY,
  deviceLanguage,
} from "../src/engine/save";
import {
  newMatch,
  matches,
  swapMatch,
  newTea,
  pour,
  teaWon,
  hiddenWon,
  treasures,
} from "../src/engine/minigames";
import { da } from "../src/i18n/da";
import { en } from "../src/i18n/en";
import i18n from "../src/i18n";
const c = (rank: number, suit: Card["suit"] = "♠", up = true): Card => ({
  id: suit + rank,
  rank,
  suit,
  up,
});
const empty = (): Game => ({
  ...newGame("test"),
  stock: [],
  waste: [],
  tableau: [[], [], [], [], [], [], []],
  foundations: [[], [], [], []],
});
test("deal has 52 unique cards, seven columns, 24 stock, exposed tops", () => {
  for (let i = 0; i < 20; i++) {
    const g = newGame("a");
    assert.equal(g.draw, 3);
    assert.equal(drawCards(g).waste.length, 3);
    const all = [...g.stock, ...g.tableau.flat()];
    assert.equal(new Set(all.map((c) => c.id)).size, 52);
    assert.equal(g.stock.length, 24);
    assert.deepEqual(
      g.tableau.map((p) => p.length),
      [1, 2, 3, 4, 5, 6, 7],
    );
    assert.equal(g.tableau.flat().filter((c) => c.up).length, 7);
  }
});
test("draw three, recycle, undo and restart conserve the exact deal", () => {
  assert.equal(drawCards(newGame("one", 1)).waste.length, 1);
  const g = newGame("a", 3);
  const d = drawCards(g);
  assert.equal(d.waste.length, 3);
  assert.deepEqual(undo(d), g);
  let r = g;
  for (let i = 0; i < 8; i++) r = drawCards(r);
  assert.equal(r.stock.length, 0);
  r = drawCards(r);
  assert.deepEqual(r.stock, g.stock);
  assert.deepEqual(restart(r), g);
});
test("legal alternating stacks, kings only, no moving hidden or broken sequences", () => {
  const g = empty();
  g.tableau[0] = [c(7), c(6, "♥")];
  g.tableau[1] = [c(8, "♥")];
  assert.ok(
    canMove(
      g,
      { kind: "tableau", pile: 0, index: 0 },
      { kind: "tableau", pile: 1 },
    ),
  );
  assert.ok(
    !canMove(
      g,
      { kind: "tableau", pile: 0, index: 0 },
      { kind: "tableau", pile: 2 },
    ),
  );
  g.tableau[0][0].up = false;
  assert.ok(
    !canMove(
      g,
      { kind: "tableau", pile: 0, index: 0 },
      { kind: "tableau", pile: 1 },
    ),
  );
  g.tableau[0] = [c(13)];
  assert.ok(
    canMove(g, { kind: "tableau", pile: 0 }, { kind: "tableau", pile: 2 }),
  );
});
test("foundations require aces, correct suit and order; flipping and undo restore", () => {
  const g = empty();
  g.tableau[0] = [c(9, "♠", false), c(1, "♥")];
  const m = move(
    g,
    { kind: "tableau", pile: 0 },
    { kind: "foundations", pile: 0 },
  );
  assert.equal(m.foundations[0][0].rank, 1);
  assert.equal(m.tableau[0][0].up, true);
  assert.deepEqual(undo(m), g);
  m.waste = [c(2, "♠")];
  assert.equal(
    canMove(m, { kind: "waste" }, { kind: "foundations", pile: 0 }),
    false,
  );
});
test("victory and safe auto complete", () => {
  const g = empty();
  g.foundations = suits.map((s) =>
    Array.from({ length: 12 }, (_, i) => c(i + 1, s)),
  );
  g.tableau = suits.map((s) => [c(13, s)]).concat([[], [], []]);
  assert.ok(!victory(g));
  const completed = autoComplete(g);
  assert.ok(victory(completed));
  assert.ok(completed.won);
  g.tableau[0][0].up = false;
  assert.equal(autoComplete(g), g);
});
test("economy rejects overdrafts, fractional amounts, and duplicate rewards", () => {
  const s = fresh("a", "da");
  const e = transact(s.economy, "x", { glimmers: 25 });
  assert.equal(transact(e, "x", { glimmers: 25 }), e);
  assert.throws(() => transact(e, "y", { glimmers: -26 }));
  assert.throws(() => transact(e, "y", { wood: NaN }));
  assert.throws(() => transact(e, "y", { wood: 0.5 }));
  assert.equal(transact(e, "z", { glimmers: -25 }).wallet.glimmers, 0);
  const r = reward(s, "solitaire", "deal");
  assert.equal(reward(r, "solitaire", "deal"), r);
  assert.equal(r.counters.solitaire, 1);
});
test("all quest chains complete through actual objectives and purchases", () => {
  let s = fresh("a", "en");
  for (const type of ["match", "tea", "hidden"] as const)
    s = reward(s, type, type);
  s = reward(reward(s, "tea", "second"), "tea", "third");
  s.counters.gather = 2;
  s.economy = transact(s.economy, "gather", { wood: 2 });
  assert.equal(
    claimQuest(s.economy, [], "pip2", s.counters).completed.length,
    0,
  );
  for (const id of ["millie1", "marmalade1", "pip1"]) {
    const result = claimQuest(s.economy, s.completed, id, s.counters);
    s = { ...s, ...result };
  }
  for (const [item, cost, wood] of [
    ["flowers", 20, 0],
    ["bench", 30, 2],
    ["lantern", 20, 0],
    ["bridge", 40, 4],
    ["forest", 50, 2],
  ] as const)
    s.economy = transact(
      s.economy,
      "buy:" + item,
      { glimmers: -cost, wood: -wood },
      item,
    );
  for (const id of ["millie2", "marmalade2", "pip2"])
    s = { ...s, ...claimQuest(s.economy, s.completed, id, s.counters) };
  assert.equal(s.completed.length, quests.length);
  assert.equal(
    questProgress("marmalade2", s.counters, s.economy.inventory).done,
    2,
  );
  const e = s.economy;
  s = { ...s, ...claimQuest(s.economy, s.completed, "pip2", s.counters) };
  assert.equal(s.economy, e);
});
test("decoration placement validates ownership and bounds and moves without duplication", () => {
  assert.throws(() => place([], [], { id: "flowers", x: 20, y: 30 }));
  const p = place(["flowers"], [], { id: "flowers", x: 20, y: 30 });
  assert.equal(
    place(["flowers"], p, { id: "flowers", x: 40, y: 50 }).length,
    1,
  );
  assert.throws(() =>
    place(["flowers"], p, { id: "flowers", x: Infinity, y: 30 }),
  );
});
test("season calendar uses all four seasons", () => {
  assert.deepEqual(
    [0, 3, 6, 9].map((m) => seasonAt(new Date(2026, m, 15))),
    ["winter", "spring", "summer", "autumn"],
  );
});
test("match boards start without free matches; invalid swaps do not consume turns", () => {
  for (let i = 0; i < 20; i++)
    assert.equal(matches(newMatch().cells).length, 0);
  const g = newMatch();
  assert.equal(swapMatch(g, 0, 35), g);
  const cells = Array.from(
    { length: 36 },
    (_, i) => ((i % 6) + Math.floor(i / 6)) % 5,
  );
  cells[0] = 0;
  cells[1] = 1;
  cells[2] = 0;
  cells[7] = 0;
  const result = swapMatch({ ...g, cells }, 1, 7);
  assert.ok(result.score >= 3);
  assert.equal(result.turns, 17);
});
test("tea sorting has a reachable victory through legal moves", () => {
  const start = newTea(),
    queue = [start],
    seen = new Set([JSON.stringify(start)]);
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
  assert.ok(won);
  assert.equal(teaWon(start), false);
  assert.equal(pour(start, 0, 1), start);
});
test("hidden treasure completion requires all five unique objects", () => {
  assert.equal(hiddenWon(["key", "key", "key", "key", "key"]), false);
  assert.ok(hiddenWon(treasures.map((t) => t.id)));
});
test("Unicode usernames and invalid markup/control/length validation", () => {
  for (const name of [
    " Ægir Øster ",
    "李小龍",
    "Åse-123",
    "Zoë",
    "Мария",
    "عائشة",
    "e\u0301mile",
  ])
    assert.ok(validateUsername(name), name);
  for (const name of [
    "  ",
    "ab",
    "<script>",
    "a\nbc",
    "a".repeat(21),
    "🌸🌸🌸",
    "\u200babc",
  ])
    assert.equal(validateUsername(name), null, name);
  assert.equal(validateUsername("  Åse  "), "Åse");
});
test("onboarding, profile edits and existing-save migration preserve all progress", () => {
  let s = fresh("game", "da");
  assert.equal(s.profile, null);
  s = reward(s, "match", "one");
  const old = JSON.stringify({ ...s, version: 1, profile: undefined });
  const migrated = migrate(old, "new", "en");
  assert.equal(migrated.profile, null);
  assert.deepEqual(migrated.game, s.game);
  s = setProfile(migrated, "Åse", "player", "2026-01-01T00:00:00Z");
  const renamed = setProfile(s, "Maja", "other");
  assert.equal(renamed.profile!.id, "player");
  assert.deepEqual(renamed.economy, s.economy);
  assert.deepEqual(renamed.game, s.game);
  assert.throws(() => migrate("{oops", "a", "en"));
  assert.throws(() => migrate('{"version":99}', "a", "en"));
});
test("translation keys and interpolation parameters are complete, immediate switch and Danish fallback", async () => {
  assert.deepEqual(Object.keys(da).sort(), Object.keys(en).sort());
  for (const k of Object.keys(da) as (keyof typeof da)[]) {
    assert.ok(da[k].length && en[k].length, k);
    assert.deepEqual(
      [...da[k].matchAll(/{{(.*?)}}/g)].map((m) => m[1]).sort(),
      [...en[k].matchAll(/{{(.*?)}}/g)].map((m) => m[1]).sort(),
      k,
    );
  }
  await i18n.changeLanguage("da");
  assert.equal(i18n.t("glimmers"), "Lysglimt");
  assert.match(i18n.t("millieHello", { username: "Åse" }), /Åse/);
  await i18n.changeLanguage("en");
  assert.equal(i18n.t("glimmers"), "Glimmers");
  assert.match(i18n.t("millieHello", { username: "Åse" }), /Hello, Åse/);
  assert.equal(
    i18n.options.fallbackLng instanceof Array && i18n.options.fallbackLng[0],
    "da",
  );
});
test("language and profile persist offline without touching active game; serialized writes retain latest", async () => {
  let stored: string | null = null;
  const storage = {
    getItem: async () => stored,
    setItem: async (_k: string, v: string) => {
      await new Promise((r) => setTimeout(r, 2));
      stored = v;
    },
  };
  const save = saveQueue(storage);
  const s = setProfile(fresh("a", "en"), "Åse", "player");
  const da = setLanguage(s, "da");
  assert.deepEqual(s.game, da.game);
  await Promise.all([save(s), save(da)]);
  const restored = migrate(await storage.getItem(), "b", "en");
  assert.equal(restored.preferences.language, "da");
  assert.equal(restored.profile!.username, "Åse");
  assert.deepEqual(restored.game, s.game);
  assert.equal(SAVE_KEY, "cozy.save");
  assert.equal(deviceLanguage("da-DK"), "da");
  assert.equal(deviceLanguage("fr"), "en");
});

test("structurally corrupt saves reject before any storage write", async () => {
  const original = fresh("a", "en");
  let writes = 0;
  const storage = {
    getItem: async () =>
      JSON.stringify({
        ...original,
        game: { ...original.game, waste: undefined },
      }),
    setItem: async () => {
      writes++;
    },
  };
  assert.throws(() =>
    migrate(
      JSON.stringify({
        ...original,
        game: { ...original.game, waste: undefined },
      }),
      "b",
      "en",
    ),
  );
  const duplicate = structuredClone(original);
  duplicate.game.stock[0] = duplicate.game.stock[1];
  assert.throws(() => migrate(JSON.stringify(duplicate), "b", "en"));
  try {
    migrate(await storage.getItem(), "b", "en");
    await saveQueue(storage)(original);
  } catch {}
  assert.equal(writes, 0);
});

test("merged artwork manifest references eleven real local assets", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const manifest = JSON.parse(
    await fs.readFile(path.resolve("public/assets/manifest.json"), "utf8"),
  );
  assert.equal(manifest.assets.length, 11);
  for (const asset of manifest.assets) {
    const file = path.resolve("public", asset.path.slice(1));
    assert.ok((await fs.stat(file)).size > 1000, asset.id);
  }
  const { resolveSeason, resolveWeather, DEFAULT_AMBIENCE } =
    await import("../src/seasonal/season");
  assert.equal(resolveSeason("winter", new Date(2026, 6, 1)), "winter");
  assert.equal(
    resolveWeather({ ...DEFAULT_AMBIENCE, season: "winter" }),
    "snow",
  );
  assert.equal(
    resolveWeather({
      ...DEFAULT_AMBIENCE,
      reduceMotion: true,
      season: "winter",
    }),
    "clear",
  );
});
