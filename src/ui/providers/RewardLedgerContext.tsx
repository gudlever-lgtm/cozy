import React, { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { createRewardLedgerStore, type RewardLedgerStore } from "../../application/rewardLedgerStore";
import { asyncStorageRewardLedgerStorage } from "../../application/rewardsPersistence";
import type { LedgerState, RewardEvent, SpendRequest, SpendResult } from "../../domain/rewards/types";

interface RewardLedgerContextValue {
  ledger: LedgerState;
  balance: (resource: string) => number;
  grant: (event: RewardEvent) => void;
  spend: (request: SpendRequest) => SpendResult;
}

const RewardLedgerContext = createContext<RewardLedgerStore | null>(null);

/**
 * Real RewardLedger (src/domain/rewards) wired to AsyncStorage, shared by any screen
 * that displays or spends Lysglimt. The actual store logic lives in
 * rewardLedgerStore.ts (plain TS, no React) — this component only creates one
 * instance per app lifetime and subscribes to it via useSyncExternalStore, which is
 * React's own mechanism for an external mutable store (handles re-render timing
 * correctly without this component needing its own race-prone state juggling).
 *
 * The HUD reads actual persisted balances instead of a hardcoded display value; no
 * gameplay yet grants Lysglimt outside minigames/quests, so a fresh install
 * legitimately shows 0 — but it's 0 because the ledger is empty, not hardcoded.
 */
export function RewardLedgerProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo(() => createRewardLedgerStore(asyncStorageRewardLedgerStorage), []);
  return <RewardLedgerContext.Provider value={store}>{children}</RewardLedgerContext.Provider>;
}

export function useRewardLedger(): RewardLedgerContextValue {
  const store = useContext(RewardLedgerContext);
  if (!store) throw new Error("useRewardLedger must be used within a RewardLedgerProvider");

  const ledger = useSyncExternalStore(store.subscribe, store.getLedger);

  return useMemo(
    () => ({
      ledger,
      balance: (resource: string) => store.balance(resource),
      grant: (event: RewardEvent) => {
        store.grant(event);
      },
      spend: (request: SpendRequest) => store.spend(request),
    }),
    [ledger, store],
  );
}
