import type { StringKey } from "../../i18n/strings";
import type { AvatarKey } from "./avatarKeys";
import type { CardBackStyle, CardFaceStyle } from "../../application/preferencesStore";
import type { Season } from "../../domain/garden/types";

export const AVATAR_LABEL_KEY: Record<AvatarKey, StringKey> = {
  bird: "avatarBird",
  cat: "avatarCat",
  fox: "avatarFox",
  hedgehog: "avatarHedgehog",
  owl: "avatarOwl",
  rabbit: "avatarRabbit",
};

export const CARD_FACE_LABEL_KEY: Record<CardFaceStyle, StringKey> = {
  blank: "cardFaceBlank",
  botanical: "cardFaceBotanical",
  woodland: "cardFaceWoodland",
};

export const CARD_BACK_LABEL_KEY: Record<CardBackStyle, StringKey> = {
  botanical: "cardBackBotanical",
  stars: "cardBackStars",
  woodland: "cardBackWoodland",
};

export const SEASON_LABEL_KEY: Record<Season, StringKey> = {
  spring: "seasonSpring",
  summer: "seasonSummer",
  autumn: "seasonAutumn",
  winter: "seasonWinter",
};
