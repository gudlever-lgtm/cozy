import assert from 'node:assert/strict';
import test from 'node:test';
import {newGame} from '../../src/domain/solitaire/klondike.ts';
import {cardForVisualMove,tableauLandingOffset,tableauLandingSlots,visibleTableauIndexes} from '../../src/domain/solitaire/visualMoves.ts';

const back={up:false};
const face={up:true};
test('only long face-up runs are compacted; the back stack remains visible',()=>{
  assert.deepEqual(visibleTableauIndexes([]),[]);
  assert.deepEqual(visibleTableauIndexes([face,face,face]),[0,1,2]);
  assert.deepEqual(visibleTableauIndexes([face,face,face,face]),[0,3]);
  assert.deepEqual(visibleTableauIndexes([back,back,back,face]),[2,3]);
  assert.deepEqual(visibleTableauIndexes([back,back,face,face,face]),[1,2,3,4]);
  assert.deepEqual(visibleTableauIndexes([back,back,face,face,face,face,face]),[1,2,6]);
  assert.deepEqual(visibleTableauIndexes([back,back,face,face,face,face,face],true),[1,2,3,4,5,6]);
  assert.deepEqual(visibleTableauIndexes([face,face,face,face],true),[0,1,2,3]);
  assert.deepEqual(visibleTableauIndexes([back,back]),[1]);
});

test('flying-card lookup uses the exact stock or tableau source',()=>{
  const game=newGame(17);
  assert.equal(cardForVisualMove(game,{kind:'draw'})?.id,game.stock.at(-1)?.id);
  assert.equal(cardForVisualMove(game,{kind:'tableau',from:3,at:3,to:'foundation',index:0})?.id,game.tableau[3][3].id);
  assert.equal(cardForVisualMove(game,{kind:'waste',to:'foundation',index:0}),null);
});

test('visual destination offsets follow overlapping tableau cards',()=>{
  const game=newGame(17);
  assert.equal(tableauLandingOffset(game,{kind:'tableau',from:1,at:1,to:'tableau',index:5}),2*27);
  assert.equal(tableauLandingOffset(game,{kind:'foundation',from:0,to:3}),2*27);
  assert.equal(tableauLandingOffset(game,{kind:'draw'}),0);
  assert.equal(tableauLandingSlots([]),0);
  assert.equal(tableauLandingSlots([face,face]),2);
  assert.equal(tableauLandingSlots([face,face,face]),1);
  assert.equal(tableauLandingSlots([back,back,face,face]),3);
  assert.equal(tableauLandingSlots([back,back,face,face,face,face]),2);
});
