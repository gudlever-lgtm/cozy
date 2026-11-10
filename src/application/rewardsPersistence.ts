import AsyncStorage from "@react-native-async-storage/async-storage";
import { createLedger } from "../domain/rewards/ledger";
import { loadRewardsSave, serializeRewardsSave, type RewardsSaveV1 } from "../persistence/rewardsSave";
import type { LedgerState } from "../domain/rewards/types";

const REWARDS_STORAGE_KEY = "cozy.rewards.v1";

export async function loadSavedLedger(): Promise<LedgerState> {
  try {
    const raw = await AsyncStorage.getItem(REWARDS_STORAGE_KEY);
    if (!raw) return createLedger();
    return loadRewardsSave(JSON.parse(raw)).ledger;
  } catch {
    return createLedger();
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
