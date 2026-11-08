import React from "react";
import { AccessibilityInfo, Animated, AppState } from "react-native";
import {
  act,
  renderAsync,
  within,
  screen,
  fireEvent,
  waitFor,
  cleanupAsync,
} from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pour, teaWon, hasMatchMove } from "../../src/engine/minigames";
import { teaForLevel, matchForLevel, type MiniLevel, type MiniKind } from "../../src/engine/session";
import App from "../../src/App";
import { TeaTime } from "../../src/TeaTime";
import { IdleFirefly, IDLE_HINT_DELAY } from "../../src/living/IdleFirefly";
import { newGame } from "../../src/engine/solitaire";
import { miniPair } from "../../src/engine/miniProgress";
import { solitaireIdleHint } from "../../src/presentation/idleHints";
import i18n from "../../src/i18n";
import { fresh, setProfile, SAVE_KEY } from "../../src/engine/save";

beforeEach(async () => {
  await AsyncStorage.clear();
  await i18n.changeLanguage("en");
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(true);
});
afterEach(async () => {
  await cleanupAsync();
  jest.restoreAllMocks();
});
function grantMiniMoves<T extends ReturnType<typeof fresh>>(save: T, moves = 30): T {
  save.miniProgress.slots = save.miniProgress.slots.map((slot) => ({
    ...slot,
    moves,
  }));
  return save;
}
function withSavedMini<T extends ReturnType<typeof fresh>>(
  save: T,
  kind: MiniKind,
  level: MiniLevel = 1,
): T {
  // Slots are earned through Solitaire. The first two are Match/Hidden;
  // Tea appears in round 1. Resume must retain its actual slot and moves.
  const round = kind === "tea" ? 1 : 0;
  save.miniProgress.round = round;
  save.miniProgress.slots = miniPair(round).map((slot) => ({
    ...slot,
    moves: 100,
    session: {
      ...slot.session,
      level,
      match: matchForLevel(level),
      tea: teaForLevel(level),
    },
  }));
  const slot = save.miniProgress.slots.find((slot) => slot.session.kind === kind);
  if (!slot) throw Error("Missing earned mini-game slot: " + kind);
  save.miniSession = { ...slot.session };
  return save;
}
async function stored() {
  return JSON.parse((await AsyncStorage.getItem(SAVE_KEY))!);
}
function press(name: string) {
  let matches = [
    ...screen.queryAllByRole("button", { name }),
    ...screen.queryAllByRole("tab", { name }),
  ];
  if (!matches.length) {
    const routes = [
      { id: "world", icon: "◇", group: "menuGarden" },
      { id: "quests", icon: "☷", group: "menuGarden" },
      { id: "decorations", icon: "❀", group: "menuGarden" },
      { id: "inventory", icon: "▧", group: "materials" },
      { id: "statistics", icon: "↗", group: "menuPlayer" },
      { id: "settings", icon: "⚙", group: "menuPlayer" },
      { id: "mini", icon: "✿", group: "menuGames" },
    ];
    const route = routes.find((r) => r.icon + " " + i18n.t(r.id) === name);
    const extra = [
      "help",
      "restart",
      "newGame",
      "challengeTitle",
      "gather",
      "exploreForest",
    ].some((key) => i18n.t(key) === name);
    if (route || extra) {
      fireEvent.press(
        screen.getByRole("button", { name: String(i18n.t("mainMenu")) }),
      );
      if (route) {
        fireEvent.press(screen.getByTestId(`menu-${route.id}`));
        return;
      }
      matches = screen.queryAllByRole("button", { name });
    }
  }
  if (!matches.length) throw new Error("Missing control: " + name);
  fireEvent.press(matches[0]);
}

test("native first launch requires a valid local username and preserves its language", async () => {
  await renderAsync(<App />);
  await screen.findByText("Make yourself at home");
  expect(
    screen.getByRole("button", { name: "Confirm player name" }),
  ).toBeDisabled();
  fireEvent.changeText(screen.getByLabelText("Player name"), "Åse Native");
  press("Confirm player name");
  await screen.findByTestId("main-tabs");
  await waitFor(async () =>
    expect((await stored()).profile.username).toBe("Åse Native"),
  );
});

test("native draw/undo, live localization and profile editing retain the active deal", async () => {
  const initial = setProfile(
    fresh("native-deal", "en"),
    "Åse Native",
    "player",
  );
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("♠ Play Solitaire");
  press("Draw cards");
  await screen.findByText("1 move");
  await waitFor(async () =>
    expect((await stored()).game.waste).toHaveLength(3),
  );
  press("Undo");
  await screen.findByText("0 moves");
  press("Draw cards");
  await waitFor(async () => expect((await stored()).game.moves).toBe(1));
  const game = (await stored()).game;
  press("⚙ Settings");
  press("Dansk");
  await screen.findByText("Spillerprofil");
  fireEvent.changeText(screen.getByLabelText("Spillernavn"), "Øster Native");
  press("Gem spillernavn");
  press("♠ Spil kabale");
  await screen.findByText("1 træk");
  await waitFor(async () => {
    const save = await stored();
    expect(save.profile.username).toBe("Øster Native");
    expect(save.profile.id).toBe("player");
    expect(save.preferences.language).toBe("da");
    expect(save.game).toEqual(game);
  });
  await cleanupAsync();
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("♠ Spil kabale");
  await screen.findByText("1 træk");
});

test("native hidden-object completion grants its reward once and survives restart", async () => {
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(grantMiniMoves(setProfile(fresh("native", "en"), "Pip Native", "p"))),
  );
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("✿ Mini-games");
  fireEvent.press(screen.getByTestId("mini-start-hidden"));
  for (const name of ["Key", "Acorn", "Ribbon", "Spoon", "Button"]) press(name);
  await screen.findByText("Beautifully done! +20 Glimmers");
  await waitFor(async () =>
    expect((await stored()).economy.wallet.glimmers).toBe(20),
  );
  await cleanupAsync();
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  expect(screen.getByLabelText("✦ 20 Glimmers")).toBeOnTheScreen();
  expect((await stored()).counters.hidden).toBe(1);
});

test("native save without a profile migrates through onboarding without losing resources", async () => {
  const old = fresh("legacy", "da");
  old.economy.wallet.glimmers = 75;
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify({ ...old, version: 1 }));
  await renderAsync(<App />);
  await screen.findByText("Føl dig hjemme");
  fireEvent.changeText(screen.getByLabelText("Spillernavn"), "Ægir Have");
  press("Bekræft spillernavn");
  await screen.findByTestId("main-tabs");
  await waitFor(async () => {
    const save = await stored();
    expect(save.economy.wallet.glimmers).toBe(75);
    expect(save.game.id).toBe("legacy");
    expect(save.version).toBe(4);
  });
});

