import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeMemory,hideMismatch,memoryWon,newMemoryGame,revealMemory} from '../../src/domain/minigames/memory.ts';

test('memory puzzle has deterministic pairs',()=>{
  const a=newMemoryGame(42);assert.deepEqual(a,newMemoryGame(42));
  assert.equal(a.tiles.length,8);assert.equal(new Set(a.tiles).size,4);
});
test('memory matches, mismatches and victory',()=>{
  let game=newMemoryGame(42);
  for(let n=0;n<4;n++){
    const pair=game.tiles.map((v,i)=>v===n?i:-1).filter(i=>i>=0);
    game=revealMemory(revealMemory(game,pair[0]),pair[1]);
    assert.equal(game.matched.length,(n+1)*2);
    game={...game,revealed:[]};
  }
  assert.equal(memoryWon(game),true);
  assert.equal(decodeMemory(JSON.stringify(game)).matched.length,8);
  let mismatch=newMemoryGame(3);
  const first=0, second=mismatch.tiles.findIndex(x=>x!==mismatch.tiles[first]);
  mismatch=revealMemory(revealMemory(mismatch,first),second);
  assert.deepEqual(hideMismatch(mismatch).revealed,[]);
});
test('invalid memory saves reject corrupt tiles',()=>{
  assert.throws(()=>decodeMemory('{"version":1,"round":1,"tiles":[],"revealed":[],"matched":[],"turns":0}'));
});
