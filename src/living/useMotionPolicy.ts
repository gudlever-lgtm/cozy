import { useEffect, useState } from "react";
import { AppState, AccessibilityInfo } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { shouldAnimate } from "./model";
export function useMotionStatus(enabled: boolean, reducedMotion: boolean) {
  const initialReduced = useReducedMotion();
  const [systemReduced, setSystemReduced] = useState(initialReduced);
  const [appState, setAppState] = useState(AppState.currentState ?? "active");
  useEffect(() => {
    let mounted = true;
    void Promise.resolve(AccessibilityInfo.isReduceMotionEnabled())
      .then((value) => {
        if (mounted && typeof value === "boolean") setSystemReduced(value);
      })
      .catch(() => {});
    const app = AppState.addEventListener("change", setAppState);
    const reduce = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setSystemReduced,
    );
    return () => {
      mounted = false;
      app.remove();
      reduce.remove();
    };
  }, []);
  return {
    active: shouldAnimate(enabled, reducedMotion || systemReduced, appState),
    reason: !enabled
      ? "off"
      : systemReduced
        ? "system"
        : reducedMotion
          ? "manual"
          : appState !== "active"
            ? "background"
            : "running",
  } as const;
}

export function useMotionPolicy(enabled: boolean, reducedMotion: boolean) {
  return useMotionStatus(enabled, reducedMotion).active;
}
