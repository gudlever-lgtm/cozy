import assert from 'node:assert/strict';
import test from 'node:test';
import {moveGardenDecoration} from '../../src/domain/garden/drag.ts';

const item={id:'bench-1',kind:0 as const,x:0.4,y:0.5};

test('dragging moves a decoration by finger displacement',()=>{
  assert.deepEqual(moveGardenDecoration(item,40,-60,1,400,600),{...item,x:0.5,y:0.4});
});

test('zoomed garden adjusts finger displacement to image coordinates',()=>{
  const result=moveGardenDecoration(item,40,60,2,400,600);
  assert.ok(Math.abs(result.x-0.45)<1e-9);
  assert.ok(Math.abs(result.y-0.55)<1e-9);
});

test('decoration stays inside the garden and invalid deltas do not corrupt saves',()=>{
  const moved=moveGardenDecoration(item,-9999,9999,1,400,600);
  assert.equal(moved.x,0.04);
  assert.equal(moved.y,0.91);
  assert.equal(moveGardenDecoration(item,NaN,0,1,400,600),item);
});
