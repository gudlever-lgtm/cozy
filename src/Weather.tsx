import React, { useEffect, useRef, useState } from "react";
import { Animated, View, Text, AppState, StyleSheet } from "react-native";
import type { Season } from "./engine/world";
export function Weather({
  season,
  intensity,
  reduced,
}: {
  season: Season;
  intensity: number;
  reduced: boolean;
}) {
  const y = useRef(new Animated.Value(0)).current;
  const [active, setActive] = useState(AppState.currentState === "active");
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setActive(state === "active"),
    );
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    y.setValue(0);
    if (reduced || intensity === 0 || !active) return;
    const a = Animated.loop(
      Animated.timing(y, {
        toValue: 1,
        duration: season === "autumn" ? 2800 : 6500,
        useNativeDriver: true,
      }),
    );
    a.start();
    return () => a.stop();
  }, [season, intensity, reduced, y, active]);
  if (!intensity || reduced || !active) return null;
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: reduced ? 0.25 : 0.6,
            transform: [
              {
                translateY: y.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 300],
                }),
              },
            ],
          },
        ]}
      >
        {Array.from({ length: Math.round(intensity * 28) }, (_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 37) % 100}%`,
              top: (i * 79) % 300,
              width: season === "autumn" ? (i % 4 === 0 ? 9 : 2) : 5,
              height: season === "autumn" ? (i % 4 === 0 ? 5 : 17) : 5,
              borderRadius: 8,
              backgroundColor:
                season === "winter"
                  ? "#fff"
                  : season === "autumn"
                    ? i % 4 === 0
                      ? "#c89259"
                      : "#bad5d4"
                    : "#fff2bc",
            }}
          />
        ))}
      </Animated.View>
    </View>
  );
}
