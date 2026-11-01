# Repository review — 1.7.13

Review base: `a7f4d2d` (including the concurrent backup recovery and debounced storage changes on main). Android/iOS only. The subsequent `fbfe21f` main-branch economy-history validation fix was also merged and the full checks/builds rerun.

## Findings fixed

- Tea Time difficulty did not increase: minimum legal solutions for the former levels were 7, 7 and 6 moves. New rounds use progressively harder layouts with minimum solutions of 3, 6 and 7 moves. Breadth-first search verifies strict increase and solvability; saved tray layouts are never replaced.
- An unreadable primary and unreadable/missing backup started a fresh game while claiming that a safe backup had been restored. Recovery now distinguishes an actual backup from a fresh start. Before starting fresh, the exact raw primary/backup strings are archived under `cozy.save.unreadable` (numbered slots preserve earlier different snapshots). Identical snapshots are deduplicated. Archive failures reject loading and show the existing retry screen instead of allowing replacement writes. A localized onboarding notice explains a fresh start. Raw archives retain data for possible repair; they do not guarantee that damaged progress can be recovered.
- README and implementation status contained obsolete claims about free materials, repositioning decorations, vector expansion backgrounds and the acceptance APK. Current behavior is documented while historical version notes remain labeled as history.

## Validation

- TypeScript and formatting pass.
- 57 engine/presentation/progression tests pass, including shortest legal Tea solutions, saved-session preservation, actual backup recovery, corruption archival, deduplication, preservation of older archives and failed-archive writes.
- 158 React Native component runs pass across Android/iOS, including the visible corruption notice and actual Tea interaction. Native platform APIs, dimensions and animation timing are mocked.
- Both Android/iOS offline JS/Hermes exports succeed.
- Local Android ARM64 release APK compilation, version/package, signature continuity, ZIP integrity, 16KB alignment and standalone bundle are verified. APK filename and QR destination remain unchanged.

## Not verified / remaining acceptance

No physical Android/iOS device, simulator gameplay, actual touch accuracy, visual approval, memory or 60 FPS measurement is claimed. An iOS JS export is not an IPA. Production signing, store submission and the previously documented SDK dependency-advisory review remain outstanding. The preview APK uses the existing test certificate.
