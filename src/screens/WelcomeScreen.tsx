import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
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
 * than invented. */
export function WelcomeScreen({ navigation }: Props) {
  const { t } = useLocale();
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [entrance]);

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <GardenBackground width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={{
            opacity: entrance,
            transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          }}
        >
          {/* Plain translucent scrim (not approved artwork) so the title stays legible
              over whichever part of the background art it happens to sit on — the
              garden-spring.svg sun has no fixed safe zone reserved for a text overlay. */}
          <View style={styles.titleScrim}>
            <Text style={styles.title}>Cozy Solitaire</Text>
            <Text style={styles.tagline}>{t("welcomeTagline")}</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.actions, { opacity: entrance }]}>
          <CozyButton label={t("playNow")} variant="primary" onPress={() => navigation.navigate("Main", { tab: "solitaire" })} />
          <CozyButton label={t("myGarden")} variant="secondary" onPress={() => navigation.navigate("Main", { tab: "garden" })} />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, justifyContent: "space-between", padding: 24 },
  titleScrim: {
    marginTop: 40,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(43, 36, 32, 0.38)",
  },
  title: { fontSize: 30, fontWeight: "800", color: textColors.onDarkWood, textAlign: "center" },
  tagline: { fontSize: 14, color: textColors.onDarkWood, textAlign: "center", marginTop: 8 },
  actions: { gap: 14, alignItems: "center", marginBottom: 24 },
});
