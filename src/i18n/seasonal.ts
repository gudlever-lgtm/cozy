export const seasonalStrings = {
  da: {
    settings: 'Indstillinger',
    language: 'Sprog',
    season: 'Årstid',
    automatic: 'Automatisk',
    spring: 'Forår',
    summer: 'Sommer',
    autumn: 'Efterår',
    winter: 'Vinter',
    weather: 'Vejr',
    clear: 'Klart vejr',
    rain: 'Stille regn',
    snow: 'Let sne',
    leaves: 'Faldende blade',
    fireflies: 'Ildfluer',
    reduceMotion: 'Reducer bevægelse',
    effects: 'Vejreffekter',
    garden: 'Haven',
    millie: 'Millie',
    marmalade: 'Marmalade',
    quests: 'Opgaver',
    glimmers: 'Lysglimt',
  },
  en: {
    settings: 'Settings',
    language: 'Language',
    season: 'Season',
    automatic: 'Automatic',
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    winter: 'Winter',
    weather: 'Weather',
    clear: 'Clear skies',
    rain: 'Gentle rain',
    snow: 'Light snow',
    leaves: 'Falling leaves',
    fireflies: 'Fireflies',
    reduceMotion: 'Reduce motion',
    effects: 'Weather effects',
    garden: 'Garden',
    millie: 'Millie',
    marmalade: 'Marmalade',
    quests: 'Quests',
    glimmers: 'Glimmers',
  },
} as const;
export type CozyLanguage = keyof typeof seasonalStrings;
export type SeasonalTranslationKey = keyof typeof seasonalStrings.da;

export function seasonalText(language: CozyLanguage, key: SeasonalTranslationKey): string {
  return seasonalStrings[language][key];
}
