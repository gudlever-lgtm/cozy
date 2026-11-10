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

// docs/ASSET_SPEC.md's "220x220" is the decoration's own INTRINSIC SVG canvas size
// (contain-fit within that square), not the size it should occupy in the garden
// scene. Measured directly off backgrounds/garden-spring.svg: the house's roof spans
// ~235 of the background's 720 scene units, and its two trees are ~250 units wide.
// Using the intrinsic 220 units directly (the original implementation's bug) made a
// bench render nearly as large as the house. A garden bench/lantern/pot should read
// as clearly smaller than the house — about a third of its width reads right.
const DECORATION_SCENE_SIZE = 80;

export function decorationSizeFraction(sceneWidth: number, sceneHeight: number) {
  return { width: DECORATION_SCENE_SIZE / sceneWidth, height: DECORATION_SCENE_SIZE / sceneHeight };
}
