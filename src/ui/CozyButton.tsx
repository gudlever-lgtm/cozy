import React, { useId, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
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
export type CozyButtonVariant = "bottomTab" | "toolbarAction" | "menuCard" | "dialogChoice";

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
  balanced = false,
  stacked = false,
  variant,
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
  balanced?: boolean;
  stacked?: boolean;
  variant?: CozyButtonVariant;
  role?: "button" | "tab";
}) {
  // Keep the older props compatible; use explicit variants for all major
  // surfaces. The artwork, icon and text share one measured touch target.
  const mode: CozyButtonVariant | "standard" =
    variant ?? (stacked ? "toolbarAction" : balanced ? "dialogChoice" : "standard");
  const vertical = mode === "toolbarAction";
  const iconOnly = mode === "bottomTab" && label.length === 0;
  const labeled = label.length > 0;
  const paper = quiet || disabled;
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPoint, setTooltipPoint] = useState({ x: 12, y: 12 });
  const tooltip = accessibilityLabel || label;
  return (
    <>
    <Pressable
      testID={testID}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{
        disabled,
        ...(selected === undefined ? {} : { selected }),
      }}
      disabled={disabled}
      onPress={() => { setTooltipVisible(false); onPress(); }}
      onLongPress={(event) => {
        if (!tooltip) return;
        const { width, height } = Dimensions.get("window");
        const x = event?.nativeEvent?.pageX ?? width / 2;
        const y = event?.nativeEvent?.pageY ?? height / 2;
        setTooltipPoint({
          x: Math.max(10, Math.min(width - 230, x - 110)),
          y: Math.max(18, Math.min(height - 75, y - 90)),
        });
        setTooltipVisible(true);
      }}
      delayLongPress={450}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        mode === "bottomTab" && styles.bottomTab,
        mode === "toolbarAction" && styles.toolbarAction,
        mode === "menuCard" && styles.menuCard,
        mode === "dialogChoice" && styles.dialogChoice,
        style,
        pressed && !disabled && { transform: [{ translateY: 1 }], opacity: 0.9 },
        disabled && { opacity: 0.7 },
      ]}
    >
      <Image
        testID={testID ? `${testID}-art` : undefined}
        source={
          selected === true
            ? cozyRedesignImages.ui_button_green_webp
            : paper
              ? cozyRedesignImages.ui_button_paper_webp
              : cozyRedesignImages.ui_button_wood_webp
        }
        resizeMode="stretch"
        accessible={false}
        style={styles.buttonArtwork}
      />
      <View
        pointerEvents="none"
        style={[
          styles.content,
          vertical && styles.verticalContent,
          iconOnly && styles.iconOnlyContent,
        ]}
      >
        {icon && (
          <View
            testID={testID ? `${testID}-icon-slot` : undefined}
            style={[
              styles.iconSlot,
              vertical && styles.verticalIcon,
              iconOnly && styles.centerIcon,
            ]}
          >
            <GameIcon
              name={icon}
              color={paper ? cozy.color.woodDark : cozy.color.cream}
              size={mode === "menuCard" ? 30 : mode === "bottomTab" ? 27 : mode === "toolbarAction" ? 28 : 24}
            />
          </View>
        )}
        {labeled && (
          <Text
            testID={testID ? `${testID}-label` : undefined}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            maxFontSizeMultiplier={1.15}
            style={[
              styles.label,
              paper && styles.paperLabel,
              vertical && styles.verticalLabel,
              mode === "toolbarAction" && styles.toolbarLabel,
              mode === "menuCard" && styles.menuLabel,
              mode === "menuCard" && !!icon && styles.menuLabelWithIcon,
              mode === "dialogChoice" && styles.dialogLabel,
              !vertical && !!icon && styles.inlineLabel,
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
    {tooltipVisible && (
      <Modal
        transparent
        visible
        animationType="none"
        onRequestClose={() => setTooltipVisible(false)}
        statusBarTranslucent
      >
        <Pressable
          testID={testID ? `${testID}-tooltip-overlay` : undefined}
          accessibilityRole="button"
          accessibilityLabel={tooltip}
          onPress={() => setTooltipVisible(false)}
          style={styles.tooltipBackdrop}
        >
          <View pointerEvents="none" style={[styles.tooltipCard, { left: tooltipPoint.x, top: tooltipPoint.y }]}>
            <Text
              testID={testID ? `${testID}-tooltip-text` : undefined}
              style={styles.tooltipText}
            >
              {tooltip}
            </Text>
          </View>
        </Pressable>
      </Modal>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    minWidth: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    // Do not apply rectangular box shadows to transparent WebP button artwork.
  },
  compact: { paddingHorizontal: 5, paddingVertical: 4 },
  bottomTab: { height: 54, minHeight: 54, paddingHorizontal: 5 },
  toolbarAction: { minHeight: 88, paddingHorizontal: 9, paddingVertical: 8 },
  // The timber button artwork is a landscape plank: never stretch it into a tall square tile.
  menuCard: { minHeight: 68, paddingHorizontal: 13, paddingVertical: 7 },
  dialogChoice: { minHeight: 68, paddingHorizontal: 16, paddingVertical: 10 },
  buttonArtwork: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  content: {
    width: "100%",
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  verticalContent: {
    flexDirection: "column",
    gap: 2,
    minHeight: 62,
  },
  iconOnlyContent: { flex: 1, justifyContent: "center" },
  iconSlot: {
    position: "absolute",
    left: 1,
    top: 0,
    bottom: 0,
    width: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  verticalIcon: {
    position: "relative",
    left: undefined,
    top: undefined,
    bottom: undefined,
    width: 30,
    height: 30,
    flexShrink: 0,
  },
  centerIcon: {
    position: "relative",
    left: undefined,
    top: undefined,
    bottom: undefined,
    width: 28,
    height: 28,
  },
  label: {
    width: "100%",
    fontSize: 15,
    lineHeight: 19,
    color: cozy.color.cream,
    fontWeight: "700",
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    flexShrink: 1,
    textShadowColor: "#3b2818",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  paperLabel: {
    color: cozy.color.woodDark,
    textShadowColor: "transparent",
  },
  inlineLabel: { paddingHorizontal: 28 },
  verticalLabel: { paddingHorizontal: 2 },
  toolbarLabel: { fontSize: 13, lineHeight: 17 },
  menuLabel: { fontSize: 13, lineHeight: 17 },
  menuLabelWithIcon: { paddingLeft: 32, paddingRight: 3 },
  dialogLabel: { fontSize: 15, lineHeight: 19 },
  tooltipBackdrop: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
  },
  tooltipCard: {
    position: "absolute",
    width: 220,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#bd9253",
    backgroundColor: "#fff1d3",
    elevation: 4,
  },
  tooltipText: {
    color: "#3c2b1d",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 25,
    minHeight: 25,
    paddingHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: cozy.color.honey,
    backgroundColor: cozy.color.paperLight,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: cozy.color.woodDark,
    fontSize: 11,
    fontWeight: "800",
  },
});
