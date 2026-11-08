# Cozy Solitaire — Visual Asset Integration V1

## Source and status
An external asset package `cozy-visual-assets-v1.zip` is prepared with 32 individual PNG crops, one spring portrait background, visual reference sheets and a complete Claude Code implementation prompt. The ZIP has **not** been added to this repository yet; image crops must be inspected and copied into `assets/cozy-redesign/` before use. Avoid claiming individual images are cleanly transparent or 9-slice-compatible without inspection.

## Design principles
- Full-screen interactive garden, soft storybook illustration, cottage architecture, natural paths, flowers, wood and parchment controls.
- Consistent visual design throughout home, solitaire, garden, settings, quests, minigames, rewards and dialogs.
- Preserve existing gameplay, save data, pan/zoom, progression, rewards, offline support, Millie and Marmalade.
- Do not embed labels into image assets; implement readable dynamic text overlays with safe touch targets.
- Ensure dragged cards render on top of all other cards throughout the gesture.

## Localization — both languages required
Every visible UI label, accessible name, notification, tutorial, error, dialogue, reward, quest and minigame text must be present in **Danish (da)** and **English (en)** using the existing i18n system. Do not hardcode Danish text or silently leave English entries out. Verify equal translation key sets.

| Key | Danish | English |
| --- | --- | --- |
| newGame | Nyt spil | New game |
| garden | Min have | My garden |
| settings | Indstillinger | Settings |
| undo | Fortryd | Undo |
| autoFinish | Afslut automatisk | Auto finish |
| victory | Du har vundet! | You won! |
| shimmer | Lysglimt | Shimmer |

Lysglimt is the primary in-game currency and Undo points remain separate. The game must stay 100% free: no ads, no payments or microtransactions.

## Implementation and verification
1. Inventory existing screens, styles, assets, navigation and translation setup.
2. Import and visually inspect source files from the ZIP individually; do not use whole concept-board images as runtime UI.
3. Build shared design tokens and reusable responsive UI components.
4. Integrate progressively, maintaining working gameplay and localized labels.
5. Test Danish and English, layout in several viewport sizes, drag-and-drop, game restart, Undo, Auto finish, save persistence and offline behavior.
6. Commit and push cohesive changes incrementally and report exact commit identifiers.

## APK restriction
**Never run an APK build, Android assembleRelease, EAS APK build or APK release/publish action without a new explicit user request.** Existing test/check workflows may continue; do not manually trigger APK workflows.
