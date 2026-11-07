import { cozy } from "./ui/theme";
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import type { Save } from "./engine/save";
import { stories, storyProgress, claimStory } from "./engine/progression";
import type { MiniKind } from "./engine/session";
import { GameIcon } from "./GameIcon";
import { StrongScrollView } from "./StrongScrollView";
export function ForestGuide({
  save,
  bottom = 6,
  availableHeight = 180,
  onUpdate,
  onGather,
  onGame,
  onManage,
  onNext,
  onToast,
}: {
  save: Save;
  bottom?: number;
  availableHeight?: number;
  onUpdate: (fn: (s: Save) => Save) => void;
  onGather: () => void;
  onGame: (kind: MiniKind) => void;
  onManage: () => void;
  onNext: () => void;
  onToast: (text: string) => void;
}) {
  const { t } = useTranslation();
  const story = stories.find(
    (s) => s.area === "forest" && !save.world.stories.includes(s.id),
  );
  const p = story ? storyProgress(save, story.id) : null;
  const ready = !!p && p.done === p.total;
  const pending = story?.objectives.find(
    (o) =>
      ("counter" in o
        ? save.counters[o.counter]
        : (save.world.buildings[o.building] ?? 0)) < o.count,
  );
  const action = () => {
    if (!story) onNext();
    else if (ready) {
      onUpdate((s) => claimStory(s, story.id));
      onToast(String(t("forestChapterClaimed")));
    } else if (pending && "counter" in pending) {
      if (pending.counter === "gather") onGather();
      else
        onGame(
          pending.counter === "hidden"
            ? "hidden"
            : pending.counter === "match"
              ? "match"
              : "tea",
        );
    } else onManage();
  };
  const actionKey = !story
    ? "forestNextArea"
    : ready
      ? "claim"
      : pending && "counter" in pending
        ? pending.counter === "gather"
          ? "gather"
          : "startMiniGame"
        : "buildings";
  return (
    <View
      testID="forest-guide"
      style={[s.root, { bottom, height: Math.min(180, availableHeight) }]}
    >
      <StrongScrollView contentContainerStyle={{ gap: 6 }}>
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          <GameIcon name="quests" size={26} />
          <Text style={s.title}>
            {String(t(story?.id ?? "forestComplete"))}
          </Text>
        </View>
        {story ? (
          <View style={{ gap: 3 }}>
            {story.objectives.map((o, i) => {
              const done = Math.min(
                o.count,
                "counter" in o
                  ? save.counters[o.counter]
                  : (save.world.buildings[o.building] ?? 0),
              );
              const label =
                "counter" in o
                  ? o.counter === "gather"
                    ? t("forestGatherGoal", { done, total: o.count })
                    : t("forestGameGoal", {
                        game: t(o.counter),
                        done,
                        total: o.count,
                      })
                  : t("forestBuildingGoal", {
                      building: t(o.building),
                      done,
                      total: o.count,
                    });
              return (
                <Text key={i} style={s.text}>
                  {done === o.count ? "✓ " : "· "}
                  {String(label)}
                </Text>
              );
            })}
          </View>
        ) : (
          <Text style={s.text}>{String(t("forestFreeExplore"))}</Text>
        )}
        <Pressable
          testID="forest-next-action"
          accessibilityRole="button"
          accessibilityLabel={String(
            t(actionKey, {
              game: pending && "counter" in pending ? t(pending.counter) : "",
            }),
          )}
          onPress={action}
          style={s.button}
        >
          <Text style={s.buttonText}>
            {String(
              t(actionKey, {
                game: pending && "counter" in pending ? t(pending.counter) : "",
              }),
            )}
          </Text>
        </Pressable>
      </StrongScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  root: {
    position: "absolute",
    left: 10,
    bottom: 6,
    width: "44%",
    maxWidth: 330,
    height: 180,
    maxHeight: "90%",
    padding: 8,
    gap: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1b981",
    backgroundColor: cozy.color.glass,
  },
  title: { flex: 1, fontSize: 13, fontWeight: "700", color: cozy.color.ink },
  text: { fontSize: 11, lineHeight: 15, color: "#46624c" },
  button: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cozy.color.wood,
    paddingHorizontal: 8,
  },
  buttonText: { color: "#fff8e9", fontWeight: "600", fontSize: 12 },
});
