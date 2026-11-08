import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { GameIcon } from "../GameIcon";
import { cozyImages } from "../assets/images";
import { cozy } from "./theme";
export function ResourceBadge({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number | string;
}) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} style={s.root}>
      {icon === "glimmer" ? (
        <Image source={cozyImages.rewardShimmer} style={{ width: 25, height: 25 }} resizeMode="contain" accessible={false} />
      ) : (
        <GameIcon name={icon} size={22} />
      )}
      <View style={{ minWidth: 0 }}>
        <Text style={s.label} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {label}
        </Text>
        <Text style={s.value} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cozy.color.border,
    backgroundColor: cozy.color.glass,
    ...cozy.shadow,
  },
  label: { fontSize: 9, color: cozy.color.muted, fontWeight: "600" },
  value: { fontSize: 15, color: cozy.color.ink, fontWeight: "800" },
});
