# Cozy Solitaire — grafisk inventar

Status: 13. november 2026. Inventaret beskriver filerne i repoet og deres faktiske brug i `mobile/`.

## Illustrationer i mobilappen (`mobile/assets/illustrations/`)

| Filer | Brug | Status |
| --- | --- | --- |
| `garden-spring.webp`, `garden-summer.webp`, `garden-autumn.webp`, `garden-winter.webp` | Sæsonbaggrunde i haven, minispillet og opgaver | I brug |
| `solitaire-table.webp` | Spillebordet i syvkabalen | I brug |
| `bench.webp`, `fountain.webp`, `flower-pots.webp` | Genstande i haven og i haveværktøjet | I brug |
| `nav-premium.webp` | Nederste navigationsbjælke | I brug |
| `nav-icon-0.webp` til `nav-icon-4.webp` | Fem illustrerede 3D-ikoner til navigationen | I brug |
| `card-back-premium.webp` | Kortbagsider i kabale og vendespil | I brug |
| `memory-animal-0.webp` til `memory-animal-3.webp` | Ræv, kat, kanin og ugle i vendespillet | I brug |
| `button-premium.webp` | Primære handlingsknapper | I brug |

Disse 20 WebP-filer er de nyere billedillustrationer. Ældre SVG-udgaver ligger fortsat i `assets/v3/` som alternativer; de vises ikke i de opdaterede mobilskærme.

## SVG-samling (`assets/v3/`)

| Gruppe | Antal | Filer |
| --- | ---: | --- |
| Avatarer | 6 | `bird`, `cat`, `fox`, `hedgehog`, `owl`, `rabbit` |
| Baggrunde | 4 | `garden-spring`, `garden-summer`, `garden-autumn`, `garden-winter` |
| Kort | 6 | `back-botanical`, `back-stars`, `back-woodland`, `face-blank`, `face-botanical`, `face-woodland` |
| Havedekorationer | 8 | `bench`, `birdhouse`, `flower-cart`, `flower-pot`, `fountain`, `lantern`, `trellis`, `watering-can` |
| Ikoner | 18 | `arrow-left`, `basket`, `cards`, `chair`, `close`, `flower`, `garden`, `hammer`, `hint`, `home`, `lock`, `menu`, `mini`, `play`, `quests`, `settings`, `star`, `undo` |
| UI-elementer | 15 | `button-disabled`, `button-primary`, `button-secondary`, `button-special`, `button-wood`, `card-slot`, `header-banner`, `hud-pill`, `icon-button`, `panel-wide`, `panel`, `progress-fill`, `progress-track`, `tab-background`, `tooltip` |

**I alt: 57 SVG'er + 20 nyere WebP-illustrationer = 77 grafikfiler** (eksklusive dokumentation og manifest).

## Faktisk brug i mobilappen

- Bundnavigation: fem `nav-icon-*.webp` over `nav-premium.webp`.
- Kabale: grafisk indrammede kortforsider, `card-back-premium.webp`, indlagte tomme felter og `solitaire-table.webp`.
- Vendespil: fire `memory-animal-*.webp` og den nye kortbagside.
- Knapper: `button-premium.webp` og indrammede sekundære knapper.
- Haven: illustrerede sæsonbaggrunde og de tre WebP-dekorationer, med poleret panel til status og værktøj.
- Opgaver og indstillinger: nye creme-/guldrammede paneler og baggrundsillustrationer.

## Visuelle næste skridt

1. Device-screenshots på både lille og stor Android-skærm for kontrol af beskæring, tekst og grafik.
2. Udvide kataloget med genstande i haven og særskilte belønningsillustrationer efter visuel godkendelse.

Ændr ikke spilregler eller gemte data som del af en grafisk opdatering.
