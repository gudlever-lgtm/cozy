import React from "react";
import { cleanupAsync, renderAsync, screen } from "@testing-library/react-native";
import { CozyButton } from "../../src/ui/CozyButton";
import { cozyRedesignImages } from "../../src/assets/cozyRedesignImages";

afterEach(async () => cleanupAsync());

test.each([
  ["primary", false, undefined, cozyRedesignImages.ui_button_wood_webp],
  ["secondary", true, undefined, cozyRedesignImages.ui_button_paper_webp],
  ["selected", true, true, cozyRedesignImages.ui_button_green_webp],
  ["disabled", false, undefined, cozyRedesignImages.ui_button_wood_webp],
] as const)(
  "%s cottage control uses its actual bundled button image",
  async (kind, quiet, selected, expected) => {
    await renderAsync(
      <CozyButton
        label="Play"
        testID={kind}
        quiet={quiet}
        selected={selected}
        disabled={kind === "disabled"}
        onPress={() => {}}
      />,
    );
    const art = screen.getByTestId(`${kind}-art`);
    expect(art.props.source).toBe(kind === "disabled"
      ? cozyRedesignImages.ui_button_paper_webp
      : expected);
    expect(art.props.resizeMode).toBe("stretch");
  },
);
