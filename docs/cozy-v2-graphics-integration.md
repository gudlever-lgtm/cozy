# Cozy Solitaire — V2 production artwork integration

## Verified inventory
- 105 individually optimized WebP assets have been committed under `assets/cozy-redesign/illustrations/`.
- Source groups: 1 spring portrait background, 15 card assets, 12 new character poses, 33 decorations, 29 reward/effect assets and 15 UI assets.
- Two legacy avatar WebP files also remain in the same directory; they are not counted as part of V2.
- The complete production artwork set is registered through literal Metro `require()` expressions in `src/assets/cozyRedesignImages.ts`; generated file names match `scripts/import-cozy-graphics.py`.
- `tests/cozy-redesign-assets.test.ts` checks count, file presence, WebP header, size budget, category coverage and actual UI references.

## Active integration (not merely source artwork)
- `src/assets/images.ts`: new Millie/Marmalade idle poses, themed card-back sources, Shimmer icon and portrait garden image.
- `src/ui/GardenHome.tsx`: the updated avatars, retaining existing garden pan/zoom and season dimensions.
- `src/CardArtwork.tsx`: cottage/blue card backs for classic and botanical themes; retain native vector backs in winter and river themes.
- `src/MainMenu.tsx`: illustrated flower accent and spring portrait art in the header, under a dark contrast overlay. Copy remains localized React Native text.
- `src/ui/ResourceBadge.tsx`: updated Shimmer icon.
- `src/assets/decorations.ts`: new bench, bridge, flower and lantern sprites using unchanged player-owned decoration IDs.
- `src/NewGardenArtwork.tsx`: new birdhouse and tea-table artwork while retaining their size contract, existing quests and ownership state.

## QA and performance
- Individual WebP assets replace large runtime atlas crops. Bundle size for these 105 assets is roughly 2.2 MiB in total.
- Corrected halo/stray-pixel fragments in the actively used cottage card back, pink hydrangea, bench, bridge, lantern, pink bush, birdhouse and tea table.
- More artwork exists in the bundle than is active in the game. Before activating an additional sprite, visually review its background transparency, bounding box, layering and placement.
- Portrait art is used in the menu, **not** as a replacement for the existing interactive, season-mapped garden world. This preserves zoom/pan and existing saved placement coordinates.
- Keep UI labels, screen readers and controls as translated native elements. Never paint copy into artwork.
- Always support Danish and English. Preserve free/ad-free/no-purchase gameplay, Undo points and Lysglimt economy.

## Release gate
- Do not build APK automatically after graphics commits.
- Typecheck, unit tests, native tests, native bundle export and device-level visual QA must be reviewed before APK release.
- As of integration, native CI tests have legacy navigation/interaction failures still to be resolved. A typecheck or unit-test pass alone does not mean a verified Android APK.
