import { test } from "node:test";
import assert from "node:assert/strict";
import {
  teaForLevel,
  validSession,
  matchForLevel,
} from "../src/engine/session";
import { minimumTeaMoves, TEA_DIFFICULTY } from "../src/engine/teaDifficulty";
import { teaWon } from "../src/engine/minigames";
import { seededRandom } from "../src/engine/random";
import { fresh, migrate } from "../src/engine/save";
test("random Tea layouts preserve three colors/five trays and exact measured difficulty", () => {
  const random = seededRandom(90210);
  for (const level of [1, 2, 3] as const) {
    const layouts = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const tea = teaForLevel(level, random);
      layouts.add(JSON.stringify(tea));
      assert.equal(teaWon(tea), false);
      const [min, max] = TEA_DIFFICULTY[level],
        moves = minimumTeaMoves(tea);
      assert.ok(moves >= min && moves <= max, `${level}: ${moves}`);
      assert.ok(
        validSession({
          id: "valid",
          kind: "tea",
          level,
          tea,
          match: matchForLevel(level),
          found: [],
        }),
      );
    }
    assert.ok(layouts.size > 10, `level ${level} should vary`);
    assert.equal(
      minimumTeaMoves(teaForLevel(level, () => 0)),
      TEA_DIFFICULTY[level][0],
    );
  }
});
test("a random saved Tea round resumes its exact layout without regeneration", () => {
  const s = fresh("resume", "da");
  s.miniSession = {
    id: "round",
    kind: "tea",
    level: 3,
    tea: teaForLevel(3, seededRandom(7)),
    match: matchForLevel(3),
    found: [],
  };
  const restored = migrate(JSON.stringify(s), "other", "en");
  assert.deepEqual(restored.miniSession, s.miniSession);
});
