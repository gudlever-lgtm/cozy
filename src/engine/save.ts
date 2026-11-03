import {
  newMiniProgress,
  validMiniProgress,
  finishMini,
  type MiniProgress,
} from "./miniProgress";
import { newWorld, validWorld, type WorldProgress } from "./progression";
import { validSession, type MiniSession } from "./session";
import {
  newGame,
  type Game,
  type Board,
  type Delta,
  type PileRef,
  suits,
  revert,
  validDelta,
} from "./solitaire";
import {
  type Economy,
  type Counters,
  type Placement,
  type Season,
  transact,
  REWARDS,
  gameReward,
  resourceGains,
  upgrades,
  place,
} from "./world";
export type Language = "da" | "en";
export type Profile = {
  id: string;
  username: string;
  language: Language;
  createdAt: string;
  lastPlayedAt: string;
  progressRef: string;
};
export type Preferences = {
  language: Language;
  season: Season | "auto";
  time: "morning" | "afternoon" | "sunset" | "evening";
  weather: number;
  reducedMotion: boolean;
  sound: boolean;
  music: boolean;
  animations: boolean;
  animationQuality: "low" | "medium" | "high";
};
export type Save = {
  version: 4;
  miniProgress: MiniProgress;
  world: WorldProgress;
  miniSession: MiniSession | null;
  profile: Profile | null;
  preferences: Preferences;
  game: Game;
  economy: Economy;
  counters: Counters;
  completed: string[];
  placements: Placement[];
  attempts: number;
  streak: number;
};
export const SAVE_KEY = "cozy.save";
export function validateUsername(raw: string): string | null {
  const name = raw.trim().normalize("NFC");
  const count = Array.from(name).filter((c) => !/^\p{M}$/u.test(c)).length;
  return count >= 3 &&
    count <= 20 &&
    /^[\p{L}\p{N} _-][\p{L}\p{M}\p{N} _-]*$/u.test(name)
    ? name
    : null;
}
export const deviceLanguage = (language: string): Language =>
  language.toLowerCase().startsWith("da") ? "da" : "en";
