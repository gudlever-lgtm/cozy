# Optimization work log

## Unchanged baseline (step 0)

- Remote main: `26f9814`; app/package 1.7.13, not 1.7.12 or the earlier `a7f4d2d`.
- Nine remote branches. `codex/cozy-v2-world` (`309873a`) has no unmerged commits and is 23 commits behind main. `android-download` (`78645d9`) has an independent root and only APK/QR/build metadata; BUILD_INFO identifies main `26f9814`. Its binary history must not be merged into the app source.
- Read README, IMPLEMENTATION, ARCHITECTURE, IMPLEMENTATION_STATUS and TEST_RESULTS before edits. Historical documents contain earlier counts; current counts below supersede them.
- Node 24.19.0, clean `npm ci`, TypeScript, 57 engine tests and 158 Android/iOS component test runs pass. No new dependency is needed.
- Snapshot-based 200-board history and write-per-change queue are still present. Tea Time had already been corrected to fixed minimum 3/6/7 moves. Listed source files exist; their line numbers have shifted. There are no HTTP endpoints.

## Step 1 — delta history / schema 4

Implemented pure board inverse, deep snapshots without JSON serialization, bounded 200-delta undo and exact suffix verification when converting older snapshot histories. Current and initial boards, game ID, move count, economy, profiles, receipts, preferences and mini-game sessions are preserved. Corrupt older history drops only the unverifiable undo prefix; an invalid current board is still rejected. Tests changing expected schema 3 to 4 retain the original migration/profile test intention.

Checks and subsequent steps are recorded as their commits become green. Native gestures, audio and device performance are not tested on hardware.

Step 1 checks: TypeScript/formatting pass; **62 engine tests / 158 native runs** pass. Fresh save after 200 actions: **12,494 bytes**. The 200-entry cap is tested explicitly: a 300-action game can undo its latest 200, while shorter runs undo exactly to their start.

## Step 2 — fewer storage writes

Identical serialized saves are skipped inside the serialized queue, including concurrently queued duplicates. Backups default to a 30-second interval, with injectable interval/clock for deterministic tests; the first write establishes/preserves a safe copy. Failed primary writes remain retryable, and a corrupt primary cannot overwrite an existing recovery copy. The existing 150 ms UI debounce and immediate background save remain. **64 engine tests / 158 native runs**, TypeScript and formatting pass.

## Step 3 — no-more-moves guidance

`isStuck` checks the current and complete next stock/waste cycle in both draw modes, without changing the game. It returns false for wins, unknown cycles and legal foundation returns as well as ordinary hints. Actual game actions show the existing temporary tip with DA/EN Undo/New game guidance. Tests cover visible/draw-only/partial-pass moves and the rendered app notice. **67 engine tests / 160 native runs**, TypeScript and formatting pass.

## Step 4 — offline solver / verified deals

Added bounded DFS with transpositions and ordinary engine actions. At 150,000 nodes, original seeds 17017 and 23111 remain unknown; 98173 is solved in 5,333 nodes with a replay-verified 228-action solution. No challenge seed was changed. The original LCG is shared and full-deal hashes lock shuffle behavior. Offline generation produced 100 replay-verified seeds per draw mode, with all 200 witnesses checked by tests. Runtime imports only the seed list; a graph test excludes solver/Node/test code. New game offers the optional guaranteed-winnable choice. See SOLVER.md for reproduction, limits and results. Test baseline for this step: **72 engine tests / 162 native runs**, TypeScript and formatting.
