import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame, legalMoves, applyMove, undo, hint, snapshot, restore, autoFinish, canAutoFinish, isWon} from '../../src/domain/solitaire/klondike.ts';
import type {Card, State} from '../../src/domain/solitaire/klondike.ts';

function arranged(columns: string[][], foundationIds: string[][] = [], wasteIds: string[] = []): State {
  const state = newGame(123);
  const cards = new Map([...state.stock, ...state.tableau.flat()].map(card => [card.id, card]));
  const take = (id: string): Card => {const card = cards.get(id); if (!card) throw Error(`Missing ${id}`);
    cards.delete(id); return {...card, up: true};};
  state.tableau = columns.map(column => column.map(take));
  while (state.tableau.length < 7) state.tableau.push([]);
  state.foundations = foundationIds.map(pile => pile.map(take));
  while (state.foundations.length < 4) state.foundations.push([]);
  state.waste = wasteIds.map(take);
  state.stock = [...cards.values()].map(card => ({...card, up: false}));
  return state;
}

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
  assert.equal(canAutoFinish(state), false);
  assert.equal(snapshot(finished), snapshot(state));
  assert.equal(isWon(state), false);
  assert.deepEqual(restore(snapshot(finished)), finished);
});

test('tableau builds descending alternate colors, only kings enter empty spaces', () => {
  const state = arranged([['C8'], ['H7','S6'], ['D8'], ['S7'], []]);
  assert.ok(legalMoves(state).some(m => m.kind === 'tableau' && m.from === 1 && m.at === 0 && m.index === 0));
  assert.ok(!legalMoves(state).some(m => m.kind === 'tableau' && m.from === 1 && m.index === 2));
  assert.ok(!legalMoves(state).some(m => m.kind === 'tableau' && m.from === 1 && m.index === 4));
  const changed = applyMove(state, {kind: 'tableau', from: 1, at: 0, to: 'tableau', index: 0});
  assert.deepEqual(changed.tableau[0].map(c => c.id), ['C8','H7','S6']);
  assert.equal(state.tableau[1].length, 2);
});

test('foundations require exact suit/order and cannot split one suit across piles', () => {
  const state = arranged([['C2'], ['H2']], [['C1'], [], [], []], ['D1']);
  assert.ok(legalMoves(state).some(m => m.kind === 'tableau' && m.from === 0 && m.to === 'foundation' && m.index === 0));
  assert.ok(!legalMoves(state).some(m => m.kind === 'tableau' && m.from === 0 && m.to === 'foundation' && m.index === 1));
  assert.ok(!legalMoves(state).some(m => m.kind === 'tableau' && m.from === 1 && m.to === 'foundation'));
  assert.ok(legalMoves(state).some(m => m.kind === 'waste' && m.to === 'foundation' && m.index === 1));
});

test('reveal underlying card and undo restores its hidden status', () => {
  const state = arranged([['S9','H8'], ['C9']]);
  state.tableau[0][0].up = false;
  const moved = applyMove(state, {kind: 'tableau', from: 0, at: 1, to: 'tableau', index: 1});
  assert.equal(moved.tableau[0][0].up, true);
  assert.equal(undo(moved).tableau[0][0].up, false);
});

test('save validation rejects duplicated foundation suits and corrupt counters', () => {
  const state = arranged([], [['C1'], ['C2']]);
  assert.throws(() => restore(snapshot(state)), /Duplicate foundation suit|Corrupt foundation/);
  const valid = newGame(23);
  valid.passes = -1;
  assert.throws(() => restore(snapshot(valid)), /Corrupt options/);
});

test('completed foundations indicate victory', () => {
  const state = arranged([], ['C','D','H','S'].map(suit => Array.from({length: 13}, (_, i) => `${suit}${i + 1}`)));
  assert.equal(isWon(state), true);
  assert.equal(canAutoFinish(state), true);
  assert.deepEqual(legalMoves(state).filter(m => m.kind === 'draw'), []);
});
