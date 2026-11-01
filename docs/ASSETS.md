# Cozy Solitaire – seasonal graphics V1.7

Assets were generated for Cozy Solitaire. The four season backgrounds are independently cropped from a four-scene concept sheet, so individual images are approximately 836×470; avoid using as high-resolution full-screen artwork on tablets until higher-resolution replacements are created.

- `backgrounds/seasons/{spring,summer,autumn,winter}_cottage_garden.webp`: static seasonal art.
- `characters/{millie_rabbit,marmalade_cat}.png`: illustrations with transparency.
- `icons/ui_icons_sheet.png` and `resources/resources_sheet.png`: source sheets; not yet split into standalone UI elements.
- `backgrounds/seasons/{summer_evening,autumn_rain,winter_snow}_board.png`: alternate board scenes.

## Implementation guidance
- Web: reference `/assets/...` paths from public.
- Expo: `src/assets/images.ts` uses literal `require(...)` references into `public/assets`; Metro bundles those referenced files for native builds. Their location under `public` alone would not bundle them without these explicit references.
- Snow/rain/firefly overlays are runtime animations, **not** existing PNGs. Implement with performant RN animated particle layers and respect reduced-motion.
- The generated art is raster imagery, not editable vector source or a complete 52-card deck.
- Add source/revision/provenance metadata before release.
