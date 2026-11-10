# Cozy Solitaire 3.0 — UI Component Contract v0.1

**Status: OVERALL MOBILE SCREEN LAYOUT AND 57 V3 SVG ASSETS APPROVED BY OWNER ON 2026-11-10.** Layout values below form the implementation baseline; exact native rendering, text clipping, tap targets and edge-device adaptation remain to be validated. This file has no game-engine implementation.

## Design baseline and working rules

- Approved artwork comes exclusively from `assets/v3/manifest.json`. Every visible decorative UI component refers to an exact asset key; never silently substitute a glyph.
- UI text is native `Text`, localized (DA/EN), accessible, and drawn over **safe content zones**. Never make a full illustrated button image contain its own label.
- Layout values below use **React Native dp**, not pixels. Asset dimensions use intrinsic SVG units. Device screenshots are evaluated at actual physical pixel density.
- SVG surfaces must retain corners/floral ornaments: for variable-width buttons/panels use a validated **9-slice** rendering or an explicitly separate fixed-aspect decorative frame with independently laid out content. Do not `stretch` the complete SVG.
- Each interactive item must expose `accessibilityLabel`, `accessibilityRole`, state, and a tappable rect >= 44 × 44 dp. Long press on icon-only actions shows a small text hint without darkening the whole page.

## Component inventory and geometry

| Component | Asset(s) | Suggested bounds (dp) | Text and icon rule | Interaction |
|---|---|---|---|---|
| `CozyPrimaryButton` | `ui/button-primary.svg` | 180–300 W × 58–66 H | Safe label zone starts ≥ 21% from left, ends ≤ 92% of graphic width; 14–17 sp font, 1–2 lines | press, pressed, disabled, loading |
| `CozySecondaryButton` | `ui/button-secondary.svg` | 150–300 W × 54–64 H | Same geometry; contrasting dark label | press, disabled |
| `CozyWoodButton` | `ui/button-wood.svg` | 150–300 W × 54–64 H | Dark/light text only after contrast check | press, selected |
| `CozySpecialButton` | `ui/button-special.svg` | 150–300 W × 54–64 H | No embedded icon behind text | press |
| `CozyIconButton` | `ui/icon-button.svg` + exact `icons/*` | 48–60 square | Icon max 56% of button width, `contain` | press, long-press tooltip, a11y |
| `CozyBottomTab` | `ui/tab-background.svg` + `icons/*` | bar 64–76 H, 4 slots | Icon 26–30, caption 10–12 sp, max 1 line or icon-only w/ tooltip | tab switching |
| `CozyPanel` | `ui/panel.svg` | width = viewport − 24–32, content-driven H | 18–26 dp interior padding; separate header/footer | scroll when tall |
| `CozyWidePanel` | `ui/panel-wide.svg` | width ≤ viewport−24, H content-driven | Preserve ornament edges and safe area | status/section |
| `CozyDialog` | `ui/panel.svg` or `panel-wide.svg` | width ≤ min(440,viewport−32); maxHeight ≤ viewport−insets−24 | Text 15–17 sp; body scrolls while actions remain visible | focus, close, confirm |
| `CozyHUDChip` | `ui/hud-pill.svg` | min 94 W × 38–44 H | icon 20–24, numeral 16–19, short localized label | info/action |
| `CozyProgress` | `ui/progress-track.svg`, `progress-fill.svg` | W flex, H 14–22 | progress text separate; cap at 0–100% | status |
| `CozyAvatar` | `avatars/{cat,rabbit,fox,owl,hedgehog,bird}.svg` | 48–72 square | never display emoji fallback or crop ears | select + state |
| `CozyCard` | `cards/face-*.svg`, `back-*.svg` | aspect ratio 190:270; auto size based on 7 columns | rank/suit drawn in *fixed inset corner slots* | tap and drag |
| `CozyCardSlot` | `ui/card-slot.svg` | same aspect ratio as card | no distorted placeholders | drop target |
| `CozyDecoration` | `decorations/*.svg` | scene-scale independent of HUD | hitboxes match art bounds; preserve full alpha | tap, place, drag, rotate |
| `CozyTooltip` | `ui/tooltip.svg` | max W 240, content H | 13–15 sp, anchored near control; never full-screen modal | long press / dismiss |

