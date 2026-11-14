import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyLedger,record} from '../../src/domain/rewards/ledger.ts';
import {unlockedChapter,specialDecorationUnlocked} from '../../src/domain/garden/chapters.ts';
import {decodeGarden,encodeGarden} from '../../src/domain/garden/layout.ts';

test('chapters unlock after five and fifteen earned solitaire wins',()=>{
  let ledger=emptyLedger();
  assert.equal(unlockedChapter(ledger,0),true);
  assert.equal(unlockedChapter(ledger,1),false);
  for(let i=0;i<15;i++){
    ledger=record(ledger,{id:`solitaire-win-classic-${i}`,type:'earn',amount:25,reason:'Sejr'});
    if(i===4)assert.equal(unlockedChapter(ledger,1),true);
  }
  assert.equal(unlockedChapter(ledger,2),true);
  assert.equal(specialDecorationUnlocked(ledger,3),false);
  ledger=record(ledger,{id:'quest-wins-5',type:'earn',amount:10,reason:'Milepæl'});
  assert.equal(specialDecorationUnlocked(ledger,3),true);
});

test('new chapter decorations roundtrip and old saves remain valid',()=>{
  const placements=[{id:'friend',kind:3 as const,chapter:1 as const,x:0.33,y:0.45}];
  assert.deepEqual(decodeGarden(encodeGarden(placements)),placements);
  assert.equal(decodeGarden('{"version":2,"decorations":[{"id":"old","kind":0,"x":0.2,"y":0.3}]}')[0].chapter,undefined);
});
