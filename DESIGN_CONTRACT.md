# Cozy Solitaire 3.0 — Designkontrakt

**Status: V3-grafik godkendt 2026-11-10; endelig skærmlayout- og telefonaccept afventer.**

**Låst grafikbaseline:** `assets/v3/manifest.json` (57 SVG-filer). Udskift ikke grafik, proportioner eller farver uden ejerens godkendelse.

## Grundprincip
**Design → skriftlig godkendelse → kode → pixel- og funktionstest → telefonaccept.**

Et udviklingsværktøj må ikke selv skifte illustration, layout eller kontrolform uden en begrundet og godkendt ændring.

## Visuel retning (godkendt for grafikpakken)
- Premium, varm cottage garden og eventyrbogs-æstetik.
- Rolige, lyse papirflader til indhold og dekorative illustrationer som supplement.
- Få primære handlinger på hver skærm; ingen overfyldte menuer.
- Ikoner skal være reelle illustrationer med sammenhængende streg, farver og optiske mål.
- Undgå både rå systemknapper og tekst, der er bagt ind i billedfiler.

## Obligatorisk komponentbibliotek
Alle design skal inkludere og dokumentere:
1. Primær knap, sekundær knap, ikonknap, dialogknap og deaktiveret knap.
2. Menukort, paneler, scrollbare dialoger og status-/ressourcechips.
3. Bundnavigation med præcise tapområder og evt. forklaring ved langt tryk.
4. Avatarer og figurer — unikke og genkendelige.
5. Spillekort, piles, drag-feedback, hint/Undo, sejrs- og belønningsdialog.

## Specifikation pr. komponent
For hver komponent fastlægges: original asset-størrelse, tegnet/gengivet størrelse, aspektforhold, ni-slice eller anden skaleringsmetode, indvendige margener, ikonzone, tekstzone, maksimal linjelængde, fontstørrelse og -skalering, interaktionsområder, tilstande og tilgængelighedslabel.

**Forbud:** Stræk ikke en illustreret knap til tilfældige proportioner. Tekst må aldrig ligge på dekorationer eller udenfor knapgrænsen; løs med dimensioner/indhold, ikke vilkårlig fontreduktion. Brug ikke ukendte fallback-ikoner til manglende grafik.

## Visuel skærm-godkendelse
Der skal foreligge separate godkendte mockups til:
- Telefon 360 × 800 og 390 × 844 (portræt)
- Telefon landscape 844 × 390
- En større telefon/tablet

Hver skærm skal vises på dansk og engelsk med både korte og lange labels. Godkendt reference gemmes med navn/version og må ikke ændres uden ny accept.

## Funktionel accept
- Have: zoom, panorering og tap på objekter; HUD forbliver fast.
- Kabale: alle kort kan trækkes, flyttes og afsluttes; Undo og hints forklarer utilgængelige handlinger.
- Menusystem: tydeligt og enkelt flow mellem have, kabale, minispil, quests og indstillinger.
- Automatisk lagring/offline og migrationsplan fra v2 skal vurderes og besluttes.

## Testkrav
- Kildekoderelateret grafik-audit: fil findes, dimensioner, transparens, mapping.
- Layouttest: bounding boxes for tekst/ikon/klikområde, ingen overlap eller clipping.
- Visuel regression mod **godkendte** mockups; manuelle telefon-screenshots til slutaccept.
- Native tests af animationer, tilgængelighed og interaktion på Android og iOS.
- Ingen APK før alle relevante gates og designreferencer er klar.

## Godkendelse
Grafikpakken er **godkendt**, men færdig skærm-layout og touch-interaktion er **ikke** godkendt endnu. Enhver designafvigelse kræver en synlig change request med før/efter.
