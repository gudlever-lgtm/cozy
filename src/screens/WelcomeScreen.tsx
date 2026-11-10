import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CozyButton } from "../ui/components/CozyButton";
import { useLocale } from "../i18n/LocaleContext";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { textColors } from "../ui/theme/colors";
import { PREMIUM_LOGO, PREMIUM_LOGO_ASPECT, PREMIUM_WELCOME_BACKGROUND } from "../ui/theme/premiumArt";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

/**
 * A real, interactive screen (not a static mockup): background art, a soft fade/rise
 * entrance, one primary action and one secondary action.
 *
 * Uses the candidate "Premium Art V1" raster pack (assets/v3-premium/, see
 * docs/PREMIUM_ART_IMPORT.md) for the background and logo — CANDIDATE art, not yet
 * owner-approved on a real device. Millie and Marmalade are already painted into
 * welcome-garden-premium.png itself (the embracing rabbit+cat under the tree), so they
 * are not separately overlaid here — doing so would duplicate them. The approved SVG UI
 * chrome (CozyButton, navigation, HUD) is untouched; only the backdrop/logo layer changed.
 *
 * Landscape gets a deliberately different layout (side-by-side, vertically centered)
 * rather than the portrait column simply stretched wide. */
export function WelcomeScreen({ navigation }: Props) {
  const { t } = useLocale();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [entrance]);

  const logoWidth = Math.min(isLandscape ? width * 0.4 : width * 0.72, 380);
  const logoHeight = logoWidth / PREMIUM_LOGO_ASPECT;

  const hero = (
    <View style={styles.hero}>
      <Image source={PREMIUM_LOGO} style={{ width: logoWidth, height: logoHeight }} resizeMode="contain" />
      <Text style={styles.tagline}>{t("welcomeTagline")}</Text>
    </View>
  );
  const actions = (
    <View style={styles.actions}>
      <CozyButton label={t("playNow")} variant="primary" onPress={() => navigation.navigate("Main", { tab: "solitaire" })} />
      <CozyButton label={t("myGarden")} variant="secondary" onPress={() => navigation.navigate("Main", { tab: "garden" })} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Plain full-image cover. A "crop to the sharp band only" variant was tried and
          reverted: at a phone's portrait aspect ratio, forcing the (landscape-shaped)
          sharp band to fill the height requires zooming in ~1.7x, which crops Marmalade
          out of frame entirely — worse than the documented blurred-margin seam it was
          meant to fix. See docs/PREMIUM_ART_IMPORT.md and this pass's report. */}
      {/* react-native-web's Image renders at the asset's bundled intrinsic size
          (768x1280) unless width/height are explicitly set — StyleSheet.absoluteFillObject
          alone (top/left/right/bottom:0, no explicit width/height) does NOT override
          that on web, confirmed via a landscape screenshot showing a blank gap where the
          768px-wide image fell short of an 844px-wide screen. Explicit 100%/100% fixes it. */}
      <Image
        source={PREMIUM_WELCOME_BACKGROUND}
        style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%" }]}
        resizeMode="cover"
      />
      {isLandscape ? (
        <SafeAreaView style={styles.safeLandscape}>
          <Animated.View style={[styles.landscapeLeft, { opacity: entrance }]}>{hero}</Animated.View>
          <Animated.View style={[styles.landscapeRight, { opacity: entrance }]}>{actions}</Animated.View>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={styles.safe}>
          <Animated.View
            style={{
              alignItems: "center",
              opacity: entrance,
              transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            }}
          >
            {hero}
          </Animated.View>
          {actions}
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, justifyContent: "space-between", padding: 24, paddingTop: 56 },
  safeLandscape: { flex: 1, flexDirection: "row", alignItems: "center", padding: 20, gap: 16 },
  landscapeLeft: { flex: 1.2, alignItems: "center", justifyContent: "center" },
  landscapeRight: { flex: 1, alignItems: "center", gap: 14 },
  hero: { alignItems: "center" },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    color: textColors.onDarkWood,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 12,
    textShadowColor: "rgba(43, 36, 32, 0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actions: { gap: 14, alignItems: "center", marginBottom: 24 },
});
