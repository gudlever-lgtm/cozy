import React, { useEffect } from "react";
import { View, Image } from "react-native";
import { cozyRedesignImages } from "../assets/cozyRedesignImages";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { useMotionPolicy } from "./useMotionPolicy";

const PARTICLES = [
  { x: 5, y: 38, kind: "star", size: 24 },
  { x: 13, y: 12, kind: "flower", size: 21 },
  { x: 21, y: 48, kind: "star", size: 25 },
  { x: 29, y: 18, kind: "burst", size: 18 },
  { x: 37, y: 43, kind: "flower", size: 22 },
  { x: 45, y: 8, kind: "star", size: 24 },
  { x: 53, y: 45, kind: "burst", size: 20 },
  { x: 61, y: 15, kind: "flower", size: 23 },
  { x: 69, y: 48, kind: "star", size: 19 },
  { x: 77, y: 10, kind: "burst", size: 24 },
  { x: 85, y: 42, kind: "flower", size: 21 },
  { x: 93, y: 16, kind: "star", size: 22 },
] as const;

function Particle({ item, index }: { item: (typeof PARTICLES)[number]; index: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      index * 95,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1150, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 650, easing: Easing.in(Easing.quad) }),
        ),
        2,
        false,
      ),
    );
    return () => cancelAnimation(progress);
  }, [index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: Math.sin(progress.value * Math.PI) * 0.95,
    transform: [
      { translateY: -progress.value * (34 + (index % 4) * 13) },
      { translateX: Math.sin(progress.value * Math.PI) * ((index % 2 ? 1 : -1) * 15) },
      { rotate: `${progress.value * (index % 2 ? 190 : -190)}deg` },
      { scale: 0.65 + progress.value * 0.55 },
    ],
  }));

  const image = item.kind === "flower"
    ? cozyRedesignImages.effects_sparkle_cluster_webp
    : item.kind === "burst"
      ? cozyRedesignImages.effects_sparkle_burst_webp
      : cozyRedesignImages.effects_shimmer_star_webp;
  return (
    <Animated.Image
      source={image}
      resizeMode="contain"
      accessible={false}
      style={[
        {
          position: "absolute",
          left: `${item.x}%`,
          top: item.y,
          width: item.size,
          height: item.size,
        },
        animatedStyle,
      ]}
    >
    </Animated.Image>
  );
}

export function VictorySparkles({
  enabled,
  reducedMotion,
}: {
  enabled: boolean;
  reducedMotion: boolean;
}) {
  const active = useMotionPolicy(enabled, reducedMotion);
  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height: 92, width: "100%", overflow: "visible", position: "relative" }}
    >
      {active &&
        PARTICLES.map((item, index) => (
          <Particle key={index} item={item} index={index} />
        ))}
      {!active && (
        <Image
          testID="victory-static-shimmer"
          source={cozyRedesignImages.effects_shimmer_trio_webp}
          resizeMode="contain"
          accessible={false}
          style={{ width: 110, height: 74, alignSelf: "center" }}
        />
      )}
    </View>
  );
}
