import type { Save } from "./save";
import { transact, type Wallet, type Counters } from "./world";
export type AreaId = "cottage" | "forest" | "river" | "village" | "winterland";
export type NpcId = "millie" | "marmalade" | "pip";
export type CardTheme = "classic" | "botanical" | "river" | "winter";
export type WorldProgress = {
  area: AreaId;
  areas: AreaId[];
  buildings: Record<string, number>;
  stories: string[];
  relationships: Record<NpcId, number>;
  events: string[];
  challenges: string[];
  medals: string[];
  theme: CardTheme;
};
export function newWorld(owned: string[] = []): WorldProgress {
  return {
    area: "cottage",
    areas: owned.includes("forest") ? ["cottage", "forest"] : ["cottage"],
    buildings: {},
    stories: [],
    relationships: { millie: 0, marmalade: 0, pip: 0 },
    events: [],
    challenges: [],
    medals: [],
    theme: owned.includes("cards") ? "botanical" : "classic",
  };
}
export const areas: {
  id: AreaId;
  requires?: AreaId;
  quest?: string;
  story?: string;
  cost: Partial<Wallet>;
}[] = [
  { id: "cottage", cost: {} },
  { id: "forest", quest: "pip1", cost: { glimmers: 50, wood: 2 } },
  {
    id: "river",
    requires: "forest",
    quest: "pip2",
    story: "forest2",
    cost: { glimmers: 100, wood: 4, stone: 4, seeds: 2 },
  },
  {
    id: "village",
    requires: "river",
    quest: "marmalade2",
    story: "river2",
    cost: { glimmers: 140, wood: 6, stone: 6, flowers: 3 },
  },
  {
    id: "winterland",
    requires: "village",
    quest: "millie2",
    story: "village2",
    cost: { glimmers: 180, stone: 8, flowers: 4, seeds: 3 },
  },
];
export const buildings = [
  {
    id: "greenhouse",
    area: "forest",
    cost: { glimmers: 35, wood: 2, seeds: 1 },
    x: 28,
    y: 66,
  },
  {
    id: "lookout",
    area: "forest",
    cost: { glimmers: 45, wood: 3, stone: 2 },
    x: 73,
    y: 53,
  },
  {
    id: "pier",
    area: "river",
    cost: { glimmers: 40, wood: 3, stone: 1 },
    x: 60,
    y: 72,
  },
  {
    id: "pond",
    area: "river",
    cost: { glimmers: 40, stone: 3, flowers: 2 },
    x: 26,
    y: 76,
  },
  {
    id: "teahouse",
    area: "village",
    cost: { glimmers: 55, wood: 4, stone: 3 },
    x: 45,
    y: 58,
  },
  {
    id: "gazebo",
    area: "village",
    cost: { glimmers: 50, wood: 3, flowers: 2 },
    x: 76,
    y: 71,
  },
  {
    id: "winterlights",
    area: "winterland",
    cost: { glimmers: 45, wood: 2, stone: 2 },
    x: 27,
    y: 62,
  },
  {
    id: "conservatory",
    area: "winterland",
    cost: { glimmers: 65, stone: 4, flowers: 3, seeds: 2 },
    x: 73,
    y: 59,
  },
] as const;
export type BuildingId = (typeof buildings)[number]["id"];
export function areaOwned(s: Save, id: AreaId) {
  return (
    s.world.areas.includes(id) ||
    (id === "forest" && s.economy.inventory.includes("forest"))
  );
}
export function areaReady(s: Save, id: AreaId) {
  const a = areas.find((a) => a.id === id);
  return (
    !!a &&
    (!a.requires || areaOwned(s, a.requires)) &&
    (!a.quest || s.completed.includes(a.quest)) &&
    (!a.story || s.world.stories.includes(a.story))
  );
}
export function enterArea(s: Save, id: AreaId): Save {
  if (!areaOwned(s, id)) {
    if (!areaReady(s, id)) throw Error("worldLocked");
    const a = areas.find((a) => a.id === id)!;
    const delta = Object.fromEntries(
      Object.entries(a.cost).map(([k, v]) => [k, -v]),
    );
    s = {
      ...s,
      economy: transact(
        s.economy,
        "area:" + id,
        delta,
        id === "forest" ? "forest" : undefined,
      ),
    };
  }
  return {
    ...s,
    world: {
      ...s.world,
      area: id,
      areas: [...new Set([...s.world.areas, id])],
    },
  };
}
export function improve(s: Save, id: BuildingId): Save {
  const b = buildings.find((b) => b.id === id)!;
  if (!b || !areaOwned(s, b.area)) throw Error("worldLocked");
  const level = s.world.buildings[id] ?? 0;
  if (level >= 3) return s;
  const delta = Object.fromEntries(
    Object.entries(b.cost).map(([k, v]) => [k, -v * (level + 1)]),
  );
  return {
    ...s,
    economy: transact(s.economy, `building:${id}:${level + 1}`, delta),
    world: { ...s.world, buildings: { ...s.world.buildings, [id]: level + 1 } },
  };
}
type Objective =
  | { counter: keyof Counters; count: number }
  | { building: BuildingId; count: number };