test("native ambience settings persist independently of game, balances and profile", async () => {
  const initial = setProfile(
    fresh("stable-deal", "en"),
    "Living Garden",
    "stable-player",
  );
  initial.economy.wallet.glimmers = 81;
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("⚙ Settings");
  fireEvent.press(
    screen.getByRole("tab", { name: "Appearance and animations" }),
  );
  press("Animation quality: Low");
  press("Animations: On");
  await waitFor(async () => {
    const saved = await stored();
    expect(saved.preferences.animationQuality).toBe("low");
    expect(saved.preferences.animations).toBe(false);
    expect(saved.game).toEqual(initial.game);
    expect(saved.economy).toEqual(initial.economy);
    expect(saved.profile.id).toBe("stable-player");
  });
  await cleanupAsync();
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("⚙ Settings");
  fireEvent.press(
    screen.getByRole("tab", { name: "Appearance and animations" }),
  );
  expect(
    screen.getByRole("button", { name: "Animations: Off" }),
  ).toBeOnTheScreen();
  expect(
    screen.getByRole("button", { name: "Animation quality: Low" }),
  ).toBeSelected();
});

test("native partial hidden puzzle resumes at its level and cannot pay twice after restarting", async () => {
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(
      setProfile(fresh("mini-save", "en"), "Puzzle Gardener", "mini-player"),
    ),
  );
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("✿ Mini-games");
  press("Level 3");
  fireEvent.press(screen.getByTestId("mini-start-hidden"));
  press("Key");
  await waitFor(async () => {
    const s = await stored();
    expect(s.miniSession.found).toContain("key");
    expect(s.miniSession.level).toBe(3);
  });
  press("Back");
  press("Level 1");
  press("Resume saved puzzle");
  expect(screen.queryByRole("button", { name: "Key" })).toBeNull();
  await waitFor(async () => expect((await stored()).miniSession.level).toBe(3));
  await cleanupAsync();
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("✿ Mini-games");
  press("Resume saved puzzle");
  expect(screen.queryByRole("button", { name: "Key" })).toBeNull();
  for (const name of ["Acorn", "Ribbon", "Spoon", "Button"]) press(name);
  await screen.findByText("Beautifully done! +20 Glimmers");
  await waitFor(async () =>
    expect((await stored()).economy.wallet.glimmers).toBe(20),
  );
  await cleanupAsync();
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("✿ Mini-games");
  press("Resume saved puzzle");
  await screen.findByText("Beautifully done! +20 Glimmers");
  expect((await stored()).economy.wallet.glimmers).toBe(20);
});

test("native world area purchase, visible building upgrade and story reward persist without changing Solitaire", async () => {
  const original = setProfile(
    fresh("world-deal", "en"),
    "World Gardener",
    "world-player",
  );
  original.completed = [
    "pip1",
    "pip2",
    "millie1",
    "millie2",
    "marmalade1",
    "marmalade2",
  ];
  original.counters = {
    solitaire: 10,
    match: 10,
    hidden: 10,
    tea: 10,
    gather: 10,
  };
  original.economy.wallet = {
    glimmers: 320,
    wood: 20,
    stone: 20,
    flowers: 20,
    seeds: 20,
  };
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(original));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("◇ World Map");
  fireEvent.press(
    within(screen.getByTestId("world-area-forest")).getByRole("button", {
      name: "Open the path",
    }),
  );
  await screen.findByText("Forest greenhouse");
  fireEvent.press(
    within(screen.getByTestId("world-building-greenhouse")).getByRole(
      "button",
      {
        name: "Improve · 0 / 3",
      },
    ),
  );
  press("Stories along the path");
  fireEvent.press(
    within(screen.getByTestId("world-story-forest1")).getByRole("button", {
      name: "Collect reward",
    }),
  );
  await waitFor(async () => {
    const s = await stored();
    expect(s.world.area).toBe("forest");
    expect(s.world.buildings.greenhouse).toBe(1);
    expect(s.world.stories).toContain("forest1");
    expect(s.economy.wallet.glimmers).toBe(270);
    expect(s.game).toEqual(original.game);
  });
  await cleanupAsync();
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("◇ World Map");
  fireEvent.press(
    within(screen.getByTestId("world-area-forest")).getByRole("button", {
      name: "Manage area",
    }),
  );
  expect(screen.getByText("Forest greenhouse")).toBeOnTheScreen();
  expect((await stored()).world.buildings.greenhouse).toBe(1);
});

test("native illustrated card deal safely completes and pays a victory once across undo", async () => {
  const { suits, snapshot } = require("../../src/engine/solitaire");
  const s = setProfile(fresh("ending", "en"), "Card Gardener", "card-player");
  const card = (rank: number, suit: string) => ({
    id: suit + rank,
    rank,
    suit,
    up: true,
  });
  s.game.stock = [];
  s.game.waste = [];
  s.game.foundations = suits.map((suit: string) =>
    Array.from({ length: 12 }, (_, i) => card(i + 1, suit)),
  );
  s.game.tableau = [
    ...suits.map((suit: string) => [card(13, suit)]),
    [],
    [],
    [],
  ];
  s.game.initial = snapshot(s.game);
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(s));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("♠ Play Solitaire");
  press(String(i18n.t("auto")));
  await screen.findByText("A lovely win!");
  await waitFor(async () =>
    expect((await stored()).economy.wallet.glimmers).toBe(60),
  );
  press("Undo");
  press(String(i18n.t("auto")));
  await screen.findByText("A lovely win!");
  expect((await stored()).counters.solitaire).toBe(1);
});

