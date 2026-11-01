import { newGame, type Game, type Board, suits } from "./solitaire";
import {
  type Economy,
  type Counters,
  type Placement,
  type Season,
  transact,
  REWARDS,
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
  version: 2;
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
    version: 2,
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
export function migrate(
  raw: string | null,
  id: string,
  language: Language,
): Save {
  if (!raw) return fresh(id, language);
  const old = JSON.parse(raw);
  if (
    !old ||
    typeof old !== "object" ||
    (old.version !== 1 && old.version !== 2)
  )
    throw Error("saveError");
  const base = fresh(id, language);
  const s = {
    ...base,
    ...old,
    version: 2,
    preferences: { ...base.preferences, ...old.preferences },
    counters: { ...base.counters, ...old.counters },
    economy: {
      ...base.economy,
      ...old.economy,
      wallet: { ...base.economy.wallet, ...old.economy?.wallet },
    },
  } as Save;
  if (
    !s.game ||
    !Array.isArray(s.game.tableau) ||
    s.game.tableau.length !== 7 ||
    !Array.isArray(s.game.stock) ||
    !Array.isArray(s.game.foundations) ||
    s.game.foundations.length !== 4 ||
    !Array.isArray(s.economy.receipts) ||
    !Array.isArray(s.completed) ||
    !Array.isArray(s.placements)
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
  if (
    !validBoard(s.game) ||
    !validBoard(s.game.initial) ||
    !Array.isArray(s.game.history) ||
    !s.game.history.every(validBoard) ||
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
    !s.economy.receipts.every((x) => typeof x === "string")
  )
    throw Error("saveError");
  return s;
}
export function reward(
  s: Save,
  type: "solitaire" | "match" | "hidden" | "tea",
  id: string,
): Save {
  const receipt = `${type}:${id}`;
  if (s.economy.receipts.includes(receipt)) return s;
  let economy = transact(s.economy, receipt, {
    glimmers: REWARDS[type],
    ...(type === "hidden" ? { wood: 2, stone: 1 } : {}),
    ...(type === "match" ? { flowers: 2, seeds: 1 } : {}),
  });
  const counters = { ...s.counters, [type]: s.counters[type] + 1 };
  if (
    Object.values(counters)
      .slice(0, 4)
      .every((n) => n > 0)
  )
    economy = transact(economy, "achievement:explorer", {
      glimmers: REWARDS.achievement,
    });
  return { ...s, economy, counters };
}
export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export function saveQueue(storage: Storage) {
  let pending = Promise.resolve();
  return (s: Save) => {
    const json = JSON.stringify(s);
    pending = pending
      .catch(() => {})
      .then(() => storage.setItem(SAVE_KEY, json));
    return pending;
  };
}
