/** Bundled, offline-ready images for Expo/React Native and React Native Web.
 * Metro requires literal require() calls; do not build dynamic paths from JSON.
 * Images live in public/assets pending a future move to assets/.
 */
export const cozyImages = {
  seasons: {
    spring: require('../../public/assets/backgrounds/seasons/spring_cottage_garden.webp'),
    summer: require('../../public/assets/backgrounds/seasons/summer_cottage_garden.webp'),
    autumn: require('../../public/assets/backgrounds/seasons/autumn_cottage_garden.webp'),
    winter: require('../../public/assets/backgrounds/seasons/winter_cottage_garden.webp'),
  },
  boards: {
    summerEvening: require('../../public/assets/backgrounds/seasons/summer_evening_board.png'),
    autumnRain: require('../../public/assets/backgrounds/seasons/autumn_rain_board.png'),
    winterSnow: require('../../public/assets/backgrounds/seasons/winter_snow_board.png'),
  },
  characters: {
    millie: require('../../public/assets/characters/millie_rabbit.png'),
    marmalade: require('../../public/assets/characters/marmalade_cat.png'),
  },
  sheets: {
    ui: require('../../public/assets/icons/ui_icons_sheet.png'),
    resources: require('../../public/assets/resources/resources_sheet.png'),
  },
} as const;
export type CozySeason = keyof typeof cozyImages.seasons;
