import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { StrongScrollView } from "./StrongScrollView";
import { GardenViewport } from "./GardenViewport";
import { DecorationArtwork } from "./GardenDecorations";
import { FurnitureControls } from "./FurnitureControls";
import { GameIcon } from "./GameIcon";
import type { Save } from "./engine/save";
import {
  upgrades,
  transact,
  place,
  upgradeFurniture,
  type UpgradeId,
} from "./engine/world";

/** Dedicated building workspace; game navigation and mini games stay outside this page. */
export function GardenBuildScreen({
  save,
  scene,
  onUpdate,
  onDone,
}: {
  save: Save;
  scene: React.ReactNode;
  onUpdate: (change: (save: Save) => Save) => void;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const language = save.preferences.language;
  const moveItem = (id: UpgradeId, dx: number, dy: number) =>
    onUpdate((current) => {
      const item = upgrades.find((u) => u.id === id);
      if (!item || !current.economy.inventory.includes(id)) return current;
      const pos = current.placements.find((p) => p.id === id);
      return {
        ...current,
        placements: place(current.economy.inventory, current.placements, {
          id,
          x: Math.max(5, Math.min(95, (pos?.x ?? item.x) + dx)),
          y: Math.max(10, Math.min(90, (pos?.y ?? item.y) + dy)),
        }),
      };
    });
  return (
    <View testID="garden-build-screen" style={styles.root}>
      <View style={styles.header}>
        <Text
          style={styles.title}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          {String(t("buildGarden"))}
        </Text>
        <GameIcon name="glimmer" size={20} />
        <Text style={styles.text}>{save.economy.wallet.glimmers}</Text>
        <GameIcon name="wood" size={20} />
        <Text style={styles.text}>{save.economy.wallet.wood}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={String(t("buildDone"))}
          onPress={onDone}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{String(t("buildDone"))}</Text>
        </Pressable>
      </View>
      <View style={styles.workspace}>
        <View testID="build-garden-preview" style={styles.preview}>
          <GardenViewport editing language={language}>
            {scene}
          </GardenViewport>
        </View>
        <StrongScrollView
          testID="build-catalog"
          style={styles.catalog}
          contentContainerStyle={{ gap: 8, padding: 8 }}
        >
          <Text style={styles.text}>{String(t("buildHelp"))}</Text>
          {upgrades
            .filter((u) => u.id !== "cards")
            .map((item) => {
              const owned = save.economy.inventory.includes(item.id);
              const affordable =
                save.economy.wallet.glimmers >= item.cost &&
                save.economy.wallet.wood >= item.wood;
              return (
                <View
                  key={item.id}
                  testID={`build-item-${item.id}`}
                  style={styles.item}
                >
                  <View style={styles.itemTitle}>
                    <DecorationArtwork id={item.id} size={36} />
                    <Text style={[styles.text, { flex: 1 }]}>
                      {String(t(item.id))}
                    </Text>
                  </View>
                  {owned ? (
                    <FurnitureControls
                      save={save}
                      id={item.id}
                      language={language}
                      onMove={moveItem}
                      onUpgrade={(id) =>
                        onUpdate((current) => ({
                          ...current,
                          economy: upgradeFurniture(current.economy, id),
                        }))
                      }
                    />
                  ) : (
                    <>
                      <View style={styles.itemTitle}>
                        <GameIcon name="glimmer" size={18} />
                        <Text style={styles.text}>{item.cost}</Text>
                        <GameIcon name="wood" size={18} />
                        <Text style={styles.text}>{item.wood}</Text>
                      </View>
                      <Pressable
                        testID={`build-buy-${item.id}`}
                        accessibilityRole="button"
                        accessibilityLabel={String(
                          t("buildItem", { item: t(item.id) }),
                        )}
                        disabled={!affordable}
                        style={[
                          styles.button,
                          !affordable && { opacity: 0.45 },
                        ]}
                        onPress={() =>
                          onUpdate((current) => {
                            if (current.economy.inventory.includes(item.id))
                              return current;
                            const economy = transact(
                              current.economy,
                              `buy:${item.id}`,
                              { glimmers: -item.cost, wood: -item.wood },
                              item.id,
                            );
                            return {
                              ...current,
                              economy,
                              placements: place(
                                economy.inventory,
                                current.placements,
                                { id: item.id, x: item.x, y: item.y },
                              ),
                            };
                          })
                        }
                      >
                        <Text style={styles.buttonText}>
                          {String(t("buildItem", { item: t(item.id) }))}
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              );
            })}
        </StrongScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 6,
    backgroundColor: "#fff8e9ee",
    minHeight: 52,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: "700",
    color: "#345b49",
  },
  text: { fontSize: 12, color: "#345b49", flexShrink: 1 },
  workspace: {
    flex: 1,
    minHeight: 0,
    flexDirection: "row",
    gap: 6,
    padding: 6,
  },
  preview: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    borderRadius: 14,
    overflow: "hidden",
  },
  catalog: {
    width: "34%",
    maxWidth: 270,
    minWidth: 165,
    flexGrow: 0,
    backgroundColor: "#fff8e9ee",
    borderRadius: 14,
  },
  item: {
    padding: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#d1bc8e",
    borderRadius: 10,
    backgroundColor: "#fff9ed",
  },
  itemTitle: { flexDirection: "row", alignItems: "center", gap: 6 },
  button: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#345b49",
  },
  buttonText: { fontSize: 12, fontWeight: "600", color: "#fff8e9" },
});