test("double tap promotes exposed ace and two to foundations; undo retains the original deal", async () => {
  const initial = setProfile(fresh("double-tap", "en"), "Cozy Native", "p");
  function expose(rank: number) {
    for (const pile of [
      initial.game.stock,
      initial.game.waste,
      ...initial.game.tableau,
      ...initial.game.foundations,
    ]) {
      const i = pile.findIndex((c) => c.rank === rank && c.suit === "♥");
      if (i >= 0) {
        const [c] = pile.splice(i, 1);
        initial.game.waste.push({ ...c, up: true });
        return;
      }
    }
  }
  expose(2);
  expose(1);
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("♠ Play Solitaire");
  const board = screen.getByTestId("solitaire-board");
  expect(within(board).queryByRole("button", { name: "Undo" })).toBeNull();
  press("Ace of hearts");
  await waitFor(async () => expect((await stored()).game.moves).toBe(0));
  press("Ace of hearts");
  await waitFor(async () =>
    expect(
      (await stored()).game.foundations.some(
        (p: any[]) => p.at(-1)?.rank === 1,
      ),
    ).toBe(true),
  );
  press("2 of hearts");
  press("2 of hearts");
  await waitFor(async () =>
    expect(
      (await stored()).game.foundations.some(
        (p: any[]) => p.at(-1)?.rank === 2,
      ),
    ).toBe(true),
  );
  press("Undo");
  press("Undo");
  await waitFor(async () =>
    expect((await stored()).game.waste).toEqual(initial.game.waste),
  );
});

test.each([1, 2, 3] as MiniLevel[])(
  "Tea Time level %s completes, persists and pays only once through native controls",
  async (level) => {
    await AsyncStorage.setItem(
      SAVE_KEY,
      JSON.stringify(setProfile(fresh("tea-native", "en"), "Tea Native", "p")),
    );
    await renderAsync(<App />);
    await screen.findByTestId("main-tabs");
    press("✿ Mini-games");
    press(`Level ${level}`);
    fireEvent.press(screen.getByTestId("mini-start-tea"));
    const queue: { cups: number[][]; path: number[][] }[] = [
      { cups: screen.UNSAFE_getByType(TeaTime).props.game, path: [] },
    ];
    const seen = new Set<string>();
    let path: number[][] = [];
    while (queue.length) {
      const node = queue.shift()!;
      if (teaWon(node.cups)) {
        path = node.path;
        break;
      }
      for (let a = 0; a < 5; a++)
        for (let b = 0; b < 5; b++) {
          const next = pour(node.cups, a, b),
            key = JSON.stringify(next);
          if (next !== node.cups && !seen.has(key)) {
            seen.add(key);
            queue.push({ cups: next, path: [...node.path, [a, b]] });
          }
        }
    }
    expect(path.length).toBeGreaterThan(0);
    for (const [a, b] of path) {
      press(`Tray ${a + 1}`);
      press(`Tray ${b + 1}`);
    }
    await screen.findByText("Beautifully done! +20 Glimmers");
    await waitFor(async () => expect((await stored()).counters.tea).toBe(1));
    expect((await stored()).world.medals).toContain(`tea:${level}`);
    const game = (await stored()).game;
    await cleanupAsync();
    await renderAsync(<App />);
    await screen.findByTestId("main-tabs");
    press("✿ Mini-games");
    press("Resume saved puzzle");
    expect(screen.getByRole("button", { name: "Tray 1" })).toBeDisabled();
    expect((await stored()).economy.wallet.glimmers).toBe(20);
    expect((await stored()).game).toEqual(game);
  },
);

test("game panels scroll in a bounded viewport; oversized menu screens retain their own scroll", async () => {
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(grantMiniMoves(setProfile(fresh("scroll", "en"), "Scroll Native", "p"))),
  );
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  function expectBoundedGame() {
    const viewport = screen.getByTestId("game-viewport");
    expect(viewport).toHaveStyle({ flex: 1, minHeight: 0 });
    expect(screen.queryByTestId("screen-scroll")).toBeNull();
    let ancestor = viewport.parent;
    while (ancestor) {
      expect(["ScrollView", "RCTScrollView"]).not.toContain(ancestor.type);
      ancestor = ancestor.parent;
    }
  }
  expectBoundedGame();
  press("♠ Play Solitaire");
  expectBoundedGame();
  expect(screen.getByTestId("card-board-viewport")).toHaveStyle({
    flex: 1,
    minHeight: 0,
  });
  expect(screen.queryByTestId("card-board-scroll")).toBeNull();
  press("⚙ Settings");
  expect(screen.getByTestId("settings-scroll").props.scrollEnabled).not.toBe(
    false,
  );
  fireEvent.press(screen.getByRole("tab", { name: "Next deal" }));
  expect(screen.getByRole("button", { name: "Draw three" })).toBeOnTheScreen();
  press("✿ Mini-games");
  fireEvent.press(screen.getByTestId("mini-start-match"));
  expectBoundedGame();
  expect(screen.getByTestId("garden-match-board")).toBeOnTheScreen();
  let boardParent = screen.getByTestId("garden-match-board").parent;
  while (boardParent) {
    expect(["ScrollView", "RCTScrollView"]).not.toContain(boardParent.type);
    boardParent = boardParent.parent;
  }
});

test("three main controls navigate through localized submenus and retain timed labels", async () => {
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(setProfile(fresh("tabs", "en"), "Tabs Native", "p")),
  );
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  expect(
    within(screen.getByTestId("main-tabs")).getAllByRole("button"),
  ).toHaveLength(4);
  expect(screen.queryByText("Cozy Solitaire")).toBeNull();
  press("♠ Play Solitaire");
  expect(
    screen.getByRole("button", { name: "♠ Play Solitaire" }).props
      .accessibilityState.selected,
  ).toBe(true);
  expect(screen.getByTestId("solitaire-board")).toBeOnTheScreen();
  press("⌂ My Garden");
  expect(screen.getByTestId("garden-fullscreen")).toBeOnTheScreen();
});

