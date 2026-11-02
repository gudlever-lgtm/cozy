import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { GameIcon } from "./GameIcon";
export type MenuDestination =
  | "garden"
  | "play"
  | "mini"
  | "world"
  | "quests"
  | "decorations"
  | "collection"
  | "inventory"
  | "statistics"
  | "settings"
  | "forest"
  | "earn"
  | "newDeal"
  | "restartDeal"
  | "rules"
  | "challenge";
const routes = {
  games: ["play", "restartDeal", "rules", "challenge"],
  garden: ["world", "quests", "decorations", "collection", "forest"],
  materials: ["inventory", "earn"],
  player: ["statistics", "settings"],
} as const;
const legacy: Partial<Record<MenuDestination, string>> = {
  play: "♠",
  mini: "✿",
  world: "◇",
  quests: "☷",
  decorations: "❀",
  inventory: "▧",
  statistics: "↗",
  settings: "⚙",
};
export function MainMenu({
  visible,
  onClose,
  onNavigate,
  forestUnlocked,
}: {
  visible: boolean;
  onClose: () => void;
  onNavigate: (id: MenuDestination) => void;
  forestUnlocked: boolean;
}) {
  const { t } = useTranslation();
  const [group, setGroup] = useState<keyof typeof routes | null>(null);
  useEffect(() => {
    if (visible) setGroup(null);
  }, [visible]);
  const names = {
    games: "menuGames",
    garden: "menuGarden",
    materials: "materials",
    player: "menuPlayer",
  };
  const icons = {
    games: "play",
    garden: "garden",
    materials: "inventory",
    player: "profile",
  };
  const itemKeys: Partial<Record<MenuDestination, string>> = {
    newDeal: "newGame",
    restartDeal: "restart",
    rules: "help",
    challenge: "challengeTitle",
    forest: "exploreForest",
    earn: "gather",
    collection: "gardenCollection",
  };
  const title = (id: MenuDestination) => String(t(itemKeys[id] ?? id));
  const itemIcons: Partial<Record<MenuDestination, string>> = {
    newDeal: "newGame",
    restartDeal: "restart",
    rules: "hint",
    forest: "world",
    earn: "mini",
  };
  return (
    <Modal
      testID="main-menu-modal"
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => (group ? setGroup(null) : onClose())}
    >
      <View style={s.scrim}>
        <View testID="main-menu" style={s.panel}>
          <View style={s.header}>
            {group && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={String(t("back"))}
                onPress={() => setGroup(null)}
                style={s.icon}
              >
                <Text style={s.arrow}>‹</Text>
              </Pressable>
            )}
            <Text style={s.title}>
              {String(t(group ? names[group] : "mainMenu"))}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={String(t("close"))}
              onPress={onClose}
              style={s.icon}
            >
              <GameIcon name="close" size={25} />
            </Pressable>
          </View>
          <View style={s.grid}>
            {!group
              ? (Object.keys(routes) as (keyof typeof routes)[]).map((id) => (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityLabel={String(t(names[id]))}
                    onPress={() => setGroup(id)}
                    style={s.card}
                  >
                    <GameIcon name={icons[id]} size={38} />
                    <Text style={s.label}>{String(t(names[id]))}</Text>
                  </Pressable>
                ))
              : routes[group]
                  .filter((id) => id !== "forest" || forestUnlocked)
                  .map((id) => (
                    <Pressable
                      key={id}
                      accessibilityRole="button"
                      accessibilityLabel={
                        (legacy[id] ? legacy[id] + " " : "") + title(id)
                      }
                      onPress={() => onNavigate(id)}
                      style={[s.card, group === "games" && { height: "30%" }]}
                    >
                      <GameIcon name={itemIcons[id] ?? id} size={34} />
                      <Text style={s.label} numberOfLines={2}>
                        {title(id)}
                      </Text>
                    </Pressable>
                  ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
const s = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "#18392f88",
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    width: "100%",
    maxWidth: 700,
    height: "94%",
    maxHeight: 390,
    backgroundColor: "#fff8eaf8",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#d4bc86",
    padding: 10,
    gap: 8,
  },
  header: { height: 44, flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, color: "#345b49", fontSize: 20, fontWeight: "700" },
  icon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: { color: "#345b49", fontSize: 30 },
  grid: {
    flex: 1,
    minHeight: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    width: "48.8%",
    height: "46%",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d8c494",
    backgroundColor: "#f6efdf",
    paddingHorizontal: 12,
  },
  label: { flex: 1, fontWeight: "600", color: "#345b49", fontSize: 14 },
});
