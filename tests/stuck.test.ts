import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newGame,
  isStuck,
  drawCards,
  snapshot,
  type Card,
  type Game,
} from "../src/engine/solitaire";
const card = (rank: number, suit: Card["suit"] = "♠"): Card => ({
  id: suit + rank,
  rank,
  suit,
  up: true,
});
function board(): Game {
  return {
    ...newGame("stuck"),
    stock: [],
    waste: [],
    tableau: [[], [], [], [], [], [], []] as Card[][],
    foundations: [[], [], [], []] as Card[][],
  };
}
test("no move is reported only after a whole stock cycle, without mutating the game", () => {
  const g = board();
  g.tableau[0] = [card(7)];
  g.waste = [card(9)];
  const before = structuredClone(g);
  assert.equal(isStuck(g), true);
  assert.deepEqual(g, before);
  g.won = true;
  assert.equal(isStuck(g), false);
});
test("visible moves, foundation returns and moves available only after drawing are not stuck", () => {
  const g = board();
  g.tableau[0] = [card(7)];
  g.tableau[1] = [card(6, "♥")];
  assert.equal(isStuck(g), false);
  g.tableau[1] = [];
  g.stock = [
    { ...card(6, "♥"), up: false },
    { ...card(9), up: false },
  ];
  for (const draw of [1, 3] as const) {
    g.draw = draw;
    assert.equal(isStuck(g), false);
  }
  g.stock = [];
  g.foundations[0] = [card(6, "♥")];
  assert.equal(isStuck(g), false);
});
test("draw-three examines the next complete pass as well as a partial initial stock", () => {
  const g = board();
  g.draw = 3;
  g.tableau[0] = [card(7)];
  g.stock = [{ ...card(9), up: false }];
  g.waste = [card(10), card(11), card(6, "♥"), card(12)];
  const before = snapshot(g);
  assert.equal(isStuck(g), false);
  assert.deepEqual(snapshot(g), before);
  assert.notEqual(drawCards(g), g);
});
