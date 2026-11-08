import React from "react";
import { Image } from "react-native";
import { cozyRedesignImages } from "./assets/cozyRedesignImages";

/** Production-quality cottage garden sprites for the two quest furniture items.
 * Keeps stable IDs and sizing, so existing placements, purchases, quests and
 * save data continue to work unchanged.
 */
export type NewGardenItem = "birdhouse" | "teaTable";
export function NewGardenArtwork({ id, size = 96 }: { id: NewGardenItem; size?: number }) {
  return (
    <Image
      testID={`new-garden-art-${id}`}
      accessible={false}
      source={
        id === "birdhouse"
          ? cozyRedesignImages.decorations_birdhouse_webp
          : cozyRedesignImages.decorations_tea_table_webp
      }
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