test("Solitaire responds to the real board viewport and keeps a long column's bottom card visible", async () => {
  const initial = setProfile(fresh("fit-native", "en"), "Compact Native", "p");
  const deck = [
    ...initial.game.stock,
    ...initial.game.waste,
    ...initial.game.tableau.flat(),
  ];
  const sequence = Array.from({ length: 13 }, (_, i) => {
    const rank = 13 - i;
    return deck.find((c) => c.rank === rank && c.suit === (i % 2 ? "♥" : "♠"))!;
  });
  const rest = deck.filter((c) => !sequence.some((s) => s.id === c.id));
  const targetIndex = rest.findIndex((c) => c.rank === 13 && c.suit === "♣");
  const [target] = rest.splice(targetIndex, 1);
  const hidden = rest.splice(0, 6).map((c) => ({ ...c, up: false }));
  initial.game.tableau = [
    [{ ...target, up: true }],
    [],
    [],
    [],
    [],
    [],
    [...hidden, ...sequence.map((c) => ({ ...c, up: true }))],
  ];
  initial.game.stock = rest;
  initial.game.waste = [];
  initial.game.foundations = [[], [], [], []];
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("♠ Play Solitaire");
  fireEvent(screen.getByTestId("card-board-viewport"), "layout", {
    nativeEvent: { layout: { x: 0, y: 0, width: 414, height: 190 } },
  });
  const last = screen.getByTestId(`playing-card-${sequence.at(-1)!.id}`);
  const { StyleSheet } = require("react-native");
  const style = StyleSheet.flatten(last.props.style);
  expect(style.position).toBe("absolute");
  // 190 minus board padding, top stock/foundation card, and the row gap.
  const available = 190 - 20 - style.height - 8;
  expect(style.top + style.height).toBeLessThanOrEqual(available + 0.001);
  expect(screen.queryByTestId("card-board-scroll")).toBeNull();
  await waitFor(async () =>
    expect((await stored()).game.tableau[6]).toHaveLength(19),
  );
  expect(screen.queryByTestId(`playing-card-${sequence[1].id}`)).toBeNull();
  press("Show 11 stacked cards");
  press("Queen of hearts");
  press("King of clubs");
  await waitFor(async () => {
    const game = (await stored()).game;
    expect(game.moves).toBe(1);
    expect(game.tableau[0]).toHaveLength(13);
    expect(game.tableau[6]).toHaveLength(7);
  });
  press("Undo");
  await waitFor(async () =>
    expect((await stored()).game.tableau[6]).toHaveLength(19),
  );
});

test("hints use a root HUD above cards and dialogs use one native modal with Back dismissal", async () => {
  const { Modal } = require("react-native");
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(setProfile(fresh("hud", "en"), "HUD Native", "p")),
  );
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("♠ Play Solitaire");
  press("Hint");
  expect(screen.getByTestId("game-overlay-layer")).toHaveStyle({
    zIndex: 2000,
    elevation: 30,
  });
  expect(
    within(screen.getByTestId("game-viewport")).queryByTestId("game-notice"),
  ).toBeNull();
  expect(screen.getByTestId("game-notice")).toBeOnTheScreen();
  expect(screen.queryByTestId("compact-tooltip")).toBeNull();
  press("Close");
  press("How to play");
  const modal = screen.UNSAFE_getByType(Modal);
  expect(modal.props.visible).toBe(true);
  fireEvent(modal, "requestClose");
  expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(false);
});

test("inventory shows five compact resource fields using original light Glimmer artwork", async () => {
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(
      setProfile(fresh("inventory", "en"), "Inventory Native", "p"),
    ),
  );
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("▧ Inventory");
  const inventory = screen.getByTestId("compact-inventory");
  expect(within(inventory).getAllByRole("button")).toHaveLength(5);
  expect(within(inventory).getByTestId("art-icon-glimmer")).toBeOnTheScreen();
  fireEvent.press(within(inventory).getAllByRole("button")[0]);
  expect(screen.getByTestId("compact-tooltip")).toBeOnTheScreen();
});

test("Decorations and Statistics use bounded pages; unique purchases are placed automatically only once", async () => {
  const initial = setProfile(fresh("paged", "en"), "Pages Native", "p");
  initial.economy.wallet.glimmers = 200;
  initial.economy.wallet.wood = 10;
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("❀ Decorations");
  const pager = screen.getByTestId("decorations-pages");
  fireEvent(pager, "layout", {
    nativeEvent: { layout: { width: 568, height: 262 } },
  });
  expect(screen.queryByTestId("screen-scroll")).toBeNull();
  let parent = pager.parent;
  while (parent) {
    expect(["ScrollView", "RCTScrollView"]).not.toContain(parent.type);
    parent = parent.parent;
  }
  const buy = screen
    .getAllByRole("button")
    .find(
      (button) =>
        String(button.props.accessibilityLabel).startsWith("Unlock") &&
        String(button.props.accessibilityLabel).includes("Flower"),
    );
  expect(buy).toBeDefined();
  fireEvent.press(buy!);
  await waitFor(async () =>
    expect((await stored()).economy.inventory).toContain("flowers"),
  );
  expect(
    screen.getByRole("button", { name: "Unlocked: Flower garden" }),
  ).toBeDisabled();
  const purchased = (await stored()).economy.wallet.glimmers;
  expect(
    screen.queryByRole("button", { name: "Place in garden: Flower garden" }),
  ).toBeNull();
  press("⌂ My Garden");
  const scene = screen.getByTestId("garden-scene");
  expect(scene.props.onResponderRelease).toBeUndefined();
  expect(
    screen.getByTestId("garden-decoration-flowers", {
      includeHiddenElements: true,
    }),
  ).toBeOnTheScreen();
  expect((await stored()).economy.wallet.glimmers).toBe(purchased);
  press("❀ Decorations");
  fireEvent(screen.getByTestId("decorations-pages"), "layout", {
    nativeEvent: { layout: { width: 568, height: 262 } },
  });
  press("Next page");
  expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
  press("↗ Statistics");
  fireEvent(screen.getByTestId("statistics-pages"), "layout", {
    nativeEvent: { layout: { width: 568, height: 262 } },
  });
  expect(screen.queryByTestId("screen-scroll")).toBeNull();
  press("Next page");
  expect(
    screen.getByRole("button", { name: "Curious explorer" }),
  ).toBeOnTheScreen();
});

test("compact world map explains the actual missing quest instead of a disabled unlock wall", async () => {
  const initial = setProfile(fresh("world-guide", "en"), "Guide Native", "p");
  initial.economy.wallet.glimmers = 75;
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("◇ World Map");
  expect(screen.queryByTestId("screen-scroll")).toBeNull();
  fireEvent.press(
    within(screen.getByTestId("world-area-forest")).getByRole("button", {
      name: "What is missing?",
    }),
  );
  expect(screen.getByText("Your next step")).toBeOnTheScreen();
  expect(
    screen.getByText(
      String(i18n.t("completeQuestFirst", { quest: i18n.t("pip1") })),
    ),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByRole("button", { name: "Go to quests" }));
  expect(
    within(screen.getByTestId("quest-details")).getByText(
      String(i18n.t("pip1Info")),
    ),
  ).toBeOnTheScreen();
});

