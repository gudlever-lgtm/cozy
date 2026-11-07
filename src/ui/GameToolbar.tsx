import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { CozyButton } from "./CozyButton";
export function GameToolbar({
  onNew,
  onUndo,
  onHint,
  onAuto,
  undo,
  canUndo,
  canAuto,
}: {
  onNew: () => void;
  onUndo: () => void;
  onHint: () => void;
  onAuto: () => void;
  undo: number;
  canUndo: boolean;
  canAuto: boolean;
}) {
  const { t } = useTranslation();
  const narrow = useWindowDimensions().width < 420;
  const actionStyle = [s.action, narrow && { flexBasis: "48%" as const }];
  return (
    <View
      testID="solitaire-toolbar"
      style={[s.root, narrow && { flexWrap: "wrap" }]}
    >
      <CozyButton
        label={String(t("newGame"))}
        icon="newGame"
        onPress={onNew}
        compact={!narrow}
        style={actionStyle}
      />
      <CozyButton
        label={String(t("undo"))}
        icon="undo"
        badge={undo}
        onPress={onUndo}
        disabled={!canUndo}
        compact={!narrow}
        quiet
        style={actionStyle}
      />
      <CozyButton
        label={String(t("hint"))}
        icon="hint"
        onPress={onHint}
        compact={!narrow}
        quiet
        style={actionStyle}
      />
      <CozyButton
        label={String(t("auto"))}
        icon="auto"
        onPress={onAuto}
        disabled={!canAuto}
        compact={!narrow}
        quiet
        style={actionStyle}
      />
    </View>
  );
}
const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: 6,
    flexShrink: 0,
  },
  action: { flex: 1, minWidth: 0 },
});
