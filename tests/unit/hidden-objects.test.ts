import assert from 'node:assert/strict';
import test from 'node:test';
import {hiddenObjects,hiddenTargetIds} from '../../src/domain/minigames/hiddenObjects.ts';

test('five distinct hidden objects are selected for each picture',()=>{
  for(const round of [0,1,123,20261115]){
    const ids=hiddenTargetIds(round);
    assert.equal(ids.length,5);
    assert.equal(new Set(ids).size,5);
    assert.deepEqual(ids,hiddenTargetIds(round));
    assert.ok(ids.every(id=>id>=0&&id<hiddenObjects.length));
  }
  assert.notDeepEqual(hiddenTargetIds(1),hiddenTargetIds(2));
});

test('all hidden object positions fit within the picture',()=>{
  assert.ok(hiddenObjects.length>=10);
  assert.equal(new Set(hiddenObjects.map(object=>object.name)).size,hiddenObjects.length);
  assert.ok(hiddenObjects.every(object=>object.x>=0&&object.x<=88&&object.y>=0&&object.y<=88));
});
