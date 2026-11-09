# Cozy 3.0 — Asset Spec v0.1 (til godkendelse)

| Assetfamilie | Kildestørrelse | Gengivelsesregel | Sikker zone |
|---|---|---|---|
| Primære/sekundære knapper | 440×110 | Ikke-destruktiv skalering; 9-slice ved variabel bredde | Tekst midt i knappen, 85 px fri fra venstre blomster og 30 px fra højre |
| Ikonknap | 112×112 | Bevar kvadratisk forhold | Ikon maks. 55% af fladen |
| Ikoner | 128×128 | `contain`, samme optiske centrum | 10% indre margin |
| Kort/backs | 190×270 | Fast billedforhold 19:27 | Rank & suit i reserverede hjørner |
| Panel | 720×900 | Dokumenteret 9-slice; corners må ikke forvrænges | 70 px margin til pynt |
| Wide panel | 820×360 | Dokumenteret 9-slice | 55 px margin |
| Topbar/HUD-pill | 320×82 | Tekst i separat UI-zone | Ikon venstre, tal højre |
| Baggrund/have | 720×1280 | Cover/contain efter skærmens formål; pan/zoom på scene, ikke HUD | Safe-area UI uafhængig |
| Avatarer | 240×240 | `contain`, kvadratisk | Cirkel og ansigt fuldt synlige |
| Dekorationer | 220×220 | `contain`, placering efter normaliserede koordinater | Hele motivet inde i hitbox |

## Garanterede regler
1. Tekst og ikoner har separate layoutfelter.
2. Tekst må ikke ligge uden for **den synlige illustratoriske knap**, ikke kun React Native-klikkefladen.
3. Ingen skjult tekst, blandede kortikoner eller generiske fallback-symboler.
4. Et langt tryk viser en kort tekstforklaring, der ikke blokerer øvrige kontroller.
5. Alle fire årstider vises uden forvrængning i portræt og landscape.
6. Visuelle regressioner tages ved 360×800, 390×844 og landskab; native telefonvalidering kræves før accept.
7. Beslutninger om at udskifte grafik skal synliggøres som change request.
