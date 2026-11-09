import React from "react";
import { Image, View, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { cozyRedesignImages } from "../assets/cozyRedesignImages";

/** An illustrated profile portrait, never a font emoji or playing-card symbol. */
export function PlayerAvatar({
  avatar,
  size = 40,
}: {
  avatar?: string | null;
  size?: number;
}) {
  const image =
    avatar === "🐱"
      ? cozyRedesignImages.characters_marmalade_idle_webp
      : avatar === "🐰"
        ? cozyRedesignImages.characters_millie_idle_webp
        : null;
  const palette: Record<string, string> = {
    "🦊": "#e5a373",
    "🦉": "#b99f79",
    "🐻": "#ad8864",
    "🐿️": "#d1a07b",
    "🦔": "#a79b84",
    "🌸": "#e0a6bb",
  };
  const base = palette[avatar ?? ""] ?? "#bbd6b9";
  return (
    <View
      testID="player-avatar"
      accessible={false}
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: base,
        },
      ]}
    >
      {image ? (
        <Image
          source={image}
          resizeMode="contain"
          style={{ width: size * 0.92, height: size * 0.92 }}
          accessible={false}
        />
      ) : (
        <Svg width={size * 0.8} height={size * 0.8} viewBox="0 0 48 48">
          {avatar && avatar !== "🌸" ? (
            <>
              <Path
                d="M9 18L8 5l13 10M39 18L40 5 27 15"
                fill="#fff1d3"
                stroke="#795a43"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <Circle
                cx="24"
                cy="24"
                r="16"
                fill="#fff1d3"
                stroke="#795a43"
                strokeWidth="2"
              />
              <Circle cx="18" cy="23" r="2" fill="#44362d" />
              <Circle cx="30" cy="23" r="2" fill="#44362d" />
              <Path
                d="M21 30q3 4 6 0"
                fill="none"
                stroke="#795a43"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Circle cx="24" cy="28" r="2" fill="#b97b73" />
            </>
          ) : (
            <>
              <Circle cx="24" cy="17" r="9" fill="#fff1d3" />
              <Path d="M7 45c0-12 7-19 17-19s17 7 17 19" fill="#fff1d3" />
              <Path
                d="M16 12q8-10 16 0"
                fill="none"
                stroke="#795a43"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          )}
        </Svg>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  frame: {
    borderWidth: 2,
    borderColor: "#d2a45c",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
