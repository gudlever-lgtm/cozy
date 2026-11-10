import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CozyPanel } from "../ui/components/CozyPanel";
import { CozyButton } from "../ui/components/CozyButton";
import { CozyIconButton } from "../ui/components/CozyIconButton";
import { useLocale } from "../i18n/LocaleContext";
import type { StringKey } from "../i18n/strings";
import LockIcon from "../../assets/v3/icons/lock.svg";
import { MemoryGameScreen } from "./MemoryGameScreen";
import { textColors } from "../ui/theme/colors";

interface GameEntry {
  readonly titleKey: StringKey;
  readonly available: boolean;
}

const GAMES: readonly GameEntry[] = [
  { titleKey: "flowerMatchGame", available: false },
  { titleKey: "gardenPuzzleGame", available: false },
  { titleKey: "findDifferenceGame", available: false },
  { titleKey: "memoryGame", available: true },
];

/**
 * Only Memory (the Stage 4 flower-match engine) has a real, playable implementation.
 * The other three menu entries are honestly locked — shown with the approved lock
 * icon and "doesn't exist yet" text, never a tappable button that goes nowhere or
 * fakes being playable.
 */
export function MinigamesScreen() {
  const { t } = useLocale();
  const [playingMemory, setPlayingMemory] = useState(false);

  if (playingMemory) {
    return <MemoryGameScreen onBack={() => setPlayingMemory(false)} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.list}>
        {GAMES.map((game) => (
          <CozyPanel key={game.titleKey} style={styles.panel}>
            <View style={styles.row}>
              <Text style={styles.title}>{t(game.titleKey)}</Text>
              {game.available ? (
                <CozyButton label={t("playNow")} variant="primary" onPress={() => setPlayingMemory(true)} />
              ) : (
                <View style={styles.lockedRow}>
                  <CozyIconButton icon={LockIcon} accessibilityLabel={t("notYetAvailable")} longPressHint={t("notYetAvailable")} onPress={() => {}} disabled />
                  <Text style={styles.lockedText}>{t("comingSoon")}</Text>
                </View>
              )}
            </View>
          </CozyPanel>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70 },
  list: { padding: 16, paddingBottom: 110, gap: 14 },
  panel: { minHeight: 0 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  title: { fontSize: 16, fontWeight: "700", color: textColors.onLightPanel, flexShrink: 1 },
  lockedRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lockedText: { fontSize: 12, color: textColors.onLightPanel },
});
