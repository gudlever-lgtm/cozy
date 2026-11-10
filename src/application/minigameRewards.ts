import { grant } from "../domain/rewards/ledger";
import type { LedgerState } from "../domain/rewards/types";
import type { MinigameDefinition } from "../domain/minigames/types";

export interface MinigameRewardResult {
  readonly ledger: LedgerState;
  /** True only if this call actually paid out (a genuinely new win), false if the
   * game isn't won yet or this exact win event was already rewarded. */
  readonly rewarded: boolean;
}

/** Grants a minigame's win reward exactly once per play session. sessionId must uniquely
 * identify one playthrough; calling this again for the same session (duplicate win event,
 * app restart replay, etc.) never pays out twice. */
export function completeMinigame<TState>(
  ledger: LedgerState,
  definition: MinigameDefinition<TState, unknown>,
  state: TState,
  sessionId: string,
  rewardGrants: Readonly<Record<string, number>>,
): MinigameRewardResult {
  if (!definition.isWon(state)) return { ledger, rewarded: false };

  const eventId = `minigame:${definition.id}:${sessionId}:win`;
  const next = grant(ledger, { id: eventId, reason: `Won ${definition.id}`, grants: rewardGrants });
  return { ledger: next, rewarded: next !== ledger };
}
