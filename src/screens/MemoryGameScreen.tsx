import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  applyMove,
  createFlowerMatch,
  flowerMatchDefinition,
  isWon,
  legalMoves,
} from "../domain/minigames/flowerMatch";
import type { FlowerMatchState } from "../domain/minigames/flowerMatch";
import { loadSavedFlowerMatch, saveFlowerMatch, clearSavedFlowerMatch } from "../application/flowerMatchPersistence";
import { useRewardLedger } from "../ui/providers/RewardLedgerContext";
import { useLocale } from "../i18n/LocaleContext";
import { FLOWER_LABEL_KEY } from "../ui/theme/flowerMatchTheme";
import { CozyButton } from "../ui/components/CozyButton";
import { CozyIconButton } from "../ui/components/CozyIconButton";
import { CozyPanel } from "../ui/components/CozyPanel";
import ArrowLeftIcon from "../../assets/v3/icons/arrow-left.svg";
import { textColors } from "../ui/theme/colors";

const PAIR_COUNT = 6; // 12 tiles — fits a compact 3x4 grid on small phones.
const WIN_REWARD_LYSGLIMT = 20;

function newSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function MemoryGameScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLocale();
  const ledger = useRewardLedger();
  const [game, setGame] = useState<FlowerMatchState | null>(null);
  const sessionIdRef = useRef<string>(newSessionId());
  const rewardedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadSavedFlowerMatch().then((saved) => {
      if (cancelled) return;
      if (saved) {
        sessionIdRef.current = saved.sessionId;
        rewardedRef.current = isWon(saved.state);
        setGame(saved.state);
      } else {
        setGame(createFlowerMatch(Date.now(), PAIR_COUNT));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!game) return;
    saveFlowerMatch({ state: game, sessionId: sessionIdRef.current });

    if (isWon(game) && !rewardedRef.current) {
      rewardedRef.current = true;
      // Idempotent by event id (minigame id + session id) — safe even if this effect
      // somehow runs twice for the same win (React strict-mode double-invoke, a
      // remount after the save round-trips, etc.).
      ledger.grant({
        id: `minigame:${flowerMatchDefinition.id}:${sessionIdRef.current}:win`,
        reason: `Won ${flowerMatchDefinition.id}`,
        grants: { lysglimt: WIN_REWARD_LYSGLIMT },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  function startNewGame() {
    sessionIdRef.current = newSessionId();
    rewardedRef.current = false;
    clearSavedFlowerMatch();
    setGame(createFlowerMatch(Date.now(), PAIR_COUNT));
  }

  if (!game) return <View style={styles.container} />;

  const won = isWon(game);
  const pendingMismatch = legalMoves(game).some((m) => m.type === "resolveMismatch");

  function handleTilePress(tileIndex: number) {
    if (!game) return;
    if (pendingMismatch) {
      setGame(applyMove(game, { type: "resolveMismatch" }));
      return;
    }
    setGame(applyMove(game, { type: "reveal", tileIndex }));
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <CozyIconButton icon={ArrowLeftIcon} accessibilityLabel={t("back")} onPress={onBack} />
        <Text style={styles.title}>{t("memoryGame")}</Text>
        <View style={{ width: 56 }} />
      </View>

      <Text style={styles.status}>{won ? t("memoryAllMatched") : pendingMismatch ? t("memoryMismatch") : t("memoryPickTile")}</Text>

      <View style={styles.grid}>
        {game.tiles.map((tile) => {
          const faceUp = tile.state !== "hidden";
          return (
            <Pressable
              key={tile.id}
              onPress={() => handleTilePress(tile.id)}
              disabled={tile.state === "matched"}
              accessibilityRole="button"
              accessibilityLabel={faceUp ? t(FLOWER_LABEL_KEY[tile.symbol]) : "?"}
              style={[
                styles.tile,
                faceUp ? styles.tileFaceUp : styles.tileHidden,
                tile.state === "matched" ? styles.tileMatched : null,
              ]}
            >
              <Text style={styles.tileText} numberOfLines={1} adjustsFontSizeToFit>
                {faceUp ? t(FLOWER_LABEL_KEY[tile.symbol]) : "?"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.movesText}>
          {game.moveCount} {t("moves")}
        </Text>
        <CozyButton label={t("newGame")} variant="secondary" onPress={startNewGame} />
      </View>

      {won ? (
        <View style={styles.victoryOverlay} pointerEvents="box-none">
          <CozyPanel style={styles.victoryPanel}>
            <Text style={styles.victoryTitle}>{t("youWon")}</Text>
            <Text style={styles.victoryReward}>
              +{WIN_REWARD_LYSGLIMT} {t("lysglimt")} {t("rewardEarned")}
            </Text>
            <CozyButton label={t("newGame")} variant="primary" onPress={startNewGame} />
          </CozyPanel>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e7efe0" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12 },
  title: { fontSize: 18, fontWeight: "700", color: textColors.onLightPanel },
  status: { textAlign: "center", fontSize: 13, color: textColors.onLightPanel, paddingHorizontal: 20, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, paddingHorizontal: 16 },
  tile: {
    width: "28%",
    aspectRatio: 0.78,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    padding: 4,
  },
  tileHidden: { backgroundColor: "#6f8f5a", borderColor: "#4d6b3c" },
  tileFaceUp: { backgroundColor: "#fff9e7", borderColor: "#d2a44d" },
  tileMatched: { backgroundColor: "#f0e6c4", borderColor: "#d2a44d", opacity: 0.6 },
  tileText: { fontSize: 13, fontWeight: "700", color: textColors.onLightPanel, textAlign: "center" },
  footer: { marginTop: "auto", alignItems: "center", gap: 10, padding: 16 },
  movesText: { fontSize: 13, color: textColors.onLightPanel },
  victoryOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  victoryPanel: { width: 260, minHeight: 0 },
  victoryTitle: { fontSize: 22, fontWeight: "800", color: textColors.onLightPanel, textAlign: "center" },
  victoryReward: { fontSize: 14, color: textColors.onLightPanel, textAlign: "center", marginTop: 6, marginBottom: 14 },
});
