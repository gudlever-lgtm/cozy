# Landscape game presentation — 1.7.1

User direction supersedes the earlier portrait-first layout. Android/iOS now request landscape throughout the app. Status bars are hidden; Android uses Expo Navigation Bar hidden visibility with swipe access and reapplies hiding when the app resumes. Safe-area insets still protect card controls from notches.

The supplied seasonal gardens now fill the application, with game panels and navigation above the scene. The garden has in-scene Millie/Marmalade interactions and side controls; menus use a compact parchment panel. Solitaire has independent left status/navigation and right action/challenge panels around a central translucent card surface. Long columns and side panels scroll independently rather than pushing the whole board below a webpage-style header. Sparse ambient effects render behind the game surface and never intercept touch.

## Card control corrections

- Single tap selects a source then destination; double tap (within 350 ms on the same card) promotes to a legal foundation, including aces and cards above existing foundations. Full legality and undo still use the unchanged Solitaire engine.
- Drop regions are measured together and resolve one legal target, with a 14-point forgiving margin. Invalid/overlapping regions cannot produce multiple moves. Native target views disable flattening so measurements survive native optimization.
- The card overlap no longer depends on the longest pile. Moving a card cannot resize unrelated columns. Face-down cards use a compact overlap; face-up cards retain a readable rank/suit strip. Corner suits sit beside their ranks.
- A dragged sequence lifts together, with source tails temporarily hidden and elevated destination columns. Drop measurements complete before the lifted visual is reset; press and pan no longer both invoke the tap action.

## Mini-games

Garden Match uses continuous orthogonal swipe gestures instead of tapping two cells. A 24%-of-tile/minimum-12-point threshold prevents taps from swapping. Boundary gestures cannot wrap rows. One neighbour swaps at a time, with a 180 ms slide, invalid-swap return, and 110/180 ms resolve/refill fade; reduced motion removes animation duration. Input locks through resolution, preventing repeated swaps while pieces are moving. Screen-reader direction actions share the same swap pipeline. Scoring, turn limits and reward rules are preserved.

Active mini-games use a landscape play area and a separate information/control rail. Garden Match and Tea Time pieces and hidden treasures use authored native vector illustrations rather than emoji. Hidden treasures remain objects in the supplied seasonal scene. Tea Time is still a tap-to-select/tap-to-destination sorting game.

## Logo provenance

`assets/icon.png` and `assets/splash.png` are a new generated storybook illustration derived from the repository's original `public/assets/characters/millie_rabbit.png`, as requested by the user. The original full character remains unchanged. The new rabbit/hat/floral-medallion/card artwork is used for the launcher/splash and in-app logo; it is not a crop of a composite game mockup. `src/MiniArtwork.tsx` contains original native SVG game-piece art. Existing seasonal illustrations and all seven ambient source/raster sprites are retained.

## Verification limits

See TEST_RESULTS.md for executed checks. Component tests exercise native responder callbacks with a timed animation-driver substitute; they are not physical touchscreen tests. Real-device appearance, comfort, gesture feel, orientation/resume/system-bar behavior, performance and safe areas still require device review. No iOS IPA, store release or 60 FPS claim is made.

## 1.7.2 scroll correction

The initial landscape layout incorrectly put the game row inside a disabled outer ScrollView. Its content height could grow beyond the viewport, leaving inner panels without a bounded height and therefore without usable overflow scrolling. The focused game row now sits in a normal flex View with `minHeight: 0`. Each rail, card-board area and mini-game area owns its ScrollView. Menu screens retain one explicitly bounded scrolling container. Android nested scrolling is enabled, and rail content includes bottom padding so the last action is reachable. Card-board scrolling is disabled only while actually dragging a card.

Regression coverage exercises garden, Solitaire, Settings and an active mini-game: focused scroll areas must not have a ScrollView ancestor, menu scrolling remains enabled, and card-board scrolling/nested scrolling remain available when idle. Jest does not calculate actual native overflow, so physical-device scroll behavior still requires confirmation.
