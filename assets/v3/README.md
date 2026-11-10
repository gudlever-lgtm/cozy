# Cozy 3.0 — Grafisk V3 UI-kit (udkast)

**Status: GRAFIKPAKKE GODKENDT 2026-11-10.** Disse filer er **selvstændige originale SVG-assets**, ikke beskårne udsnit af et oversigtsbillede. De er skalerbare og har ingen indbygget UI-tekst.

## Leveret
- **Knapper/paneler:** primær, sekundær, træ, special, deaktiveret, ikonknap, navigation, paneler, banner, status-chips, progress og tooltip.
- **Ikoner:** navigation, funktioner, kort, hint/Undo, byggefunktioner og belønninger.
- **Kort:** tre kortbagsider samt neutral, botanisk og skov-inspireret kortforside (kun grunddesign; værdier/kulører tegnes dynamisk).
- **Baggrunde:** fire årstider, foreløbige vector-mockups.
- **Avatarer:** seks figurer i samme vectorfamilie.
- **Dekorationer:** otte foreløbige haveobjekter.
- **Manifest:** `manifest.json` med paths og godkendelsesstatus.

## Brug
Filerne er vektor-grafik i SVG. I **Expo/React Native** importeres de **ikke** som almindelige `Image` direkte. Implementér en kontrolleret assetpipeline med `react-native-svg` / `react-native-svg-transformer` (hvis version kompatibel), eller generér deterministiske PNG/WebP-varianter af de godkendte SVG'er. Ingen tilfældige omskaleringer.

- Hold originalt aspektforhold for ikoner/figurer.
- Knaptekst, score, valuta og adgangslabels skal være native UI-tekst og forblive læsbar ved skift mellem dansk og engelsk.
- Anvend ikke `resizeMode="stretch"` på dekoreret ramme/floral-kunst uden dokumenteret 9-slice.
- Kortlayout: 190×270 kildemål (ca. 0,704 bredde/højde), samme geometri i alle temaer.
- Baggrunde: 720×1280 kildeflade. Haven skal panoreres/zoomes uafhængigt af HUD.
- Ikoner: 128×128 kildemål. Knapper: 440×110 kildemål. Brug indvendig sikker tekstzone, testet for begge sprog.

## Vigtigt om designsystemet
Filerne udgør en **første funktionel grafikpakke** og en tydelig teknisk struktur. Nogle små elementer og hele sæsonbaggrundene er enkle SVG-illustrationer; de matcher endnu ikke detaljegraden i det godkendelses-afventende billedoplæg. Opdateres først, når ejeren har godkendt looket.

## Kvalitetsport
Grafikpakken er godkendt. Før mobilrelease skal den tekniske integration kontrolleres: proportioner, alpha, størrelse, kontrast, semantisk mapping og rendering på enheder.
