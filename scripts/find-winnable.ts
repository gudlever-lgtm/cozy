/** Offline tool; solver and fs are deliberately absent from the runtime import graph. */
import { writeFileSync } from "node:fs";
import { newGame, move, drawCards, victory } from "../src/engine/solitaire";
import { seededRandom } from "../src/engine/random";
import { solve, type SolverAction } from "../src/engine/solver";
const arg = (name: string, fallback: number) =>
  Number(
    process.argv.find((x) => x.startsWith(`--${name}=`))?.split("=")[1] ??
      fallback,
  );
const count = arg("count", 100),
  nodeBudget = arg("budget", 5000),
  start = arg("start", 1);
if (
  !Number.isInteger(count) ||
  count < 1 ||
  !Number.isInteger(nodeBudget) ||
  nodeBudget < 1 ||
  !Number.isInteger(start)
)
  throw Error("Invalid generation options");
const seeds: Record<1 | 3, number[]> = { 1: [], 3: [] };
const witnesses: { draw: 1 | 3; seed: number; actions: number[][] }[] = [];
function encode(a: SolverAction) {
  return a.op === "draw"
    ? []
    : [
        a.from.kind === "waste"
          ? -1
          : a.from.kind === "tableau"
            ? a.from.pile
            : 7 + a.from.pile,
        a.from.kind === "waste" ? -1 : (a.from.index ?? -1),
        a.to.kind === "tableau"
          ? a.to.pile
          : a.to.kind === "foundations"
            ? 7 + a.to.pile
            : -1,
      ];
}
for (const draw of [1, 3] as const) {
  for (let seed = start; seeds[draw].length < count; seed++) {
    const g = newGame("verified", draw, seededRandom(seed));
    const result = solve(g, { nodeBudget });
    if (!("solved" in result)) continue;
    let end = g;
    for (const a of result.actions) {
      const next = a.op === "draw" ? drawCards(end) : move(end, a.from, a.to);
      if (next === end) throw Error("Invalid witness action");
      end = next;
    }
    if (!victory(end)) throw Error("Invalid solution");
    seeds[draw].push(seed);
    witnesses.push({ draw, seed, actions: result.actions.map(encode) });
    if (seeds[draw].length % 10 === 0)
      console.log(`draw ${draw}: ${seeds[draw].length}/${count}, seed ${seed}`);
  }
}
writeFileSync(
  "src/engine/winnable-seeds.ts",
  `// Generated offline by scripts/find-winnable.ts; every seed has a replay-verified solution.\nexport const winnableSeeds = ${JSON.stringify(seeds, null, 2)} as const;\n`,
);
writeFileSync(
  "tests/fixtures/winnable-solutions.json",
  JSON.stringify(witnesses) + "\n",
);
console.log(
  `Verified ${witnesses.length} solutions; budget ${nodeBudget} per candidate.`,
);
