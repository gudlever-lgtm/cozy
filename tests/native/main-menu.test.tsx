import React from "react";
import {
  cleanupAsync,
  fireEvent,
  renderAsync,
  screen,
  within,
} from "@testing-library/react-native";
import { MainMenu } from "../../src/MainMenu";
import i18n from "../../src/i18n";

afterEach(async () => cleanupAsync());

test.each(["da", "en"] as const)(
  "main menu exposes every destination with real %s translations and navigates directly",
  async (language) => {
    await i18n.changeLanguage(language);
    const destinations: string[] = [];
    const closed = jest.fn();
    await renderAsync(
      <MainMenu
        visible
        onClose={closed}
        onNavigate={(destination) => destinations.push(destination)}
        forestUnlocked={false}
      />,
    );
    const menu = screen.getByTestId("main-menu");
    expect(
      within(menu).getByText(String(i18n.t("menuMore"))),
    ).toBeOnTheScreen();
    expect(
      within(menu).getByText(String(i18n.t("menuSubtitle"))),
    ).toBeOnTheScreen();
    for (const id of [
      "newDeal",
      "garden",
      "mini",
      "decorations",
      "quests",
      "world",
      "settings",
      "collection",
      "inventory",
      "statistics",
      "rules",
      "restartDeal",
      "challenge",
    ]) {
      fireEvent.press(within(menu).getByTestId(`menu-${id}`));
    }
    expect(destinations).toEqual([
      "newDeal",
      "garden",
      "mini",
      "decorations",
      "quests",
      "world",
      "settings",
      "collection",
      "inventory",
      "statistics",
      "rules",
      "restartDeal",
      "challenge",
    ]);
    expect(within(menu).queryByTestId("menu-forest")).toBeNull();
    fireEvent.press(
      within(menu).getByRole("button", { name: String(i18n.t("close")) }),
    );
    expect(closed).toHaveBeenCalledTimes(1);
  },
);

test("forest destination is shown only after unlock", async () => {
  await i18n.changeLanguage("en");
  const onNavigate = jest.fn();
  await renderAsync(
    <MainMenu
      visible
      onClose={jest.fn()}
      onNavigate={onNavigate}
      forestUnlocked
    />,
  );
  fireEvent.press(screen.getByTestId("menu-forest"));
  expect(onNavigate).toHaveBeenCalledWith("forest");
});
