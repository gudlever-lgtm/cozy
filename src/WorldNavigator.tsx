import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import type { Save } from "./engine/save";
import {
  areas,
  themes,
  chooseTheme,
  areaOwned,
  areaReady,
  enterArea,
  type AreaId,
} from "./engine/progression";
import type { Wallet } from "./engine/world";
import { number, type Key } from "./i18n";
import { ScreenPager } from "./ScreenPager";
import { WorldPanel } from "./WorldPanel";
import { StrongScrollView } from "./StrongScrollView";
import { AnimationPanel } from "./AnimationPanel";
import { CardArtwork } from "./CardArtwork";
import { GameIcon } from "./GameIcon";
type Section =
  | "buildings"
  | "storyJournal"
  | "festivals"
  | "cardThemes"
  | "worldAchievements";
export function WorldNavigator({
  save,
  onUpdate,
  onNavigate,
  onQuest,
  appearanceRequest = 0,
  managementRequest,
}: {
  save: Save;
  onQuest?: (id: string) => void;
  appearanceRequest?: number;
  managementRequest?: {
    serial: number;
    section: "buildings" | "storyJournal";
  } | null;
  onUpdate: (fn: (save: Save) => Save) => void;
  onNavigate: (screen: "garden" | "quests" | "play" | "mini") => void;
}) {
  const { t, i18n } = useTranslation(),
    tt = (key: Key, options?: Record<string, unknown>) =>
      String(t(key, options));
  const [animationOpen, setAnimationOpen] = useState(false);
  useEffect(() => {
    if (appearanceRequest > 0) setAnimationOpen(true);
  }, [appearanceRequest]);
  const [manage, setManage] = useState(false),
    [section, setSection] = useState<Section>("buildings"),
    [inspect, setInspect] = useState<AreaId | null>(null);
  useEffect(() => {
    if (managementRequest) {
      setSection(managementRequest.section);
      setManage(true);
    }
  }, [managementRequest]);
  const selected = areas.find((a) => a.id === inspect);
  const afford = (cost: Partial<Wallet>) =>
    Object.entries(cost).every(
      ([r, n]) => save.economy.wallet[r as keyof Wallet] >= n,
    );
  const openManage = (id: AreaId, nextSection: Section = "buildings") => {
    onUpdate((s) => enterArea(s, id));
    setInspect(null);
    setSection(nextSection);
    setManage(true);
  };
  const owned = selected && areaOwned(save, selected.id),
    ready = selected && areaReady(save, selected.id),
    canBuy = selected && afford(selected.cost);
  const missingArea =
    selected?.requires && !areaOwned(save, selected.requires)
      ? selected.requires
      : null;
  const missingQuest =
    selected?.quest && !save.completed.includes(selected.quest)
      ? selected.quest
      : null;
  const missingStory =
    selected?.story && !save.world.stories.includes(selected.story)
      ? selected.story
      : null;
  const actionLabel = owned
    ? tt("enterArea")
    : missingArea
      ? tt("nextOpenArea", { area: tt(("area_" + missingArea) as Key) })
      : missingQuest
        ? tt("viewQuests")
        : missingStory
          ? tt("storyJournal")
          : !canBuy
            ? tt("earnMaterials")
            : tt("unlockArea");
  const primary = () => {
    if (!selected) return;
    if (owned) {
      onUpdate((s) => enterArea(s, selected.id));
      setInspect(null);
      onNavigate("garden");
    } else if (missingArea) setInspect(missingArea);
    else if (missingQuest) {
      setInspect(null);
      if (onQuest) onQuest(missingQuest);
      else onNavigate("quests");
    } else if (missingStory && selected.requires)
      openManage(selected.requires, "storyJournal");
    else if (!canBuy) {
      setInspect(null);
      onNavigate(
        (selected.cost.glimmers ?? 0) > save.economy.wallet.glimmers
          ? "play"
          : (selected.cost.seeds ?? 0) > save.economy.wallet.seeds ||
              (selected.cost.flowers ?? 0) > save.economy.wallet.flowers
            ? "mini"
            : "garden",
      );
    } else if (ready) openManage(selected.id);
  };
  const button = (label: string, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={s.action}
    >
      <Text style={s.actionText}>{label}</Text>
    </Pressable>
  );
  return (
    <View testID="world-navigator" style={{ flex: 1, minHeight: 0 }}>
      {manage && section === "cardThemes" ? (
        <ScreenPager
          id="themes"
          title={tt("cardThemes")}
          actions={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tt("back")}
              onPress={() => setManage(false)}
              style={s.icon}
            >
              <Text style={{ fontSize: 28, color: "#345b49" }}>‹</Text>
            </Pressable>
          }
          items={themes.map((theme) => (
            <View
              key={theme.id}
              testID={`world-theme-${theme.id}`}
              style={s.tile}
            >
              <View pointerEvents="none" style={{ width: 32, height: 46 }}>
                <CardArtwork
                  card={{ id: "theme-preview", rank: 1, suit: "♠", up: false }}
                  theme={theme.id}
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.name} numberOfLines={2}>
                  {tt(("theme_" + theme.id) as Key)}
                </Text>
                <Text style={s.status} numberOfLines={2}>
                  {save.world.theme === theme.id
                    ? tt("themeActive")
                    : Object.entries(theme.cost)
                        .map(
                          ([r, n]) =>
                            number(n, i18n.language) +
                            " " +
                            tt(
                              r === "flowers" ? "flowersResource" : (r as Key),
                            ),
                        )
                        .join(" · ")}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tt("chooseTheme")}
                accessibilityState={{ selected: save.world.theme === theme.id }}
                onPress={() => onUpdate((s) => chooseTheme(s, theme.id))}
                style={s.icon}
              >
                <Text style={{ fontSize: 24, color: "#345b49" }}>
                  {save.world.theme === theme.id ? "✓" : "+"}
                </Text>
              </Pressable>
            </View>
          ))}
        />
      ) : manage ? (
        <>
          <View style={s.header}>
            {button(tt("back"), () => setManage(false))}
            <Text style={s.areaTitle} numberOfLines={1}>
              {tt(("area_" + save.world.area) as Key)}
            </Text>
          </View>
          <View style={s.sections}>
            {(
              [
                "buildings",
                "storyJournal",
                "festivals",
                "cardThemes",
                "worldAchievements",
              ] as Section[]
            ).map((id, i) => (
              <Pressable
                key={id}
                accessibilityRole="tab"
                accessibilityLabel={tt(id)}
                accessibilityState={{ selected: section === id }}
                onPress={() => setSection(id)}
                style={[
                  s.icon,
                  section === id && { backgroundColor: "#345b49" },
                ]}
              >
                <GameIcon
                  name={["garden", "quests", "gift", "play", "challenge"][i]}
                  size={30}
                />
              </Pressable>
            ))}
          </View>
          <StrongScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 10, gap: 8 }}
          >
            <WorldPanel
              save={save}
              onUpdate={onUpdate}
              detailsOnly
              section={section}
            />
          </StrongScrollView>
        </>
      ) : (
        <ScreenPager
          id="world"
          title={tt("world")}
          actions={
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tt("cardThemes")}
                onPress={() => {
                  setSection("cardThemes");
                  setManage(true);
                }}
                style={s.icon}
              >
                <GameIcon name="play" size={30} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tt("animations")}
                onPress={() => setAnimationOpen(true)}
                style={s.icon}
              >
                <GameIcon name="settings" size={30} />
              </Pressable>
            </>
          }
          items={areas.map((area) => {
            const isOwned = areaOwned(save, area.id),
              isReady = areaReady(save, area.id) && afford(area.cost);
            return (
              <View
                key={area.id}
                testID={`world-area-${area.id}`}
                style={s.tile}
              >
                <GameIcon
                  name={area.id === "cottage" ? "garden" : "world"}
                  size={36}
                />
                <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                  <Text style={s.name} numberOfLines={2}>
                    {tt(("area_" + area.id) as Key)}
                  </Text>
                  <Text style={s.status}>
                    {tt(
                      isOwned
                        ? "areaAvailable"
                        : isReady
                          ? "areaCanOpen"
                          : "areaLockedShort",
                    )}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={tt(
                    isOwned
                      ? "enterArea"
                      : isReady
                        ? "unlockArea"
                        : "seeRequirements",
                  )}
                  onPress={() => {
                    if (isOwned) {
                      onUpdate((s) => enterArea(s, area.id));
                      onNavigate("garden");
                    } else if (isReady) openManage(area.id);
                    else setInspect(area.id);
                  }}
                  style={s.icon}
                >
                  <GameIcon
                    name={isOwned ? "garden" : isReady ? "gather" : "hint"}
                    size={30}
                  />
                </Pressable>
                {isOwned && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={tt("manageArea")}
                    onPress={() => openManage(area.id)}
                    style={s.icon}
                  >
                    <GameIcon name="settings" size={30} />
                  </Pressable>
                )}
              </View>
            );
          })}
        />
      )}
      <Modal
        transparent
        visible={animationOpen}
        statusBarTranslucent
        navigationBarTranslucent
        animationType="fade"
        onRequestClose={() => setAnimationOpen(false)}
      >
        <View style={s.scrim}>
          <AnimationPanel
            save={save}
            onUpdate={onUpdate}
            onClose={() => setAnimationOpen(false)}
          />
        </View>
      </Modal>
      <Modal
        transparent
        visible={!!selected}
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setInspect(null)}
      >
        <View style={s.scrim}>
          <View style={s.dialog}>
            <View style={s.header}>
              <Text
                accessibilityRole="header"
                style={s.areaTitle}
                numberOfLines={1}
              >
                {selected ? tt(("area_" + selected.id) as Key) : ""}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tt("close")}
                onPress={() => setInspect(null)}
                style={s.icon}
              >
                <Text style={{ fontSize: 24, color: "#345b49" }}>×</Text>
              </Pressable>
            </View>
            <StrongScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ gap: 8, padding: 4 }}
            >
              <Text style={s.name}>{tt("nextStep")}</Text>
              {missingArea ? (
                <Text style={s.detail}>
                  {tt("nextOpenArea", {
                    area: tt(("area_" + missingArea) as Key),
                  })}
                </Text>
              ) : missingQuest ? (
                <Text style={s.detail}>
                  {tt("completeQuestFirst", { quest: tt(missingQuest as Key) })}
                </Text>
              ) : missingStory ? (
                <Text style={s.detail}>
                  {tt("completeStoryFirst", { story: tt(missingStory as Key) })}
                </Text>
              ) : (
                <Text style={s.detail}>
                  {tt(canBuy ? "areaCanOpen" : "earnMaterials")}
                </Text>
              )}
              {selected &&
                Object.entries(selected.cost).map(([r, n]) => (
                  <View key={r} style={s.requirement}>
                    <GameIcon
                      name={
                        r === "glimmers"
                          ? "glimmer"
                          : r === "flowers"
                            ? "decorations"
                            : r
                      }
                      size={26}
                    />
                    <Text
                      style={[
                        s.detail,
                        {
                          color:
                            save.economy.wallet[r as keyof Wallet] >= n
                              ? "#345b49"
                              : "#93503f",
                        },
                      ]}
                    >
                      {tt(r === "flowers" ? "flowersResource" : (r as Key))} ·{" "}
                      {number(
                        save.economy.wallet[r as keyof Wallet],
                        i18n.language,
                      )}{" "}
                      / {number(n, i18n.language)}
                    </Text>
                  </View>
                ))}
            </StrongScrollView>
            {button(actionLabel, primary)}
          </View>
        </View>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  tile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d2c295",
    backgroundColor: "#fff8e9ed",
  },
  name: { fontSize: 13, lineHeight: 16, color: "#345b49", fontWeight: "600" },
  status: { fontSize: 11, color: "#647653" },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#cdbd96",
    backgroundColor: "#fff4df",
    alignItems: "center",
    justifyContent: "center",
  },
  header: { minHeight: 44, flexDirection: "row", gap: 8, alignItems: "center" },
  areaTitle: {
    flex: 1,
    fontSize: 19,
    lineHeight: 24,
    color: "#294e3b",
    fontWeight: "600",
  },
  sections: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    padding: 6,
  },
  action: {
    minHeight: 44,
    backgroundColor: "#345b49",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { color: "#fff8e9", fontSize: 13, fontWeight: "600" },
  scrim: {
    flex: 1,
    padding: 10,
    backgroundColor: "#1b342a88",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: "94%",
    maxWidth: 640,
    height: "90%",
    padding: 12,
    gap: 8,
    borderRadius: 20,
    backgroundColor: "#faf7ec",
  },
  detail: { fontSize: 14, lineHeight: 21, color: "#345b49" },
  requirement: { flexDirection: "row", alignItems: "center", gap: 8 },
});
