import React from "react";
import {
  AppState,
  AccessibilityInfo,
  type AppStateStatus,
  type View,
} from "react-native";
import {
  renderAsync,
  screen,
  act,
  cleanupAsync,
} from "@testing-library/react-native";
import {
  IdleFirefly,
  IDLE_HINT_DELAY,
  measureHintNode,
} from "../../src/living/IdleFirefly";
const settings = {
  enabled: true,
  reducedMotion: false,
  activity: 0,
  paused: false,
};
const query = (id: string) =>
  screen.queryByTestId(id, { includeHiddenElements: true });
async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}
beforeEach(() => {
  jest.useFakeTimers();
  Object.defineProperty(AppState, "currentState", {
    value: "active",
    configurable: true,
  });
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(false);
});
afterEach(async () => {
  await cleanupAsync();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test("idle firefly waits, resolves once, never intercepts touches and disappears on new activity", async () => {
  const resolve = jest.fn(() => [
    { x: 70, y: 40 },
    { x: 140, y: 80 },
  ]);
  const view = await renderAsync(
    <IdleFirefly settings={settings} revision={1} resolve={resolve} />,
  );
  expect(query("idle-hint-layer")?.props.pointerEvents).toBe("none");
  expect(query("idle-hint-layer")?.props.accessibilityElementsHidden).toBe(
    true,
  );
  await advance(IDLE_HINT_DELAY - 1);
  expect(resolve).not.toHaveBeenCalled();
  await advance(1);
  expect(query("idle-hint-firefly")).not.toBeNull();
  expect(resolve).toHaveBeenCalledTimes(1);
  await view.rerenderAsync(
    <IdleFirefly
      settings={{ ...settings, activity: 1, paused: true }}
      revision={1}
      resolve={resolve}
    />,
  );
  expect(query("idle-hint-firefly")).toBeNull();
  await advance(30000);
  expect(resolve).toHaveBeenCalledTimes(1);
  await view.rerenderAsync(
    <IdleFirefly
      settings={{ ...settings, activity: 2 }}
      revision={1}
      resolve={resolve}
    />,
  );
  await advance(IDLE_HINT_DELAY);
  expect(resolve).toHaveBeenCalledTimes(2);
  await advance(70000);
  expect(query("idle-hint-firefly")).toBeNull();
  expect(resolve).toHaveBeenCalledTimes(2);
});

test("idle hints respect animation off, reduced motion and background even in reduced-motion mode", async () => {
  let app: ((state: AppStateStatus) => void) | undefined;
  jest
    .spyOn(AppState, "addEventListener")
    .mockImplementation((_type, listener) => {
      app = listener;
      return { remove: jest.fn() };
    });
  const resolve = jest.fn(() => [{ x: 70, y: 40 }]);
  const view = await renderAsync(
    <IdleFirefly
      settings={{ ...settings, enabled: false }}
      revision={1}
      resolve={resolve}
    />,
  );
  await advance(20000);
  expect(resolve).not.toHaveBeenCalled();
  await view.rerenderAsync(
    <IdleFirefly
      settings={{ ...settings, reducedMotion: true }}
      revision={1}
      resolve={resolve}
    />,
  );
  await advance(IDLE_HINT_DELAY);
  expect(query("idle-hint-static")).not.toBeNull();
  expect(query("idle-hint-firefly")).toBeNull();
  await act(async () => app?.("background"));
  expect(query("idle-hint-static")).toBeNull();
  await advance(20000);
  expect(resolve).toHaveBeenCalledTimes(1);
  await act(async () => app?.("active"));
  await advance(IDLE_HINT_DELAY - 1);
  expect(resolve).toHaveBeenCalledTimes(1);
  await advance(1);
  expect(resolve).toHaveBeenCalledTimes(2);
});

test("idle hint revisions reset the delay and cancelled asynchronous targets cannot appear", async () => {
  let done: ((points: { x: number; y: number }[]) => void) | undefined;
  const resolve = jest.fn(
    () =>
      new Promise<{ x: number; y: number }[]>((r) => {
        done = r;
      }),
  );
  const view = await renderAsync(
    <IdleFirefly settings={settings} revision={1} resolve={resolve} />,
  );
  await advance(IDLE_HINT_DELAY - 100);
  await view.rerenderAsync(
    <IdleFirefly settings={settings} revision={2} resolve={resolve} />,
  );
  await advance(100);
  expect(resolve).not.toHaveBeenCalled();
  await advance(IDLE_HINT_DELAY - 100);
  expect(resolve).toHaveBeenCalledTimes(1);
  await view.rerenderAsync(
    <IdleFirefly
      settings={{ ...settings, paused: true }}
      revision={2}
      resolve={resolve}
    />,
  );
  await act(async () => done?.([{ x: 40, y: 30 }]));
  expect(query("idle-hint-firefly")).toBeNull();
});

test("native hint measurements reject missing, empty or unresponsive anchors", async () => {
  expect(await measureHintNode(null)).toBeNull();
  const node = (width: number) =>
    ({
      measureInWindow: (
        cb: (x: number, y: number, w: number, h: number) => void,
      ) => cb(50, 60, width, 40),
    }) as unknown as View;
  expect(await measureHintNode(node(30))).toEqual({
    x: 50,
    y: 60,
    width: 30,
    height: 40,
  });
  expect(await measureHintNode(node(0))).toBeNull();
  const pending = measureHintNode({
    measureInWindow: () => {},
  } as unknown as View);
  await advance(200);
  expect(await pending).toBeNull();
});
