# Claude handoff — AFTER Stage 5.7

**Do not import this design workstream while Stage 5.7 is still running.**

## When Claude says Stage 5.7 is finished

1. Pull latest code/verify the stage result and capture 360×800, 390×844 and 844×390 screenshots for **Welcome, Garden and Solitaire**.
2. Review this separate branch `design/cozy-v3-integration-pack-v1` and compare the design-only docs with the latest UI implementation.
3. Merge/cherry-pick **docs only** if helpful; no JSX/TS files from this branch touch gameplay.
4. Use `asset-map.json` to map exact roles. Do not fabricate missing tabletop art or treat generated design-overview mockup as a production asset.
5. Open targeted visual tasks in Claude: preview issues, asset gaps, fixes to UI layers and hitboxes.
6. Test local navigation, game persistence and canvas gestures remain unchanged.
7. Generate *actual* screenshots and give them to design reviewer; never assume web matches Android/iOS.
8. Do not merge to `main` and do not build an APK without explicit owner instruction.

## Work allocation

**Design workstream:** original production visuals, named assets, background composition, scale, palette, accessible safe zones, assessment of screenshots.  
**Claude:** Expo/React Native rendering, gesture interactions, game engine, rewards, persistence, native tests, integration of approved assets.  
**Owner:** final visual approval of the actual phone screen.

## No silent policy change

Previously approved SVG assets are a technical baseline, but not sufficient proof they look like the visual concept. Every missing asset should be clearly noted. High-fidelity art needs separate owner approval before replacement.
