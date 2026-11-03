import React from "react";
import { AccessibilityInfo } from "react-native";
import {
  renderAsync,
  screen,
  fireEvent,
  cleanupAsync,
  waitFor,
} from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import App from "../../src/App";
import i18n from "../../src/i18n";
import { fresh, reward, setProfile, SAVE_KEY } from "../../src/engine/save";

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

test("home shows two earned-move icons without a mini game tab; play resumes the saved board", async () => {
  const initial = reward(
    setProfile(fresh("main", "en"), "Gardener", "player"),
    "solitaire",
    "main",
  );
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  await renderAsync(<App />);
  await screen.findByTestId("active-mini-pair");
  expect(screen.queryByRole("button", { name: "Mini-games" })).toBeNull();
  expect(screen.getByTestId("active-mini-match")).toBeOnTheScreen();
  expect(screen.getByTestId("active-mini-hidden")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("active-mini-hidden"));
  await screen.findByTestId("mini-play-layout");
  await waitFor(async () => {
    const saved = JSON.parse((await AsyncStorage.getItem(SAVE_KEY))!);
    expect(saved.miniSession.id).toBe(initial.miniProgress.slots[1].session.id);
    expect(saved.miniProgress.slots[1].moves).toBe(10);
  });
});
