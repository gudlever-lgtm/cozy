import { hints, type Game } from "../engine/solitaire";
import {
  matches,
  pour,
  teaWon,
  type Match,
  type Tea,
} from "../engine/minigames";
/** Suggestions only. No moves, random generation, rewards or save mutations. */
export function solitaireIdleHint(game: Game) {
  if (game.won) return null;
  const moves = hints(game);
  return moves.find((m) => m.to.kind === "foundations") ?? moves[0] ?? null;
}
export function matchIdleHint(game: Match): [number, number] | null {
  if (!game.turns || game.score >= game.target) return null;
  for (let a = 0; a < 36; a++)
    for (const b of [a % 6 < 5 ? a + 1 : -1, a < 30 ? a + 6 : -1]) {
      if (b < 0 || game.cells[a] === game.cells[b]) continue;
      const next = [...game.cells];
      [next[a], next[b]] = [next[b], next[a]];
      if (matches(next).length) return [a, b];
    }
  return null;
}
/** Bounded shortest-path search avoids suggesting endless back-and-forth pours. */
export function teaIdleHint(
  game: Tea,
  selected: number | null = null,
): [number, number] | null {
  if (teaWon(game)) return null;
  const queue: { game: Tea; first: [number, number] | null }[] = [
    { game, first: null },
  ];
  const seen = new Set([JSON.stringify(game)]);
  for (let i = 0; i < queue.length && i < 12000; i++) {
    const node = queue[i];
    for (let a = 0; a < 5; a++)
      for (let b = 0; b < 5; b++) {
        if (i === 0 && selected !== null && a !== selected) continue;
        const next = pour(node.game, a, b);
        if (next === node.game) continue;
        const key = JSON.stringify(next);
        if (seen.has(key)) continue;
        const first = node.first ?? ([a, b] as [number, number]);
        if (teaWon(next)) return first;
        seen.add(key);
        queue.push({ game: next, first });
      }
  }
  return null;
}
