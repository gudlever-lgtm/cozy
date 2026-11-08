import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StrongScrollView } from "../StrongScrollView";
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
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
}: {
  visible: boolean;
  onClose: () => void;
  onEarn: () => void;
}) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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
        <CozyPanel
          testID="undo-help-dialog"
          style={[
            s.panel,
            { maxHeight: Math.max(0, height - insets.top - insets.bottom - 24) },
          ]}
        >
          <StrongScrollView contentContainerStyle={{ gap: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <SvgXml xml={gardenIllustrations.lantern} width={34} height={46} />
              <GameIcon name="undo" size={38} />
            </View>
            <Text accessibilityRole="header" style={s.title}>
              {String(t("undoEmptyTitle"))}
            </Text>
            <Text style={s.body}>{String(t("undoEmptyBody"))}</Text>
            <CozyButton label={String(t("garden"))} onPress={onEarn} />
            <CozyButton label={String(t("close"))} onPress={onClose} quiet />
          </StrongScrollView>
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
    gap: 14,
  },
  title: { fontFamily: cozy.font.title, fontSize: 23, color: cozy.color.ink },
  body: { fontSize: 15, lineHeight: 23, color: cozy.color.muted },
});
