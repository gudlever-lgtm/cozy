import { CozyPressable } from "./ui/CozyPressable";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { ScreenPager } from "./ScreenPager";
import { MiniArtwork } from "./MiniArtwork";
import { GameIcon } from "./GameIcon";
import type { MiniKind } from "./engine/session";
import type { MiniSlot } from "./engine/miniProgress";

export function MiniGameHub({
  slots,
  onStart,
  onResume,
  saved,
}: {
  slots: MiniSlot[];
  onStart: (slot: MiniSlot) => void;
  onResume: () => void;
  saved: MiniKind | null;
}) {
  const { t } = useTranslation();
  return (
    <ScreenPager
      id="mini-hub"
      title={String(t("mini"))}
      actions={
        saved ? (
          <CozyPressable
            accessibilityRole="button"
            accessibilityLabel={String(t("resumeMini"))}
            onPress={onResume}
            style={[s.button, s.resume]}
          >
            <GameIcon name="restart" size={22} />
            <Text style={s.resumeText}>{String(t("resumeMini"))}</Text>
          </CozyPressable>
        ) : null
      }
      items={slots.map((slot) => {
        const kind = slot.session.kind;
        const unavailable = slot.done || slot.moves <= 0;
        return (
          <View key={slot.session.id} style={s.card}>
            <MiniArtwork
              kind={
                kind === "match" ? "match" : kind === "tea" ? "tea" : "treasure"
              }
              value={0}
              size={48}
            />
            <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
              <Text style={s.name} numberOfLines={2}>
                {String(t(kind))}
              </Text>
              <Text style={s.note}>
                {slot.done
                  ? String(t("finishMini"))
                  : String(t("moves", { count: slot.moves }))}
              </Text>
            </View>
            <CozyPressable
              testID={`mini-start-${kind}`}
              accessibilityRole="button"
              accessibilityLabel={String(t("startMiniGame", { game: t(kind) }))}
              accessibilityState={{ disabled: unavailable }}
              disabled={unavailable}
              onPress={() => onStart(slot)}
              style={[s.button, unavailable && s.disabled]}
            >
              <GameIcon name="play" size={26} />
            </CozyPressable>
          </View>
        );
      })}
    />
  );
}

const s = StyleSheet.create({
  button: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cdbd96",
    backgroundColor: "#fff5df",
    alignItems: "center",
    justifyContent: "center",
  },
  resume: {
    flexDirection: "row",
    gap: 7,
    backgroundColor: "#e0eedc",
    borderColor: "#8dac82",
  },
  resumeText: { fontSize: 13, fontWeight: "600", color: "#345b49" },
  disabled: { opacity: 0.42 },
  card: {
    flex: 1,
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d2c295",
    backgroundColor: "#fff8e9ed",
  },
  name: { fontSize: 15, lineHeight: 20, fontWeight: "600", color: "#345b49" },
  note: { fontSize: 12, lineHeight: 16, color: "#597253" },
});
