import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Animated,
  AppState,
  StyleSheet,
  type GestureResponderEvent,
} from "react-native";
import { useTranslation } from "react-i18next";
import { planMatchSwap, type Match } from "./engine/minigames";
import { swipeNeighbour } from "./presentation/matchGesture";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { useMotionStatus } from "./living/useMotionPolicy";
import { IdleFirefly, type IdleGuideSettings } from "./living/IdleFirefly";
import { matchIdleHint } from "./presentation/idleHints";
import { MiniArtwork } from "./MiniArtwork";
type Piece = {
  id: string;
  value: number;
  index: number;
  position: Animated.ValueXY;
  opacity: Animated.Value;
  scale: Animated.Value;
};
/** Stable pieces survive local clears/falls. Every interrupted operation releases input. */
export function GardenMatch({
  game,
  size,
  disabled,
  reducedMotion,
  onChange,
  onBusyChange,
  idleGuide,
}: {
  game: Match;
  size: number;
  disabled: boolean;
  reducedMotion: boolean;
  onChange: (game: Match) => void;
  onBusyChange?: (busy: boolean) => void;
  idleGuide?: IdleGuideSettings;
}) {
  const { t } = useTranslation(),
    inset = 9,
    cell = (size - inset * 2) / 6;
  const cellRef = useRef(cell);
  cellRef.current = cell;
  const sequence = useRef(0),
    token = useRef(0),
    busy = useRef(false),
    alive = useRef(true),
    active = useRef(
      AppState.currentState !== "background" &&
        AppState.currentState !== "inactive",
    );
  const gestureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(new Set<() => void>());
  const motion = useMotionStatus(true, reducedMotion);
  const effectiveReducedMotion = reducedMotion || motion.reason === "system";
  const latest = useRef({
    game,
    disabled,
    reducedMotion: effectiveReducedMotion,
    onChange,
    onBusyChange,
  });
  latest.current = {
    game,
    disabled,
    reducedMotion: effectiveReducedMotion,
    onChange,
    onBusyChange,
  };
  const represented = useRef(game),
    previousCell = useRef(cell);
  const origin = useRef({ x: 0, y: 0, index: -1 });
  const point = (index: number) => ({
    x: (index % 6) * cellRef.current,
    y: Math.floor(index / 6) * cellRef.current,
  });
  const makePiece = (
    value: number,
    index: number,
    spawnRow?: number,
  ): Piece => ({
    id: `garden-piece-${sequence.current++}`,
    value,
    index,
    position: new Animated.ValueXY({
      ...point(index),
      ...(spawnRow === undefined ? {} : { y: spawnRow * cellRef.current }),
    }),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(1),
  });
  const [pieces, setPieces] = useState(() =>
    game.cells.map((v, i) => makePiece(v, i)),
  );
  const piecesRef = useRef(pieces);
  piecesRef.current = pieces;
  const [lifted, setLifted] = useState<string | null>(null);
  const publish = (next: Piece[]) => {
    piecesRef.current = next;
    if (alive.current) setPieces(next);
  };
  const lock = (value: boolean) => {
    busy.current = value;
    if (alive.current) latest.current.onBusyChange?.(value);
  };
  const stop = () => {
    if (gestureTimer.current) {
      clearTimeout(gestureTimer.current);
      gestureTimer.current = null;
    }
    token.current++;
    for (const cancel of [...pending.current]) cancel();
    piecesRef.current.forEach((p) => {
      p.position.stopAnimation();
      p.opacity.stopAnimation();
      p.scale.stopAnimation();
    });
    origin.current.index = -1;
  };
  const restore = () => {
    stop();
    represented.current = latest.current.game;
    publish(latest.current.game.cells.map((v, i) => makePiece(v, i)));
    lock(false);
    if (alive.current) setLifted(null);
  };
  const restoreRef = useRef(restore);
  restoreRef.current = restore;
  useEffect(() => {
    alive.current = true;
    const sub = AppState.addEventListener("change", (state) => {
      active.current = state === "active";
      if (!active.current) restoreRef.current();
    });
    return () => {
      alive.current = false;
      sub.remove();
      stop();
    };
  }, []);
  useEffect(() => {
    if (game !== represented.current || cell !== previousCell.current) {
      previousCell.current = cell;
      restoreRef.current();
    }
  }, [game, cell]);
  const animate = (
    animations: Animated.CompositeAnimation[],
    duration: number,
    run: number,
  ) =>
    new Promise<boolean>((resolve) => {
      if (!alive.current || run !== token.current) {
        resolve(false);
        return;
      }
      if (!animations.length) {
        resolve(true);
        return;
      }
      let settled = false;
      const group = Animated.parallel(animations);
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        pending.current.delete(cancel);
        resolve(ok && alive.current && run === token.current);
      };
      const cancel = () => {
        finish(false);
        group.stop();
      };
      // A native completion callback can disappear on interruption. Never leave the input lock held.
      const timer = setTimeout(cancel, duration + 400);
      pending.current.add(cancel);
      try {
        group.start((result) => finish(result.finished));
      } catch {
        cancel();
      }
    });
  const move = (piece: Piece, to: { x: number; y: number }, duration: number) =>
    Animated.timing(piece.position, {
      toValue: to,
      duration,
      useNativeDriver: true,
    });
  const swap = async (a: number, b: number) => {
    if (latest.current.disabled) {
      restore();
      return;
    }
    const run = ++token.current,
      before = latest.current.game,
      plan = planMatchSwap(before, a, b);
    lock(true);
    const duration = latest.current.reducedMotion ? 0 : 190;
    const first = piecesRef.current.find((p) => p.index === a),
      second = piecesRef.current.find((p) => p.index === b);
    if (!first || !second) {
      restore();
      return;
    }
    setLifted(first.id);
    let committed = false;
    try {
      if (
        !(await animate(
          [move(first, point(b), duration), move(second, point(a), duration)],
          duration,
          run,
        ))
      )
        return;
      if (plan.next === before) {
        await animate(
          [move(first, point(a), duration), move(second, point(b), duration)],
          duration,
          run,
        );
        return;
      }
      first.index = b;
      second.index = a;
      publish([...piecesRef.current]);
      for (const stage of plan.cascades) {
        const removed = new Set(stage.removed),
          cleared = piecesRef.current.filter((p) => removed.has(p.index));
        const clearDuration = latest.current.reducedMotion ? 0 : 140;
        if (
          !(await animate(
            cleared.flatMap((p) => [
              Animated.timing(p.opacity, {
                toValue: 0,
                duration: clearDuration,
                useNativeDriver: true,
              }),
              Animated.timing(p.scale, {
                toValue: 0.65,
                duration: clearDuration,
                useNativeDriver: true,
              }),
            ]),
            clearDuration,
            run,
          ))
        )
          return;
        const survivors = new Map(
          piecesRef.current
            .filter((p) => !removed.has(p.index))
            .map((p) => [p.index, p]),
        );
        const next = stage.falls.map((fall) => {
          const piece =
            fall.from === null
              ? makePiece(fall.value, fall.to, fall.spawnRow)
              : survivors.get(fall.from)!;
          piece.index = fall.to;
          return piece;
        });
        publish(next);
        const fallDuration = latest.current.reducedMotion ? 0 : 240;
        const moving = stage.falls.flatMap((fall, i) =>
          fall.from === fall.to
            ? []
            : [move(next[i], point(fall.to), fallDuration)],
        );
        if (!(await animate(moving, fallDuration, run))) return;
      }
      if (run !== token.current || latest.current.game !== before) return;
      represented.current = plan.next;
      latest.current.onChange(plan.next);
      committed = true;
    } finally {
      if (alive.current && run === token.current) {
        if (!committed && plan.next !== before) {
          restore();
        } else {
          piecesRef.current.forEach((p) => {
            p.position.setValue(point(p.index));
            p.opacity.setValue(1);
            p.scale.setValue(1);
          });
          lock(false);
          setLifted(null);
        }
      }
    }
  };
  const armGestureTimeout = () => {
    if (gestureTimer.current) clearTimeout(gestureTimer.current);
    gestureTimer.current = setTimeout(() => restoreRef.current(), 8000);
  };
  const canStart = () =>
    active.current && !busy.current && !latest.current.disabled;
  const release = (e: GestureResponderEvent) => {
    if (gestureTimer.current) {
      clearTimeout(gestureTimer.current);
      gestureTimer.current = null;
    }
    const { index, x, y } = origin.current;
    origin.current.index = -1;
    if (index < 0) return;
    const to = swipeNeighbour(
      index,
      e.nativeEvent.pageX - x,
      e.nativeEvent.pageY - y,
      cellRef.current,
    );
    if (to === null) {
      const piece = piecesRef.current.find((p) => p.index === index);
      piece?.position.setValue(point(index));
      lock(false);
      setLifted(null);
      return;
    }
    void swap(index, to);
  };
  return (
    <View
      testID="garden-match-board"
      style={{
        width: size,
        height: size,
        alignSelf: "center",
        overflow: "hidden",
        borderRadius: 20,
        backgroundColor: "#355e47",
        borderWidth: 2,
        borderColor: "#d1bb7f",
        shadowColor: "#152c21",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      }}
      onStartShouldSetResponderCapture={canStart}
      onStartShouldSetResponder={canStart}
      onResponderGrant={(e) => {
        if (!canStart()) return;
        const { locationX, locationY, pageX, pageY } = e.nativeEvent,
          col = Math.floor((locationX - inset) / cellRef.current),
          row = Math.floor((locationY - inset) / cellRef.current);
        if (col < 0 || col >= 6 || row < 0 || row >= 6) return;
        lock(true);
        origin.current = { x: pageX, y: pageY, index: row * 6 + col };
        armGestureTimeout();
        setLifted(
          piecesRef.current.find((p) => p.index === row * 6 + col)?.id ?? null,
        );
      }}
      onResponderMove={(e) => {
        const i = origin.current.index;
        if (i < 0) return;
        armGestureTimeout();
        const piece = piecesRef.current.find((p) => p.index === i);
        if (!piece) return;
        const dx = e.nativeEvent.pageX - origin.current.x,
          dy = e.nativeEvent.pageY - origin.current.y,
          base = point(i);
        piece.position.setValue(
          Math.abs(dx) >= Math.abs(dy)
            ? {
                x:
                  base.x +
                  Math.max(-cellRef.current, Math.min(cellRef.current, dx)),
                y: base.y,
              }
            : {
                x: base.x,
                y:
                  base.y +
                  Math.max(-cellRef.current, Math.min(cellRef.current, dy)),
              },
        );
      }}
      onResponderRelease={release}
      onResponderTerminate={() => restoreRef.current()}
      onResponderTerminationRequest={() => false}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 300 300">
          <Defs>
            <LinearGradient id="gardenFelt" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#507c57" />
              <Stop offset="1" stopColor="#254c3b" />
            </LinearGradient>
          </Defs>
          <Rect
            x="2"
            y="2"
            width="296"
            height="296"
            rx="19"
            fill="url(#gardenFelt)"
          />
          <Rect
            x="6"
            y="6"
            width="288"
            height="288"
            rx="15"
            stroke="#e0c78b"
            strokeWidth="1"
            opacity=".65"
            fill="none"
          />
        </Svg>
      </View>
      <IdleFirefly
        settings={
          idleGuide
            ? {
                ...idleGuide,
                enabled: idleGuide.enabled && !disabled,
                paused: idleGuide.paused || lifted !== null,
              }
            : undefined
        }
        revision={game}
        resolve={() => {
          const move = matchIdleHint(game);
          return move
            ? move.map((index) => ({
                x: inset + (index % 6) * cell + cell * 0.78,
                y: inset + Math.floor(index / 6) * cell + cell * 0.25,
              }))
            : [];
        }}
      />
      {pieces.map((piece) => (
        <Animated.View
          key={piece.id}
          nativeID={piece.id}
          testID={`match-cell-${piece.index}`}
          accessible
          accessibilityRole="button"
          accessibilityLabel={String(
            t("matchTile", { number: piece.index + 1 }),
          )}
          accessibilityHint={String(t("matchSwipeHint"))}
          accessibilityState={{ disabled }}
          accessibilityActions={["left", "right", "up", "down"].map((name) => ({
            name,
            label: String(t(`swipe_${name}`)),
          }))}
          onAccessibilityAction={(e) => {
            if (!canStart()) return;
            const d = e.nativeEvent.actionName,
              to = swipeNeighbour(
                piece.index,
                d === "left" ? -cell : d === "right" ? cell : 0,
                d === "up" ? -cell : d === "down" ? cell : 0,
                cell,
              );
            if (to !== null) void swap(piece.index, to);
          }}
          pointerEvents="none"
          style={[
            styles.tile,
            {
              left: inset,
              top: inset,
              width: cell - 4,
              height: cell - 4,
              opacity: piece.opacity,
              zIndex: lifted === piece.id ? 10 : 1,
              transform: [
                ...piece.position.getTranslateTransform(),
                { scale: piece.scale },
              ],
            },
          ]}
        >
          <MiniArtwork kind="match" value={piece.value} size={cell * 0.76} />
        </Animated.View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  tile: {
    position: "absolute",
    backgroundColor: "#fff6df",
    borderColor: "#d6c28c",
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: "#163c29",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
    justifyContent: "center",
  },
});
