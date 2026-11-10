import React from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import PanelArt from "../../../assets/v3/ui/panel.svg";
import WidePanelArt from "../../../assets/v3/ui/panel-wide.svg";

export interface CozyPanelProps {
  readonly wide?: boolean;
  readonly scroll?: boolean;
  readonly style?: ViewStyle;
  readonly children: React.ReactNode;
}

/**
 * Panel background art has a fixed intrinsic aspect ratio (720x900 / 820x360) with
 * floral corner ornaments. Content height is driven by the settings/quest lists this
 * wraps, which can be taller than that ratio allows — so, per
 * docs/UI_COMPONENT_CONTRACT_V3.md's explicit fallback ("a documented 9-slice strategy
 * OR an explicitly separate fixed-aspect decorative frame with independently laid out
 * content"), content is laid out independently of the background instead of stretching
 * the art to fit. preserveAspectRatio defaults to "meet" (non-destructive), so the frame
 * never distorts; it may show interior padding above/below short content.
 *
 * OPEN QUESTION for the owner: true 9-slice (fixed corners, repeating/stretching edges
 * only) is not yet implemented — flag if on-device QA finds this frame inset insufficient
 * for long scrollable content.
 */
export function CozyPanel({ wide = false, scroll = false, style, children }: CozyPanelProps) {
  const Art = wide ? WidePanelArt : PanelArt;
  const Content = scroll ? ScrollView : View;
  return (
    <View style={[styles.wrapper, style]}>
      {/* preserveAspectRatio defaults to "meet": uniform scale, centered, never stretched. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Art width="100%" height="100%" />
      </View>
      <Content style={styles.content} contentContainerStyle={scroll ? styles.contentPadding : undefined}>
        {scroll ? children : <View style={styles.contentPadding}>{children}</View>}
      </Content>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 18, overflow: "hidden" },
  content: { flex: 1 },
  contentPadding: { padding: 20 },
});
