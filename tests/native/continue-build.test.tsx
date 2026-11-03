import React from "react";
import { AccessibilityInfo } from "react-native";
import {
  renderAsync,
  screen,
  within,
  fireEvent,
  waitFor,
  cleanupAsync,
} from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import App from "../../src/App";
import { fresh, setProfile, SAVE_KEY, type Save } from "../../src/engine/save";
import { drawCards } from "../../src/engine/solitaire";
import i18n from "../../src/i18n";
const label = (key: string) => String(i18n.t(key));
const press = (key: string) =>
  fireEvent.press(screen.getByRole("button", { name: label(key) }));
const stored = async (): Promise<Save> =>
  JSON.parse((await AsyncStorage.getItem(SAVE_KEY))!);
async function load(save: Save) {
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(save));
  await renderAsync(<App />);
  await screen.findByTestId("main-tabs");
}
function initial() {
  return setProfile(fresh("continue-regression", "da"), "Haveven", "player");
}
async function openNewDeal() {
  fireEvent.press(screen.getByRole("button", { name: "♠ " + label("play") }));
  press("newGame");
  await screen.findByTestId("deal-dialog-scroll");
}
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

test("Continue starts ordinary draw-three with zero fireflies and no new-deal credits", async () => {
  const save = initial();
  save.game = drawCards(save.game);
  save.miniProgress.deals = 0;
  await load(save);
  await openNewDeal();
  press("confirm");
  await waitFor(async () => {
    const next = await stored();
    expect(next.game.id).not.toBe(save.game.id);
    expect(next.game.draw).toBe(3);
    expect(next.game.moves).toBe(0);
    expect(next.miniProgress.fireflies).toBe(0);
    expect(next.miniProgress.deals).toBe(0);
  });
  expect(screen.queryByTestId("deal-dialog-scroll")).toBeNull();
});

test("missing guaranteed-deal credits are explained inside the dialog and random play remains possible", async () => {
  const save = initial();
  save.miniProgress.deals = 0;
  await load(save);
  await openNewDeal();
  press("winnableDeal");
  press("confirm");
  expect(
    within(screen.getByTestId("deal-dialog-scroll")).getByTestId("deal-error"),
  ).toHaveTextContent(label("needDealReward"));
  expect((await stored()).game.id).toBe(save.game.id);
  press("randomDeal");
  expect(screen.queryByTestId("deal-error")).toBeNull();
  press("confirm");
  await waitFor(async () =>
    expect((await stored()).game.id).not.toBe(save.game.id),
  );
});

test("Build your garden opens a focused workspace and saves purchases and placement", async () => {
  const save = initial();
  save.economy.wallet.glimmers = 50;
  save.economy.wallet.wood = 2;
  await load(save);
  press("buildGarden");
  await screen.findByTestId("garden-build-screen");
  expect(screen.queryByTestId("main-tabs")).toBeNull();
  expect(screen.queryByTestId("active-mini-pair")).toBeNull();
  expect(screen.queryByTestId("garden-action-bar")).toBeNull();
  expect(screen.getByTestId("build-garden-preview")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("build-buy-flowers"));
  await waitFor(async () => {
    const next = await stored();
    expect(next.economy.inventory).toContain("flowers");
    expect(next.economy.wallet.glimmers).toBe(30);
  });
  fireEvent.press(
    within(screen.getByTestId("furniture-controls-flowers")).getByRole(
      "button",
      { name: "→" },
    ),
  );
  await waitFor(async () =>
    expect((await stored()).placements.find((p) => p.id === "flowers")?.x).toBe(
      25,
    ),
  );
  press("buildDone");
  await screen.findByTestId("main-tabs");
  press("mainMenu");
  press("menuGarden");
  fireEvent.press(
    within(screen.getByTestId("main-menu")).getByRole("button", {
      name: label("buildGarden"),
    }),
  );
  expect(await screen.findByTestId("garden-build-screen")).toBeOnTheScreen();
  expect(screen.getByTestId("furniture-controls-flowers")).toBeOnTheScreen();
});
