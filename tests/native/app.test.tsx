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
  fireEvent.press(screen.getAllByRole("button", { name })[0]);
}

test("native first launch requires a valid local username and preserves its language", async () => {
  await renderAsync(<App />);
  await screen.findByText("Make yourself at home");
  expect(
    screen.getByRole("button", { name: "Confirm player name" }),
  ).toBeDisabled();
  fireEvent.changeText(screen.getByLabelText("Player name"), "Åse Native");
  press("Confirm player name");
  await screen.findByText("Welcome to Cozy Solitaire, Åse Native!");
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
  await screen.findByText("Welcome to Cozy Solitaire, Åse Native!");
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
  await screen.findByText("Velkommen til Cozy Solitaire, Øster Native!");
  press("♠ Spil kabale");
  await screen.findByText("1 træk");
});

test("native hidden-object completion grants its reward once and survives restart", async () => {
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(setProfile(fresh("native", "en"), "Pip Native", "p")),
  );
  await renderAsync(<App />);
  await screen.findByText("Welcome to Cozy Solitaire, Pip Native!");
  press("✿ Mini-games");
  fireEvent.press(screen.getAllByRole("button", { name: "Continue" })[1]);
  for (const name of ["Key", "Acorn", "Ribbon", "Spoon", "Button"]) press(name);
  await screen.findByText("Beautifully done! +20 Glimmers");
  await waitFor(async () =>
    expect((await stored()).economy.wallet.glimmers).toBe(20),
  );
  await cleanupAsync();
  await renderAsync(<App />);
  await screen.findByText("Welcome to Cozy Solitaire, Pip Native!");
  expect(screen.getByText("✦ 20 Glimmers")).toBeOnTheScreen();
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
  await screen.findByText("Velkommen til Cozy Solitaire, Ægir Have!");
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
  await screen.findByText("Welcome to Cozy Solitaire, Living Garden!");
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
  await screen.findByText("Welcome to Cozy Solitaire, Living Garden!");
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
  await screen.findByText("Welcome to Cozy Solitaire, Puzzle Gardener!");
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
  await screen.findByText("Welcome to Cozy Solitaire, Puzzle Gardener!");
  press("✿ Mini-games");
  expect(screen.queryByRole("button", { name: "Key" })).toBeNull();
  for (const name of ["Acorn", "Ribbon", "Spoon", "Button"]) press(name);
  await screen.findByText("Beautifully done! +20 Glimmers");
  await waitFor(async () =>
    expect((await stored()).economy.wallet.glimmers).toBe(20),
  );
  await cleanupAsync();
  await renderAsync(<App />);
  await screen.findByText("Welcome to Cozy Solitaire, Puzzle Gardener!");
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
  await screen.findByText("Welcome to Cozy Solitaire, World Gardener!");
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
  await screen.findByText("Welcome to Cozy Solitaire, World Gardener!");
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
  await screen.findByText("Welcome to Cozy Solitaire, Card Gardener!");
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
