import { pour, teaWon, type Tea } from "./minigames";
const key = (g: Tea) =>
  g
    .map((p) => p.join(""))
    .sort()
    .join("|");
const measured = new Map<string, number>();
/** BFS over equivalent tray permutations; exact minimum legal pours, or Infinity. */
export function minimumTeaMoves(initial: Tea): number {
  const k = key(initial),
    cached = measured.get(k);
  if (cached !== undefined) return cached;
  const queue = [{ g: initial, d: 0 }],
    seen = new Set([k]);
  for (let head = 0; head < queue.length; head++) {
    const { g, d } = queue[head];
    if (teaWon(g)) {
      measured.set(k, d);
      return d;
    }
    for (let a = 0; a < 5; a++)
      for (let b = 0; b < 5; b++) {
        const next = pour(g, a, b);
        if (next === g) continue;
        const value = key(next);
        if (!seen.has(value)) {
          seen.add(value);
          queue.push({ g: next, d: d + 1 });
        }
      }
  }
  measured.set(k, Infinity);
  return Infinity;
}
export const TEA_DIFFICULTY = { 1: [6, 6], 2: [7, 7], 3: [8, 8] } as const;
const fallback: Record<1 | 2 | 3, Tea> = {
  1: [[0, 0, 1], [0, 2, 1], [2, 1, 2], [], []],
  2: [[0, 0, 1], [0, 1, 2], [2, 1, 2], [], []],
  3: [[0, 1, 0], [0, 1, 2], [2, 1, 2], [], []],
};
export function randomTea(
  level: 1 | 2 | 3,
  random: () => number = Math.random,
): Tea {
  const [min, max] = TEA_DIFFICULTY[level];
  for (let attempt = 0; attempt < 64; attempt++) {
    const values = [0, 0, 0, 1, 1, 1, 2, 2, 2];
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.max(0, Math.min(i, Math.floor(random() * (i + 1))));
      [values[i], values[j]] = [values[j], values[i]];
    }
    const layout = [
      values.slice(0, 3),
      values.slice(3, 6),
      values.slice(6),
      [],
      [],
    ];
    const moves = minimumTeaMoves(layout);
    if (moves >= min && moves <= max) return layout;
  }
  // A constant/adversarial RNG cannot stall the UI; these fallbacks are BFS-verified.
  return fallback[level].map((p) => [...p]);
}
