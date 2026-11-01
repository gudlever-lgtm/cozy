import test from "node:test";
import assert from "node:assert/strict";
import { boardMetrics, dropDestination } from "../src/presentation/board";
import { swipeNeighbour } from "../src/presentation/matchGesture";
import { newGame } from "../src/engine/solitaire";
test("landscape board fits phone/tablet widths and leaves stable readable overlaps", () => {
  for (const [w, h] of [
    [568, 320],
    [740, 360],
    [844, 390],
    [1024, 768],
    [1366, 1024],
  ]) {
    const m = boardMetrics(w, h);
    assert.ok(m.cardWidth * 7 + 48 <= w - m.rail - 16);
    assert.ok(m.step >= 18);
    assert.ok(m.cardWidth >= 30);
  }
});
test("swipes choose one orthogonal neighbour with threshold and no row wrapping", () => {
  assert.equal(swipeNeighbour(7, 2, 3, 50), null);
  assert.equal(swipeNeighbour(7, 30, 4, 50), 8);
  assert.equal(swipeNeighbour(7, -30, 4, 50), 6);
  assert.equal(swipeNeighbour(7, 2, -30, 50), 1);
  assert.equal(swipeNeighbour(7, 2, 30, 50), 13);
  assert.equal(swipeNeighbour(5, 40, 0, 50), null);
  assert.equal(swipeNeighbour(0, 0, -40, 50), null);
  assert.equal(swipeNeighbour(35, 0, 40, 50), null);
});
test("drop chooses one legal foundation with forgiving margin and rejects illegal cards", () => {
  const g = newGame("drop");
  g.waste = [{ id: "ace", rank: 1, suit: "♥", up: true }];
  g.foundations = [[], [], [], []];
  const regions = g.foundations.map((_, pile) => ({
    place: { kind: "foundations" as const, pile },
    x: 100 + pile * 65,
    y: 20,
    width: 55,
    height: 80,
  }));
  assert.deepEqual(dropDestination(g, { kind: "waste" }, 95, 40, regions), {
    kind: "foundations",
    pile: 0,
  });
  assert.deepEqual(dropDestination(g, { kind: "waste" }, 163, 40, regions), {
    kind: "foundations",
    pile: 1,
  });
  g.waste[0].rank = 2;
  assert.equal(
    dropDestination(g, { kind: "waste" }, 120, 40, regions),
    undefined,
  );
  assert.equal(
    dropDestination(g, { kind: "waste" }, 120, 300, regions),
    undefined,
  );
});
