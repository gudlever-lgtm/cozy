import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
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
  useEffect(() => {
    y.setValue(0);
    if (reduced || intensity === 0) return;
    const a = Animated.loop(
      Animated.timing(y, {
        toValue: 1,
        duration: season === "autumn" ? 2800 : 6500,
        useNativeDriver: true,
      }),
    );
    a.start();
    return () => a.stop();
  }, [season, intensity, reduced, y]);
  if (!intensity) return null;
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
              width: season === "autumn" ? 2 : 5,
              height: season === "autumn" ? 17 : 5,
              borderRadius: 8,
              backgroundColor:
                season === "winter"
                  ? "#fff"
                  : season === "autumn"
                    ? "#bad5d4"
                    : "#fff2bc",
            }}
          />
        ))}
      </Animated.View>
    </View>
  );
}
