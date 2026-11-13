import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  applyMove,
  autoPlaySafe,
  deal,
  hint as domainHint,
  isWon,
  legalMoves,
  undo as domainUndo,
} from "../domain/solitaire/engine";
import type { Card, GameState, Move } from "../domain/solitaire/types";
import { loadSavedGame, saveGame } from "../application/solitairePersistence";
import { usePreferences } from "../ui/providers/PreferencesContext";
import { PlayingCard } from "../ui/components/PlayingCard";
import { CardSlot } from "../ui/theme/cardArt";
import { CozyIconButton } from "../ui/components/CozyIconButton";
import { CozyButton } from "../ui/components/CozyButton";
import HintIcon from "../../assets/v3/icons/hint.svg";
import UndoIcon from "../../assets/v3/icons/undo.svg";
import PlayIcon from "../../assets/v3/icons/play.svg";
import StarIcon from "../../assets/v3/icons/star.svg";
import { textColors } from "../ui/theme/colors";
import { useLocale } from "../i18n/LocaleContext";
import FeltPortrait from "../../assets/v3-premium/tabletop/solitaire-felt-portrait.svg";
import FeltLandscape from "../../assets/v3-premium/tabletop/solitaire-felt-landscape.svg";

const MARGIN = 10;
const GAP = 6;
const COLUMNS = 7;

type DragSource = { type: "waste" } | { type: "tableau"; column: number; cardIndex: number };

/**
 * Full Klondike screen wired to the deterministic Stage 1 engine
 * (src/domain/solitaire/engine.ts) — this component only turns taps/drags into
 * applyMove() calls and renders the resulting GameState; it never decides legality
 * itself (an illegal drop/tap is simply a no-op, since applyMove() returns the state
 * unchanged for an illegal move).
 */