test("world shortcuts apply card themes and persist animation controls without latching system reduced motion", async () => {
  const initial = setProfile(fresh("world-themes", "en"), "Themes Native", "p");
  initial.economy.wallet = {
    glimmers: 100,
    wood: 10,
    stone: 10,
    flowers: 10,
    seeds: 10,
  };
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("◇ World Map");
  press(String(i18n.t("cardThemes")));
  fireEvent.press(
    within(screen.getByTestId("world-theme-botanical")).getByRole("button", {
      name: String(i18n.t("chooseTheme")),
    }),
  );
  await waitFor(async () => {
    const s = await stored();
    expect(s.world.theme).toBe("botanical");
    expect(s.game).toEqual(initial.game);
    expect(s.preferences.reducedMotion).toBe(false);
  });
  expect(
    within(screen.getByTestId("world-theme-botanical")).getByText(
      "Active card design",
    ),
  ).toBeOnTheScreen();
  press("Back");
  press("Animations");
  expect(screen.getByTestId("animation-panel")).toBeOnTheScreen();
  await screen.findByText("Paused by your system’s reduced-motion setting.");
  press("Animation quality: High");
  press("Season: Winter");
  press("Animations: On");
  await waitFor(async () => {
    const s = await stored();
    expect(s.preferences.animationQuality).toBe("high");
    expect(s.preferences.season).toBe("winter");
    expect(s.preferences.animations).toBe(false);
    expect(s.game).toEqual(initial.game);
  });
  expect(screen.getByText("Animations are switched off.")).toBeOnTheScreen();
});

test("Solitaire runs sparse seasonal effects behind cards without intercepting touch", async () => {
  const { AppState } = require("react-native");
  Object.defineProperty(AppState, "currentState", {
    value: "active",
    configurable: true,
  });
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(false);
  const initial = setProfile(fresh("board-motion", "en"), "Board Native", "p");
  initial.preferences.season = "winter";
  initial.preferences.weather = 1;
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("♠ Play Solitaire");
  const backdrop = within(screen.getByTestId("solitaire-board")).getByTestId(
    "board-ambience",
  );
  expect(backdrop.props.pointerEvents).toBe("none");
  expect(backdrop).toHaveStyle({ zIndex: 0 });
  const engine = within(backdrop).getByTestId("living-world-board", {
    includeHiddenElements: true,
  });
  expect(engine.props.pointerEvents).toBe("none");
  const snow = within(engine).getAllByTestId("living-sprite-snowflake", {
    includeHiddenElements: true,
  });
  expect(snow.length).toBeGreaterThan(0);
  expect(snow.length).toBeLessThanOrEqual(4);
  press("Draw cards");
  await waitFor(async () => {
    const saved = await stored();
    expect(saved.game.moves).toBe(1);
    expect(saved.game.waste).toHaveLength(3);
  });
  press("Undo");
  await waitFor(async () =>
    expect((await stored()).game).toEqual(initial.game),
  );
  press("⚙ Settings");
  fireEvent.press(
    screen.getByRole("tab", { name: "Appearance and animations" }),
  );
  press("Animations: On");
  press("♠ Play Solitaire");
  expect(
    within(
      screen.getByTestId("living-world-board", { includeHiddenElements: true }),
    ).queryAllByTestId("living-sprite-snowflake", {
      includeHiddenElements: true,
    }),
  ).toHaveLength(0);
});

test("Win materials opens game choices without granting free supplies or changing the deal", async () => {
  const initial = setProfile(fresh("earn", "en"), "Earn Native", "p");
  initial.economy.wallet.glimmers = 75;
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  expect(screen.queryByRole("button", { name: "Gather supplies" })).toBeNull();
  press("Win materials");
  expect(screen.getByTestId("mini-start-hidden")).toBeOnTheScreen();
  expect((await stored()).economy.wallet).toEqual(initial.economy.wallet);
  expect((await stored()).counters.gather).toBe(0);
  expect((await stored()).game).toEqual(initial.game);
});

test("quest journal explains objectives and exact materials, claims once and recommends the next chapter", async () => {
  const initial = setProfile(fresh("journal", "en"), "Journal Native", "p");
  initial.counters.match = 1;
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("☷ Quest Journal");
  expect(screen.queryByTestId("screen-scroll")).toBeNull();
  fireEvent.press(screen.getByTestId("quest-card-millie1"));
  const detail = screen.getByTestId("quest-details");
  expect(
    within(detail).getByText(String(i18n.t("millie1Info"))),
  ).toBeOnTheScreen();
  expect(within(detail).getByLabelText("Seeds: 3")).toBeOnTheScreen();
  press("Collect reward");
  await waitFor(async () => {
    const save = await stored();
    expect(save.completed).toContain("millie1");
    expect(save.economy.wallet.glimmers).toBe(25);
    expect(save.economy.wallet.seeds).toBe(3);
    expect(save.game).toEqual(initial.game);
  });
  fireEvent.press(screen.getByTestId("quest-card-millie1"));
  expect(
    within(screen.getByTestId("quest-details")).getByRole("button", {
      name: "Completed",
    }),
  ).toBeDisabled();
  press("Close");
  fireEvent.press(screen.getByTestId("quest-card-millie2"));
  press("Go to next step");
  expect(screen.getByTestId("decorations-pages")).toBeOnTheScreen();
  await waitFor(async () =>
    expect((await stored()).economy.wallet.glimmers).toBe(25),
  );
});

test("locked quest details lead to the previous quest and objective actions keep the saved deal", async () => {
  const initial = setProfile(
    fresh("locked-journal", "en"),
    "Quest Native",
    "p",
  );
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("☷ Quest Journal");
  fireEvent.press(screen.getByTestId("quest-card-millie2"));
  press("Show previous quest");
  expect(
    within(screen.getByTestId("quest-details")).getByText(
      String(i18n.t("millie1Info")),
    ),
  ).toBeOnTheScreen();
  press("Go to next step");
  expect(screen.getByTestId("mini-start-match")).toBeOnTheScreen();
  await waitFor(async () =>
    expect((await stored()).game).toEqual(initial.game),
  );
});

test("shared journey links the real next quest and saved appearance controls", async () => {
  const initial = setProfile(
    fresh("journey-flow", "en"),
    "Journey Native",
    "p",
  );
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  expect(screen.queryByTestId("journey-ribbon")).toBeNull();
  press("☷ Quest Journal");
  const ribbon = screen.getByTestId("journey-ribbon");
  expect(within(ribbon).getByRole("progressbar")).toHaveAccessibilityValue({
    min: 0,
    now: 0,
  });
  fireEvent.press(within(ribbon).getAllByRole("button")[0]);
  expect(screen.getByTestId("quest-details")).toBeOnTheScreen();
  press("Close");
  fireEvent.press(
    within(screen.getByTestId("journey-ribbon")).getByRole("button", {
      name: "Appearance and animations",
    }),
  );
  expect(screen.getByTestId("animation-panel")).toBeOnTheScreen();
  await waitFor(async () =>
    expect((await stored()).game).toEqual(initial.game),
  );
});

