import type { GameState as SolitaireState } from "../domain/solitaire/types";

export type ActiveScreen = "solitaire" | "minigame" | "garden" | "menu";

export interface AppSession {
  readonly active: ActiveScreen;
  readonly solitaire: SolitaireState | null;
  readonly minigame: { readonly id: string; readonly state: unknown } | null;
}

/** Switches the active screen without touching solitaire or minigame progress, so
 * leaving Solitaire for a minigame (or the garden) and coming back never discards the deal. */
export function switchTo(session: AppSession, active: ActiveScreen): AppSession {
  return { ...session, active };
}
