import React from "react";
import {
  cleanupAsync,
  fireEvent,
  renderAsync,
  screen,
} from "@testing-library/react-native";
import { GameToolbar } from "../../src/ui/GameToolbar";
import i18n from "../../src/i18n";

afterEach(async () => {
  await cleanupAsync();
});

test("all four Danish illustrated actions retain visible text and working callbacks", async () => {
  await i18n.changeLanguage("da");
  const callbacks = {
    onNew: jest.fn(),
    onUndo: jest.fn(),
    onHint: jest.fn(),
    onAuto: jest.fn(),
  };
  await renderAsync(
    <GameToolbar
      {...callbacks}
      undo={0}
      canUndo
      canAuto={false}
    />,
  );

  for (const [id, label] of [
    ["new", "Nyt spil"],
    ["undo", "Fortryd"],
    ["hint", "Tip"],
    ["auto", "Afslut automatisk"],
  ]) {
    expect(screen.getByTestId(`solitaire-action-${id}-label`).props.children).toBe(label);
    expect(screen.getByTestId(`solitaire-action-${id}-icon-slot`)).toBeTruthy();
  }

  fireEvent.press(screen.getByTestId("solitaire-action-new"));
  fireEvent.press(screen.getByTestId("solitaire-action-undo"));
  fireEvent.press(screen.getByTestId("solitaire-action-hint"));
  fireEvent.press(screen.getByTestId("solitaire-action-auto"));
  expect(callbacks.onNew).toHaveBeenCalledTimes(1);
  expect(callbacks.onUndo).toHaveBeenCalledTimes(1);
  expect(callbacks.onHint).toHaveBeenCalledTimes(1);
  expect(callbacks.onAuto).toHaveBeenCalledTimes(1);
});

test("English auto-finish text remains present when the action is not ready", async () => {
  await i18n.changeLanguage("en");
  await renderAsync(
    <GameToolbar
      onNew={jest.fn()}
      onUndo={jest.fn()}
      onHint={jest.fn()}
      onAuto={jest.fn()}
      undo={0}
      canUndo
      canAuto={false}
    />,
  );
  expect(screen.getByTestId("solitaire-action-auto-label").props.children).toBe("Auto-finish");
});
