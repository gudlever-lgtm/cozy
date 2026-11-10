# Cozy Solitaire 3.0 — Endelig layoutgodkendelse

**Beslutningsdato:** 10. november 2026

## Godkendt
- Hele det seneste Cozy Solitaire 3.0-mobillayout i ChatGPT-designoplægget er udtrykkeligt godkendt af produktejeren.
- Designretning: **Premium Cozy Storybook**.
- Skærme: Forside, Min have, Klondike/kabale, Minispil, Opgaver, Kortdesign, Indstillinger, Spillerprofil, Sæson, Sejr og bundnavigation.
- 57 grafiske SVG-assets, allerede godkendt, forbliver uændrede.
- Strukturelle regler og implementeringsmål: `docs/UI_COMPONENT_CONTRACT_V3.md` og `docs/ui-layout-tokens.v3.json`.

## Designændringsstop
Implementering må ikke genopfinde knappetyper, ikoner, navigationsflow eller kortmotiver. Hvis konkrete detaljer i designreferencen ikke kan udledes entydigt, skal afvigelsen dokumenteres og fremlægges for produktejeren i stedet for at blive implementeret efter eget skøn.

## Afgrænsning
- Den godkendte helhedsvisualisering ligger i den aktuelle ChatGPT-samtale og **er endnu ikke committed som billede** i repository. Dokumentation må ikke påstå, at et ikke-eksisterende referencemockup er på disk.
- Dette er **designgodkendelse**, ikke verifikation af et fungerende build.
- Responsive variationer, faktisk billedrendering, klikflader, tilgængelighed og telefon-skærmbilleder skal verificeres ved implementering.
- Claude Code kan fortsætte Stage 2 i sin egen arbejdsgang; denne beslutning ændrer kun docs og designlåsen.
