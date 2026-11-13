# Cozy Solitaire 3.0 – Expo shell

Dette er en tidlig Android/iOS-appskal, ikke en godkendt spiludgivelse.

## Lokal udvikling

```sh
cd mobile
npm ci
npm run typecheck
npx expo-doctor
npx expo start
```

Projektet benytter Expo SDK 58 og SVG-kunst fra `../assets/v3`.
Klondike-skærmen anvender spilreglerne fra `../src/domain/solitaire/klondike.ts`.
Kort vælges aktuelt med tryk på kilden efterfulgt af destinationen.

## Kendte mangler (ikke releaseklar)

- Navigation er endnu en simpel app-shell, ikke endelig Expo Router-struktur.
- Korttræk mangler drag/drop, animationer, scoring og fuldt mobiltestet interaktion.
- Haven mangler zoom/pan, placerbare dekorationer og progression.
- Minispil og quests er endnu ikke implementeret.
- Lysglimt, offline save/load, undo-belønninger og sæsoner er endnu ikke forbundet med UI.
- Indstillinger, lokalisering, onboarding og fuld design-/tilgængelighedsgennemgang mangler.
- Ingen native Android/iOS-installationsbuild eller hardwaretest er udført.
