import type {Card,Move,State} from './klondike';

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
  if(move.kind==='foundation')return state.tableau[move.to].length*visibleOverlap;
  if(move.kind==='draw'||move.kind==='recycle'||move.to!=='tableau')return 0;
  return state.tableau[move.index].length*visibleOverlap;
}
