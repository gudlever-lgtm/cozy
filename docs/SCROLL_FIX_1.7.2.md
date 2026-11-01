# Scroll correction — 1.7.2

The disabled outer ScrollView around landscape games was replaced with a bounded View. Independent game panels can now receive a finite height and scroll their overflow. Menu screens use a bounded ScrollView; Android nested scrolling is enabled, and rails have bottom padding.

Executed: TypeScript, formatting, 37 engine/presentation tests and 36 native component tests across iOS/Android passed. The regression covers garden, Solitaire, Settings and an active mini-game, including the absence of a disabled/unbounded ScrollView ancestor around game panels.

This update preserves the package and test-signing certificate, increases Android versionCode to 3, and retains existing saved progress. Native physical-device scrolling, especially OEM gesture handling, is not claimed verified by Jest.

## Compact main view

Nine native SVG icon tabs provide persistent navigation within a 54-point bottom dock. The garden no longer has a text-heavy navigation sidebar; its small HUD shows the rabbit logo and Glimmer count, with icon actions at the edge. Solitaire has a compact status strip and a two-column icon action panel. Detailed help/challenges open in scrollable overlays and long content stays on secondary screens. Icon labels appear on press/long-press, dismiss on tap or after 2.5 seconds, and retain Danish/English screen-reader names. NPC dialogue on the main garden also dismisses after 2.5 seconds.

Additional regression coverage verifies tab navigation/selection, all nine accessible destinations, tap dismissal and timed tooltip dismissal. Physical-device layout and scrolling remain unverified.
