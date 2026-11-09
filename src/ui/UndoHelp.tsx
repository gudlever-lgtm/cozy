import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { CozyButton } from "./CozyButton";
import { CozyPanel } from "./CozyPanel";
import { cozy } from "./theme";
import { GameIcon } from "../GameIcon";
import { SvgXml } from "react-native-svg";
import { gardenIllustrations } from "../assets/cozyGardenIllustrations";
export function UndoHelp({
  visible,
  onClose,
  onEarn,
  canPlayMini = true,
}: {
  visible: boolean;
  onClose: () => void;
  onEarn: () => void;
  canPlayMini?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.scrim}>
        <CozyPanel testID="undo-help-dialog" style={s.panel}>
          <View style={s.content}>
            <View style={s.illustration}>
              <SvgXml
                xml={gardenIllustrations.lantern}
                width={34}
                height={46}
              />
              <GameIcon name="undo" size={38} />
            </View>
            <Text
              testID="undo-help-title"
              accessibilityRole="header"
              style={s.title}
            >
              {String(t("undoEmptyTitle"))}
            </Text>
            <Text testID="undo-help-body" style={s.body}>
              {String(t(canPlayMini ? "undoEmptyBody" : "undoEmptyNoMoves"))}
            </Text>
            <CozyButton
              testID="undo-help-earn"
              variant="dialogChoice"
              label={String(t(canPlayMini ? "mini" : "play"))}
              onPress={onEarn}
            />
            <CozyButton
              testID="undo-help-close"
              variant="dialogChoice"
              label={String(t("close"))}
              onPress={onClose}
              quiet
            />
          </View>
        </CozyPanel>
      </View>
    </Modal>
  );
}
const s = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: cozy.color.scrim,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  panel: {
    width: "100%",
    maxWidth: 360,
    padding: 22,
  },
  content: { gap: 14, width: "100%", alignItems: "stretch" },
  illustration: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontFamily: cozy.font.title,
    fontSize: 23,
    color: cozy.color.ink,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: cozy.color.muted,
    textAlign: "center",
  },
});
