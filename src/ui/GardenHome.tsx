import { gardenImageSize, type CozySeason } from "../assets/images";
import { GardenBackdrop } from "./GardenBackdrop";
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { GardenViewport } from "../GardenViewport";
import { GardenMiniPair } from "../GardenMiniPair";
import { MaterialRibbon } from "../MaterialRibbon";
import { SvgXml } from "react-native-svg";
import { gardenIllustrations } from "../assets/cozyGardenIllustrations";
import { CozyButton } from "./CozyButton";
import { ResourceBadge } from "./ResourceBadge";
import { CharacterIdle } from "../living/CharacterIdle";
import { AppVersion } from "./AppVersion";
import { cozy } from "./theme";
import type { Save } from "../engine/save";
import type { MiniSlot } from "../engine/miniProgress";
export function GardenHome({
  save,
  scene,
  season,
  cottage = true,
  children,
  onPlay,
  onBuild,
  onInventory,
  onMini,
  onHelp,
  onMillie,
  onMarmalade,
}: {
  save: Save;
  scene: React.ReactNode;
  season: CozySeason;
  cottage?: boolean;
  children?: React.ReactNode;
  onPlay: () => void;
  onBuild: () => void;
  onInventory: () => void;
  onMini: (slot: MiniSlot) => void;
  onHelp: () => void;
  onMillie: () => void;
  onMarmalade: () => void;
}) {
  const { t } = useTranslation(),
    { width, height } = useWindowDimensions(),
    insets = useSafeAreaInsets();
  const portrait = height > width;
  const bottom = insets.bottom + 70;
  return (
    <View testID="garden-fullscreen" style={s.root}>
      <GardenBackdrop season={season} />
      <GardenViewport
        imageSize={gardenImageSize(season, portrait && cottage)}
        language={save.preferences.language}
        controlsBottom={
          insets.bottom + (portrait ? 204 : width < 720 ? 126 : 8)
        }
      >
        {scene}
      </GardenViewport>
      <View
        pointerEvents="box-none"
        style={[
          s.hud,
          {
            top: insets.top + 8,
            left: insets.left + 10,
            right: insets.right + 10,
          },
        ]}
      >
        <View style={s.top}>
          <View style={s.friends}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={String(t("millie"))}
              onPress={onMillie}
              style={s.portrait}
            >
              <CharacterIdle character="millie" size={32}
                enabled={save.preferences.animations}
                reducedMotion={save.preferences.reducedMotion} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={String(t("marmalade"))}
              onPress={onMarmalade}
              style={s.portrait}
            >
              <CharacterIdle character="marmalade" size={32}
                enabled={save.preferences.animations}
                reducedMotion={save.preferences.reducedMotion} />
            </Pressable>
            {!portrait && (
              <View>
                <Text style={s.brand}>Cozy Solitaire</Text>
                <Text style={s.tagline}>{String(t("cozyTagline"))}</Text>
              </View>
            )}
            {!portrait && width >= 720 && (
              <SvgXml
                xml={gardenIllustrations.butterfly}
                width={27}
                height={23}
                accessible={false}
              />
            )}
          </View>
          <View style={s.resources}>
            <ResourceBadge
              icon="glimmer"
              label={String(t("glimmers"))}
              value={save.economy.wallet.glimmers}
            />
            <ResourceBadge
              icon="undo"
              label={String(t("undoPoints"))}
              value={save.miniProgress.undo}
            />
          </View>
        </View>
        <MaterialRibbon wallet={save.economy.wallet} onOpen={onInventory} />
      </View>
      <View
        testID="garden-action-bar"
        pointerEvents="box-none"
        style={[
          s.actions,
          {
            left: insets.left + 10,
            right: insets.right + 10,
            bottom: bottom + (portrait ? 68 : 0),
          },
        ]}
      >
        <View style={s.mini}>
          <Text style={s.miniLabel}>{String(t("yourMiniGames"))}</Text>
          <GardenMiniPair
            compact
            progress={save.miniProgress}
            onOpen={onMini}
            onHelp={onHelp}
          />
        </View>
        <CozyButton
          testID="garden-edit-toggle"
          label={String(t("buildGarden"))}
          onPress={onBuild}
          quiet
          compact
          icon="decorations"
          style={{ width: portrait ? 122 : 155 }}
        />
      </View>
      <View
        pointerEvents="box-none"
        style={[
          s.play,
          {
            bottom,
            left: portrait ? 16 : width / 2 - (width < 720 ? 85 : 115),
            right: portrait ? 16 : width / 2 - (width < 720 ? 85 : 115),
          },
        ]}
      >
        <CozyButton
          label={String(t("play"))}
          icon="play"
          onPress={onPlay}
          style={{ minHeight: portrait ? 54 : 48 }}
        />
      </View>
      {children}
      <View
        pointerEvents="none"
        style={[s.version, { left: insets.left + 12, bottom: insets.bottom + 59 }]}
      >
        <AppVersion />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  hud: { position: "absolute", gap: 6 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  friends: { flexDirection: "row", alignItems: "center", gap: 5 },
  portrait: {
    width: 44,
    height: 44,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: cozy.color.honey,
    backgroundColor: cozy.color.paperLight,
    ...cozy.shadow,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontFamily: cozy.font.title,
    fontSize: 21,
    fontWeight: "700",
    color: cozy.color.paperLight,
    textShadowColor: cozy.color.woodDark,
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 10,
    color: cozy.color.paperLight,
    textShadowColor: cozy.color.woodDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  resources: { flexDirection: "row", gap: 5 },
  actions: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
  },
  mini: { gap: 4 },
  miniLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: cozy.color.cream,
    textShadowColor: cozy.color.woodDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  play: { position: "absolute" },
  version: { position: "absolute", zIndex: 50 },
});
