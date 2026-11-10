import assert from "node:assert/strict";
import test from "node:test";
import { balanceOf, createLedger, grant, spend } from "../../src/domain/rewards/ledger";
import { loadRewardsSave, parseRewardsSave, serializeRewardsSave } from "../../src/persistence/rewardsSave";
import type { RewardsSaveV1 } from "../../src/persistence/rewardsSave";

test("grant adds Lysglimt and other resources", () => {
  let ledger = createLedger();
  ledger = grant(ledger, { id: "quest:daily-1", reason: "Daily quest", grants: { lysglimt: 50, undoPoints: 1 } });
  assert.equal(balanceOf(ledger, "lysglimt"), 50);
  assert.equal(balanceOf(ledger, "undoPoints"), 1);
});

test("duplicate grant events are idempotent", () => {
  let ledger = createLedger();
  const event = { id: "achievement:first-win", reason: "First win", grants: { lysglimt: 20 } };
  ledger = grant(ledger, event);
  const afterFirst = ledger;
  ledger = grant(ledger, event); // retry / duplicate delivery
  assert.deepEqual(ledger, afterFirst);
  assert.equal(balanceOf(ledger, "lysglimt"), 20);
});

test("spend deducts resources and cannot go negative", () => {
  let ledger = createLedger();
  ledger = grant(ledger, { id: "g1", reason: "seed", grants: { lysglimt: 30 } });

  const ok = spend(ledger, { id: "buy:lantern", reason: "Buy lantern", costs: { lysglimt: 20 } });
  assert.equal(ok.ok, true);
  assert.equal(balanceOf(ok.state, "lysglimt"), 10);

  const insufficient = spend(ok.state, { id: "buy:fountain", reason: "Buy fountain", costs: { lysglimt: 999 } });
  assert.equal(insufficient.ok, false);
  assert.equal(insufficient.reason, "insufficient:lysglimt");
  assert.deepEqual(insufficient.state, ok.state, "failed spend must not mutate balances");
  assert.equal(balanceOf(insufficient.state, "lysglimt"), 10, "balance never goes negative");
});

test("duplicate spend requests are idempotent (retry never charges twice)", () => {
  let ledger = createLedger();
  ledger = grant(ledger, { id: "g1", reason: "seed", grants: { lysglimt: 30 } });

  const request = { id: "buy:bench", reason: "Buy bench", costs: { lysglimt: 15 } };
  const first = spend(ledger, request);
  assert.equal(first.ok, true);
  const second = spend(first.state, request); // retry of the same purchase
  assert.equal(second.ok, true);
  assert.deepEqual(second.state, first.state);
  assert.equal(balanceOf(second.state, "lysglimt"), 15, "only charged once despite the retry");
});

test("undo points are a resource independent of Lysglimt", () => {
  let ledger = createLedger();
  ledger = grant(ledger, { id: "quest:undo-reward", reason: "Quest reward", grants: { undoPoints: 3 } });
  const spent = spend(ledger, { id: "use:undo-1", reason: "Used an undo", costs: { undoPoints: 1 } });
  assert.equal(spent.ok, true);
  assert.equal(balanceOf(spent.state, "undoPoints"), 2);
  assert.equal(balanceOf(spent.state, "lysglimt"), 0, "spending undo points must not touch Lysglimt");
});

test("legacy flat-balance saves migrate deterministically to the versioned ledger", () => {
  const legacy = { balances: { lysglimt: 120, undoPoints: 2 } };
  const migratedOnce = loadRewardsSave(legacy);
  const migratedTwice = loadRewardsSave(legacy);
  assert.deepEqual(migratedOnce, migratedTwice, "migrating the same legacy save twice must be deterministic");
  assert.equal(migratedOnce.version, 1);
  assert.equal(migratedOnce.ledger.balances.lysglimt, 120);
  assert.equal(migratedOnce.ledger.balances.undoPoints, 2);
});

test("current-version saves pass through loadRewardsSave unchanged", () => {
  let ledger = createLedger();
  ledger = grant(ledger, { id: "g1", reason: "seed", grants: { lysglimt: 5 } });
  const save: RewardsSaveV1 = { version: 1, ledger };
  assert.deepEqual(loadRewardsSave(save), save);
});

test("unrecognized save formats are rejected rather than silently discarded", () => {
  assert.throws(() => loadRewardsSave({ version: 999, nonsense: true }));
});

test("save/load round-trips to an equal ledger", () => {
  let ledger = createLedger();
  ledger = grant(ledger, { id: "g1", reason: "seed", grants: { lysglimt: 40 } });
  ledger = spend(ledger, { id: "s1", reason: "spend", costs: { lysglimt: 10 } }).state;
  const save: RewardsSaveV1 = { version: 1, ledger };
  const restored = parseRewardsSave(serializeRewardsSave(save));
  assert.deepEqual(restored, save);
});
