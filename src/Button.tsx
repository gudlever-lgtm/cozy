import { CozyPressable } from "./ui/CozyPressable";
import React from "react";
import { Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, radius, shadow, spacing } from "./theme";

type Variant = "primary" | "wood" | "secondary" | "quiet";

const fills: Record<Variant, { bg: string; border: string; text: string }> = {
  primary: { bg: colors.leaf, border: colors.leafSoft, text: colors.onPrimary },
  wood: { bg: colors.wood, border: colors.woodDark, text: colors.onPrimary },
  secondary: {
    bg: colors.creamTile,
    border: colors.honeyDeep,
    text: colors.leaf,
  },
  quiet: { bg: "transparent", border: "transparent", text: colors.leaf },
};

/** Rounded cottage-garden "wood sign" button, used for primary/secondary actions across the app. */
export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  icon,
  style,
  accessibilityLabel,
  testID,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const fill = fills[variant];
  return (
    <CozyPressable
      variant={variant === "primary" || variant === "wood" ? "wood" : "paper"}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.base,
        { backgroundColor: fill.bg, borderColor: fill.border },
        variant !== "quiet" && shadow.soft,
        disabled && s.disabled,
        pressed && !disabled && s.pressed,
        style,
      ]}
    >
      {icon}
      <Text style={[s.text, { color: fill.text }]} numberOfLines={1}>
        {title}
      </Text>
    </CozyPressable>
  );
}

const s = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  text: { fontWeight: "700", fontSize: 14 },
  disabled: { opacity: 0.42 },
  pressed: { opacity: 0.85 },
});
