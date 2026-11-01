import React from "react";
import { Animated } from "react-native";
import {
  act,
  renderAsync,
  fireEvent,
  screen,
  waitFor,
  cleanupAsync,
} from "@testing-library/react-native";
import { GardenMatch } from "../../src/GardenMatch";
import { matches, type Match } from "../../src/engine/minigames";
import i18n from "../../src/i18n";
const cells = Array.from(
  { length: 36 },
  (_, i) => ((i % 6) + Math.floor(i / 6)) % 5,
);
cells[0] = 0;
cells[1] = 1;
cells[2] = 0;
cells[7] = 0;
const game: Match = { cells, score: 0, target: 30, turns: 18 };
beforeEach(async () => {
  await i18n.changeLanguage("en");
  // Native-driver completion is unavailable in Jest; retain the configured duration and callback contract.
  jest.spyOn(Animated, "parallel").mockImplementation((animations) => ({
    start: (callback) => {
      let remaining = animations.length;
      for (const animation of animations)
        animation?.start(() => {
          remaining--;
          if (remaining === 0) callback?.({ finished: true });
        });
    },
    stop: () => animations.forEach((a) => a?.stop()),
    reset: () => {},
  }));
  jest.spyOn(Animated, "timing").mockImplementation((value, config) => {
    let timer: ReturnType<typeof setTimeout>;
    return {
      start: (callback) => {
        timer = setTimeout(() => {
          if (value instanceof Animated.ValueXY)
            value.setValue(config.toValue as { x: number; y: number });
          else value.setValue(config.toValue as number);
          callback?.({ finished: true });
        }, config.duration ?? 0);
      },
      stop: () => clearTimeout(timer),
      reset: () => {},
    };
  });
});
afterEach(async () => {
  await cleanupAsync();
  jest.restoreAllMocks();
});
function gesture(index: number, dx: number, dy: number) {
  const board = screen.getByTestId("garden-match-board");
  if (!board.props.onStartShouldSetResponder()) return;
  const cell = (300 - 18) / 6,
    locationX = 9 + (index % 6) * cell + cell / 2,
    locationY = 9 + Math.floor(index / 6) * cell + cell / 2;
  act(() =>
    board.props.onResponderGrant({
      nativeEvent: { locationX, locationY, pageX: 100, pageY: 100 },
    }),
  );
  act(() =>
    board.props.onResponderMove({
      nativeEvent: { pageX: 100 + dx, pageY: 100 + dy },
    }),
  );
  act(() =>
    board.props.onResponderRelease({
      nativeEvent: { pageX: 100 + dx, pageY: 100 + dy },
    }),
  );
}

test("Garden Match uses real swipe events, resolves once and locks repeated input during animation", async () => {
  expect(matches(cells)).toEqual([]);
  const onChange = jest.fn();
  await renderAsync(
    <GardenMatch
      game={game}
      size={300}
      disabled={false}
      reducedMotion={false}
      onChange={onChange}
    />,
  );
  gesture(1, 0, 50);
  gesture(1, 0, 50);
  await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
  const next = onChange.mock.calls[0][0];
  expect(next.score).toBeGreaterThanOrEqual(3);
  expect(next.turns).toBe(17);
});
test("taps and off-board swipes do not move pieces or spend turns", async () => {
  const onChange = jest.fn();
  await renderAsync(
    <GardenMatch
      game={game}
      size={300}
      disabled={false}
      reducedMotion={true}
      onChange={onChange}
    />,
  );
  gesture(1, 0, 0);
  gesture(0, -50, 0);
  expect(onChange).not.toHaveBeenCalled();
});
test("invalid adjacent swap slides back without consuming a turn", async () => {
  const onChange = jest.fn();
  await renderAsync(
    <GardenMatch
      game={game}
      size={300}
      disabled={false}
      reducedMotion={true}
      onChange={onChange}
    />,
  );
  gesture(34, 50, 0);
  await waitFor(() =>
    expect(
      screen
        .getByTestId("garden-match-board")
        .props.onStartShouldSetResponder(),
    ).toBe(true),
  );
  expect(onChange).not.toHaveBeenCalled();
});

test("Garden Match can reach its target through sequential swipes and remains locked after completion", async () => {
  const { newMatch } = require("../../src/engine/minigames");
  let current: Match = { ...game, cells: [...cells] };
  const onChange = jest.fn((next: Match) => {
    current = next;
  });
  const props = () => ({
    game: current,
    size: 300,
    disabled: current.score >= current.target,
    reducedMotion: true,
    onChange,
  });
  const rendered = await renderAsync(<GardenMatch {...props()} />);
  let count = 0;
  while (current.score < current.target && current.turns > 0) {
    let pair: number[] | undefined;
    for (let i = 0; i < 36 && !pair; i++)
      for (const j of [i % 6 < 5 ? i + 1 : -1, i < 30 ? i + 6 : -1]) {
        if (j < 0) continue;
        const next = [...current.cells];
        [next[i], next[j]] = [next[j], next[i]];
        if (matches(next).length) {
          pair = [i, j];
          break;
        }
      }
    if (!pair) {
      current = { ...newMatch(), score: current.score, turns: current.turns };
      await rendered.rerenderAsync(<GardenMatch {...props()} />);
      continue;
    }
    const before = onChange.mock.calls.length;
    gesture(
      pair[0],
      ((pair[1] % 6) - (pair[0] % 6)) * 50,
      (Math.floor(pair[1] / 6) - Math.floor(pair[0] / 6)) * 50,
    );
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(before + 1));
    await waitFor(() =>
      expect(
        screen
          .getByTestId("garden-match-board")
          .props.onStartShouldSetResponder(),
      ).toBe(true),
    );
    await rendered.rerenderAsync(<GardenMatch {...props()} />);
    count++;
  }
  expect(current.score).toBeGreaterThanOrEqual(current.target);
  expect(count).toBeLessThanOrEqual(18);
  expect(
    screen.getByTestId("garden-match-board").props.onStartShouldSetResponder(),
  ).toBe(false);
}, 15000);

