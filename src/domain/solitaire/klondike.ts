/** Pure, deterministic Klondike rules. No UI, clock, storage or reward dependencies. */
export type Suit = 'C' | 'D' | 'H' | 'S';
export type Card = { id: string; suit: Suit; rank: number; up: boolean };
export type Move =
  | { kind: 'draw' }
  | { kind: 'recycle' }
  | { kind: 'waste'; to: 'foundation' | 'tableau'; index: number }
  | { kind: 'tableau'; from: number; at: number; to: 'foundation' | 'tableau'; index: number }
  | { kind: 'foundation'; from: number; to: number };
export type Position = {
  tableau: Card[][]; foundations: Card[][]; stock: Card[]; waste: Card[];
  passes: number; moves: number;
};
export type State = Position & {
  seed: number; drawCount: 1 | 3; maxPasses: number | null;
  history: Position[];
};

const suits: Suit[] = ['C', 'D', 'H', 'S'];
const copy = <T>(data: T): T => JSON.parse(JSON.stringify(data));
const color = (card: Card) => card.suit === 'H' || card.suit === 'D' ? 'red' : 'black';
const rng = (initial: number) => {
  let value = initial >>> 0;
  return () => { value = (value + 0x6D2B79F5) >>> 0; let t = value;
    t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296; };
};

export function newGame(seed: number, drawCount: 1 | 3 = 1, maxPasses: number | null = null): State {
  if (!Number.isSafeInteger(seed) || ![1, 3].includes(drawCount) ||
      (maxPasses !== null && (!Number.isInteger(maxPasses) || maxPasses < 0))) throw Error('Invalid game options');
  const deck = suits.flatMap(suit => Array.from({length: 13}, (_, i) => ({id: `${suit}${i + 1}`, suit, rank: i + 1, up: false})));
  const random = rng(seed);
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  const tableau: Card[][] = Array.from({length: 7}, () => []);
  for (let col = 0; col < 7; col++) for (let row = 0; row <= col; row++) {
    const card = deck.pop()!; card.up = row === col; tableau[col].push(card);
  }
  return {seed, drawCount, maxPasses, tableau, foundations: [[], [], [], []], stock: deck,
    waste: [], passes: 0, moves: 0, history: []};
}

function canTableau(card: Card, column: Card[]) {
  const top = column.at(-1);
  return top ? top.up && top.rank === card.rank + 1 && color(top) !== color(card) : card.rank === 13;
}
function canFoundation(card: Card, pile: Card[], foundations: Card[][]) {
  const top = pile.at(-1);
  // Only one foundation may own each suit, even if the ace has been moved back.
  return top ? top.suit === card.suit && top.rank + 1 === card.rank :
    card.rank === 1 && !foundations.some(other => other.some(existing => existing.suit === card.suit));
}
function validRun(cards: Card[]) {
  return cards.length > 0 && cards.every((card, i) => card.up && (i === 0 ||
    (cards[i - 1].rank === card.rank + 1 && color(cards[i - 1]) !== color(card))));
}
function reveal(column: Card[]) { if (column.length) column[column.length - 1].up = true; }

export function legalMoves(state: State): Move[] {
  const moves: Move[] = [];
  if (state.stock.length) moves.push({kind: 'draw'});
  if (!state.stock.length && state.waste.length && (state.maxPasses === null || state.passes < state.maxPasses)) moves.push({kind: 'recycle'});
  const waste = state.waste.at(-1);
  if (waste) {
    state.foundations.forEach((pile, index) => { if (canFoundation(waste, pile, state.foundations)) moves.push({kind: 'waste', to: 'foundation', index}); });
    state.tableau.forEach((pile, index) => { if (canTableau(waste, pile)) moves.push({kind: 'waste', to: 'tableau', index}); });
  }
  state.tableau.forEach((pile, from) => pile.forEach((card, at) => {
    if (!validRun(pile.slice(at))) return;
    if (at === pile.length - 1) state.foundations.forEach((foundation, index) => {
      if (canFoundation(card, foundation, state.foundations)) moves.push({kind: 'tableau', from, at, to: 'foundation', index});
    });
    state.tableau.forEach((target, index) => {
      if (index !== from && canTableau(card, target)) moves.push({kind: 'tableau', from, at, to: 'tableau', index});
    });
  }));
  state.foundations.forEach((pile, from) => {
    const card = pile.at(-1); if (!card) return;
    state.tableau.forEach((target, to) => { if (canTableau(card, target)) moves.push({kind: 'foundation', from, to}); });
  });
  return moves;
}

