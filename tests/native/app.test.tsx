import React from "react";
import { AccessibilityInfo } from "react-native";
import {
  renderAsync,
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
    expect(save.version).toBe(2);
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
