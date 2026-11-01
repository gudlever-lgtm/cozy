import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { G, Path, Circle, Rect } from "react-native-svg";
export function FestivalDecorations({ events }: { events: string[] }) {
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={StyleSheet.absoluteFill}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 620"
        preserveAspectRatio="xMidYMid slice"
      >
        {events.map((id, i) => (
          <G key={id} transform={`translate(${170 + i * 95},490)`}>
            {id === "spring" ? (
              <>
                <Path
                  d="M-25 0Q15 40 65 0"
                  stroke="#87a674"
                  strokeWidth="5"
                  fill="none"
                />
                {[-10, 10, 30, 50].map((x, j) => (
                  <G key={x}>
                    <Circle
                      cx={x}
                      cy={15 + Math.sin(j) * 8}
                      r="9"
                      fill="#e7b8c2"
                    />
                    <Circle
                      cx={x}
                      cy={15 + Math.sin(j) * 8}
                      r="3"
                      fill="#f0daa0"
                    />
                  </G>
                ))}
              </>
            ) : id === "summer" ? (
              <>
                <Path
                  d="M8-5Q20-25 33-5"
                  stroke="#9d895e"
                  strokeWidth="3"
                  fill="none"
                />
                <Rect
                  x="3"
                  width="36"
                  height="48"
                  rx="9"
                  fill="#eac884"
                  stroke="#aa8c54"
                  strokeWidth="3"
                />
                <Path d="M15 5V42M27 5V42" stroke="#fff0b2" strokeWidth="3" />
              </>
            ) : id === "autumn" ? (
              <>
                <Path
                  d="M-2 8Q20-30 44 8"
                  stroke="#aa885c"
                  strokeWidth="4"
                  fill="none"
                />
                <Path d="M-8 8H50L42 43H1Z" fill="#bd9762" />
                {[5, 20, 35].map((x, j) => (
                  <Circle
                    key={x}
                    cx={x}
                    cy={10 - (j % 2) * 8}
                    r="11"
                    fill={j === 1 ? "#d9bd7c" : "#cb9066"}
                  />
                ))}
                <Path d="M0 24H45M4 34H43" stroke="#977e54" strokeWidth="3" />
              </>
            ) : (
              <>
                <Path
                  d="M20-15L30 6L53 10L36 25L40 48L20 36L0 48L4 25L-13 10L10 6Z"
                  fill="#ead29a"
                  stroke="#b49a6d"
                  strokeWidth="3"
                />
                <Circle cx="20" cy="17" r="6" fill="#fff2cc" />
              </>
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
}
