import type { DecorationKind } from "./decorationCatalog";

/** Earned in play only: no real-money payments or advertising. */
export const DECORATION_COST: Readonly<Record<DecorationKind, number>> = {
  "bench": 25,
  "birdhouse": 15,
  "flower-cart": 25,
  "flower-pot": 10,
  "fountain": 40,
  "lantern": 15,
  "trellis": 20,
  "watering-can": 10,
};
