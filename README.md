# Cozy Solitaire 3.0 — Clean Slate

**Status: DESIGNFASE — INGEN IMPLEMENTERING GODKENDT**

Dette repository er nulstillet fra Cozy 2.x og indeholder nu kun planlægningsmateriale. Alt tidligere spilindhold findes i den særskilte arkivbranch [archive/cozy-v2-final-2026-11-09](https://github.com/gudlever-lgtm/cozy/tree/archive/cozy-v2-final-2026-11-09).

## Produktvision
Et hyggeligt, visuelt gennemført mobilspil, der kombinerer kabale, minispil og en levende have, hvor spillerens fremskridt giver adgang til dekorationer og historier.

## Ikke til forhandling
- **Android og iOS**, fælles kodebase; ingen browser/PWA som produktmål.
- **100 % gratis**, ingen reklamer, mikrotransaktioner eller køb for penge.
- **Lysglimt ✨** er hovedvaluta og optjenes ved at spille; minispil, quests og dekorationer skal kunne opnås uden betaling.
- Dansk og engelsk.
- Have i fuld skærm med **zoom og panorering**.
- Millie og Marmalade samt et reelt avatarvalg.
- Designet skal godkendes **inden** nye gameplay-skærme implementeres.

## Projektets styrende dokumenter
- [DESIGN_CONTRACT.md](DESIGN_CONTRACT.md): designprincipper, validering, godkendelse
- [ROADMAP.md](ROADMAP.md): leverancer, milepæle og acceptkriterier
- [SCREENS.md](SCREENS.md): de skærme, der skal designes, og deres formål
- [DECISIONS.md](DECISIONS.md): besluttede og åbne spørgsmål

## Retning
**Premium Cozy Storybook er et foreløbigt forslag, ikke godkendt design.** Der skabes først detaljerede mockups og en grafisk komponentpakke, som ejeren skal godkende.

## Arbejdsregel
Ingen nye implementationer, APK-builds eller assets til produktionsbrug, før der foreligger et godkendt design. Udvikling sker én skærm ad gangen og bliver sammenlignet visuelt med godkendte referencer. Grønt CI er ikke ensbetydende med visuelt godkendt UI.

## Nuværende tilstand
Dette repository indeholder ikke en byggelig app. Det er bevidst. Gamle GitHub Actions-workflows og buildanmodninger er fjernet fra `main`. Arkivbranchen er read-only reference.
