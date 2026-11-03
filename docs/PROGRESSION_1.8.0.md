# Progression preview 1.8.0

The garden home shows exactly two persistent mini-game slots. Each icon has its earned move balance on the right. A solitaire victory adds ten moves to each unfinished slot and ten fireflies. Finishing just one slot preserves its completed state; finishing both replaces the pair. An exhausted mini-game may be ended without a victory prize. Saved boards and earned balances survive app restarts.

Mini-game victories grant undo credits and a new guaranteed Klondike deal credit in addition to existing material rewards. Random deals remain available without credits, preventing a progression dead end. Main-game victory prizes permanently grant the Open Solitaire key at three solitaire wins and the Whitehead key at six wins. Whitehead reveals all tableau cards, builds down in the same color, moves descending same-suit runs, and permits any card in an empty column. Existing saves migrate additively.

Validation: TypeScript passes; all 89 engine tests pass, including save migration, pair rotation, duplicate reward protection, unlock prizes and variant rules. The dedicated pair UI test passes on Android and iOS. The older full native test suite is not green: the previous run reported 54 failed / 112 passed assertions, including obsolete mini-game menu and free-play flows. This release does not claim a clean full native suite or physical-device validation.

Android: standalone release-mode test APK, signed with the existing local Android test key. Version 1.8.0, version code 16. This is a sideload preview, not a Play Store release.
