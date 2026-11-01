import { newGame } from "./solitaire";
import { seededRandom } from "./random";
import { winnableSeeds } from "./winnable-seeds";
/** Runtime uses only preverified seeds. It never invokes or imports the solver. */
export function winnableGame(id: string, draw: 1 | 3 = 3, index = 0) {
  const seeds = winnableSeeds[draw];
  const offset = Number.isFinite(index) ? Math.trunc(index) : 0;
  return newGame(
    id,
    draw,
    seededRandom(
      seeds[((offset % seeds.length) + seeds.length) % seeds.length],
    ),
  );
}
