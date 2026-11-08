import React from "react";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

/**
 * Lightweight vector motifs for Cozy's cottage-garden UI.
 * These are genuine scalable illustrations, not image-sheet crops.
 * Labels and other copy must be rendered as translated Text, never painted in artwork.
 */
export type CozyMotif = "flower" | "leaf" | "shimmer" | "woodSign";
type Props = { kind: CozyMotif; size?: number; color?: string; testID?: string };

export function CozyGardenMotif({ kind, size = 32, color, testID }: Props) {
  if (kind === "woodSign") {
    return (
      <Svg testID={testID} width={size} height={size * 0.48} viewBox="0 0 160 77">
        <Rect x="3" y="6" width="154" height="65" rx="24" fill="#663B20" />
        <Rect x="7" y="3" width="146" height="64" rx="22" fill="#A86B34" stroke="#E9C77E" strokeWidth="4" />
        <Path d="M24 17 Q82 9 140 17 M26 52 Q80 61 136 52" fill="none" stroke="#F2D69A" strokeOpacity=".48" strokeWidth="2" />
        <Circle cx="20" cy="35" r="2.2" fill="#F6DAB1" />
        <Circle cx="140" cy="35" r="2.2" fill="#F6DAB1" />
      </Svg>
    );
  }
  if (kind === "leaf") {
    return (
      <Svg testID={testID} width={size} height={size} viewBox="0 0 64 64">
        <Path d="M10 54 C10 23 34 8 56 7 C54 35 42 56 10 54Z" fill={color ?? "#5F9861"} stroke="#2F603E" strokeWidth="2" />
        <Path d="M10 54 C23 37 35 26 53 11 M27 37 L18 27 M35 29 L36 16 M25 40 L43 44" fill="none" stroke="#BFE0A5" strokeWidth="2.6" strokeLinecap="round" />
      </Svg>
    );
  }
  if (kind === "shimmer") {
    return (
      <Svg testID={testID} width={size} height={size} viewBox="0 0 64 64">
        <Path d="M32 3 L39.7 23.7 L61 32 L39.7 40.3 L32 61 L24.3 40.3 L3 32 L24.3 23.7Z" fill={color ?? "#FFD66B"} stroke="#B86D23" strokeWidth="2.2" />
        <Path d="M32 12 L36.5 26.8 L52 32 L36.5 37.2 L32 52 L27.5 37.2 L12 32 L27.5 26.8Z" fill="#FFF6B9" fillOpacity=".75" />
        <Circle cx="52" cy="10" r="3" fill="#FFF4AE" />
        <Circle cx="10" cy="13" r="2" fill="#FFF4AE" />
      </Svg>
    );
  }
  return (
    <Svg testID={testID} width={size} height={size} viewBox="0 0 64 64">
      <G fill={color ?? "#EBA4B5"} stroke="#B76C7A" strokeWidth="1.3">
        <Ellipse cx="32" cy="18" rx="11" ry="17" />
        <Ellipse cx="32" cy="18" rx="11" ry="17" rotation="72" origin="32 32" />
        <Ellipse cx="32" cy="18" rx="11" ry="17" rotation="144" origin="32 32" />
        <Ellipse cx="32" cy="18" rx="11" ry="17" rotation="216" origin="32 32" />
        <Ellipse cx="32" cy="18" rx="11" ry="17" rotation="288" origin="32 32" />
      </G>
      <Circle cx="32" cy="32" r="9" fill="#FFD578" stroke="#D39B42" strokeWidth="2" />
      <Circle cx="29" cy="29" r="2" fill="#FFF2BD" />
    </Svg>
  );
}
