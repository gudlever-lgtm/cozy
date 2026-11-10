import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import IconButtonArt from "../../../assets/v3/ui/icon-button.svg";
import { buttonTokens } from "../theme/layoutTokens";
import { CozyTooltip } from "./CozyTooltip";

export interface CozyIconButtonProps {
  readonly icon: React.FC<any>;
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
  readonly longPressHint?: string;
  readonly selected?: boolean;
  readonly disabled?: boolean;
}

/** Icon-only control: approved icon art centered over the approved icon-button frame,
 * never an emoji substitute. A long press shows a short text hint (CozyTooltip) rather
 * than relying on the icon alone to explain itself. */
export function CozyIconButton({ icon: Icon, accessibilityLabel, onPress, longPressHint, selected, disabled }: CozyIconButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const size = buttonTokens.icon.size;
  const iconSize = size * buttonTokens.icon.iconMaxFraction;

  return (
    <View>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onLongPress={longPressHint ? () => setShowTooltip(true) : undefined}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: !!disabled, selected: !!selected }}
        hitSlop={4}
        style={({ pressed }) => [
          styles.pressable,
          { width: size, height: size, opacity: pressed ? 0.85 : disabled ? 0.5 : 1 },
          selected ? styles.selected : null,
        ]}
      >
        <View style={StyleSheet.absoluteFill}>
          <IconButtonArt width={size} height={size} />
        </View>
        <View style={styles.iconCenter}>
          <Icon width={iconSize} height={iconSize} />
        </View>
      </Pressable>
      {showTooltip && longPressHint ? <CozyTooltip text={longPressHint} onDismiss={() => setShowTooltip(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: { alignItems: "center", justifyContent: "center", borderRadius: 999 },
  iconCenter: { position: "absolute", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" },
  // Same gold tone as the decoration-selection glow (sampled from the approved UI
  // frames' own border color) so "selected" reads consistently across the app.
  selected: { borderWidth: 2, borderColor: "#d2a44d" },
});