test("unmatched stationary pieces retain identity and do not fade with the board", async () => {
  const { planMatchSwap } = require("../../src/engine/minigames");
  jest.spyOn(Math, "random").mockReturnValue(0.17);
  const plan = planMatchSwap(game, 1, 7, () => 0.17);
  let origins: (number | null)[] = Array.from({ length: 36 }, (_, i) => i);
  [origins[1], origins[7]] = [origins[7], origins[1]];
  for (const stage of plan.cascades) {
    const next: (number | null)[] = Array(36).fill(null);
    for (const fall of stage.falls)
      next[fall.to] = fall.from === null ? null : origins[fall.from];
    origins = next;
  }
  const stationary = origins.findIndex(
    (from, i) => from === i && i !== 1 && i !== 7,
  );
  expect(stationary).toBeGreaterThanOrEqual(0);
  const onChange = jest.fn();
  await renderAsync(
    <GardenMatch
      game={game}
      size={300}
      disabled={false}
      reducedMotion
      onChange={onChange}
    />,
  );
  const id = screen.getByTestId(`match-cell-${stationary}`).props.nativeID;
  gesture(1, 0, 50);
  await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
  expect(screen.getByTestId(`match-cell-${stationary}`).props.nativeID).toBe(
    id,
  );
  expect(screen.getByTestId(`match-cell-${stationary}`)).toHaveStyle({
    opacity: 1,
  });
});

test("a missing native completion callback releases input without committing a partial move", async () => {
  jest.spyOn(Animated, "parallel").mockImplementation(() => ({
    start: () => {},
    stop: () => {},
    reset: () => {},
  }));
  const onChange = jest.fn(),
    onBusyChange = jest.fn();
  await renderAsync(
    <GardenMatch
      game={game}
      size={300}
      disabled={false}
      reducedMotion={false}
      onChange={onChange}
      onBusyChange={onBusyChange}
    />,
  );
  gesture(1, 0, 50);
  await waitFor(
    () =>
      expect(
        screen
          .getByTestId("garden-match-board")
          .props.onStartShouldSetResponder(),
      ).toBe(true),
    { timeout: 2000 },
  );
  expect(onBusyChange).toHaveBeenLastCalledWith(false);
  expect(onChange).not.toHaveBeenCalled();
});

test("backgrounding during a drag releases input and restores the authoritative board", async () => {
  const { AppState } = require("react-native");
  let listener: (state: string) => void = () => {};
  jest
    .spyOn(AppState, "addEventListener")
    .mockImplementation((_: unknown, callback: unknown) => {
      listener = callback as typeof listener;
      return { remove: jest.fn() };
    });
  const onChange = jest.fn();
  await renderAsync(
    <GardenMatch
      game={game}
      size={300}
      disabled={false}
      reducedMotion
      onChange={onChange}
    />,
  );
  const board = screen.getByTestId("garden-match-board");
  act(() =>
    board.props.onResponderGrant({
      nativeEvent: { locationX: 80, locationY: 30, pageX: 100, pageY: 100 },
    }),
  );
  act(() => listener("background"));
  act(() => listener("active"));
  expect(
    screen.getByTestId("garden-match-board").props.onStartShouldSetResponder(),
  ).toBe(true);
  expect(onChange).not.toHaveBeenCalled();
  gesture(1, 0, 50);
  await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
});

test("a lost release event expires the idle drag lock", async () => {
  const onChange = jest.fn();
  await renderAsync(
    <GardenMatch
      game={game}
      size={300}
      disabled={false}
      reducedMotion
      onChange={onChange}
    />,
  );
  jest.useFakeTimers();
  try {
    act(() =>
      screen.getByTestId("garden-match-board").props.onResponderGrant({
        nativeEvent: { locationX: 80, locationY: 30, pageX: 100, pageY: 100 },
      }),
    );
    expect(
      screen
        .getByTestId("garden-match-board")
        .props.onStartShouldSetResponder(),
    ).toBe(false);
    act(() => jest.advanceTimersByTime(8001));
    expect(
      screen
        .getByTestId("garden-match-board")
        .props.onStartShouldSetResponder(),
    ).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  } finally {
    jest.useRealTimers();
  }
});
