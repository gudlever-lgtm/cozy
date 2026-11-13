import test from 'node:test';
import assert from 'node:assert/strict';
import {clampGardenOffset} from '../../src/domain/garden/viewport.ts';

test('garden cannot pan at native zoom',()=>{
  assert.deepEqual(clampGardenOffset({x:1000,y:-900},1,400,800),{x:0,y:0});
});
test('zoomed garden pan clamps to visible image edges in each direction',()=>{
  assert.deepEqual(clampGardenOffset({x:1000,y:-900},2,400,800),{x:200,y:-400});
  assert.deepEqual(clampGardenOffset({x:-1000,y:900},1.5,400,800),{x:-100,y:200});
});
test('zoom-out and invalid viewport never retain offscreen pan',()=>{
  assert.deepEqual(clampGardenOffset({x:35,y:60},1,400,800),{x:0,y:0});
  assert.deepEqual(clampGardenOffset({x:35,y:60},2,0,800),{x:0,y:0});
});