export function SolitaireScreen() {
  const { t } = useLocale();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const boardWidth = isLandscape ? Math.min(470, width * 0.58) : width;
  const { preferences } = usePreferences();
  const [game, setGame] = useState<GameState | null>(null);
  const [drag, setDrag] = useState<{ source: DragSource; cards: Card[]; dx: number; dy: number } | null>(null);
  const [hintMove, setHintMove] = useState<Move | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);
  const victoryAnim = useRef(new Animated.Value(0)).current;
  const tableauScrollY = useRef(0);

  useEffect(() => {
    let cancelled = false;
    loadSavedGame().then((saved) => {
      if (cancelled) return;
      setGame(saved ?? deal(Date.now(), preferences.drawMode));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (game) saveGame(game);
  }, [game]);

  const won = game ? isWon(game) : false;
  useEffect(() => {
    if (won) Animated.spring(victoryAnim, { toValue: 1, useNativeDriver: true }).start();
    else victoryAnim.setValue(0);
  }, [won, victoryAnim]);

  // Landscape is HEIGHT-constrained; a width-only card size made 844×390 unplayable.
  // Board and action controls have independent rectangles. No game rules change.
  const cardWidth = Math.min((boardWidth - 2 * MARGIN - GAP * (COLUMNS - 1)) / COLUMNS, isLandscape ? 56 : 70);
  const cardHeight = (cardWidth * 270) / 190;
  const faceDownStep = cardHeight * 0.16;
  const faceUpStep = cardHeight * 0.24;
  const boardTopInset = isLandscape ? 4 : Math.max(50, Math.min(78, height * 0.09));
  const tableauTop = boardTopInset + MARGIN * 2 + cardHeight;

  const columnX = (col: number) => MARGIN + col * (cardWidth + GAP);

  function attemptTableauDrop(source: DragSource, finalX: number, finalY: number) {
    if (!game) return;
    const isFoundationDrop = finalY < tableauTop - cardHeight * 0.5;
    if (isFoundationDrop) {
      if (source.type === "waste") {
        setGame(applyMove(game, { type: "wasteToFoundation" }));
      } else if (source.cardIndex === game.tableau[source.column].length - 1) {
        setGame(applyMove(game, { type: "tableauToFoundation", fromColumn: source.column }));
      }
      return;
    }
    const toColumn = Math.max(0, Math.min(COLUMNS - 1, Math.round((finalX - MARGIN) / (cardWidth + GAP))));
    if (source.type === "waste") {
      setGame(applyMove(game, { type: "wasteToTableau", toColumn }));
    } else {
      setGame(applyMove(game, { type: "tableauToTableau", fromColumn: source.column, cardIndex: source.cardIndex, toColumn }));
    }
  }

  function attemptTapMove(source: DragSource) {
    if (!game) return;
    const moves = legalMoves(game);
    const foundationMove = moves.find((m) =>
      source.type === "waste" ? m.type === "wasteToFoundation" : m.type === "tableauToFoundation" && m.fromColumn === source.column,
    );
    if (foundationMove) {
      setGame(applyMove(game, foundationMove));
      return;
    }
    const tableauMove = moves.find((m) =>
      source.type === "waste"
        ? m.type === "wasteToTableau"
        : m.type === "tableauToTableau" && m.fromColumn === source.column && m.cardIndex === source.cardIndex,
    );
    if (tableauMove) setGame(applyMove(game, tableauMove));
  }

  function makeDragGesture(source: DragSource, cards: Card[]) {
    return Gesture.Pan()
      .runOnJS(true)
      .onBegin(() => setDrag({ source, cards, dx: 0, dy: 0 }))
      .onUpdate((e) => setDrag({ source, cards, dx: e.translationX, dy: e.translationY }))
      .onEnd((e) => {
        const distance = Math.hypot(e.translationX, e.translationY);
        if (distance < 6) {
          attemptTapMove(source);
        } else {
          const originX = source.type === "waste" ? MARGIN + cardWidth + GAP : columnX(source.column);
          const originY =
            source.type === "waste"
              ? boardTopInset + MARGIN
              : tableauTop + stackedOffset(game!.tableau[source.column], source.cardIndex, faceDownStep, faceUpStep) - tableauScrollY.current;
          attemptTableauDrop(source, originX + e.translationX, originY + e.translationY);
        }
        setDrag(null);
      });
  }

  const draggingIds = new Set(drag?.cards.map((c) => c.id) ?? []);

  if (!game) return <View style={styles.container} />;

  const canDraw = game.stock.length > 0;
  const canRecycle = !canDraw && game.waste.length > 0;
  const wasteTop = game.waste[game.waste.length - 1];
  const foundationOrder = ["clubs", "diamonds", "hearts", "spades"] as const;
  const tallestStack = Math.max(0, ...game.tableau.map((column) => column.length ? stackedOffset(column, column.length - 1, faceDownStep, faceUpStep) + cardHeight : 0));
  const tableauContentHeight = Math.max(160, tallestStack + 16);

  const runHint = () => {
    const result = domainHint(game);
    setHintMove(result.move);
    setHintText(result.explanation);
    setTimeout(() => setHintMove(null), 2200);
    setTimeout(() => setHintText(null), 3200);
  };

  const isHinted = (source: DragSource) => {
    if (!hintMove) return false;
    if (source.type === "waste") return hintMove.type === "wasteToFoundation" || hintMove.type === "wasteToTableau";
    return (
      (hintMove.type === "tableauToFoundation" && hintMove.fromColumn === source.column) ||
      (hintMove.type === "tableauToTableau" && hintMove.fromColumn === source.column && hintMove.cardIndex === source.cardIndex)
    );
  };

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {isLandscape ? <FeltLandscape width="100%" height="100%" preserveAspectRatio="xMidYMid slice" /> : <FeltPortrait width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />}
      </View>
      <SafeAreaView style={[styles.safe, isLandscape ? styles.safeLandscape : null]} edges={["top", "bottom"]}>
        <View style={[styles.topRow, { marginHorizontal: MARGIN, marginTop: boardTopInset, width: boardWidth - 2 * MARGIN, height: cardHeight }]}>
          <GestureDetector gesture={canDraw || canRecycle ? Gesture.Tap().runOnJS(true).onEnd(() => setGame(applyMove(game, canDraw ? { type: "draw" } : { type: "recycle" }))) : Gesture.Tap()}>
            <View style={{ width: cardWidth, height: cardHeight }}>
              {canDraw ? (
                <PlayingCard card={{ id: "stock", suit: "clubs", rank: 1, faceUp: false }} width={cardWidth} faceStyle={preferences.faceStyle} backStyle={preferences.backStyle} />
              ) : (
                <CardSlot width="100%" height="100%" />
              )}
            </View>
          </GestureDetector>

          <View style={{ width: cardWidth, height: cardHeight, marginLeft: GAP }}>
            {wasteTop ? (
              <GestureDetector gesture={makeDragGesture({ type: "waste" }, [wasteTop])}>
                <View style={draggingIds.has(wasteTop.id) ? styles.hidden : undefined}>
                  <PlayingCard card={wasteTop} width={cardWidth} faceStyle={preferences.faceStyle} backStyle={preferences.backStyle} highlighted={isHinted({ type: "waste" })} />
                </View>
              </GestureDetector>
            ) : (
              <CardSlot width="100%" height="100%" />
            )}
          </View>

          <View style={{ flex: 1 }} />

          {foundationOrder.map((suit) => {
            const pile = game.foundations[suit];
            const top = pile[pile.length - 1];
            return (
              <View key={suit} style={{ width: cardWidth, height: cardHeight, marginLeft: GAP }}>
                {top ? <PlayingCard card={top} width={cardWidth} faceStyle={preferences.faceStyle} backStyle={preferences.backStyle} /> : <CardSlot width="100%" height="100%" />}
              </View>
            );
          })}
        </View>

        <ScrollView
          nestedScrollEnabled
          style={[styles.tableauViewport, { width: boardWidth, marginTop: MARGIN }]}
          contentContainerStyle={{ minHeight: tableauContentHeight, paddingHorizontal: MARGIN }}
          onScroll={(event) => { tableauScrollY.current = event.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.tableauRow, { width: boardWidth - 2 * MARGIN, height: tableauContentHeight }]}>
          {game.tableau.map((column, colIndex) => (
            <View key={colIndex} style={{ width: cardWidth, marginRight: colIndex < COLUMNS - 1 ? GAP : 0 }}>
              {column.length === 0 ? (
                <CardSlot width={cardWidth} height={cardHeight} />
              ) : (
                column.map((card, cardIndex) => {
                  const top = stackedOffset(column, cardIndex, faceDownStep, faceUpStep);
                  const source: DragSource = { type: "tableau", column: colIndex, cardIndex };
                  const content = (
                    <PlayingCard
                      card={card}
                      width={cardWidth}
                      faceStyle={preferences.faceStyle}
                      backStyle={preferences.backStyle}
                      highlighted={isHinted(source)}
                    />
                  );
                  return (
                    <View key={card.id} style={[styles.stacked, { top, zIndex: cardIndex }, draggingIds.has(card.id) ? styles.hidden : null]}>
                      {card.faceUp ? <GestureDetector gesture={makeDragGesture(source, column.slice(cardIndex))}>{content}</GestureDetector> : content}
                    </View>
                  );
                })
              )}
            </View>
          ))}
          </View>
        </ScrollView>

        <View style={[styles.toolbar, isLandscape ? [styles.toolbarLandscape, { left: boardWidth + 8, right: 12 }] : styles.toolbarPortrait]}>
          <CozyIconButton icon={UndoIcon} accessibilityLabel={t("undo")} longPressHint={t("undoHint")} onPress={() => setGame(domainUndo(game))} />
          <CozyIconButton icon={HintIcon} accessibilityLabel={t("hint")} longPressHint={t("hintHint")} onPress={runHint} />
          <CozyIconButton icon={StarIcon} accessibilityLabel={t("autoFinish")} longPressHint={t("autoFinishHint")} onPress={() => setGame(autoPlaySafe(game))} />
          <CozyIconButton
            icon={PlayIcon}
            accessibilityLabel={t("newGame")}
            longPressHint={t("newGameHint")}
            onPress={() => setGame(deal(Date.now(), preferences.drawMode))}
          />
        </View>

        {hintText ? (
          <View style={styles.hintToast}>
            <Text style={styles.hintText}>{hintText}</Text>
          </View>
        ) : null}
      </SafeAreaView>

      {drag
        ? drag.cards.map((card, i) => {
            const origin =
              drag.source.type === "waste"
                ? { x: MARGIN + cardWidth + GAP, y: boardTopInset + MARGIN }
                : { x: columnX(drag.source.column), y: tableauTop + stackedOffset(game.tableau[drag.source.column], drag.source.cardIndex, faceDownStep, faceUpStep) + i * faceUpStep - tableauScrollY.current };
            return (
              <View
                key={card.id}
                pointerEvents="none"
                style={{ position: "absolute", left: origin.x + drag.dx, top: origin.y + drag.dy, width: cardWidth, zIndex: 999 }}
              >
                <PlayingCard card={card} width={cardWidth} faceStyle={preferences.faceStyle} backStyle={preferences.backStyle} />
              </View>
            );
          })
        : null}

      {won ? (
        <View style={styles.victoryOverlay} pointerEvents="box-none">
          <Animated.View style={[styles.victoryCard, { opacity: victoryAnim, transform: [{ scale: victoryAnim }] }]}>
            <View style={styles.victoryHeading}>
              <StarIcon width={28} height={28} />
              <Text style={styles.victoryTitle}>{t("youWon")}</Text>
              <StarIcon width={28} height={28} />
            </View>
            <CozyButton label={t("newGame")} variant="primary" onPress={() => setGame(deal(Date.now(), preferences.drawMode))} />
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

function stackedOffset(column: readonly Card[], uptoIndex: number, faceDownStep: number, faceUpStep: number): number {
  let offset = 0;
  for (let i = 0; i < uptoIndex; i++) offset += column[i].faceUp ? faceUpStep : faceDownStep;
  return offset;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#173f30" },
  safe: { flex: 1, paddingBottom: 174 },
  safeLandscape: { paddingBottom: 82 },
  topRow: { flexDirection: "row", alignItems: "flex-start" },
  tableauViewport: { flex: 1, maxWidth: "100%" },
  tableauRow: { flexDirection: "row" },
  stacked: { position: "absolute", left: 0 },
  hidden: { opacity: 0 },
  toolbar: { position: "absolute", flexDirection: "row", justifyContent: "center", gap: 12 },
  toolbarPortrait: { bottom: 104, left: 10, right: 10 },
  toolbarLandscape: { top: 98, bottom: 94, flexWrap: "wrap", alignContent: "center", alignItems: "center" },
  hintToast: { position: "absolute", bottom: 70, alignSelf: "center", backgroundColor: "rgba(43,36,32,0.85)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, maxWidth: "80%" },
  hintText: { color: "#fff", fontSize: 13, textAlign: "center" },
  victoryOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" },
  victoryCard: { backgroundColor: "#fff9e7", borderRadius: 20, padding: 28, alignItems: "center", gap: 16 },
  victoryTitle: { fontSize: 28, fontWeight: "800", color: textColors.onLightPanel },
  victoryHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
});
