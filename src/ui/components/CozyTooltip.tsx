import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import TooltipArt from "../../../assets/v3/ui/tooltip.svg";
import { textColors } from "../theme/colors";

export interface CozyTooltipProps {
  readonly text: string;
  readonly onDismiss: () => void;
}

/** A small anchored hint, never a full-screen modal, per docs/UI_COMPONENT_CONTRACT_V3.md. */
export function CozyTooltip({ text, onDismiss }: CozyTooltipProps) {
  return (
    <Pressable onPress={onDismiss} accessibilityRole="text" style={styles.wrapper}>
      <View style={StyleSheet.absoluteFill}>
        <TooltipArt width="100%" height="100%" />
      </View>
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "absolute", top: "100%", marginTop: 6, maxWidth: 240, minHeight: 36, padding: 10, zIndex: 10 },
  text: { fontSize: 13, color: textColors.onLightPanel },
});
