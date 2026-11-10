# Stage 5 Missing Assets — Request for the Graphics Team

None of the items below exist anywhere in `assets/v3/` (confirmed against
`assets/v3/manifest.json`'s full 57-file list). They are not placeholders that need
polishing — they are gaps. Nothing in the current implementation pretends these exist;
where one is needed, the screen either uses a plain, clearly-temporary stand-in (labeled
as such in code comments) or omits the feature rather than faking it.

## 1. Premium illustrated welcome background

**Needed for:** `WelcomeScreen`.
**What exists instead:** `assets/v3/backgrounds/garden-spring.svg`, reused as the Welcome
backdrop. It's a serviceable single-vignette scene (sky, two hills, one house, two trees,
a few flowers) but reads as simple/small, not an atmospheric "premium" full scene — see
`docs/STAGE5_VISUAL_AUDIT.md` §2 for the measured reasoning.
**Ask:** a dedicated welcome illustration — wider scene, more depth (foreground/midground/
background layers), warmer "storybook cover" composition — or, at minimum, confirmation
that reusing the garden background is acceptable for this screen.

## 2. Illustrated "Cozy Solitaire" logotype

**Needed for:** `WelcomeScreen` title.
**What exists instead:** native `Text` reading "Cozy Solitaire", placed inside
`assets/v3/ui/header-banner.svg` (an approved decorative signboard frame already in the
pack, not previously wired to anything). This is a reasonable interim composition, not a
logo — there is no illustrated wordmark, no custom lettering style, no icon mark.
**Ask:** an illustrated logotype (custom lettering and/or a small icon mark) matching the
Premium Cozy Storybook direction.

## 3. Millie — full character illustration

**Needed for:** `WelcomeScreen` (hero art) and `GardenScreen` (a visible character, per the
master prompt and this stage's own requirements).
**What exists instead:** `GardenScreen` renders a plain circular marker with the text
label "Millie" at her stored position — explicitly not character art, by design, so no one
mistakes it for finished art. `assets/v3/avatars/*.svg` are six unrelated animal icons
(bird/cat/fox/hedgehog/owl/rabbit) meant for player profile selection, not this character.
**Ask:** a full illustrated character (standing pose at minimum; idle/ambient animation
frames if Stage 3's `characterAnimation` "idle" state should ever be visible) in the
approved style.

## 4. Marmalade — full character illustration

Same situation and ask as Millie (§3). Currently the same plain labeled-marker treatment.

## 5. Garden/build-mode icons beyond the current set

**Needed for:** a complete Garden build-mode toolbar.
**What exists:** `hammer.svg` (build-mode toggle), `undo.svg` (reused for "rotate" — a
reasonable fit visually but not a purpose-built rotate icon), `close.svg` (remove). There
is no dedicated "move"/"drag" icon, no "confirm placement" icon distinct from a generic
checkmark, and no "zoom to fit"/"recenter camera" icon.
**Ask:** purpose-built icons for rotate, confirm/place and recenter-camera, so build mode
doesn't have to reuse icons whose primary meaning is something else.

## 6. Detailed four-season garden backgrounds (quality, not existence)

The four files (`garden-spring/summer/autumn/winter.svg`) **do exist** and **are used**
(season auto-switches correctly by date, verified live), so this isn't a "missing" item in
the strict sense — it's listed here per this stage's explicit instruction to include it,
cross-referenced to the fuller explanation in `docs/STAGE5_VISUAL_AUDIT.md` §2: each is a
simple single-building vignette, not a rich, explorable garden world. If "the garden should
feel like a world the player can explore" (this stage's own wording) is a hard requirement,
these four need to grow in scope (more varied terrain, planting areas, paths, points of
interest), not just be re-skinned per season.

## 7. Minigame-specific artwork

Not asked for explicitly in this pass, but worth flagging ahead of Stage 5.4: "Blomster-
match" (true match-3, distinct from the existing Memory/Hukommelse game), "Havens
puslespil" (garden puzzle) and "Find forskellen" (spot-the-difference) have **no game-board
or tile artwork at all** yet. Only Memory is real; the other three menu entries will need
either dedicated art or an explicit "not yet available" state rather than a fake "playable"
button, per this stage's own instruction 5.4.

## How this list was produced

Every file in `assets/v3/` was read directly (not inferred from the manifest's `approved`
flag) and cross-checked against what each screen actually imports (`grep` over
`src/**/*.tsx`). Anything the concept clearly calls for for which no file exists at all is
listed above. Items that exist but render poorly (the decoration-scale bug, the button
gradient flicker, etc.) are tracked in `docs/STAGE5_VISUAL_AUDIT.md` instead, since those
are rendering/integration defects, not missing art.
