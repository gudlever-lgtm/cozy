import assert from 'node:assert/strict';
import test from 'node:test';
import {newGame} from '../../src/domain/solitaire/klondike.ts';
import {cardForVisualMove,tableauLandingOffset} from '../../src/domain/solitaire/visualMoves.ts';

test('flying-card lookup uses the exact stock or tableau source',()=>{
  const game=newGame(17);
  assert.equal(cardForVisualMove(game,{kind:'draw'})?.id,game.stock.at(-1)?.id);
  assert.equal(cardForVisualMove(game,{kind:'tableau',from:3,at:3,to:'foundation',index:0})?.id,game.tableau[3][3].id);
  assert.equal(cardForVisualMove(game,{kind:'waste',to:'foundation',index:0}),null);
});

test('visual destination offsets follow overlapping tableau cards',()=>{
  const game=newGame(17);
  assert.equal(tableauLandingOffset(game,{kind:'tableau',from:1,at:1,to:'tableau',index:5}),6*27);
  assert.equal(tableauLandingOffset(game,{kind:'foundation',from:0,to:3}),4*27);
  assert.equal(tableauLandingOffset(game,{kind:'draw'}),0);
});
