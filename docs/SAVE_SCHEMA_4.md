# Save schema 4

The AsyncStorage key remains `cozy.save`. Versions 1, 2 and 3 migrate additively to 4. Current boards and initial restart snapshots retain all cards and flags; progression is not reset.

`game.history` now contains at most 200 inverse deltas: draw/recycle counts or source/destination/count for a move, plus every tableau index whose top was turned face up. Undo first turns those tops back down, then reverses the transfer. `snapshot()` remains a deep, independent Board copy, using arrays/card objects instead of a JSON round trip.

Legacy Board[] history is examined from the current board backward, at most 200 entries. Each inferred transfer must reproduce the previous board exactly by card ID/order/up when reverted. At the first invalid board or mismatch, older entries are discarded; the verified newer suffix remains usable. Unrecognized history falls back to no undo entries while preserving the valid current game and all other saved progress. Schema-4 deltas are shape/range validated.

The 200-entry cap means a game played for 300 actions can undo its most recent 200, not all 300. Regression coverage checks every board in that retained suffix and exact full undo for shorter runs in both draw modes. Card conservation also holds for malformed/oversized inverse transfers.

The serialized queue skips identical JSON and defaults to one backup per 30 seconds, with an injectable clock/interval for tests. The first write creates or retains a safe backup. Backup updates always precede the primary write; failed writes remain retryable. UI saves retain their 150 ms debounce and immediate app-background flush.
