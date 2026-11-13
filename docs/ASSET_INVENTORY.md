# Cozy Solitaire — grafisk inventar

Status: 13. november 2026. Inventaret beskriver filerne i repoet og deres faktiske brug i `mobile/`.

## Illustrationer i mobilappen (`mobile/assets/illustrations/`)

| Filer | Brug | Status |
| --- | --- | --- |
| `garden-spring.webp`, `garden-summer.webp`, `garden-autumn.webp`, `garden-winter.webp` | Sæsonbaggrunde i haven, minispillet og opgaver | I brug |
| `solitaire-table.webp` | Spillebordet i syvkabalen | I brug |
| `bench.webp`, `fountain.webp`, `flower-pots.webp` | Genstande i haven og i haveværktøjet | I brug |
| `nav-premium.webp` | Nederste navigationsbjælke | I brug |

Disse ni WebP-filer er de nyere billedillustrationer. Ældre SVG-udgaver af sæsonbaggrunde og dekorationer ligger fortsat i `assets/v3/` som alternativer; de bruges ikke som baggrund i den aktuelle mobilapp.

## SVG-samling (`assets/v3/`)

| Gruppe | Antal | Filer |
| --- | ---: | --- |
| Avatarer | 6 | `bird`, `cat`, `fox`, `hedgehog`, `owl`, `rabbit` |
| Baggrunde | 4 | `garden-spring`, `garden-summer`, `garden-autumn`, `garden-winter` |
| Kort | 6 | `back-botanical`, `back-stars`, `back-woodland`, `face-blank`, `face-botanical`, `face-woodland` |
| Havedekorationer | 8 | `bench`, `birdhouse`, `flower-cart`, `flower-pot`, `fountain`, `lantern`, `trellis`, `watering-can` |
| Ikoner | 18 | `arrow-left`, `basket`, `cards`, `chair`, `close`, `flower`, `garden`, `hammer`, `hint`, `home`, `lock`, `menu`, `mini`, `play`, `quests`, `settings`, `star`, `undo` |
| UI-elementer | 15 | `button-disabled`, `button-primary`, `button-secondary`, `button-special`, `button-wood`, `card-slot`, `header-banner`, `hud-pill`, `icon-button`, `panel-wide`, `panel`, `progress-fill`, `progress-track`, `tab-background`, `tooltip` |

**I alt: 57 SVG'er + 9 nyere WebP-illustrationer = 66 grafikfiler** (eksklusive dokumentation og manifest).

## Faktisk brug i mobilappen

- Bundnavigation: ikonerne `garden`, `cards`, `mini`, `quests`, `settings` over `nav-premium.webp`.
- Kabale: `face-woodland`, `back-botanical`, `card-slot` samt `solitaire-table.webp`.
- Vendespil: `fox`, `cat`, `rabbit`, `owl` og `back-botanical`.
- Knapper: `button-primary`, `button-secondary`.
- Haven: `header-banner` og de tre WebP-dekorationer på sæsonillustrationer.
- Opgaver: `panel-wide`.

## Visuelle næste skridt

1. Ensartede, farverige kortforsider og kortbagsider i samme 3D-inspirerede stil som sæsonhaverne.
2. Fuld integration af de resterende ikoner i stedet for at benytte tekstsymboler, hvor det passer.
3. Polerede paneler og knapper i alle skærme; særligt minispil, opgaver og indstillinger.
4. Device-screenshots på både lille og stor Android-skærm for kontrol af beskæring, tekst og grafik.

Ændr ikke spilregler eller gemte data som del af en grafisk opdatering.
