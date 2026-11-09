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
        { width: size, height: size, borderRadius: size / 2, backgroundColor: base },
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
        <Svg width={size * 0.84} height={size * 0.84} viewBox="0 0 48 48">
          {avatar === "🦊" ? (
            <>
              <Path d="M4 7L17 14L24 11L31 14L44 7L38 34Q24 47 10 34Z" fill="#f2a968" stroke="#795a43" strokeWidth="2" strokeLinejoin="round" />
              <Path d="M9 27L24 37L39 27Q37 42 24 43Q11 42 9 27Z" fill="#fff4dd" />
              <Circle cx="17" cy="25" r="2" fill="#493729" />
              <Circle cx="31" cy="25" r="2" fill="#493729" />
              <Path d="M21 33L27 33L24 37Z" fill="#634a3a" />
            </>
          ) : avatar === "🦉" ? (
            <>
              <Path d="M7 11L12 3L21 10L27 10L36 3L41 11L38 40Q24 47 10 40Z" fill="#b98a61" stroke="#795a43" strokeWidth="2" strokeLinejoin="round" />
              <Circle cx="16" cy="24" r="9" fill="#fff1d3" />
              <Circle cx="32" cy="24" r="9" fill="#fff1d3" />
              <Circle cx="17" cy="24" r="3" fill="#45382a" />
              <Circle cx="31" cy="24" r="3" fill="#45382a" />
              <Path d="M21 33L27 33L24 38Z" fill="#d79743" />
            </>
          ) : avatar === "🐻" ? (
            <>
              <Circle cx="11" cy="13" r="8" fill="#947053" stroke="#795a43" strokeWidth="2" />
              <Circle cx="37" cy="13" r="8" fill="#947053" stroke="#795a43" strokeWidth="2" />
              <Circle cx="24" cy="25" r="19" fill="#b78e6c" stroke="#795a43" strokeWidth="2" />
              <Circle cx="17" cy="23" r="2.2" fill="#45382a" />
              <Circle cx="31" cy="23" r="2.2" fill="#45382a" />
              <Circle cx="24" cy="32" r="9" fill="#e7c7a4" />
              <Circle cx="24" cy="29" r="3" fill="#45382a" />
              <Path d="M21 34Q24 37 27 34" fill="none" stroke="#795a43" strokeWidth="1.6" strokeLinecap="round" />
            </>
          ) : avatar === "🐿️" ? (
            <>
              <Path d="M6 4L18 11L24 9L30 11L42 4L40 34Q24 47 8 34Z" fill="#c47f4e" stroke="#795a43" strokeWidth="2" strokeLinejoin="round" />
              <Path d="M11 28Q24 41 37 28L35 39Q24 46 13 39Z" fill="#f1d1aa" />
              <Circle cx="17" cy="24" r="2" fill="#423126" />
              <Circle cx="31" cy="24" r="2" fill="#423126" />
              <Circle cx="24" cy="31" r="3" fill="#86553e" />
              <Path d="M20 36Q24 39 28 36" fill="none" stroke="#795a43" strokeWidth="2" />
            </>
          ) : avatar === "🦔" ? (
            <>
              <Path d="M4 27L8 14L12 17L16 7L20 14L26 4L30 15L36 9L39 20L44 21L39 40L10 41Z" fill="#786d59" stroke="#665543" strokeWidth="2" strokeLinejoin="round" />
              <Path d="M9 26Q24 10 39 27Q42 43 25 43Q12 43 9 26Z" fill="#f1d6b2" />
              <Circle cx="19" cy="28" r="2.2" fill="#45382a" />
              <Circle cx="31" cy="28" r="2.2" fill="#45382a" />
              <Circle cx="25" cy="35" r="2.7" fill="#795a43" />
            </>
          ) : avatar === "🌸" ? (
            <>
              <Circle cx="24" cy="12" r="9" fill="#f4cada" />
              <Circle cx="34" cy="20" r="9" fill="#f4cada" />
              <Circle cx="30" cy="32" r="9" fill="#f4cada" />
              <Circle cx="17" cy="32" r="9" fill="#f4cada" />
              <Circle cx="14" cy="20" r="9" fill="#f4cada" />
              <Circle cx="24" cy="23" r="8" fill="#efc36a" stroke="#c59a45" strokeWidth="1.5" />
            </>
          ) : (
            <>
              <Circle cx="24" cy="17" r="9" fill="#fff1d3" />
              <Path d="M7 45c0-12 7-19 17-19s17 7 17 19" fill="#fff1d3" />
              <Path d="M16 12q8-10 16 0" fill="none" stroke="#795a43" strokeWidth="3" strokeLinecap="round" />
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
