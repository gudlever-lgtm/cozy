import type { FC } from "react";
import type { SvgProps } from "react-native-svg";
import Bench from "../../../assets/v3/decorations/bench.svg";
import Birdhouse from "../../../assets/v3/decorations/birdhouse.svg";
import FlowerCart from "../../../assets/v3/decorations/flower-cart.svg";
import FlowerPot from "../../../assets/v3/decorations/flower-pot.svg";
import Fountain from "../../../assets/v3/decorations/fountain.svg";
import Lantern from "../../../assets/v3/decorations/lantern.svg";
import Trellis from "../../../assets/v3/decorations/trellis.svg";
import WateringCan from "../../../assets/v3/decorations/watering-can.svg";

export type DecorationKind = "bench" | "birdhouse" | "flower-cart" | "flower-pot" | "fountain" | "lantern" | "trellis" | "watering-can";

export const DECORATION_ART: Record<DecorationKind, FC<SvgProps>> = {
  bench: Bench,
  birdhouse: Birdhouse,
  "flower-cart": FlowerCart,
  "flower-pot": FlowerPot,
  fountain: Fountain,
  lantern: Lantern,
  trellis: Trellis,
  "watering-can": WateringCan,
};

export const DECORATION_KINDS: readonly DecorationKind[] = [
  "bench",
  "birdhouse",
  "flower-cart",
  "flower-pot",
  "fountain",
  "lantern",
  "trellis",
  "watering-can",
];

// docs/ASSET_SPEC.md: Dekorationer 220x220, contain, placement by normalized coordinates.
// Expressed as a fraction of the scene so it matches src/domain/garden's DecorationSize.
export function decorationSizeFraction(sceneWidth: number, sceneHeight: number) {
  return { width: 220 / sceneWidth, height: 220 / sceneHeight };
}
