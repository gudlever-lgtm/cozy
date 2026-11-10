import type { StringKey } from "../../i18n/strings";
import type { FlowerSymbol } from "../../domain/minigames/flowerMatch";

// No distinct flower illustrations exist in assets/v3/ (only one generic flower.svg
// icon, unused for this exact reason). Tiles show the localized flower name as native
// Text instead of inventing new artwork — the same approach already used for card
// rank/suit (docs/ASSET_SPEC.md: never a generic fallback glyph, but text is not that;
// it's the same pattern as every other label in this app).
export const FLOWER_LABEL_KEY: Record<FlowerSymbol, StringKey> = {
  rose: "flowerRose",
  tulip: "flowerTulip",
  daisy: "flowerDaisy",
  sunflower: "flowerSunflower",
  lily: "flowerLily",
  peony: "flowerPeony",
  iris: "flowerIris",
  poppy: "flowerPoppy",
};
