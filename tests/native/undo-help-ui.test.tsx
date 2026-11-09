import React from "react";
import { fireEvent, renderAsync, screen, cleanupAsync } from "@testing-library/react-native";
import { UndoHelp } from "../../src/ui/UndoHelp";
import i18n from "../../src/i18n";

afterEach(async () => {
  await cleanupAsync();
});

test("empty Undo balance explains how to earn points and offers playable mini-games", async () => {
  await i18n.changeLanguage("da");
  const onEarn = jest.fn();
  const onClose = jest.fn();
  await renderAsync(
    <UndoHelp visible onEarn={onEarn} onClose={onClose} />,
  );

  expect(screen.getByText("Ikke flere Undo-point")).toBeTruthy();
  expect(screen.getByText(/Vind et minispil/)).toBeTruthy();
  expect(screen.getByText("Minispil")).toBeTruthy();
  expect(screen.getByTestId("undo-help-close-label")).toBeTruthy();

  fireEvent.press(screen.getByTestId("undo-help-earn"));
  expect(onEarn).toHaveBeenCalledTimes(1);
  expect(onClose).not.toHaveBeenCalled();
});

test("undo information remains legible and dismissible in English", async () => {
  await i18n.changeLanguage("en");
  const onClose = jest.fn();
  await renderAsync(
    <UndoHelp visible onEarn={jest.fn()} onClose={onClose} />,
  );
  expect(screen.getByText("No Undo points left")).toBeTruthy();
  expect(screen.getByText(/Win a mini game/)).toBeTruthy();
  fireEvent.press(screen.getByTestId("undo-help-close"));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("when no mini-game moves are earned, Undo help explains the solitaire prerequisite", async () => {
  await i18n.changeLanguage("da");
  const onEarn = jest.fn();
  await renderAsync(
    <UndoHelp visible canPlayMini={false} onEarn={onEarn} onClose={jest.fn()} />,
  );

  expect(screen.getByText(/Vind først en kabale/)).toBeTruthy();
  expect(screen.getByText(String(i18n.t("play")))).toBeTruthy();
  fireEvent.press(screen.getByTestId("undo-help-earn"));
  expect(onEarn).toHaveBeenCalledTimes(1);
});
