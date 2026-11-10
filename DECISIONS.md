# Cozy Solitaire 3.0 — Beslutningslog

## Bekræftede produktkrav
- Platforme: Android og iOS.
- Pris: helt gratis uden reklamer eller køb for penge.
- Valuta: Lysglimt ✨ optjenes gennem spil.
- Sprog: Dansk og engelsk.
- Spil: Solitaire, minispil, have, dekorationer og quests.
- Visuelle figurer: Millie, Marmalade og spilleravatar.
- Have: fuldskærm, zoom og panorering.
- Proces: design først, kode efter eksplicit godkendelse.

## Godkendt 10. november 2026
- **Grafikpakken V3 er godkendt** af produktejeren: alle 57 SVG-filer i `assets/v3/` er fastlagt som grafisk udgangspunkt.
- Grafik og asset-roller må ikke ændres eller erstattes uden eksplicit ændringsgodkendelse.
- Godkendelsen gælder **grafikpakken**; den er ikke dokumentation for pixelperfekt skærmlayout eller native funktioner.
- Næste fase: deterministisk Klondike-spilmotor i Claude Code, uden omdesign af brugerfladen.

## Godkendt endeligt layout — 10. november 2026
- Producenten har eksplicit godkendt **det samlede Cozy 3.0-mobillayout** vist i seneste designoplæg i samtalen: Forside, Min have, Kabale/Klondike, Minispil, Opgaver, Kortdesign, Indstillinger, Spillerprofil, Sæson og Sejr samt fælles navigation/HUD/knapper.
- **Premium Cozy Storybook V3** er den låste designretning; både grafikpakken og det samlede layout er godkendt.
- Implementering må ikke ændre skærmhierarki, navigation, visuel stil eller grafiske komponenter uden eksplicit godkendelse.
- Den præcise telefonrendering på 360×800, 390×844 og andre faktiske skærme skal fortsat verificeres; det er test/implementeringsaccept og ikke en åben designbeslutning.
- Den visuelle mockup blev godkendt i ChatGPT-samtalen og er endnu ikke lagt i GitHub som billedfil. Implementering skal være tro mod både mockup og dokumenterede designkontrakter; uklare detaljer må ikke fortolkes som tilladelse til redesign.

## Åbne implementeringsbeslutninger
- Premium Cozy Storybook er valgt som grafisk basis; præcise responsive skærmmockups og native layoutgodkendelse mangler fortsat.
- Endeligt logo, typografi, farver og illustrationer.
- Endelig forside, kabalebord, navigation og modaldesign.
- Endelig designkomponentpakke (mål, safe area og skalering).
- Grad af genbrug af v2-spilmekanik og evt. migration af lagringer.

## Arkiv
Den forrige app er bevaret i `archive/cozy-v2-final-2026-11-09`.
Den gamle kode er ikke en designreference eller automatisk kilde til nye komponenter.
