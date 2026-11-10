// assets/v3-premium/ — candidate "Premium Art V1" raster pack (docs/PREMIUM_ART_IMPORT.md).
// NOT a replacement for assets/v3/: the original SVG UI chrome (buttons, panels, nav,
// icons, cards) is untouched and still drives all HUD/controls/navigation. This file
// only maps the new background/character/logo raster layers used by WelcomeScreen and
// GardenScreen. Candidate status — not owner-approved as final production art.
import type { Season } from "../../domain/garden/types";

export const PREMIUM_SEASON_BACKGROUNDS: Record<Season, number> = {
  spring: require("../../../assets/v3-premium/backgrounds/garden-spring-premium.png"),
  summer: require("../../../assets/v3-premium/backgrounds/garden-summer-premium.png"),
  autumn: require("../../../assets/v3-premium/backgrounds/garden-autumn-premium.png"),
  winter: require("../../../assets/v3-premium/backgrounds/garden-winter-premium.png"),
};

export const PREMIUM_WELCOME_BACKGROUND: number = require("../../../assets/v3-premium/backgrounds/welcome-garden-premium.png");
export const PREMIUM_LOGO: number = require("../../../assets/v3-premium/branding/cozy-solitaire-premium-logo.png");
export const PREMIUM_MILLIE: number = require("../../../assets/v3-premium/characters/millie-premium.png");
export const PREMIUM_MARMALADE: number = require("../../../assets/v3-premium/characters/marmalade-premium.png");

/** Intrinsic pixel size of every premium background (manifest.json), replacing the old
 * 720x1280 SVG scene for GardenScreen's world-coordinate system. */
export const PREMIUM_SCENE = { width: 768, height: 1280 } as const;

export const PREMIUM_LOGO_ASPECT = 630 / 278;
export const PREMIUM_CHARACTER_ASPECT = 1; // 640x640

/**
 * Each premium background is a sharp painted scene with a blurred full-bleed
 * extension above and below it (docs/PREMIUM_ART_IMPORT.md's documented limitation),
 * measured directly (horizontal-gradient variance per row, i.e. "which rows actually
 * have brush detail") rather than guessed: welcome-garden-premium.png's sharp content
 * spans roughly 27%-66% of its height; every season background roughly 20%-80%. A
 * "zoom to only the sharp band" crop was tried for the Welcome background and
 * reverted — the sharp band's aspect ratio is landscape-shaped, so covering a portrait
 * phone screen with just that band crops out Marmalade entirely. Kept here as a
 * measurement record for whoever next works on this, not wired to any component.
 */
export const WELCOME_SHARP_BAND = { top: 0.266, bottom: 0.656 };
export const SEASON_SHARP_BAND = { top: 0.203, bottom: 0.79 };
