import React from "react";
import { StyleSheet, Text, View } from "react-native";
import appManifest from "../../app.json";
import { cozy } from "./theme";

/** Release identity is generated from the same Expo manifest used by Gradle. */
export const appVersionLabel = `v${appManifest.expo.version} · build ${appManifest.expo.android.versionCode}`;

export function AppVersion({ testID = "app-version" }: { testID?: string }) {
  return (
    <View
      testID={testID}
      pointerEvents="none"
      accessible={false}
      style={styles.wrap}
    >
      <Text selectable={false} style={styles.label}>
        {appVersionLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(35, 55, 39, 0.78)",
  },
  label: {
    color: cozy.color.cream,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
});
