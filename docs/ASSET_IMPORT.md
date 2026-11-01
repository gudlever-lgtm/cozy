# Cozy Solitaire — grafikpakke V1.7

**Aktuel status:** Billederne er nu importeret, bevaret og integreret i Expo-appen. Nedenstående importvejledning er historisk. Se `SEASONAL_INTEGRATION.md` for den aktuelle integration.

Grafikpakken er fremstillet og pakket som `cozy-assets-v1.7.zip` i ChatGPT-samtalen. Billedfilerne blev efterfølgende uploadet til dette GitHub-repository.

## Forventet indhold

- `public/assets/backgrounds/seasons/spring_cottage_garden.webp`
- `public/assets/backgrounds/seasons/summer_cottage_garden.webp`
- `public/assets/backgrounds/seasons/autumn_cottage_garden.webp`
- `public/assets/backgrounds/seasons/winter_cottage_garden.webp`
- `public/assets/backgrounds/seasons/summer_evening_board.png`
- `public/assets/backgrounds/seasons/autumn_rain_board.png`
- `public/assets/backgrounds/seasons/winter_snow_board.png`
- `public/assets/characters/millie_rabbit.png`
- `public/assets/characters/marmalade_cat.png`
- `public/assets/icons/ui_icons_sheet.png`
- `public/assets/resources/resources_sheet.png`
- `public/assets/manifest.json`

## Import på gnf

Download zipfilen fra ChatGPT til din server, og kør:

```bash
cd /home/lakn/games/cozy
unzip -n cozy-assets-v1.7.zip
git add public/assets docs/ASSETS.md
git commit -m 'Add Cozy Solitaire seasonal artwork v1.7'
git push origin main
```

Bemærk: Expo/React Native kræver normalt statiske `require()`-referencer til bundling af billeder. Flyt/kopiér dem derfor til en native assetmappe og opret et TypeScript-manifest, før EAS-builds foretages. Regn og sne skal laves som animationer; der medfølger ikke separate overlaybilleder. De fire sæsonpaneler er cirka 836×470 px hver og er foreløbige grafiske assets.
