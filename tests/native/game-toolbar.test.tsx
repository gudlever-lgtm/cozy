import React from "react";
import { renderAsync, screen, fireEvent, cleanupAsync } from "@testing-library/react-native";
import { GameToolbar } from "../../src/ui/GameToolbar";

afterEach(async () => cleanupAsync());

test("Undo action remains tappable with no history and invokes feedback handler", async () => {
  const events: string[] = [];
  await renderAsync(
    <GameToolbar
      onNew={() => events.push("new")}
      onUndo={() => events.push("undo")}
      onHint={() => events.push("hint")}
      onAuto={() => events.push("auto")}
      undo={0}
      canUndo={true}
      canAuto={false}
    />,
  );
  fireEvent.press(screen.getByRole("button", { name: "undo" }));
  expect(events).toEqual(["undo"]);
  fireEvent.press(screen.getByRole("button", { name: "newGame" }));
  expect(events).toEqual(["undo", "new"]);
  // Auto-finish remains clickable even before the board is ready so the handler can explain why.
  fireEvent.press(screen.getByRole("button", { name: "auto" }));
  expect(events).toEqual(["undo", "new", "auto"]);
});
