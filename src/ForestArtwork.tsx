import React, { useState } from "react";
import { Image, View, StyleSheet } from "react-native";
import { forestImages, forestStructures } from "./assets/forest";
import type { LivingSeason } from "./living/model";
import { imagePoint } from "./living/model";
import { Sprite } from "./living/Sprite";
export function ForestArtwork({
  season,
  levels,
}: {
  season: LivingSeason;
  levels: Record<string, number>;
}) {
  const [bounds, setBounds] = useState({ width: 700, height: 400 });
  return (
    <View
      testID="forest-illustration"
      pointerEvents="none"
      onLayout={(e) => setBounds(e.nativeEvent.layout)}
      style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}
    >
      <Image
        testID={`forest-art-${season}`}
        source={forestImages[season]}
        resizeMode="cover"
        resizeMethod="resize"
        style={StyleSheet.absoluteFill}
        accessible={false}
      />
      {(["greenhouse", "lookout"] as const)
        .filter((id) => (levels[id] ?? 0) > 0)
        .map((id) => {
          const p = imagePoint(
            { x: id === "greenhouse" ? 0.78 : 0.22, y: 0.7 },
            bounds.width,
            bounds.height,
            1672,
            941,
          );
          const width = Math.min(bounds.width * 0.19, bounds.height * 0.45),
            height = width / (id === "greenhouse" ? 1.5 : 1312 / 1199);
          return (
            <View
              key={id}
              testID={`forest-structure-${id}`}
              style={{
                position: "absolute",
                width,
                height,
                left: Math.max(
                  0,
                  Math.min(bounds.width - width, p.x - width / 2),
                ),
                top: Math.max(
                  0,
                  Math.min(bounds.height - height, p.y - height),
                ),
              }}
            >
              <Image
                source={forestStructures[id]}
                resizeMode="contain"
                resizeMethod="resize"
                style={StyleSheet.absoluteFill}
                accessible={false}
              />
              {(levels[id] ?? 0) >= 2 && (
                <View style={{ position: "absolute", bottom: 0, left: "8%" }}>
                  <Sprite kind="blossom" size={13} />
                </View>
              )}
              {(levels[id] ?? 0) >= 3 && (
                <View style={{ position: "absolute", bottom: 0, right: "8%" }}>
                  <Sprite kind="blossom" size={18} />
                </View>
              )}
            </View>
          );
        })}
    </View>
  );
}
