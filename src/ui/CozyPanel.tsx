import React from "react";
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { cozyRedesignImages } from "../assets/cozyRedesignImages";
import { cozy } from "./theme";

/**
 * Decorative cottage-garden surface.
 * Only the small floral corner images are rasterised; the paper surface
 * and content can resize without stretching illustrations or baked-in text.
 */
export function CozyPanel({
  children,
  style,
  testID,
  ornaments = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  ornaments?: boolean;
}) {
  return (
    <View testID={testID} style={[styles.panel, style]}>
      {ornaments && (
        <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
          <Image
            source={cozyRedesignImages.ui_flower_corner_left_webp}
            resizeMode="contain"
            accessible={false}
            style={styles.leftCorner}
          />
          <Image
            source={cozyRedesignImages.ui_flower_corner_right_webp}
            resizeMode="contain"
            accessible={false}
            style={styles.rightCorner}
          />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: cozy.color.paper,
    borderColor: cozy.color.border,
    borderRadius: cozy.radius.lg,
    borderWidth: 2,
    overflow: "hidden",
    ...cozy.shadow,
  },
  leftCorner: {
    position: "absolute",
    width: 38,
    height: 38,
    left: 3,
    top: 3,
    opacity: 0.7,
  },
  rightCorner: {
    position: "absolute",
    width: 38,
    height: 38,
    right: 3,
    top: 3,
    opacity: 0.7,
  },
});
