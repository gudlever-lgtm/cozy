import React from "react";
import { StyleSheet, Text, View } from "react-native";
import HudPillArt from "../../../assets/v3/ui/hud-pill.svg";
import { hudChipTokens } from "../theme/layoutTokens";
import { textColors } from "../theme/colors";

export interface CozyHUDChipProps {
  readonly icon: React.FC<any>;
  readonly value: string | number;
  readonly label?: string;
}

/** Resource/status readout (e.g. Lysglimt balance). Icon and numeral in separate zones,
 * never baked into the pill artwork. */
export function CozyHUDChip({ icon: Icon, value, label }: CozyHUDChipProps) {
  const height = hudChipTokens.height;
  return (
    <View style={[styles.wrapper, { minWidth: hudChipTokens.minWidth, height }]} accessibilityLabel={label ? `${label}: ${value}` : String(value)}>
      <View style={StyleSheet.absoluteFill}>
        <HudPillArt width="100%" height="100%" />
      </View>
      <View style={styles.content}>
        <Icon width={hudChipTokens.iconSize} height={hudChipTokens.iconSize} />
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 12 },
  content: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  value: { fontSize: 16, fontWeight: "700", color: textColors.onLightPanel },
});
