import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newGame,
  drawCards,
  move,
  hints,
  undo,
  snapshot,
  revert,
  validDelta,
  type Delta,
} from "../src/engine/solitaire";
import { fresh, migrate } from "../src/engine/save";
function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test("300 random legal actions round-trip exactly, with only the latest 200 retained", () => {
  const rng = random(911);
  let g = newGame("delta", 3, rng);
  const boards = [snapshot(g)];
  for (let i = 0; i < 300; i++) {
    const choices = hints(g);
    const h = choices[Math.floor(rng() * choices.length)];
    g = h && rng() < 0.7 ? move(g, h.from, h.to) : drawCards(g);
    boards.push(snapshot(g));
    assert.equal(
      new Set(
        [
          ...g.stock,
          ...g.waste,
          ...g.tableau.flat(),
          ...g.foundations.flat(),
        ].map((c) => c.id),
      ).size,
      52,
    );
  }
  assert.equal(g.history.length, 200);
  for (let i = 299; i >= 100; i--) {
    g = undo(g);
    assert.deepEqual(snapshot(g), boards[i]);
  }
  assert.deepEqual(snapshot(g), boards[100]);
  for (const draw of [1, 3] as const) {
    let round = newGame("round", draw, rng);
    const start = snapshot(round);
    for (let i = 0; i < 100; i++) round = drawCards(round);
    for (let i = 0; i < 100; i++) round = undo(round);
    assert.deepEqual(snapshot(round), start);
  }
});
test("all tableau flips are recorded and undone, including unrelated hidden tops", () => {
  let g = newGame("flip");
  g.tableau[1].at(-1)!.up = false;
  g.tableau[5].at(-1)!.up = false;
  const before = snapshot(g);
  g = drawCards(g);
  assert.deepEqual(g.history[0].flipped, [1, 5]);
  assert.deepEqual(snapshot(undo(g)), before);
});
test("schema 3 snapshot history migrates to verified working deltas without changing progress", () => {
  const s = fresh("legacy", "da");
  let g = newGame("legacy", 3, random(17));
  const history = [];
  for (let i = 0; i < 18; i++) {
    history.push(snapshot(g));
    const h = hints(g).find((h) => h.to.kind === "foundations");
    g = h ? move(g, h.from, h.to) : drawCards(g);
  }
  const old = { ...s, version: 3, game: { ...g, history } };
  const restored = migrate(JSON.stringify(old), "other", "en");
  assert.equal(restored.version, 4);
  assert.deepEqual(restored.economy, s.economy);
  assert.deepEqual(snapshot(restored.game), snapshot(g));
  for (let i = history.length - 1; i >= 0; i--) {
    restored.game = undo(restored.game);
    assert.deepEqual(snapshot(restored.game), history[i]);
  }
  const large = {
    ...old,
    game: { ...old.game, history: [...Array(10000).fill(null), ...history] },
  };
  assert.equal(
    migrate(JSON.stringify(large), "other", "en").game.history.length,
    18,
  );
  old.game.history[3] = null as never;
  assert.equal(
    migrate(JSON.stringify(old), "other", "en").game.history.length,
    14,
  );
  old.game.history[17] = null as never;
  assert.equal(
    migrate(JSON.stringify(old), "other", "en").game.history.length,
    0,
  );
});
test("200 deltas keep the complete fresh save below 30 KB and snapshots are independent", () => {
  const s = fresh("small", "en");
  for (let i = 0; i < 200; i++) s.game = drawCards(s.game);
  assert.equal(s.game.history.length, 200);
  assert.ok(
    Buffer.byteLength(JSON.stringify(s)) < 30000,
    String(Buffer.byteLength(JSON.stringify(s))),
  );
  const b = snapshot(s.game);
  b.tableau[0][0].up = !b.tableau[0][0].up;
  assert.notDeepEqual(b.tableau, s.game.tableau);
  assert.deepEqual(migrate(JSON.stringify(s), "other", "en").game, s.game);
});
test("invalid or oversized inverses cannot duplicate or discard cards", () => {
  const b = snapshot(drawCards(newGame("bad")));
  for (const d of [
    { op: "draw", n: 52, flipped: [] },
    { op: "recycle", n: 52, flipped: [] },
    {
      op: "move",
      from: { kind: "waste" },
      to: { kind: "tableau", pile: 0 },
      n: 52,
      flipped: [],
    },
    { op: "move", n: -1, flipped: [99] },
  ] as Delta[]) {
    const r = revert(b, d);
    const ids = (x: typeof b) =>
      [...x.stock, ...x.waste, ...x.tableau.flat(), ...x.foundations.flat()]
        .map((c) => c.id)
        .sort();
    assert.deepEqual(ids(r), ids(b));
  }
  assert.equal(validDelta({ op: "draw", n: 1, flipped: [0, 0] }), false);
  const s = fresh("bad", "en");
  s.game.history = [{ op: "draw", n: 53, flipped: [] }];
  assert.throws(() => migrate(JSON.stringify(s), "other", "en"));
});
