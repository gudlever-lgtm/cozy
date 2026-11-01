import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useMotionStatus } from "./useMotionPolicy";
import { Sprite } from "./Sprite";
export const IDLE_HINT_DELAY = 12000;
export type HintPoint = { x: number; y: number };
export type IdleGuideSettings = {
  enabled: boolean;
  reducedMotion: boolean;
  activity: number;
  paused: boolean;
};
export type HintRect = { x: number; y: number; width: number; height: number };
export function measureHintNode(
  node: View | null | undefined,
): Promise<HintRect | null> {
  if (!node) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 200);
    try {
      node.measureInWindow((x, y, width, height) => {
        clearTimeout(timeout);
        resolve(width > 0 && height > 0 ? { x, y, width, height } : null);
      });
    } catch {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}
/** One quiet demonstration per idle period. UI-thread flight; no input or game mutation. */
export function IdleFirefly({
  settings,
  revision,
  resolve,
  absolute = false,
}: {
  settings?: IdleGuideSettings;
  revision: unknown;
  resolve: () => HintPoint[] | Promise<HintPoint[]>;
  absolute?: boolean;
}) {
  const motion = useMotionStatus(
    settings?.enabled ?? false,
    settings?.reducedMotion ?? false,
  );
  const [points, setPoints] = useState<HintPoint[] | null>(null);
  const root = useRef<View>(null),
    resolver = useRef(resolve);
  resolver.current = resolve;
  const progress = useSharedValue(0);
  const allowed = !!settings?.enabled && !settings.paused && motion.foreground;
  const moving = motion.active;
  useEffect(() => {
    let cancelled = false;
    setPoints(null);
    cancelAnimation(progress);
    progress.value = 0;
    if (!allowed) return;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(async () => {
      let targets: HintPoint[];
      try {
        targets = await resolver.current();
      } catch {
        return;
      }
      const bounds = absolute ? await measureHintNode(root.current) : null;
      if (cancelled || !targets.length || (absolute && !bounds)) return;
      const local = targets.map((p) => ({
        x: p.x - (bounds?.x ?? 0),
        y: p.y - (bounds?.y ?? 0),
      }));
      setPoints(local.slice(0, 2));
      progress.value = withTiming(1, {
        duration: moving ? 6500 : 3500,
        easing: Easing.linear,
      });
      hide = setTimeout(
        () => {
          if (!cancelled) setPoints(null);
        },
        moving ? 6800 : 3600,
      );
    }, IDLE_HINT_DELAY);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(hide);
      cancelAnimation(progress);
    };
  }, [allowed, moving, settings?.activity, revision]);
  const style = useAnimatedStyle(() => {
    if (!points) return { opacity: 0 };
    const first = points[0],
      second = points[1] ?? first,
      t = progress.value;
    const incoming = Math.min(1, t / 0.3),
      transfer = Math.max(0, Math.min(1, (t - 0.52) / 0.25));
    const ease = (n: number) => n * n * (3 - 2 * n);
    const start = { x: -24, y: Math.max(12, first.y - 35) };
    const x =
      t < 0.52
        ? start.x + (first.x - start.x) * ease(incoming)
        : first.x + (second.x - first.x) * ease(transfer);
    const y =
      t < 0.52
        ? start.y +
          (first.y - start.y) * ease(incoming) -
          Math.sin(incoming * Math.PI) * 18
        : first.y +
          (second.y - first.y) * ease(transfer) -
          Math.sin(transfer * Math.PI) * 16;
    return {
      opacity: Math.min(1, t * 14, (1 - t) * 8) * 0.9,
      transform: [
        { translateX: (moving ? x : first.x) - 13 },
        { translateY: (moving ? y : first.y) - 13 },
      ],
    };
  });
  return (
    <View
      ref={root}
      collapsable={false}
      testID="idle-hint-layer"
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={s.layer}
    >
      {points && (
        <Animated.View
          testID={moving ? "idle-hint-firefly" : "idle-hint-static"}
          style={[s.marker, style]}
        >
          {moving ? (
            <Sprite kind="firefly" size={26} />
          ) : (
            <View style={s.ring} />
          )}
        </Animated.View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    elevation: 20,
    overflow: "hidden",
  },
  marker: { position: "absolute", width: 26, height: 26 },
  ring: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderColor: "#e5c15c",
    borderWidth: 2,
    backgroundColor: "transparent",
  },
});
