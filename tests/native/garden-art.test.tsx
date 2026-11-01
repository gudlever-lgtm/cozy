import React from "react";
import { AppState, AccessibilityInfo, type AppStateStatus } from "react-native";
import {
  renderAsync,
  screen,
  act,
  cleanupAsync,
} from "@testing-library/react-native";
import { HiddenTreasureEffects } from "../../src/HiddenTreasureEffects";
import { GardenDecorations } from "../../src/GardenDecorations";
import { WorldArt } from "../../src/WorldArt";
import i18n from "../../src/i18n";
const opts = { includeHiddenElements: true };
const base = {
  found: [] as string[],
  level: 1 as const,
  width: 600,
  height: 300,
  season: "autumn" as const,
  quality: "medium" as const,
  enabled: true,
  reducedMotion: false,
};
beforeEach(async () => {
  jest.useFakeTimers();
  Object.defineProperty(AppState, "currentState", {
    value: "active",
    configurable: true,
  });
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(false);
  await i18n.changeLanguage("en");
});
afterEach(async () => {
  await cleanupAsync();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test("owned illustrations render once, never capture input, and card themes are not ground objects", async () => {
  await renderAsync(
    <GardenDecorations
      owned={["bridge", "bridge", "flowers", "cards"]}
      width={600}
      height={300}
      enabled={false}
      reducedMotion={false}
    />,
  );
  expect(
    screen.getByTestId("garden-decorations", opts).props.pointerEvents,
  ).toBe("none");
  expect(screen.getAllByTestId("garden-decoration-bridge", opts)).toHaveLength(
    1,
  );
  expect(
    screen.getByTestId("garden-decoration-flowers", opts),
  ).toBeOnTheScreen();
  expect(screen.queryByTestId("garden-decoration-bench", opts)).toBeNull();
  expect(screen.queryByTestId("garden-decoration-cards", opts)).toBeNull();
});
test.each(["spring", "summer", "autumn", "winter"] as const)(
  "forest has bundled illustrated %s artwork",
  async (season) => {
    await renderAsync(<WorldArt area="forest" season={season} levels={{}} />);
    expect(screen.getByTestId(`forest-art-${season}`)).toBeOnTheScreen();
  },
);
test("found objects depart independently as butterflies; final autumn discovery celebrates without intercepting input", async () => {
  const view = await renderAsync(<HiddenTreasureEffects {...base} />);
  await view.rerenderAsync(<HiddenTreasureEffects {...base} found={["key"]} />);
  expect(screen.getByTestId("treasure-flight-key", opts)).toBeOnTheScreen();
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  await view.rerenderAsync(
    <HiddenTreasureEffects {...base} found={["key", "acorn"]} />,
  );
  expect(screen.getByTestId("treasure-flight-acorn", opts)).toBeOnTheScreen();
  await act(async () => {
    jest.advanceTimersByTime(2300);
  });
  expect(screen.queryByTestId("treasure-flight-key", opts)).toBeNull();
  expect(screen.getByTestId("treasure-flight-acorn", opts)).toBeOnTheScreen();
  await view.rerenderAsync(
    <HiddenTreasureEffects
      {...base}
      found={["key", "acorn", "ribbon", "spoon", "button"]}
    />,
  );
  expect(screen.getByTestId("hidden-congratulations")).toHaveTextContent(
    "Congratulations! All treasures found",
  );
  expect(screen.getAllByTestId("treasure-celebration-leaf", opts)).toHaveLength(
    10,
  );
  expect(
    screen.getByTestId("hidden-treasure-effects").props.pointerEvents,
  ).toBe("none");
  await act(async () => {
    jest.advanceTimersByTime(4600);
  });
  expect(screen.queryByTestId("hidden-congratulations")).toBeNull();
  expect(screen.queryAllByTestId(/treasure-flight-/, opts)).toHaveLength(0);
});
test("restoring an already-completed hunt never repeats flights or celebration", async () => {
  await renderAsync(
    <HiddenTreasureEffects
      {...base}
      found={["key", "acorn", "ribbon", "spoon", "button"]}
    />,
  );
  expect(screen.queryByTestId("hidden-congratulations")).toBeNull();
  expect(screen.queryAllByTestId(/treasure-flight-/, opts)).toHaveLength(0);
});
test("reduced-motion completion keeps congratulations but omits flight and falling leaves, including in background", async () => {
  let listener: ((s: AppStateStatus) => void) | undefined;
  jest.spyOn(AppState, "addEventListener").mockImplementation((_type, fn) => {
    listener = fn;
    return { remove: jest.fn() };
  });
  const view = await renderAsync(
    <HiddenTreasureEffects {...base} reducedMotion />,
  );
  await view.rerenderAsync(
    <HiddenTreasureEffects
      {...base}
      reducedMotion
      found={["key", "acorn", "ribbon", "spoon", "button"]}
    />,
  );
  expect(screen.getByTestId("hidden-congratulations")).toBeOnTheScreen();
  expect(screen.queryAllByTestId(/treasure-flight-/, opts)).toHaveLength(0);
  expect(screen.queryAllByTestId(/treasure-celebration-/, opts)).toHaveLength(
    0,
  );
  await act(async () => listener?.("background"));
  expect(screen.queryByTestId("hidden-congratulations")).toBeNull();
});

test("forest structures appear only for purchased building levels", async () => {
  const view = await renderAsync(
    <WorldArt area="forest" season="summer" levels={{}} />,
  );
  expect(screen.queryByTestId("forest-structure-greenhouse", opts)).toBeNull();
  await view.rerenderAsync(
    <WorldArt
      area="forest"
      season="summer"
      levels={{ greenhouse: 1, lookout: 3 }}
    />,
  );
  expect(
    screen.getByTestId("forest-structure-greenhouse", opts),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId("forest-structure-lookout", opts),
  ).toBeOnTheScreen();
});

test.each([
  ["spring", "blossom"],
  ["summer", "blossom"],
  ["autumn", "leaf"],
  ["winter", "snowflake"],
] as const)(
  "%s hunt completion uses appropriate %s artwork",
  async (season, sprite) => {
    const view = await renderAsync(
      <HiddenTreasureEffects {...base} season={season} quality="low" />,
    );
    await view.rerenderAsync(
      <HiddenTreasureEffects
        {...base}
        season={season}
        quality="low"
        found={["key", "acorn", "ribbon", "spoon", "button"]}
      />,
    );
    expect(
      screen.getAllByTestId(`treasure-celebration-${sprite}`, opts),
    ).toHaveLength(6);
  },
);
