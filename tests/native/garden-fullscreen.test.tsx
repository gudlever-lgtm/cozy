import React from "react";
import { View } from "react-native";
import {
  renderAsync,
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
