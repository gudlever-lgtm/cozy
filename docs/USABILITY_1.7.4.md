# Usability and original artwork integration — 1.7.4

## Presentation and input changes

- Hints/notifications are root HUD siblings of the game viewport, above elevated cards, with touch-through space outside the notice. Icon labels do not obscure an active hint. Help, stack picking, challenges and confirmations share one native Modal window, with priority and Android Back dismissal, so they cannot render behind the board or compete as multiple iOS presentations.
- Garden Match has one board-level captured touch responder. Individual illustrated tiles do not compete for touch events. Its central play area has no ScrollView ancestor and fits its measured width/height. Swipes retain paced slide/invalid-return/refill animations and input locking. Fresh boards are guaranteed to contain a legal swap without free starting matches. The piece art is drawn from the original resource atlas.
- Solitaire drop resolution uses the final release point and dragged-card footprint. Overlap with a legal target can succeed when the finger is outside the slot, with largest overlap taking priority. Source measurement, actual release delta, frozen gesture callbacks and game-move guards prevent stale gestures from moving a different card. Rules and undo still use the existing game engine.
- Card faces have one large central suit instead of rank-count pip clusters and court ornamentation. Rank remains in both corners. Hearts/diamonds have a stronger red, clubs/spades a dark green-black. Collapsed-column headers retain rank and suit.
- Inventory uses five compact resource fields with count-first presentation; resource descriptions appear on tap. Purchased items are separate from the wallet. Scrollable content has a persistent amber high-contrast scrollbar only when it actually overflows. Scroll offset updates Animated values rather than React state each frame.

## Artwork

The supplied `ui_icons_sheet.png` (1254×1254, 3×3 isolated icons) supplies cottage, quests, weather/world, settings, hint, undo and shuffle art. The supplied `resources_sheet.png` (1254×1254, reviewed isolated rows) supplies the luminous Glimmer fairy, wood, stone, flower bouquet, seeds and other garden pieces. `ArtIcon.tsx` clips reviewed source rectangles natively from cached images; the original files are unchanged. No composite mockup or UI text is cropped. Native vector cards remain custom because no separated original playable-card asset was supplied.

Seasonal illustrations, Millie/Marmalade and all seven ambient sprites remain bundled offline. The existing Millie-derived logo is retained. Source art is not replaced by platform emoji for the updated icons and Garden Match pieces.

## Executed checks and limits

- TypeScript and formatting pass.
- 42 engine/presentation tests pass, including card-footprint drops and 100 generated Garden Match starts with a legal swap and no free match.
- 52 native component tests pass across Android/iOS: HUD ancestry/order, one native modal/Back, measured layout, board-owned swipe callbacks/locking/rejection/victory, no scroll ancestor around the swipe surface, compact wallet/original icon integration, persistent overflow indicator and one central suit for each card suit.
- Android and iOS native JS/Hermes exports pass.
- Local ARM64 Android Gradle APK build succeeds, app version 1.7.4 / versionCode 5; test signing retained for upgrade compatibility.
- Physical device gesture feel, native rendered appearance, OEM safe areas/system bars and FPS remain unverified. Component callbacks and animation-driver substitutes are not touchscreen/device testing. No EAS job, iOS IPA or store-readiness claim.

The public preview always uses `cozy-solitaire.apk` on `android-download`, with the permanent QR payload documented in APK_DISTRIBUTION.md.
