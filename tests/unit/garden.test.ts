import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeGarden,encodeGarden} from '../../src/domain/garden/layout.ts';

test('garden positions roundtrip without losing unique ids',()=>{
  const items=[{id:'bench-1',kind:0 as const,x:0.34,y:0.57},{id:'fountain-2',kind:1 as const,x:0.7,y:0.4}];
  assert.deepEqual(decodeGarden(encodeGarden(items)),items);
});

test('legacy decoration kinds migrate to positioned schema',()=>{
  assert.deepEqual(decodeGarden('{"version":1,"decorations":[0,2]}'),[
    {id:'legacy-0',kind:0,x:0.12,y:0.38},
    {id:'legacy-1',kind:2,x:0.31,y:0.38},
  ]);
});

test('invalid or duplicate garden placements fail closed',()=>{
  assert.throws(()=>decodeGarden('{"version":2,"decorations":[{"id":"x","kind":5,"x":0.1,"y":0.5}]}'));
  assert.throws(()=>encodeGarden([{id:'x',kind:0,x:0.4,y:0.3},{id:'x',kind:1,x:0.5,y:0.7}]));
  assert.throws(()=>decodeGarden('{"version":1,"decorations":[900]}'));
});
