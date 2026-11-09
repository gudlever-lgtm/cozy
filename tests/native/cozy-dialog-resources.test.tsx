import React from "react";
import {
  cleanupAsync,
  renderAsync,
  screen,
} from "@testing-library/react-native";
import i18n from "../../src/i18n";
import { number } from "../../src/i18n";
import { CozyPanel } from "../../src/ui/CozyPanel";
import { ResourceBadge } from "../../src/ui/ResourceBadge";
import { Text } from "react-native";
import { ScreenPager } from "../../src/ScreenPager";

afterEach(async () => cleanupAsync());

test("illustrated paper panel retains real accessible content and a stable testID", async () => {
  await renderAsync(
    <CozyPanel testID="paper-dialog">
      <Text>Reward received</Text>
    </CozyPanel>,
  );
  expect(screen.getByTestId("paper-dialog")).toBeOnTheScreen();
  expect(screen.getByText("Reward received")).toBeOnTheScreen();
});

test.each(["da", "en"] as const)(
  "resource badge formats its balance and accessibility label in %s",
  async (language) => {
    await i18n.changeLanguage(language);
    await renderAsync(
      <ResourceBadge icon="glimmer" label="Lysglimt" value={12345} />,
    );
    const formatted = number(12345, language);
    expect(screen.getByText(formatted)).toBeOnTheScreen();
    expect(screen.getByLabelText("Lysglimt: " + formatted)).toBeOnTheScreen();
  },
);

test("paginated screens retain a readable floral header and current page", async () => {
  await i18n.changeLanguage("da");
  await renderAsync(
    <ScreenPager
      id="test-garden-pages"
      title="Min have"
      items={[<Text key="one">Dekoration</Text>]}
    />,
  );
  expect(screen.getByTestId("test-garden-pages-pages")).toBeOnTheScreen();
  expect(screen.getByRole("header", { name: "Min have" })).toBeOnTheScreen();
  expect(screen.getByText("Dekoration")).toBeOnTheScreen();
});
