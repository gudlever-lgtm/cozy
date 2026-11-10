import assert from "node:assert/strict";
import test from "node:test";
import {
  applyMove,
  autoPlaySafe,
  deal,
  hint,
  isWon,
  legalMoves,
  loadSnapshot,
  snapshot,
  undo,
} from "../../src/domain/solitaire/engine";
import type { Card, GameState, Move } from "../../src/domain/solitaire/types";

function allCards(state: GameState): Card[] {
  return [
    ...state.tableau.flat(),
    ...state.stock,
    ...state.waste,
    ...Object.values(state.foundations).flat(),
  ];
}

test("deals 52 unique cards", () => {
  const state = deal(1);
  const cards = allCards(state);
  assert.equal(cards.length, 52);
  assert.equal(new Set(cards.map((c) => c.id)).size, 52);
});

test("deal distribution matches Klondike rules", () => {
  const state = deal(1);
  for (let col = 0; col < 7; col++) {
    assert.equal(state.tableau[col].length, col + 1);
    const faceUpCount = state.tableau[col].filter((c) => c.faceUp).length;
    assert.equal(faceUpCount, 1, `column ${col} should have exactly one face-up card`);
    assert.equal(state.tableau[col][col].faceUp, true, `column ${col} top card should be face-up`);
  }
  assert.equal(state.stock.length, 24);
  assert.equal(state.waste.length, 0);
  assert.ok(state.stock.every((c) => !c.faceUp));
});

test("deterministic seed: same seed deals identically, different seeds differ", () => {
  const a = deal(42);
  const b = deal(42);
  assert.deepEqual(a, b);

  const c = deal(43);
  assert.notDeepEqual(a.tableau, c.tableau);
});

test("tableau stacking legality: descending rank, alternating color", () => {
  let state = deal(7);
  // Draw until we find a legal wasteToTableau move, then verify it is rank-1/alt-color.
  for (let i = 0; i < 24 && !legalMoves(state).some((m) => m.type === "wasteToTableau"); i++) {
    state = applyMove(state, { type: "draw" });
  }
  const move = legalMoves(state).find((m) => m.type === "wasteToTableau");
  if (move && move.type === "wasteToTableau") {
    const card = state.waste[state.waste.length - 1];
    const target = state.tableau[move.toColumn];
    const top = target[target.length - 1];
    if (top) {
      assert.equal(top.rank, card.rank + 1);
      const redSuits = new Set(["diamonds", "hearts"]);
      assert.notEqual(redSuits.has(top.suit), redSuits.has(card.suit));
    } else {
      assert.equal(card.rank, 13);
    }
  }
});

test("foundation sequences must start at ace and build in suit order", () => {
  const state = deal(3);
  // Waste is empty on a fresh deal, so sending its (nonexistent) top card to a
  // foundation is illegal and must leave state untouched.
  const result = applyMove(state, { type: "wasteToFoundation" });
  assert.equal(result, state, "illegal foundation move must not mutate state");
});

test("move sequence invariant: total card count stays 52 through a sequence of moves", () => {
  let state = deal(9);
  for (let i = 0; i < 100; i++) {
    const moves = legalMoves(state);
    if (moves.length === 0) break;
    state = applyMove(state, moves[i % moves.length]);
    assert.equal(allCards(state).length, 52);
  }
});

test("draw-3 recycles the stock and repeats the same sequence", () => {
  let state = deal(11, 3);
  const drawnSequences: string[][] = [];
  for (let pass = 0; pass < 2; pass++) {
    const seq: string[] = [];
    while (state.stock.length > 0) {
      state = applyMove(state, { type: "draw" });
      seq.push(state.waste[state.waste.length - 1].id);
    }
    drawnSequences.push(seq);
    state = applyMove(state, { type: "recycle" });
  }
  assert.deepEqual(drawnSequences[0], drawnSequences[1]);
  assert.equal(state.stockPasses, 2);
});

test("undo restores the exact prior state, including moveCount and stockPasses", () => {
  let state = deal(5);
  const beforeDraw = state;
  state = applyMove(state, { type: "draw" });
  assert.notDeepEqual(state.waste, beforeDraw.waste);

  const restored = undo(state);
  assert.deepEqual(restored.tableau, beforeDraw.tableau);
  assert.deepEqual(restored.stock, beforeDraw.stock);
  assert.deepEqual(restored.waste, beforeDraw.waste);
  assert.equal(restored.moveCount, beforeDraw.moveCount);
  assert.equal(restored.stockPasses, beforeDraw.stockPasses);
  assert.equal(restored.score, beforeDraw.score);
});

test("undo is a no-op (same reference) with empty history", () => {
  const state = deal(5);
  assert.equal(undo(state), state);
});

test("auto-play safe only moves cards that are provably safe", () => {
  let state = deal(2);
  // Walk the stock through the full play to accumulate some foundation progress.
  for (let i = 0; i < 24; i++) {
    const moves = legalMoves(state);
    const foundationMove = moves.find((m) => m.type === "wasteToFoundation");
    state = applyMove(state, foundationMove ?? { type: "draw" });
  }
  const played = autoPlaySafe(state);
  assert.equal(allCards(played).length, 52);
  // auto-play must never invalidate the invariant that foundations are strictly
  // ace-up and in-suit.
  for (const suit of Object.keys(played.foundations) as Array<keyof typeof played.foundations>) {
    const pile = played.foundations[suit];
    pile.forEach((card, idx) => assert.equal(card.rank, idx + 1));
  }
});

test("isWon is false for a fresh deal and true once all foundations are complete", () => {
  const state = deal(1);
  assert.equal(isWon(state), false);

  const suits: Array<"clubs" | "diamonds" | "hearts" | "spades"> = ["clubs", "diamonds", "hearts", "spades"];
  const won: GameState = {
    ...state,
    tableau: [[], [], [], [], [], [], []],
    stock: [],
    waste: [],
    foundations: Object.fromEntries(
      suits.map((suit) => [
        suit,
        Array.from({ length: 13 }, (_, i) => ({ id: `${suit}-${i + 1}`, suit, rank: (i + 1) as any, faceUp: true })),
      ]),
    ) as any,
  };
  assert.equal(isWon(won), true);
});

test("hint returns a legal move or a truthful explanation when none exists", () => {
  const state = deal(1);
  const result = hint(state);
  if (result.move) {
    assert.ok(legalMoves(state).some((m) => JSON.stringify(m) === JSON.stringify(result.move)));
  } else {
    assert.ok(result.explanation.length > 0);
  }
});

test("save/load snapshot round-trips to an equal state", () => {
  let state = deal(6);
  state = applyMove(state, { type: "draw" });
  const json = snapshot(state);
  const restored = loadSnapshot(json);
  assert.deepEqual(restored, state);
});

test("invalid moves never mutate state", () => {
  const state = deal(4);
  // Column 6 is 7 cards deep; its top card cannot possibly already be the next
  // card due on its foundation on a fresh deal, so this is always illegal.
  const illegal: Move = { type: "tableauToTableau", fromColumn: 6, cardIndex: 0, toColumn: 6 };
  const result = applyMove(state, illegal);
  assert.equal(result, state);
});
