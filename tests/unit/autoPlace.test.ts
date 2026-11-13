import test from 'node:test';
import assert from 'node:assert/strict';
import {autoPlace} from '../../src/domain/solitaire/autoPlace.ts';
import {newGame, legalMoves, applyMove} from '../../src/domain/solitaire/klondike.ts';

test('double tap selects a legal move from exactly the selected card',()=>{
  let state=newGame(42);
  while(state.stock.length)state=applyMove(state,{kind:'draw'});
  const top=state.waste.at(-1)!;
  const choice=autoPlace(state,{kind:'waste',from:0,at:0});
  const valid=legalMoves(state).filter(move=>move.kind==='waste');
  assert.deepEqual(choice,valid.find(move=>move.to==='foundation')??valid.find(move=>move.to==='tableau')??null);
  assert.ok(top);
});

test('double tap never moves an unrelated tableau card',()=>{
  const state=newGame(54321);
  for(let column=0;column<7;column++){
    const at=state.tableau[column].length-1;
    const choice=autoPlace(state,{kind:'tableau',from:column,at});
    assert.ok(choice===null||(choice.kind==='tableau'&&choice.from===column&&choice.at===at));
  }
});
