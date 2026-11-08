import React, { memo } from "react";
import { Image } from "react-native";
import { cozyImages } from "./assets/images";
import Svg, { Rect, Path, G, Text as SvgText } from "react-native-svg";
import type { Card } from "./engine/solitaire";
import type { CardTheme } from "./engine/progression";
const palette = {
  classic: {
    ink: "#345b49",
    paper: "#fff9eb",
    back: "#456c98",
    gold: "#d7c48b",
  },
  botanical: {
    ink: "#55754e",
    paper: "#fffaf0",
    back: "#547648",
    gold: "#e1cea0",
  },
  river: { ink: "#3b697d", paper: "#f8fbf5", back: "#3e6c7b", gold: "#d5e4d3" },
  winter: {
    ink: "#4f657c",
    paper: "#fffaf2",
    back: "#4d6077",
    gold: "#efda9e",
  },
};
function suitPath(suit: Card["suit"]) {
  return suit === "♥"
    ? "M12 21C8 17 1 13 1 7C1-1 11-1 12 5C13-1 23-1 23 7C23 13 16 18 12 21Z"
    : suit === "♦"
      ? "M12 0L23 11L12 23L1 11Z"
      : suit === "♠"
        ? "M12 0C8 6 0 10 1 16C2 22 10 21 11 16L8 24H16L13 16C17 23 24 21 23 15C23 10 16 5 12 0Z"
        : "M12 1C4-2 2 9 8 12C0 8-3 20 5 22C9 23 11 19 11 17L8 25H16L13 17C14 23 23 25 25 18C27 11 18 8 16 12C24 6 19-1 12 1Z";
}
export const CardArtwork = memo(function CardArtwork({
  card,
  theme,
}: {
  card: Card;
  theme: CardTheme;
}) {
  const p = palette[theme],
    red = card.suit === "♥" || card.suit === "♦",
    ink = red ? "#b53d4d" : "#18392f",
    label =
      card.rank === 1
        ? "A"
        : card.rank === 11
          ? "J"
          : card.rank === 12
            ? "Q"
            : card.rank === 13
              ? "K"
              : String(card.rank);
  const pip = (x: number, y: number, size = 11, key = 0) => (
    <G key={key} transform={`translate(${x},${y}) scale(${size / 25})`}>
      <Path d={suitPath(card.suit)} fill={ink} />
    </G>
  );
  if (!card.up) {
    return (
      <Image
        testID="solitaire-card-back-art"
        accessible={false}
        source={cozyImages.cardBacks[theme]}
        style={{ width: "100%", height: "100%" }}
        resizeMode="contain"
      />
    );
  }
  return (
    <Svg width="100%" height="100%" viewBox="0 0 90 130">
      <Rect width="90" height="130" rx="6" fill={p.paper} />
      <Rect
        x="3"
        y="3"
        width="84"
        height="124"
        rx="5"
        stroke={p.gold}
        strokeWidth=".6"
        fill="none"
      />
      <SvgText x="8" y="26" fontSize="28" fontWeight="700" fill={ink}>
        {label}
      </SvgText>
      {pip(43, 10, 15)}
      <G transform="translate(90 130) rotate(180)">
        <SvgText x="8" y="26" fontSize="28" fontWeight="700" fill={ink}>
          {label}
        </SvgText>
        {pip(43, 10, 15)}
      </G>
      <G testID="card-center-suit">{pip(23, 43, 44)}</G>
    </Svg>
  );
});
