import React, { useState } from "react";
import { ScrollView, StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from "react-native";
import PanelArt from "../../../assets/v3/ui/panel.svg";
import WidePanelArt from "../../../assets/v3/ui/panel-wide.svg";
import { NineSliceFrame } from "./NineSliceFrame";
import { panelGeometry, panelWideGeometry } from "../theme/assetGeometry";

export interface CozyPanelProps {
  readonly wide?: boolean;
  readonly scroll?: boolean;
  readonly style?: ViewStyle;
  readonly children: React.ReactNode;
}

/**
 * Real 9-slice panel: corners/ornaments render 1:1 from assets/v3/ui/panel(-wide).svg,
 * only the flat paper strips stretch (NineSliceFrame), so the filled cream background
 * and gold border cover the whole frame at any content height — no letterboxing, no
 * thin/incomplete look. Height is measured from the content (onLayout) so panels
 * holding a tall settings/quest list still show the full filled background behind them.
 */
export function CozyPanel({ wide = false, scroll = false, style, children }: CozyPanelProps) {
  const geometry = wide ? panelWideGeometry : panelGeometry;
  const Art = wide ? WidePanelArt : PanelArt;
  const [size, setSize] = useState({ width: 0, height: geometry.intrinsicHeight * 0.4 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };

  const Content = scroll ? ScrollView : View;

  return (
    <View style={[styles.wrapper, style]} onLayout={onLayout}>
      {size.width > 0 ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <NineSliceFrame
            Source={Art}
            intrinsicWidth={geometry.intrinsicWidth}
            intrinsicHeight={geometry.intrinsicHeight}
            insetLeft={geometry.inset}
            insetRight={geometry.inset}
            insetTop={geometry.inset}
            insetBottom={geometry.inset}
            width={size.width}
            height={size.height}
          />
        </View>
      ) : null}
      <Content style={styles.content} contentContainerStyle={scroll ? styles.contentPadding : undefined}>
        {scroll ? children : <View style={styles.contentPadding}>{children}</View>}
      </Content>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 18 },
  content: { flex: 1 },
  // Extra top/left clearance: the panel art's corner flower ornament sits in that corner.
  contentPadding: { paddingHorizontal: 24, paddingTop: 44, paddingBottom: 24 },
});