export function fresh(id: string, language: Language): Save {
  return {
    version: 4,
    miniProgress: newMiniProgress(),
    world: newWorld(),
    miniSession: null,
    profile: null,
    preferences: {
      language,
      season: "auto",
      time: "afternoon",
      weather: 0.4,
      reducedMotion: false,
      sound: false,
      music: false,
      animations: true,
      animationQuality: "medium",
    },
    game: newGame(id),
    economy: {
      wallet: { glimmers: 0, wood: 0, stone: 0, flowers: 0, seeds: 0 },
      receipts: [],
      inventory: [],
      gains: [],
    },
    counters: { solitaire: 0, match: 0, hidden: 0, tea: 0, gather: 0 },
    completed: [],
    placements: [],
    attempts: 1,
    streak: 0,
  };
}
export function setProfile(
  s: Save,
  name: string,
  id: string,
  now = new Date().toISOString(),
): Save {
  const username = validateUsername(name);
  if (!username) throw Error("usernameError");
  return {
    ...s,
    profile: s.profile
      ? {
          ...s.profile,
          username,
          language: s.preferences.language,
          lastPlayedAt: now,
        }
      : {
          id,
          username,
          language: s.preferences.language,
          createdAt: now,
          lastPlayedAt: now,
          progressRef: "local",
        },
  };
}
export function setLanguage(s: Save, language: Language): Save {
  return {
    ...s,
    preferences: { ...s.preferences, language },
    profile: s.profile ? { ...s.profile, language } : null,
  };
}
function validBoard(board: Board): boolean {
  if (
    !board ||
    !Array.isArray(board.stock) ||
    !Array.isArray(board.waste) ||
    !Array.isArray(board.tableau) ||
    board.tableau.length !== 7 ||
    !Array.isArray(board.foundations) ||
    board.foundations.length !== 4 ||
    ![...board.tableau, ...board.foundations].every(Array.isArray)
  )
    return false;
  const cards = [
    ...board.stock,
    ...board.waste,
    ...board.tableau.flat(),
    ...board.foundations.flat(),
  ];
  return (
    cards.length === 52 &&
    cards.every(
      (c) =>
        c &&
        suits.includes(c.suit) &&
        Number.isInteger(c.rank) &&
        c.rank >= 1 &&
        c.rank <= 13 &&
        c.id === `${c.suit}${c.rank}` &&
        typeof c.up === "boolean",
    ) &&
    new Set(cards.map((c) => c.id)).size === 52
  );
}
/** Keep only the newest contiguous, exactly verified legacy undo suffix. */
function migrateHistory(history: unknown, current: Board): Delta[] {
  if (!Array.isArray(history) || !validBoard(current)) return [];
  const result: Delta[] = [];
  let after = current;
  const key = (b: Board) =>
    JSON.stringify(
      [b.stock, b.waste, ...b.tableau, ...b.foundations].map((p) =>
        p.map((c) => [c.id, c.up]),
      ),
    );
  for (
    let i = history.length - 1;
    i >= Math.max(0, history.length - 200);
    i--
  ) {
    const before = history[i] as Board;
    if (!validBoard(before)) break;
    const piles = (b: Board) => [
      b.stock,
      b.waste,
      ...b.tableau,
      ...b.foundations,
    ];
    const a = piles(before),
      b = piles(after);
    const changed = a.map((p, j) => b[j].length - p.length);
    const sources = changed.flatMap((n, j) => (n < 0 ? [j] : [])),
      targets = changed.flatMap((n, j) => (n > 0 ? [j] : []));
    if (sources.length !== 1 || targets.length !== 1) break;
    const from = sources[0],
      to = targets[0],
      n = changed[to];
    if (-changed[from] !== n) break;
    const flipped = after.tableau.flatMap((p, j) => {
      const top = p.at(-1);
      return top?.up && before.tableau[j].some((c) => c.id === top.id && !c.up)
        ? [j]
        : [];
    });
    const ref = (j: number): PileRef =>
      j === 1
        ? { kind: "waste" }
        : j < 9
          ? { kind: "tableau", pile: j - 2 }
          : { kind: "foundations", pile: j - 9 };
    const delta: Delta =
      from === 0 && to === 1
        ? { op: "draw", n, flipped }
        : from === 1 && to === 0
          ? { op: "recycle", n, flipped }
          : { op: "move", from: ref(from), to: ref(to), n, flipped };
    if (!validDelta(delta) || key(revert(after, delta)) !== key(before)) break;
    result.unshift(delta);
    after = before;
  }
  return result;
}
export function migrate(
  raw: string | null,
  id: string,
  language: Language,
): Save {
  if (!raw) return fresh(id, language);
  const old = JSON.parse(raw);
  if (!old || typeof old !== "object" || ![1, 2, 3, 4].includes(old.version))
    throw Error("saveError");
  const base = fresh(id, language);
  const s = {
    ...base,
    ...old,
    version: 4,
    world: { ...newWorld(old.economy?.inventory ?? []), ...old.world },
    miniSession: old.miniSession ?? null,
    miniProgress: old.miniProgress
      ? { ...newMiniProgress(), ...old.miniProgress }
      : newMiniProgress(),
    preferences: { ...base.preferences, ...old.preferences },
    counters: { ...base.counters, ...old.counters },
    economy: {
      ...base.economy,
      ...old.economy,
      wallet: { ...base.economy.wallet, ...old.economy?.wallet },
      gains: resourceGains(old.economy?.gains),
    },
  } as Save;
  if (
    !s.game ||
    (s.game.variant !== undefined &&
      !["klondike", "open", "whitehead"].includes(s.game.variant)) ||
    !Array.isArray(s.game.tableau) ||
    s.game.tableau.length !== 7 ||
    !Array.isArray(s.game.stock) ||
    !Array.isArray(s.game.foundations) ||
    s.game.foundations.length !== 4 ||
    !Array.isArray(s.economy.receipts) ||
    !Array.isArray(s.completed) ||
    !Array.isArray(s.placements) ||
    !s.placements.every(
      (p) =>
        p &&
        upgrades.some((u) => u.id === p.id) &&
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        p.x >= 5 &&
        p.x <= 95 &&
        p.y >= 10 &&
        p.y <= 90,
    ) ||
    !s.completed.every((id) => typeof id === "string")
  )
    throw Error("saveError");
  if (
    Object.values(s.economy.wallet).some(
      (v) => !Number.isSafeInteger(v) || v < 0,
    )
  )
    throw Error("saveError");
  if (s.profile && (!validateUsername(s.profile.username) || !s.profile.id))
    throw Error("saveError");
  if (old.version < 4 && s.game)
    s.game = { ...s.game, history: migrateHistory(s.game.history, s.game) };
  if (
    !validBoard(s.game) ||
    !validBoard(s.game.initial) ||
    !Array.isArray(s.game.history) ||
    s.game.history.length > 200 ||
    !s.game.history.every(validDelta) ||
    ![1, 3].includes(s.game.draw) ||
    !Number.isSafeInteger(s.game.moves) ||
    s.game.moves < 0 ||
    !s.game.id ||
    typeof s.game.won !== "boolean"
  )
    throw Error("saveError");
  if (
    typeof s.preferences.animations !== "boolean" ||
    !["low", "medium", "high"].includes(s.preferences.animationQuality) ||
    !["da", "en"].includes(s.preferences.language) ||
    !["auto", "spring", "summer", "autumn", "winter"].includes(
      s.preferences.season,
    ) ||
    !["morning", "afternoon", "sunset", "evening"].includes(
      s.preferences.time,
    ) ||
    !Number.isFinite(s.preferences.weather) ||
    s.preferences.weather < 0 ||
    s.preferences.weather > 1 ||
    Object.values(s.counters).some((n) => !Number.isSafeInteger(n) || n < 0)
  )
    throw Error("saveError");
  if (
    s.profile &&
    (!Number.isFinite(Date.parse(s.profile.createdAt)) ||
      !Number.isFinite(Date.parse(s.profile.lastPlayedAt)))
  )
    throw Error("saveError");
  if (
    !Array.isArray(s.economy.inventory) ||
    !s.economy.inventory.every((x) => typeof x === "string") ||
    !s.economy.receipts.every((x) => typeof x === "string") ||
    !Array.isArray(s.economy.gains) ||
    !s.economy.gains.every(
      (g) =>
        g &&
        typeof g.id === "string" &&
        g.amounts &&
        typeof g.amounts === "object",
    )
  )
    throw Error("saveError");
  if (
    !Number.isSafeInteger(s.attempts) ||
    s.attempts < 0 ||
    !Number.isSafeInteger(s.streak) ||
    s.streak < 0 ||
    !validWorld(s.world) ||
    !validSession(s.miniSession) ||
    !validMiniProgress(s.miniProgress) ||
    !s.miniProgress.slots.every((slot) => validSession(slot.session)) ||
    !s.world ||
    !["cottage", "forest", "river", "village", "winterland"].includes(
      s.world.area,
    ) ||
    !Array.isArray(s.world.areas) ||
    !Array.isArray(s.world.stories) ||
    !Array.isArray(s.world.events) ||
    !Array.isArray(s.world.challenges) ||
    !Array.isArray(s.world.medals) ||
    !s.world.relationships ||
    Object.values(s.world.relationships).some(
      (n) => !Number.isInteger(n) || n < 0 || n > 5,
    ) ||
    !s.world.buildings ||
    Object.values(s.world.buildings).some(
      (n) => !Number.isInteger(n) || n < 0 || n > 3,
    )
  )
    throw Error("saveError");
  return s;
}
export function reward(
  s: Save,
  type: "solitaire" | "match" | "hidden" | "tea",
  id: string,
  level?: 1 | 2 | 3,
): Save {
  const receipt = `${type}:${id}`;
  if (s.economy.receipts.includes(receipt)) return s;
  const difficulty =
    type === "solitaire"
      ? s.game.draw === 3
        ? 2
        : 1
      : (level ??
        (s.miniSession?.id === id && s.miniSession.kind === type
          ? s.miniSession.level
          : 1));
  let economy = transact(s.economy, receipt, gameReward(type, difficulty));
  const counters = {
    ...s.counters,
    [type]: s.counters[type] + 1,
    gather: s.counters.gather + 1,
  };
  if (
    Object.values(counters)
      .slice(0, 4)
      .every((n) => n > 0)
  )
    economy = transact(economy, "achievement:explorer", {
      glimmers: REWARDS.achievement,
    });
  // Permanent, earned garden objects. Existing purchases remain untouched.
  // Unlock once after the third completed Hidden Treasures / Tea Time game.
  let placements = s.placements;
  const rewardItem =
    type === "hidden" && counters.hidden >= 3
      ? "birdhouse"
      : type === "tea" && counters.tea >= 3
        ? "teaTable"
        : null;
  if (rewardItem && !economy.inventory.includes(rewardItem)) {
    const item = upgrades.find((u) => u.id === rewardItem)!;
    economy = transact(economy, "unlock:" + rewardItem, {}, rewardItem);
    placements = place(economy.inventory, placements, {
      id: rewardItem,
      x: item.x,
      y: item.y,
    });
  }
  const medal =
    s.miniSession?.id === id && s.miniSession.kind === type
      ? `${type}:${s.miniSession.level}`
      : null;
  return {
    ...s,
    miniProgress:
      type === "solitaire"
        ? {
            ...s.miniProgress,
            fireflies: s.miniProgress.fireflies + 10,
            keys: [
              ...new Set([
                ...s.miniProgress.keys,
                ...(counters.solitaire >= 3 ? ["open"] : []),
                ...(counters.solitaire >= 6 ? ["whitehead"] : []),
              ]),
            ],
            slots: s.miniProgress.slots.map((slot) =>
              slot.done ? slot : { ...slot, moves: slot.moves + 10 },
            ),
          }
        : {
            ...finishMini(s.miniProgress, id),
            undo: s.miniProgress.undo + difficulty,
            deals: s.miniProgress.deals + 1,
          },
    economy,
    counters,
    placements,
    world: {
      ...s.world,
      challenges:
        type === "solitaire" && s.game.id === id && s.game.challenge
          ? [...new Set([...s.world.challenges, s.game.challenge])]
          : s.world.challenges,
      medals: medal ? [...new Set([...s.world.medals, medal])] : s.world.medals,
    },
  };
}
export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export function saveQueue(
  storage: Storage,
  {
    backupEveryMs = 30_000,
    now = Date.now,
  }: { backupEveryMs?: number; now?: () => number } = {},
) {
  let pending = Promise.resolve(),
    lastGood: string | null = null,
    initialized = false,
    lastWritten: string | null = null,
    lastBackupAt = -Infinity;
  return (s: Save) => {
    const json = JSON.stringify(s);
    pending = pending
      .catch(() => {})
      .then(async () => {
        if (!initialized) {
          const previous = await storage.getItem(SAVE_KEY);
          if (previous) {
            try {
              migrate(previous, "backup", "en");
              lastGood = previous;
            } catch {
              /* Preserve a valid existing backup when the primary is corrupt. */
            }
          }
          initialized = true;
        }
        if (json === lastWritten) return;
        const time = now();
        if (
          lastWritten === null ||
          time - lastBackupAt >= Math.max(0, backupEveryMs)
        ) {
          if (lastGood !== null) await storage.setItem(BACKUP_KEY, lastGood);
          else if ((await storage.getItem(BACKUP_KEY)) === null)
            await storage.setItem(BACKUP_KEY, json);
          // A corrupt primary must never replace an existing recovery copy.
          lastBackupAt = time;
        }
        await storage.setItem(SAVE_KEY, json);
        lastGood = json;
        lastWritten = json;
      });
    return pending;
  };
}

