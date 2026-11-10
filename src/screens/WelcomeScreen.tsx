import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import GardenBackground from "../../assets/v3/backgrounds/garden-spring.svg";
import HeaderBanner from "../../assets/v3/ui/header-banner.svg";
import { CozyButton } from "../ui/components/CozyButton";
import { useLocale } from "../i18n/LocaleContext";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { textColors } from "../ui/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

const BANNER_ASPECT = 680 / 142;

/** A real, interactive screen (not a static mockup): background art, a soft fade/rise
 * entrance, one primary action and one secondary action.
 *
 * Missing reference material (see docs/STAGE5_MISSING_ASSETS.md): there is no
 * illustrated "Cozy Solitaire" logotype and no Millie/Marmalade character art in
 * assets/v3/ — only animal avatar icons exist, which are not those two named
 * characters. The title uses assets/v3/ui/header-banner.svg (an approved wooden
 * signboard frame already in the pack, just not wired to any screen yet) rather than
 * an invented dark box or plain text, but this is NOT a substitute for a real logo;
 * it is flagged as a gap, not shipped as if it were final art.
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

  const bannerWidth = Math.min(isLandscape ? width * 0.42 : width * 0.78, 420);
  const bannerHeight = bannerWidth / BANNER_ASPECT;

  const hero = (
    <View style={styles.hero}>
      <View style={{ width: bannerWidth, height: bannerHeight }}>
        <HeaderBanner width="100%" height="100%" />
        <View style={styles.bannerTextSlot} pointerEvents="none">
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            Cozy Solitaire
          </Text>
        </View>
      </View>
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
      <View style={StyleSheet.absoluteFill}>
        <GardenBackground width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>
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
  bannerTextSlot: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", paddingHorizontal: "18%" },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: textColors.onLightPanel,
    textAlign: "center",
  },
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