test.each([1, 2, 3] as MiniLevel[])(
  "Hidden Treasures level %s fits a fixed scene with all targets and completes once",
  async (level) => {
    const original = setProfile(
      fresh("hidden-fit", "en"),
      "Hidden Native",
      "p",
    );
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(original));
    await renderAsync(<App />);
    await screen.findByTestId("main-tabs");
    press("✿ Mini-games");
    press(`Level ${level}`);
    fireEvent.press(screen.getByTestId("mini-start-hidden"));
    const scene = screen.getByTestId("garden-scene");
    expect(scene).toHaveStyle({ flex: 1, minHeight: 0 });
    let ancestor = scene.parent;
    while (ancestor) {
      expect(["ScrollView", "RCTScrollView"]).not.toContain(ancestor.type);
      ancestor = ancestor.parent;
    }
    expect(screen.getByTestId("treasure-checklist")).toHaveStyle({
      height: 44,
    });
    for (const name of ["Key", "Acorn", "Ribbon", "Spoon", "Button"]) {
      const target = screen.getByRole("button", { name });
      expect(target).toHaveStyle({ width: 44, height: 44 });
      fireEvent.press(target);
    }
    await screen.findByText("Beautifully done! +20 Glimmers");
    await waitFor(async () => {
      const saved = await stored();
      expect(saved.counters.hidden).toBe(1);
      expect(saved.economy.wallet.glimmers).toBe(20);
      expect(saved.world.medals).toContain(`hidden:${level}`);
      expect(saved.economy.wallet.wood).toBe(2 * level);
      expect(saved.economy.wallet.stone).toBe(level);
      expect(saved.economy.wallet.flowers).toBe(level);
      expect(saved.economy.wallet.seeds).toBe(level);
      expect(saved.game).toEqual(original.game);
    });
  },
);

test("Garden Match dead board offers shuffle preserving score, turns, session and Solitaire", async () => {
  const original = setProfile(fresh("match-dead", "en"), "Match Native", "p");
  const cells = Array.from(
    { length: 36 },
    (_, i) => ((i % 6) + Math.floor(i / 6)) % 5,
  );
  expect(hasMatchMove(cells)).toBe(false);
  original.miniSession = {
    id: "dead-board",
    kind: "match",
    level: 2,
    match: { cells, score: 12, turns: 8, target: 45 },
    tea: teaForLevel(2),
    found: [],
  };
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(original));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("✿ Mini-games");
  press("Resume saved puzzle");
  expect(screen.getByText(String(i18n.t("matchNoMoves")))).toBeOnTheScreen();
  press(String(i18n.t("shuffle")));
  await waitFor(async () => {
    const saved = await stored();
    expect(hasMatchMove(saved.miniSession.match.cells)).toBe(true);
    expect(saved.miniSession.match.score).toBe(12);
    expect(saved.miniSession.match.turns).toBe(8);
    expect(saved.miniSession.id).toBe("dead-board");
    expect(saved.game).toEqual(original.game);
    expect(saved.economy.wallet).toEqual(original.economy.wallet);
  });
});

test.each([1, 2, 3] as MiniLevel[])(
  "Garden Match level %s accepts a swipe in the app, finishes and pays once",
  async (level) => {
    jest.spyOn(Animated, "parallel").mockImplementation((animations) => ({
      start: (cb) => {
        animations.forEach((a) => a.start());
        cb?.({ finished: true });
      },
      stop: () => {},
      reset: () => {},
    }));
    jest.spyOn(Animated, "timing").mockImplementation((value, config) => ({
      start: (cb) => {
        value.setValue(config.toValue as never);
        cb?.({ finished: true });
      },
      stop: () => {},
      reset: () => {},
    }));
    const original = setProfile(
      fresh("match-swipe", "en"),
      "Swipe Native",
      "p",
    );
    const cells = Array.from(
      { length: 36 },
      (_, i) => ((i % 6) + Math.floor(i / 6)) % 5,
    );
    cells[0] = 0;
    cells[1] = 1;
    cells[2] = 0;
    cells[7] = 0;
    original.miniSession = {
      id: `swipe-${level}`,
      kind: "match",
      level,
      match: {
        cells,
        score: 29 + (level - 1) * 15,
        turns: 8,
        target: 30 + (level - 1) * 15,
      },
      tea: teaForLevel(level),
      found: [],
    };
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(original));
    await renderAsync(<App />);
    await screen.findByTestId("main-tabs");
    press("✿ Mini-games");
    press("Resume saved puzzle");
    const area = screen.getByTestId("mini-play-area");
    fireEvent(area, "layout", {
      nativeEvent: { layout: { width: 500, height: 260 } },
    });
    const board = screen.getByTestId("garden-match-board");
    const cell = (244 - 18) / 6;
    expect(board.props.onStartShouldSetResponder()).toBe(true);
    act(() =>
      board.props.onResponderGrant({
        nativeEvent: {
          locationX: 9 + 1.5 * cell,
          locationY: 9 + 0.5 * cell,
          pageX: 200,
          pageY: 100,
        },
      }),
    );
    act(() =>
      board.props.onResponderRelease({
        nativeEvent: { pageX: 200, pageY: 150 },
      }),
    );
    await screen.findByText("Beautifully done! +20 Glimmers");
    await waitFor(async () => {
      const saved = await stored();
      expect(saved.miniSession.match.turns).toBe(7);
      expect(saved.counters.match).toBe(1);
      expect(saved.economy.wallet.glimmers).toBe(20);
      expect(saved.world.medals).toContain(`match:${level}`);
      expect(saved.economy.wallet.wood).toBe(level);
      expect(saved.economy.wallet.flowers).toBe(2 * level);
      expect(saved.game).toEqual(original.game);
    });
    press("Back");
    press("Resume saved puzzle");
    expect((await stored()).counters.match).toBe(1);
  },
);

