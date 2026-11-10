# Stage 5.6 — Test Report

**Date:** 2026-11-10
**Branch:** `claude/nifty-keller-o5b8bd`
**Scope:** run every automated test, verify the UI end to end, and record real results —
including known defects — rather than claiming coverage that wasn't actually performed.

## 1. Automated tests

```
npm run typecheck        # tsc --noEmit, domain/application (CommonJS, no JSX)
npm run typecheck:app    # tsc -p tsconfig.app.json --noEmit, RN/JSX app code
npm test                 # node:test, pure domain + application logic
```

Result: **all three pass clean.** `npm test` — 51/51 passing (Solitaire domain logic,
garden/camera math, reward ledger store: restart recovery, concurrent grant/spend,
duplicate-grant idempotency, write ordering).

## 2. Platforms actually tested

| Platform | Tested? | How |
|---|---|---|
| Web | **Yes** | Expo web bundle (`expo start --web`), driven headlessly with the pre-installed Playwright Chromium. This is the only rendering engine exercised in this container. |
| Android | **No** | No Android emulator/device is available in this cloud environment. Not tested, not claimed as tested. |
| iOS | **No** | No iOS simulator/device is available in this cloud environment. Not tested, not claimed as tested. |

Everything below is a web-rendering result. React Native's web renderer
(`react-native-web`) and native platforms do not guarantee pixel-identical output —
native verification is still required before shipping and is explicitly out of scope
here.

## 3. UI walkthrough performed

Driven with Playwright at 390×844 (phone portrait, the primary target size). Screenshots
are committed in `docs/stage5-test-evidence/`:

1. `01-welcome-phone.jpg` — Welcome screen.
2. `02-garden-phone.jpg` — Garden, automatic season (autumn, matches the real date).
3. `03-solitaire-phone.jpg` — Solitaire tableau.
4. `04-minigames-phone.jpg` — Minigames hub (Memory playable, other 3 honestly locked).
5. `05-quests-phone.jpg` — Quests screen.
6. `06-settings-phone.jpg` — New Settings screen (Stage 5.5): profile, avatar, language,
   card face/back pickers.
7. `07-garden-winter-override-phone.jpg` — Garden after setting Season → Winter in
   Settings, confirming the override takes effect immediately.

Interactions exercised (beyond what the screenshots show): avatar selection, DA/EN
language toggle (persisted — confirmed surviving a full page reload), card face/back
style selection (live preview via `PlayingCard`), season override (automatic + all 4
seasons), reduced-motion toggle, player name text entry, and a full Memory-game
play-through wired to the reward ledger (verified in the Stage 5.4 pass; see that
commit's message for the deterministic seed/win method).

## 4. Known graphic defects — re-checked, not newly introduced

All three were already identified in earlier passes. Re-verified present in this pass;
none fixed here (native-rendering investigation is out of scope for this container).

1. **Blurred background edges.** The Premium Art V1 backgrounds are raster photos with a
   sharp content band and a blurred full-bleed extension above/below. Visible in
   `02-garden-phone.jpg` / `07-garden-winter-override-phone.jpg` at the very top/bottom
   edges. Documented in detail in `docs/PREMIUM_ART_IMPORT.md` (measured sharp-band
   fractions, visible seam). Not a bug introduced this stage — an accepted property of
   the current art pack pending a future asset revision.
2. **Marmalade transparency/edge artifacts.** `docs/PREMIUM_ART_IMPORT.md` documents an
   alpha-channel histogram analysis showing stray non-transparent pixels near
   Marmalade's silhouette edge against dark backgrounds. Not re-measured pixel-by-pixel
   in this pass; no code touched this stage affects character rendering.
3. **Unstable button gradient.** `CozyButton`'s illustrated gradient fill intermittently
   renders washed-out on the `primary` variant. Reproduced again in this pass — visible
   on `04-minigames-phone.jpg`'s "Spil nu" button and on the Settings screen's selected
   language/season buttons. Root cause investigated previously (ruled out: SVG id
   collisions, dangling `filter` references — see `svgr.config.js` history); suspected a
   browser/web-SVG rendering-order race when many SVGs mount at once, not reproducible
   on the Welcome screen's identical button. Needs native-device verification, which
   this container cannot do. Not chased further per the explicit prior decision to stop
   spending time on it without a native device to confirm against.

## 5. Scope not covered by this report

- No native Android/iOS testing (see §2).
- No automated visual-regression tooling — comparisons here are manual screenshot review.
- Accessibility screen-reader behavior was not tested (only `accessibilityLabel`/
  `accessibilityRole` props were set per `docs/UI_COMPONENT_CONTRACT_V3.md`).
