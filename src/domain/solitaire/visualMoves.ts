import type {Card,Move,State} from './klondike';

/** A long column shows its first two and last two cards, without changing the game. */
export function visibleTableauIndexes(length:number):number[]{
  if(!Number.isSafeInteger(length)||length<0)return [];
  if(length<=5)return Array.from({length},(_,index)=>index);
  return [0,1,length-2,length-1];
}

/** Position at which the next visible card will land. */
export function tableauLandingSlots(length:number):number {
  return length<5?length:3;
}

/** Resolves the exact moving card without changing the solitaire state. */
export function cardForVisualMove(state:State,move:Move):Card|null {
  if(move.kind==='draw')return state.stock.at(-1)??null;
  if(move.kind==='recycle')return state.waste.at(-1)??null;
  if(move.kind==='waste')return state.waste.at(-1)??null;
  if(move.kind==='foundation')return state.foundations[move.from].at(-1)??null;
  return state.tableau[move.from]?.[move.at]??null;
}

/** The extra downward offset for a newly placed tableau card. */
export function tableauLandingOffset(state:State,move:Move,visibleOverlap=27):number {
  if(move.kind==='foundation')return tableauLandingSlots(state.tableau[move.to].length)*visibleOverlap;
  if(move.kind==='draw'||move.kind==='recycle'||move.to!=='tableau')return 0;
  return tableauLandingSlots(state.tableau[move.index].length)*visibleOverlap;
}
