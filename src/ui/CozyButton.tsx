import React, { useId } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from "react-native-svg";
import { GameIcon } from "../GameIcon";
import { cozy } from "./theme";

/** Original scalable material artwork. No raster text, atlas slicing or downloaded assets. */
export function Timber({
  green = false,
  muted = false,
}: {
  green?: boolean;
  muted?: boolean;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const top = muted ? "#9b9580" : green ? "#8ba740" : "#c48b4d";
  const bottom = muted ? "#726f63" : green ? "#38551e" : "#78401f";
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 180 56"
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
        </Defs>
        <Rect
          x="1"
          y="1"
          width="178"
          height="54"
          rx="14"
          fill={`url(#${id})`}
          stroke="#593619"
          strokeWidth="2"
        />
        <Rect
          x="4"
          y="4"
          width="172"
          height="47"
          rx="11"
          fill="none"
          stroke="#ffdc8c"
          strokeWidth="1"
          opacity=".7"
        />
        {!green && (
          <>
            <Path
              d="M10 15Q40 10 84 15T170 13M8 38Q65 44 112 37T170 40"
              stroke="#f1bc73"
              opacity=".16"
              strokeWidth="1"
              fill="none"
            />
            <Path
              d="M20 47Q70 44 120 47T164 45"
              stroke="#44250f"
              opacity=".18"
              fill="none"
            />
          </>
        )}
      </Svg>
    </View>
  );
}
export function CozyButton({
  label,
  onPress,
  disabled = false,
  selected,
  quiet = false,
  icon,
  badge,
  accessibilityLabel,
  testID,
  style,
  compact = false,
  role = "button",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  quiet?: boolean;
  icon?: string;
  badge?: number | string;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  role?: "button" | "tab";
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{
        disabled,
        ...(selected === undefined ? {} : { selected }),
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        style,
        pressed &&
          !disabled && { transform: [{ translateY: 1 }], opacity: 0.9 },
        disabled && { opacity: 0.55 },
      ]}
    >
      <Timber
        green={selected === true || (!quiet && selected === undefined)}
        muted={disabled}
      />
      {icon && (
        <GameIcon
          name={icon}
          color={cozy.color.cream}
          size={compact ? 20 : 23}
        />
      )}
      <Text
        numberOfLines={2}
        maxFontSizeMultiplier={1.25}
        style={[styles.label, compact && { fontSize: 11 }]}
      >
        {label}
      </Text>
      {badge !== undefined && (
        <View style={styles.badge}>
          <Text allowFontScaling={false} style={styles.badgeText}>
            {badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    minWidth: 44,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    ...cozy.shadow,
  },
  compact: { minHeight: 44, paddingHorizontal: 9, paddingVertical: 7 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: cozy.color.cream,
    flexShrink: 1,
    textAlign: "center",
    textShadowColor: "#3b2818",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  badge: {
    minWidth: 23,
    minHeight: 23,
    paddingHorizontal: 5,
    borderRadius: 20,
    backgroundColor: cozy.color.paperLight,
    borderWidth: 1,
    borderColor: cozy.color.honey,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: cozy.color.woodDark, fontSize: 11, fontWeight: "800" },
});
