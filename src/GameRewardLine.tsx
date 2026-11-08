import { cozy } from "./ui/theme";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { gameReward, type GameRewardKind } from "./engine/world";
import { GameIcon } from "./GameIcon";
export function GameRewardLine({
  kind,
  level = 1,
  compact = false,
}: {
  kind: GameRewardKind;
  level?: 1 | 2 | 3;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const entries = Object.entries(gameReward(kind, level));
  const label = entries
    .map(([r, n]) => `+${n} ${t(r === "flowers" ? "flowersResource" : r)}`)
    .join(" · ");
  return (
    <View
      testID={`repeat-rewards-${kind}`}
      accessible
      accessibilityLabel={String(t("repeatRewards")) + ": " + label}
      style={[styles.row, { gap: compact ? 4 : 8 }]}
    >
      <Text style={[styles.description, { fontSize: compact ? 11 : 13 }]}>
        {String(
          t(kind === "solitaire" ? "mainProgressReward" : "miniHelpReward", {
            count: level,
          }),
        )}
      </Text>
      {entries.map(([r, n]) => (
        <View
          key={r}
          style={[styles.chip, compact && styles.compactChip]}
        >
          <GameIcon
            name={
              r === "glimmers" ? "glimmer" : r === "flowers" ? "decorations" : r
            }
            size={compact ? 14 : 18}
          />
          <Text
            style={[styles.amount, { fontSize: compact ? 11 : 13 }]}
          >
            +{n}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  description: { color: cozy.color.ink, fontWeight: "600", flexShrink: 1 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 30,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cozy.color.border,
    backgroundColor: cozy.color.paperLight,
  },
  compactChip: { minHeight: 24, paddingHorizontal: 5 },
  amount: { color: cozy.color.ink, fontWeight: "700" },
});
