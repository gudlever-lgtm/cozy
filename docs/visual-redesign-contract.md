# Cozy Solitaire — visual redesign contract

This document defines the non-negotiable implementation rules for ongoing visual redesign work.

## Visual direction
- Cozy illustrated cottage-garden world with soft natural lighting, flowers, wood, warm cream, moss green and gentle blue.
- Garden is edge-to-edge and remains pannable/zoomable; interface controls overlay it without framing the garden in a window.
- Millie (rabbit) and Marmalade (cat) retain consistent recognizable appearances across scenes.
- All visual elements must use consistent scale, shading, light direction and color palette.
- Keep cards readable, drag-and-drop above neighboring cards, and primary game actions clearly accessible.
- Prefer individual appropriately sized transparent PNG or WebP sprites, with separate full-resolution backgrounds. Do not use full concept boards as game sprites.
- Do not assume image sheets are production-ready until each asset is separated, reviewed, correctly cropped and transparent where needed.

## Localization
- Every user-facing string must exist in Danish (`da`) and English (`en`).
- Reuse the existing translation setup; do not hard-code strings in JSX/TSX.
- Treat translations as complete paired changes: new Danish strings require equivalent English strings, and vice versa.
- Include button labels, tips, settings, quests, rewards, dialogs, errors and accessibility labels.
- Test layouts with longer strings in both languages.

## Product requirements
- iOS and Android app; no web release requirement.
- Always free, no advertising, no real-money purchases or microtransactions.
- Lysglimt ✨ is the primary in-game currency, earned via gameplay, quests and minigames. Undo points are a distinct gameplay resource.
- Preserve all existing gameplay, progression, saves, offline behavior and user preferences.
- Do not introduce inert controls or demo screens.

## Incremental delivery / build policy
- Commit and push finished graphics or code increments to the Cozy repository as work progresses.
- Validate relevant typecheck, unit tests and native checks after changes when feasible.
- **DO NOT trigger Android APK or iOS release builds unless the user explicitly requests one.**
- Do not edit the Android APK workflow as a workaround to trigger a build.
- Report what has actually been implemented, committed and tested; never treat concept images as completed production assets.