export const stories: {
  id: string;
  area: AreaId;
  npc: NpcId;
  requires?: string;
  objectives: Objective[];
  reward: Partial<Wallet>;
}[] = [
  {
    id: "forest1",
    area: "forest",
    npc: "pip",
    objectives: [
      { counter: "hidden", count: 2 },
      { counter: "gather", count: 4 },
    ],
    reward: { glimmers: 35, wood: 3 },
  },
  {
    id: "forest2",
    area: "forest",
    npc: "millie",
    requires: "forest1",
    objectives: [
      { building: "greenhouse", count: 1 },
      { counter: "match", count: 3 },
    ],
    reward: { glimmers: 45, seeds: 3 },
  },
  {
    id: "river1",
    area: "river",
    npc: "pip",
    objectives: [
      { building: "pier", count: 1 },
      { counter: "hidden", count: 3 },
    ],
    reward: { glimmers: 45, stone: 4 },
  },
  {
    id: "river2",
    area: "river",
    npc: "millie",
    requires: "river1",
    objectives: [
      { building: "pond", count: 1 },
      { counter: "match", count: 4 },
    ],
    reward: { glimmers: 55, flowers: 4 },
  },
  {
    id: "village1",
    area: "village",
    npc: "marmalade",
    objectives: [
      { building: "teahouse", count: 1 },
      { counter: "tea", count: 3 },
    ],
    reward: { glimmers: 55, wood: 4 },
  },
  {
    id: "village2",
    area: "village",
    npc: "marmalade",
    requires: "village1",
    objectives: [
      { building: "gazebo", count: 1 },
      { counter: "solitaire", count: 2 },
    ],
    reward: { glimmers: 65, flowers: 4 },
  },
  {
    id: "winterland1",
    area: "winterland",
    npc: "pip",
    objectives: [
      { building: "winterlights", count: 1 },
      { counter: "hidden", count: 5 },
    ],
    reward: { glimmers: 65, stone: 5 },
  },
  {
    id: "winterland2",
    area: "winterland",
    npc: "millie",
    requires: "winterland1",
    objectives: [
      { building: "conservatory", count: 1 },
      { counter: "tea", count: 5 },
    ],
    reward: { glimmers: 80, seeds: 5 },
  },
];
export function storyProgress(s: Save, id: string) {
  const story = stories.find((x) => x.id === id);
  if (!story) throw Error("worldLocked");
  return story.objectives.reduce(
    (p, o) => ({
      done:
        p.done +
        Math.min(
          o.count,
          "counter" in o
            ? s.counters[o.counter]
            : (s.world.buildings[o.building] ?? 0),
        ),
      total: p.total + o.count,
    }),
    { done: 0, total: 0 },
  );
}
export function claimStory(s: Save, id: string): Save {
  const story = stories.find((x) => x.id === id);
  if (!story || s.world.stories.includes(id)) return s;
  const p = storyProgress(s, id);
  if (
    !areaOwned(s, story.area) ||
    (story.requires && !s.world.stories.includes(story.requires)) ||
    p.done < p.total
  )
    throw Error("worldLocked");
  return {
    ...s,
    economy: transact(s.economy, "story:" + id, story.reward),
    world: {
      ...s.world,
      stories: [...s.world.stories, id],
      relationships: {
        ...s.world.relationships,
        [story.npc]: Math.min(5, s.world.relationships[story.npc] + 1),
      },
    },
  };
}
export function friendship(s: Save, npc: NpcId) {
  return Math.min(
    5,
    s.completed.filter((id) => id.startsWith(npc)).length +
      s.world.relationships[npc],
  );
}
export const festivals = [
  { id: "spring", counter: "match", count: 2, item: "springGarland" },
  { id: "summer", counter: "tea", count: 3, item: "summerLanterns" },
  { id: "autumn", counter: "hidden", count: 3, item: "harvestBasket" },
  { id: "winter", counter: "solitaire", count: 2, item: "winterStar" },
] as const;
export function claimFestival(
  s: Save,
  id: (typeof festivals)[number]["id"],
): Save {
  const f = festivals.find((f) => f.id === id);
  if (!f || s.world.events.includes(id)) return s;
  if (s.counters[f.counter] < f.count) throw Error("worldLocked");
  return {
    ...s,
    economy: transact(
      s.economy,
      "festival:" + id,
      { glimmers: 40, flowers: 2, seeds: 2 },
      f.item,
    ),
    world: { ...s.world, events: [...s.world.events, id] },
  };
}
export const themes: { id: CardTheme; cost: Partial<Wallet> }[] = [
  { id: "classic", cost: {} },
  { id: "botanical", cost: { glimmers: 25, flowers: 1 } },
  { id: "river", cost: { glimmers: 45, flowers: 2, seeds: 2 } },
  { id: "winter", cost: { glimmers: 60, stone: 2, flowers: 2 } },
];
export function chooseTheme(s: Save, id: CardTheme): Save {
  const t = themes.find((t) => t.id === id);
  if (!t) throw Error("worldLocked");
  const owned =
    id === "classic" ||
    s.economy.inventory.includes("theme:" + id) ||
    (id === "botanical" && s.economy.inventory.includes("cards"));
  return {
    ...s,
    economy: owned
      ? s.economy
      : transact(
          s.economy,
          "theme:" + id,
          Object.fromEntries(Object.entries(t.cost).map(([k, v]) => [k, -v])),
          "theme:" + id,
        ),
    world: { ...s.world, theme: id },
  };
}
export const worldAchievements = [
  "builder",
  "neighbors",
  "explorer",
  "storyteller",
] as const;
export function achievementReady(
  s: Save,
  id: (typeof worldAchievements)[number],
) {
  switch (id) {
    case "builder":
      return Object.values(s.world.buildings).some((level) => level >= 3);
    case "neighbors":
      return (["millie", "marmalade", "pip"] as const).every(
        (n) => friendship(s, n) >= 3,
      );
    case "explorer":
      return areas.every((a) => areaOwned(s, a.id));
    case "storyteller":
      return stories.every((story) => s.world.stories.includes(story.id));
  }
}
export function claimWorldAchievement(
  s: Save,
  id: (typeof worldAchievements)[number],
): Save {
  if (!achievementReady(s, id)) throw Error("worldLocked");
  return {
    ...s,
    economy: transact(s.economy, "achievement:" + id, { glimmers: 50 }),
  };
}

