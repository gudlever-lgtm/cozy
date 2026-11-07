import React from "react";
import { AccessibilityInfo, StyleSheet } from "react-native";
import {
  renderAsync,
  screen,
  fireEvent,
  cleanupAsync,
  within,
} from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import App from "../../src/App";
import { GardenMiniPair } from "../../src/GardenMiniPair";
import { MainMenu } from "../../src/MainMenu";
import { fresh, setProfile, SAVE_KEY } from "../../src/engine/save";
import i18n from "../../src/i18n";

beforeEach(async () => {
  await AsyncStorage.clear();
  await i18n.changeLanguage("da");
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(true);
});
afterEach(async () => {
  await cleanupAsync();
  jest.restoreAllMocks();
});

test("garden floating controls stay outside the camera while help remains available", async () => {
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(setProfile(fresh("layout", "da"), "Haveven", "player")),
  );
  await renderAsync(<App />);
  await screen.findByTestId("garden-action-bar");
  const bar = screen.getByTestId("garden-action-bar");
  expect(within(bar).getByTestId("active-mini-pair")).toBeOnTheScreen();
  expect(screen.getByTestId("materials-ribbon")).toBeOnTheScreen();
  expect(within(bar).getByTestId("garden-edit-toggle")).toBeOnTheScreen();
  expect(
    within(screen.getByTestId("garden-camera-content")).queryByTestId(
      "active-mini-pair",
    ),
  ).toBeNull();
  expect(screen.queryByText(String(i18n.t("miniProgressInfo")))).toBeNull();
  fireEvent.press(screen.getByTestId("mini-progress-help"));
  expect(
    await screen.findByText(String(i18n.t("miniProgressInfo"))),
  ).toBeOnTheScreen();
});

test("mini icons show actual artwork and large balances stay inside fixed touch targets", async () => {
  const progress = fresh("icons", "da").miniProgress;
  progress.slots.forEach((s) => {
    s.moves = 999999;
  });
  const onOpen = jest.fn(),
    onHelp = jest.fn();
  await renderAsync(
    <GardenMiniPair progress={progress} onOpen={onOpen} onHelp={onHelp} />,
  );
  const match = screen.getByTestId("active-mini-match");
  expect(within(match).getByTestId("art-icon-flowers")).toBeOnTheScreen();
  expect(StyleSheet.flatten(match.props.style)?.height).toBeGreaterThanOrEqual(
    44,
  );
  fireEvent.press(match);
  expect(onOpen).toHaveBeenCalledWith(progress.slots[0]);
  fireEvent.press(screen.getByTestId("mini-progress-help"));
  expect(onHelp).toHaveBeenCalledTimes(1);
});

test("the flat menu exposes every destination directly and retains scroll access", async () => {
  const navigate = jest.fn();
  await renderAsync(
    <MainMenu
      visible
      onClose={jest.fn()}
      onNavigate={navigate}
      forestUnlocked
    />,
  );
  expect(screen.getByTestId("main-menu-scroll")).toBeOnTheScreen();
  for (const id of [
    "newDeal",
    "garden",
    "decorations",
    "quests",
    "world",
    "settings",
    "inventory",
    "collection",
    "statistics",
    "restartDeal",
    "rules",
    "challenge",
    "forest",
  ]) {
    fireEvent.press(screen.getByTestId(`menu-${id}`));
    expect(navigate).toHaveBeenLastCalledWith(id);
  }
});

test("solitaire type selection keeps confirmation controls in a bounded scroll dialog", async () => {
  await AsyncStorage.setItem(
    SAVE_KEY,
    JSON.stringify(setProfile(fresh("dialog", "da"), "Haveven", "player")),
  );
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
  fireEvent.press(
    screen.getByRole("button", { name: "♠ " + String(i18n.t("play")) }),
  );
  fireEvent.press(
    screen.getByRole("button", { name: String(i18n.t("newGame")) }),
  );
  const dialog = await screen.findByTestId("deal-dialog-scroll");
  expect(
    within(dialog).getByRole("button", { name: String(i18n.t("confirm")) }),
  ).toBeOnTheScreen();
  expect(
    within(dialog).getByText(
      String(i18n.t("whitehead")) +
        " · " +
        String(i18n.t("solitaireKeyAt", { count: 6 })),
    ),
  ).toBeOnTheScreen();
});
