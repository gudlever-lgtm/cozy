import React from "react";
import { View } from "react-native";
import {
  renderAsync,
  fireEvent,
  screen,
  act,
  cleanupAsync,
} from "@testing-library/react-native";
import { GardenViewport } from "../../src/GardenViewport";
afterEach(async () => cleanupAsync());

test("full-screen resize survives released native layout events", async () => {
  await renderAsync(
    <GardenViewport editing>
      <View />
    </GardenViewport>,
  );
  const layout = screen.getByTestId("garden-viewport").props.onLayout;
  const first: any = { nativeEvent: { layout: { width: 560, height: 220 } } };
  const second: any = { nativeEvent: { layout: { width: 740, height: 310 } } };
  await act(async () => {
    layout(first);
    layout(second);
    // Native layout events may be released after their handler returns.
    first.nativeEvent = null;
    second.nativeEvent = null;
  });
  expect(screen.getByTestId("garden-camera-content")).toBeOnTheScreen();
});

test("building keeps zoom controls available and clamps zoom to the garden edges", async () => {
  await renderAsync(
    <GardenViewport editing>
      <View testID="placed-scene" />
    </GardenViewport>,
  );
  expect(screen.getByTestId("garden-zoom-level")).toHaveTextContent("100%");
  fireEvent.press(screen.getByTestId("garden-zoom-in"));
  expect(screen.getByTestId("garden-zoom-level")).toHaveTextContent("125%");
  expect(screen.getByTestId("placed-scene")).toBeOnTheScreen();
  for (let i = 0; i < 20; i++)
    fireEvent.press(screen.getByTestId("garden-zoom-in"));
  expect(screen.getByTestId("garden-zoom-level")).toHaveTextContent("280%");
  fireEvent.press(screen.getByTestId("garden-zoom-out"));
  expect(screen.getByTestId("garden-zoom-level")).toHaveTextContent("255%");
  fireEvent.press(screen.getByTestId("garden-reset-view"));
  for (let i = 0; i < 3; i++)
    fireEvent.press(screen.getByTestId("garden-zoom-out"));
  expect(screen.getByTestId("garden-zoom-level")).toHaveTextContent("100%");
});
