/** Reverse BFS from victory enumerates every solvable state modulo tray permutation. */
import { pour, type Tea } from "../src/engine/minigames";
const key = (g: Tea) =>
  g
    .map((t) => t.join(""))
    .sort()
    .join("|");
const initial = [[0, 0, 0], [1, 1, 1], [2, 2, 2], [], []];
const q = [initial],
  dist = new Map([[key(initial), 0]]);
for (let h = 0; h < q.length; h++) {
  const g = q[h],
    d = dist.get(key(g))!;
  for (let a = 0; a < 5; a++)
    for (let b = 0; b < 5; b++) {
      if (a === b || !g[b].length) continue;
      const c = g[b].at(-1)!;
      for (let n = 1; n <= Math.min(3 - g[a].length, g[b].length); n++) {
        if (g[b].slice(-n).some((v) => v !== c)) break;
        const prev = g.map((t) => [...t]);
        prev[a].push(...Array(n).fill(c));
        prev[b].splice(-n);
        const k = key(prev);
        if (dist.has(k) || key(pour(prev, a, b)) !== key(g)) continue;
        dist.set(k, d + 1);
        q.push(prev);
      }
    }
}
console.log(
  JSON.stringify({
    states: q.length,
    max: Math.max(...dist.values()),
    distribution: Object.fromEntries(
      [...new Set(dist.values())]
        .sort((a, b) => a - b)
        .map((d) => [d, [...dist.values()].filter((v) => v === d).length]),
    ),
  }),
);
