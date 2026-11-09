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
  const actionStyle = [s.action, narrow && s.narrowAction];
  return (
    <View testID="solitaire-toolbar" style={[s.root, narrow && s.narrowRoot]}>
      <CozyButton
        testID="solitaire-action-new"
        label={String(t("newGame"))}
        icon="newGame"
        onPress={onNew}
        compact={!narrow}
        variant="toolbarAction"
        style={actionStyle}
      />
      <CozyButton
        testID="solitaire-action-undo"
        label={String(t("undo"))}
        icon="undo"
        badge={undo}
        onPress={onUndo}
        disabled={!canUndo}
        compact={!narrow}
        quiet
        variant="toolbarAction"
        style={actionStyle}
      />
      <CozyButton
        testID="solitaire-action-hint"
        label={String(t("hint"))}
        icon="hint"
        onPress={onHint}
        compact={!narrow}
        quiet
        variant="toolbarAction"
        style={actionStyle}
      />
      <CozyButton
        testID="solitaire-action-auto"
        label={String(t("auto"))}
        icon="auto"
        onPress={onAuto}
        selected={canAuto ? true : undefined}
        compact={!narrow}
        quiet={!canAuto}
        variant="toolbarAction"
        style={actionStyle}
      />
    </View>
  );
}
const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    flexShrink: 0,
  },
  narrowRoot: { flexWrap: "wrap", justifyContent: "space-between" },
  action: { flex: 1, minWidth: 0, minHeight: 92 },
  narrowAction: { flexBasis: "46%", flexGrow: 1, minHeight: 92 },
});
