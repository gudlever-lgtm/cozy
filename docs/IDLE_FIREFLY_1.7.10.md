# Quiet idle guidance — 1.7.10

After 12 seconds without input in an active, unfinished game, one original illustrated firefly enters from the left along a smooth curved path. It pauses at the suggested source, travels to the destination and rests briefly before fading away. Hidden Treasures points to one remaining object. It demonstrates once per idle period, rather than looping while the player thinks.

The supplied transparent 1x/2x/3x firefly artwork is reused through Metro's native asset catalog. Movement runs in Reanimated on the UI thread. There are no opaque panels or new emoji graphics. Solitaire's marker stays near card edges; both ranks and central suit artwork remain readable. Native card/column/stock measurements determine its positions, including the stack picker for collapsed cards. The hint layer has pointerEvents none, is excluded from accessibility navigation and never performs a move or writes a reward/save.

## Gameplay and lifecycle

- Solitaire: use an existing legal move, preferring foundations. If no card move exists, indicate drawing/recycling when available. Finished games have no guide.
- Garden Match: identify one legal adjacent match-producing swap. Preserve its existing swipe controller and independent local animation stages. No hints during gestures, swap/fall processing, completion or exhausted turns.
- Tea Time: a bounded shortest-path search finds a move toward a solution, respecting a selected source. The guide marks the source and receiver. It does not recommend an arbitrary endless back-and-forth pour.
- Hidden Treasures: mark a remaining authored object at its actual scene coordinates; found objects are excluded.
- Touch start clears and suspends the guide; final touch end/cancel starts a fresh delay. Game revisions, active selection changes in Tea Time, modal dialogs and background/resume also cancel/reset it. Canceled asynchronous measurements cannot resurrect a hint. Native measurement failure simply omits the guide.
- Animations Off disables automatic guidance. System/manual reduced motion replaces flight with a stationary transparent gold outline. Even this stationary cue is suppressed in the background. The ordinary manual hint/help controls remain available.
- The guide is available in every season; it is a gameplay helper independent of seasonal ambient species.

## Validation

49 engine/presentation tests and 112 Android/iOS native component test runs pass, alongside TypeScript and formatting. New rule tests verify legal, non-mutating suggestions and solve every Tea difficulty using successive hints. Component tests cover delay, one cue per pause, touch/hold cancellation, revisions, disabled animations, reduced motion, background/resume, canceled asynchronous resolution and missing native measurements. App integration covers touch lifecycle and preserved deal/wallet in Tea Time, plus registered Solitaire source/target measurement resolution. Native animation drivers/layout measurements are substituted in Jest; these are not real rendered-device screenshots or gesture measurements.

Android/iOS JS/Hermes exports and the local ARM64 APK build were executed. Distribution verifies package/version, unchanged test certificate, ZIP integrity, standalone bundle and 16 KB alignment. Version 1.7.10 / Android code and iOS build 11; permanent APK filename and QR payload are unchanged.

Physical-device visual quality, real input feel, frame rate, native screen-reader behavior and iOS IPA remain unverified. No store submission or cloud-environment publication was performed.
