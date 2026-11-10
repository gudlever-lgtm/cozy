# Cozy Solitaire 3.0 — Projektplan

## Fase 0 – Clean slate
- [x] Arkivér den sidste Cozy 2.x-kode i `archive/cozy-v2-final-2026-11-09`.
- [x] Nulstil `main` til planlægningsmateriale.
- [x] Fjern v2-workflows, assets og buildanmodninger fra `main`.
- [x] Bekræft at ejeren accepterer designproces og reference-retning.

## Fase 1 – Visuelt fundament (INGEN PRODUKTIONSKODE)
- [x] Godkend V3-grafikpakken i Premium Cozy Storybook-retning (57 SVG-assets, 2026-11-10).
- [ ] Udarbejd komplet moodboard og farver/typografi.
- [x] Godkend samlet skærmlayout inkl. have, kabale, minispil, hovedmenu, indstillinger, kortdesign, profil, sæson og sejr (2026-11-10).
- [x] Godkend det visuelle koncept for navigation, baggrunde, kort, avatarer og grafiske kontroller (2026-11-10); klikbare flows verificeres i implementering.
- [x] Fastlæg UI-kontrakt og forslag til responsiv geometri som implementeringsbaseline; justeringer må ikke ændre godkendt udtryk.

**Gate D1a (bestået):** Grafikpakken er eksplicit godkendt.

**Gate D1b (bestået — koncept):** Det samlede skærmlayout er godkendt af ejer 2026-11-10.

**Gate D1c (åben — kvalitet):** Native rendering, responsiv tilpasning, tekster og tapområder skal testes på telefon, før UI erklæres færdig.

## Fase 2 – Arkitektur og gameplaygrundlag

**Næste leverance (Claude Code):** Byg isoleret, testbar Klondike-engine (seeded RNG, move legality, stock 1/3, undo/hint/autofinish, saveformat), uden UI-redesign eller APK.
- [ ] Vælg native stack og appstruktur (fælles kodebase, Android/iOS).
- [ ] Definér interfaces for kabale, minispil, have, ressourcer og gemt status.
- [ ] Design lokal/offline lagring og evt. migrering fra v2.
- [ ] Sæt CI op til typecheck, tests, grafik-audit og screenshottest.

**Gate T1:** Arkitektur og testplan er godkendt.

## Fase 3 – Implementering i afgrænsede leverancer
1. App shell / navigation og onboarding.
2. Haveforside med zoom/pan og figurer.
3. Kabale med fuldt fungerende drag/drop, scoring, hints og undo.
4. Minispil og økonomi med Lysglimt.
5. Havebyggeri, dekorationer, quests og sæsoner.
6. Indstillinger, profiler, sprog og tilgængelighed.

For hver leverance: mockup-konformitet → unit/native tests → manuel skærmgodkendelse.

## Fase 4 – Release
- [ ] Test på flere Android/iOS-skærmstørrelser.
- [ ] Verificér offline lagring, progression og stabilitet.
- [ ] Lav signerede APK/testbuilds kun på eksplicit anmodning.
- [ ] Dokumentér build SHA, testresultater og kendte fejl.

**Gate R1:** Ingen release uden ejers accept.

## Regler
- Ingen selvopfundne skærmændringer uden godkendelse.
- Ændringer i design kræver opdateret kontrakt og ny godkendelse.
- GitHub Actions eller et compilable APK er aldrig i sig selv en kvalitetsgodkendelse.
