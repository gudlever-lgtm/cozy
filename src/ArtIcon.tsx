import React from "react";
import { View, Image } from "react-native";
import { cozyImages } from "./assets/images";
/** Reviewed isolated cells in the original icon/resource atlases, rendered natively without modifying the sheets. */
const ui: Record<string, [number, number]> = {
  settings: [0, 0],
  music: [1, 0],
  sound: [2, 0],
  hint: [0, 1],
  undo: [1, 1],
  shuffle: [2, 1],
  garden: [0, 2],
  quests: [1, 2],
  world: [2, 2],
};
const resources: Record<string, [number, number]> = {
  glimmer: [0, 0],
  wood: [1, 0],
  stone: [2, 0],
  flowers: [3, 0],
  seeds: [0, 1],
  leaves: [1, 1],
  heart: [2, 1],
  star: [3, 1],
};
export function ArtIcon({ name, size = 32 }: { name: string; size?: number }) {
  const cell = ui[name],
    resource = resources[name];
  if (!cell && !resource) return null;
  const x = cell ? cell[0] * 418 : resource![0] * 313.5;
  const y = cell ? cell[1] * 418 : resource![1] === 0 ? 266 : 640;
  const w = cell ? 418 : 313.5,
    h = cell ? 418 : resource![1] === 0 ? 380 : 350;
  const scale = Math.min(size / w, size / h);
  return (
    <View
      testID={`art-icon-${name}`}
      pointerEvents="none"
      style={{ width: size, height: size, overflow: "hidden" }}
    >
      <Image
        source={cell ? cozyImages.sheets.ui : cozyImages.sheets.resources}
        resizeMode="stretch"
        accessible={false}
        style={{
          position: "absolute",
          width: 1254 * scale,
          height: 1254 * scale,
          left: -x * scale + (size - w * scale) / 2,
          top: -y * scale + (size - h * scale) / 2,
        }}
      />
    </View>
  );
}
