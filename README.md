# Cozy Solitaire 3.0 — Android og iOS

**Status: Spilbar udviklingsversion, endnu ikke releasegodkendt.**

Dette repository indeholder Expo/React Native-appen i `mobile/`, domænekode i `src/`, tests i `tests/` og den godkendte V3 SVG-grafik i `assets/v3/`. Tidligere Cozy 2.x findes i arkivbranchen [archive/cozy-v2-final-2026-11-09](https://github.com/gudlever-lgtm/cozy/tree/archive/cozy-v2-final-2026-11-09).

## Build på Windows

Fra roden af det klonede Git-repository (`E:\cozy`):

```powershell
.\build-apk.ps1 -Platform apk   # Lokal APK -> Downloads\cozy.apk
.\build-apk.ps1 -Platform aab   # Lokal AAB -> Downloads\cozy.aab
.\build-apk.ps1 -Platform ios   # iOS-build i Expo EAS, ikke lokalt på Windows
```

APK/AAB kræver Node.js, JDK og Android SDK. iOS kræver Expo/EAS-login og en Apple-signering. Scriptet henter som standard seneste `main`, kontrollerer TypeScript og stopper ved lokale Git-ændringer. Brug `-SkipPull` til bevidst at bygge lokalt ændret kode. Android-formater bygges af lokal Gradle, ikke i Expo-cloud. Der er endnu ikke udført fuld enhedstest. For en første installation se også [mobile/README.md](mobile/README.md).

## Produktvision
Et hyggeligt, visuelt gennemført mobilspil, der kombinerer kabale, minispil og en levende have, hvor spillerens fremskridt giver adgang til dekorationer og historier.

## Ikke til forhandling
- **Android og iOS**, fælles kodebase; ingen browser/PWA som produktmål.
- **100 % gratis**, ingen reklamer, mikrotransaktioner eller køb for penge.
- **Lysglimt ✨** er hovedvaluta og optjenes ved at spille; minispil, quests og dekorationer skal kunne opnås uden betaling.
- Dansk og engelsk.
- Have i fuld skærm med **zoom og panorering**.
- Millie og Marmalade samt et reelt avatarvalg.
- Designet skal godkendes **inden** nye gameplay-skærme implementeres.

## Projektets styrende dokumenter
- [DESIGN_CONTRACT.md](DESIGN_CONTRACT.md): designprincipper, validering, godkendelse
- [ROADMAP.md](ROADMAP.md): leverancer, milepæle og acceptkriterier
- [SCREENS.md](SCREENS.md): de skærme, der skal designes, og deres formål
- [DECISIONS.md](DECISIONS.md): besluttede og åbne spørgsmål

## Retning
**Premium Cozy Storybook** og V3 SVG-pakken er godkendt som implementeringsgrundlag. Den faktiske mobile rendering kræver stadig kvalitetstjek på fysisk enhed.

## Arbejdsregel
Udvikling sker med visuel sammenligning mod godkendte referencer. Grønt CI eller en fungerende APK er ikke ensbetydende med visuelt godkendt UI. En APK-testbuild må gerne bygges lokalt efter ejerens ønske.

## V3-grafik og Claude Code
- [Grafikpakken](assets/v3/README.md) — 57 separate SVG'er, udkast til godkendelse.
- [Assetmanifest](assets/v3/manifest.json) — alle filstier, roller og godkendelsesstatus.
- [Grafikgalleri](docs/asset-gallery.html) — visuel oversigt (åbnes lokalt i browser med repository-filerne).
- [Asset-specifikation](docs/ASSET_SPEC.md) — proportioner, tekstzoner og anvendelsesregler.
- [Claude Code Master Prompt](docs/CLAUDE_CODE_MASTER_PROMPT.md) — spilmekanik, test og arkitektur.

## Nuværende tilstand
Klondike, et vendespil, quests, Lysglimt, haveplaceringer og sæsonvalg er implementeret i den mobile udviklingsversion. Se [ROADMAP.md](ROADMAP.md) og [mobile/README.md](mobile/README.md) for kendte mangler og releasekriterier.
