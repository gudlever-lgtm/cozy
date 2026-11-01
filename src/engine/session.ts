import { seededRandom, seedFromString } from "./random";
import { randomTea } from "./teaDifficulty";
import { newMatch, type Match, type Tea, treasures } from "./minigames";
export type MiniKind = "match" | "hidden" | "tea";
export type MiniLevel = 1 | 2 | 3;
export type MiniSession = {
  id: string;
  kind: MiniKind;
  level: MiniLevel;
  match: Match;
  tea: Tea;
  found: string[];
};
export function matchForLevel(level: MiniLevel) {
  const g = newMatch();
  return { ...g, target: 30 + (level - 1) * 15, turns: 18 + (level - 1) * 4 };
}
export function teaForLevel(level: MiniLevel, random = Math.random): Tea {
  return randomTea(level, random);
}
export function treasuresForLevel(
  level: MiniLevel,
  seed?: string,
): { id: (typeof treasures)[number]["id"]; x: number; y: number }[] {
  if (seed !== undefined) {
    const points = ([1, 2, 3] as MiniLevel[]).flatMap((level) =>
      treasuresForLevel(level).map((t) => [t.x, t.y]),
    );
    const random = seededRandom(seedFromString(seed));
    for (let i = points.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [points[i], points[j]] = [points[j], points[i]];
    }
    return treasures.map((t, i) => ({
      ...t,
      x: points[i][0],
      y: points[i][1],
    }));
  }
  const positions =
    level === 2
      ? [
          [13, 24],
          [65, 31],
          [32, 66],
          [78, 72],
          [48, 42],
        ]
      : level === 3
        ? [
            [70, 23],
            [16, 58],
            [44, 36],
            [76, 70],
            [36, 78],
          ]
        : null;
  return treasures.map((t, i) => ({
    ...t,
    x: positions ? positions[i][0] : t.x,
    y: positions ? positions[i][1] : t.y,
  }));
}

export function validSession(s: MiniSession | null): boolean {
  if (s === null) return true;
  if (
    !s ||
    typeof s.id !== "string" ||
    !s.id ||
    !["match", "tea", "hidden"].includes(s.kind) ||
    ![1, 2, 3].includes(s.level) ||
    !Array.isArray(s.found) ||
    !s.found.every((id) => treasures.some((t) => t.id === id))
  )
    return false;
  if (
    !s.match ||
    !Array.isArray(s.match.cells) ||
    s.match.cells.length !== 36 ||
    !s.match.cells.every((v) => Number.isInteger(v) && v >= 0 && v < 5) ||
    ![s.match.score, s.match.turns, s.match.target].every(
      (v) => Number.isSafeInteger(v) && v >= 0,
    ) ||
    s.match.target === 0
  )
    return false;
  return (
    Array.isArray(s.tea) &&
    s.tea.length === 5 &&
    s.tea.every(
      (t) =>
        Array.isArray(t) &&
        t.length <= 3 &&
        t.every((v) => Number.isInteger(v) && v >= 0 && v < 3),
    ) &&
    [0, 1, 2].every((v) => s.tea.flat().filter((x) => x === v).length === 3)
  );
}
