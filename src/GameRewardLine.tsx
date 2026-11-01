import React from "react";
import { View, Text } from "react-native";
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
      style={{
        flexDirection: "row",
        gap: compact ? 4 : 8,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {entries.map(([r, n]) => (
        <View
          key={r}
          style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
        >
          <GameIcon
            name={
              r === "glimmers" ? "glimmer" : r === "flowers" ? "decorations" : r
            }
            size={compact ? 14 : 18}
          />
          <Text
            style={{
              color: "#345b49",
              fontSize: compact ? 10 : 11,
              fontWeight: "600",
            }}
          >
            +{n}
          </Text>
        </View>
      ))}
    </View>
  );
}
