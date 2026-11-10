import assert from "node:assert/strict";
import test from "node:test";
import { createRewardLedgerStore } from "../../src/application/rewardLedgerStore";
import { grant as domainGrant } from "../../src/domain/rewards/ledger";
import { createLedger } from "../../src/domain/rewards/ledger";
import type { LedgerState } from "../../src/domain/rewards/types";
import type { RewardLedgerStorage } from "../../src/application/rewardLedgerStore";

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** In-memory fake — no AsyncStorage, no DOM, fully deterministic. `box` is the shared
 * "disk" so multiple store instances can simulate a restart against the same backing
 * value. */
function createFakeStorage(box: { value: LedgerState | null }): RewardLedgerStorage & { saveLog: LedgerState[] } {
  const saveLog: LedgerState[] = [];
  return {
    saveLog,
    async load() {
      return box.value;
    },
    async save(ledger) {
      box.value = ledger;
      saveLog.push(ledger);
    },
  };
}

test("never saves a fresh empty ledger before the existing save has loaded", async () => {
  const seeded = domainGrant(createLedger(), { id: "seed", reason: "seed", grants: { lysglimt: 50 } });
  const box = { value: seeded };
  const storage = createFakeStorage(box);

  const store = createRewardLedgerStore(storage);
  // Synchronously, right after construction, nothing must have been written yet —
  // in particular not an empty ledger overwriting the seeded save.
  assert.equal(storage.saveLog.length, 0);

  await store.ready();
  assert.equal(store.balance("lysglimt"), 50, "loaded the seeded balance, not a fresh empty ledger");
  // The box must still hold the seeded data (allowing the post-load persist(), which
  // re-saves the same data it just loaded — that's a no-op in substance, not data loss).
  assert.equal(box.value?.balances.lysglimt, 50);
});

test("mutations that happen before load resolves are kept, not discarded by the loaded snapshot", async () => {
  const seeded = domainGrant(createLedger(), { id: "seed", reason: "seed", grants: { lysglimt: 10 } });
  const box = { value: seeded };
  const storage = createFakeStorage(box);

  const store = createRewardLedgerStore(storage);
  // Grant before awaiting ready() — simulates a very early UI action racing the load.
  store.grant({ id: "early-grant", reason: "early", grants: { lysglimt: 5 } });
  await store.ready();

  assert.equal(store.balance("lysglimt"), 15, "pre-load mutation (5) was replayed on top of the loaded balance (10), not discarded by it");
});

test("restart recovers the exact persisted balance", async () => {
  const box = { value: null as LedgerState | null };
  const storeA = createRewardLedgerStore(createFakeStorage(box));
  await storeA.ready();

  storeA.grant({ id: "quest-1", reason: "Quest", grants: { lysglimt: 30 } });
  const spendResult = storeA.spend({ id: "buy-1", reason: "Buy", costs: { lysglimt: 10 } });
  assert.equal(spendResult.ok, true);
  await flush();

  // "Restart": a brand new store instance reading from the same backing storage.
  const storeB = createRewardLedgerStore(createFakeStorage(box));
  await storeB.ready();

  assert.equal(storeB.balance("lysglimt"), 20, "restart recovered the exact balance left by the previous session");
});

test("rapid back-to-back grant/spend calls never lose an update", async () => {
  const box = { value: null as LedgerState | null };
  const store = createRewardLedgerStore(createFakeStorage(box));
  await store.ready();

  // No awaits between these — the old React-state-closure implementation would have
  // let each call capture a stale `ledger` and lose all but the last one.
  store.grant({ id: "g1", reason: "g1", grants: { lysglimt: 10 } });
  store.grant({ id: "g2", reason: "g2", grants: { lysglimt: 20 } });
  const spend1 = store.spend({ id: "s1", reason: "s1", costs: { lysglimt: 5 } });
  store.grant({ id: "g3", reason: "g3", grants: { lysglimt: 7 } });

  assert.equal(spend1.ok, true);
  assert.equal(store.balance("lysglimt"), 10 + 20 - 5 + 7);
  assert.equal(store.getLedger().transactions.length, 4, "all four operations were recorded, none lost");
});

test("a duplicate grant (double payout attempt) only pays out once", async () => {
  const box = { value: null as LedgerState | null };
  const store = createRewardLedgerStore(createFakeStorage(box));
  await store.ready();

  const event = { id: "minigame:flower-match:session-1:win", reason: "Won", grants: { lysglimt: 25 } };
  store.grant(event);
  store.grant(event); // duplicate delivery / retried save
  store.grant(event); // a third retry, for good measure

  assert.equal(store.balance("lysglimt"), 25, "granted exactly once despite three calls with the same id");
  assert.equal(store.getLedger().transactions.length, 1);
});

test("a duplicate spend (retried purchase) only charges once", async () => {
  const box = { value: null as LedgerState | null };
  const store = createRewardLedgerStore(createFakeStorage(box));
  await store.ready();
  store.grant({ id: "seed", reason: "seed", grants: { lysglimt: 100 } });

  const request = { id: "buy:bench-1", reason: "Buy bench", costs: { lysglimt: 40 } };
  const first = store.spend(request);
  const second = store.spend(request);

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(store.balance("lysglimt"), 60, "charged exactly once despite the retry");
});

test("writes are serialized so the last issued save is the last to land, even out of order completion", async () => {
  const box = { value: null as LedgerState | null };
  const saveOrder: number[] = [];
  let callIndex = 0;
  const storage: RewardLedgerStorage = {
    async load() {
      return box.value;
    },
    async save(ledger) {
      const i = ++callIndex;
      // Make earlier-issued writes resolve LATER, to prove the chain (not real timing)
      // decides final storage order.
      await new Promise((resolve) => setTimeout(resolve, i === 1 ? 20 : 0));
      box.value = ledger;
      saveOrder.push(i);
    },
  };

  const store = createRewardLedgerStore(storage);
  await store.ready();
  store.grant({ id: "g1", reason: "g1", grants: { lysglimt: 1 } }); // issues write #1 (slow)
  store.grant({ id: "g2", reason: "g2", grants: { lysglimt: 2 } }); // issues write #2 (fast)
  await new Promise((resolve) => setTimeout(resolve, 50));

  // 3 writes total: the store's own post-load persist() of the (still-empty) ledger,
  // then one per grant() call.
  assert.deepEqual(saveOrder, [1, 2, 3], "writes landed in issue order despite write #1 being slower");
  assert.equal(box.value?.balances.lysglimt, 3, "final persisted value is the latest ledger, not an intermediate one");
});

test("subscribers are notified on grant and spend", async () => {
  const box = { value: null as LedgerState | null };
  const store = createRewardLedgerStore(createFakeStorage(box));
  await store.ready();

  let notifications = 0;
  const unsubscribe = store.subscribe(() => {
    notifications++;
  });

  store.grant({ id: "g1", reason: "g1", grants: { lysglimt: 5 } });
  store.spend({ id: "s1", reason: "s1", costs: { lysglimt: 1 } });
  const failedSpend = store.spend({ id: "s2", reason: "s2", costs: { lysglimt: 9999 } });

  assert.equal(failedSpend.ok, false);
  assert.equal(notifications, 2, "only successful mutations notify subscribers");
  unsubscribe();
});
