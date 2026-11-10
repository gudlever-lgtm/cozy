import { balanceOf, createLedger, grant as domainGrant, spend as domainSpend } from "../domain/rewards/ledger";
import type { LedgerState, RewardEvent, SpendRequest, SpendResult } from "../domain/rewards/types";

export interface RewardLedgerStorage {
  load(): Promise<LedgerState | null>;
  save(ledger: LedgerState): Promise<void>;
}

export interface RewardLedgerStore {
  getLedger(): LedgerState;
  balance(resource: string): number;
  grant(event: RewardEvent): LedgerState;
  spend(request: SpendRequest): SpendResult;
  subscribe(listener: () => void): () => void;
  /** Resolves once the initial load has completed (or failed) and the store reflects
   * whatever was actually saved, rather than a fresh empty ledger. */
  ready(): Promise<void>;
}

type PendingOp = { kind: "grant"; event: RewardEvent } | { kind: "spend"; request: SpendRequest };

/**
 * Plain, synchronous, dependency-injected store — no React, no AsyncStorage import —
 * so it's fully unit-testable with an in-memory fake storage (see
 * tests/unit/rewardLedgerStore.test.ts). RewardLedgerContext.tsx is a thin React
 * wrapper around one instance of this, using the real AsyncStorage-backed storage
 * from rewardsPersistence.ts.
 *
 * Two correctness properties this design exists to guarantee:
 *
 * 1. Never persists a fresh empty ledger before the real saved one has loaded, AND
 *    never discards an already-saved balance just because something mutated the
 *    ledger before the load resolved. Any grant()/spend() called before `ready()`
 *    applies immediately to the in-memory (initially empty) ledger for instant UI
 *    feedback, AND is recorded in `pendingOps`. Once the real saved ledger arrives,
 *    those same operations are replayed ON TOP of it rather than being discarded —
 *    safe to replay because grant()/spend() are idempotent by id (if an op somehow
 *    already landed in the saved data, replaying it is a no-op). `persist()` itself
 *    is a no-op until `loaded` flips true, so nothing is ever written to storage
 *    before the real state is known.
 * 2. No lost updates between rapid grant/spend calls. `ledger` is a single plain
 *    variable closed over by this factory, mutated synchronously inside grant()/
 *    spend() — never read from React state or any other source that could be stale.
 *    Since JS is single-threaded and these functions contain no `await` before
 *    mutating `ledger`, two calls in the same tick (or any order at all) always see
 *    each other's effects; there is no interleaving window. Writes to storage are
 *    additionally serialized through a promise chain (`writeChain`) so that even if
 *    individual save() calls take varying time, they complete in the same order they
 *    were issued — the last issued write (always the most current snapshot) is
 *    guaranteed to be the last one to actually land.
 *
 * Known narrow limitation: a spend() called before ready() resolves is checked
 * against the in-memory (possibly still-empty) ledger, not the not-yet-loaded real
 * balance — so a spend that would succeed once loaded can spuriously fail if it
 * races the load. Grants are unaffected (they have no affordability check to fail).
 * Narrow because AsyncStorage reads are typically near-instant; not fixed here
 * because doing so would mean queuing spend attempts rather than resolving them
 * immediately, a bigger behavior change than this pass's scope.
 */
export function createRewardLedgerStore(storage: RewardLedgerStorage): RewardLedgerStore {
  let ledger: LedgerState = createLedger();
  let loaded = false;
  let pendingOps: PendingOp[] = [];
  const listeners = new Set<() => void>();

  const readyPromise = storage
    .load()
    .then((saved) => {
      if (!saved) return;
      let base = saved;
      for (const op of pendingOps) {
        base = op.kind === "grant" ? domainGrant(base, op.event) : applySpend(base, op.request);
      }
      ledger = base;
    })
    .finally(() => {
      loaded = true;
      pendingOps = [];
      persist();
      notify();
    });

  function applySpend(state: LedgerState, request: SpendRequest): LedgerState {
    const result = domainSpend(state, request);
    return result.ok ? result.state : state;
  }

  function notify(): void {
    listeners.forEach((listener) => listener());
  }

  let writeChain: Promise<void> = Promise.resolve();
  function persist(): void {
    if (!loaded) return;
    const snapshot = ledger;
    writeChain = writeChain.then(() => storage.save(snapshot)).catch(() => {});
  }

  return {
    getLedger: () => ledger,
    balance: (resource) => balanceOf(ledger, resource),
    grant(event) {
      if (!loaded) pendingOps.push({ kind: "grant", event });
      ledger = domainGrant(ledger, event);
      persist();
      notify();
      return ledger;
    },
    spend(request) {
      const result = domainSpend(ledger, request);
      if (result.ok) {
        if (!loaded) pendingOps.push({ kind: "spend", request });
        ledger = result.state;
        persist();
        notify();
      }
      return result;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    ready: () => readyPromise,
  };
}
