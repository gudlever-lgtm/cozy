import { CozyPressable } from "./ui/CozyPressable";
import { cozy } from "./ui/theme";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { GameIcon } from "./GameIcon";
import type { Wallet } from "./engine/world";
import { number } from "./i18n";
export function MaterialRibbon({
  wallet,
  onOpen,
}: {
  wallet: Wallet;
  onOpen: () => void;
}) {
  const { t, i18n } = useTranslation();
  const keys = ["wood", "stone", "flowers", "seeds"] as const;
  return (
    <View testID="materials-ribbon" pointerEvents="box-none" style={s.root}>
      <CozyPressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={
          String(t("materialOverview")) +
          ". " +
          keys
            .map(
              (key) =>
                t(key === "flowers" ? "flowersResource" : key) +
                ": " +
                number(wallet[key], i18n.language),
            )
            .join(" · ")
        }
        style={s.bar}
      >
        {keys.map((key) => (
          <View key={key} style={s.material}>
            <GameIcon
              name={key === "flowers" ? "decorations" : key}
              size={20}
            />
            <Text numberOfLines={1} adjustsFontSizeToFit style={s.amount}>
              {number(wallet[key], i18n.language)}
            </Text>
          </View>
        ))}
        <Text style={s.chevron}>›</Text>
      </CozyPressable>
    </View>
  );
}
const s = StyleSheet.create({
  root: {
    flexShrink: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },
  bar: {
    height: 44,
    maxWidth: "100%",
    paddingHorizontal: 8,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#d7c28f",
    backgroundColor: cozy.color.glass,
  },
  material: {
    minWidth: 28,
    maxWidth: 80,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  amount: {
    fontSize: 13,
    fontWeight: "700",
    color: cozy.color.ink,
    flexShrink: 1,
  },
  chevron: { fontSize: 22, color: cozy.color.ink },
});
