# Cozy Solitaire 3.0 — Premium Illustration Replacement Pack V1

**Prepared:** 2026-11-10  
**Status:** CANDIDATE ARTWORK; not shipped, not merged, not yet signed off on a real device.

## Why this pack exists
Screenshots from Stage 5.2 show that the original `assets/v3/backgrounds/garden-*.svg` are deliberately simple vector sketches, inconsistent with the approved painterly cottage-garden design. The old SVGs were incorrectly described as production-ready art. The issue is primarily **source art quality**, not only layout.

## Source delivery and import
The premium images were produced in the ChatGPT working environment as **individual transparent/opaque PNG files in an external ZIP**. The ZIP itself is **not yet in this GitHub repository**: the available GitHub integration supports text/git objects but not transferring the generated binary images from the working container. Do not claim these files are already available on `main` or the Claude branch.

The user can download the ZIP from the same ChatGPT conversation and pass it into Claude Code's working directory. After extracting:

```sh
mkdir -p assets/v3-premium
unzip cozy-v3-premium-art-v1.zip -d assets/v3-premium/
git add assets/v3-premium docs/PREMIUM_ART_IMPORT.md
git commit -m 'art(v3): import premium garden illustration candidates'
```

**Do not replace `assets/v3/` files or switch rendering automatically.** Review and test on a branch first.

## Expected pack contents
- `backgrounds/garden-spring-premium.png` — 768×1280
- `backgrounds/garden-summer-premium.png` — 768×1280
- `backgrounds/garden-autumn-premium.png` — 768×1280
- `backgrounds/garden-winter-premium.png` — 768×1280
- `backgrounds/welcome-garden-premium.png` — 768×1280
- `branding/cozy-solitaire-premium-logo.png` — 630×278, transparent
- `characters/millie-premium.png` — 640×640, transparent
- `characters/marmalade-premium.png` — 640×640, transparent
- `previews/asset-contact-sheet.jpg`, `manifest.json`, `README.md`

## Important visual limitations
- Seasons are **individual painterly scene crops extracted from an illustrated source sheet**, not independently generated high-resolution world backgrounds.
- The portrait artwork extends the scene with **blurred fill above and below**. It is a candidate for the next visual review, not an accepted final garden world.
- There is **no parallax decomposition or separate buildings/trees/path**. True world pan/zoom, interactive placements and camera design still need proper world-coordinate mapping.
- Logo and character cutouts have transparency masks created from white-background source art. Edge halos must be checked on dark/colored backgrounds.
- The pack improves scene fidelity compared with the simple geometric SVGs but **does not itself guarantee equivalence with the signed-off full-screen mockups**.

## Integration handoff to Claude
1. Only after the asset ZIP is available locally, import the new files to `assets/v3-premium/`.
2. Keep all currently approved UI icons, buttons, panel and navigation artwork as-is.
3. Render the garden as an aspect-preserving background layer; keep HUD, characters and placements in separate scene/UI layers.
4. Use the independent transparent characters for Millie and Marmalade; do not duplicate text-only character labels as if they were art.
5. Render the logo as a separate image, native `Text` elsewhere. Check that logo is readable at 360×800.
6. Fix world sizing, starting camera, decoration scaling and edit mode from actual screenshots.
7. Verify at 360×800, 390×844, 844×390 and on-device. Record before/after.
8. **No production replacement without owner's visual review. No APK without explicit request.**

## Collaboration rule
Claude owns functional UI/code integration. The design/asset workstream does not edit `src/**` while Claude is working on it.
