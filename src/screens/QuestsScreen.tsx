import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CozyPanel } from "../ui/components/CozyPanel";
import { CozyButton } from "../ui/components/CozyButton";
import { CozyHUDChip } from "../ui/components/CozyHUDChip";
import { useLocale } from "../i18n/LocaleContext";
import { useRewardLedger } from "../ui/providers/RewardLedgerContext";
import StarIcon from "../../assets/v3/icons/star.svg";
import { textColors } from "../ui/theme/colors";

const FIRST_MEMORY_WIN_QUEST_ID = "quest:first-memory-win";
const FIRST_MEMORY_WIN_REWARD = 15;

/**
 * One real, functioning quest rather than a mocked list: "win a game of Memory",
 * checked against the actual RewardLedger transaction log (not a hardcoded flag), with
 * its own bonus grant that's idempotent by id the same way every other reward in this
 * app is. A full quest/progression engine (multiple objectives, daily resets, garden-
 * linked goals) doesn't exist yet — rather than fabricate a list that only LOOKS
 * functional, this screen is honest that it's a first, real slice.
 */
export function QuestsScreen() {
  const { t } = useLocale();
  const ledger = useRewardLedger();

  const hasWonMemory = ledger.ledger.transactions.some((tx) => tx.id.startsWith("minigame:flower-match:") && tx.id.endsWith(":win"));
  const claimed = ledger.ledger.transactions.some((tx) => tx.id === FIRST_MEMORY_WIN_QUEST_ID);

  function claim() {
    ledger.grant({
      id: FIRST_MEMORY_WIN_QUEST_ID,
      reason: "Quest: win a game of Memory",
      grants: { lysglimt: FIRST_MEMORY_WIN_REWARD },
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.hudRow}>
        <CozyHUDChip icon={StarIcon} value={ledger.balance("lysglimt")} label={t("lysglimt")} />
      </View>

      <View style={styles.list}>
        <CozyPanel style={styles.panel}>
          <Text style={styles.title}>{t("memoryGameHint")}</Text>
          <Text style={styles.progress}>{hasWonMemory ? "1 / 1" : "0 / 1"}</Text>
          {claimed ? (
            <Text style={styles.claimedText}>
              +{FIRST_MEMORY_WIN_REWARD} {t("lysglimt")} {t("rewardEarned")}
            </Text>
          ) : (
            <CozyButton
              label={`+${FIRST_MEMORY_WIN_REWARD} ${t("lysglimt")}`}
              variant="primary"
              disabled={!hasWonMemory}
              onPress={claim}
            />
          )}
        </CozyPanel>

        <Text style={styles.note}>{t("questsComingSoon")}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70 },
  hudRow: { paddingHorizontal: 16, marginBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 110, gap: 14 },
  panel: { minHeight: 0 },
  title: { fontSize: 16, fontWeight: "700", color: textColors.onLightPanel },
  progress: { fontSize: 13, color: textColors.onLightPanel, marginTop: 4, marginBottom: 10 },
  claimedText: { fontSize: 13, color: textColors.onLightPanel, fontWeight: "600" },
  note: { fontSize: 12, color: "#f8efd6", textAlign: "center", paddingHorizontal: 12 },
});
