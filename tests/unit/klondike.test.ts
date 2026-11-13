import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame, legalMoves, applyMove, undo, hint, snapshot, restore, autoFinish, isWon} from '../../src/domain/solitaire/klondike.ts';

test('deal uses 52 unique cards in correct columns and stock', () => {
  const state = newGame(42);
  assert.deepEqual(state.tableau.map(pile => pile.length), [1,2,3,4,5,6,7]);
  assert.equal(state.stock.length, 24);
  const cards = [...state.stock, ...state.tableau.flat()];
  assert.equal(new Set(cards.map(c => c.id)).size, 52);
  state.tableau.forEach(pile => assert.deepEqual(pile.map(c => c.up), pile.map((_, i) => i === pile.length - 1)));
});

test('same seed gives same state, other seed differs', () => {
  assert.equal(snapshot(newGame(12)), snapshot(newGame(12)));
  assert.notEqual(snapshot(newGame(12)), snapshot(newGame(13)));
});

test('draw three, exhaust, recycle, obey limits', () => {
  let state = newGame(6, 3, 1);
  for (let i = 0; i < 8; i++) state = applyMove(state, {kind: 'draw'});
  assert.equal(state.stock.length, 0);
  assert.equal(state.waste.length, 24);
  state = applyMove(state, {kind: 'recycle'});
  assert.equal(state.stock.length, 24);
  assert.equal(state.passes, 1);
  for (let i = 0; i < 8; i++) state = applyMove(state, {kind: 'draw'});
  assert.ok(!legalMoves(state).some(move => move.kind === 'recycle'));
});

test('invalid move does not mutate state', () => {
  const state = newGame(72);
  const before = snapshot(state);
  assert.throws(() => applyMove(state, {kind: 'waste', to: 'foundation', index: 0}));
  assert.equal(snapshot(state), before);
});

test('undo exactly reverses moves including redeal and turns', () => {
  const original = newGame(88, 1);
  let state = original;
  for (let i = 0; i < 24; i++) state = applyMove(state, {kind: 'draw'});
  state = applyMove(state, {kind: 'recycle'});
  state = undo(state);
  for (let i = 0; i < 24; i++) state = undo(state);
  assert.equal(snapshot(state), snapshot(original));
});

test('hint always proposes a legal move; snapshot roundtrips', () => {
  let state = newGame(91);
  for (let i = 0; i < 5; i++) {
    const move = hint(state).move;
    assert.ok(move);
    assert.ok(legalMoves(state).some(m => JSON.stringify(m) === JSON.stringify(move)));
    state = applyMove(state, move);
  }
  assert.deepEqual(restore(snapshot(state)), state);
  assert.throws(() => restore('{}'));
});

test('autofinish never makes illegal moves', () => {
  const state = newGame(7);
  const finished = autoFinish(state);
  assert.ok(finished.moves >= state.moves);
  assert.equal(isWon(state), false);
  assert.deepEqual(restore(snapshot(finished)), finished);
});
