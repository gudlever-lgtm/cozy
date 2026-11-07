import { CozyPressable } from "./ui/CozyPressable";
import { cozy } from "./ui/theme";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import type { Save } from "./engine/save";
import { journeyProgress } from "./presentation/journey";
import { GameIcon } from "./GameIcon";
import { number, type Key } from "./i18n";
export function JourneyRibbon({
  save,
  onNext,
  onAppearance,
}: {
  save: Save;
  onNext: (questId?: string) => void;
  onAppearance: () => void;
}) {
  const { t, i18n } = useTranslation(),
    progress = journeyProgress(save),
    next = progress.next
      ? String(t(progress.next.id)).split(" · ").at(-1)
      : String(t("world"));
  return (
    <View testID="journey-ribbon" style={s.root}>
      <CozyPressable
        accessibilityRole="button"
        accessibilityLabel={String(t("journeyNext", { step: next }))}
        onPress={() => onNext(progress.next?.id)}
        style={s.next}
      >
        <GameIcon name="quests" size={25} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 6,
            }}
          >
            <Text numberOfLines={1} style={s.text}>
              {String(t("journey"))} · {progress.percent}%
            </Text>
            <Text numberOfLines={1} style={[s.text, { flexShrink: 1 }]}>
              {next}
            </Text>
          </View>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={String(t("journey"))}
            accessibilityValue={{
              min: 0,
              max: progress.total,
              now: progress.done,
            }}
            style={s.track}
          >
            <View
              style={{
                width: `${progress.percent}%`,
                height: 5,
                backgroundColor: "#c3a558",
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      </CozyPressable>
      <View
        accessible
        accessibilityLabel={
          String(t("glimmers")) +
          ": " +
          number(save.economy.wallet.glimmers, i18n.language)
        }
        style={s.wallet}
      >
        <GameIcon name="glimmer" size={24} />
        <Text style={s.text}>
          {number(save.economy.wallet.glimmers, i18n.language)}
        </Text>
      </View>
      <CozyPressable
        accessibilityRole="button"
        accessibilityLabel={String(t("appearanceShortcut"))}
        onPress={onAppearance}
        style={s.icon}
      >
        <GameIcon name="settings" size={28} />
      </CozyPressable>
    </View>
  );
}
const s = StyleSheet.create({
  root: {
    height: 44,
    marginHorizontal: 8,
    marginVertical: 4,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d0bd8e",
    backgroundColor: "#fff8e9e8",
    flexShrink: 0,
  },
  next: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 44,
  },
  track: {
    height: 5,
    borderRadius: 4,
    backgroundColor: "#dce2ce",
    overflow: "hidden",
  },
  text: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    color: cozy.color.ink,
  },
  wallet: { flexDirection: "row", gap: 3, alignItems: "center" },
  icon: {
    width: 38,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
