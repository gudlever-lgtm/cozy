import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Sprite } from "./living/Sprite";
import { useMotionStatus } from "./living/useMotionPolicy";
import { MiniArtwork } from "./MiniArtwork";
import { treasuresForLevel, type MiniLevel } from "./engine/session";
import type { LivingSeason, AnimationQuality } from "./living/model";
type Flight = { id: string; x: number; y: number; value: number };
function ButterflyDeparture({
  flight,
  width,
  height,
}: {
  flight: Flight;
  width: number;
  height: number;
}) {
  const phase = useSharedValue(0);
  useEffect(() => {
    phase.value = withTiming(1, {
      duration: 2600,
      easing: Easing.inOut(Easing.quad),
    });
    return () => cancelAnimation(phase);
  }, [phase]);
  const path = useAnimatedStyle(() => {
    const t = phase.value,
      x = (flight.x * width) / 100,
      y = (flight.y * height) / 100;
    const destination = x < width / 2 ? -38 : width + 38;
    return {
      opacity: Math.min(1, (1 - t) * 5),
      transform: [
        { translateX: x - 18 + (destination - x) * t },
        {
          translateY:
            y - 18 - t * height * 0.42 - Math.sin(t * Math.PI) * height * 0.16,
        },
        { rotate: `${Math.sin(t * Math.PI * 3) * 10}deg` },
      ],
    };
  });
  const object = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - phase.value * 6),
    transform: [{ scale: 1 - phase.value * 0.4 }],
  }));
  const butterfly = useAnimatedStyle(() => ({
    opacity: Math.min(1, phase.value * 6),
    transform: [{ scaleX: 0.87 + Math.sin(phase.value * Math.PI * 26) * 0.13 }],
  }));
  return (
    <Animated.View
      testID={`treasure-flight-${flight.id}`}
      style={[s.departure, path]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, object]}>
        <MiniArtwork kind="treasure" value={flight.value} size={36} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, butterfly]}>
        <Sprite kind="butterfly" size={36} />
      </Animated.View>
    </Animated.View>
  );
}
function FallingSprite({
  index,
  season,
  width,
  height,
}: {
  index: number;
  season: LivingSeason;
  width: number;
  height: number;
}) {
  const phase = useSharedValue(0);
  useEffect(() => {
    phase.value = withDelay(
      index * 80,
      withTiming(1, { duration: 3300, easing: Easing.linear }),
    );
    return () => cancelAnimation(phase);
  }, [phase, index]);
  const style = useAnimatedStyle(() => {
    const t = phase.value;
    return {
      opacity: Math.min(1, t * 10, (1 - t) * 5) * 0.8,
      transform: [
        {
          translateX:
            width * ((index * 0.173 + 0.07) % 1) +
            Math.sin(t * Math.PI * 2 + index) * 20,
        },
        { translateY: -24 + t * (height + 40) },
        { rotate: `${index * 27 + t * 110}deg` },
      ],
    };
  });
  const kind =
    season === "winter"
      ? "snowflake"
      : season === "autumn"
        ? "leaf"
        : "blossom";
  return (
    <Animated.View
      testID={`treasure-celebration-${kind}`}
      style={[s.particle, style]}
    >
      <Sprite kind={kind} size={season === "winter" ? 15 : 22} />
    </Animated.View>
  );
}
export function HiddenTreasureEffects({
  found,
  level,
  seed,
  width,
  height,
  season,
  quality,
  enabled,
  reducedMotion,
}: {
  found: string[];
  level: MiniLevel;
  seed?: string;
  width: number;
  height: number;
  season: LivingSeason;
  quality: AnimationQuality;
  enabled: boolean;
  reducedMotion: boolean;
}) {
  const { t } = useTranslation();
  const motion = useMotionStatus(enabled, reducedMotion);
  const previous = useRef(new Set(found));
  const [flights, setFlights] = useState<Flight[]>([]),
    [celebrating, setCelebrating] = useState(false);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const added = found.filter((id) => !previous.current.has(id));
    const justWon = found.length === 5 && previous.current.size < 5;
    previous.current = new Set(found);
    if (added.length && motion.active) {
      const objects = treasuresForLevel(level, seed);
      setFlights((old) =>
        [
          ...old,
          ...added.flatMap((id) => {
            const value = objects.findIndex((o) => o.id === id),
              o = objects[value];
            return o ? [{ id, x: o.x, y: o.y, value }] : [];
          }),
        ].slice(-5),
      );
      for (const id of added) {
        const timer = setTimeout(() => {
          setFlights((old) => old.filter((f) => f.id !== id));
          timers.current.delete(timer);
        }, 2750);
        timers.current.add(timer);
      }
    }
    if (justWon) {
      setCelebrating(true);
      const timer = setTimeout(() => {
        setCelebrating(false);
        timers.current.delete(timer);
      }, 4500);
      timers.current.add(timer);
    }
  }, [found, level, seed, motion.active]);
  useEffect(() => {
    if (!motion.active) setFlights([]);
  }, [motion.active]);
  useEffect(
    () => () => {
      for (const timer of timers.current) clearTimeout(timer);
    },
    [],
  );
  return (
    <View
      testID="hidden-treasure-effects"
      pointerEvents="none"
      accessible={false}
      style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}
    >
      {motion.active &&
        flights.map((f) => (
          <ButterflyDeparture
            key={f.id}
            flight={f}
            width={width}
            height={height}
          />
        ))}
      {celebrating && motion.foreground && (
        <>
          {motion.active &&
            Array.from(
              {
                length: quality === "low" ? 6 : quality === "medium" ? 10 : 14,
              },
              (_, i) => (
                <FallingSprite
                  key={i}
                  index={i}
                  season={season}
                  width={width}
                  height={height}
                />
              ),
            )}
          <View testID="hidden-congratulations" style={s.banner}>
            <Sprite kind="glimmer" size={30} />
            <Text accessibilityLiveRegion="polite" style={s.congratulations}>
              {String(t("hiddenCongratulations"))}
            </Text>
            <Sprite kind="glimmer" size={30} />
          </View>
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  departure: { position: "absolute", width: 36, height: 36 },
  particle: { position: "absolute", left: 0, top: 0 },
  banner: {
    position: "absolute",
    alignSelf: "center",
    maxWidth: "92%",
    top: "30%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff5e7f2",
    borderWidth: 1,
    borderColor: "#cfb16f",
  },
  congratulations: {
    color: "#345b49",
    fontSize: 18,
    flexShrink: 1,
    textAlign: "center",
    fontWeight: "700",
  },
});
