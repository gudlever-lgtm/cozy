import { View, Image } from "react-native";
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
import { cozyRedesignImages } from "../assets/cozyRedesignImages";
import { useMotionPolicy } from "./useMotionPolicy";
/** Whole-image translation only: never fake articulated poses or stretch the supplied illustration. */
export const CharacterIdle = memo(function CharacterIdle({
  character,
  enabled,
  reducedMotion,
  size = 80,
}: {
  character: "millie" | "marmalade";
  enabled: boolean;
  reducedMotion: boolean;
  size?: number;
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
  const alternateStyle = useAnimatedStyle(() => ({
    opacity: moving
      ? Math.max(0, Math.sin(phase.value * Math.PI * 2)) * 0.85
      : 0,
  }));
  const idle =
    character === "millie"
      ? cozyImages.avatars.millie
      : cozyImages.avatars.marmalade;
  const alternate =
    character === "millie"
      ? cozyRedesignImages.characters_millie_wave_webp
      : cozyRedesignImages.characters_marmalade_look_up_webp;
  return (
    <View pointerEvents="none" style={{ width: size, height: size * 1.25, overflow: "hidden" }}>
      <Animated.View
        style={[{ width: size, height: size * 1.25 }, style]}
        pointerEvents="none"
      >
        <Image
          testID={`living-character-${character}`}
          source={idle}
          style={{ width: size, height: size * 1.25 }}
          resizeMode="contain"
          accessible={false}
        />
        {moving && (
          <Animated.Image
            testID={`living-character-pose-${character}`}
            source={alternate}
            style={[{ width: size, height: size * 1.25, position: "absolute", top: 0, left: 0 }, alternateStyle]}
            resizeMode="contain"
            accessible={false}
          />
        )}
      </Animated.View>
    </View>
  );
});
