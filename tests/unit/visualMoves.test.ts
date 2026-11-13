import assert from 'node:assert/strict';
import test from 'node:test';
import {newGame} from '../../src/domain/solitaire/klondike.ts';
import {cardForVisualMove,tableauLandingOffset,tableauLandingSlots,visibleTableauIndexes} from '../../src/domain/solitaire/visualMoves.ts';

test('columns over five cards only display the first and last two',()=>{
  assert.deepEqual(visibleTableauIndexes(0),[]);
  assert.deepEqual(visibleTableauIndexes(5),[0,1,2,3,4]);
  assert.deepEqual(visibleTableauIndexes(6),[0,1,4,5]);
  assert.deepEqual(visibleTableauIndexes(13),[0,1,11,12]);
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
  assert.equal(tableauLandingOffset(game,{kind:'tableau',from:1,at:1,to:'tableau',index:5}),3*27);
  assert.equal(tableauLandingOffset(game,{kind:'foundation',from:0,to:3}),4*27);
  assert.equal(tableauLandingOffset(game,{kind:'draw'}),0);
  assert.equal(tableauLandingSlots(5),3);
  assert.equal(tableauLandingSlots(4),4);
});
