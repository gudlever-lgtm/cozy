import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import type { Key } from "./i18n";
import { number } from "./i18n";
import type { Save } from "./engine/save";
import type { Wallet } from "./engine/world";
import {
  areas,
  areaOwned,
  areaReady,
  enterArea,
  buildings,
  improve,
  stories,
  storyProgress,
  claimStory,
  friendship,
  festivals,
  claimFestival,
  themes,
  chooseTheme,
  worldAchievements,
  achievementReady,
  claimWorldAchievement,
} from "./engine/progression";
import { cozyImages } from "./assets/images";
import { seasonAt } from "./engine/world";
import { FestivalDecorations } from "./FestivalDecorations";
import { WorldArt } from "./WorldArt";
export function WorldPanel({
  save,
  onUpdate,
}: {
  save: Save;
  onUpdate: (fn: (s: Save) => Save) => void;
}) {
  const { t, i18n } = useTranslation();
  const tt = (key: Key, options?: Record<string, unknown>) =>
    String(t(key, options));
  const cost = (values: Partial<Wallet>) =>
    Object.entries(values)
      .map(([r, n]) =>
        tt("balance", {
          amount: number(n, i18n.language),
          resource: tt(r === "flowers" ? "flowersResource" : (r as Key)),
        }),
      )
      .join(" · ");
  const button = (
    label: string,
    action: () => void,
    disabled = false,
    selected?: boolean,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        disabled,
        ...(selected === undefined ? {} : { selected }),
      }}
      onPress={action}
      disabled={disabled}
      style={[
        s.button,
        disabled && { opacity: 0.45 },
        selected && { borderWidth: 2, borderColor: "#c7a458" },
      ]}
    >
      <Text style={s.buttonText}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ gap: 18 }}>
      <Text accessibilityRole="header" style={s.title}>
        {tt("world")}
      </Text>
      <Text style={s.text}>{tt("worldIntro")}</Text>
      <View style={s.scene}>
        {save.world.area === "cottage" ? (
          <Image
            source={
              cozyImages.seasons[
                save.preferences.season === "auto"
                  ? seasonAt(new Date())
                  : save.preferences.season
              ]
            }
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <WorldArt
            season={
              save.preferences.season === "auto"
                ? seasonAt(new Date())
                : save.preferences.season
            }
            area={save.world.area}
            levels={save.world.buildings}
          />
        )}
        <FestivalDecorations events={save.world.events} />
      </View>
      <Text style={s.title}>{tt(("area_" + save.world.area) as Key)}</Text>
      <View style={s.grid}>
        {areas.map((a) => (
          <View key={a.id} testID={`world-area-${a.id}`} style={s.panel}>
            <Text style={s.heading}>{tt(("area_" + a.id) as Key)}</Text>
            {!areaOwned(save, a.id) && (
              <>
                <Text style={s.text}>{cost(a.cost)}</Text>
                <Text style={s.text}>
                  {tt("requirements", {
                    quest: a.quest ? tt(a.quest as Key) : tt("complete"),
                  })}
                </Text>
              </>
            )}
            {button(
              tt(areaOwned(save, a.id) ? "enterArea" : "unlockArea"),
              () => onUpdate((v) => enterArea(v, a.id)),
              !areaOwned(save, a.id) && !areaReady(save, a.id),
              save.world.area === a.id,
            )}
          </View>
        ))}
      </View>
      <Text style={s.title}>{tt("buildings")}</Text>
      <View style={s.grid}>
        {buildings
          .filter((b) => b.area === save.world.area)
          .map((b) => {
            const level = save.world.buildings[b.id] ?? 0;
            return (
              <View
                key={b.id}
                testID={`world-building-${b.id}`}
                style={s.panel}
              >
                <Text style={s.heading}>{tt(b.id)}</Text>
                <Text style={s.text}>
                  {cost(
                    Object.fromEntries(
                      Object.entries(b.cost).map(([k, v]) => [
                        k,
                        v * (level + 1),
                      ]),
                    ),
                  )}
                </Text>
                {button(
                  level >= 3
                    ? tt("maxLevel")
                    : tt("improveBuilding", { level }),
                  () => onUpdate((v) => improve(v, b.id)),
                  level >= 3,
                )}
              </View>
            );
          })}
      </View>
      <Text style={s.title}>{tt("storyJournal")}</Text>
      {stories
        .filter((story) => story.area === save.world.area)
        .map((story) => {
          const p = storyProgress(save, story.id),
            done = save.world.stories.includes(story.id),
            ready =
              areaOwned(save, story.area) &&
              (!story.requires || save.world.stories.includes(story.requires));
          return (
            <View
              key={story.id}
              testID={`world-story-${story.id}`}
              style={s.panel}
            >
              <Text style={s.heading}>{tt(story.id as Key)}</Text>
              <Text style={s.text}>
                {tt((story.id + "Dialogue") as Key, {
                  username: save.profile?.username ?? "",
                })}
              </Text>
              <Text style={s.text}>{tt((story.id + "Text") as Key)}</Text>
              <Text style={s.text}>
                {tt(story.npc)} ·{" "}
                {tt("friendship", { level: friendship(save, story.npc) })}
              </Text>
              <Text style={s.text}>
                {tt("progress", p)} ·{" "}
                {tt("storyReward", { amount: story.reward.glimmers })}
              </Text>
              {button(
                tt(done ? "complete" : "claim"),
                () => onUpdate((v) => claimStory(v, story.id)),
                done || !ready || p.done < p.total,
              )}
            </View>
          );
        })}
      <Text style={s.title}>{tt("festivals")}</Text>
      <Text style={s.text}>{tt("festivalIntro")}</Text>
      <View style={s.grid}>
        {festivals.map((f) => (
          <View key={f.id} style={s.panel}>
            <Text style={s.heading}>{tt(("festival_" + f.id) as Key)}</Text>
            <Text style={s.text}>
              {tt("festivalObjective", {
                game: tt(f.counter === "solitaire" ? "play" : f.counter),
                count: f.count,
              })}
            </Text>
            <Text style={s.text}>{tt("festivalReward")}</Text>
            {button(
              tt(save.world.events.includes(f.id) ? "complete" : "claim"),
              () => onUpdate((v) => claimFestival(v, f.id)),
              save.world.events.includes(f.id) ||
                save.counters[f.counter] < f.count,
            )}
          </View>
        ))}
      </View>
      <Text style={s.title}>{tt("cardThemes")}</Text>
      <View style={s.grid}>
        {themes.map((theme) => (
          <View key={theme.id} style={s.panel}>
            <Text style={s.heading}>{tt(("theme_" + theme.id) as Key)}</Text>
            <Text style={s.text}>{cost(theme.cost)}</Text>
            {button(
              tt("chooseTheme"),
              () => onUpdate((v) => chooseTheme(v, theme.id)),
              false,
              save.world.theme === theme.id,
            )}
          </View>
        ))}
      </View>
      <Text style={s.title}>{tt("worldAchievements")}</Text>
      {worldAchievements.map((id) => (
        <View key={id} style={s.panel}>
          <Text style={s.heading}>{tt(("achievement_" + id) as Key)}</Text>
          <Text style={s.text}>
            {tt(("achievement_" + id + "Text") as Key)}
          </Text>
          {button(
            tt(
              save.economy.receipts.includes("achievement:" + id)
                ? "earned"
                : "achievementReward",
            ),
            () => onUpdate((v) => claimWorldAchievement(v, id)),
            save.economy.receipts.includes("achievement:" + id) ||
              !achievementReady(save, id),
          )}
        </View>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  panel: {
    flexGrow: 1,
    flexBasis: 220,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dfdecc",
    backgroundColor: "#fcfaf1",
    gap: 10,
  },
  title: { fontSize: 25, color: "#345b49", fontWeight: "600" },
  heading: { fontSize: 18, color: "#345b49", fontWeight: "600" },
  text: { fontSize: 14, lineHeight: 22, color: "#6d795f" },
  button: {
    backgroundColor: "#345b49",
    padding: 14,
    minHeight: 46,
    borderRadius: 10,
  },
  buttonText: { fontSize: 14, color: "#fff8df", fontWeight: "600" },
  scene: {
    height: 300,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#c5d6bd",
  },
});