Values above are the **approved implementation starting baseline**, not claims of observed Android rendering. Minor responsive adjustments require screenshot evidence; material visual changes require owner approval.

## Responsive rules (portrait and landscape)

- Target widths: **360×800**, **390×844**, and **844×390** logical viewport test sizes. Include at least one tablet. Always account for safe-area insets and dynamic text scale.
- Bottom navigation is fixed to safe-area bottom and **does not scroll with panels or move when the garden pans/zooms**.
- Garden: full viewport illustration behind fixed top HUD and bottom navigation; pinch focal point stable; single-finger drag pans only while zoomed; clamp translations to visible image bounds.
- Solitaire: reserve horizontal board width for seven tableau columns with consistent `cardWidth = min(availableWidth / 7 - spacing, targetWidth)`; pile separation and drag hit targets must remain valid. Do not hide card values under decorations.
- At ≤ 390 dp width: avoid more than two illustrated full-label actions in one row. Prefer compact icon actions with accessible long-press labels; never force a 4-wide row of text buttons.
- Dialog: content scrolls if needed; confirm/cancel buttons stay in view; destructive actions cannot be mistaken for the dismiss action.
- Settings and menu: text-heavy options should be row-list items using a panel and clear text region, *not* decorative small pill buttons.
- Localized strings: test at least `Gem spillernavn`, `Afslut automatisk`, `Guaranteed solvable deal`, `Havens samlealbum`. At 200% system text size, preserve usability with a fallback list layout rather than overlapping art.

## Explicit screen roles

### Intro and main navigation
- Intro: logo/character focus, one primary `Spil nu`, one secondary `Min have`.
- Persistent tab destinations: **Have**, **Kabale**, **Minispil**, **Opgaver**; settings from top/overflow.
- All other routes use coherent back navigation.

### Garden
- Camera-independent overlays: top resources and bottom navigation.
- Camera gestures: pinch, pan, tap decoration, decoration edit mode (does not steal normal panning).
- Build/Decorate modes appear as *contextual* actions, not large permanent overlaid button stacks.

### Klondike
- Cards take priority over decoration.
- Top: game variant, draws, score and resources. Bottom: `Fortryd`, `Tip`, `Nyt spil` (and `Afslut` if ready) use accessible icon actions, with full captions in expanded menu if width is tight.
- `Fortryd` with insufficient points gives accurate reason and path to earn them; does not silently perform another action.

### Mini / quests / settings
- Minigames have clear availability, moves and reward display, plus playable action.
- Quests emphasize current objectives and progress, not repetitive oversized cards.
- Settings use section-based rows, distinct illustrated selectable avatars, and previewable **card face and back designs**; selection affects visuals only.

## Design/QA acceptance gate for each screen

1. Snapshot rendered on 360×800, 390×844, 844×390, tablet in **DA and EN**; annotate actual content clipping and touch regions.
2. Assert text bounding rect is inside **visible** image's safe text zone, not just inside parent Pressable.
3. Assert icon stays in its allocated slot; artwork aspect ratio and floral corners remain correct.
4. Exercise disabled/selected/pressed, 200% text, long-press tooltips, and screen reader labels.
5. Camera drag and card drag remain separate; buttons and overlays do not swallow touch gestures.
6. Owner has approved the overall visual layout; owner must still accept on-device visual rendering **before production release**.

## Implementation contract (for Claude Code)

- All components accept semantic props (`variant`, `iconKey`, `labelKey`, `disabled`, `selected`); no raw graphics in game domain.
- `assets/v3/manifest.json` is the source of exact file paths. SVG importer/raster export is checked by build tooling.
- Implement a small deterministic visual-layout test harness; report mismatches rather than pixel-tweaking unknown devices.
- Changes to approved graphics require an explicit design change request. Changes to **proposed** responsive geometry can be iterated with snapshots and owner approval.
