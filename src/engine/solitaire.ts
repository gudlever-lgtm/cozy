export type Suit = "♠" | "♥" | "♣" | "♦";
export type Card = { id: string; suit: Suit; rank: number; up: boolean };
export type Board = {
  stock: Card[];
  waste: Card[];
  tableau: Card[][];
  foundations: Card[][];
};
export type Game = Board & {
  id: string;
  draw: 1 | 3;
  moves: number;
  history: Board[];
  initial: Board;
  won: boolean;
  challenge?: string;
};
export type Place =
  | { kind: "tableau" | "foundations"; pile: number; index?: number }
  | { kind: "waste" };
export const suits: Suit[] = ["♠", "♥", "♣", "♦"];
export const red = (c: Card) => c.suit === "♥" || c.suit === "♦";
export const snapshot = (g: Board): Board =>
  JSON.parse(
    JSON.stringify({
      stock: g.stock,
      waste: g.waste,
      tableau: g.tableau,
      foundations: g.foundations,
    }),
  );
export function newGame(
  id: string,
  draw: 1 | 3 = 1,
  random = Math.random,
): Game {
  const deck: Card[] = suits.flatMap((suit) =>
    Array.from({ length: 13 }, (_, i) => ({
      id: `${suit}${i + 1}`,
      suit,
      rank: i + 1,
      up: false,
    })),
  );
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const tableau = Array.from({ length: 7 }, (_, i) => {
    const p = deck.splice(0, i + 1);
    p[i].up = true;
    return p;
  });
  const b: Board = {
    stock: deck,
    waste: [],
    tableau,
    foundations: [[], [], [], []],
  };
  return {
    ...b,
    id,
    draw,
    moves: 0,
    history: [],
    initial: snapshot(b),
    won: false,
  };
}
export function cardsAt(g: Board, p: Place): Card[] {
  if (p.kind === "waste") return g.waste.slice(-1);
  const pile = g[p.kind][p.pile];
  if (!pile) return [];
  return pile.slice(p.index ?? pile.length - 1);
}
export function canMove(g: Board, from: Place, to: Place): boolean {
  if (to.kind === "waste" || (from.kind === to.kind && from.pile === to.pile))
    return false;
  const cards = cardsAt(g, from);
  if (!cards.length || !cards.every((c) => c.up)) return false;
  if (from.kind === "foundations" && cards.length !== 1) return false;
  for (let i = 1; i < cards.length; i++)
    if (
      cards[i - 1].rank !== cards[i].rank + 1 ||
      red(cards[i - 1]) === red(cards[i])
    )
      return false;
  const pile = g[to.kind][to.pile];
  if (!pile) return false;
  const top = pile.at(-1),
    c = cards[0];
  if (to.kind === "foundations")
    return (
      cards.length === 1 &&
      (!top ? c.rank === 1 : top.suit === c.suit && c.rank === top.rank + 1)
    );
  return !top
    ? c.rank === 13
    : top.up && red(top) !== red(c) && top.rank === c.rank + 1;
}
function update(g: Game, mutate: (b: Board) => void): Game {
  const b = snapshot(g);
  mutate(b);
  for (const p of b.tableau) if (p.length) p[p.length - 1].up = true;
  return {
    ...g,
    ...b,
    moves: g.moves + 1,
    history: [...g.history.slice(-199), snapshot(g)],
    won: victory(b),
  };
}
export function move(g: Game, from: Place, to: Place): Game {
  if (!canMove(g, from, to) || to.kind === "waste") return g;
  return update(g, (b) => {
    const p = from.kind === "waste" ? b.waste : b[from.kind][from.pile];
    const n = cardsAt(b, from).length;
    b[to.kind][to.pile].push(...p.splice(p.length - n));
  });
}
export function drawCards(g: Game): Game {
  if (g.won || (!g.stock.length && !g.waste.length)) return g;
  return update(g, (b) => {
    if (!b.stock.length) {
      b.stock = b.waste.reverse().map((c) => ({ ...c, up: false }));
      b.waste = [];
    } else
      for (let i = 0; i < g.draw && b.stock.length; i++) {
        const c = b.stock.pop()!;
        c.up = true;
        b.waste.push(c);
      }
  });
}
export function undo(g: Game): Game {
  const b = g.history.at(-1);
  return b
    ? {
        ...g,
        ...snapshot(b),
        history: g.history.slice(0, -1),
        moves: Math.max(0, g.moves - 1),
        won: victory(b),
      }
    : g;
}
export const restart = (g: Game): Game => ({
  ...g,
  ...snapshot(g.initial),
  history: [],
  moves: 0,
  won: false,
});
export const victory = (g: Board) =>
  g.foundations.every((p) => p.length === 13);
export function hints(g: Game): { from: Place; to: Place }[] {
  const from: Place[] = [
    { kind: "waste" },
    ...g.tableau.flatMap((p, pile) =>
      p.map((_, index) => ({ kind: "tableau" as const, pile, index })),
    ),
  ];
  const to: Place[] = [
    ...g.foundations.map((_, pile) => ({ kind: "foundations" as const, pile })),
    ...g.tableau.map((_, pile) => ({ kind: "tableau" as const, pile })),
  ];
  return from
    .flatMap((f) =>
      to.filter((t) => canMove(g, f, t)).map((t) => ({ from: f, to: t })),
    )
    .filter(
      (h) =>
        !(
          h.from.kind === "tableau" &&
          h.from.index === 0 &&
          h.to.kind === "tableau" &&
          !g.tableau[h.to.pile].length
        ),
    );
}
export function autoComplete(g: Game): Game {
  // Only finish when every remaining card is exposed; never gamble hidden progress.
  if (
    g.stock.length ||
    g.waste.length ||
    g.tableau.some((p) => p.some((c) => !c.up))
  )
    return g;
  let next = g;
  for (let n = 0; n < 52; n++) {
    const h = hints(next).find((h) => h.to.kind === "foundations");
    if (!h) break;
    next = move(next, h.from, h.to);
  }
  return next;
}
