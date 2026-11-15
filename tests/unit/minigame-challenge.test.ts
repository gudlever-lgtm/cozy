import assert from 'node:assert/strict';
import test from 'node:test';
import {glowTargets,glowTileCount,glowPositions} from '../../src/domain/minigames/glow.ts';
import {seasonQuestion,seasonQuestions} from '../../src/domain/minigames/seasons.ts';

test('Lysglimt hunts grow through four levels with five unique targets',()=>{
  for(let level=1;level<=4;level++){
    assert.equal(glowTileCount(level),8+level*4);
    const targets=glowTargets(12345,level);
    assert.equal(targets.length,5);
    assert.equal(new Set(targets).size,5);
    assert.ok(targets.every(index=>index>=0&&index<glowTileCount(level)));
    assert.deepEqual(targets,glowTargets(12345,level));
    for(const round of [0,1,12345,20261115]){
      const positions=glowPositions(round,level);
      assert.equal(positions.length,glowTileCount(level));
      assert.deepEqual(positions,glowPositions(round,level));
      assert.ok(positions.every(({x,y})=>x>=3&&x<=85&&y>=3&&y<=86));
      for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++)
        assert.ok(Math.hypot((positions[i].x-positions[j].x)*3.1,(positions[i].y-positions[j].y)*3.4)>=39.9);
    }
  }
});

test('season quiz has varied answers and non-repeating questions in a cycle',()=>{
  assert.ok(seasonQuestions.length>=12);
  assert.equal(new Set(seasonQuestions.map(item=>item.question)).size,seasonQuestions.length);
  assert.ok(new Set(seasonQuestions.map(item=>item.correct)).size===4);
  seasonQuestions.forEach((item,index)=>{
    assert.equal(seasonQuestion(index),item);
    assert.equal(item.answers.length,4);
    assert.equal(new Set(item.answers).size,4);
    assert.ok(item.correct>=0&&item.correct<4);
  });
});
