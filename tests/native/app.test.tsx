import React from "react";
import { AccessibilityInfo } from "react-native";
import {
  renderAsync,
  within,
  screen,
  fireEvent,
  waitFor,
  cleanupAsync,
} from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pour, teaWon } from "../../src/engine/minigames";
import { teaForLevel } from "../../src/engine/session";
import App from "../../src/App";
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
async function stored() {
  return JSON.parse((await AsyncStorage.getItem(SAVE_KEY))!);
}
function press(name: string) {
  const matches = [
    ...screen.queryAllByRole("button", { name }),
    ...screen.queryAllByRole("tab", { name }),
  ];
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
    JSON.stringify(setProfile(fresh("native", "en"), "Pip Native", "p")),
  );
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("✿ Mini-games");
  fireEvent.press(screen.getAllByRole("button", { name: "Continue" })[1]);
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
    expect(save.version).toBe(3);
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
  fireEvent.press(screen.getAllByRole("button", { name: "Continue" })[1]);
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
  press("Safe finish");
  await screen.findByText("A lovely win!");
  await waitFor(async () =>
    expect((await stored()).economy.wallet.glimmers).toBe(60),
  );
  press("Undo");
  press("Safe finish");
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

test("Tea Time can be started and completed entirely through native controls", async () => {
  const queue: { cups: number[][]; path: number[][] }[] = [
    { cups: teaForLevel(1), path: [] },
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
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(setProfile(fresh("tea-native", "en"), "Tea Native", "p")),
  );
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  press("✿ Mini-games");
  fireEvent.press(screen.getAllByRole("button", { name: "Continue" })[2]);
  for (const [a, b] of path) {
    press(`Tray ${a + 1}`);
    press(`Tray ${b + 1}`);
  }
  await screen.findByText("Beautifully done! +20 Glimmers");
  await waitFor(async () => expect((await stored()).counters.tea).toBe(1));
});

test("game panels scroll in a bounded viewport; oversized menu screens retain their own scroll", async () => {
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(setProfile(fresh("scroll", "en"), "Scroll Native", "p")),
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
  expect(screen.queryByTestId("game-viewport")).toBeNull();
  expect(screen.getByTestId("screen-scroll").props.scrollEnabled).not.toBe(
    false,
  );
  fireEvent.scroll(screen.getByTestId("screen-scroll"), {
    nativeEvent: {
      contentOffset: { x: 0, y: 800 },
      contentSize: { width: 600, height: 1600 },
      layoutMeasurement: { width: 600, height: 320 },
    },
  });
  expect(screen.getByRole("button", { name: "Draw three" })).toBeOnTheScreen();
  press("✿ Mini-games");
  fireEvent.press(screen.getAllByRole("button", { name: "Continue" })[0]);
  expectBoundedGame();
  expect(screen.getByTestId("garden-match-board")).toBeOnTheScreen();
  let boardParent = screen.getByTestId("garden-match-board").parent;
  while (boardParent) {
    expect(["ScrollView", "RCTScrollView"]).not.toContain(boardParent.type);
    boardParent = boardParent.parent;
  }
});

test("compact tabs navigate with localized accessible names and dismissible timed labels", async () => {
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(setProfile(fresh("tabs", "en"), "Tabs Native", "p")),
  );
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  expect(screen.getAllByRole("tab")).toHaveLength(9);
  expect(screen.queryByText("Cozy Solitaire")).toBeNull();
  press("♠ Play Solitaire");
  expect(
    screen.getByRole("tab", { name: "♠ Play Solitaire" }).props
      .accessibilityState.selected,
  ).toBe(true);
  expect(screen.getByTestId("compact-tooltip")).toHaveTextContent(
    "Play Solitaire",
  );
  fireEvent.press(screen.getByTestId("compact-tooltip"));
  expect(screen.queryByTestId("compact-tooltip")).toBeNull();
  press("⌂ My Garden");
  await waitFor(
    () => expect(screen.queryByTestId("compact-tooltip")).toBeNull(),
    { timeout: 4000 },
  );
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
