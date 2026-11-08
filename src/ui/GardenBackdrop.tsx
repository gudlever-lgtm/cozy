import React from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { cozyImages, type CozySeason } from "../assets/images";

/**
 * Edge-to-edge scenic bleed behind the fitted interactive garden plane.
 * The fitted scene above this background owns all touches and placements;
 * this layer must never intercept gestures or distort camera coordinates.
 */
export function GardenBackdrop({ season }: { season: CozySeason }) {
  const { width, height } = useWindowDimensions();
  const source =
    height > width && season === "spring"
      ? cozyImages.gardenPortrait
      : cozyImages.seasons[season];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} testID="garden-scenic-bleed">
      <Image
        accessible={false}
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        resizeMethod="resize"
        fadeDuration={0}
        blurRadius={12}
      />
    </View>
  );
}
