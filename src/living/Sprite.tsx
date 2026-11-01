import React, { memo } from "react";
import { Image } from "react-native";
import { SvgXml } from "react-native-svg";
import { AMBIENT_SPRITES } from "../assets/ambient";
import { SPRITES } from "./sprites";
export const Sprite = memo(function Sprite({
  kind,
  size,
}: {
  kind:
    keyof typeof SPRITES | keyof typeof AMBIENT_SPRITES | "flower" | "light";
  size: number;
}) {
  if (kind in AMBIENT_SPRITES)
    return (
      <Image
        source={AMBIENT_SPRITES[kind as keyof typeof AMBIENT_SPRITES]}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessible={false}
      />
    );
  if (kind === "light")
    return (
      <Image
        source={AMBIENT_SPRITES.glimmer}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessible={false}
      />
    );
  if (kind === "flower")
    return (
      <Image
        source={AMBIENT_SPRITES.blossom}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessible={false}
      />
    );
  return (
    <SvgXml
      xml={SPRITES[kind as keyof typeof SPRITES]}
      width={size}
      height={size}
    />
  );
});
