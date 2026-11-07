import React, { useState } from "react";
import { StyleSheet } from "react-native";
import {
  renderAsync,
  screen,
  fireEvent,
  within,
  cleanupAsync,
} from "@testing-library/react-native";
import { WorldNavigator } from "../../src/WorldNavigator";
import { QuestJournal } from "../../src/QuestJournal";
import { fresh } from "../../src/engine/save";
import i18n from "../../src/i18n";
const tt = (key: string) => String(i18n.t(key));
beforeEach(async () => {
  await i18n.changeLanguage("da");
});
afterEach(async () => cleanupAsync());
test("world uses compact illustrated rows and preserves locked-area requirements", async () => {
  const save = fresh("world-rows", "da"),
    navigate = jest.fn();
  await renderAsync(
    <WorldNavigator save={save} onUpdate={jest.fn()} onNavigate={navigate} />,
  );
  expect(screen.getByTestId("world-areas-scroll")).toBeOnTheScreen();
  for (const area of ["cottage", "forest", "river", "village", "winterland"]) {
    expect(
      screen.getByTestId(`world-area-image-${area}`).props.source,
    ).toBeTruthy();
    const style = StyleSheet.flatten(
      screen.getByTestId(`world-area-${area}`).props.style,
    );
    expect(style.minHeight).toBeLessThanOrEqual(140);
    expect(style.flex).not.toBe(1);
  }
  fireEvent.press(
    within(screen.getByTestId("world-area-cottage")).getByRole("button", {
      name: tt("enterArea"),
    }),
  );
  expect(navigate).toHaveBeenCalledWith("garden");
  fireEvent.press(
    within(screen.getByTestId("world-area-forest")).getByRole("button", {
      name: tt("seeRequirements"),
    }),
  );
  expect(
    await screen.findByText(
      String(i18n.t("completeQuestFirst", { quest: i18n.t("pip1") })),
    ),
  ).toBeOnTheScreen();
});
test("quest list prioritizes current chapters, shows rewards and folds completed chapters", async () => {
  const initial = fresh("quest-list", "da");
  initial.counters.match = 1;
  const toast = jest.fn();
  function Harness() {
    const [save, setSave] = useState(initial);
    return (
      <QuestJournal
        save={save}
        onUpdate={setSave}
        onAction={jest.fn()}
        onToast={toast}
      />
    );
  }
  await renderAsync(<Harness />);
  expect(screen.getByTestId("quest-list-scroll")).toBeOnTheScreen();
  expect(screen.getByText(tt("questCurrent"))).toBeOnTheScreen();
  expect(screen.getByText(tt("questUpcoming"))).toBeOnTheScreen();
  expect(screen.getByTestId("quest-card-millie6")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("quest-card-millie1"));
  const dialog = screen.getByTestId("quest-details");
  fireEvent.press(within(dialog).getByRole("button", { name: tt("claim") }));
  expect(toast).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId("quest-card-millie1")).toBeNull();
  expect(screen.getByTestId("quest-card-millie2")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("quest-completed-toggle"));
  fireEvent.press(screen.getByTestId("quest-card-millie1"));
  expect(
    within(screen.getByTestId("quest-details")).getByRole("button", {
      name: tt("complete"),
    }),
  ).toBeDisabled();
});
