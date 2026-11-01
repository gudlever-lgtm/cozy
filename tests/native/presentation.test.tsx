import React from "react";
import i18n from "../../src/i18n";
beforeEach(async () => {
  await i18n.changeLanguage("en");
});
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

test("stack picker uses full-sized paged cards rather than a clipped scrolling text list", async () => {
  const { StackCardPicker } = require("../../src/StackCardPicker");
  const onSelect = jest.fn(),
    onClose = jest.fn();
  const cards = Array.from({ length: 11 }, (_, index) => ({
    index,
    card: { id: String(index), rank: index + 2, suit: "♣", up: true },
  }));
  await renderAsync(
    <StackCardPicker
      cards={cards}
      theme="classic"
      cardName={(card: any) => `${card.rank} clubs`}
      onSelect={onSelect}
      onClose={onClose}
    />,
  );
  fireEvent(screen.getByTestId("stack-card-picker"), "layout", {
    nativeEvent: { layout: { width: 600, height: 280 } },
  });
  expect(
    screen.queryByText(
      "Choose a card, then tap a column to move it and the sequence below it.",
    ),
  ).toBeNull();
  expect(screen.getByTestId("stack-choice-0")).toHaveStyle({ height: 150 });
  expect(screen.queryByTestId("stack-choice-5")).toBeNull();
  fireEvent.press(screen.getByRole("button", { name: "Next page" }));
  fireEvent.press(screen.getByTestId("stack-choice-5"));
  expect(onSelect).toHaveBeenCalledWith(5);
  fireEvent.press(screen.getByRole("button", { name: "Close" }));
  expect(onClose).toHaveBeenCalledTimes(1);
});
