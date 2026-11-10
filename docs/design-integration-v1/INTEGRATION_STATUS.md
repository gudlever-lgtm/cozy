# Cozy 3.0 — UI integration review (garden + solitaire only)

**Branch:** `integration/cozy-v3-visual-garden-solitaire`
**Code baseline:** `claude/nifty-keller-o5b8bd` at `8a06494eef59`
**Scope:** ONLY visual presentation for Klondike, Garden and shared bottom navigation. **Minigames, quests, reward ledger, state/persistence and game engines are unchanged.**

## Implemented in this integration commit

- `SolitaireScreen.tsx`: uses two original standalone botanical felt/wood/gold SVGs, adapts seven-column card geometry to wide+short viewports, and reserves a separate landscape control zone instead of placing actions atop the tableau. Adds vertical scrolling for deep tableau stacks; does not change the existing Klondike move logic or save format.
- `CozyBottomNavigation.tsx`: 50dp high, 21dp icon treatment in landscape; original illustrated background still used; 70dp in portrait.
- `GardenScreen.tsx`: construction/decoration palette gets a real opaque cream and gold treatment, compact landscape variant, 48dp targets, and limited selection overlay coordinates; gesture and persistence code remain unchanged.
- `assets/v3-premium/tabletop/solitaire-felt-{portrait,landscape}.svg`: two actual passive SVG scene assets, **no baked-in cards, labels or interactive buttons**.

## Acceptance checklist / known open items

- [ ] Run `npm run typecheck`, `npm run typecheck:app` and `npm test`. These commands **have not been executed in this environment**; do not infer that prior Claude 51/51 runs also validate this integration commit.
- [ ] Verify SVG imports work in native Android and iOS, not just Expo web.
- [ ] Verify tableau scroll + card drag do not compete for touches, particularly a long run scrolled into view.
- [ ] Verify source/end coordinates for drag overlay and foundation drops at 360×800, 390×844, 844×390 after safe area offsets.
- [ ] Verify low-height landscape on devices with notches: board actions and bottom nav never occlude cards; avoid excessive overflows.
- [ ] Inspect the eight garden build items at portrait and landscape, plus character positioning across seasons.
- [ ] Take before/after screenshots of Welcome (unchanged), Garden, Garden build/edit and Solitaire, including deep cards and landscape.
- [ ] Check whether premium art V1 blurred bands are visible; they remain an art limitation.
- [ ] Obtain owner visual approval; do not call visual integration complete before real screenshots and native QA.
- [ ] Do not merge to `main` or build APK until explicitly requested.

## Additional known limitations

The new standalone tabletop backgrounds are richer than an empty flat field and match the intended botanical green-and-gold palette, but they are **illustrated SVG art, not a replacement for the photoreal/painterly high-fidelity artwork of the concept**. Do not misrepresent them as pixel-identical to the approved illustration.

Existing minigame and quests navigation remain available but have not been changed, expanded, tested or visually accepted as part of this task.
