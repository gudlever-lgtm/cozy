/** Offline-only bounded search. Never import this module from the application. */
import {
  hints,
  move,
  drawCards,
  victory,
  cardsAt,
  suits,
  red,
  type Game,
  type Place,
  type Card,
} from "./solitaire";
export type SolverAction =
  { op: "draw" } | { op: "move"; from: Place; to: Place };
export type SolverResult =
  | { solved: true; actions: SolverAction[]; nodes: number }
  | { unknown: true; nodes: number };
function heights(g: Game) {
  return suits.map(
    (suit) => g.foundations.find((p) => p.at(-1)?.suit === suit)?.length ?? 0,
  );
}
export function solverKey(g: Game): string {
  const card = (c: Card) =>
    String.fromCharCode(
      33 + suits.indexOf(c.suit) * 13 + c.rank - 1 + (c.up ? 52 : 0),
    );
  const pile = (p: Card[]) => p.map(card).join("");
  // Column and empty-foundation permutations are equivalent for the rules.
  return (
    g.tableau.map(pile).sort().join("|") +
    ":" +
    heights(g).join(",") +
    ":" +
    pile(g.stock) +
    ":" +
    pile(g.waste)
  );
}
function safeFoundation(g: Game, c: Card) {
  return (
    c.rank <= 2 ||
    suits.every(
      (s, i) =>
        heights(g)[i] >=
        (red(c) === (s === "♥" || s === "♦") ? c.rank - 2 : c.rank - 1),
    )
  );
}
export function solve(
  game: Game,
  {
    nodeBudget = 150000,
    maxDepth = 700,
  }: { nodeBudget?: number; maxDepth?: number } = {},
): SolverResult {
  const seen = new Set<string>(),
    path: SolverAction[] = [];
  let nodes = 0;
  function visit(g: Game, depth: number): boolean {
    if (victory(g)) return true;
    if (nodes >= nodeBudget || depth >= maxDepth) return false;
    const key = solverKey(g);
    if (seen.has(key)) return false;
    seen.add(key);
    nodes++;
    let choices = hints(g);
    const safe = choices.find(
      (h) =>
        h.to.kind === "foundations" && safeFoundation(g, cardsAt(g, h.from)[0]),
    );
    if (safe) choices = [safe];
    const score = (h: (typeof choices)[number]) =>
      h.to.kind === "foundations"
        ? 1000
        : h.from.kind === "tableau" &&
            h.from.index! > 0 &&
            !g.tableau[h.from.pile][h.from.index! - 1].up
          ? 500
          : h.from.kind === "waste"
            ? 100
            : 0;
    choices.sort((a, b) => score(b) - score(a));
    const destinations = new Set<string>();
    for (const h of choices) {
      // Do not branch over equivalent empty foundation slots.
      const equivalent =
        h.to.kind === "foundations" && !g.foundations[h.to.pile].length
          ? cardsAt(g, h.from)[0].id
          : "";
      if (equivalent && destinations.has(equivalent)) continue;
      if (equivalent) destinations.add(equivalent);
      path.push({ op: "move", ...h });
      const next = move(g, h.from, h.to);
      if (visit({ ...next, history: [] }, depth + 1)) return true;
      path.pop();
      if (nodes >= nodeBudget) return false;
    }
    if (!safe && (g.stock.length || g.waste.length)) {
      path.push({ op: "draw" });
      const next = drawCards(g);
      if (visit({ ...next, history: [] }, depth + 1)) return true;
      path.pop();
    }
    return false;
  }
  return visit({ ...game, history: [] }, 0)
    ? { solved: true, actions: [...path], nodes }
    : { unknown: true, nodes };
}
