import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Card } from "../../domain/solitaire/types";
import { CARD_BACK_ART, CARD_FACE_ART, SUIT_SYMBOL, isRedSuit, rankLabel } from "../theme/cardArt";
import type { CardBackStyle, CardFaceStyle } from "../../application/preferencesStore";

export interface PlayingCardProps {
  readonly card: Card;
  readonly width: number;
  readonly faceStyle: CardFaceStyle;
  readonly backStyle: CardBackStyle;
  readonly highlighted?: boolean;
}

/**
 * Renders one card. Face art is the approved face-*.svg frame; rank and suit are
 * native Text drawn in the reserved top-left corner (mirrored bottom-right), per
 * docs/ASSET_SPEC.md "Rank & suit i reserverede hjørner" — never baked into the
 * artwork, never a generic fallback glyph set. Card theme (face/back) is purely a
 * rendering prop; it never reads or writes domain GameState.
 */
export function PlayingCard({ card, width, faceStyle, backStyle, highlighted }: PlayingCardProps) {
  const height = (width * 270) / 190;

  if (!card.faceUp) {
    const Back = CARD_BACK_ART[backStyle];
    return (
      <View style={{ width, height }}>
        <Back width="100%" height="100%" />
      </View>
    );
  }

  const Face = CARD_FACE_ART[faceStyle];
  const color = isRedSuit(card.suit) ? "#b5304a" : "#2b2420";
  const label = `${rankLabel(card.rank)}${SUIT_SYMBOL[card.suit]}`;
  const fontSize = Math.max(11, width * 0.16);

  return (
    <View style={[{ width, height }, highlighted ? styles.highlighted : null]}>
      <Face width="100%" height="100%" />
      <Text style={[styles.corner, styles.topLeft, { color, fontSize }]}>{label}</Text>
      <Text style={[styles.corner, styles.bottomRight, { color, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: { position: "absolute", fontWeight: "800" },
  topLeft: { top: "8%", left: "10%" },
  bottomRight: { bottom: "8%", right: "10%", transform: [{ rotate: "180deg" }] },
  highlighted: { borderRadius: 10, borderWidth: 3, borderColor: "#f4b400" },
});
