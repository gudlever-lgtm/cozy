# Local Garden Match motion and fixed pages — 1.7.5

## Match resolution

The previous renderer faded the entire board after computing all cascades, obscuring which pieces survived. It also relied on native animation completion to release input. The engine now produces a deterministic move plan: swapped board, exact matched indices, per-column survivor mapping, generated pieces/spawn rows, and final state. `swapMatch` delegates to this plan, preserving turn, scoring, cascade cap, random-call order and reward rules.

The renderer keeps stable identities and Animated values for surviving pieces. A swipe moves the held piece, then both neighbours slide to their new positions. Only matched pieces shrink/fade; survivors fall down their own columns, and new illustrated pieces enter from above. Unmatched stationary pieces do not fade or remount. Invalid swaps slide back. State commits once after all stages, with no React state changes per animation frame.

Every animation wait has a bounded completion fallback and every operation releases its lock in finally. Interruption/background/resize restores the authoritative game rather than committing a partial move. A lost finger release expires after eight seconds of inactivity. Unmount cancels timers/native animations. Reduced motion preserves the phase order with zero-duration transitions.

## Screen-sized secondary pages

Decorations and Statistics now use `ScreenPager`: measured finite-height pages, compact illustrated fields and localized previous/next arrows. No ScrollView is used for either screen. Page capacity adapts to the remaining viewport. All six decoration purchases/placement controls and all statistic/achievement entries remain accessible. Placement opens the garden; it does not insert a large scene inside the decoration list.

## Executed validation

- TypeScript and formatting pass.
- 44 engine/presentation tests pass, including stage survivor/value/order mapping, score equivalence, input purity and measured page geometry.
- 62 Android/iOS native component tests pass. New cases cover stable stationary piece identity, missing native completion callback recovery, background interruption/retry, lost release recovery, page navigation without scroll ancestry, purchase and garden placement persistence.
- Native animation tests use a timed driver substitute; they do not establish physical touchscreen feel, rendered appearance, frame rate or OEM lifecycle behavior. Device validation remains required.
- App version 1.7.5, Android versionCode 6. The APK keeps the permanent filename and QR URL documented in APK_DISTRIBUTION.md.
