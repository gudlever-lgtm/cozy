# Play defaults and feedback — 1.7.7

New free Klondike deals default to draw-three in both the game factory and the next-deal Settings selection. Explicit draw-one remains available, seeded challenges retain their authored modes, and existing saved deals keep their current draw mode and cards.

Solitaire now has its own sparse seasonal particle surface between the felt and interactive cards. Board mode omits birds/butterflies/vegetation, caps simultaneous objects to 2/4/6 by quality, clips only the decorative layer, and disables cottage-window lighting. It follows the same animation, intensity, background and reduced-motion policies. Its pointer-events-none layer is below stock/foundations and tableau, so it cannot cover ranks or intercept card gestures. The surrounding world ambience remains independent.

Gather supplies still grants one wood and one stone and increments the gather objective counter. It does not grant Glimmers. The action now shows a localized, tap-dismissable 2.5-second confirmation with the actual resource gain.

Executed: TypeScript and formatting passed; 45 engine/presentation and 72 Android/iOS native component tests passed. Existing deal tests now verify the default three-card draw and explicit one-card option. Native coverage checks sparse board layering/no input capture, drawing/undo with effects, animation-off behavior, resource feedback, exact wood/stone gain, preserved Glimmers and unchanged active deal. Android/iOS native JS exports passed; local ARM64 APK build succeeded in 55 seconds.

Actual device animation visibility, frame rate, touch comfort and appearance remain unverified. Internal app version 1.7.7 / Android versionCode 8; permanent APK filename/QR are unchanged.
