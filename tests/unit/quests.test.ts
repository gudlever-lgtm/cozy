import test from 'node:test';
import assert from 'node:assert/strict';
import {quests} from '../../src/domain/quests/quests.ts';
import {emptyLedger,record} from '../../src/domain/rewards/ledger.ts';

test('quests use actual completed events and do not claim on mere spending',()=>{
  let ledger=emptyLedger();
  assert.equal(quests(ledger,0).filter(q=>q.complete).length,0);
  ledger=record(ledger,{id:'memory-win-100',type:'earn',amount:5,reason:'Vendespil'});
  assert.equal(quests(ledger,0).find(q=>q.id==='first-memory')?.complete,true);
  assert.equal(quests(ledger,3).find(q=>q.id==='garden-three')?.complete,true);
  ledger=record(ledger,{id:'quest-first-memory',type:'earn',amount:10,reason:'Quest'});
  assert.equal(quests(ledger,3).find(q=>q.id==='first-memory')?.claimed,true);
  assert.equal(record(ledger,{id:'quest-first-memory',type:'earn',amount:10,reason:'Quest'}),ledger);
});
