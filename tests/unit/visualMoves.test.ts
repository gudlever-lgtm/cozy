import assert from 'node:assert/strict';
import test from 'node:test';
import {newGame} from '../../src/domain/solitaire/klondike.ts';
import {cardForVisualMove,tableauLandingOffset,tableauLandingSlots,visibleTableauIndexes} from '../../src/domain/solitaire/visualMoves.ts';

test('columns over three cards show their first and last card',()=>{
  assert.deepEqual(visibleTableauIndexes(0),[]);
  assert.deepEqual(visibleTableauIndexes(3),[0,1,2]);
  assert.deepEqual(visibleTableauIndexes(4),[0,3]);
  assert.deepEqual(visibleTableauIndexes(5),[0,4]);
  assert.deepEqual(visibleTableauIndexes(6),[0,5]);
  assert.deepEqual(visibleTableauIndexes(13),[0,12]);
  assert.deepEqual(visibleTableauIndexes(-1),[]);
});

test('flying-card lookup uses the exact stock or tableau source',()=>{
  const game=newGame(17);
  assert.equal(cardForVisualMove(game,{kind:'draw'})?.id,game.stock.at(-1)?.id);
  assert.equal(cardForVisualMove(game,{kind:'tableau',from:3,at:3,to:'foundation',index:0})?.id,game.tableau[3][3].id);
  assert.equal(cardForVisualMove(game,{kind:'waste',to:'foundation',index:0}),null);
});

test('visual destination offsets follow overlapping tableau cards',()=>{
  const game=newGame(17);
  assert.equal(tableauLandingOffset(game,{kind:'tableau',from:1,at:1,to:'tableau',index:5}),27);
  assert.equal(tableauLandingOffset(game,{kind:'foundation',from:0,to:3}),27);
  assert.equal(tableauLandingOffset(game,{kind:'draw'}),0);
  assert.equal(tableauLandingSlots(2),2);
  assert.equal(tableauLandingSlots(3),1);
  assert.equal(tableauLandingSlots(5),1);
  assert.equal(tableauLandingSlots(4),1);
});
