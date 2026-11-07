/** Bundled, offline-ready images for Expo/React Native .
 * Metro requires literal require() calls; do not build dynamic paths from JSON.
 * Images live in public/assets pending a future move to assets/.
 */
export const cozyImages = {
  seasons: {
    spring: require("../../public/assets/backgrounds/seasons/spring_cottage_garden.webp"),
    summer: require("../../public/assets/backgrounds/seasons/summer_cottage_garden.webp"),
    autumn: require("../../public/assets/backgrounds/seasons/autumn_cottage_garden.webp"),
    winter: require("../../assets/world/cottage/winter.png"),
  },
  characters: {
    millie: require("../../public/assets/characters/millie_rabbit.png"),
    marmalade: require("../../public/assets/characters/marmalade_cat.png"),
  },
  sheets: {
    ui: require("../../public/assets/icons/ui_icons_sheet.png"),
    resources: require("../../public/assets/resources/resources_sheet.png"),
  },
} as const;
export type CozySeason = keyof typeof cozyImages.seasons;

/** Original dimensions, also used by the camera so 100% never crops the artwork. */
export function gardenImageSize(season: CozySeason) {
  if (season === "winter") return { width: 1672, height: 941 };
  return { width: 836, height: season === "autumn" ? 471 : 470 };
}
