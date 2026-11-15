import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyLedger,record} from '../../src/domain/rewards/ledger.ts';
import {activeModeIndex,cardBackUnlocked,modeUnlocked,solitaireModes,totalSolitaireWins,winsForMode} from '../../src/domain/solitaire/progression.ts';
import {glowTargets} from '../../src/domain/minigames/glow.ts';

test('both draw modes are always available; five wins unlock challenge',()=>{
  let ledger=emptyLedger();
  assert.equal(modeUnlocked(ledger,0),true);
  assert.equal(modeUnlocked(ledger,1),true);
  assert.equal(modeUnlocked(ledger,2),false);
  for(let i=0;i<5;i++)ledger=record(ledger,{id:`solitaire-win-${i%2?'three':'classic'}-${i}`,type:'earn',amount:25,reason:'Klondike'});
  assert.equal(winsForMode(ledger,'three'),2);
  assert.equal(totalSolitaireWins(ledger),5);
  assert.equal(modeUnlocked(ledger,2),true);
  assert.equal(cardBackUnlocked(ledger,'winter'),true);
});

test('legacy wins count and purchases do not count',()=>{
  let ledger=emptyLedger();
  ledger=record(ledger,{id:'klondike-win-123',type:'earn',amount:25,reason:'Klondike'});
  ledger=record(ledger,{id:'garden-purchase-1',type:'spend',amount:5,reason:'Blomst'});
  assert.equal(winsForMode(ledger,'classic'),1);
  assert.equal(modeUnlocked(ledger,1),true);
  assert.equal(cardBackUnlocked(ledger,'floral'),true);
  assert.equal(cardBackUnlocked(ledger,'autumn'),false);
  ledger=record(ledger,{id:'klondike-win-456',type:'earn',amount:25,reason:'Klondike'});
  assert.equal(cardBackUnlocked(ledger,'autumn'),true);
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
