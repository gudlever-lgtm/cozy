import assert from 'node:assert/strict';
import test from 'node:test';
import {hiddenObjects,hiddenRoomCount,hiddenRoomObjects,hiddenRoomTitle,hiddenObjectPosition,hiddenTargetIds,movingObjectStart} from '../../src/domain/minigames/hiddenObjects.ts';

test('five distinct hidden objects are selected for each picture',()=>{
  for(const round of [0,1,123,20261115]){
    const ids=hiddenTargetIds(round);
    assert.equal(ids.length,5);
    assert.equal(new Set(ids).size,5);
    assert.deepEqual(ids,hiddenTargetIds(round));
    assert.ok(ids.every(id=>id>=0&&id<hiddenObjects.length));
    assert.ok(ids.filter(id=>id>=movingObjectStart).length>=2);
  }
  assert.notDeepEqual(hiddenTargetIds(1),hiddenTargetIds(2));
});

test('each unlocked room has five distinct discoverable targets and its own objects',()=>{
  assert.equal(hiddenRoomCount,3);
  assert.equal(new Set(Array.from({length:hiddenRoomCount},(_,i)=>hiddenRoomTitle(i+1))).size,3);
  for(let room=1;room<=hiddenRoomCount;room++){
    const objects=hiddenRoomObjects(room);
    assert.equal(objects.length,17);
    assert.equal(new Set(objects.map(item=>item.name)).size,objects.length);
    for(const round of [0,1,17,20261115]){
      const ids=hiddenTargetIds(round,room);
      assert.equal(ids.length,5);
      assert.equal(new Set(ids).size,5);
      assert.ok(ids.filter(id=>id>=movingObjectStart).length>=(room===3?3:2));
      ids.forEach(id=>{
        const {x,y}=hiddenObjectPosition(id,round,room);
        assert.ok(x>=0&&x<=88&&y>=0&&y<=88);
      });
    }
    for(let id=movingObjectStart;id<objects.length;id++){
      const positions=Array.from({length:4},(_,round)=>hiddenObjectPosition(id,round,room));
      assert.ok(new Set(positions.map(p=>`${p.x},${p.y}`)).size>=3);
    }
  }
});

test('all hidden object positions fit within the picture',()=>{
  assert.ok(hiddenObjects.length>=10);
  assert.equal(new Set(hiddenObjects.map(object=>object.name)).size,hiddenObjects.length);
  assert.ok(hiddenObjects.every(object=>object.x>=0&&object.x<=88&&object.y>=0&&object.y<=88));
  for(let id=0;id<hiddenObjects.length;id++){
    const places=Array.from({length:4},(_,round)=>hiddenObjectPosition(id,round));
    assert.ok(places.every(({x,y})=>x>=0&&x<=88&&y>=0&&y<=88));
    if(id>=movingObjectStart)assert.ok(new Set(places.map(p=>`${p.x},${p.y}`)).size>=3);
    else assert.equal(new Set(places.map(p=>`${p.x},${p.y}`)).size,1);
  }
});
