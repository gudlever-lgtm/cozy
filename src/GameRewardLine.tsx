import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { gameReward, type GameRewardKind } from "./engine/world";
import { GameIcon } from "./GameIcon";
export function GameRewardLine({ kind }: { kind: GameRewardKind }) {
  const { t } = useTranslation();
  const entries = Object.entries(gameReward(kind));
  const label = entries
    .map(([r, n]) => `+${n} ${t(r === "flowers" ? "flowersResource" : r)}`)
    .join(" · ");
  return (
    <View
      testID={`repeat-rewards-${kind}`}
      accessible
      accessibilityLabel={String(t("repeatRewards")) + ": " + label}
      style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
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
            size={18}
          />
          <Text style={{ color: "#345b49", fontSize: 11, fontWeight: "600" }}>
            +{n}
          </Text>
        </View>
      ))}
    </View>
  );
}
