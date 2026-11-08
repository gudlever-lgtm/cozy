# Cozy Solitaire — art integration and design QA (2026-11-08)

## Verified repository changes
- **15 standalone editable SVG assets** live in `assets/cozy-redesign/vectors/`.
- `src/assets/cozyGardenIllustrations.ts` contains literal offline copies for `react-native-svg`.
- Garden/Main Menu, Undo Help and Shimmer badge use selected SVG motifs in actual UI.
- Garden uses its current seasonal art and a blurred edge-to-edge backing layer, preserving existing landscape camera coordinates.
- Native mini-game navigation has been reconnected to `MiniGameHub`.

## Generated raster package (separate from GitHub)
`cozy-production-assets-v2.zip` is an 11.83 MB local deliverable with:
- 73 image files: 12 character poses, 31 garden decorations, 18 UI sprites, 11 card sprites, 1 portrait spring garden background.
- SHA-256 checksums in `asset-manifest.json` (all verified when packaged).
- A source/reference effects sheet that must **not** be used as a runtime sprite.

**The 73 raster image files are NOT in GitHub yet.** Their export source art is provided as a chat artifact; GitHub's active text-oriented connector cannot ingest a local binary ZIP or copy arbitrary local PNG file bytes into a commit. Do not claim them imported until `assets/cozy-redesign/illustrations/` and the generated require() map exist in a commit.

`scripts/import-cozy-graphics.py` supports validated, checksum-protected import and static Expo require() map generation from the supplied ZIP when run in a checked-out repo. It is dry-run by default. Example:

```bash
python3 scripts/import-cozy-graphics.py /path/to/cozy-production-assets-v2.zip --apply
git add assets/cozy-redesign/illustrations src/assets/cozyRedesignImages.ts
```

The import step does **not** automatically replace any gameplay images. Each activation must be independently reviewed.

## Design conformance
- Preserve warm wood / cream / moss green / subdued floral accents and existing Millie/Marmalade character identities.
- Avoid text in raster graphics; all visible labels are rendered through the existing Danish/English i18n system.
- All controls must remain tappable with minimum practical 44 pt touch targets.
- Garden must be edge-to-edge with preserved pan and zoom.
- The new **portrait** garden background is a candidate for future portrait home composition only. Never change the current 836x470 / 1672x941 landscape scene geometry or persistent garden decoration coordinates to use it without camera/layout migration.
- Solitaire must preserve clear foreground contrast and z-index of dragged cards.

## Image quality risks discovered
1. Generated asset sheets contain imperfect alpha halos and occasional bleed from adjacent objects. Each crop requires visual inspection before production use.
2. Some complex garden objects in the first crop pass (pond, signpost, UI ornaments, barrel, trellis) contain artifacts or loose edges. **Block activation** until cleaned or redrawn.
3. Cards must retain stable proportions and accessibility, so decorate their backs without replacing the card engine.
4. Some large raster images cost 0.3–0.5 MB compressed and several MB decoded; use modest display-size derivatives and avoid mounting every possible variant in one screen.
5. Reward effects are a reference sheet only. Existing vector effects should remain active until independent transparent effects are supplied.

## Native QA status
The most recently inspected completed CI run after the navigation changes:
- TypeScript: pass
- `npm test`: pass
- Native suite: **46 failed, 148 passed** (194 total)
- Native export was skipped because native tests failed.

Many native tests still expect older navigation labels and screen flows; investigate individually instead of masking or deleting checks. In particular, verify MiniGameHub, Garden Match, Quest Journal, and decoration screen navigation on physical Android/iOS test devices.

## Deployment gate
Do **not** build/publish an Android APK or release until requested after all artwork activation and CI/test validation are complete.
