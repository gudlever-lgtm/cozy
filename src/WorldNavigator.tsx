import { CozyPressable } from "./ui/CozyPressable";
import { cozy } from "./ui/theme";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
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
import { cozyImages } from "./assets/images";
import { areaImages } from "./assets/areas";
import { forestImages } from "./assets/forest";
import { seasonAt } from "./engine/world";
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
  const { width } = useWindowDimensions();
  const season =
    save.preferences.season === "auto"
      ? seasonAt(new Date())
      : save.preferences.season;
  const areaImage = (id: AreaId) =>
    id === "cottage"
      ? cozyImages.seasons[season]
      : id === "forest"
        ? forestImages[season]
        : areaImages[
            id === "river" && season === "winter"
              ? "riverWinter"
              : id === "village" && season === "winter"
                ? "villageWinter"
                : (id as "river" | "village" | "winterland")
          ];
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
    <CozyPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      variant="wood"
      style={s.action}
    >
      <Text style={s.actionText}>{label}</Text>
    </CozyPressable>
  );
  return (
    <View testID="world-navigator" style={{ flex: 1, minHeight: 0 }}>
      {manage && section === "cardThemes" ? (
        <ScreenPager
          id="themes"
          title={tt("cardThemes")}
          actions={
            <CozyPressable
              accessibilityRole="button"
              accessibilityLabel={tt("back")}
              onPress={() => setManage(false)}
              style={s.icon}
            >
              <Text style={{ fontSize: 28, color: cozy.color.ink }}>‹</Text>
            </CozyPressable>
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
              <CozyPressable
                accessibilityRole="button"
                accessibilityLabel={tt("chooseTheme")}
                accessibilityState={{ selected: save.world.theme === theme.id }}
                onPress={() => onUpdate((s) => chooseTheme(s, theme.id))}
                style={s.icon}
              >
                <Text style={{ fontSize: 24, color: cozy.color.ink }}>
                  {save.world.theme === theme.id ? "✓" : "+"}
                </Text>
              </CozyPressable>
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
              <CozyPressable
                key={id}
                accessibilityRole="tab"
                accessibilityLabel={tt(id)}
                accessibilityState={{ selected: section === id }}
                onPress={() => setSection(id)}
                style={[
                  s.icon,
                  section === id && { backgroundColor: cozy.color.wood },
                ]}
              >
                <GameIcon
                  name={["garden", "quests", "gift", "play", "challenge"][i]}
                  size={30}
                />
              </CozyPressable>
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
        <View
          testID="world-pages"
          style={{ flex: 1, minHeight: 0, padding: 8, gap: 8 }}
        >
          <View
            style={[
              s.header,
              {
                backgroundColor: cozy.color.paper,
                borderRadius: 12,
                paddingHorizontal: 8,
              },
            ]}
          >
            <Text accessibilityRole="header" style={s.areaTitle}>
              {tt("world")}
            </Text>
            <CozyPressable
              accessibilityRole="button"
              accessibilityLabel={tt("cardThemes")}
              onPress={() => {
                setSection("cardThemes");
                setManage(true);
              }}
              style={s.icon}
            >
              <GameIcon name="play" size={30} />
            </CozyPressable>
            <CozyPressable
              accessibilityRole="button"
              accessibilityLabel={tt("animations")}
              onPress={() => setAnimationOpen(true)}
              style={s.icon}
            >
              <GameIcon name="settings" size={30} />
            </CozyPressable>
          </View>
          <StrongScrollView
            testID="world-areas-scroll"
            style={{ flex: 1, minHeight: 0 }}
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "flex-start",
              gap: 8,
              paddingBottom: 8,
            }}
          >
            {areas.map((area) => {
              const isOwned = areaOwned(save, area.id),
                isReady = areaReady(save, area.id) && afford(area.cost);
              return (
                <View
                  key={area.id}
                  testID={`world-area-${area.id}`}
                  style={[s.areaTile, { width: width >= 760 ? "49%" : "100%" }]}
                >
                  <Image
                    testID={`world-area-image-${area.id}`}
                    source={areaImage(area.id)}
                    resizeMode="cover"
                    style={s.areaImage}
                    accessible={false}
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
                    <View
                      style={{ flexDirection: "row", gap: 8, marginTop: 4 }}
                    >
                      <CozyPressable
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
                          name={
                            isOwned ? "garden" : isReady ? "gather" : "hint"
                          }
                          size={30}
                        />
                      </CozyPressable>
                      {isOwned && (
                        <CozyPressable
                          accessibilityRole="button"
                          accessibilityLabel={tt("manageArea")}
                          onPress={() => openManage(area.id)}
                          style={s.icon}
                        >
                          <GameIcon name="settings" size={30} />
                        </CozyPressable>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </StrongScrollView>
        </View>
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
              <CozyPressable
                accessibilityRole="button"
                accessibilityLabel={tt("close")}
                onPress={() => setInspect(null)}
                style={s.icon}
              >
                <Text style={{ fontSize: 24, color: cozy.color.ink }}>×</Text>
              </CozyPressable>
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
                              ? cozy.color.ink
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
  areaTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cozy.color.border,
    backgroundColor: cozy.color.paperLight,
  },
  areaImage: {
    width: 96,
    height: 104,
    borderRadius: 10,
    backgroundColor: cozy.color.paperShade,
  },
  tile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cozy.color.border,
    backgroundColor: cozy.color.glass,
  },
  name: {
    fontSize: 13,
    lineHeight: 16,
    color: cozy.color.ink,
    fontWeight: "600",
  },
  status: { fontSize: 11, color: "#647653" },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: cozy.color.border,
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
    backgroundColor: cozy.color.wood,
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
    backgroundColor: cozy.color.scrim,
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
    backgroundColor: cozy.color.paper,
  },
  detail: { fontSize: 14, lineHeight: 21, color: cozy.color.ink },
  requirement: { flexDirection: "row", alignItems: "center", gap: 8 },
});
