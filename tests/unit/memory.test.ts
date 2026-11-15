import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeMemory,hideMismatch,memoryWon,newMemoryGame,nextMemoryLevel,revealMemory} from '../../src/domain/minigames/memory.ts';

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
test('four stages grow only after a win and cap at ten pairs',()=>{
  for(const [level,pairs] of [[1,4],[2,6],[3,8],[4,10]] as const){
    const game=newMemoryGame(123,level);
    assert.equal(game.tiles.length,pairs*2);
    assert.equal(new Set(game.tiles).size,pairs);
    assert.equal(nextMemoryLevel(game),level);
    const won={...game,matched:game.tiles.map((_,i)=>i)};
    assert.equal(memoryWon(won),true);
    assert.equal(nextMemoryLevel(won),Math.min(4,level+1));
    assert.equal(decodeMemory(JSON.stringify(won)).level,level);
  }
});
test('legacy saved memory games migrate to level one',()=>{
  const game=newMemoryGame(7);
  const legacy=JSON.parse(JSON.stringify(game));delete legacy.level;
  assert.equal(decodeMemory(JSON.stringify(legacy)).level,1);
});
