import React from "react";
import {
  cleanupAsync,
  fireEvent,
  renderAsync,
  screen,
} from "@testing-library/react-native";
import { CozyButton } from "../../src/ui/CozyButton";
import { PlayerAvatar } from "../../src/ui/PlayerAvatar";

afterEach(async () => {
  await cleanupAsync();
});

test("illustrated toolbar action keeps icon and label within one press target", async () => {
  const onPress = jest.fn();
  await renderAsync(
    <CozyButton
      testID="button-toolbar"
      variant="toolbarAction"
      label="Afslut automatisk"
      icon="auto"
      onPress={onPress}
    />,
  );
  expect(screen.getByTestId("button-toolbar-art")).toBeTruthy();
  expect(screen.getByTestId("button-toolbar-icon-slot")).toBeTruthy();
  expect(screen.getByTestId("button-toolbar-label").props.children).toBe(
    "Afslut automatisk",
  );
  fireEvent.press(screen.getByTestId("button-toolbar"));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test("long menu label and dialog choice retain illustrated surfaces and text", async () => {
  await renderAsync(
    <>
      <CozyButton
        testID="button-menu"
        variant="menuCard"
        label="Havens samlealbum"
        icon="decorations"
        onPress={jest.fn()}
      />
      <CozyButton
        testID="button-dialog"
        variant="dialogChoice"
        label="Garanteret vindbar deal"
        onPress={jest.fn()}
      />
    </>,
  );
  for (const id of ["button-menu", "button-dialog"]) {
    expect(screen.getByTestId(`${id}-art`)).toBeTruthy();
    expect(screen.getByTestId(`${id}-label`)).toBeTruthy();
  }
});

test("icon-only navigation is labelled accessibly without extraneous text", async () => {
  await renderAsync(
    <CozyButton
      testID="button-tab"
      variant="bottomTab"
      label=""
      icon="garden"
      accessibilityLabel="Min have"
      onPress={jest.fn()}
    />,
  );
  expect(screen.getByTestId("button-tab-icon-slot")).toBeTruthy();
  expect(screen.queryByTestId("button-tab-label")).toBeNull();
  expect(screen.getByRole("button", { name: "Min have" })).toBeTruthy();
});

test("profile avatar is an illustration, not a Unicode emoji glyph", async () => {
  await renderAsync(<PlayerAvatar avatar="🐱" size={38} />);
  expect(screen.getByTestId("player-avatar")).toBeTruthy();
  expect(screen.queryByText("🐱")).toBeNull();
});
