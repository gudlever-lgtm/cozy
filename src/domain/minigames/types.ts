/** Stable contract every minigame implements, so new game types (puzzle, find-the-
 * difference, memory, ...) plug in without changing how the app drives them. */
export interface MinigameDefinition<TState, TMove> {
  readonly id: string;
  create(seed: number): TState;
  legalMoves(state: TState): TMove[];
  /** Illegal moves must return the same state reference, unchanged. */
  applyMove(state: TState, move: TMove): TState;
  isWon(state: TState): boolean;
  isLost(state: TState): boolean;
  /** A short, truthful explanation of what can be done right now (or why nothing can). */
  explain(state: TState): string;
}
