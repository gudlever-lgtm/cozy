import React, { useState } from "react";
import {
  renderAsync,
  screen,
  fireEvent,
  cleanupAsync,
} from "@testing-library/react-native";
import { TeaTime } from "../../src/TeaTime";
import { newTea } from "../../src/engine/minigames";
import i18n from "../../src/i18n";

beforeEach(async () => {
  await i18n.changeLanguage("en");
});
afterEach(cleanupAsync);
function Board() {
  const [game, setGame] = useState(newTea);
  return <TeaTime game={game} disabled={false} onChange={setGame} />;
}
test("Tea Time explains invalid taps, keeps the source selected and moves to an empty tray; undo restores it", async () => {
  await renderAsync(<Board />);
  const tray = (i: number) => screen.getByTestId(`tea-tray-${i}`);
  fireEvent.press(tray(3));
  expect(screen.getByTestId("tea-instruction")).toHaveTextContent(
    String(i18n.t("teaEmptySource")),
  );
  fireEvent.press(tray(0));
  expect(tray(0).props.accessibilityState.selected).toBe(true);
  expect(tray(3).props.accessibilityHint).toBe(
    String(i18n.t("teaValidTarget")),
  );
  fireEvent.press(tray(1));
  expect(screen.getByTestId("tea-instruction")).toHaveTextContent(
    String(i18n.t("teaInvalid")),
  );
  expect(tray(0).props.accessibilityState.selected).toBe(true);
  fireEvent.press(tray(3));
  expect(tray(3)).toHaveAccessibilityValue({ text: "Golden cake" });
  expect(tray(0)).toHaveAccessibilityValue({ text: "Pink cake, Tea cup" });
  fireEvent.press(screen.getByRole("button", { name: "Undo" }));
  expect(tray(3)).toHaveAccessibilityValue({ text: "Empty tray" });
  expect(tray(0)).toHaveAccessibilityValue({
    text: "Golden cake, Pink cake, Tea cup",
  });
  expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
});

test("Tea Time selection cancels on the same tray; completed board ignores taps", async () => {
  const onChange = jest.fn();
  const { rerenderAsync } = await renderAsync(
    <TeaTime game={newTea()} disabled={false} onChange={onChange} />,
  );
  fireEvent.press(screen.getByTestId("tea-tray-0"));
  fireEvent.press(screen.getByTestId("tea-tray-0"));
  expect(
    screen.getByTestId("tea-tray-0").props.accessibilityState.selected,
  ).toBe(false);
  expect(onChange).not.toHaveBeenCalled();
  await rerenderAsync(
    <TeaTime
      game={[[0, 0, 0], [1, 1, 1], [2, 2, 2], [], []]}
      disabled={true}
      onChange={onChange}
    />,
  );
  for (let i = 0; i < 5; i++)
    expect(screen.getByTestId(`tea-tray-${i}`)).toBeDisabled();
});
