import { test } from "node:test";
import assert from "node:assert/strict";
import {
  treasuresForLevel,
  matchForLevel,
  teaForLevel,
} from "../src/engine/session";
import { treasures } from "../src/engine/minigames";
import { fresh, migrate } from "../src/engine/save";
test("unseeded treasure locations preserve the historical level layouts", () => {
  assert.deepEqual(treasuresForLevel(1), treasures);
  assert.deepEqual(
    treasuresForLevel(2).map((t) => [t.x, t.y]),
    [
      [13, 24],
      [65, 31],
      [32, 66],
      [78, 72],
      [48, 42],
    ],
  );
  assert.deepEqual(
    treasuresForLevel(3).map((t) => [t.x, t.y]),
    [
      [70, 23],
      [16, 58],
      [44, 36],
      [76, 70],
      [36, 78],
    ],
  );
});
test("round-seeded treasure layouts are repeatable, varied and use five distinct authored points", () => {
  const pool = new Set(
    ([1, 2, 3] as const).flatMap((level) =>
      treasuresForLevel(level).map((t) => `${t.x},${t.y}`),
    ),
  );
  const layouts = new Set<string>();
  for (let i = 0; i < 100; i++) {
    const seed = `round-${i}`,
      a = treasuresForLevel(1, seed);
    assert.deepEqual(a, treasuresForLevel(1, seed));
    assert.equal(new Set(a.map((t) => `${t.x},${t.y}`)).size, 5);
    assert.ok(a.every((t) => pool.has(`${t.x},${t.y}`)));
    assert.deepEqual(
      a.map((t) => t.id),
      treasures.map((t) => t.id),
    );
    layouts.add(JSON.stringify(a));
  }
  assert.equal(layouts.size, 100);
  const s = fresh("resume", "da");
  s.miniSession = {
    id: "stable-round",
    kind: "hidden",
    level: 2,
    match: matchForLevel(2),
    tea: teaForLevel(2),
    found: ["key", "ribbon"],
  };
  const restored = migrate(JSON.stringify(s), "new", "en");
  assert.deepEqual(restored.miniSession, s.miniSession);
  assert.deepEqual(
    treasuresForLevel(2, restored.miniSession!.id),
    treasuresForLevel(2, s.miniSession.id),
  );
});
