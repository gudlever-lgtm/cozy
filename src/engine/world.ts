export type Resource = "glimmers" | "wood" | "stone" | "flowers" | "seeds";
export type Wallet = Record<Resource, number>;
export type Economy = {
  wallet: Wallet;
  receipts: string[];
  inventory: string[];
};
export const REWARDS = {
  solitaire: 60,
  match: 20,
  hidden: 20,
  tea: 20,
  quest: 25,
  achievement: 40,
  daily: 10,
} as const;
export function transact(
  e: Economy,
  id: string,
  delta: Partial<Wallet>,
  item?: string,
): Economy {
  if (!id || e.receipts.includes(id)) return e;
  if (Object.values(delta).some((n) => !Number.isSafeInteger(n)))
    throw Error("invalidTransaction");
  const wallet = { ...e.wallet };
  for (const r of Object.keys(delta) as Resource[]) {
    wallet[r] += delta[r]!;
    if (!Number.isSafeInteger(wallet[r]) || wallet[r] < 0)
      throw Error("insufficient");
  }
  return {
    wallet,
    receipts: [...e.receipts, id],
    inventory: item ? [...new Set([...e.inventory, item])] : e.inventory,
  };
}
export const upgrades = [
  { id: "flowers", cost: 20, wood: 0, icon: "🌷", x: 20, y: 72 },
  { id: "bench", cost: 30, wood: 2, icon: "🪑", x: 68, y: 72 },
  { id: "bridge", cost: 40, wood: 4, icon: "🌉", x: 80, y: 48 },
  { id: "lantern", cost: 20, wood: 0, icon: "🏮", x: 45, y: 62 },
  { id: "forest", cost: 50, wood: 2, icon: "🌲", x: 88, y: 28 },
  { id: "cards", cost: 25, wood: 0, icon: "✿", x: 35, y: 80 },
] as const;
export type UpgradeId = (typeof upgrades)[number]["id"];
export type Placement = { id: UpgradeId; x: number; y: number };
export function place(
  owned: string[],
  placements: Placement[],
  p: Placement,
): Placement[] {
  if (
    !owned.includes(p.id) ||
    !Number.isFinite(p.x) ||
    !Number.isFinite(p.y) ||
    p.x < 5 ||
    p.x > 95 ||
    p.y < 10 ||
    p.y > 90
  )
    throw Error("invalidPlacement");
  return [...placements.filter((x) => x.id !== p.id), p];
}
export type Counters = {
  solitaire: number;
  match: number;
  hidden: number;
  tea: number;
  gather: number;
};
export const quests = [
  {
    id: "millie1",
    npc: "millie",
    requires: [],
    objectives: [{ type: "match", count: 1 }],
    reward: { glimmers: 25, seeds: 3 },
  },
  {
    id: "millie2",
    npc: "millie",
    requires: ["millie1"],
    objectives: [{ type: "upgrade", item: "flowers", count: 1 }],
    reward: { glimmers: 25, flowers: 5 },
  },
  {
    id: "marmalade1",
    npc: "marmalade",
    requires: [],
    objectives: [{ type: "tea", count: 1 }],
    reward: { glimmers: 25, wood: 2 },
  },
  {
    id: "marmalade2",
    npc: "marmalade",
    requires: ["marmalade1"],
    objectives: [
      { type: "upgrade", item: "bench", count: 1 },
      { type: "upgrade", item: "lantern", count: 1 },
    ],
    reward: { glimmers: 40, stone: 3 },
  },
  {
    id: "pip1",
    npc: "pip",
    requires: [],
    objectives: [
      { type: "hidden", count: 1 },
      { type: "gather", count: 2 },
    ],
    reward: { glimmers: 25, wood: 4 },
  },
  {
    id: "pip2",
    npc: "pip",
    requires: ["pip1"],
    objectives: [
      { type: "upgrade", item: "bridge", count: 1 },
      { type: "upgrade", item: "forest", count: 1 },
    ],
    reward: { glimmers: 50, stone: 5 },
  },
] as const;
export function questProgress(
  id: string,
  c: Counters,
  owned: string[],
): { done: number; total: number } {
  const q = quests.find((q) => q.id === id)!;
  let done = 0,
    total = 0;
  for (const o of q.objectives) {
    total += o.count;
    done +=
      o.type === "upgrade"
        ? Number(owned.includes(o.item))
        : Math.min(o.count, c[o.type]);
  }
  return { done, total };
}
export function claimQuest(
  e: Economy,
  completed: string[],
  id: string,
  c: Counters,
): { economy: Economy; completed: string[] } {
  const q = quests.find((q) => q.id === id);
  if (
    !q ||
    completed.includes(id) ||
    !q.requires.every((x) => completed.includes(x))
  )
    return { economy: e, completed };
  const p = questProgress(id, c, e.inventory);
  if (p.done !== p.total) return { economy: e, completed };
  return {
    economy: transact(e, `quest:${id}`, q.reward),
    completed: [...completed, id],
  };
}
export type Season = "spring" | "summer" | "autumn" | "winter";
export const seasonAt = (date: Date): Season => {
  const m = date.getMonth();
  return m >= 2 && m <= 4
    ? "spring"
    : m >= 5 && m <= 7
      ? "summer"
      : m >= 8 && m <= 10
        ? "autumn"
        : "winter";
};
