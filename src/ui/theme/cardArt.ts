import type { FC } from "react";
import type { SvgProps } from "react-native-svg";
import FaceBlank from "../../../assets/v3/cards/face-blank.svg";
import FaceBotanical from "../../../assets/v3/cards/face-botanical.svg";
import FaceWoodland from "../../../assets/v3/cards/face-woodland.svg";
import BackBotanical from "../../../assets/v3/cards/back-botanical.svg";
import BackStars from "../../../assets/v3/cards/back-stars.svg";
import BackWoodland from "../../../assets/v3/cards/back-woodland.svg";
import CardSlot from "../../../assets/v3/ui/card-slot.svg";
import type { CardBackStyle, CardFaceStyle } from "../../application/preferencesStore";

export const CARD_FACE_ART: Record<CardFaceStyle, FC<SvgProps>> = {
  blank: FaceBlank,
  botanical: FaceBotanical,
  woodland: FaceWoodland,
};

export const CARD_BACK_ART: Record<CardBackStyle, FC<SvgProps>> = {
  botanical: BackBotanical,
  stars: BackStars,
  woodland: BackWoodland,
};

export { CardSlot };

// docs/ui-layout-tokens.v3.json card.widthUnits/heightUnits (190x270, 19:27).
export const CARD_ASPECT = 190 / 270;

export const SUIT_SYMBOL: Record<string, string> = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠",
};

export function isRedSuit(suit: string): boolean {
  return suit === "diamonds" || suit === "hearts";
}

export function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}
