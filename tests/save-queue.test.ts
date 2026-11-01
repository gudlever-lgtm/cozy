import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  reward,
  saveQueue,
  SAVE_KEY,
  BACKUP_KEY,
  loadSave,
} from "../src/engine/save";
test("identical queued saves skip writes and backups use an injected interval", async () => {
  const data = new Map<string, string>(),
    writes: string[] = [];
  let time = 0;
  const storage = {
    getItem: async (k: string) => data.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      writes.push(k);
      data.set(k, v);
    },
  };
  const save = saveQueue(storage, { backupEveryMs: 30000, now: () => time });
  const initial = fresh("queue", "en");
  await Promise.all([save(initial), save(initial), save(initial)]);
  assert.deepEqual(writes, [BACKUP_KEY, SAVE_KEY]);
  const first = reward(initial, "tea", "first");
  time = 100;
  await save(first);
  assert.deepEqual(writes, [BACKUP_KEY, SAVE_KEY, SAVE_KEY]);
  assert.equal(JSON.parse(data.get(BACKUP_KEY)!).counters.tea, 0);
  time = 30001;
  const second = reward(first, "tea", "second");
  await save(second);
  assert.deepEqual(writes, [
    BACKUP_KEY,
    SAVE_KEY,
    SAVE_KEY,
    BACKUP_KEY,
    SAVE_KEY,
  ]);
  assert.equal(JSON.parse(data.get(BACKUP_KEY)!).counters.tea, 1);
  data.set(SAVE_KEY, "corrupt");
  const restored = await loadSave(storage, "new", "en");
  assert.equal(restored.recovered, true);
  assert.equal(restored.save.counters.tea, 1);
});
test("failed writes remain retryable and corrupt primaries preserve an existing backup", async () => {
  const good = JSON.stringify(fresh("safe", "en"));
  const data = new Map([
    [SAVE_KEY, "broken"],
    [BACKUP_KEY, good],
  ]);
  let fail = true;
  const storage = {
    getItem: async (k: string) => data.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      if (k === SAVE_KEY && fail) throw Error("full");
      data.set(k, v);
    },
  };
  const save = saveQueue(storage);
  const s = fresh("replacement", "en");
  await assert.rejects(save(s), /full/);
  assert.equal(data.get(BACKUP_KEY), good);
  fail = false;
  await save(s);
  assert.equal(data.get(SAVE_KEY), JSON.stringify(s));
  assert.equal(data.get(BACKUP_KEY), good);
});
