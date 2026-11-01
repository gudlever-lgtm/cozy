# Offline solver and verified deals

`src/engine/solver.ts` implements bounded DFS with a transposition table, default 150,000 unique nodes and depth 700. It tries foundation moves, moves revealing face-down cards, other moves, then drawing. Safe foundation promotion is forced; equivalent columns/empty foundations are canonicalized. The key includes every tableau ID/face state, foundation heights by suit, and exact stock/waste order. Search discards undo history and does not mutate its input. Exhausted budgets or search failure return **unknown**, never a claim that a deal is impossible.

The existing challenge seeds remain unchanged. Measured at the default budget:

| Challenge | Seed / draw | Result | Nodes |
|---|---|---|---|
| Blossoms | 17017 / 1 | Unknown | 150,000 |
| River | 23111 / 3 | Unknown | 150,000 |
| Lantern | 98173 / 1 | Solved; 228 actions replay to victory | 5,333 |

`random.ts` contains the unchanged historical LCG. Regression hashes lock two original full deals, including card ordering/face flags; shuffle is unchanged.

`winnable-seeds.ts` contains 100 seeds per draw mode. `winnableGame(id, draw, index)` uses only that list, the shared LCG and ordinary `newGame`. The app import graph is tested to exclude the solver, Node APIs, generator and solution witnesses. New game offers Random or Guaranteed winnable; challenge seeds remain a separate choice. “Winnable” means there exists a verified solution; an arbitrary choice of moves can still block a game.

Generate offline from the repo root, with no downloads or dependencies:

```sh
node --import tsx scripts/find-winnable.ts
npx prettier --write src/engine/winnable-seeds.ts tests/fixtures/winnable-solutions.json
```

The default generator scans seeds from 1 using a 5,000-node budget per candidate to find easy-to-verify solutions efficiently. It discards unknowns and independently replays every returned action through `move`/`drawCards` before writing either file. Options: `--count=100 --budget=5000 --start=1`. The committed lists scanned through seed 206 (draw 1) and 303 (draw 3).

Tests replay all 200 committed witnesses, checking every action changes the board and every final state is a victory. Witness tuples are `[]` for drawing, otherwise `[source,index,destination]`; -1 is waste, 0–6 tableau, 7–10 foundations. They are test-only data, never bundled in the app.
