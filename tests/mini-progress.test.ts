import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, migrate, reward } from "../src/engine/save";
import { finishMini } from "../src/engine/miniProgress";

test("main victories fund both slots once and save all progress", () => {
  const initial = fresh("main", "da");
  const won = reward(initial, "solitaire", "main");
  assert.deepEqual(
    won.miniProgress.slots.map((s) => s.moves),
    [10, 10],
  );
  assert.equal(won.miniProgress.fireflies, 10);
  assert.deepEqual(reward(won, "solitaire", "main"), won);
  assert.deepEqual(
    migrate(JSON.stringify(won), "restore", "da").miniProgress,
    won.miniProgress,
  );
});

test("finishing one slot preserves the pair; finishing both replaces exactly two", () => {
  const initial = fresh("main", "da");
  const [first, second] = initial.miniProgress.slots;
  const once = reward(initial, first.session.kind, first.session.id, 1);
  assert.equal(once.miniProgress.slots[0].done, true);
  assert.equal(once.miniProgress.round, 0);
  assert.equal(once.miniProgress.slots[1].session.id, second.session.id);
  assert.equal(once.miniProgress.undo, initial.miniProgress.undo + 1);
  assert.equal(once.miniProgress.deals, initial.miniProgress.deals + 1);
  const next = reward(once, second.session.kind, second.session.id, 1);
  assert.equal(next.miniProgress.round, 1);
  assert.equal(next.miniProgress.slots.length, 2);
  assert.ok(
    next.miniProgress.slots.every(
      (s) =>
        !s.done &&
        s.moves === 0 &&
        ![first.session.id, second.session.id].includes(s.session.id),
    ),
  );
  assert.deepEqual(
    reward(next, second.session.kind, second.session.id, 1),
    next,
  );
});

test("abandoning games rotates without granting a win reward", () => {
  let p = fresh("main", "da").miniProgress;
  p = finishMini(p, p.slots[0].session.id);
  const again = finishMini(p, p.slots[0].session.id);
  assert.equal(again, p);
  p = finishMini(p, p.slots[1].session.id);
  assert.equal(p.round, 1);
  assert.equal(p.undo, 3);
});

test("legacy saves receive a pair while retaining existing resources", () => {
  const legacy: any = fresh("legacy", "da");
  delete legacy.miniProgress;
  legacy.economy.wallet.glimmers = 123;
  const restored = migrate(JSON.stringify(legacy), "restore", "da");
  assert.equal(restored.miniProgress.slots.length, 2);
  assert.equal(restored.economy.wallet.glimmers, 123);
});

test("specific main-game victory prizes permanently unlock additional solitaire types", () => {
  let s = fresh("keys", "en");
  for (let i = 0; i < 3; i++) s = reward(s, "solitaire", `win:${i}`);
  assert.deepEqual(s.miniProgress.keys, ["open"]);
  for (let i = 3; i < 6; i++) s = reward(s, "solitaire", `win:${i}`);
  assert.deepEqual(s.miniProgress.keys, ["open", "whitehead"]);
  assert.deepEqual(
    migrate(JSON.stringify(s), "restore", "en").miniProgress.keys,
    s.miniProgress.keys,
  );
});