export function validWorld(w: WorldProgress): boolean {
  if (
    !w ||
    !areas.some((a) => a.id === w.area) ||
    !Array.isArray(w.areas) ||
    !w.areas.includes("cottage") ||
    !w.areas.every((id) => areas.some((a) => a.id === id)) ||
    !w.areas.includes(w.area)
  )
    return false;
  if (
    !themes.some((t) => t.id === w.theme) ||
    !w.relationships ||
    !(["millie", "marmalade", "pip"] as const).every(
      (n) =>
        Number.isInteger(w.relationships[n]) &&
        w.relationships[n] >= 0 &&
        w.relationships[n] <= 5,
    )
  )
    return false;
  return (
    Array.isArray(w.stories) &&
    w.stories.every((id) => stories.some((s) => s.id === id)) &&
    Array.isArray(w.events) &&
    w.events.every((id) => festivals.some((f) => f.id === id)) &&
    Array.isArray(w.challenges) &&
    w.challenges.every((id) => ["blossoms", "river", "lantern"].includes(id)) &&
    Array.isArray(w.medals) &&
    w.medals.every((id) => /^(match|hidden|tea):[123]$/.test(id)) &&
    !!w.buildings &&
    Object.entries(w.buildings).every(
      ([id, level]) =>
        buildings.some((b) => b.id === id) &&
        Number.isInteger(level) &&
        level >= 0 &&
        level <= 3,
    )
  );
}
