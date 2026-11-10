import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import GardenBackground from "../../assets/v3/backgrounds/garden-spring.svg";
import { CozyButton } from "../ui/components/CozyButton";
import { useLocale } from "../i18n/LocaleContext";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { textColors } from "../ui/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

/** A real, interactive screen (not a static mockup): background art, a soft fade/rise
 * entrance, one primary action and one secondary action. Millie/Marmalade character
 * art is not in assets/v3/ (only avatar icons exist there, no standalone "Millie" /
 * "Marmalade" character illustrations) — flagged as missing reference material rather
 * than invented.
 *
 * Landscape gets a deliberately different layout (side-by-side, vertically centered)
 * rather than the portrait column simply stretched wide — a stretched portrait column
 * would leave the hero text far from the buttons with a lot of dead space between. */
export function WelcomeScreen({ navigation }: Props) {
  const { t } = useLocale();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [entrance]);

  const hero = (
    <View style={styles.titleScrim}>
      <Text style={styles.title}>Cozy Solitaire</Text>
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
  safe: { flex: 1, justifyContent: "space-between", padding: 24 },
  safeLandscape: { flex: 1, flexDirection: "row", alignItems: "center", padding: 20, gap: 16 },
  landscapeLeft: { flex: 1.2, justifyContent: "center" },
  landscapeRight: { flex: 1, alignItems: "center", gap: 14 },
  titleScrim: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(43, 36, 32, 0.38)",
  },
  title: { fontSize: 28, fontWeight: "800", color: textColors.onDarkWood, textAlign: "center" },
  tagline: { fontSize: 14, color: textColors.onDarkWood, textAlign: "center", marginTop: 8 },
  actions: { gap: 14, alignItems: "center", marginBottom: 24 },
});
