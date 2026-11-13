import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ButtonPrimary from "../../../assets/v3/ui/button-primary.svg";
import ButtonSecondary from "../../../assets/v3/ui/button-secondary.svg";
import ButtonWood from "../../../assets/v3/ui/button-wood.svg";
import ButtonSpecial from "../../../assets/v3/ui/button-special.svg";
import ButtonDisabled from "../../../assets/v3/ui/button-disabled.svg";
import { buttonTokens } from "../theme/layoutTokens";
import { textColors } from "../theme/colors";
import { buttonLabelBounds } from "../theme/buttonGeometry";
import { useUniqueSvgIdsRef } from "./useUniqueSvgIds";

export type CozyButtonVariant = "primary" | "secondary" | "wood" | "special";

const ART: Record<CozyButtonVariant, React.FC<any>> = {
  primary: ButtonPrimary,
  secondary: ButtonSecondary,
  wood: ButtonWood,
  special: ButtonSpecial,
};

const TEXT_COLOR: Record<CozyButtonVariant, string> = {
  primary: textColors.onDarkWood,
  secondary: textColors.onLightPanel,
  wood: textColors.onDarkWood,
  special: textColors.onDarkWood,
};

export interface CozyButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: CozyButtonVariant;
  readonly disabled?: boolean;
  readonly width?: number;
  readonly accessibilityLabel?: string;
}

/** Illustrated button. Scales non-destructively (SVG "meet": uniform scale, no stretch)
 * per docs/ASSET_SPEC.md; the label is native Text drawn in the safe label zone from
 * docs/ui-layout-tokens.v3.json, never baked into the artwork. */
export function CozyButton({ label, onPress, variant = "primary", disabled = false, width, accessibilityLabel }: CozyButtonProps) {
  const uidRef = useUniqueSvgIdsRef();
  const token = buttonTokens[variant];
  const w = Math.min(Math.max(width ?? token.minWidth, token.minWidth), token.maxWidth);
  const h = token.minHeight;
  const Art = disabled ? ButtonDisabled : ART[variant];
  const labelBounds = buttonLabelBounds(w, h, token.safeLabelFraction);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={({ pressed }) => [{ width: w, height: h, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={StyleSheet.absoluteFill} ref={uidRef}>
        <Art width={w} height={h} />
      </View>
      <View
        style={[
          styles.labelZone,
          { left: labelBounds.left, right: w - labelBounds.right, height: h },
        ]}
      >
        <Text
          numberOfLines={token.maxLines}
          style={[styles.label, { fontSize: token.fontSize, color: disabled ? textColors.onLightPanel : TEXT_COLOR[variant] }]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  labelZone: {
    position: "absolute",
    top: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
  },
});
