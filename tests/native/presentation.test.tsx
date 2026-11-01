import React from "react";
import {
  renderAsync,
  screen,
  fireEvent,
  cleanupAsync,
} from "@testing-library/react-native";
import { StrongScrollView } from "../../src/StrongScrollView";
import { CardArtwork } from "../../src/CardArtwork";
afterEach(async () => cleanupAsync());
test("long panels retain a high contrast scrollbar and short panels do not", async () => {
  await renderAsync(<StrongScrollView testID="overflow" />);
  fireEvent(screen.getByTestId("overflow"), "layout", {
    nativeEvent: { layout: { height: 200, width: 300 } },
  });
  fireEvent(screen.getByTestId("overflow"), "contentSizeChange", 300, 800);
  expect(screen.getByTestId("strong-scroll-track")).toBeOnTheScreen();
  fireEvent(screen.getByTestId("overflow"), "contentSizeChange", 300, 100);
  expect(screen.queryByTestId("strong-scroll-track")).toBeNull();
});
test.each(["♠", "♥", "♣", "♦"] as const)(
  "each %s card has a single large central suit",
  async (suit) => {
    await renderAsync(
      <CardArtwork
        card={{ id: "face", rank: 3, suit, up: true }}
        theme="classic"
      />,
    );
    expect(screen.getAllByTestId("card-center-suit")).toHaveLength(1);
  },
);
