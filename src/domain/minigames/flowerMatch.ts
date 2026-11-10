import { createRng, shuffle } from "../solitaire/rng";
import type { MinigameDefinition } from "./types";

export type FlowerSymbol = string;

const DEFAULT_SYMBOLS: readonly FlowerSymbol[] = [
  "rose",
  "tulip",
  "daisy",
  "sunflower",
  "lily",
  "peony",
  "iris",
  "poppy",
];

export type TileState = "hidden" | "revealed" | "matched";

export interface FlowerTile {
  readonly id: number;
  readonly symbol: FlowerSymbol;
  readonly state: TileState;
}

export interface FlowerMatchState {
  readonly seed: number;
  readonly tiles: readonly FlowerTile[];
  /** Indices of tiles currently face-up but not yet matched (0, 1, or 2 entries). */
  readonly revealed: readonly number[];
  readonly matchesFound: number;
  readonly moveCount: number;
}

export type FlowerMatchMove = { type: "reveal"; tileIndex: number } | { type: "resolveMismatch" };

export function createFlowerMatch(seed: number, pairCount = 8): FlowerMatchState {
  const symbols = DEFAULT_SYMBOLS.slice(0, Math.min(pairCount, DEFAULT_SYMBOLS.length));
  const rng = createRng(seed);
  const deck = shuffle([...symbols, ...symbols], rng);
  return {
    seed,
    tiles: deck.map((symbol, id) => ({ id, symbol, state: "hidden" })),
    revealed: [],
    matchesFound: 0,
    moveCount: 0,
  };
}

function hasPendingMismatch(state: FlowerMatchState): boolean {
  return state.revealed.length === 2;
}

export function legalMoves(state: FlowerMatchState): FlowerMatchMove[] {
  if (isWon(state)) return [];
  if (hasPendingMismatch(state)) return [{ type: "resolveMismatch" }];
  return state.tiles.filter((t) => t.state === "hidden").map((t) => ({ type: "reveal", tileIndex: t.id }));
}

function isLegal(state: FlowerMatchState, move: FlowerMatchMove): boolean {
  return legalMoves(state).some((m) => JSON.stringify(m) === JSON.stringify(move));
}

export function applyMove(state: FlowerMatchState, move: FlowerMatchMove): FlowerMatchState {
  if (!isLegal(state, move)) return state;

  if (move.type === "resolveMismatch") {
    const tiles = state.tiles.map((t) => (state.revealed.includes(t.id) ? { ...t, state: "hidden" as const } : t));
    return { ...state, tiles, revealed: [], moveCount: state.moveCount + 1 };
  }

  const tiles = state.tiles.map((t) => (t.id === move.tileIndex ? { ...t, state: "revealed" as const } : t));
  const revealed = [...state.revealed, move.tileIndex];

  if (revealed.length < 2) {
    return { ...state, tiles, revealed, moveCount: state.moveCount + 1 };
  }

  const [a, b] = revealed;
  const matched = tiles[a].symbol === tiles[b].symbol;
  if (!matched) {
    return { ...state, tiles, revealed, moveCount: state.moveCount + 1 };
  }
  const matchedTiles = tiles.map((t) => (revealed.includes(t.id) ? { ...t, state: "matched" as const } : t));
  return { ...state, tiles: matchedTiles, revealed: [], matchesFound: state.matchesFound + 1, moveCount: state.moveCount + 1 };
}

export function isWon(state: FlowerMatchState): boolean {
  return state.matchesFound * 2 === state.tiles.length;
}

export function isLost(_state: FlowerMatchState): boolean {
  return false; // Flower Match has no losing condition, only progress toward completion.
}

export function explain(state: FlowerMatchState): string {
  if (isWon(state)) return "All flower pairs are matched. You won!";
  if (hasPendingMismatch(state)) return "Those two don't match. Resolve them to flip the tiles back down.";
  return "Pick a hidden tile to reveal.";
}

export const flowerMatchDefinition: MinigameDefinition<FlowerMatchState, FlowerMatchMove> = {
  id: "flower-match",
  create: createFlowerMatch,
  legalMoves,
  applyMove,
  isWon,
  isLost,
  explain,
};
