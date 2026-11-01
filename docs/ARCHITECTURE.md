# Architecture

The app targets Expo React Native on Android and iOS only. `app/` contains the Router entry and safe-area provider. `src/App.tsx` composes screens; gameplay rules stay in pure `src/engine` modules.

| System | Source | Responsibility |
|---|---|---|
| Solitaire | `engine/solitaire.ts` | Deck, moves, history, hints and victory |
| Economy/quests/world | `engine/world.ts` | Ledger, inventory, purchases, prerequisites/objectives and garden placement |
| Expanded world | `engine/progression.ts` | Area gates, buildings, extended stories, relationships, festivals, themes and achievements |
| Challenges | `engine/challenges.ts` | Deterministic Klondike deals with unique reward attempts |
| Mini-game sessions | `engine/session.ts` | Level definitions, solvable sorting variants and persisted puzzle validation |
| Mini-games | `engine/minigames.ts` | Match, sorting and hidden-object rules |
| Persistence/profile | `engine/save.ts` | Versioned save, serialized writes, local identity and language |
| Calendar ambience | `seasonal/season.ts` | Cosmetic season/weather selection |
| Living world | `living/` | Independent Reanimated scene/portrait presentation and motion policy |
| Localization | `i18n/` | Complete DA/EN keys, formatting and fallback |
| Native assets | `assets/images.ts`, `assets/ambient.ts` | Literal bundled references, no browser paths |
| Native platform | Expo plugins, EAS profiles | Icons, permissions, signing/build targets |

Animations receive only cosmetic props. They never read/write decks, rewards, quests or player balances. The game remains playable with animations and audio off. No shared gameplay state is driven by animation completion callbacks.

AsyncStorage contains a single schema-versioned local document. Changes to settings/profile use immutable updates and do not replace unrelated progress. No profile data is sent to a server. See `IMPLEMENTATION_STATUS.md` for implemented versus planned expansion systems.

Schema 3 adds `world` and `miniSession` without resetting earlier profiles, wallets, quests, unlocked forest/cards or deals. Serialized writes keep a last-known-good backup before replacing the primary document. Restore explicitly reports recovery from an older safe copy. `WorldArt.tsx`, `CardArtwork.tsx` and `FestivalDecorations.tsx` are original vector presentation modules; they do not contain game rules.
