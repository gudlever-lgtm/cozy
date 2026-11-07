# Cozy Solitaire – samlet cottage-garden redesign

## Retning og afgrænsning

Denne første komplette version bruger briefen i `cozy-codex-redesign-pack.zip` som designgrundlag. Konceptbilledet er en inspirationsreference, ikke et screenshot eller en pixel-specifikation. Billedets AI-tekst og stjerner som valuta er ikke kopieret. Lysglimt er fortsat den primære valuta; Undo-point er en separat gameplay-ressource. Eksisterende ildfluer, materialer, kabalenøgler, minispil og progression bevares. Der er ingen annoncer eller køb for rigtige penge.

Den eksisterende Expo/React Native-app havde mange lokale farver, store faste paneler, en sidestillet ikonliste i kabalen og flere menuniveauer. Landscape var låst i appkonfigurationen. Det gav meget forskellige visuelle udtryk og vanskeliggjorde portrait og små skærme.

## Designsprog og filer

| Område | Filer og ændringer |
| --- | --- |
| Materialer og tokens | `src/ui/theme.ts`: træ, honning, mos, creme, kontrastfarver, afstande, radius, typografi og skygger. |
| Knapper og original vektorgrafik | `src/ui/CozyButton.tsx`: skalerbart træmateriale med årer, kantlys, bladgrøn primærtilstand, nedtrykt/deaktiveret/valgt tilstand, labels og tællere. |
| Ressourcer | `src/ui/ResourceBadge.tsx`: navngivne, separate Lysglimt- og Undo-balancer. Materialer forbliver materialer. |
| Hjem og have | `src/ui/GardenHome.tsx`, `src/GardenViewport.tsx`, `src/GardenMiniPair.tsx`, `src/MaterialRibbon.tsx`: have til alle kanter, Millie og Marmalade, diskret HUD, primær spilhandling, to minispil, byggeri og tilgængelige zoomknapper. |
| Kabale | `src/ui/GameToolbar.tsx`, `src/App.tsx`, `src/presentation/board.ts`, `src/CardArtwork.tsx`: større kort i lave landscape-visninger, synlige hele åbne sekvenser når der er plads, labelbaseret handlingslinje under brættet, særskilt løft af det aktive træk, botanisk blå kortbagside til Classic. |
| Menu og dialoger | `src/MainMenu.tsx`, `src/ui/UndoHelp.tsx`, `src/App.styles.ts`: én scrollbare menuside, træoverskrift og cremeoverlays, dynamisk højde på Nyt spil, forklaring ved manglende Undo-point og separate karakterdialoger. |
| Byggeri | `src/GardenBuildScreen.tsx`: samme katalog/køb/opgradering/placering; katalog under haven i portrait og ved siden af i landscape. |
| Øvrige skærme | `src/QuestJournal.tsx`, `src/WorldNavigator.tsx`, `src/WorldPanel.tsx`, `src/InventoryPanel.tsx`, `src/ScreenPager.tsx`, `src/JourneyRibbon.tsx`, `src/GardenCollection.tsx`, `src/MiniGameHub.tsx`, `src/TeaTime.tsx`, `src/GameRewardLine.tsx`, `src/AnimationPanel.tsx`, `src/FurnitureControls.tsx`, `src/StackCardPicker.tsx`, `src/ForestGuide.tsx`: fælles creme-/træpalette, kontrast og eksisterende handlinger. |
| Sprog og orientering | `src/i18n/da.ts`, `src/i18n/en.ts`, `app.json`: dansk/engelsk, tydelige Undo-labels og korte indstillingstabs; orientering følger enheden. |
| Udviklingskontrol | `app.config.js`, `scripts/preview-design.js`, `scripts/check-design.ts`, `package.json`: browser-rendering kun til designkontrol. Produktionsplatformene er fortsat Android og iOS. |

## Assets og provenance

Ingen nye bitmapbilleder er nødvendige. Sæsonhaverne i `public/assets/backgrounds/seasons/` og `assets/world/cottage/`, figurerne i `public/assets/characters/`, eksisterende møbler, ressourceillustrationer og minispilsgrafik bruges fortsat offline.

Det nye træmateriale er original, deterministisk SVG-grafik i `Timber`-komponenten: gradient, træårer og kantlys tegnes i native skærmstørrelse. Kortbagsiden bruger den eksisterende botaniske vektortegning med en ny blå palette. Konceptbilledet pakkes ikke ind i appen og bruges ikke som en baggrund med indbrændt tekst.

## Funktioner der er bevaret

Selve redesignet ændrer ikke spilreglerne. De nyere avatarfelter og deres gemmemigrering fra main er bevaret. Save-format, profil-ID, migrering, backup, transaktionskvitteringer, økonomi, progression, regler for de tre kabaletyper, stock/waste, grundbunker, lovlige træk, hints, minispilspar, optjente træk, quests, historier, bygninger og belønninger er bevaret. Layoutberegningen er præsentationskode og ændrer ikke kortenes placering i spillets logiske tilstand.

