import { createRng, shuffle } from "./rng";
import type { Card, DrawMode, GameState, HintResult, Move, Rank, Suit } from "./types";

const SUITS: readonly Suit[] = ["clubs", "diamonds", "hearts", "spades"];
const RANKS: readonly Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function color(suit: Suit): "red" | "black" {
  return suit === "diamonds" || suit === "hearts" ? "red" : "black";
}

function freshDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${suit}-${rank}`, suit, rank, faceUp: false });
    }
  }
  return deck;
}

/** Deals a fresh, legal Klondike game from a seed. Same seed => identical deal. */
export function deal(seed: number, drawMode: DrawMode = 1): GameState {
  const rng = createRng(seed);
  const deck = shuffle(freshDeck(), rng);

  const tableau: Card[][] = [[], [], [], [], [], [], []];
  let cursor = 0;
  for (let col = 0; col < 7; col++) {
    for (let i = 0; i <= col; i++) {
      const card = deck[cursor++];
      const faceUp = i === col;
      tableau[col].push({ ...card, faceUp });
    }
  }
  const stock = deck.slice(cursor).map((c) => ({ ...c, faceUp: false }));

  return {
    seed,
    drawMode,
    tableau,
    foundations: { clubs: [], diamonds: [], hearts: [], spades: [] },
    stock,
    waste: [],
    stockPasses: 0,
    moveCount: 0,
    score: 0,
    history: [],
  };
}

function topOf<T>(pile: readonly T[]): T | undefined {
  return pile[pile.length - 1];
}

function canPlaceOnTableau(card: Card, target: readonly Card[]): boolean {
  const top = topOf(target);
  if (!top) return card.rank === 13;
  return top.faceUp && top.rank === card.rank + 1 && color(top.suit) !== color(card.suit);
}

function canPlaceOnFoundation(card: Card, foundation: readonly Card[]): boolean {
  const top = topOf(foundation);
  if (!top) return card.rank === 1;
  return top.suit === card.suit && top.rank === card.rank - 1;
}

/** A face-up run starting at cardIndex is movable together only if it is a valid
 * descending, alternating-color sequence down to the top of the pile. */
function isMovableRun(column: readonly Card[], cardIndex: number): boolean {
  if (cardIndex < 0 || cardIndex >= column.length) return false;
  if (!column[cardIndex].faceUp) return false;
  for (let i = cardIndex; i < column.length - 1; i++) {
    const a = column[i];
    const b = column[i + 1];
    if (a.rank !== b.rank + 1 || color(a.suit) === color(b.suit)) return false;
  }
  return true;
}

function snapshotForHistory(state: GameState): Omit<GameState, "history"> {
  const { history, ...rest } = state;
  return clone(rest);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function pushHistory(state: GameState): readonly Omit<GameState, "history">[] {
  return [...state.history, snapshotForHistory(state)];
}

export function legalMoves(state: GameState): Move[] {
  const moves: Move[] = [];

  if (state.stock.length > 0) {
    moves.push({ type: "draw" });
  } else if (state.waste.length > 0) {
    moves.push({ type: "recycle" });
  }

  const wasteTop = topOf(state.waste);
  if (wasteTop) {
    if (canPlaceOnFoundation(wasteTop, state.foundations[wasteTop.suit])) {
      moves.push({ type: "wasteToFoundation" });
    }
    for (let col = 0; col < 7; col++) {
      if (canPlaceOnTableau(wasteTop, state.tableau[col])) {
        moves.push({ type: "wasteToTableau", toColumn: col });
      }
    }
  }

  for (let col = 0; col < 7; col++) {
    const column = state.tableau[col];
    const top = topOf(column);
    if (top && top.faceUp && canPlaceOnFoundation(top, state.foundations[top.suit])) {
      moves.push({ type: "tableauToFoundation", fromColumn: col });
    }
    for (let idx = 0; idx < column.length; idx++) {
      if (!isMovableRun(column, idx)) continue;
      const card = column[idx];
      for (let dest = 0; dest < 7; dest++) {
        if (dest === col) continue;
        if (canPlaceOnTableau(card, state.tableau[dest])) {
          moves.push({ type: "tableauToTableau", fromColumn: col, cardIndex: idx, toColumn: dest });
        }
      }
    }
  }

  for (const suit of SUITS) {
    const top = topOf(state.foundations[suit]);
    if (!top) continue;
    for (let dest = 0; dest < 7; dest++) {
      if (canPlaceOnTableau(top, state.tableau[dest])) {
        moves.push({ type: "foundationToTableau", suit, toColumn: dest });
      }
    }
  }

  return moves;
}

function movesEqual(a: Move, b: Move): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isLegal(state: GameState, move: Move): boolean {
  return legalMoves(state).some((m) => movesEqual(m, move));
}

/** Applies a move, returning a new state. Illegal moves return the SAME
 * reference unchanged (no mutation, no partial application). */
export function applyMove(state: GameState, move: Move): GameState {
  if (!isLegal(state, move)) return state;

  const history = pushHistory(state);
  const base = { ...state, history, moveCount: state.moveCount + 1 };

  switch (move.type) {
    case "draw": {
      const count = Math.min(state.drawMode, state.stock.length);
      const drawn = state.stock.slice(-count).reverse().map((c) => ({ ...c, faceUp: true }));
      return {
        ...base,
        stock: state.stock.slice(0, state.stock.length - count),
        waste: [...state.waste, ...drawn],
      };
    }
    case "recycle": {
      const restocked = state.waste.slice().reverse().map((c) => ({ ...c, faceUp: false }));
      return {
        ...base,
        stock: restocked,
        waste: [],
        stockPasses: state.stockPasses + 1,
      };
    }
    case "wasteToFoundation": {
      const card = topOf(state.waste)!;
      return {
        ...base,
        waste: state.waste.slice(0, -1),
        foundations: { ...state.foundations, [card.suit]: [...state.foundations[card.suit], card] },
        score: state.score + 10,
      };
    }
    case "wasteToTableau": {
      const card = topOf(state.waste)!;
      const tableau = state.tableau.slice();
      tableau[move.toColumn] = [...tableau[move.toColumn], card];
      return { ...base, waste: state.waste.slice(0, -1), tableau };
    }
    case "tableauToFoundation": {
      const column = state.tableau[move.fromColumn];
      const card = topOf(column)!;
      const tableau = state.tableau.slice();
      tableau[move.fromColumn] = revealTop(column.slice(0, -1));
      return {
        ...base,
        tableau,
        foundations: { ...state.foundations, [card.suit]: [...state.foundations[card.suit], card] },
        score: state.score + 10,
      };
    }
    case "tableauToTableau": {
      const from = state.tableau[move.fromColumn];
      const moving = from.slice(move.cardIndex);
      const tableau = state.tableau.slice();
      tableau[move.fromColumn] = revealTop(from.slice(0, move.cardIndex));
      tableau[move.toColumn] = [...tableau[move.toColumn], ...moving];
      return { ...base, tableau };
    }
    case "foundationToTableau": {
      const pile = state.foundations[move.suit];
      const card = topOf(pile)!;
      const tableau = state.tableau.slice();
      tableau[move.toColumn] = [...tableau[move.toColumn], card];
      return {
        ...base,
        tableau,
        foundations: { ...state.foundations, [move.suit]: pile.slice(0, -1) },
        score: state.score - 10,
      };
    }
  }
}

function revealTop(column: Card[]): Card[] {
  if (column.length === 0) return column;
  const result = column.slice();
  const lastIdx = result.length - 1;
  if (!result[lastIdx].faceUp) result[lastIdx] = { ...result[lastIdx], faceUp: true };
  return result;
}

/** Restores the exact prior state. No-op (returns same reference) if there is nothing to undo. */
export function undo(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const previous = state.history[state.history.length - 1];
  return { ...previous, history: state.history.slice(0, -1) };
}

export function isWon(state: GameState): boolean {
  return SUITS.every((suit) => state.foundations[suit].length === 13);
}

/** A card is "safe" to auto-send to its foundation only once no tableau build could
 * possibly still need it: both opposite-color foundations are already at rank-1 or higher. */
function isSafeToAutoPlay(card: Card, state: GameState): boolean {
  if (card.rank <= 2) return true;
  const opposite: Suit[] = color(card.suit) === "red" ? ["clubs", "spades"] : ["diamonds", "hearts"];
  return opposite.every((suit) => (topOf(state.foundations[suit])?.rank ?? 0) >= card.rank - 1);
}

/** Repeatedly applies any currently safe foundation move until none remain. */
export function autoPlaySafe(state: GameState): GameState {
  let current = state;
  for (;;) {
    const wasteTop = topOf(current.waste);
    if (wasteTop && canPlaceOnFoundation(wasteTop, current.foundations[wasteTop.suit]) && isSafeToAutoPlay(wasteTop, current)) {
      current = applyMove(current, { type: "wasteToFoundation" });
      continue;
    }
    const col = current.tableau.findIndex((column) => {
      const top = topOf(column);
      return top && top.faceUp && canPlaceOnFoundation(top, current.foundations[top.suit]) && isSafeToAutoPlay(top, current);
    });
    if (col >= 0) {
      current = applyMove(current, { type: "tableauToFoundation", fromColumn: col });
      continue;
    }
    return current;
  }
}

export function hint(state: GameState): HintResult {
  if (isWon(state)) return { move: null, explanation: "The game is already won." };
  const moves = legalMoves(state);
  const foundationMove = moves.find((m) => m.type === "wasteToFoundation" || m.type === "tableauToFoundation");
  if (foundationMove) return { move: foundationMove, explanation: "Move this card to its foundation." };
  const tableauMove = moves.find((m) => m.type === "tableauToTableau" || m.type === "wasteToTableau");
  if (tableauMove) return { move: tableauMove, explanation: "This card can be placed on the tableau." };
  const drawMove = moves.find((m) => m.type === "draw" || m.type === "recycle");
  if (drawMove) return { move: drawMove, explanation: "No board move is available; draw or recycle the stock." };
  return { move: null, explanation: "No legal move is available. The game may be stuck." };
}

export function snapshot(state: GameState): string {
  return JSON.stringify(state);
}

export function loadSnapshot(json: string): GameState {
  return JSON.parse(json) as GameState;
}
