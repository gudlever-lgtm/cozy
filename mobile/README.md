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
- Korttræk mangler drag/drop, animationer, scoring og fuldt mobiltestet interaktion. Tip viser et konkret foreslået træk.
- Haven har indledende zoom/pan og placering af godkendte dekorations-SVG'er. Vælg en dekoration og tryk i haven; eksisterende dekorationer kan flyttes og fjernes. Positioner gemmes lokalt, og tidligere v1-placeringer indlæses. Køb/progression mangler.
- Minispil og quests er endnu ikke implementeret.
- Offline save/load af kabalestatus og Lysglimt-ledger er integreret, men endnu ikke afprøvet på fysisk enhed; yderligere belønningskilder og sæsoner mangler.
- En vundet kabale udløser 25 Lysglimt én gang pr. spilseed. Andre belønninger er endnu ikke implementeret.
- Indstillinger, lokalisering, onboarding og fuld design-/tilgængelighedsgennemgang mangler.
- Android- og iOS-JavaScript-bundling er verificeret, men ingen native installationsbuild eller hardwaretest er udført.
- ESLint-konfiguration mangler: `npx expo lint` kunne ikke hente opsætningen på grund af proxy-timeout.
