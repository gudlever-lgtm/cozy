import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadRewardsSave, serializeRewardsSave, type RewardsSaveV1 } from "../persistence/rewardsSave";
import type { RewardLedgerStorage } from "./rewardLedgerStore";
import type { LedgerState } from "../domain/rewards/types";

const REWARDS_STORAGE_KEY = "cozy.rewards.v1";

/** Returns null when nothing has been saved yet, distinct from an empty ledger that
 * WAS saved — rewardLedgerStore.ts depends on that distinction to decide whether a
 * save is safe. */
export async function loadSavedLedgerRaw(): Promise<LedgerState | null> {
  try {
    const raw = await AsyncStorage.getItem(REWARDS_STORAGE_KEY);
    if (!raw) return null;
    return loadRewardsSave(JSON.parse(raw)).ledger;
  } catch {
    return null;
  }
}

export async function saveLedger(ledger: LedgerState): Promise<void> {
  try {
    const save: RewardsSaveV1 = { version: 1, ledger };
    await AsyncStorage.setItem(REWARDS_STORAGE_KEY, serializeRewardsSave(save));
  } catch {
    // ponytail: best-effort local save, same tradeoff as the other persistence modules.
  }
}

/** The real AsyncStorage-backed implementation of RewardLedgerStorage, used by
 * RewardLedgerContext.tsx. Tests use an in-memory fake instead (see
 * tests/unit/rewardLedgerStore.test.ts) — this file is intentionally the only place
 * that imports AsyncStorage, so the store logic itself never needs a DOM/RN runtime
 * to test. */
export const asyncStorageRewardLedgerStorage: RewardLedgerStorage = {
  load: loadSavedLedgerRaw,
  save: saveLedger,
};