test("idle guide in Tea Time resets on actual touch lifecycle and moves without spending anything", async () => {
  Object.defineProperty(AppState, "currentState", {
    value: "active",
    configurable: true,
  });
  jest.useFakeTimers();
  try {
    const original = setProfile(fresh("idle-tea", "en"), "Idle Native", "p");
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(original));
    await renderAsync(<App />);
    await screen.findByTestId("main-tabs");
    press("✿ Mini-games");
    fireEvent.press(screen.getByTestId("mini-start-tea"));
    await act(async () => {});
    expect(screen.UNSAFE_getByType(IdleFirefly).props.settings.paused).toBe(
      false,
    );
    const marker = () =>
      screen.queryByTestId("idle-hint-static", { includeHiddenElements: true });
    await act(async () => {
      jest.advanceTimersByTime(IDLE_HINT_DELAY - 1);
    });
    expect(marker()).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(marker()).not.toBeNull();
    let root = screen.getByTestId("main-tabs");
    while (!root.props.onTouchStart) root = root.parent!;
    act(() => root.props.onTouchStart());
    expect(marker()).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    expect(marker()).toBeNull();
    act(() => root.props.onTouchEnd({ nativeEvent: { touches: [] } }));
    await act(async () => {
      jest.advanceTimersByTime(IDLE_HINT_DELAY);
    });
    expect(marker()).not.toBeNull();
    const expectedTea = pour(screen.UNSAFE_getByType(TeaTime).props.game, 0, 3);
    press("Tray 1");
    expect(marker()).toBeNull();
    press("Tray 4");
    await waitFor(async () => {
      const saved = await stored();
      expect(saved.miniSession.tea).toEqual(expectedTea);
      expect(saved.game).toEqual(original.game);
      expect(saved.economy.wallet).toEqual(original.economy.wallet);
    });
  } finally {
    jest.useRealTimers();
  }
});

test("Solitaire idle guide resolves actual registered card/target anchors without moving the deal", async () => {
  const original = setProfile(fresh("idle-card", "en"), "Idle Cards", "p");
  original.game = newGame("idle-card", 3, () => 0.3);
  expect(solitaireIdleHint(original.game)).not.toBeNull();
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(original));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("♠ Play Solitaire");
  for (const node of screen.UNSAFE_root.findAll(
    (n) => typeof n.instance?.measureInWindow === "function",
  )) {
    jest
      .spyOn(node.instance, "measureInWindow")
      .mockImplementation((callback: unknown) => {
        (callback as (x: number, y: number, w: number, h: number) => void)(
          100,
          200,
          40,
          60,
        );
      });
  }
  const guide = screen.UNSAFE_getByType(IdleFirefly);
  let points: { x: number; y: number }[] = [];
  await act(async () => {
    points = await guide.props.resolve();
  });
  expect(points).toHaveLength(2);
  expect(
    points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
  ).toBe(true);
  expect(guide.props.absolute).toBe(true);
  expect((await stored()).game).toEqual(original.game);
});

test("forest material objectives advance only after a won game, then claim and building routes work", async () => {
  const original = setProfile(
    fresh("forest-guide", "en"),
    "Forest Native",
    "p",
  );
  original.economy.inventory = ["forest"];
  original.world.areas.push("forest");
  original.world.area = "forest";
  original.counters.hidden = 2;
  original.counters.gather = 3;
  original.preferences.season = "autumn";
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(original));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  expect(screen.getByTestId("forest-guide")).toHaveTextContent(
    "Material rewards: 3/4",
    { exact: false },
  );
  expect(screen.getByTestId("forest-art-autumn")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("forest-next-action"));
  expect((await stored()).counters.gather).toBe(3);
  fireEvent.press(screen.getByTestId("mini-start-hidden"));
  for (const name of ["Key", "Acorn", "Ribbon", "Spoon", "Button"]) press(name);
  await waitFor(async () => expect((await stored()).counters.gather).toBe(4));
  press("Explore the forest");
  fireEvent.press(screen.getByTestId("forest-next-action"));
  await waitFor(async () => {
    const saved = await stored();
    expect(saved.world.stories).toContain("forest1");
    expect(saved.economy.wallet.glimmers).toBe(55);
    expect(saved.economy.wallet.wood).toBe(5);
    expect(saved.game).toEqual(original.game);
  });
  expect(screen.getByTestId("forest-guide")).toHaveTextContent(
    "Forest greenhouse: level 0/1",
    { exact: false },
  );
  fireEvent.press(screen.getByTestId("forest-next-action"));
  expect(screen.getByTestId("world-building-greenhouse")).toBeOnTheScreen();
});

test("repeat hunts give useful resources for each new round, retain unique unlocks and cannot reapply them", async () => {
  const original = setProfile(fresh("repeat-hunt", "en"), "Repeat Native", "p");
  original.economy.inventory = ["flowers"];
  original.placements = [{ id: "flowers", x: 8, y: 12 }];
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(original));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("✿ Mini-games");
  expect(
    screen.getByTestId("repeat-rewards-hidden").props.accessibilityLabel,
  ).toContain("+2 Wood");
  fireEvent.press(screen.getByTestId("mini-start-hidden"));
  for (let round = 0; round < 2; round++) {
    for (const name of ["Key", "Acorn", "Ribbon", "Spoon", "Button"])
      press(name);
    await waitFor(async () =>
      expect((await stored()).counters.hidden).toBe(round + 1),
    );
    if (round === 0) press("Play again");
  }
  await waitFor(async () => {
    const saved = await stored();
    expect(saved.economy.wallet.glimmers).toBe(40);
    expect(saved.economy.wallet.wood).toBe(4);
    expect(saved.economy.wallet.stone).toBe(2);
    expect(saved.economy.inventory).toEqual(["flowers"]);
    expect(saved.placements).toEqual(original.placements);
    expect(saved.game).toEqual(original.game);
  });
  press("❀ Decorations");
  expect(
    screen.getByRole("button", { name: "Unlocked: Flower garden" }),
  ).toBeDisabled();
});

test("garden material counters open labeled totals and persistent recent gains without altering the deal", async () => {
  const original = setProfile(
    fresh("materials-ui", "en"),
    "Materials Native",
    "p",
  );
  original.economy.inventory = ["flowers"];
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(original));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  expect(
    within(screen.getByTestId("materials-ribbon")).getAllByRole("button"),
  ).toHaveLength(1);
  press("Win materials");
  press("Level 2");
  fireEvent.press(screen.getByTestId("mini-start-hidden"));
  for (const name of ["Key", "Acorn", "Ribbon", "Spoon", "Button"]) press(name);
  await waitFor(async () =>
    expect((await stored()).economy.wallet.wood).toBe(4),
  );
  press("⌂ My Garden");
  fireEvent.press(
    within(screen.getByTestId("materials-ribbon")).getAllByRole("button")[0],
  );
  expect(screen.getByRole("button", { name: "Wood: 4" })).toBeOnTheScreen();
  expect(
    within(screen.getByTestId("compact-inventory")).getByText("Wood"),
  ).toBeOnTheScreen();
  expect(screen.getByTestId("material-gain-row").props.accessibilityLabel).toBe(
    "Hidden Treasures: +20 Glimmers · +4 Wood · +2 Stone · +2 Flowers · +2 Seeds",
  );
  expect(screen.queryByTestId("screen-scroll")).toBeNull();
  fireEvent.press(screen.getByRole("tab", { name: "Unlocked" }));
  expect(
    screen.getByRole("button", { name: "Flower garden" }),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByRole("tab", { name: "Materials" }));
  expect(screen.getByTestId("material-history")).toBeOnTheScreen();
  await cleanupAsync();
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("▧ Inventory");
  expect(screen.getByTestId("material-gain-row").props.accessibilityLabel).toBe(
    "Hidden Treasures: +20 Glimmers · +4 Wood · +2 Stone · +2 Flowers · +2 Seeds",
  );
  expect((await stored()).game).toEqual(original.game);
  expect((await stored()).economy.inventory).toEqual(["flowers"]);
});

