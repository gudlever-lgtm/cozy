import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { useMotionPolicy } from "./useMotionPolicy";
import { Sprite } from "./Sprite";
function Spark({ index }: { index: number }) {
  const phase = useSharedValue(0);
  useEffect(() => {
    phase.value = withTiming(1, {
      duration: 3500 + index * 170,
      easing: Easing.out(Easing.quad),
    });
    return () => cancelAnimation(phase);
  }, [phase, index]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.sin(phase.value * Math.PI) * 0.5,
    transform: [
      { translateY: -phase.value * (18 + (index % 3) * 5) },
      { rotate: `${phase.value * 12}deg` },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute", left: `${8 + index * 12}%`, top: 24 },
        style,
      ]}
    >
      <Sprite kind="glimmer" size={18} />
    </Animated.View>
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
      style={{ height: 48, overflow: "hidden" }}
    >
      {active &&
        Array.from({ length: 7 }, (_, index) => (
          <Spark key={index} index={index} />
        ))}
    </View>
  );
}
