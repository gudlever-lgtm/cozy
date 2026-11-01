import React, { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { ForestArtwork } from "./ForestArtwork";
import { buildings, type AreaId } from "./engine/progression";
import { areaImages } from "./assets/areas";
import { cozyImages } from "./assets/images";
import { decorationImages } from "./assets/decorations";
import { forestStructures } from "./assets/forest";
import { imagePoint, type LivingSeason } from "./living/model";
import { Sprite } from "./living/Sprite";
/** Illustrated scenes share the original cottage palette; upgrades remain visible at authored positions. */
export function WorldArt({
  area,
  levels,
  season = "spring",
}: {
  area: AreaId;
  levels: Record<string, number>;
  season?: LivingSeason;
}) {
  if (area === "forest")
    return <ForestArtwork season={season} levels={levels} />;
  if (area === "cottage")
    return (
      <Image
        source={cozyImages.seasons[season]}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        accessible={false}
      />
    );
  return <AreaArtwork area={area} season={season} levels={levels} />;
}
function AreaArtwork({
  area,
  season,
  levels,
}: {
  area: "river" | "village" | "winterland";
  season: LivingSeason;
  levels: Record<string, number>;
}) {
  const [bounds, setBounds] = useState({ width: 700, height: 400 });
  const key =
    area === "river" && season === "winter"
      ? "riverWinter"
      : area === "village" && season === "winter"
        ? "villageWinter"
        : area;
  const improvements = {
    pier: {
      image: decorationImages.bridge,
      aspect: 1.5,
      x: 0.58,
      y: 0.86,
      width: 0.14,
    },
    pond: {
      image: decorationImages.flowers,
      aspect: 1312 / 1199,
      x: 0.24,
      y: 0.85,
      width: 0.08,
    },
    teahouse: {
      image: decorationImages.bench,
      aspect: 1.5,
      x: 0.46,
      y: 0.82,
      width: 0.12,
    },
    gazebo: {
      image: decorationImages.forest,
      aspect: 1374 / 1145,
      x: 0.74,
      y: 0.82,
      width: 0.11,
    },
    winterlights: {
      image: decorationImages.lantern,
      aspect: 1024 / 1536,
      x: 0.27,
      y: 0.76,
      width: 0.055,
    },
    conservatory: {
      image: forestStructures.greenhouse,
      aspect: 1.5,
      x: 0.76,
      y: 0.76,
      width: 0.16,
    },
  };
  return (
    <View
      testID={`world-illustration-${area}`}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}
      onLayout={(e) => setBounds(e.nativeEvent.layout)}
    >
      <Image
        testID={`area-art-${key}`}
        source={areaImages[key]}
        resizeMode="cover"
        resizeMethod="resize"
        style={StyleSheet.absoluteFill}
        accessible={false}
      />
      {buildings
        .filter((b) => b.area === area && (levels[b.id] ?? 0) > 0)
        .map((b) => {
          const art = improvements[b.id as keyof typeof improvements];
          const point = imagePoint(art, bounds.width, bounds.height, 1672, 941);
          const width = Math.min(
              bounds.width * art.width,
              bounds.height * 0.3 * art.aspect,
            ),
            height = width / art.aspect;
          return (
            <View
              key={b.id}
              testID={`world-improvement-${b.id}`}
              style={{
                position: "absolute",
                left: Math.max(
                  0,
                  Math.min(bounds.width - width, point.x - width / 2),
                ),
                top: Math.max(
                  0,
                  Math.min(bounds.height - height, point.y - height),
                ),
                width,
                height,
              }}
            >
              <Image
                source={art.image}
                resizeMode="contain"
                resizeMethod="resize"
                style={StyleSheet.absoluteFill}
                accessible={false}
              />
              {Array.from(
                { length: Math.max(0, Math.min(3, levels[b.id] ?? 0) - 1) },
                (_, i) => (
                  <View
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${10 + i * 55}%`,
                      bottom: -2,
                    }}
                  >
                    <Sprite kind="blossom" size={13 + i * 2} />
                  </View>
                ),
              )}
            </View>
          );
        })}
    </View>
  );
}
