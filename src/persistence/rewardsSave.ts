import { createLedger } from "../domain/rewards/ledger";
import type { LedgerState } from "../domain/rewards/types";

export const REWARDS_SAVE_VERSION = 1 as const;

export interface RewardsSaveV1 {
  readonly version: 1;
  readonly ledger: LedgerState;
}

/** Pre-ledger save shape: a bare resource -> balance map, no version field, no audit trail. */
interface LegacyRewardsSave {
  readonly balances: Readonly<Record<string, number>>;
}

function isLegacy(raw: unknown): raw is LegacyRewardsSave {
  return (
    typeof raw === "object" &&
    raw !== null &&
    !("version" in raw) &&
    "balances" in raw &&
    typeof (raw as LegacyRewardsSave).balances === "object"
  );
}

function isV1(raw: unknown): raw is RewardsSaveV1 {
  return typeof raw === "object" && raw !== null && (raw as RewardsSaveV1).version === 1;
}

/** Deterministic: the same legacy balances always migrate to the same ledger (transactions
 * are synthesized with stable, sorted ids), so migrating twice never changes the result. */
function migrateLegacyToV1(legacy: LegacyRewardsSave): RewardsSaveV1 {
  let ledger = createLedger();
  const resources = Object.keys(legacy.balances).sort();
  for (const resource of resources) {
    const amount = legacy.balances[resource];
    if (amount <= 0) continue;
    const balances = { ...ledger.balances, [resource]: amount };
    const sequence = ledger.sequence + 1;
    ledger = {
      balances,
      appliedEventIds: [...ledger.appliedEventIds, `legacy-import:${resource}`],
      transactions: [
        ...ledger.transactions,
        { id: `legacy-import:${resource}`, kind: "grant", reason: "Imported from legacy save", changes: { [resource]: amount }, sequence },
      ],
      sequence,
    };
  }
  return { version: 1, ledger };
}

/** Loads any known rewards save shape, migrating forward to the current version. Throws on
 * a shape this build does not recognize, rather than silently discarding progress. */
export function loadRewardsSave(raw: unknown): RewardsSaveV1 {
  if (isV1(raw)) return raw;
  if (isLegacy(raw)) return migrateLegacyToV1(raw);
  throw new Error("Unrecognized rewards save format");
}

export function serializeRewardsSave(save: RewardsSaveV1): string {
  return JSON.stringify(save);
}

export function parseRewardsSave(json: string): RewardsSaveV1 {
  return loadRewardsSave(JSON.parse(json));
}
