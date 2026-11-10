import type { LedgerState, RewardEvent, SpendRequest, SpendResult } from "./types";

export function createLedger(): LedgerState {
  return { balances: {}, appliedEventIds: [], transactions: [], sequence: 0 };
}

// ponytail: array + includes for idempotency lookups — O(n) per check, fine for a
// single player's lifetime ledger. Swap for a Set-backed index if this ever shows up in a profile.
function alreadyApplied(state: LedgerState, id: string): boolean {
  return state.appliedEventIds.includes(id);
}

function assertPositiveAmounts(amounts: Readonly<Record<string, number>>, label: string): void {
  for (const [resource, amount] of Object.entries(amounts)) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error(`${label}: amount for "${resource}" must be a positive integer, got ${amount}`);
    }
  }
}

/** Grants currency/resources from an achievement, quest or minigame win. Idempotent: the
 * same event.id applied twice (duplicate event, retried save, etc.) only pays out once. */
export function grant(state: LedgerState, event: RewardEvent): LedgerState {
  if (alreadyApplied(state, event.id)) return state;
  assertPositiveAmounts(event.grants, `reward event "${event.id}"`);

  const balances = { ...state.balances };
  for (const [resource, amount] of Object.entries(event.grants)) {
    balances[resource] = (balances[resource] ?? 0) + amount;
  }
  const sequence = state.sequence + 1;
  return {
    balances,
    appliedEventIds: [...state.appliedEventIds, event.id],
    transactions: [
      ...state.transactions,
      { id: event.id, kind: "grant", reason: event.reason, changes: event.grants, sequence },
    ],
    sequence,
  };
}

/** Spends resources (e.g. buying a decoration, using an undo point). Atomic: either every
 * cost is affordable and all are deducted, or nothing changes and balances never go negative.
 * Idempotent: retrying a request.id that already succeeded returns the same resulting state
 * without charging again. */
export function spend(state: LedgerState, request: SpendRequest): SpendResult {
  if (alreadyApplied(state, request.id)) return { state, ok: true };
  assertPositiveAmounts(request.costs, `spend request "${request.id}"`);

  for (const [resource, amount] of Object.entries(request.costs)) {
    if ((state.balances[resource] ?? 0) < amount) {
      return { state, ok: false, reason: `insufficient:${resource}` };
    }
  }

  const balances = { ...state.balances };
  const changes: Record<string, number> = {};
  for (const [resource, amount] of Object.entries(request.costs)) {
    balances[resource] = (balances[resource] ?? 0) - amount;
    changes[resource] = -amount;
  }
  const sequence = state.sequence + 1;
  return {
    ok: true,
    state: {
      balances,
      appliedEventIds: [...state.appliedEventIds, request.id],
      transactions: [...state.transactions, { id: request.id, kind: "spend", reason: request.reason, changes, sequence }],
      sequence,
    },
  };
}

export function balanceOf(state: LedgerState, resource: string): number {
  return state.balances[resource] ?? 0;
}
