import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyLedger,record} from '../../src/domain/rewards/ledger.ts';
import {activeModeIndex,modeUnlocked,solitaireModes,winsForMode} from '../../src/domain/solitaire/progression.ts';
import {glowTargets} from '../../src/domain/minigames/glow.ts';

test('five actual wins unlock next solitaire type, separately by type',()=>{
  let ledger=emptyLedger();
  assert.equal(modeUnlocked(ledger,0),true);
  assert.equal(modeUnlocked(ledger,1),false);
  for(let i=0;i<5;i++)ledger=record(ledger,{id:`solitaire-win-classic-${i}`,type:'earn',amount:25,reason:'Klondike'});
  assert.equal(modeUnlocked(ledger,1),true);
  assert.equal(modeUnlocked(ledger,2),false);
  for(let i=0;i<5;i++)ledger=record(ledger,{id:`solitaire-win-three-${i}`,type:'earn',amount:25,reason:'Tre kort'});
  assert.equal(winsForMode(ledger,'three'),5);
  assert.equal(modeUnlocked(ledger,2),true);
});

test('legacy wins count and purchases do not count',()=>{
  let ledger=emptyLedger();
  ledger=record(ledger,{id:'klondike-win-123',type:'earn',amount:25,reason:'Klondike'});
  ledger=record(ledger,{id:'garden-purchase-1',type:'spend',amount:5,reason:'Blomst'});
  assert.equal(winsForMode(ledger,'classic'),1);
  assert.equal(modeUnlocked(ledger,1),false);
});

test('solitaire variants use existing legal engine options',()=>{
  assert.deepEqual(solitaireModes.map(m=>[m.drawCount,m.maxPasses]),[[1,null],[3,null],[3,3]]);
  assert.equal(activeModeIndex(1,null),0);
  assert.equal(activeModeIndex(3,null),1);
  assert.equal(activeModeIndex(3,3),2);
});

test('glow hunt hides five stable distinct positions',()=>{
  const positions=glowTargets(20261114);
  assert.equal(positions.length,5);
  assert.equal(new Set(positions).size,5);
  assert.ok(positions.every(position=>position>=0&&position<12));
  assert.deepEqual(positions,glowTargets(20261114));
});
