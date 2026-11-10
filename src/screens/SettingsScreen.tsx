import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CozyPanel } from "../ui/components/CozyPanel";
import { CozyButton } from "../ui/components/CozyButton";
import { CozyAvatar, AVATAR_KEYS, type AvatarKey } from "../ui/components/CozyAvatar";
import { PlayingCard } from "../ui/components/PlayingCard";
import { useLocale } from "../i18n/LocaleContext";
import { usePreferences } from "../ui/providers/PreferencesContext";
import { AVATAR_LABEL_KEY, CARD_BACK_LABEL_KEY, CARD_FACE_LABEL_KEY, SEASON_LABEL_KEY } from "../ui/theme/settingsLabels";
import type { CardBackStyle, CardFaceStyle, SeasonOverride } from "../application/preferencesStore";
import type { Season } from "../domain/garden/types";
import { textColors } from "../ui/theme/colors";
import type { Locale } from "../i18n/strings";

const CARD_FACE_STYLES: readonly CardFaceStyle[] = ["blank", "botanical", "woodland"];
const CARD_BACK_STYLES: readonly CardBackStyle[] = ["botanical", "stars", "woodland"];
const SEASONS: readonly Season[] = ["spring", "summer", "autumn", "winter"];
const LOCALES: readonly Locale[] = ["da", "en"];

export function SettingsScreen() {
  const { t, locale, setLocale } = useLocale();
  const { preferences, setPreferences } = usePreferences();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <CozyPanel wide style={styles.panel}>
          <Text style={styles.sectionTitle}>{t("settingsProfile")}</Text>
          <Text style={styles.label}>{t("settingsPlayerName")}</Text>
          <TextInput
            value={preferences.playerName}
            onChangeText={(text) => setPreferences({ playerName: text })}
            placeholder={t("settingsPlayerNamePlaceholder")}
            placeholderTextColor={textColors.onLightPanel}
            style={styles.input}
            maxLength={24}
          />
          <Text style={styles.label}>{t("settingsAvatar")}</Text>
          <View style={styles.row}>
            {AVATAR_KEYS.map((key: AvatarKey) => (
              <CozyAvatar
                key={key}
                avatarKey={key}
                size={56}
                selected={preferences.avatarKey === key}
                onPress={() => setPreferences({ avatarKey: key })}
                accessibilityLabel={t(AVATAR_LABEL_KEY[key])}
              />
            ))}
          </View>
        </CozyPanel>

        <CozyPanel wide style={styles.panel}>
          <Text style={styles.sectionTitle}>{t("settingsLanguage")}</Text>
          <View style={styles.row}>
            {LOCALES.map((loc) => (
              <CozyButton
                key={loc}
                label={loc === "da" ? "Dansk" : "English"}
                variant={locale === loc ? "primary" : "secondary"}
                onPress={() => setLocale(loc)}
              />
            ))}
          </View>
        </CozyPanel>

        <CozyPanel wide style={styles.panel}>
          <Text style={styles.sectionTitle}>{t("settingsCardFace")}</Text>
          <View style={styles.row}>
            {CARD_FACE_STYLES.map((style) => (
              <Pressable
                key={style}
                onPress={() => setPreferences({ faceStyle: style })}
                accessibilityRole="button"
                accessibilityLabel={t(CARD_FACE_LABEL_KEY[style])}
                accessibilityState={{ selected: preferences.faceStyle === style }}
                style={styles.cardPick}
              >
                <PlayingCard
                  card={{ id: "preview", suit: "hearts", rank: 1, faceUp: true }}
                  width={56}
                  faceStyle={style}
                  backStyle={preferences.backStyle}
                  highlighted={preferences.faceStyle === style}
                />
                <Text style={styles.cardPickLabel}>{t(CARD_FACE_LABEL_KEY[style])}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t("settingsCardBack")}</Text>
          <View style={styles.row}>
            {CARD_BACK_STYLES.map((style) => (
              <Pressable
                key={style}
                onPress={() => setPreferences({ backStyle: style })}
                accessibilityRole="button"
                accessibilityLabel={t(CARD_BACK_LABEL_KEY[style])}
                accessibilityState={{ selected: preferences.backStyle === style }}
                style={styles.cardPick}
              >
                <PlayingCard
                  card={{ id: "preview", suit: "hearts", rank: 1, faceUp: false }}
                  width={56}
                  faceStyle={preferences.faceStyle}
                  backStyle={style}
                  highlighted={preferences.backStyle === style}
                />
                <Text style={styles.cardPickLabel}>{t(CARD_BACK_LABEL_KEY[style])}</Text>
              </Pressable>
            ))}
          </View>
        </CozyPanel>

        <CozyPanel wide style={styles.panel}>
          <Text style={styles.sectionTitle}>{t("settingsSeason")}</Text>
          <View style={styles.row}>
            <CozyButton
              label={t("settingsAutomatic")}
              variant={preferences.seasonOverride === "automatic" ? "primary" : "secondary"}
              onPress={() => setPreferences({ seasonOverride: "automatic" as SeasonOverride })}
            />
            {SEASONS.map((season) => (
              <CozyButton
                key={season}
                label={t(SEASON_LABEL_KEY[season])}
                variant={preferences.seasonOverride === season ? "primary" : "secondary"}
                onPress={() => setPreferences({ seasonOverride: season as SeasonOverride })}
              />
            ))}
          </View>
        </CozyPanel>

        <CozyPanel wide style={styles.panel}>
          <Text style={styles.sectionTitle}>{t("settingsAccessibility")}</Text>
          <View style={styles.row}>
            <CozyButton
              label={preferences.reducedMotion ? t("settingsReducedMotion") + " ✓" : t("settingsReducedMotion")}
              variant={preferences.reducedMotion ? "primary" : "secondary"}
              onPress={() => setPreferences({ reducedMotion: !preferences.reducedMotion })}
            />
          </View>
          <Text style={styles.hint}>{t("settingsReducedMotionHint")}</Text>
        </CozyPanel>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 110, gap: 14 },
  panel: { minHeight: 0, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: textColors.onLightPanel, marginBottom: 10 },
  label: { fontSize: 13, color: textColors.onLightPanel, marginTop: 12, marginBottom: 6 },
  hint: { fontSize: 12, color: textColors.onLightPanel, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: textColors.onLightPanel,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: textColors.onLightPanel,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" },
  cardPick: { alignItems: "center", gap: 4 },
  cardPickLabel: { fontSize: 11, color: textColors.onLightPanel },
});
