# SOLITAIRE — premium tableau design/geometry v1

**Current code:** `src/screens/SolitaireScreen.tsx`, `src/ui/components/PlayingCard.tsx`, `src/domain/solitaire/*`.

## Primary design objective

The **game board** must use the phone's available area and look like a premium, calm card table. The current screenshot in `docs/stage5-test-evidence/03-solitaire-phone.jpg` shows tiny cards squeezed into the top ~25% and enormous blank pale space. This is a visual-defect blocker, even if Klondike works.

## Rendering layers

1. **Missing / to create**: standalone premium card tabletop *background only* (felt, subtle flowers/wood edge), no cards, no icons, no controls burned in. Existing pale fill is not an approved background substitute.
2. Game HUD/status row (time, draws, score, etc. only if actually derived from the game state).
3. Row 1: stock, waste, and **four foundations** in stable positions. Seven-column grid baseline.
4. Row 2: seven tableau stacks with different offsets face-down vs face-up.
5. Drag overlay rendered in top layer; underlying source cards hidden during drag. Drag run preserved as one visual unit.
6. Bottom actions: Undo, Hint, Auto-finish, New Game — icon + label where space allows, using approved UI chrome.
7. Shared bottom navigation, fixed and never obscured by card or animation layers.

## Sizing math (dp)

Available width `W = viewportW - horizontalInsetLeft - horizontalInsetRight`; design initial compact inset 10dp each.

For tableau with 7 columns and 6 equal gaps, define card width:  
`cardW = min((W - 6 * gap) / 7, maxCardW)`, `gap ≈ 3–6dp` on compact portrait, card aspect `190:270`.

- On 390dp view, `W=370`, gap=4 → `cardW ≈49.4dp`. Do **not** state a 100dp card width can fit seven columns.
- For readability at 49dp, rank/suit corner typography and legibility should be tuned to **actual screen density**; card faces must keep color/suit clear.
- Stock and waste group left; 4 foundations align right in the same grid. All six slots occupy grid-aligned positions.
- Tableau starts below top cards with 12–20dp vertical separation.
- Face-down overlap should reveal recognisable back-pattern detail; face-up overlap should preserve rank and suit values.
- Board must allow scrolling/moving camera **only if** necessary for long tableau stacks; do not collapse cards into unclickable rows.
- Reserve bottom safe-area + nav height + action controls; choose a board region using **dynamic available height**, not a fixed top-only area.
- Avoid forcing a fully expanded tableau into impossible phone height; vertical adaption must preserve touchability.

## Interaction rules

- Drag must render in overlay above every pile; accurate source-to-target mapping.
- Foundation drop must verify exact destination pile, not just 'top row' in general.
- Undo, Hint, New Game, Auto-finish must use real domain engine.
- Card theme selection changes face/back graphics only, never deal or stack layout.
- Hints/disabled feedback appear near relevant control, not as a giant dark modal.
- No fake win, no random fake score or additional earned currency.
- Native UI must be tested separately from web.

## Acceptance images

Capture 390×844 and 360×800 portrait of an actual live deal, plus 844×390 landscape. Verify *all seven columns*, 4 foundations, readable ranks, action controls and main nav in every screenshot. Compare with design concept and inspect overflow at minimum and maximum stack depths.

## Asset dependency

An actual premium tabletop graphic does not exist in current repository. Design workstream must create it as a standalone source image. Claude must not silently substitute a homegrown bland background and then label this design done. Keep current functional UI while waiting for the art dependency.
