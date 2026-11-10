import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CozyPanel } from "../ui/components/CozyPanel";
import { textColors } from "../ui/theme/colors";

/**
 * Honest scaffolds: these tabs are reachable and render real UI chrome (panel +
 * navigation + i18n), but the gameplay itself (Stage 5.2 garden, 5.3 Solitaire,
 * 5.4 minigames/quests) is not implemented yet. Do not mistake a rendering screen
 * for a finished feature — see the Stage 5.1 report for exact scope.
 */
export function ScaffoldScreen({ title, note }: { title: string; note: string }) {
  return (
    <View style={styles.wrapper}>
      <CozyPanel style={styles.panel}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.note}>{note}</Text>
      </CozyPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 16, paddingBottom: 110, justifyContent: "center" },
  panel: { minHeight: 160 },
  title: { fontSize: 20, fontWeight: "700", color: textColors.onLightPanel, marginBottom: 8 },
  note: { fontSize: 14, color: textColors.onLightPanel },
});
