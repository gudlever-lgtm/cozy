# Cozy Solitaire 3.0 – Premium Art V1

This contains **individual image assets**, not a game UI screenshot. Created as replacement candidates for simplified geometric SVG backgrounds and missing character illustrations.

## Files
- backgrounds/: four season scenes and one welcome scene (768×1280 PNG)
- branding/: transparent Cozy Solitaire illustrated logo (RGBA PNG)
- characters/: transparent Millie rabbit and Marmalade cat (640×640 RGBA PNG)
- previews/: contact sheet for visual inspection, **not for runtime**

## Integration rules
1. Add these to a **new** folder such as `assets/v3-premium/` without overwriting `assets/v3/`.
2. Match the intended season key to the matching background; use cover or aspect-preserving rendering, no stretching.
3. Render characters/logo as separate independently positioned layers. Do not bake navigation, text, or HUD into the garden picture.
4. These scenes are still raster 2D backdrops, **not a multi-layer free-roaming garden world**. A freely explorable garden with true parallax/placement will require proper world layers and possibly higher-resolution environment illustration.
5. Verify transparency edges on transparent art and compare on-device screenshots against approved concept. These files are replacement candidates, not independently approved final game art.
6. Keep Claude's branch unchanged until the assets have been reviewed and imported. No APK build.
