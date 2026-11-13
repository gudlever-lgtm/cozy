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
- Korttræk har nu en første PanResponder-baseret drag/drop til de målte tableau- og grundbunker. Interaktion, lagdeling og ScrollView-konflikter kræver stadig test på enhed. Animationer og scoring mangler. Trykbaserede træk er fortsat mulige, og Tip viser et konkret foreslået træk.
- Haven har indledende zoom/pan og placering af godkendte dekorations-SVG'er. Vælg en dekoration og tryk i haven; eksisterende dekorationer kan flyttes og fjernes. Positioner gemmes lokalt, og tidligere v1-placeringer indlæses. Nye dekorationer koster 5 optjente Lysglimt.
- Første minispil er **Skovens vendespil** med fire par, lokale gemte runder og 5 Lysglimt per gennemført runde.
- Tre konkrete quests: vundet kabale, vundet vendespil og tre placerede dekorationer. Hver quest kan indløses én gang for 10 Lysglimt.
- Offline save/load af kabalestatus og Lysglimt-ledger er integreret, men endnu ikke afprøvet på fysisk enhed; yderligere belønningskilder og sæsoner mangler.
- En vundet kabale udløser 25 Lysglimt én gang pr. spilseed. Belønninger og køb går gennem en idempotent ledger, uden køb for rigtige penge.
- Indstillinger har sæsonvalg (automatisk eller manuelt), og haven viser fire godkendte SVG-årstider. Dansk/engelsk lokalisering, onboarding og fuld design-/tilgængelighedsgennemgang mangler.
- Der mangler stadig validering af gameplay, quests og køb på fysisk telefon. UI'en er en implementeringsbaseline, ikke visuelt endeligt godkendt.
- Android- og iOS-JavaScript-bundling er verificeret, men ingen native installationsbuild eller hardwaretest er udført.
- ESLint-konfiguration mangler: `npx expo lint` kunne ikke hente opsætningen på grund af proxy-timeout.
