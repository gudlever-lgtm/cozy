import React, { useEffect } from "react";
import { Text, View } from "react-native";
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
  { x: 5, y: 38, glyph: "✦", color: "#e6b84f", size: 24 },
  { x: 13, y: 12, glyph: "✿", color: "#df8eaa", size: 21 },
  { x: 21, y: 48, glyph: "✧", color: "#f1d77d", size: 25 },
  { x: 29, y: 18, glyph: "✦", color: "#d5a85c", size: 18 },
  { x: 37, y: 43, glyph: "❀", color: "#d98aa5", size: 22 },
  { x: 45, y: 8, glyph: "✧", color: "#f1d77d", size: 24 },
  { x: 53, y: 45, glyph: "✦", color: "#e6b84f", size: 20 },
  { x: 61, y: 15, glyph: "✿", color: "#df8eaa", size: 23 },
  { x: 69, y: 48, glyph: "✧", color: "#f1d77d", size: 19 },
  { x: 77, y: 10, glyph: "✦", color: "#d5a85c", size: 24 },
  { x: 85, y: 42, glyph: "❀", color: "#d98aa5", size: 21 },
  { x: 93, y: 16, glyph: "✧", color: "#f1d77d", size: 22 },
];

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

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: `${item.x}%`,
          top: item.y,
          color: item.color,
          fontSize: item.size,
          fontWeight: "700",
          textShadowColor: "#fff4cc",
          textShadowRadius: 8,
        },
        animatedStyle,
      ]}
    >
      {item.glyph}
    </Animated.Text>
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
        <Text style={{ textAlign: "center", fontSize: 28, color: "#d9ad56" }}>
          ✦　✿　✧
        </Text>
      )}
    </View>
  );
}
