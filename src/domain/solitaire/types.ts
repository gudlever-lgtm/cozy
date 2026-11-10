export type Suit = "clubs" | "diamonds" | "hearts" | "spades";
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type Color = "red" | "black";
export type DrawMode = 1 | 3;

export interface Card {
  readonly id: string;
  readonly suit: Suit;
  readonly rank: Rank;
  readonly faceUp: boolean;
}

export type Move =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "wasteToTableau"; toColumn: number }
  | { type: "wasteToFoundation" }
  | { type: "tableauToFoundation"; fromColumn: number }
  | { type: "tableauToTableau"; fromColumn: number; cardIndex: number; toColumn: number }
  | { type: "foundationToTableau"; suit: Suit; toColumn: number };

export interface GameState {
  readonly seed: number;
  readonly drawMode: DrawMode;
  readonly tableau: readonly Card[][];
  readonly foundations: Readonly<Record<Suit, readonly Card[]>>;
  readonly stock: readonly Card[];
  readonly waste: readonly Card[];
  readonly stockPasses: number;
  readonly moveCount: number;
  readonly score: number;
  readonly history: readonly Omit<GameState, "history">[];
}

export interface HintResult {
  readonly move: Move | null;
  readonly explanation: string;
}