Fortryd viser en forklaring ved nul Undo-point. Den bruger ikke Lysglimt i stedet. Nyt spil er altid en aktiv handling; eventuelle konkrete adgangskrav til det valgte spil vises inde i dialogen. Auto-afslutning har samme sikkerhedskrav som engine-funktionen. Den eksisterende stack-picker bruges stadig, når alle kort ikke kan vises læseligt samtidigt.

Havekameraet ændrer kun scenen. HUD, minispil, navigation og ressourcer følger ikke zoom/pan. Safe-area-insets er reserveret for handlingerne; selve havebilledet må gå helt til kanten. Byggeri og dialoger tager højde for safe area og korte skærme. Havebygning bruger hele skærmen som arbejdsområde til samme scene og placerede ting som forsiden. Kataloget ligger ovenpå og kan skjules uden at ændre scenens størrelse. Zoomknapper og pinch virker også under bygning; touch-flytning omregnes med kameraets zoom, så gemte positioner følger haven.

## Reproducerbar designkontrol

```sh
npm ci
npm run preview:design -- --port 8083
# I en separat terminal med Chromium installeret:
npm run test:design
```

`CHROMIUM_PATH` kan vælge en anden installeret Chromium-binær. `COZY_PREVIEW_URL` kan vælge en anden lokal serveradresse. React Native Web, React DOM og Playwright er udviklingsafhængigheder; browser-target aktiveres kun af preview-scriptet. Der er ikke udgivet en hjemmeside.

Designkontrollen bruger lokale, konstruerede saves. Den tager 54 skærmbilleder under ignoreret `work/design-checks/` i 320×568, 568×320, 390×844, 844×390 og 1024×768. Den kontrollerer overlap mellem de vigtigste havehandlinger og mellem bræt, kabaleknapper og navigation. Have, kabale, dialog, menu, indstillinger, quests, lager, byggeri og minispil renderes. Et faktisk touch-træk, Fortryd og genindlæsning kontrollerer også korttilstand og bevarede balancer.

## Validering og kendte begrænsninger

- TypeScript og formattering af ændrede kildefiler kontrolleres.
- 90 logiktests består, inklusive den nye kontrol af fulde åbne sekvenser i portrait.
- Browserkontrollen består i fem størrelser, med 54 skærmbilleder, ingen registrerede JavaScript-fejl, ingen fundne overlap i de testede områder og bestået touch-træk/Fortryd/gem/genindlæs.
- De 20 native kernesuiter består på Android og iOS: 100 tests for have, minispilspar, fuldskærm, layout, byggeri, Undo-hjælp, matcher, te, animationer og idle guides. Seks yderligere fokuserede kontroller af kortspil/profil, auto-afslutning og modal-navigation består også.
- Den samlede native kørsel: 138 beståede og 48 fejlede tests (22 suiter). Fejlene ligger i `tests/native/app.test.tsx` på iOS og Android og omfatter gamle minispils-, menu- og dekorationsflows.
- Den historiske `tests/native/app.test.tsx` indeholder stadig scenarier for den gamle frie minispilsmenu, de tidligere menugrupper og de gamle dekorationssider. Den samlede gamle native suite var allerede ikke grøn før redesignet. Disse tests er ikke skjult eller slået fra. De nye relevante navigations- og bevaringskontroller er opdateret til det aktuelle produktflow.
- JS/Hermes-eksport til både Android og iOS består. En native JS/Hermes-eksport er ikke det samme som en installeret, fysisk enhedstest. Touch, safe area og visuel finjustering skal fortsat godkendes på faktiske Android-/iOS-enheder. Der er ikke bygget eller udgivet en ny APK i denne ændring.

### Fuldskærmsrettelse til havebygning

Kataloget optager ikke længere plads ved siden af eller under scenen. Byggeri, køb, flytning og visningen efter “Færdig” bruger samme sceneareal. Havekameraet kan zoome fra 50 til 280 procent, nulstilles og panoreres, og baggrund og dekorationer transformeres sammen. Et træk i en dekoration overtages ikke af kameraets panorering. Skærmens trækafstand divideres med zoom før placeringen gemmes.

Kontrolleret med 20 fokuserede native-tests på Android/iOS og browserkontrollen ovenfor, inklusive touch-flytning ved 200 procent zoom, pinch og genindlæsning af den gemte placering. Fysisk enhedstest er fortsat ikke udført.

### Hele billedet ved 100 procent

Kameraets 100 procent er nu et fit af hele sæsonbilledet i det tilgængelige vindue, med originalt højde/bredde-forhold. Scenen bruger billedets oprindelige koordinater, og baggrund og ting skaleres sammen. I portrait giver det rolige felter over og under det brede billede. Zoom ud virker også fra 100 procent til 75 og 50 procent; nulstilling viser hele haven igen. Instruktioner bliver i skærmstørrelse uden for billedfladen.

Kontrolleret i fem størrelser på både forside og byggeri: alle fire billedkanter er inden for vinduet ved 100 procent, og billedet bliver mindre ved zoom ud. 92 logiktests og 20 fokuserede native-tests består; touch-flytning ved zoom og genindlæsning af placeringer består fortsat. Ikke afprøvet på fysisk enhed i denne session.
