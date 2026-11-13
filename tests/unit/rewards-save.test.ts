import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame, applyMove, snapshot, undo} from '../../src/domain/solitaire/klondike.ts';
import {emptyLedger, record, balance, validateLedger} from '../../src/domain/rewards/ledger.ts';
import {encodeSave, decodeSave, loadGame, saveGame} from '../../src/persistence/save.ts';

test('Lysglimt earns once even if event retried', () => {
  const empty = emptyLedger();
  const event = {id:'quest:welcome:v1', type:'earn' as const, amount: 25, reason:'welcome-quest'};
  const paid = record(empty, event);
  assert.equal(balance(paid), 25);
  assert.equal(record(paid, event), paid);
  assert.equal(balance(empty), 0);
  assert.throws(() => record(paid, {...event, amount: 50}), /Conflicting/);
});

test('spending cannot exceed available Lysglimt and cannot double-spend', () => {
  const earned = record(emptyLedger(), {id:'solitaire:win:10', type:'earn', amount: 40, reason:'victory'});
  const purchase = {id:'garden:purchase:bench:1', type:'spend' as const, amount:30, reason:'bench'};
  const spent = record(earned, purchase);
  assert.equal(balance(spent), 10);
  assert.equal(balance(record(spent, purchase)), 10);
  assert.throws(() => record(spent, {id:'other', type:'spend', amount:20, reason:'other'}), /Insufficient/);
  assert.throws(() => record(earned, {id:'zero', type:'earn', amount:0, reason:'invalid'}));
  assert.deepEqual(validateLedger(spent), spent);
});

test('save round trip preserves undo history and rewards exactly', () => {
  const start = newGame(109, 3);
  const moved = applyMove(start, {kind:'draw'});
  const ledger = record(emptyLedger(), {id:'quest:1', type:'earn', amount:5, reason:'quest'});
  const restored = decodeSave(encodeSave(moved, ledger));
  assert.equal(snapshot(restored.solitaire), snapshot(moved));
  assert.equal(snapshot(undo(restored.solitaire)), snapshot(start));
  assert.equal(balance(restored.rewards), 5);
});

test('unknown save schema and corrupt accounting fail closed', () => {
  const valid = JSON.parse(encodeSave(newGame(10), emptyLedger()));
  assert.throws(() => decodeSave(JSON.stringify({...valid, schemaVersion:2})), /migration required/);
  valid.rewards.entries = [{id:'fake', type:'spend', amount:99, reason:'fraud'}];
  assert.throws(() => decodeSave(JSON.stringify(valid)), /Insufficient/);
});

test('async persistence uses atomic write contract and handles empty storage', async () => {
  let content: string | null = null;
  let writes = 0;
  const store = {read: async () => content, writeAtomically: async (value: string) => {content = value; writes++;}};
  assert.equal(await loadGame(store), null);
  await saveGame(store, newGame(71), emptyLedger());
  assert.equal(writes, 1);
  assert.equal((await loadGame(store))?.solitaire.seed, 71);
});
