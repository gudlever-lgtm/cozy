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

  expect(screen.getByTestId("undo-help-title")).toHaveTextContent("Ikke flere Undo-point");
  expect(screen.getByTestId("undo-help-body")).toHaveTextContent("Vind et minispil");
  expect(screen.getByTestId("undo-help-earn-label")).toHaveTextContent("Minispil");
  expect(screen.getByTestId("undo-help-close-label")).toHaveTextContent("Luk");

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
  expect(screen.getByTestId("undo-help-title")).toHaveTextContent("No Undo points left");
  expect(screen.getByTestId("undo-help-body")).toHaveTextContent("Win a mini game");
  fireEvent.press(screen.getByTestId("undo-help-close"));
  expect(onClose).toHaveBeenCalledTimes(1);
});
