# Card picker and world-map clarity — 1.7.6

## Feedback addressed

The supplied phone screenshot showed the stack picker list compressed into a very short viewport between a large title, instructions and Close button. The new picker has a measured card row, a compact header/close target, full card faces and previous/next pages. It has no scrolling text list. Accessibility hints retain the move explanation without consuming visual card space. Selecting an intermediate card still moves its original indexed suffix through the existing Solitaire engine.

The world screenshot showed several tall locked-area panels with generic prerequisite text. The default world map now uses compact screen-sized area pages with short statuses. A locked area's hint opens a precise next-step dialog: missing previous area, actual quest, actual story and owned/required materials. Its action leads to the relevant area, quest journal, story or resource-earning activity. Visit and Manage are distinct; the engine still enforces all existing costs/prerequisites.

Area management has separate icon tabs for buildings, stories, festivals, card designs and achievements. Existing progression actions remain available without displaying every section in one long overview. Deliberate detail panels retain the high-contrast overflow indicator.

## Appearance and motion

The map header has direct card-design and animation shortcuts. Card-design pages show an actual card-back preview, cost and active-state label. Choosing a theme updates the current game's rendering immediately without changing its cards, progress or rules.

The animation panel shows the original seasonal artwork with a live, shortened-delay ambient preview, manual/calendar season thumbnails, animation/motion toggles, weather intensity and density. Its status explains disabled animation, system reduced motion, manual reduced motion, background pause or zero weather effects. Preview motion still respects system accessibility/background policy.

A system reduced-motion query was previously copied into the saved manual preference on every load, potentially latching that preference after a temporary system setting. Loading no longer writes the system flag into the manual setting. Motion hooks query current system state and observe changes live. Existing manual preferences are retained rather than guessed or silently cleared. Garden Match also observes the live system preference.

## Executed verification

- TypeScript and formatting pass.
- 45 engine/presentation tests pass, including full-card picker geometry and viewport paging.
- 68 Android/iOS native component tests pass. New coverage checks full-sized picker pagination/selection, compact world navigation and precise quest guidance, area purchase/build/story preservation, card-theme purchase/application, seasonal switching and persisted animation controls without latching system preference.
- Physical device rendering, motion visibility, touch comfort, system bars and performance remain unverified. The screenshots are evidence of the reported previous build, not verification of this fix. Native component tests and preview wiring do not prove GPU-rendered animation on hardware.

Public APK keeps the permanent filename and QR URL. App version is 1.7.6 / Android versionCode 7.
