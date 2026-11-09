import { gardenImageSize, type CozySeason } from "./assets/images";
import { GardenBackdrop } from "./ui/GardenBackdrop";
import { buyGardenDecoration } from "./engine/gardenPurchase";
import { Timber } from "./ui/CozyButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cozy } from "./ui/theme";
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { StrongScrollView } from "./StrongScrollView";
import { GardenViewport } from "./GardenViewport";
import { DecorationArtwork } from "./GardenDecorations";
import { FurnitureControls } from "./FurnitureControls";
import { GameIcon } from "./GameIcon";
import type { Save } from "./engine/save";
import {
  upgrades,
  place,
  upgradeFurniture,
  type UpgradeId,
} from "./engine/world";

/** Dedicated building workspace; game navigation and mini games stay outside this page. */
export function GardenBuildScreen({
  save,
  scene,
  season,
  onUpdate,
  onDone,
}: {
  save: Save;
  scene: React.ReactNode;
  season: CozySeason;
  onUpdate: (change: (save: Save) => Save) => void;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const portrait = height > width;
  const [catalogOpen, setCatalogOpen] = useState(true);
  const insets = useSafeAreaInsets();
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
      <GardenBackdrop season={season} />
      <View testID="build-garden-preview" style={StyleSheet.absoluteFill}>
        <GardenViewport
          imageSize={gardenImageSize(season, portrait)}
          editing
          language={language}
          controlsBottom={insets.bottom + 8}
          controlsRight={insets.right + 8}
        >
          {scene}
        </GardenViewport>
      </View>
      <View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          {
            top: insets.top + 6,
            left: insets.left + 6,
            right: insets.right + 6,
            bottom: insets.bottom + 60,
          },
        ]}
      >
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
            <Timber />
            <Text style={styles.buttonText}>{String(t("buildDone"))}</Text>
          </Pressable>
        </View>
        <Pressable
          testID="build-catalog-toggle"
          accessibilityRole="button"
          accessibilityLabel={String(
            t(catalogOpen ? "hideBuildCatalog" : "showBuildCatalog"),
          )}
          accessibilityState={{ expanded: catalogOpen }}
          onPress={() => setCatalogOpen((v) => !v)}
          style={[styles.button, styles.catalogToggle]}
        >
          <Timber />
          <Text style={styles.buttonText}>
            {String(t(catalogOpen ? "hideBuildCatalog" : "showBuildCatalog"))}
          </Text>
        </Pressable>
        {!catalogOpen && (
          <Text
            pointerEvents="none"
            style={[
              styles.text,
              {
                alignSelf: "flex-start",
                backgroundColor: cozy.color.paperLight,
                padding: 8,
                borderRadius: 10,
                maxWidth: 280,
              },
            ]}
          >
            {String(t("buildHelp"))}
          </Text>
        )}
        {catalogOpen && (
          <StrongScrollView
            testID="build-catalog"
            style={[
              styles.catalog,
              portrait && {
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                maxHeight: Math.min(270, height * 0.35),
              },
            ]}
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
                            onUpdate((current) =>
                              buyGardenDecoration(current, item.id),
                            )
                          }
                        >
                          <Timber green muted={!affordable} />
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
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  overlay: { position: "absolute", gap: 6 },
  catalogToggle: { alignSelf: "flex-end" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 6,
    backgroundColor: "#fff8e9ee",
    minHeight: 52,
    borderRadius: 14,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: "700",
    color: cozy.color.ink,
  },
  text: { fontSize: 12, color: cozy.color.ink, flexShrink: 1 },
  catalog: {
    alignSelf: "flex-end",
    flexShrink: 1,
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
    ...cozy.shadow,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: cozy.color.wood,
  },
  buttonText: { fontSize: 12, fontWeight: "600", color: "#fff8e9" },
});
