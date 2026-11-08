import React from "react";
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StrongScrollView } from "./StrongScrollView";
import { CozyButton } from "./ui/CozyButton";
import { cozy } from "./ui/theme";
import { SvgXml } from "react-native-svg";
import { gardenIllustrations } from "./assets/cozyGardenIllustrations";
import { cozyRedesignImages } from "./assets/cozyRedesignImages";
import { cozyImages } from "./assets/images";
export type MenuDestination =
  | "garden"
  | "play"
  | "mini"
  | "world"
  | "quests"
  | "decorations"
  | "collection"
  | "inventory"
  | "statistics"
  | "settings"
  | "forest"
  | "earn"
  | "newDeal"
  | "restartDeal"
  | "rules"
  | "challenge";
export function MainMenu({
  visible,
  onClose,
  onNavigate,
  forestUnlocked,
}: {
  visible: boolean;
  onClose: () => void;
  onNavigate: (id: MenuDestination) => void;
  forestUnlocked: boolean;
}) {
  const { t } = useTranslation(),
    { width } = useWindowDimensions(),
    insets = useSafeAreaInsets();
  const primary: { id: MenuDestination; key: string; icon: string }[] = [
    { id: "newDeal", key: "newGame", icon: "newGame" },
    { id: "garden", key: "garden", icon: "garden" },
    { id: "mini", key: "mini", icon: "match" },
    { id: "decorations", key: "buildGarden", icon: "decorations" },
    { id: "quests", key: "quests", icon: "quests" },
    { id: "world", key: "world", icon: "world" },
    { id: "settings", key: "settings", icon: "settings" },
  ];
  const secondary: typeof primary = [
    { id: "collection", key: "gardenCollection", icon: "decorations" },
    { id: "inventory", key: "inventory", icon: "inventory" },
    { id: "statistics", key: "statistics", icon: "statistics" },
    { id: "rules", key: "help", icon: "help" },
    { id: "restartDeal", key: "restart", icon: "restart" },
    { id: "challenge", key: "challengeTitle", icon: "challenge" },
    ...(forestUnlocked
      ? [{ id: "forest" as const, key: "exploreForest", icon: "world" }]
      : []),
  ];
  return (
    <Modal
      testID="main-menu-modal"
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={[
          s.scrim,
          {
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 10,
            paddingLeft: insets.left + 12,
            paddingRight: insets.right + 12,
          },
        ]}
      >
        <View testID="main-menu" style={s.panel}>
          <View style={s.header}>
            <Image source={cozyImages.gardenPortrait} style={StyleSheet.absoluteFillObject} resizeMode="cover" accessible={false} />
            <View pointerEvents="none" style={s.headerTint} />
            <Image source={cozyRedesignImages.decorations_pink_hydrangea_webp} style={{ width: 46, height: 46 }} resizeMode="contain" accessible={false} />
            <View style={{ flex: 1 }}>
              <Text style={s.brand}>Cozy Solitaire</Text>
              <Text style={s.subtitle}>{String(t("menuSubtitle"))}</Text>
            </View>
            <CozyButton
              label={String(t("close"))}
              onPress={onClose}
              quiet
              compact
            />
          </View>
          <View pointerEvents="none" style={s.flowerDivider}>
            <SvgXml xml={gardenIllustrations.branch} width="100%" height={24} />
          </View>
          <StrongScrollView
            testID="main-menu-scroll"
            contentContainerStyle={{ gap: 12, padding: 12 }}
          >
            <Text accessibilityRole="header" style={s.title}>
              {String(t("mainMenu"))}
            </Text>
            <View style={s.grid}>
              {[...primary, ...secondary].map((item, index) => (
                <CozyButton
                  key={item.id}
                  testID={`menu-${item.id}`}
                  label={String(t(item.key))}
                  icon={item.icon}
                  onPress={() => onNavigate(item.id)}
                  quiet={index >= primary.length}
                  style={{ width: width < 350 ? "100%" : "48%", minHeight: 52 }}
                />
              ))}
            </View>
          </StrongScrollView>
          <View style={{ padding: 10 }}>
            <CozyButton
              label={String(t("returnToGame"))}
              onPress={onClose}
              quiet
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
const s = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: cozy.color.scrim,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    width: "100%",
    maxWidth: 680,
    height: "96%",
    maxHeight: 600,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: cozy.color.border,
    backgroundColor: cozy.color.paper,
    overflow: "hidden",
    ...cozy.shadow,
  },
  headerTint: { ...StyleSheet.absoluteFillObject, backgroundColor: "#342c22b3" },
  header: {
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    backgroundColor: cozy.color.woodDark,
  },
  flowerDivider: { height: 24, backgroundColor: cozy.color.paper, alignItems: "center" },
  brand: {
    fontSize: 26,
    fontFamily: cozy.font.title,
    fontWeight: "700",
    color: cozy.color.cream,
  },
  subtitle: { fontSize: 11, color: cozy.color.honey, marginTop: 3 },
  title: { fontSize: 20, fontFamily: cozy.font.title, color: cozy.color.ink },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
});
