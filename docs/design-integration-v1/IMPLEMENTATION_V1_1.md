# Screen-by-screen implementation brief — after Stage 5.7

**Implementation input:** `docs/design-integration-v1/`, current gameplay branch latest HEAD; do not merge source from an old code snapshot.

## Phase A — Solitaire board (BLOCKER)

**Portrait 390×844 dp**: split the viewport into explicit nonoverlapping safe regions:
- top safe inset, fixed status/HUD zone (if present);
- upper stock/waste/foundation row (19:27 card aspect);
- tableau region occupying remaining available height above actions;
- fixed action strip of 4 controls (min 44dp target each);
- fixed bottom nav within safe-area.
- Card width mathematically determined by seven columns: `(viewportWidth - 2*10 - 6*4)/7 ≈ 49.43dp` (390dp width). Never fake larger seven-column geometry.
- Card values must remain visible when stacked; deep stacks must not be obscured by actions/nav. Use measured available height and scroll strategy for overflowing tableau rather than shrinking ranks to unreadability.
- A premium tabletop background must be **one standalone passive image** without rendered cards/buttons. Until supplied, current background is explicitly provisional.

**Landscape 844×390 dp — required distinct layout**:
- Never position action buttons atop tableau cards. Prefer a compact action rail to the right or a top toolbar occupying independent width, while the board uses the rest.
- Bottom nav may be compact (or repositioned as a rail following approval); it must not overlap any card pile. Reserve effective nav width/height before computing board area.
- Show all 7 tableau stacks, stock, waste, 4 foundations, and at least four accessible gameplay actions; if impossible, provide a conscious scrollable board region, not overlap.
- Use all actual safe-area insets from device and native measures; don't assume 844×390 is entirely available.

**Test gates:** 390×844 and 360×800 live deals with deep tableau; 844×390 both fresh and mid-game; drag/drop, hint, undo, new game, overlay z-index tests; state unchanged by orientation.

## Phase B — Garden composition

- Keep the four premium PNGs as backgrounds, preserving aspect ratio and camera world coords (768×1280), not distorting art to fit.
- Do not claim baked painted buildings/flowers/benches are selectable: only independent decoration layers and characters.
- HUD and nav fixed in screen coordinates; independent of pinch/pan transforms.
- **Landscape:** navigation height should be measured and reduced/relocated so it occupies no more than 16–20% of usable screen height; don't invent a totally different visual style. If the current approved 4-tab bar cannot meet this limit, bring alternative layout back for design review.
- Build/decorate panel is opaque and readable, with minimum 44dp targets and a grid; it must not cover bottom navigation or selected object.
- Distinguish Move, Rotate, Remove by honest icon/label; don't reuse Undo icon with Rotate meaning without approval.
- Character images should not appear to float atop large painted objects or duplicate baked-in subjects.
- The blurry canvas ends are an **art defect**. Do not claim it fixed through camera pan alone.

## Phase C — unify panel screens

- The Minigames, Quests and Settings screens share one background/chrome system, not plain gray backgrounds with giant detached panels.
- Keep `CozyPanel` and gold/cream treatments; preserve rounded ornament corners at all aspect ratios.
- Minigames: 4 entries, real Memory available, three honest locked states. No misleading Play controls.
- Quests: preserve idempotent reward claim logic; no fictitious new tasks.
- Settings: scrollable content, avatar/suit preview, DA/EN, 200% type; language/season buttons must not cut off labels.
- Use an approved subtle art backdrop if present; if no matching standalone background exists, surface missing-art requirement rather than fabricate a new busy scene.
- Compose above fixed nav; allow scroll, no independent overlay stealing taps.

## Stage 5 design review completion

- Retake **all seven screen types** at 360×800, 390×844 and 844×390.
- Attach screenshot filenames in test report. For each, note pass/fail against the exact issue table in `STAGE57_REVIEW.md`.
- Test real card drag/zoom and 200% text scaling; screenshots alone don't prove gestures.
- Don't edit source `assets/v3/` or `assets/v3-premium/` without design approval; derive stable display assets only if visually identical and documented.
- Merge no code automatically into `main`; no APK.

**Technical responsibility:** Claude implements after finishing current Stage 5.7. **Design responsibility:** ChatGPT will review and supply missing illustration assets independently.
