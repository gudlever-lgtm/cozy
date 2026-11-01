# Release checklist

- [x] Android/iOS-only Expo configuration; no Web/PWA target
- [x] Versioned offline saves and DA/EN local profiles
- [x] Native static references for supplied seasonal/NPC/ambient art
- [x] Transparent 1x/2x/3x ambient sprite derivatives and source provenance
- [x] Automated gameplay, economy, profile and living-world policy tests available
- [x] Expanded world systems, session recovery and progression tests implemented
- [ ] Complete native/device acceptance criteria (see implementation status)
- [ ] Resolve reviewed SDK/toolchain dependency advisories before production release
- [ ] Verify local APK compilation, signature, bundled assets and package manifest
- [ ] Link authorized Expo project and configure secure signing credentials
- [ ] Successful EAS Android production AAB job
- [ ] Successful EAS iOS production IPA job
- [ ] Physical Android/iPhone/tablet gesture, offline/restart, sound and accessibility QA
- [ ] Measure frame time, memory and pause/resume on representative low-end devices
- [ ] Approve artwork resolution and obtain exact foreground masks if full tree occlusion is required
- [x] Draft DA/EN descriptions, privacy information and development release notes
- [ ] Capture and approve actual device/store screenshots and final publisher metadata
- [ ] Explicit authorization before store submission or paid build services

No store-ready or 60 FPS claim is made from mocked component tests or JavaScript exports. Do not commit signing keys. Cloud environment publication is not part of this work.