export const BACKUP_KEY = SAVE_KEY + ".backup";
export const UNREADABLE_SAVE_KEY = SAVE_KEY + ".unreadable";
export async function loadSave(
  storage: Storage,
  id: string,
  language: Language,
): Promise<{ save: Save; recovered: boolean; reset?: boolean }> {
  const primary = await storage.getItem(SAVE_KEY);
  if (primary !== null) {
    try {
      return { save: migrate(primary, id, language), recovered: false };
    } catch {
      /* fall through to backup */
    }
  }
  const backup = await storage.getItem(BACKUP_KEY);
  if (backup !== null) {
    try {
      return { save: migrate(backup, id, language), recovered: true };
    } catch {
      /* Preserve unreadable data before allowing a fresh save to replace it. */
    }
  }
  if (primary === null && backup === null)
    return { save: fresh(id, language), recovered: false };
  const snapshot = JSON.stringify({ primary, backup });
  for (let index = 0; ; index++) {
    const key = UNREADABLE_SAVE_KEY + (index ? `.${index}` : "");
    const archived = await storage.getItem(key);
    if (archived === snapshot) break;
    if (archived === null) {
      // A failed archive write rejects loading, so the UI cannot overwrite the originals.
      await storage.setItem(key, snapshot);
      break;
    }
  }
  return { save: fresh(id, language), recovered: false, reset: true };
}
