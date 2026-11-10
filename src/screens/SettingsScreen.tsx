import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaffoldScreen } from "./placeholders";
import { useLocale } from "../i18n/LocaleContext";

export function SettingsScreen() {
  const { t } = useLocale();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <ScaffoldScreen title={t("settings")} note="Stage 5.5: profile, avatar, language, card design, season, accessibility." />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1 },
});
