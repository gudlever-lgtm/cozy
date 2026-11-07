import { CozyPressable } from "./ui/CozyPressable";
import { cozy } from "./ui/theme";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { MiniArtwork } from "./MiniArtwork";
import { GameIcon } from "./GameIcon";
import type { MiniProgress, MiniSlot } from "./engine/miniProgress";

/** A bounded row; counters never grow into neighbouring garden controls. */
export function GardenMiniPair({
  progress,
  onOpen,
  onHelp,
  compact = false,
}: {
  compact?: boolean;
  progress: MiniProgress;
  onOpen: (slot: MiniSlot) => void;
  onHelp: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View testID="active-mini-pair" style={styles.row}>
      {!compact && (
        <View
          accessible
          accessibilityLabel={String(
            t("firefliesBalance", { count: progress.fireflies }),
          )}
          style={styles.balance}
        >
          <GameIcon name="glimmer" size={18} />
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
            style={styles.amount}
          >
            {progress.fireflies}
          </Text>
        </View>
      )}
      {progress.slots.map((slot) => (
        <CozyPressable
          key={slot.session.id}
          testID={`active-mini-${slot.session.kind}`}
          accessibilityRole="button"
          accessibilityLabel={`${t(slot.session.kind)}: ${slot.done ? t("questDone") : t("earnedMiniMoves", { count: slot.moves })}`}
          disabled={slot.done || slot.moves === 0}
          onPress={() => onOpen(slot)}
          style={[
            styles.slot,
            compact && { width: 58 },
            slot.done && { opacity: 0.5 },
          ]}
        >
          <MiniArtwork
            kind={
              slot.session.kind === "hidden" ? "treasure" : slot.session.kind
            }
            value={0}
            size={26}
          />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.2}
            style={styles.amount}
          >
            {slot.done ? "✓" : slot.moves}
          </Text>
        </CozyPressable>
      ))}
      <CozyPressable
        testID="mini-progress-help"
        accessibilityRole="button"
        accessibilityLabel={String(t("help"))}
        onPress={onHelp}
        style={styles.help}
      >
        <GameIcon name="help" size={22} />
      </CozyPressable>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0 },
  balance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    height: 44,
    maxWidth: 82,
    borderRadius: 12,
    backgroundColor: "#fff8e9ee",
  },
  slot: {
    width: 70,
    height: 44,
    paddingHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff8e9ee",
    borderRadius: 12,
  },
  amount: {
    flexShrink: 1,
    color: cozy.color.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  help: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#fff8e9ee",
  },
});
