import type {Card,Move,State} from './klondike';

/** Keep a single face-down back and compact only the face-up run. */
export function visibleTableauIndexes(pile:ReadonlyArray<Pick<Card,'up'>>,expanded=false):number[]{
  if(!pile.length)return [];
  const firstUp=pile.findIndex(card=>card.up);
  if(firstUp<0)return [pile.length-1];
  const back=firstUp>0?[firstUp-1]:[];
  const faceUpCount=pile.length-firstUp;
  if(faceUpCount<=3||expanded)return [...back,...Array.from({length:faceUpCount},(_,index)=>firstUp+index)];
  return [...back,firstUp,pile.length-1];
}

/** Position at which the next visible card will land. */
export function tableauLandingSlots(pile:ReadonlyArray<Pick<Card,'up'>>):number {
  if(!pile.length)return 0;
  const firstUp=pile.findIndex(card=>card.up);
  const backs=firstUp>0?1:0;
  const faceUps=firstUp<0?0:pile.length-firstUp;
  // The next card is the last one: after three face-up cards, the middle
  // cards collapse but the first and last remain visible.
  return backs+(faceUps<3?faceUps:1);
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
  if(move.kind==='foundation')return tableauLandingSlots(state.tableau[move.to])*visibleOverlap;
  if(move.kind==='draw'||move.kind==='recycle'||move.to!=='tableau')return 0;
  return tableauLandingSlots(state.tableau[move.index])*visibleOverlap;
}
