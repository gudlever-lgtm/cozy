import { cozy } from "./ui/theme";
import React, { useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import type { Save } from "./engine/save";
import { seasonAt } from "./engine/world";
import { cozyImages } from "./assets/images";
import { LivingWorldAnimationEngine } from "./living/LivingWorldAnimationEngine";
import { useMotionStatus } from "./living/useMotionPolicy";
import { StrongScrollView } from "./StrongScrollView";
export function AnimationPanel({
  save,
  onUpdate,
  onClose,
}: {
  save: Save;
  onUpdate: (fn: (save: Save) => Save) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation(),
    p = save.preferences,
    season = p.season === "auto" ? seasonAt(new Date()) : p.season;
  const [size, setSize] = useState({ width: 260, height: 180 }),
    motion = useMotionStatus(p.animations, p.reducedMotion);
  const status = {
    off: "motionOff",
    system: "motionSystem",
    manual: "motionManual",
    background: "motionBackground",
    running: "motionRunning",
  }[motion.reason];
  return (
    <View testID="animation-panel" style={s.dialog}>
      <View style={s.header}>
        <Text style={s.title}>{String(t("animations"))}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={String(t("close"))}
          onPress={onClose}
          style={s.button}
        >
          <Text style={s.label}>×</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1, minHeight: 0, flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <View
            style={s.preview}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              if (width > 0 && height > 0)
                setSize((old) =>
                  old.width === width && old.height === height
                    ? old
                    : { width, height },
                );
            }}
          >
            <Image
              source={cozyImages.seasons[season]}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LivingWorldAnimationEngine
              season={season}
              enabled={p.animations}
              reducedMotion={p.reducedMotion}
              quality={p.animationQuality}
              intensity={p.weather}
              width={size.width}
              height={size.height}
              time={p.time}
              preview
            />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}>
            {(["auto", "spring", "summer", "autumn", "winter"] as const).map(
              (value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={
                    String(t("season")) +
                    ": " +
                    String(t(value === "auto" ? "automatic" : value))
                  }
                  accessibilityState={{ selected: p.season === value }}
                  onPress={() =>
                    onUpdate((s) => ({
                      ...s,
                      preferences: { ...s.preferences, season: value },
                    }))
                  }
                  style={[
                    s.button,
                    { width: 44, padding: 2 },
                    p.season === value && {
                      borderColor: cozy.color.ink,
                      borderWidth: 2,
                    },
                  ]}
                >
                  {value === "auto" ? (
                    <Text style={s.note}>Auto</Text>
                  ) : (
                    <Image
                      source={cozyImages.seasons[value]}
                      resizeMode="cover"
                      style={{ width: 36, height: 32, borderRadius: 7 }}
                    />
                  )}
                </Pressable>
              ),
            )}
          </View>
          <Text style={s.note}>
            {String(
              t(
                motion.active && p.weather === 0 ? "motionNoParticles" : status,
              ),
            )}
          </Text>
        </View>
        <StrongScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 8, padding: 2 }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              String(t("animations")) +
              ": " +
              String(t(p.animations ? "on" : "off"))
            }
            onPress={() =>
              onUpdate((s) => ({
                ...s,
                preferences: {
                  ...s.preferences,
                  animations: !s.preferences.animations,
                },
              }))
            }
            style={s.control}
          >
            <Text style={s.label}>{String(t("animations"))}</Text>
            <Text style={s.label}>
              {String(t(p.animations ? "on" : "off"))}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              String(t("reducedMotion")) +
              ": " +
              String(t(p.reducedMotion ? "on" : "off"))
            }
            onPress={() =>
              onUpdate((s) => ({
                ...s,
                preferences: {
                  ...s.preferences,
                  reducedMotion: !s.preferences.reducedMotion,
                },
              }))
            }
            style={s.control}
          >
            <Text style={s.note}>{String(t("reducedMotion"))}</Text>
            <Text style={s.label}>
              {String(t(p.reducedMotion ? "on" : "off"))}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              String(t("weather")) + ": " + Math.round(p.weather * 100) + "%"
            }
            onPress={() =>
              onUpdate((s) => ({
                ...s,
                preferences: {
                  ...s.preferences,
                  weather:
                    s.preferences.weather === 0
                      ? 0.4
                      : s.preferences.weather < 1
                        ? 1
                        : 0,
                },
              }))
            }
            style={s.control}
          >
            <Text style={s.note}>{String(t("weather"))}</Text>
            <Text style={s.label}>{Math.round(p.weather * 100)}%</Text>
          </Pressable>
          <Text style={s.note}>{String(t("animationQuality"))}</Text>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {(["low", "medium", "high"] as const).map((q) => (
              <Pressable
                key={q}
                accessibilityRole="button"
                accessibilityLabel={
                  String(t("animationQuality")) + ": " + String(t(q))
                }
                accessibilityState={{ selected: p.animationQuality === q }}
                onPress={() =>
                  onUpdate((s) => ({
                    ...s,
                    preferences: { ...s.preferences, animationQuality: q },
                  }))
                }
                style={[
                  s.button,
                  { flex: 1 },
                  p.animationQuality === q && {
                    borderColor: cozy.color.ink,
                    borderWidth: 2,
                  },
                ]}
              >
                <Text style={s.note}>{String(t(q))}</Text>
              </Pressable>
            ))}
          </View>
        </StrongScrollView>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  dialog: {
    width: "96%",
    height: "90%",
    maxWidth: 900,
    padding: 12,
    gap: 10,
    borderRadius: 20,
    backgroundColor: cozy.color.paper,
  },
  header: { height: 44, flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, fontSize: 22, fontFamily: "serif", color: cozy.color.ink },
  button: {
    minWidth: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cabd9d",
    backgroundColor: "#fff5df",
  },
  preview: { flex: 1, minHeight: 50, borderRadius: 16, overflow: "hidden" },
  control: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: "#d2c395",
    borderRadius: 12,
    backgroundColor: "#fff5df",
  },
  label: { fontSize: 14, color: cozy.color.ink, fontWeight: "600" },
  note: { fontSize: 12, lineHeight: 16, color: "#526c50" },
});
