import React from "react";
import { AppState, AccessibilityInfo, type AppStateStatus } from "react-native";
import {
  renderAsync,
  screen,
  act,
  cleanupAsync,
} from "@testing-library/react-native";
import {
  LivingWorldAnimationEngine,
  type LivingWorldProps,
} from "../../src/living/LivingWorldAnimationEngine";
const props: LivingWorldProps = {
  season: "summer",
  enabled: true,
  quality: "medium",
  reducedMotion: false,
  intensity: 1,
  width: 400,
  height: 300,
  time: "evening",
};
afterEach(async () => {
  await cleanupAsync();
  jest.restoreAllMocks();
});
test("native animation layers remain ordered and never intercept input", async () => {
  Object.defineProperty(AppState, "currentState", {
    value: "active",
    configurable: true,
  });
  await renderAsync(<LivingWorldAnimationEngine {...props} />);
  const root = screen.getByTestId("living-world", {
    includeHiddenElements: true,
  });
  expect(root.props.pointerEvents).toBe("none");
  expect(root.props.accessibilityElementsHidden).toBe(true);
  const layers = root.children.filter(
    (c: unknown) => typeof c !== "string",
  ) as import("react-test-renderer").ReactTestInstance[];
  expect(layers.map((l) => l.props.testID)).toEqual([
    "living-behind-trees",
    "living-foreground",
    "living-ambient",
  ]);
  for (const layer of layers) expect(layer.props.pointerEvents).toBe("none");
  expect(
    screen.getAllByTestId("living-sprite-firefly", {
      includeHiddenElements: true,
    }).length,
  ).toBeGreaterThan(0);
});
test("native background/resume and system reduced-motion events gate particles", async () => {
  Object.defineProperty(AppState, "currentState", {
    value: "active",
    configurable: true,
  });
  let appListener: ((state: AppStateStatus) => void) | undefined;
  let reduceListener: ((enabled: boolean) => void) | undefined;
  jest
    .spyOn(AppState, "addEventListener")
    .mockImplementation((_type, listener) => {
      appListener = listener;
      return { remove: jest.fn() };
    });
  jest
    .spyOn(AccessibilityInfo, "addEventListener")
    .mockImplementation((_type, listener) => {
      reduceListener = listener as unknown as (enabled: boolean) => void;
      return { remove: jest.fn() } as unknown as ReturnType<
        typeof AccessibilityInfo.addEventListener
      >;
    });
  const result = await renderAsync(<LivingWorldAnimationEngine {...props} />);
  expect(
    screen.queryAllByTestId("living-sprite-firefly", {
      includeHiddenElements: true,
    }).length,
  ).toBeGreaterThan(0);
  await act(async () => appListener?.("background"));
  expect(
    screen.queryAllByTestId("living-sprite-firefly", {
      includeHiddenElements: true,
    }),
  ).toHaveLength(0);
  await act(async () => appListener?.("active"));
  expect(
    screen.queryAllByTestId("living-sprite-firefly", {
      includeHiddenElements: true,
    }).length,
  ).toBeGreaterThan(0);
  await act(async () => reduceListener?.(true));
  expect(
    screen.queryAllByTestId("living-sprite-firefly", {
      includeHiddenElements: true,
    }),
  ).toHaveLength(0);
  await act(async () => reduceListener?.(false));
  await result.rerenderAsync(
    <LivingWorldAnimationEngine {...props} enabled={false} />,
  );
  expect(
    screen.queryAllByTestId("living-sprite-firefly", {
      includeHiddenElements: true,
    }),
  ).toHaveLength(0);
});
