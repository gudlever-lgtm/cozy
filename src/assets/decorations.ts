import { cozyRedesignImages } from "./cozyRedesignImages";
/** Original generated transparent illustrations, bundled offline; no runtime image URLs. */
export const decorationImages = {
  bridge: cozyRedesignImages.decorations_flower_bridge_webp,
  bench: cozyRedesignImages.decorations_cat_bench_webp,
  lantern: cozyRedesignImages.decorations_hanging_lantern_webp,
  flowers: cozyRedesignImages.decorations_pink_bush_webp,
  forest: require("../../assets/decorations/forest.png"),
} as const;
export type DecorationId =
  keyof typeof decorationImages | "birdhouse" | "teaTable";
