export type Locale = "da" | "en";

export const strings = {
  da: {
    playNow: "Spil nu",
    myGarden: "Min have",
    garden: "Have",
    solitaire: "Kabale",
    minigames: "Minispil",
    quests: "Opgaver",
    settings: "Indstillinger",
    comingSoon: "Kommer snart",
    welcomeTagline: "En hyggelig have, kabale og eventyr med Millie og Marmalade.",
  },
  en: {
    playNow: "Play now",
    myGarden: "My garden",
    garden: "Garden",
    solitaire: "Solitaire",
    minigames: "Minigames",
    quests: "Quests",
    settings: "Settings",
    comingSoon: "Coming soon",
    welcomeTagline: "A cozy garden, card game and story with Millie and Marmalade.",
  },
} as const;

export type StringKey = keyof typeof strings.da;
