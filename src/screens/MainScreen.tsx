import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CozyBottomNavigation, type NavTabKey } from "../ui/components/CozyBottomNavigation";
import { CozyIconButton } from "../ui/components/CozyIconButton";
import SettingsIcon from "../../assets/v3/icons/settings.svg";
import { ScaffoldScreen } from "./placeholders";
import { GardenScreen } from "./GardenScreen";
import { useLocale } from "../i18n/LocaleContext";
import type { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

export function MainScreen({ navigation, route }: Props) {
  const { t } = useLocale();
  const [active, setActive] = useState<NavTabKey>(route.params?.tab ?? "garden");

  const screens: Record<NavTabKey, React.ReactNode> = {
    garden: <GardenScreen />,
    solitaire: <ScaffoldScreen title={t("solitaire")} note="Stage 5.3: full Klondike board wired to the Stage 1 engine." />,
    minigames: <ScaffoldScreen title={t("minigames")} note="Stage 5.4: Memory (Stage 4 engine) is the only real minigame so far." />,
    quests: <ScaffoldScreen title={t("quests")} note="Stage 5.4: quest list wired to the Stage 2 reward ledger." />,
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={["top"]} pointerEvents="box-none">
        <View style={styles.headerRow} pointerEvents="box-none">
          <CozyIconButton
            icon={SettingsIcon}
            accessibilityLabel={t("settings")}
            longPressHint={t("settings")}
            onPress={() => navigation.navigate("Settings")}
          />
        </View>
      </SafeAreaView>
      <View style={styles.body}>{screens[active]}</View>
      <CozyBottomNavigation
        active={active}
        onSelect={setActive}
        labels={{ garden: t("garden"), solitaire: t("solitaire"), minigames: t("minigames"), quests: t("quests") }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 5 },
  headerRow: { flexDirection: "row", justifyContent: "flex-end", padding: 12 },
  body: { flex: 1 },
});
