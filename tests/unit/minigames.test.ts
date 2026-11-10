import assert from "node:assert/strict";
import test from "node:test";
import {
  applyMove,
  createFlowerMatch,
  explain,
  flowerMatchDefinition,
  isWon,
  legalMoves,
} from "../../src/domain/minigames/flowerMatch";
import type { FlowerMatchMove, FlowerMatchState } from "../../src/domain/minigames/flowerMatch";
import { getMinigame, minigameRegistry } from "../../src/domain/minigames/registry";
import { completeMinigame } from "../../src/application/minigameRewards";
import { createLedger, balanceOf } from "../../src/domain/rewards/ledger";
import { switchTo } from "../../src/application/session";
import { deal } from "../../src/domain/solitaire/engine";
import type { AppSession } from "../../src/application/session";

test("deterministic seed: same seed deals an identical, fully-paired board", () => {
  const a = createFlowerMatch(1, 4);
  const b = createFlowerMatch(1, 4);
  assert.deepEqual(a, b);
  assert.equal(a.tiles.length, 8);
  assert.ok(a.tiles.every((t) => t.state === "hidden"));

  const counts = new Map<string, number>();
  for (const tile of a.tiles) counts.set(tile.symbol, (counts.get(tile.symbol) ?? 0) + 1);
  for (const count of counts.values()) assert.equal(count, 2);
});

function findPair(state: FlowerMatchState): [number, number] {
  const bySymbol = new Map<string, number[]>();
  for (const tile of state.tiles) {
    if (tile.state === "matched") continue;
    const indices = bySymbol.get(tile.symbol) ?? [];
    indices.push(tile.id);
    bySymbol.set(tile.symbol, indices);
  }
  for (const indices of bySymbol.values()) {
    if (indices.length === 2) return [indices[0], indices[1]];
  }
  throw new Error("no pair found");
}

test("revealing a matching pair marks both tiles matched", () => {
  let state = createFlowerMatch(2, 4);
  const [a, b] = findPair(state);
  state = applyMove(state, { type: "reveal", tileIndex: a });
  state = applyMove(state, { type: "reveal", tileIndex: b });
  assert.equal(state.tiles[a].state, "matched");
  assert.equal(state.tiles[b].state, "matched");
  assert.equal(state.matchesFound, 1);
  assert.equal(state.revealed.length, 0);
});

test("revealing a mismatched pair blocks further reveals until resolved", () => {
  let state = createFlowerMatch(3, 4);
  const [a] = findPair(state);
  const mismatchIdx = state.tiles.find((t) => t.id !== a && t.symbol !== state.tiles[a].symbol)!.id;

  state = applyMove(state, { type: "reveal", tileIndex: a });
  state = applyMove(state, { type: "reveal", tileIndex: mismatchIdx });
  assert.equal(state.revealed.length, 2);
  assert.deepEqual(legalMoves(state), [{ type: "resolveMismatch" }]);
  assert.match(explain(state), /don't match/);

  const resolved = applyMove(state, { type: "resolveMismatch" });
  assert.equal(resolved.tiles[a].state, "hidden");
  assert.equal(resolved.tiles[mismatchIdx].state, "hidden");
  assert.equal(resolved.revealed.length, 0);
});

test("illegal moves never mutate state", () => {
  let state = createFlowerMatch(4, 4);
  const [a] = findPair(state);
  state = applyMove(state, { type: "reveal", tileIndex: a });

  const before = state;
  const result = applyMove(state, { type: "reveal", tileIndex: a }); // same tile again
  assert.equal(result, before);

  const resolveWhileNotMismatched = applyMove(state, { type: "resolveMismatch" });
  assert.equal(resolveWhileNotMismatched, before);
});

test("the game is won once every pair is matched, and explain() reflects it", () => {
  let state = createFlowerMatch(5, 4);
  while (!isWon(state)) {
    const [a, b] = findPair(state);
    state = applyMove(state, { type: "reveal", tileIndex: a });
    state = applyMove(state, { type: "reveal", tileIndex: b });
  }
  assert.equal(isWon(state), true);
  assert.equal(legalMoves(state).length, 0);
  assert.match(explain(state), /won/i);
});

test("flowerMatchDefinition satisfies the pluggable minigame contract and is registered", () => {
  assert.equal(flowerMatchDefinition.id, "flower-match");
  assert.equal(getMinigame("flower-match"), flowerMatchDefinition);
  assert.equal(getMinigame("not-a-real-game"), undefined);
  assert.ok(Object.keys(minigameRegistry).includes("flower-match"));
});

test("completeMinigame grants Lysglimt only on a real win, and never pays the same win twice", () => {
  let state = createFlowerMatch(6, 4);
  let ledger = createLedger();

  const notYetWon = completeMinigame(ledger, flowerMatchDefinition, state, "session-1", { lysglimt: 25 });
  assert.equal(notYetWon.rewarded, false);
  assert.equal(balanceOf(notYetWon.ledger, "lysglimt"), 0);

  while (!isWon(state)) {
    const [a, b] = findPair(state);
    state = applyMove(state, { type: "reveal", tileIndex: a });
    state = applyMove(state, { type: "reveal", tileIndex: b });
  }

  const firstComplete = completeMinigame(ledger, flowerMatchDefinition, state, "session-1", { lysglimt: 25 });
  assert.equal(firstComplete.rewarded, true);
  assert.equal(balanceOf(firstComplete.ledger, "lysglimt"), 25);

  // Duplicate win event / retried save for the SAME session must not pay again.
  const duplicate = completeMinigame(firstComplete.ledger, flowerMatchDefinition, state, "session-1", { lysglimt: 25 });
  assert.equal(duplicate.rewarded, false);
  assert.equal(balanceOf(duplicate.ledger, "lysglimt"), 25);

  // A genuinely new playthrough (new session id) can reward again.
  const secondSession = completeMinigame(duplicate.ledger, flowerMatchDefinition, state, "session-2", { lysglimt: 25 });
  assert.equal(secondSession.rewarded, true);
  assert.equal(balanceOf(secondSession.ledger, "lysglimt"), 50);
});

test("switching screens never discards the Solitaire deal or minigame progress", () => {
  const solitaire = deal(1);
  const minigameState = createFlowerMatch(1, 4);
  const session: AppSession = { active: "solitaire", solitaire, minigame: { id: "flower-match", state: minigameState } };

  const inGarden = switchTo(session, "garden");
  assert.equal(inGarden.active, "garden");
  assert.equal(inGarden.solitaire, solitaire, "same Solitaire deal reference, untouched");
  assert.equal(inGarden.minigame, session.minigame, "same minigame progress reference, untouched");

  const backToSolitaire = switchTo(inGarden, "solitaire");
  assert.equal(backToSolitaire.solitaire, solitaire);
  assert.deepEqual(backToSolitaire.solitaire, solitaire);
});
