import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { solve, solverKey, type SolverAction } from "../src/engine/solver";
import {
  newGame,
  move,
  drawCards,
  victory,
  snapshot,
  type Place,
} from "../src/engine/solitaire";
import { challengeGame, challenges } from "../src/engine/challenges";
import { seededRandom } from "../src/engine/random";
import { winnableSeeds } from "../src/engine/winnable-seeds";
import { winnableGame } from "../src/engine/winnable";
function replay(g: ReturnType<typeof newGame>, actions: SolverAction[]) {
  for (const a of actions) {
    const next = a.op === "draw" ? drawCards(g) : move(g, a.from, a.to);
    assert.notEqual(next, g);
    g = next;
  }
  assert.ok(victory(g));
}
test("historical LCG and shuffle retain the exact known challenge deals", () => {
  const locks = {
    blossoms:
      "4652811d78373707ab5ae6c1fd466b7d32b704c69a13ce9e381cbb659545600c",
    river: "5d1858f7173b46eed3446a5d4991c24ca6e1d0f1b3e705c1e11445e1a9db9e81",
  };
  for (const id of ["blossoms", "river"] as const)
    assert.equal(
      createHash("sha256")
        .update(JSON.stringify(snapshot(challengeGame("lock", id))))
        .digest("hex"),
      locks[id],
    );
});
test("the three unchanged challenges are searched with a bounded budget; every returned solution replays", () => {
  for (const c of challenges) {
    const g = challengeGame("challenge", c.id),
      before = structuredClone(g),
      r = solve(g);
    assert.ok(r.nodes <= 150000);
    if (c.id === "lantern") assert.ok("solved" in r);
    if ("solved" in r) replay(g, r.actions);
    else assert.equal(r.unknown, true);
    assert.deepEqual(g, before);
  }
  assert.equal(
    "unknown" in solve(challengeGame("budget", "river"), { nodeBudget: 1 }),
    true,
  );
});
test("all 200 runtime seeds have independently replayable winning witnesses in both draw modes", () => {
  const witnesses = JSON.parse(
    readFileSync(
      new URL("./fixtures/winnable-solutions.json", import.meta.url),
      "utf8",
    ),
  ) as { draw: 1 | 3; seed: number; actions: number[][] }[];
  for (const draw of [1, 3] as const) {
    assert.equal(winnableSeeds[draw].length, 100);
    assert.equal(new Set(winnableSeeds[draw]).size, 100);
    winnableSeeds[draw].forEach((seed, index) => {
      const w = witnesses.find((w) => w.draw === draw && w.seed === seed);
      assert.ok(w);
      const g = winnableGame("verified", draw, index);
      assert.deepEqual(
        snapshot(g),
        snapshot(newGame("seed", draw, seededRandom(seed))),
      );
      const place = (code: number, index?: number): Place =>
        code === -1
          ? { kind: "waste" }
          : code < 7
            ? {
                kind: "tableau",
                pile: code,
                index: index === -1 ? undefined : index,
              }
            : {
                kind: "foundations",
                pile: code - 7,
                index: index === -1 ? undefined : index,
              };
      replay(
        g,
        w.actions.map((a) =>
          a.length
            ? { op: "move", from: place(a[0], a[1]), to: place(a[2]) }
            : { op: "draw" },
        ),
      );
    });
  }
  assert.equal(witnesses.length, 200);
});
test("transposition key includes card face state and stock/waste order", () => {
  const g = newGame("keys");
  const k = solverKey(g);
  const flipped = structuredClone(g);
  flipped.tableau[1][0].up = true;
  assert.notEqual(solverKey(flipped), k);
  const stock = structuredClone(g);
  stock.stock.reverse();
  assert.notEqual(solverKey(stock), k);
  const swapped = structuredClone(g);
  [swapped.tableau[0], swapped.tableau[1]] = [
    swapped.tableau[1],
    swapped.tableau[0],
  ];
  assert.equal(solverKey(swapped), k);
});

test("the application import graph excludes the offline solver and solution witnesses", () => {
  const visited = new Set<string>();
  function visit(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    assert.ok(
      !file.endsWith("/engine/solver.ts") &&
        !file.includes("/tests/") &&
        !file.includes("/scripts/"),
      file,
    );
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(
      /(?:from|import)\s*["'](\.[^"']+)["']/g,
    )) {
      const target = resolve(dirname(file), match[1]);
      const candidate = [
        target + ".ts",
        target + ".tsx",
        target + "/index.ts",
        target + "/index.tsx",
      ].find(existsSync);
      if (candidate) visit(candidate);
    }
  }
  visit(resolve("src/App.tsx"));
  assert.ok(visited.has(resolve("src/engine/winnable-seeds.ts")));
});
