import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import TabBackgroundArt from "../../../assets/v3/ui/tab-background.svg";
import GardenIcon from "../../../assets/v3/icons/garden.svg";
import CardsIcon from "../../../assets/v3/icons/cards.svg";
import MiniIcon from "../../../assets/v3/icons/mini.svg";
import QuestsIcon from "../../../assets/v3/icons/quests.svg";
import { bottomTabTokens } from "../theme/layoutTokens";
import { textColors } from "../theme/colors";

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
 * docs/ASSET_SPEC.md and docs/UI_COMPONENT_CONTRACT_V3.md do not specify
 * tab-background.svg's intrinsic aspect ratio or whether it is meant to tile or scale
 * as one flat bar — this is an open design question for the owner. Interim choice:
 * non-destructive "meet" scaling (same as every other component here), which may leave
 * uncovered edges on very wide screens until clarified.
 */
export function CozyBottomNavigation({ active, onSelect, labels }: CozyBottomNavigationProps) {
  const tabs: NavTabKey[] = ["garden", "solitaire", "minigames", "quests"];
  return (
    <View style={[styles.wrapper, { height: bottomTabTokens.height }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <TabBackgroundArt width="100%" height="100%" />
      </View>
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
              style={[styles.tab, { opacity: selected ? 1 : 0.6 }]}
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
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "absolute", left: 0, right: 0, bottom: 0 },
  row: { flex: 1, flexDirection: "row" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  caption: { color: textColors.onLightPanel, fontWeight: "600" },
});
