import { canMove, type Game, type Place } from "../engine/solitaire";
export type DropRegion = {
  place: Place;
  x: number;
  y: number;
  width: number;
  height: number;
  landingY?: number;
  cardHeight?: number;
};
export type DragBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};
/** Resolve one legal destination using the dragged card footprint and the final finger position. */
export function dropDestination(
  game: Game,
  from: Place,
  x: number,
  y: number,
  regions: DropRegion[],
  drag?: DragBounds,
): Place | undefined {
  const overlap = (r: DropRegion) => {
    if (!drag) return 0;
    const top = r.landingY ?? r.y,
      height = r.cardHeight ?? r.height;
    const w = Math.max(
      0,
      Math.min(drag.x + drag.width, r.x + r.width) - Math.max(drag.x, r.x),
    );
    const h = Math.max(
      0,
      Math.min(drag.y + drag.height, top + height) - Math.max(drag.y, top),
    );
    return w * h;
  };
  const candidates = regions.filter(
    (r) =>
      r.width > 0 &&
      r.height > 0 &&
      canMove(game, from, r.place) &&
      ((x >= r.x - 14 &&
        x <= r.x + r.width + 14 &&
        y >= r.y - 14 &&
        y <= r.y + r.height + 14) ||
        overlap(r) > 0),
  );
  return candidates.sort(
    (a, b) =>
      overlap(b) - overlap(a) ||
      Math.hypot(
        x - a.x - a.width / 2,
        y - (a.landingY ?? a.y) - (a.cardHeight ?? a.height) / 2,
      ) -
        Math.hypot(
          x - b.x - b.width / 2,
          y - (b.landingY ?? b.y) - (b.cardHeight ?? b.height) / 2,
        ),
  )[0]?.place;
}
export function boardMetrics(width: number, height: number) {
  const rail = 104;
  const available = width - rail - 40;
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

/** Geometry uses the board's measured viewport, after tabs/status/controls have taken their space. */
export function fitSolitaireBoard(
  width: number,
  height: number,
  piles: readonly (readonly { up: boolean }[])[],
) {
  const padding = 10;
  const gap = 8;
  const innerWidth = Math.max(1, width - padding * 2);
  const innerHeight = Math.max(1, height - padding * 2);
  // Card size depends only on the viewport; a move never resizes unrelated columns.
  const cardWidth = Math.max(
    1,
    Math.min(
      100,
      Math.floor((innerWidth - 24) / 7),
      Math.floor((innerHeight - gap) / (1.44 * 2.05)),
    ),
  );
  const cardHeight = cardWidth * 1.44;
  const tableauHeight = Math.max(cardHeight, innerHeight - cardHeight - gap);
  const columns = piles.map((pile) => {
    const firstOpen = pile.findIndex((c) => c.up);
    const last = pile.length - 1;
    const fullRunHeight = pile
      .slice(0, -1)
      .reduce(
        (sum, card) =>
          sum +
          (card.up
            ? Math.min(28, cardHeight * 0.32)
            : Math.min(8, cardHeight * 0.12)),
        0,
      );
    const hasRoomForFullRun =
      fullRunHeight <= Math.max(0, tableauHeight - cardHeight);
    const hiddenIndices = pile
      .map((_, i) => i)
      .filter(
        (i) =>
          !hasRoomForFullRun && firstOpen >= 0 && i > firstOpen && i < last,
      );
    const visibleIndices = pile
      .map((_, i) => i)
      .filter((i) => !hiddenIndices.includes(i));
    const desired = visibleIndices
      .slice(0, -1)
      .map((i) =>
        pile[i].up
          ? Math.min(28, cardHeight * 0.32)
          : Math.min(8, cardHeight * 0.12),
      );
    const total = desired.reduce((sum, n) => sum + n, 0);
    const budget = Math.max(0, tableauHeight - cardHeight);
    const compression = total > 0 ? Math.min(1, budget / total) : 1;
    const offsets = pile.map(() => 0);
    let y = 0;
    visibleIndices.forEach((index, i) => {
      offsets[index] = y;
      y += (desired[i] ?? 0) * compression;
    });
    // Hidden cards remain in the engine and can be selected through the stack picker.
    hiddenIndices.forEach((i) => {
      offsets[i] = offsets[firstOpen];
    });
    return { offsets, visibleIndices, hiddenIndices, height: cardHeight + y };
  });
  return {
    padding,
    gap,
    cardWidth,
    cardHeight,
    tableauHeight,
    columns,
    usedHeight: padding * 2 + cardHeight + gap + tableauHeight,
  };
}