export function applyMove(state: State, move: Move): State {
  if (!legalMoves(state).some(candidate => JSON.stringify(candidate) === JSON.stringify(move))) throw Error('Illegal move');
  const next = copy(state);
  const {history, seed, drawCount, maxPasses, ...position} = next;
  next.history.push(copy(position));
  if (move.kind === 'draw') {
    for (let i = 0; i < next.drawCount && next.stock.length; i++) {
      const card = next.stock.pop()!; card.up = true; next.waste.push(card);
    }
  } else if (move.kind === 'recycle') {
    next.stock = next.waste.reverse().map(card => ({...card, up: false}));
    next.waste = []; next.passes++;
  } else if (move.kind === 'waste') {
    next[move.to === 'tableau' ? 'tableau' : 'foundations'][move.index].push(next.waste.pop()!);
  } else if (move.kind === 'tableau') {
    const cards = next.tableau[move.from].splice(move.at);
    next[move.to === 'tableau' ? 'tableau' : 'foundations'][move.index].push(...cards);
    reveal(next.tableau[move.from]);
  } else {
    next.tableau[move.to].push(next.foundations[move.from].pop()!);
  }
  next.moves++;
  return next;
}

export function undo(state: State): State {
  if (!state.history.length) return copy(state);
  const previous = copy(state.history.at(-1)!);
  return {...state, ...previous, history: copy(state.history.slice(0, -1))};
}

export function hint(state: State): {move: Move | null; reason: string} {
  const moves = legalMoves(state);
  const move = moves.find(m => (m.kind === 'tableau' || m.kind === 'waste') && m.to === 'foundation')
    ?? moves.find(m => m.kind === 'tableau' && m.to === 'tableau') ?? moves[0] ?? null;
  return {move, reason: move ? 'legal-move' : 'no-legal-moves'};
}

export function isWon(state: State): boolean { return state.foundations.every(pile => pile.length === 13); }
export function snapshot(state: State): string { return JSON.stringify(state); }
export function restore(serialized: string): State {
  const parsed = JSON.parse(serialized) as State;
  if (!parsed || !Array.isArray(parsed.tableau) || parsed.tableau.length !== 7 ||
      !Array.isArray(parsed.foundations) || parsed.foundations.length !== 4 ||
      !Array.isArray(parsed.stock) || !Array.isArray(parsed.waste) || !Array.isArray(parsed.history)) throw Error('Invalid snapshot');
  const cards = [...parsed.stock, ...parsed.waste, ...parsed.tableau.flat(), ...parsed.foundations.flat()];
  if (cards.length !== 52 || new Set(cards.map(c => c.id)).size !== 52 ||
      cards.some(c => !suits.includes(c.suit) || c.rank < 1 || c.rank > 13 || c.id !== `${c.suit}${c.rank}`)) throw Error('Corrupt snapshot');
  if (![1, 3].includes(parsed.drawCount) || !Number.isSafeInteger(parsed.seed) ||
      !Number.isInteger(parsed.passes) || parsed.passes < 0 ||
      !Number.isInteger(parsed.moves) || parsed.moves < 0 ||
      (parsed.maxPasses !== null && (!Number.isInteger(parsed.maxPasses) || parsed.maxPasses < 0)) ||
      parsed.history.length > parsed.moves) throw Error('Corrupt options');
  for (const pile of parsed.foundations) {
    if (pile.some((c, i) => !c.up || c.rank !== i + 1 || c.suit !== pile[0]?.suit)) throw Error('Corrupt foundation');
  }
  const owners = parsed.foundations.filter(pile => pile.length).map(pile => pile[0].suit);
  if (new Set(owners).size !== owners.length) throw Error('Duplicate foundation suit');
  if (parsed.tableau.some(pile => pile.some((c, i) => i > 0 && pile[i - 1].up && !c.up))) throw Error('Corrupt tableau');
  return parsed;
}

/** A safe automatic finish never starts while stock/waste or face-down cards remain. */
export function canAutoFinish(state: State): boolean {
  return state.stock.length === 0 && state.waste.length === 0 &&
    state.tableau.every(pile => pile.every(card => card.up));
}

/** Applies legal foundation moves only when all remaining cards are visible. */
export function autoFinish(state: State): State {
  if (!canAutoFinish(state)) return copy(state);
  let current = state;
  for (let i = 0; i < 52; i++) {
    const move = legalMoves(current).find(m => (m.kind === 'waste' || m.kind === 'tableau') && m.to === 'foundation');
    if (!move) break;
    current = applyMove(current, move);
  }
  return current;
}
