import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Animated,
  StyleSheet,
  type GestureResponderEvent,
} from "react-native";
import { useTranslation } from "react-i18next";
import { swapMatch, type Match } from "./engine/minigames";
import { swipeNeighbour } from "./presentation/matchGesture";
import { MiniArtwork } from "./MiniArtwork";

/** A swipe owns one swap through slide, resolve and refill. No React updates per animation frame. */
export function GardenMatch({
  game,
  size,
  disabled,
  reducedMotion,
  onChange,
  onBusyChange,
}: {
  game: Match;
  size: number;
  disabled: boolean;
  reducedMotion: boolean;
  onChange: (game: Match) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { t } = useTranslation();
  const cell = size / 6;
  const offsets = useRef(
    Array.from({ length: 36 }, () => new Animated.ValueXY()),
  ).current;
  const fade = useRef(new Animated.Value(1)).current;
  const busy = useRef(false);
  const alive = useRef(true);
  const origin = useRef({ x: 0, y: 0, index: -1 });
  const [lifted, setLifted] = useState<number | null>(null);
  const latest = useRef({ game, disabled, onChange });
  latest.current = { game, disabled, onChange };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      offsets.forEach((v) => v.stopAnimation());
      fade.stopAnimation();
    };
  }, [offsets, fade]);
  const reset = () => {
    offsets.forEach((v) => v.setValue({ x: 0, y: 0 }));
    fade.setValue(1);
    busy.current = false;
    if (alive.current) onBusyChange?.(false);
    if (alive.current) setLifted(null);
  };
  const slide = (a: number, b: number, back = false) =>
    new Promise<void>((resolve) => {
      const dx = ((b % 6) - (a % 6)) * cell,
        dy = (Math.floor(b / 6) - Math.floor(a / 6)) * cell;
      Animated.parallel([
        Animated.timing(offsets[a], {
          toValue: back ? { x: 0, y: 0 } : { x: dx, y: dy },
          duration: reducedMotion ? 0 : 180,
          useNativeDriver: true,
        }),
        Animated.timing(offsets[b], {
          toValue: back ? { x: 0, y: 0 } : { x: -dx, y: -dy },
          duration: reducedMotion ? 0 : 180,
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });
  const swap = async (a: number, b: number) => {
    if (latest.current.disabled) {
      reset();
      return;
    }
    busy.current = true;
    onBusyChange?.(true);
    setLifted(a);
    const before = latest.current.game;
    const next = swapMatch(before, a, b);
    await slide(a, b);
    if (!alive.current) return;
    if (next === before) {
      await slide(a, b, true);
      reset();
      return;
    }
    // Fade the resolved board in after the visible swap, rather than teleporting pieces at finger-up.
    await new Promise<void>((resolve) =>
      Animated.timing(fade, {
        toValue: 0,
        duration: reducedMotion ? 0 : 110,
        useNativeDriver: true,
      }).start(() => resolve()),
    );
    if (!alive.current) return;
    offsets.forEach((v) => v.setValue({ x: 0, y: 0 }));
    if (latest.current.game !== before) {
      reset();
      return;
    }
    latest.current.onChange(next);
    Animated.timing(fade, {
      toValue: 1,
      duration: reducedMotion ? 0 : 180,
      useNativeDriver: true,
    }).start(() => reset());
  };
  const release = (i: number, e: GestureResponderEvent) => {
    if (origin.current.index !== i) return;
    const dx = e.nativeEvent.pageX - origin.current.x,
      dy = e.nativeEvent.pageY - origin.current.y;
    origin.current.index = -1;
    const to = swipeNeighbour(i, dx, dy, cell);
    if (to === null) {
      reset();
      return;
    }
    void swap(i, to);
  };
  return (
    <View
      testID="garden-match-board"
      style={{ width: size, height: size, alignSelf: "center" }}
    >
      {game.cells.map((value, i) => (
        <Animated.View
          key={i}
          testID={`match-cell-${i}`}
          accessible
          accessibilityRole="button"
          accessibilityLabel={String(t("matchTile", { number: i + 1 }))}
          accessibilityHint={String(t("matchSwipeHint"))}
          accessibilityState={{ disabled }}
          accessibilityActions={["left", "right", "up", "down"].map((name) => ({
            name,
            label: String(t(`swipe_${name}`)),
          }))}
          onAccessibilityAction={(e) => {
            if (busy.current || disabled) return;
            const direction = e.nativeEvent.actionName;
            const to = swipeNeighbour(
              i,
              direction === "left" ? -cell : direction === "right" ? cell : 0,
              direction === "up" ? -cell : direction === "down" ? cell : 0,
              cell,
            );
            if (to !== null) void swap(i, to);
          }}
          onStartShouldSetResponder={() =>
            !busy.current && !latest.current.disabled
          }
          onResponderGrant={(e) => {
            if (busy.current) return;
            busy.current = true;
            onBusyChange?.(true);
            origin.current = {
              x: e.nativeEvent.pageX,
              y: e.nativeEvent.pageY,
              index: i,
            };
            setLifted(i);
          }}
          onResponderMove={(e) => {
            if (origin.current.index !== i) return;
            const dx = e.nativeEvent.pageX - origin.current.x,
              dy = e.nativeEvent.pageY - origin.current.y;
            offsets[i].setValue(
              Math.abs(dx) >= Math.abs(dy)
                ? { x: Math.max(-cell, Math.min(cell, dx)), y: 0 }
                : { x: 0, y: Math.max(-cell, Math.min(cell, dy)) },
            );
          }}
          onResponderRelease={(e) => release(i, e)}
          onResponderTerminate={() => {
            origin.current.index = -1;
            reset();
          }}
          onResponderTerminationRequest={() => false}
          style={[
            styles.tile,
            {
              left: (i % 6) * cell,
              top: Math.floor(i / 6) * cell,
              width: cell - 3,
              height: cell - 3,
              opacity: fade,
              zIndex: lifted === i ? 10 : 1,
              transform: offsets[i].getTranslateTransform(),
            },
          ]}
        >
          <MiniArtwork kind="match" value={value} size={cell * 0.76} />
        </Animated.View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  tile: {
    position: "absolute",
    backgroundColor: "#fff9e9",
    borderColor: "#b0c4a0",
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
