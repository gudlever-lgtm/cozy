import React, { memo, useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import {
  createAmbientObjects,
  curve,
  imagePoint,
  LIGHT_ANCHORS,
  type AmbientObject,
  type LivingSeason,
  type AnimationQuality,
} from "./model";
import { Sprite } from "./Sprite";
import { useMotionPolicy } from "./useMotionPolicy";

const DriftingObject = memo(function DriftingObject({
  object,
  width,
  height,
}: {
  object: AmbientObject;
  width: number;
  height: number;
}) {
  const phase = useSharedValue(0);
  useEffect(() => {
    phase.value = withDelay(
      object.delay,
      withRepeat(
        withSequence(
          withDelay(
            object.pause,
            withTiming(1, {
              duration: object.duration,
              easing: Easing.inOut(Easing.sin),
            }),
          ),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(phase);
  }, [object, phase]);
  const style = useAnimatedStyle(() => {
    const t = phase.value,
      p = curve(object.points, t);
    const fade = Math.max(0, Math.min(1, t * 12, (1 - t) * 12));
    return {
      opacity:
        fade *
        (object.kind === "firefly"
          ? 0.35 + 0.3 * (1 + Math.sin(t * Math.PI * 6))
          : object.kind === "rain"
            ? 0.28
            : 0.75) *
        object.depth *
        object.opacity,
      transform: [
        { translateX: p.x * width },
        { translateY: p.y * height },
        {
          rotate: `${object.rotation + Math.sin(t * Math.PI * 4) * (object.kind === "bird" ? 5 : 15)}deg`,
        },
        { scale: object.depth },
      ],
    };
  });
  return (
    <Animated.View
      testID={`living-sprite-${object.kind}`}
      pointerEvents="none"
      style={[
        styles.object,
        { width: object.size, height: object.size },
        style,
      ]}
    >
      <Sprite kind={object.kind} size={object.size} />
    </Animated.View>
  );
});
const Vegetation = memo(function Vegetation({
  moving,
  kind,
  side,
  width,
  height,
}: {
  moving: boolean;
  kind: "branch" | "flower";
  side: "left" | "right";
  width: number;
  height: number;
}) {
  const phase = useSharedValue(0);
  useEffect(() => {
    if (moving)
      phase.value = withRepeat(
        withTiming(1, {
          duration: kind === "branch" ? 14000 : 11000,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    return () => {
      cancelAnimation(phase);
      phase.value = 0;
    };
  }, [moving, kind, phase]);
  const style = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${Math.sin(phase.value * Math.PI * 2) * (kind === "branch" ? 1.3 : 2.2)}deg`,
      },
      { scaleX: side === "left" ? 1 : -1 },
    ],
  }));
  const size = kind === "branch" ? Math.min(width * 0.18, 110) : 30;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.object,
        {
          left: side === "left" ? 0 : width - size,
          top: kind === "branch" ? 0 : height - 28,
        },
        style,
      ]}
    >
      <Sprite kind={kind} size={size} />
    </Animated.View>
  );
});
const WarmLight = memo(function WarmLight({
  x,
  y,
  index,
  moving,
}: {
  x: number;
  y: number;
  index: number;
  moving: boolean;
}) {
  const phase = useSharedValue(0);
  useEffect(() => {
    if (moving)
      phase.value = withRepeat(
        withTiming(1, { duration: 8000 + index * 1700, easing: Easing.linear }),
        -1,
        false,
      );
    return () => cancelAnimation(phase);
  }, [moving, index, phase]);
  const style = useAnimatedStyle(() => ({
    opacity:
      0.14 +
      (moving
        ? Math.sin(phase.value * Math.PI * 2 + index * 0.9) * 0.025 +
          Math.sin(phase.value * Math.PI * 6 + index) * 0.01
        : 0),
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.object, { left: x - 22, top: y - 22 }, style]}
    >
      <Sprite kind="light" size={44} />
    </Animated.View>
  );
});
const WarmLights = memo(function WarmLights({
  width,
  height,
  moving,
  season,
}: {
  width: number;
  height: number;
  moving: boolean;
  season: LivingSeason;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {LIGHT_ANCHORS[season].map((anchor, index) => {
        const p = imagePoint(anchor, width, height);
        return p.x >= -22 &&
          p.x <= width + 22 &&
          p.y >= -22 &&
          p.y <= height + 22 ? (
          <WarmLight
            key={index}
            x={p.x}
            y={p.y}
            index={index}
            moving={moving}
          />
        ) : null;
      })}
    </View>
  );
});
export type LivingWorldProps = {
  preview?: boolean;
  surface?: "world" | "board";
  season: LivingSeason;
  enabled: boolean;
  quality: AnimationQuality;
  reducedMotion: boolean;
  intensity: number;
  width: number;
  height: number;
  time?: string;
  cottageLights?: boolean;
};
/** Presentation only. Always behind interactive cards/controls; board mode limits particles and omits vegetation. */
export function LivingWorldAnimationEngine({
  season,
  enabled,
  quality,
  reducedMotion,
  intensity,
  width,
  height,
  time = "afternoon",
  cottageLights = true,
  preview = false,
  surface = "world",
}: LivingWorldProps) {
  const active = useMotionPolicy(enabled, reducedMotion);
  const objects = useMemo(() => {
    const all = createAmbientObjects(season, quality, intensity).map(
      (object, index) =>
        preview
          ? {
              ...object,
              delay: index * 120,
              pause: 0,
              duration: Math.min(object.duration, 6000),
              size: object.size * 1.25,
              opacity: 1,
            }
          : object,
    );
    if (surface !== "board") return all;
    const limit = quality === "low" ? 2 : quality === "medium" ? 4 : 6;
    return all
      .filter((object) => object.kind !== "bird" && object.kind !== "butterfly")
      .slice(0, limit);
  }, [season, quality, intensity, preview, surface]);
  return (
    <View
      testID={surface === "board" ? "living-world-board" : "living-world"}
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      <View
        testID="living-behind-trees"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        {active &&
          objects
            .filter((o) => o.layer === "behindTrees")
            .map((object) => (
              <DriftingObject
                key={object.id}
                object={object}
                width={width}
                height={height}
              />
            ))}
      </View>
      <View
        testID="living-foreground"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        {surface !== "board" && (
          <>
            {(["left", "right"] as const).map((side) => (
              <Vegetation
                key={side}
                moving={active}
                kind="branch"
                side={side}
                width={width}
                height={height}
              />
            ))}
            <Vegetation
              moving={active}
              kind="flower"
              side="left"
              width={width}
              height={height}
            />
          </>
        )}
      </View>
      <View
        testID="living-ambient"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        {active &&
          objects
            .filter((o) => o.layer === "ambient")
            .map((object) => (
              <DriftingObject
                key={object.id}
                object={object}
                width={width}
                height={height}
              />
            ))}
        {cottageLights &&
          (season === "winter" || time === "evening" || time === "sunset") && (
            <WarmLights
              moving={active}
              width={width}
              height={height}
              season={season}
            />
          )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  object: { position: "absolute", left: 0, top: 0 },
});
