export type ResourceKey = string; // e.g. "lysglimt", "undoPoints"

export interface RewardEvent {
  /** Idempotency key. Applying the same id twice only pays out once. */
  readonly id: string;
  readonly reason: string;
  /** Positive amounts to add, per resource. */
  readonly grants: Readonly<Record<ResourceKey, number>>;
}

export interface SpendRequest {
  /** Idempotency key. Retrying the same id never charges twice. */
  readonly id: string;
  readonly reason: string;
  /** Positive amounts to deduct, per resource. */
  readonly costs: Readonly<Record<ResourceKey, number>>;
}

export interface LedgerTransaction {
  readonly id: string;
  readonly kind: "grant" | "spend";
  readonly reason: string;
  /** Signed deltas actually applied to each resource. */
  readonly changes: Readonly<Record<ResourceKey, number>>;
  readonly sequence: number;
}

export interface LedgerState {
  readonly balances: Readonly<Record<ResourceKey, number>>;
  readonly appliedEventIds: readonly string[];
  readonly transactions: readonly LedgerTransaction[];
  readonly sequence: number;
}

export interface SpendResult {
  readonly state: LedgerState;
  readonly ok: boolean;
  readonly reason?: string;
}
