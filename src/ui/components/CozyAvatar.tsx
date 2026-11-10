import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Bird from "../../../assets/v3/avatars/bird.svg";
import Cat from "../../../assets/v3/avatars/cat.svg";
import Fox from "../../../assets/v3/avatars/fox.svg";
import Hedgehog from "../../../assets/v3/avatars/hedgehog.svg";
import Owl from "../../../assets/v3/avatars/owl.svg";
import Rabbit from "../../../assets/v3/avatars/rabbit.svg";
import { textColors } from "../theme/colors";

export type AvatarKey = "bird" | "cat" | "fox" | "hedgehog" | "owl" | "rabbit";

export const AVATAR_ART: Record<AvatarKey, React.FC<any>> = { bird: Bird, cat: Cat, fox: Fox, hedgehog: Hedgehog, owl: Owl, rabbit: Rabbit };
export const AVATAR_KEYS: readonly AvatarKey[] = ["bird", "cat", "fox", "hedgehog", "owl", "rabbit"];

export interface CozyAvatarProps {
  readonly avatarKey: AvatarKey;
  readonly size?: number;
  readonly selected?: boolean;
  readonly onPress?: () => void;
  readonly accessibilityLabel: string;
}

/** Full avatar art only, never a cropped or emoji fallback, per docs/UI_COMPONENT_CONTRACT_V3.md. */
export function CozyAvatar({ avatarKey, size = 56, selected, onPress, accessibilityLabel }: CozyAvatarProps) {
  const Art = AVATAR_ART[avatarKey];
  const content = (
    <View style={[styles.circle, { width: size, height: size, borderWidth: selected ? 3 : 0 }]}>
      <Art width={size} height={size} />
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: !!selected }}
      hitSlop={8}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: { borderRadius: 999, borderColor: textColors.onLightPanel, overflow: "hidden" },
});
