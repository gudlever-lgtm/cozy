import { View } from "react-native";
import React, { memo, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { cozyImages } from "../assets/images";
import { useMotionPolicy } from "./useMotionPolicy";
/** Whole-image translation only: never fake articulated poses or stretch the supplied illustration. */
export const CharacterIdle = memo(function CharacterIdle({
  character,
  enabled,
  reducedMotion,
}: {
  character: "millie" | "marmalade";
  enabled: boolean;
  reducedMotion: boolean;
}) {
  const moving = useMotionPolicy(enabled, reducedMotion),
    phase = useSharedValue(0);
  useEffect(() => {
    if (moving)
      phase.value = withRepeat(
        withTiming(1, {
          duration: character === "millie" ? 8500 : 11000,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    return () => {
      cancelAnimation(phase);
      phase.value = 0;
    };
  }, [moving, character, phase]);
  const style = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: moving
          ? Math.sin(phase.value * Math.PI * 2) *
            (character === "millie" ? 1.3 : 0.65)
          : 0,
      },
    ],
  }));
  return (
    <View pointerEvents="none" style={{ width: 80, height: 100 }}>
      <Animated.Image
        testID={`living-character-${character}`}
        source={cozyImages.characters[character]}
        style={[{ width: 80, height: 100 }, style]}
        resizeMode="contain"
        accessible={false}
      />
    </View>
  );
});