test("illustrated main menu navigates directly and preserves the active solitaire deal", async () => {
  const original = setProfile(fresh("menu-deal", "en"), "Menu Native", "p");
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(original));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("♠ Play Solitaire");
  press("Draw cards");
  await waitFor(async () => expect((await stored()).game.moves).toBe(1));
  const played = (await stored()).game;
  expect(
    within(screen.getByTestId("main-tabs")).getAllByRole("button"),
  ).toHaveLength(4);

  press("Main menu");
  const menu = await screen.findByTestId("main-menu");
  expect(within(menu).getByText(String(i18n.t("menuMore")))).toBeOnTheScreen();
  fireEvent.press(within(menu).getByTestId("menu-quests"));
  await screen.findByTestId("quest-list-scroll");
  expect(screen.queryByTestId("main-menu")).toBeNull();
  expect((await stored()).game).toEqual(played);

  press("Main menu");
  const second = await screen.findByTestId("main-menu");
  fireEvent.press(within(second).getByTestId("menu-newDeal"));
  await screen.findByTestId("deal-dialog-scroll");
  expect((await stored()).game).toEqual(played);
  press(String(i18n.t("cancel")));
  expect((await stored()).game).toEqual(played);
});

test("unreadable primary and backup show an honest onboarding notice and retain raw copies", async () => {
  await AsyncStorage.setItem(SAVE_KEY, "broken primary");
  await AsyncStorage.setItem(SAVE_KEY + ".backup", "broken backup");
  await renderAsync(<App />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    String(i18n.t("saveReset")),
  );
  expect(
    JSON.parse((await AsyncStorage.getItem(SAVE_KEY + ".unreadable"))!),
  ).toEqual({ primary: "broken primary", backup: "broken backup" });
});

test("a blocked Solitaire stock cycle offers Undo or New game", async () => {
  const s = setProfile(fresh("blocked", "en"), "Player", "player");
  const all = [...s.game.stock, ...s.game.tableau.flat()];
  const waste = all.find((c) => c.id === "♠9")!;
  const top = all.find((c) => c.id === "♠7")!;
  s.game.stock = [];
  s.game.waste = [{ ...waste, up: true }];
  s.game.tableau = [
    [
      ...all
        .filter((c) => c !== waste && c !== top)
        .map((c) => ({ ...c, up: false })),
      { ...top, up: true },
    ],
    [],
    [],
    [],
    [],
    [],
    [],
  ];
  s.game.initial = require("../../src/engine/solitaire").snapshot(s.game);
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(s));
  await renderAsync(<App />);
  press("♠ " + i18n.t("play"));
  fireEvent.press(
    await screen.findByRole("button", { name: String(i18n.t("recycle")) }),
  );
  expect(
    await screen.findByText(String(i18n.t("solitaireNoMoves"))),
  ).toBeOnTheScreen();
});

test("New game can select a verified winnable deal without losing player progress", async () => {
  const s = setProfile(fresh("old", "en"), "Player", "player");
  s.economy.wallet.wood = 12;
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(s));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("♠ Play Solitaire");
  press(String(i18n.t("newGame")));
  press(String(i18n.t("winnableDeal")));
  press(String(i18n.t("confirm")));
  await waitFor(async () => expect((await stored()).attempts).toBe(2));
  const saved = await stored();
  const expected = require("../../src/engine/winnable").winnableGame(
    "expected",
    3,
    0,
  );
  expect(saved.game.initial).toEqual(expected.initial);
  expect(saved.economy.wallet.wood).toBe(12);
  expect(saved.profile.id).toBe("player");
});

test("Hidden Treasures uses the same seeded positions for touches, effects and resumed play", async () => {
  const s = setProfile(fresh("hunt", "en"), "Player", "player");
  s.miniSession = {
    id: "stable-hunt",
    kind: "hidden",
    level: 2,
    match: {
      cells: Array.from({ length: 36 }, (_, i) => i % 5),
      score: 0,
      turns: 18,
      target: 30,
    },
    tea: teaForLevel(2),
    found: ["acorn"],
  };
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(s));
  const open = async () => {
    await renderAsync(<App />);
    await screen.findByTestId("main-tabs");
    press("✿ Mini-games");
    press("Resume saved puzzle");
  };
  await open();
  const expected = require("../../src/engine/session")
    .treasuresForLevel(2, "stable-hunt")
    .find((t: { id: string }) => t.id === "key");
  const position = () =>
    screen.getByRole("button", { name: String(i18n.t("key")) }).props.style;
  expect(position()).toEqual(
    expect.objectContaining({ left: `${expected.x}%`, top: `${expected.y}%` }),
  );
  expect(
    screen.UNSAFE_getByType(
      require("../../src/HiddenTreasureEffects").HiddenTreasureEffects,
    ).props.seed,
  ).toBe("stable-hunt");
  const before = position();
  await cleanupAsync();
  await open();
  expect(position()).toEqual(before);
  expect(screen.queryByRole("button", { name: "Acorn" })).toBeNull();
});

test("batched stock taps each transform the latest game instead of overwriting a move", async () => {
  const s = setProfile(fresh("batched", "en"), "Player", "player");
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(s));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("♠ Play Solitaire");
  const stock = screen.getByRole("button", { name: String(i18n.t("draw")) });
  act(() => {
    fireEvent.press(stock);
    fireEvent.press(stock);
  });
  expect(screen.getByText("2 moves")).toBeOnTheScreen();
  await waitFor(async () => expect((await stored()).game.moves).toBe(2));
  expect((await stored()).game.waste).toHaveLength(6);
});
