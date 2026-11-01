import test from "node:test";
import assert from "node:assert/strict";
import {
  boardMetrics,
  dropDestination,
  fitSolitaireBoard,
} from "../src/presentation/board";
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

const faceUp = (count: number) =>
  Array.from({ length: count }, () => ({ up: true }));
test("full initial and long legal columns fit measured phone board viewports without scrolling", () => {
  for (const [width, height] of [
    [414, 190],
    [440, 222],
    [600, 262],
    [680, 292],
    [880, 630],
  ]) {
    for (const piles of [
      Array.from({ length: 7 }, (_, i) => [
        ...Array.from({ length: i }, () => ({ up: false })),
        { up: true },
      ]),
      [
        ...Array.from({ length: 6 }, () => []),
        [...Array.from({ length: 6 }, () => ({ up: false })), ...faceUp(13)],
      ],
      Array.from({ length: 7 }, () => faceUp(13)),
    ]) {
      const layout = fitSolitaireBoard(width, height, piles);
      assert.ok(
        layout.usedHeight <= height + 1e-8,
        `board height ${layout.usedHeight} exceeds ${height}`,
      );
      assert.ok(layout.cardWidth * 7 + 24 + layout.padding * 2 <= width);
      layout.columns.forEach((column, i) => {
        assert.ok(column.height <= layout.tableauHeight + 1e-8);
        assert.equal(column.offsets.length, piles[i].length);
        column.visibleIndices.forEach((index, j) => {
          const y = column.offsets[index];
          assert.ok(y >= 0);
          assert.ok(y + layout.cardHeight <= layout.tableauHeight + 1e-8);
          if (j) assert.ok(y > column.offsets[column.visibleIndices[j - 1]]);
        });
      });
    }
  }
});
test("extending one column leaves all unrelated cards and columns stationary", () => {
  const piles = Array.from({ length: 7 }, () => faceUp(4));
  const a = fitSolitaireBoard(440, 222, piles);
  const b = fitSolitaireBoard(440, 222, [faceUp(13), ...piles.slice(1)]);
  assert.equal(a.cardWidth, b.cardWidth);
  assert.equal(a.cardHeight, b.cardHeight);
  assert.deepEqual(a.columns.slice(1), b.columns.slice(1));
  assert.ok(fitSolitaireBoard(440, 300, piles).cardWidth > a.cardWidth);
});

test("collapsed runs show the first exposed card and outermost card while keeping intermediate indices", () => {
  const pile = [{ up: false }, { up: false }, ...faceUp(8)];
  const column = fitSolitaireBoard(440, 222, [pile]).columns[0];
  assert.deepEqual(column.visibleIndices, [0, 1, 2, 9]);
  assert.deepEqual(column.hiddenIndices, [3, 4, 5, 6, 7, 8]);
  const pair = fitSolitaireBoard(440, 222, [faceUp(2)]).columns[0];
  assert.deepEqual(pair.visibleIndices, [0, 1]);
  assert.deepEqual(pair.hiddenIndices, []);
});

test("a legal foundation drop accepts card overlap when the final finger is outside the slot", () => {
  const g = newGame("overlap");
  g.waste = [{ id: "ace", rank: 1, suit: "♥", up: true }];
  g.foundations = [[], [], [], []];
  const regions = [
    {
      place: { kind: "foundations" as const, pile: 0 },
      x: 100,
      y: 10,
      width: 50,
      height: 70,
    },
    {
      place: { kind: "foundations" as const, pile: 1 },
      x: 170,
      y: 10,
      width: 50,
      height: 70,
    },
  ];
  assert.deepEqual(
    dropDestination(g, { kind: "waste" }, 60, 100, regions, {
      x: 95,
      y: 15,
      width: 50,
      height: 70,
    }),
    { kind: "foundations", pile: 0 },
  );
  assert.deepEqual(
    dropDestination(g, { kind: "waste" }, 155, 20, regions, {
      x: 168,
      y: 15,
      width: 50,
      height: 70,
    }),
    { kind: "foundations", pile: 1 },
  );
  g.waste[0].rank = 2;
  assert.equal(
    dropDestination(g, { kind: "waste" }, 60, 100, regions, {
      x: 95,
      y: 15,
      width: 50,
      height: 70,
    }),
    undefined,
  );
});

test("fresh Garden Match boards always start with a legal swipe and no free match", async () => {
  const { newMatch, hasMatchMove, matches } =
    await import("../src/engine/minigames");
  for (let seed = 0; seed < 100; seed++) {
    let state = seed + 1;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
    const board = newMatch(random);
    assert.deepEqual(matches(board.cells), []);
    assert.equal(hasMatchMove(board.cells), true);
  }
});
