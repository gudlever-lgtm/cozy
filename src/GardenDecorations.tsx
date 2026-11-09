import React from "react";
import { View, Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
} from "react-native-reanimated";
import { useMotionPolicy } from "./living/useMotionPolicy";
import { decorationImages, type DecorationId } from "./assets/decorations";
import { furnitureLevel, type Economy, type Placement } from "./engine/world";
import {
  DECORATION_ANCHORS,
  decorationLayout,
} from "./presentation/decorations";
import { Sprite } from "./living/Sprite";
import { NewGardenArtwork } from "./NewGardenArtwork";
import { FurnitureLevelArtwork } from "./FurnitureLevelArtwork";
import { GardenVisitors } from "./GardenVisitors";
const isNew = (id: DecorationId): id is "birdhouse" | "teaTable" =>
  id === "birdhouse" || id === "teaTable";
export function DecorationArtwork({
  id,
  size = 44,
}: {
  id: DecorationId;
  size?: number;
}) {
  if (isNew(id)) return <NewGardenArtwork id={id} size={size} />;
  return (
    <Image
      testID={`decoration-art-${id}`}
      source={decorationImages[id]}
      resizeMode="contain"
      resizeMethod="resize"
      style={{ width: size, height: size }}
      accessible={false}
    />
  );
}
function CozyObjectMotion({
  kind,
  active,
  width,
}: {
  kind: "birdhouse" | "teaTable";
  active: boolean;
  width: number;
}) {
  const phase = useSharedValue(0);
  React.useEffect(() => {
    if (active)
      phase.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3600 }),
          withTiming(0, { duration: 3600 }),
        ),
        -1,
        false,
      );
    else {
      cancelAnimation(phase);
      phase.value = 0;
    }
    return () => cancelAnimation(phase);
  }, [active, phase]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.15 + phase.value * 0.4,
    transform: [{ translateY: -phase.value * 5 }],
  }));
  return (
    <Animated.View
      testID={"garden-motion-" + kind}
      pointerEvents="none"
      style={[
        { position: "absolute", top: kind === "birdhouse" ? 0 : 10, right: 0 },
        style,
      ]}
    >
      <Sprite kind="glimmer" size={Math.max(12, width * 0.19)} />
    </Animated.View>
  );
}
function LanternGlow({
  active,
  width,
  height,
}: {
  active: boolean;
  width: number;
  height: number;
}) {
  const opacity = useSharedValue(0.12);
  React.useEffect(() => {
    if (active)
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.26, { duration: 2300 }),
          withTiming(0.12, { duration: 3100 }),
        ),
        -1,
        false,
      );
    else {
      cancelAnimation(opacity);
      opacity.value = 0.12;
    }
    return () => cancelAnimation(opacity);
  }, [active, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      testID="decoration-lantern-glow"
      style={[
        { position: "absolute", left: width * 0.18, top: height * 0.18 },
        style,
      ]}
    >
      <Sprite kind="glimmer" size={width * 0.7} />
    </Animated.View>
  );
}
export function GardenDecorations({
  owned,
  placements = [],
  economy,
  width,
  height,
  enabled,
  reducedMotion,
}: {
  owned: string[];
  placements?: Placement[];
  economy?: Economy;
  width: number;
  height: number;
  enabled: boolean;
  reducedMotion: boolean;
}) {
  const moving = useMotionPolicy(enabled, reducedMotion);
  return (
    <View
      testID="garden-decorations"
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      style={StyleSheet.absoluteFill}
    >
      {(Object.keys(DECORATION_ANCHORS) as DecorationId[])
        .filter((id) => owned.includes(id))
        .map((id) => {
          const anchor = decorationLayout(id, width, height);
          const position = placements.find((p) => p.id === id);
          const box = position
            ? {
                ...anchor,
                left: Math.max(
                  0,
                  Math.min(
                    width - anchor.width,
                    (width * position.x) / 100 - anchor.width / 2,
                  ),
                ),
                top: Math.max(
                  0,
                  Math.min(
                    height - anchor.height,
                    (height * position.y) / 100 - anchor.height,
                  ),
                ),
              }
            : anchor;
          const level = economy ? furnitureLevel(economy, id) : 1;
          return (
            <View
              key={id}
              testID={`garden-decoration-${id}`}
              style={{ position: "absolute", ...box }}
            >
              {isNew(id) ? (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <NewGardenArtwork
                    id={id}
                    size={Math.min(box.width, box.height)}
                  />
                </View>
              ) : (
                <Image
                  source={decorationImages[id]}
                  resizeMode="contain"
                  resizeMethod="resize"
                  style={StyleSheet.absoluteFill}
                  accessible={false}
                />
              )}
              {level > 1 && (
                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                  <FurnitureLevelArtwork id={id} level={level} />
                </View>
              )}
              {level > 1 && (
                <View
                  pointerEvents="none"
                  testID={"decoration-upgrade-" + id}
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    flexDirection: "row",
                  }}
                >
                  {Array.from({ length: level - 1 }, (_, i) => (
                    <Sprite
                      key={i}
                      kind="glimmer"
                      size={Math.max(12, box.width * 0.17)}
                    />
                  ))}
                </View>
              )}
              {(id === "birdhouse" || id === "teaTable") && (
                <GardenVisitors
                  kind={id}
                  active={moving}
                  size={Math.min(box.width, box.height)}
                />
              )}
              {(id === "birdhouse" || id === "teaTable") && (
                <CozyObjectMotion kind={id} active={moving} width={box.width} />
              )}
              {id === "lantern" && (
                <LanternGlow
                  active={moving}
                  width={box.width}
                  height={box.height}
                />
              )}
            </View>
          );
        })}
    </View>
  );
}
