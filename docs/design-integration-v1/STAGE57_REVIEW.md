# Stage 5.7 independent design review — 2026-11-10

**Evidence:** 21 real Expo web screenshots under `docs/stage5-test-evidence/5.7-review/` on Claude commit `8a06494eef598d2a20fdfac2b499a37f4a1116e4`.

## Confirmed improvements

- Washed-out primary gradients appear corrected in sampled Welcome, Minigames and Settings screenshots at 390×844, consistent with Claude's SVG gradient-ID fix.
- Real premium garden PNG scenery and characters are integrated; vector sketch background is no longer rendered.

## Unresolved screenshots and acceptance

| Screen / viewport | Observed defect | Severity | Acceptance |
|---|---|---|---|
| Solitaire 390×844 | Cards in top ~190dp, very large blank pale area, action icons float near bottom without a themed table | HIGH | A proper premium tabletop background that does not contain cards/UI; status/board/action regions make deliberate use of vertical space |
| Solitaire 844×390 | Action controls visibly overlap tableau cards; floating bottom nav covers the lower part of stacks | BLOCKER | Separate landscape composition with absolutely no card/toolbar/nav overlap and accessible piles |
| Garden 390×844 | Full scene contains warm autumn art and a tiny character; world is still a flattened PNG and parts cannot be selected as objects | Known limitation | Correct camera, independent character and decoration layers, honest treatment of baked scenery |
| Garden 844×390 | Bottom navigation consumes a large part of shallow landscape viewport | HIGH | Compact/nav overlay appropriate to landscape, e.g. reduced safe-height or rail if approved, no world-interaction obstruction |
| Minigames 390×844 | Four large beige cards sit on unthemed light-gray field; huge blank lower area | HIGH | Unified premium background and panel hierarchy; honest locked states retained |
| Settings 390×844 | Cream panels and avatar selection are functional, but plain header/background and inconsistent text hierarchy | MEDIUM | Shared premium chrome, legibility and scrolling retained |

## Important implementation guardrails

- The screenshots are from **web**, not an Android/iOS device. They are evidence of visual defects, not proof of native behavior.
- Fixes to this point must not change card rules, scores, rewards, garden state format or minigame engines.
- The generated full-screen design overview is a concept, **not** a source for cropping buttons/cards or inventing filenames.
- Existing Premium Art V1 backgrounds include blurred-fill margins; redesign of artwork is a separate art task, not a CSS repair.
- No replacement tabletop artwork is committed yet. Report this as an unmet visual dependency until the design team supplies a standalone file.

**Outcome:** Stage 5.7 is technically progressing, but cannot receive design signoff based on these screenshots.
