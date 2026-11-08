import assert from "node:assert/strict";
import test from "node:test";
import { fresh, migrate, reward } from "../src/engine/save";
import { claimQuest, gameReward } from "../src/engine/world";
import { finishMini, miniPair } from "../src/engine/miniProgress";

test("a minigame reward survives saving and never pays out twice", () => {
  const initial = fresh("mini-reward", "da");
  const first = reward(initial, "match", "pair:0:0", 1);
  const again = reward(first, "match", "pair:0:0", 1);
  assert.equal(again, first);
  assert.equal(first.counters.match, 1);
  assert.equal(first.economy.wallet.glimmers, gameReward("match", 1).glimmers);
  const restored = migrate(JSON.stringify(first), "restored", "da");
  assert.equal(restored.economy.wallet.glimmers, first.economy.wallet.glimmers);
  assert.equal(restored.counters.match, 1);
  assert.equal(reward(restored, "match", "pair:0:0", 1), restored);
});

test("claiming a ready quest pays out exactly once and preserves completion", () => {
  const save = fresh("quest-claim", "en");
  const eligibleCounters = { ...save.counters, match: 1 };
  const claimed = claimQuest(save.economy, save.completed, "millie1", eligibleCounters);
  assert.ok(claimed.completed.includes("millie1"));
  assert.equal(claimed.economy.wallet.glimmers, 25);
  const repeated = claimQuest(claimed.economy, claimed.completed, "millie1", eligibleCounters);
  assert.equal(repeated.economy, claimed.economy);
  assert.equal(repeated.completed, claimed.completed);
});

test("locked quest cannot grant resources before prerequisite completion", () => {
  const save = fresh("quest-locked", "da");
  const before = claimQuest(save.economy, save.completed, "millie2", save.counters);
  assert.equal(before.economy, save.economy);
  assert.equal(before.completed, save.completed);
});

test("minigame slots finish only once, advancing the pair only when both complete", () => {
  const save = fresh("mini-pair", "en");
  const slots = miniPair();
  assert.equal(slots.length, 2);
  const first = finishMini(save.miniProgress, slots[0].session.id);
  assert.equal(first.round, 0);
  assert.equal(finishMini(first, slots[0].session.id), first);
  const second = finishMini(first, slots[1].session.id);
  assert.equal(second.round, 1);
  assert.equal(second.slots.length, 2);
});
