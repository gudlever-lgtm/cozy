import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { balanceOf, createLedger, grant as domainGrant, spend as domainSpend } from "../../domain/rewards/ledger";
import { loadSavedLedger, saveLedger } from "../../application/rewardsPersistence";
import type { LedgerState, RewardEvent, SpendRequest, SpendResult } from "../../domain/rewards/types";

interface RewardLedgerContextValue {
  ledger: LedgerState;
  balance: (resource: string) => number;
  grant: (event: RewardEvent) => void;
  spend: (request: SpendRequest) => SpendResult;
}

const RewardLedgerContext = createContext<RewardLedgerContextValue | null>(null);

/**
 * Real RewardLedger (src/domain/rewards) wired to AsyncStorage, shared by any screen
 * that displays or spends Lysglimt. The HUD reads actual persisted balances instead of
 * a hardcoded display value; no gameplay yet grants Lysglimt (that's Stage 5.4 quest/
 * minigame wiring), so a fresh install legitimately shows 0 — but it's 0 because the
 * ledger is empty, not because the number is hardcoded.
 */
export function RewardLedgerProvider({ children }: { children: React.ReactNode }) {
  const [ledger, setLedger] = useState<LedgerState>(createLedger());

  useEffect(() => {
    loadSavedLedger().then(setLedger);
  }, []);

  useEffect(() => {
    saveLedger(ledger);
  }, [ledger]);

  const value = useMemo<RewardLedgerContextValue>(
    () => ({
      ledger,
      balance: (resource) => balanceOf(ledger, resource),
      grant: (event) => setLedger((current) => domainGrant(current, event)),
      spend: (request) => {
        const result = domainSpend(ledger, request);
        if (result.ok) setLedger(result.state);
        return result;
      },
    }),
    [ledger],
  );

  return <RewardLedgerContext.Provider value={value}>{children}</RewardLedgerContext.Provider>;
}

export function useRewardLedger(): RewardLedgerContextValue {
  const ctx = useContext(RewardLedgerContext);
  if (!ctx) throw new Error("useRewardLedger must be used within a RewardLedgerProvider");
  return ctx;
}
