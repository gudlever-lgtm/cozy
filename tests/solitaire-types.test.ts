import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newSolitaire,
  canMove,
  restart,
  type Game,
  type Card,
} from "../src/engine/solitaire";
import { fresh, migrate } from "../src/engine/save";
const card = (rank: number, suit: Card["suit"]): Card => ({
  id: `${suit}${rank}`,
  rank,
  suit,
  up: true,
});
test("open solitaire and Whitehead reveal all tableau cards and survive restart/save", () => {
  for (const kind of ["open", "whitehead"] as const) {
    const game = newSolitaire(kind, kind);
    assert.ok(game.tableau.flat().every((c) => c.up));
    assert.equal(game.tableau.flat().length + game.stock.length, 52);
    assert.equal(restart(game).variant, kind);
    const s = fresh("save", "en");
    s.game = game;
    assert.equal(
      migrate(JSON.stringify(s), "restore", "en").game.variant,
      kind,
    );
  }
});
test("Whitehead builds same color, moves same-suit runs and fills spaces with any card", () => {
  const g: Game = {
    ...newSolitaire("rules", "whitehead"),
    tableau: [[card(7, "♥"), card(6, "♥")], [card(8, "♦")], [], [], [], [], []],
  };
  const from = { kind: "tableau" as const, pile: 0, index: 0 };
  assert.equal(canMove(g, from, { kind: "tableau", pile: 1 }), true);
  assert.equal(canMove(g, from, { kind: "tableau", pile: 2 }), true);
  g.tableau[0][1] = card(6, "♦");
  assert.equal(canMove(g, from, { kind: "tableau", pile: 1 }), false);
  g.tableau[0] = [card(7, "♥")];
  g.tableau[1] = [card(8, "♣")];
  assert.equal(canMove(g, from, { kind: "tableau", pile: 1 }), false);
});
