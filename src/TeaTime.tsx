import { CozyPressable } from "./ui/CozyPressable";
import { cozy } from "./ui/theme";
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { pour, teaWon, type Tea } from "./engine/minigames";
import { MiniArtwork } from "./MiniArtwork";
import { IdleFirefly, type IdleGuideSettings } from "./living/IdleFirefly";
import { teaIdleHint } from "./presentation/idleHints";
import { GameIcon } from "./GameIcon";

/** Fixed five-tray board. Every tap explains its outcome; empty trays are destinations. */
export function TeaTime({
  game,
  disabled,
  onChange,
  idleGuide,
}: {
  game: Tea;
  disabled: boolean;
  onChange: (next: Tea) => void;
  idleGuide?: IdleGuideSettings;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<Tea[]>([]);
  const [bounds, setBounds] = useState({ width: 540, height: 210 });
  const won = teaWon(game);
  const stalled =
    !won &&
    !game.some((_, a) => game.some((_, b) => pour(game, a, b) !== game));
  const size = Math.max(
    16,
    Math.min(48, (bounds.height - 40) / 3, (bounds.width - 60) / 5 - 12),
  );
  const tap = (i: number) => {
    if (disabled) return;
    if (selected === null) {
      if (!game[i].length) {
        setNotice(String(t("teaEmptySource")));
        return;
      }
      setSelected(i);
      setNotice("");
      return;
    }
    if (selected === i) {
      setSelected(null);
      setNotice("");
      return;
    }
    const next = pour(game, selected, i);
    if (next === game) {
      setNotice(String(t("teaInvalid")));
      return;
    }
    setHistory((old) => [...old, game]);
    setSelected(null);
    setNotice("");
    onChange(next);
  };
  return (
    <View testID="tea-board" style={s.root}>
      <View style={s.instructions}>
        <Text
          testID="tea-instruction"
          accessibilityLiveRegion="polite"
          style={s.instruction}
        >
          {notice ||
            String(
              t(
                stalled
                  ? "teaStalled"
                  : selected === null
                    ? "teaChooseSource"
                    : "teaChooseTarget",
                { number: (selected ?? 0) + 1 },
              ),
            )}
        </Text>
        <CozyPressable
          accessibilityRole="button"
          accessibilityLabel={String(t("undo"))}
          disabled={disabled || !history.length}
          style={[s.undo, (!history.length || disabled) && { opacity: 0.4 }]}
          onPress={() => {
            const previous = history.at(-1);
            if (previous) {
              onChange(previous);
              setHistory((h) => h.slice(0, -1));
              setSelected(null);
              setNotice("");
            }
          }}
        >
          <GameIcon name="undo" size={28} />
        </CozyPressable>
      </View>
      <View
        testID="tea-trays"
        onLayout={(e) => setBounds(e.nativeEvent.layout)}
        style={s.trays}
      >
        <IdleFirefly
          settings={
            idleGuide
              ? { ...idleGuide, enabled: idleGuide.enabled && !disabled }
              : undefined
          }
          revision={String(selected) + JSON.stringify(game)}
          resolve={() => {
            const move = teaIdleHint(game, selected);
            const trayWidth = (bounds.width - 8 - 32) / 5;
            return move
              ? move.map((index) => ({
                  x: 4 + index * (trayWidth + 8) + trayWidth * 0.8,
                  y:
                    26 +
                    ((3 - game[index].length + 0.4) * (bounds.height - 34)) / 3,
                }))
              : [];
          }}
        />
        {game.map((tray, i) => {
          const target = selected !== null && pour(game, selected, i) !== game;
          return (
            <Pressable
              key={i}
              testID={`tea-tray-${i}`}
              accessibilityRole="button"
              accessibilityLabel={String(t("tray", { number: i + 1 }))}
              accessibilityHint={String(
                t(target ? "teaValidTarget" : "teaChooseSource"),
              )}
              accessibilityValue={{
                text:
                  tray
                    .map((value) =>
                      String(
                        t(
                          value === 0
                            ? "teaCup"
                            : value === 1
                              ? "teaPinkCake"
                              : "teaGoldCake",
                        ),
                      ),
                    )
                    .reverse()
                    .join(", ") || String(t("teaEmpty")),
              }}
              accessibilityState={{ selected: selected === i, disabled }}
              disabled={disabled}
              onPress={() => tap(i)}
              style={[s.tray, selected === i && s.selected, target && s.target]}
            >
              <Text style={s.number}>
                {i + 1}
                {target ? "  ↓" : ""}
              </Text>
              {Array.from({ length: 3 }, (_, slot) => {
                const value = tray[2 - slot];
                return (
                  <View
                    pointerEvents="none"
                    key={slot}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    {value === undefined ? (
                      <View style={s.empty} />
                    ) : (
                      <MiniArtwork kind="tea" value={value} size={size} />
                    )}
                  </View>
                );
              })}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, minHeight: 0, width: "100%", gap: 6 },
  instructions: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    backgroundColor: "#fff8e9f5",
    borderRadius: 12,
    paddingHorizontal: 10,
    gap: 8,
  },
  instruction: {
    flex: 1,
    fontSize: 12,
    color: cozy.color.ink,
    fontWeight: "600",
  },
  undo: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  trays: { flex: 1, minHeight: 0, flexDirection: "row", gap: 8, padding: 4 },
  tray: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#c2cdb4",
    backgroundColor: "#fff5dfee",
    padding: 4,
    alignItems: "center",
  },
  selected: {
    borderColor: "#b38a32",
    backgroundColor: "#f8e5b4",
    borderWidth: 3,
  },
  target: {
    borderColor: "#4c8764",
    backgroundColor: "#e7f1dfee",
    borderWidth: 3,
  },
  number: {
    color: cozy.color.ink,
    fontSize: 12,
    fontWeight: "700",
    height: 18,
  },
  empty: {
    width: "55%",
    height: 3,
    borderRadius: 2,
    backgroundColor: "#cbbd9d66",
  },
});
