import { canMove, type Game, type Place } from "../engine/solitaire";
export type DropRegion = {
  place: Place;
  x: number;
  y: number;
  width: number;
  height: number;
};
/** Resolve one legal destination, with a forgiving touch margin; never apply several measured callbacks. */
export function dropDestination(
  game: Game,
  from: Place,
  x: number,
  y: number,
  regions: DropRegion[],
): Place | undefined {
  return regions
    .filter(
      (r) =>
        r.width > 0 &&
        r.height > 0 &&
        x >= r.x - 14 &&
        x <= r.x + r.width + 14 &&
        y >= r.y - 14 &&
        y <= r.y + r.height + 14 &&
        canMove(game, from, r.place),
    )
    .sort(
      (a, b) =>
        Math.hypot(x - a.x - a.width / 2, y - a.y - a.height / 2) -
        Math.hypot(x - b.x - b.width / 2, y - b.y - b.height / 2),
    )[0]?.place;
}
export function boardMetrics(width: number, height: number) {
  const rail = width < 800 ? 100 : 136;
  const available = width - rail * 2 - 40;
  const cardWidth = Math.max(
    30,
    Math.min(
      88,
      Math.floor((available - 48) / 7),
      Math.floor((height - 52) / 3.4),
    ),
  );
  const cardHeight = cardWidth * 1.44;
  // Independent of pile lengths: a move must never resize/reposition every other card.
  const step = Math.max(
    18,
    Math.min(28, Math.floor((height - cardHeight * 2 - 52) / 8)),
  );
  return { rail, cardWidth, cardHeight, step };
}
