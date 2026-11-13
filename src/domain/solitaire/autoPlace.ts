import {legalMoves, type Move, type State} from './klondike.ts';

/** Prefer foundations, then another tableau column, without taking a card backwards. */
export function autoPlace(state: State, source: {kind:'waste'|'tableau'|'foundation';from:number;at:number}): Move | null {
  const candidates=legalMoves(state).filter(move => {
    if(source.kind==='waste')return move.kind==='waste';
    if(source.kind==='tableau')return move.kind==='tableau'&&move.from===source.from&&move.at===source.at;
    return move.kind==='foundation'&&move.from===source.from;
  });
  return candidates.find(move=>(move.kind==='waste'||move.kind==='tableau')&&move.to==='foundation')
    ?? candidates.find(move=>(move.kind==='waste'||move.kind==='tableau')&&move.to==='tableau')
    ?? candidates[0] ?? null;
}
