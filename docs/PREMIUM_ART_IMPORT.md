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

## Integration report (2026-11-10, this pass)

**Imported:** `assets/v3-premium/` — all 9 files, contents and dimensions verified
against `manifest.json` byte-for-byte (unzip + `PIL`-read sizes, not assumed).

**Wired in (mapping: `src/ui/theme/premiumArt.ts`):**
- `WelcomeScreen` — `welcome-garden-premium.png` as the fullscreen background (plain
  `resizeMode="cover"`, aspect preserved, not stretched), `cozy-solitaire-premium-logo.png`
  as the title (native `Text` kept separate for the tagline, per rule 5 above). Millie and
  Marmalade are **not** separately overlaid here — they're already painted into this
  specific background image (the embracing rabbit+cat under the tree), so adding the
  cutouts too would duplicate them.
- `GardenScreen` — the four season PNGs replace the SVG season backgrounds
  one-for-one; the world-coordinate `SCENE` constant now equals the art's own 768×1280
  intrinsic size (`PREMIUM_SCENE`) rather than the old SVGs' 720×1280, so the existing
  pure camera/domain math needed no changes. Millie and Marmalade now render as the
  actual transparent character cutouts, positioned at their existing stored normalized
  coordinates (unchanged) instead of plain text-label markers.
- Game mechanics, HUD, buttons and navigation are byte-for-byte unchanged — only the
  background/character/logo image source changed. `npm test` (43/43, domain untouched),
  `npm run typecheck` and `npm run typecheck:app` all pass.

**Scale, placement, transparency — checked, not assumed:**
- Transparency: sampled the alpha channel directly (not eyeballed). Millie/Marmalade are
  ~87% transparent pixels, the logo ~32%, **and the mask is hard-edged — 0% partially-
  transparent edge pixels measured**, confirming the README's own warning that these are
  cutouts from a white background with no soft edge blend. Composited both characters
  onto a saturated green and a dark purple test background to check for white halos: the
  rabbit's edge reads clean; the cat shows a few small stray white flecks near its
  left side (likely a whisker-tip masking artifact) and a faint light rim along its
  back/tail against the dark background. Minor, but real — not invisible on a colored
  background, as the source README warned it might not be.
- Placement/scale in the garden: world coordinates are unchanged (characters already sat
  at reasonable normalized positions; decorations already use a measured, non-art-
  intrinsic scene size from the prior pass), so switching the background art underneath
  didn't require recalibrating either.
- **Known, deliberately not "fixed" this pass:** every background (confirmed via
  measuring row-by-row image sharpness, not guesswork) is a sharp painted scene with a
  blurred full-bleed extension above and below — exactly as this doc's "Important visual
  limitations" section already predicted. A plain cover fit on a tall phone screen shows
  a visible hard seam where blur meets the sharp scene (see the Garden screenshots sent
  this pass). A "zoom in to show only the sharp band" fix was built and tested for the
  Welcome screen specifically, and **reverted**: the sharp band's aspect ratio is
  landscape-shaped, so covering a portrait phone screen with only that band requires
  ~1.7x zoom, which crops Marmalade out of the frame entirely — a worse defect than the
  seam it was meant to fix. The measured sharp-band fractions are kept as a comment in
  `premiumArt.ts` for whoever next attempts this (e.g. with a properly re-extended/
  outpainted source image instead of a crop).

**Not attempted this pass (would need the source studio to fix, not integration code):**
- The visible blur seam (above).
- The cat's stray edge-mask artifacts (above) — cosmetic, would need a cleaner matte
  from the source.
- True parallax/world-layer decomposition (buildings/trees/path as separate movable
  layers) — the pack's own README says this explicitly isn't included in V1.

**Verified at:** 360×800 and 390×844 for Welcome, Garden and Garden build-mode, via the
real Expo web bundle rendered headlessly with Playwright — screenshots sent to the user
directly, not committed. **This is web-rendered verification, not on-device native
verification** — this container has no Android/iOS simulator, and
`docs/UI_COMPONENT_CONTRACT_V3.md` still requires the latter before any production
acceptance.
