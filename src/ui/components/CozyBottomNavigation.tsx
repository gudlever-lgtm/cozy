import React from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabBackgroundArt from "../../../assets/v3/ui/tab-background.svg";
import GardenIcon from "../../../assets/v3/icons/garden.svg";
import CardsIcon from "../../../assets/v3/icons/cards.svg";
import MiniIcon from "../../../assets/v3/icons/mini.svg";
import QuestsIcon from "../../../assets/v3/icons/quests.svg";
import { bottomTabTokens } from "../theme/layoutTokens";
import { tabBackgroundGeometry } from "../theme/assetGeometry";
import { textColors } from "../theme/colors";
import { NineSliceFrame } from "./NineSliceFrame";

export type NavTabKey = "garden" | "solitaire" | "minigames" | "quests";

const TAB_ICONS: Record<NavTabKey, React.FC<any>> = {
  garden: GardenIcon,
  solitaire: CardsIcon,
  minigames: MiniIcon,
  quests: QuestsIcon,
};

export interface CozyBottomNavigationProps {
  readonly active: NavTabKey;
  readonly onSelect: (tab: NavTabKey) => void;
  readonly labels: Record<NavTabKey, string>;
}

/**
 * assets/v3/ui/tab-background.svg is a self-contained rounded pill bar (600x106 with
 * floral ornaments near its own left/right ends), not a literal edge-to-edge strip —
 * confirmed by inspecting the file's own <rect rx="25"> shape. So this renders it as a
 * floating dock inset from the screen edges (matching how every other Cozy UI frame —
 * buttons, panels — is a self-contained rounded frame), 3-sliced horizontally
 * (NineSliceFrame with insetTop/insetBottom=0) so the two end caps keep their
 * ornaments undistorted while the flat middle stretches to any width.
 */
export function CozyBottomNavigation({ active, onSelect, labels }: CozyBottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = React.useState(0);
  const tabs: NavTabKey[] = ["garden", "solitaire", "minigames", "quests"];
  const height = bottomTabTokens.height;

  const onLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.wrapper, { bottom: 10 + insets.bottom, left: 12, right: 12 }]}>
      <View style={{ height }} onLayout={onLayout}>
        {barWidth > 0 ? (
          <View style={StyleSheet.absoluteFill}>
            <NineSliceFrame
              Source={TabBackgroundArt}
              intrinsicWidth={tabBackgroundGeometry.intrinsicWidth}
              intrinsicHeight={tabBackgroundGeometry.intrinsicHeight}
              insetLeft={tabBackgroundGeometry.inset}
              insetRight={tabBackgroundGeometry.inset}
              insetTop={0}
              insetBottom={0}
              width={barWidth}
              height={height}
            />
          </View>
        ) : null}
        <View style={styles.row}>
          {tabs.map((tab) => {
            const Icon = TAB_ICONS[tab];
            const selected = tab === active;
            return (
              <Pressable
                key={tab}
                onPress={() => onSelect(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={labels[tab]}
                style={[styles.tab, { opacity: selected ? 1 : 0.55 }]}
                hitSlop={4}
              >
                <Icon width={bottomTabTokens.iconSize} height={bottomTabTokens.iconSize} />
                <Text numberOfLines={1} style={[styles.caption, { fontSize: bottomTabTokens.captionFontSize }]}>
                  {labels[tab]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "absolute", zIndex: 6 },
  row: { flex: 1, flexDirection: "row" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  caption: { color: textColors.onLightPanel, fontWeight: "600" },
});
