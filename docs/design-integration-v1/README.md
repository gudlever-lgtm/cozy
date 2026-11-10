# Cozy Solitaire 3.0 — Design Integration Pack V1

**Scope:** Forside, Have, Kabale.  
**Reference code:** `claude/nifty-keller-o5b8bd` at `626da2e`, before Stage 5.7.  
**Workstream:** Design-only branch; does **not** alter gameplay, state, JSX screens, UI source files or approved artwork.  
**Status:** DRAFT — owner-approved art direction, but THIS screen-specific package and generated mockup are **not yet owner-approved**.

## What this fixes

The existing source integration is mechanically plausible but fails visual fidelity. `WelcomeScreen` uses a premium illustrated scene with blurred bands and a small, disconnected menu. `GardenScreen` uses a flat seasonal raster image as if it were a scalable scene, with new vector decorations that are out of style. `SolitaireScreen` puts tiny cards at the top of a large pale blank field, with controls near the bottom. A design-only commit must not be confused with these defects being fixed in app code.

## Non-negotiable rules

1. **Visual responsibility:** ChatGPT/design workstream supplies approved asset and screen specs. Claude is responsible for integrating them with real gameplay; no improvisational replacement graphics.
2. **No edited source during concurrent Claude work:** Stage 5.7 remains on the Claude branch; do not cherry-pick any UI/React files from this design branch because there are none.
3. **Existing source art audit:** approved V3 SVG UI chrome lives in `assets/v3/`; Premium Art V1 candidate PNG backgrounds, logo and figures live in `assets/v3-premium/`. A design mockup is **not a replacement asset**.
4. **No cards, buttons, logo, text or other interactive controls baked into background art.** Backgrounds remain passive layers.
5. **Camera and hit targets:** world-scene coordinates must be independent of viewport units, safe areas and fixed overlays.
6. **All labels rendered as native text, localized DA/EN; no clipping at 200% font scaling.**
7. **No APK** without an explicit instruction from the owner; do not merge to `main` unrequested.

## Files

- `docs/design-integration-v1/asset-map.json` — exact existing asset references and roles
- `docs/design-integration-v1/WELCOME.md` — responsive composition
- `docs/design-integration-v1/GARDEN.md` — world/layers, gestures, build controls
- `docs/design-integration-v1/SOLITAIRE.md` — full-board geometry and tabletop background
- `docs/design-integration-v1/CLAUDE_HANDOFF.md` — merge procedure after Stage 5.7

## Visual baseline and acceptance

The generated three-screen illustration shown in this conversation is a **concept illustration**, not 1:1 literal UI assets or proof of actual app rendering. It is not yet present as a committed image in the repo. It illustrates desired density, atmosphere and hierarchy. The project already contains actual 390×844 screenshots in `docs/stage5-test-evidence/`; use these as the **before** state, not the desired reference.

Capture a real app screenshot for each screen on 360×800, 390×844, 844×390. Verify source art is not duplicated by rendered characters/objects, gameplay is interactive and all visible controls are accessible. No final visual approval until the owner reviews real results.

## Explicit artwork blockers

- Current premium season images are compressed portrait scenes with blurred top/bottom fill; **not** a freely placeable multi-layer garden and not final high-res art.
- There is no independent production-quality solitaire tabletop background in the repo. Do not treat an empty pale background as the intended board.
- The 57 original SVG assets do not match the premium mockup's richness in every area, particularly menu/tab and decor.
- The original portrait welcome scene already includes Millie and Marmalade; adding separate cutouts over them will duplicate the characters.
- A new high-fidelity art pipeline must generate separately reviewable assets, not crop UI controls from a full-screen concept sheet.

The design team owns replacement art creation and signoff. Claude must report missing assets rather than drawing stopgap vector art and calling the screen finished.
