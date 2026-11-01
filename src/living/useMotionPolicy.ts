import { useEffect, useState } from "react";
import { AppState, AccessibilityInfo } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { shouldAnimate } from "./model";
export function useMotionPolicy(enabled: boolean, reducedMotion: boolean) {
  const initialReduced = useReducedMotion();
  const [systemReduced, setSystemReduced] = useState(initialReduced);
  const [appState, setAppState] = useState(AppState.currentState);
  useEffect(() => {
    const app = AppState.addEventListener("change", setAppState);
    const reduce = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setSystemReduced,
    );
    return () => {
      app.remove();
      reduce.remove();
    };
  }, []);
  return shouldAnimate(enabled, reducedMotion || systemReduced, appState);
}
