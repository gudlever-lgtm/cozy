# Android APK-opdateringer

Cozy Solitaire kontrollerer versionsfilen ved opstart og har en knap under **Indstillinger → Søg efter opdatering**. Kun Android: brugeren vælger at åbne download, hvorefter Android selv kræver godkendelse af installation.

Upload først den færdige APK til `https://dulmens.dk/downloads/cozy.apk`, og publicér derefter `https://dulmens.dk/downloads/cozy.json`:

```json
{"version":"3.0.0","apkUrl":"https://dulmens.dk/downloads/cozy.apk"}
```

Hæv `expo.version` og `expo.android.versionCode` i `mobile/app.json` ved næste udgivelse. JSON-versionen skal passe med den APK, du faktisk har uploadet. Hvis appen skal kunne opdateres uden afinstallation, skal package ID (`eu.cozy.solitaire`) og Android-signering forblive uændret. Ellers går installerede data tabt ved afinstallation. På nogle enheder skal installation af APK'er fra browseren først tillades.

Denne kode uploader ikke APK/JSON til serveren og bygger ikke en APK.
