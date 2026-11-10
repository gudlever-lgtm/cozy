# WELCOME — layout specification v1

**Current code:** `src/screens/WelcomeScreen.tsx`. **No changes to mechanics or navigation.**

## Order of layers (back to front)

1. **Background**: `assets/v3-premium/backgrounds/welcome-garden-premium.png`; aspect preserving. Current art includes rabbit and tabby already, so **do not duplicate character cutouts**.
2. **Atmospheric legibility treatment**: only gentle translucent local gradient where required; never full-screen dark gray box.
3. **Logo**: `assets/v3-premium/branding/cozy-solitaire-premium-logo.png`, native `Image resizeMode=contain`.
4. **Optional tagline**: native localized text, short and visually subordinate to logo.
5. **Primary action** `Spil nu`: `assets/v3/ui/button-primary.svg`, visually centred.
6. **Secondary** `Min have`: `assets/v3/ui/button-secondary.svg` or `button-wood.svg` only if visual change is explicitly approved.
7. **Safe-area edges and accessibility**.

## Portrait geometry (390 × 844 **dp design reference**, all dimensions in dp)

- `safe top/bottom` from real insets, never a hardcoded statusbar offset.
- Logo: width `min(0.76 × availableWidth, 320)`, intrinsic aspect `630:278`, centred; logo block starts at top safe inset + 32 to 48.
- Tagline: text width ≤ 330, type 14–16 sp, native text; dynamic content height.
- Main illustration: artwork visually dominant from roughly 22% through 72% of available scene; the actual V1 PNG's cropped/blurred band must be reported, not hidden with extreme cover crops.
- Controls: stack with 10–16 dp gap, width `min(0.76 × viewportWidth, 300)`; group anchored inside safe area near bottom, without overlapping figures/important props.
- Background selection/crop must be specified per portrait and landscape; do not use arbitrary stretch.
- If screen height below 680 dp, shrink vertical **gaps** first. Do not reduce tap target below 44×44 dp or position controls over safe area.

## Landscape geometry

- Reserve left ~55% for the illustration/logo and right ~45% for controls and short tagline.
- Logo never cropped; actions must fit visible viewport height and safe area.
- If visual background cannot cover landscape without unacceptable blur/cropping, record as **asset blocker**, not a layout success.

## Acceptance

- The logo remains legible, not an SVG text substitute.
- Millie/Marmalade appear once, not duplicated or occluded by a giant panel.
- All buttons use intact gold/green illustration without the intermittent white/gray gradient washout.
- Both labels remain within the **visible artistic frame** in DA/EN at 100% and 200% font scale.
- Screenshot actual welcome screen at 360×800, 390×844 and 844×390.
