import React, { useId } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from "react-native-svg";
import { GameIcon } from "../GameIcon";
import { cozy } from "./theme";
import { cozyRedesignImages } from "../assets/cozyRedesignImages";

/** Original scalable material artwork. No raster text, atlas slicing or downloaded assets. */
export function Timber({
  green = false,
  muted = false,
  paper = false,
}: {
  green?: boolean;
  muted?: boolean;
  paper?: boolean;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const top = paper
    ? muted
      ? "#e3dfd1"
      : green
        ? "#e5efd1"
        : "#fff8e4"
    : muted
      ? "#918979"
      : green
        ? "#6c8739"
        : "#ad7645";
  const bottom = paper
    ? muted
      ? "#cdc7b8"
      : green
        ? "#bdcf92"
        : "#ead4a8"
    : muted
      ? "#6c665c"
      : green
        ? "#334f22"
        : "#744125";
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: 13,
          borderWidth: 1.5,
          borderColor: green ? "#536c2e" : paper ? "#b68d4e" : "#674023",
          overflow: "hidden",
          backgroundColor: bottom,
        },
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: 11, overflow: "hidden" },
        ]}
      >
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
          <Rect x="0" y="0" width="180" height="56" fill={`url(#${id})`} />
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
      <View
        style={{
          position: "absolute",
          left: 3,
          right: 3,
          top: 3,
          bottom: 3,
          borderRadius: 9,
          borderWidth: 1,
          borderColor: paper ? "#fffdf1" : "#e6bd7d",
          opacity: 0.65,
        }}
      />
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
      <Image
        testID={testID ? `${testID}-art` : undefined}
        source={
          selected === true
            ? cozyRedesignImages.ui_button_green_webp
            : quiet || disabled
              ? cozyRedesignImages.ui_button_paper_webp
              : cozyRedesignImages.ui_button_wood_webp
        }
        resizeMode="stretch"
        accessible={false}
        style={styles.buttonArtwork}
      />
      {!compact && !quiet && !disabled && (
        <Image
          source={cozyRedesignImages.ui_flower_corner_left_webp}
          style={styles.flowerAccent}
          resizeMode="contain"
          accessible={false}
        />
      )}
      <View pointerEvents="none" style={styles.content}>
        {icon && (
          <View style={styles.iconSlot}>
            <GameIcon
              name={icon}
              color={quiet || disabled ? cozy.color.woodDark : cozy.color.cream}
              size={compact ? 20 : 23}
            />
          </View>
        )}
        {label.length > 0 && (
          <Text
            testID={testID ? `${testID}-label` : undefined}
            numberOfLines={2}
            maxFontSizeMultiplier={1.2}
            adjustsFontSizeToFit
            style={[
              styles.label,
              (quiet || disabled) && styles.paperLabel,
              compact && styles.compactLabel,
              icon && styles.labelWithIcon,
            ]}
          >
            {label}
          </Text>
        )}
      </View>
      {badge !== undefined && (
        <View pointerEvents="none" style={styles.badge}>
          <Text allowFontScaling={false} style={styles.badgeText}>
            {badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  buttonArtwork: { ...StyleSheet.absoluteFillObject, borderRadius: 15, width: "100%", height: "100%" },
  paperLabel: { color: cozy.color.woodDark, textShadowColor: "transparent" },
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
  compact: { minHeight: 44, paddingHorizontal: 5, paddingVertical: 5 },
  content: {
    alignSelf: "stretch",
    minWidth: 0,
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconSlot: {
    position: "absolute",
    left: 2,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 25,
  },
  labelWithIcon: { marginHorizontal: 30 },
  compactLabel: { fontSize: 11, lineHeight: 14 },
  flowerAccent: { position: "absolute", left: 1, bottom: 1, width: 24, height: 24, opacity: 0.86 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: cozy.color.cream,
    flexShrink: 1,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    textShadowColor: "#3b2818",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  badge: {
    position: "absolute",
    right: 2,
    top: 2,
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
