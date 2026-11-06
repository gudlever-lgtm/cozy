import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { ScreenPager } from "./ScreenPager";
import { MiniArtwork } from "./MiniArtwork";
import { GameIcon } from "./GameIcon";
import type { MiniKind, MiniLevel } from "./engine/session";
export function MiniGameHub({
  level,
  onLevel,
  onStart,
  onResume,
  saved,
  target,
}: {
  level: MiniLevel;
  onLevel: (level: MiniLevel) => void;
  onStart: (kind: MiniKind) => void;
  onResume: () => void;
  saved: MiniKind | null;
  target?: MiniKind | null;
}) {
  const { t } = useTranslation();
  return (
    <ScreenPager
      id="mini-hub"
      title={String(t("mini"))}
      focusIndex={
        target ? ["match", "hidden", "tea"].indexOf(target) : undefined
      }
      actions={
        <View style={{ flexDirection: "row", gap: 4 }}>
          {([1, 2, 3] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={String(t("level", { number: value }))}
              accessibilityState={{ selected: value === level }}
              onPress={() => onLevel(value)}
              style={[
                s.button,
                value === level && { borderColor: "#345b49", borderWidth: 2 },
              ]}
            >
              <Text style={s.name}>{value}</Text>
            </Pressable>
          ))}
          {saved && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={String(t("resumeMini"))}
              onPress={onResume}
              style={[s.button, { backgroundColor: "#e0eedc", borderColor: "#8dac82" }]}
            >
              <GameIcon name="restart" size={22} />
            </Pressable>
          )}
        </View>
      }
      items={(["match", "hidden", "tea"] as const).map((kind, index) => (
        <View
          key={kind}
          style={[
            s.card,
            target === kind && { borderColor: "#c7a458", borderWidth: 2 },
          ]}
        >
          <MiniArtwork
            kind={
              kind === "match" ? "match" : kind === "tea" ? "tea" : "treasure"
            }
            value={0}
            size={42}
          />
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <Text style={s.name} numberOfLines={2}>
              {String(t(kind))}
            </Text>
            <Text style={s.note}>
              {String(t("level", { number: level }))}
            </Text>
          </View>
          <Pressable
            testID={`mini-start-${kind}`}
            accessibilityRole="button"
            accessibilityLabel={String(t("startMiniGame", { game: t(kind) }))}
            onPress={() => onStart(kind)}
            style={s.button}
          >
            <GameIcon name="play" size={28} />
          </Pressable>
        </View>
      ))}
    />
  );
}
const s = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cdbd96",
    backgroundColor: "#fff5df",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d2c295",
    backgroundColor: "#fff8e9ed",
  },
  name: { fontSize: 14, lineHeight: 18, fontWeight: "600", color: "#345b49" },
  note: { fontSize: 11, lineHeight: 14, color: "#597253" },
});
