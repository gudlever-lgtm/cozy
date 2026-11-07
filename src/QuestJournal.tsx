import { cozy } from "./ui/theme";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, Modal, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { quests, claimQuest } from "./engine/world";
import type { Save } from "./engine/save";
import {
  questView,
  recommendedQuest,
  type Quest,
  type QuestObjective,
} from "./presentation/quests";
import { number, type Key } from "./i18n";
import { StrongScrollView } from "./StrongScrollView";
import { GameIcon } from "./GameIcon";
import { Portrait } from "./Art";
import { cozyImages } from "./assets/images";
function QuestPortrait({ npc }: { npc: Quest["npc"] }) {
  return (
    <View
      pointerEvents="none"
      style={{
        width: 30,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {npc === "pip" ? (
        <View style={{ transform: [{ scale: 0.37 }] }}>
          <Portrait animal="pip" />
        </View>
      ) : (
        <Image
          source={cozyImages.characters[npc]}
          style={{ width: 30, height: 28 }}
          resizeMode="contain"
        />
      )}
    </View>
  );
}
export function QuestJournal({
  save,
  onUpdate,
  onAction,
  onToast,
  focusQuest,
}: {
  save: Save;
  onUpdate: (fn: (s: Save) => Save) => void;
  onAction: (objective: QuestObjective) => void;
  onToast: (text: string) => void;
  focusQuest?: string | null;
}) {
  const { t, i18n } = useTranslation(),
    tt = (key: Key, options?: Record<string, unknown>) =>
      String(t(key, options));
  const focused = quests.find((q) => q.id === focusQuest),
    initial = focused ?? recommendedQuest(save)?.quest ?? quests[0];
  const [npc, setNpc] = useState<Quest["npc"]>(initial.npc),
    [detail, setDetail] = useState<string | null>(focused?.id ?? null);
  useEffect(() => {
    const quest = quests.find((q) => q.id === focusQuest);
    if (quest) {
      setNpc(quest.npc);
      setDetail(quest.id);
    }
  }, [focusQuest]);
  const chosen = quests.find((q) => q.id === detail),
    view = chosen ? questView(save, chosen) : null,
    recommended = recommendedQuest(save, npc);
  const short = (quest: Quest) => tt(quest.id).split(" · ").at(-1)!;
  const label = (objective: QuestObjective) =>
    objective.type === "upgrade"
      ? tt("questUnlockItem", { item: tt(objective.item) })
      : objective.type === "gather"
        ? tt("gather")
        : tt("questCompleteGame", { game: tt(objective.type) });
  const resource = (key: string) =>
    tt(key === "flowers" ? "flowersResource" : (key as Key));
  const rewardText = (quest: Quest) =>
    Object.entries(quest.reward)
      .map(
        ([key, value]) => `+${number(value, i18n.language)} ${resource(key)}`,
      )
      .join(" · ");
  const stateKey = {
    completed: "questDone",
    locked: "questBlocked",
    ready: "questReady",
    active: "questActive",
  } as const;
  const act = () => {
    if (!chosen || !view) return;
    if (view.status === "locked") {
      const previous = quests.find((q) => q.id === view.missing[0]);
      if (previous) {
        setNpc(previous.npc);
        setDetail(previous.id);
      }
      return;
    }
    if (view.status === "ready") {
      onUpdate((s) => {
        const result = claimQuest(
          s.economy,
          s.completed,
          chosen.id,
          s.counters,
        );
        return { ...s, ...result };
      });
      setDetail(null);
      onToast(tt("questClaimed") + " " + rewardText(chosen));
      return;
    }
    if (view.status === "active" && view.next) {
      setDetail(null);
      onAction(view.next.objective);
    }
  };
  return (
    <View testID="quest-journal" style={{ flex: 1, minHeight: 0 }}>
      <View style={{ flex: 1, minHeight: 0, padding: 8, gap: 8 }}>
        <View
          style={{
            height: 44,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#fff8e9e6",
            borderRadius: 12,
            paddingHorizontal: 6,
          }}
        >
          <Text style={[s.title, { flex: 1 }]} numberOfLines={1}>
            {tt("quests")}
          </Text>{" "}
          <View style={{ flexDirection: "row", gap: 4 }}>
            {(["millie", "marmalade", "pip"] as const).map((character) => (
              <Pressable
                key={character}
                accessibilityRole="tab"
                accessibilityLabel={tt(character)}
                accessibilityState={{ selected: npc === character }}
                onPress={() => setNpc(character)}
                style={[
                  s.character,
                  npc === character && {
                    borderColor: "#c7a458",
                    borderWidth: 2,
                    backgroundColor: "#e9eddc",
                  },
                ]}
              >
                <QuestPortrait npc={character} />
                <Text numberOfLines={1} style={s.characterName}>
                  {tt(character)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ flex: 1, minHeight: 0, flexDirection: "row", gap: 8 }}>
          {quests
            .filter((q) => q.npc === npc)
            .map((quest) => {
              const row = questView(save, quest),
                next = row.next;
              return (
                <Pressable
                  key={quest.id}
                  testID={`quest-card-${quest.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={tt(quest.id)}
                  onPress={() => setDetail(quest.id)}
                  style={[
                    s.card,
                    recommended?.quest.id === quest.id && {
                      borderColor: "#c7a458",
                      borderWidth: 2,
                    },
                  ]}
                >
                  <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                    <Text style={s.name} numberOfLines={1}>
                      {short(quest)}
                    </Text>
                    <Text style={s.info} numberOfLines={2}>
                      {tt((quest.id + "Info") as Key)}
                    </Text>
                    <Text style={s.small} numberOfLines={1}>
                      {row.status === "active" && next
                        ? label(next.objective)
                        : tt(stateKey[row.status])}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={s.small}>
                        {row.progress.done}/{row.progress.total}
                      </Text>
                      <View style={s.track}>
                        <View
                          style={{
                            width: `${(row.progress.done / row.progress.total) * 100}%`,
                            height: 5,
                            borderRadius: 3,
                            backgroundColor:
                              row.status === "ready" ? "#c7a458" : "#588166",
                          }}
                        />
                      </View>
                      <Text style={s.small}>{tt(stateKey[row.status])}</Text>
                    </View>
                  </View>
                  <GameIcon
                    name={row.status === "ready" ? "gift" : "quests"}
                    size={32}
                  />
                </Pressable>
              );
            })}
        </View>
      </View>
      <Modal
        testID="quest-details-modal"
        transparent
        visible={!!chosen}
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setDetail(null)}
      >
        <View style={s.scrim}>
          {chosen && view && (
            <View testID="quest-details" style={s.dialog}>
              <View style={s.header}>
                <QuestPortrait npc={chosen.npc} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.small}>
                    {tt(chosen.npc)} · {tt(stateKey[view.status])}
                  </Text>
                  <Text style={s.title} numberOfLines={1}>
                    {short(chosen)}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={tt("close")}
                  onPress={() => setDetail(null)}
                  style={s.close}
                >
                  <Text style={{ fontSize: 26, color: cozy.color.ink }}>×</Text>
                </Pressable>
              </View>
              <View
                style={{ flex: 1, minHeight: 0, flexDirection: "row", gap: 12 }}
              >
                <StrongScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ gap: 8, padding: 2 }}
                >
                  <Text style={s.info}>{tt((chosen.id + "Info") as Key)}</Text>
                  <Text style={s.info}>{tt((chosen.id + "Text") as Key)}</Text>
                  <Text style={s.name}>{tt("questRewards")}</Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {Object.entries(chosen.reward).map(([key, value]) => (
                      <View
                        key={key}
                        accessible
                        accessibilityLabel={
                          resource(key) + ": " + number(value, i18n.language)
                        }
                        style={s.reward}
                      >
                        <GameIcon
                          name={
                            key === "glimmers"
                              ? "glimmer"
                              : key === "flowers"
                                ? "decorations"
                                : key
                          }
                          size={24}
                        />
                        <Text style={s.name}>
                          +{number(value, i18n.language)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </StrongScrollView>
                <StrongScrollView
                  style={{ flex: 1.35 }}
                  contentContainerStyle={{ gap: 8, padding: 2 }}
                >
                  <Text style={s.name}>{tt("questObjectives")}</Text>
                  {view.status === "locked" && (
                    <Text style={s.info}>
                      {tt("questNeedsPrevious", {
                        quest: tt(view.missing[0] as Key),
                      })}
                    </Text>
                  )}
                  {view.objectives.map((row, index) => (
                    <View key={index} style={s.objective}>
                      <GameIcon
                        name={
                          row.done >= row.total
                            ? "challenge"
                            : row.objective.type === "gather"
                              ? "gather"
                              : row.objective.type === "upgrade"
                                ? "decorations"
                                : "mini"
                        }
                        size={26}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={s.info}>{label(row.objective)}</Text>
                        <Text style={s.small}>
                          {row.done}/{row.total} ·{" "}
                          {tt(
                            row.done >= row.total ? "questDone" : "questActive",
                          )}
                        </Text>
                      </View>
                    </View>
                  ))}
                </StrongScrollView>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tt(
                  view.status === "ready"
                    ? "claim"
                    : view.status === "locked"
                      ? "questViewPrevious"
                      : view.status === "completed"
                        ? "complete"
                        : "questGoObjective",
                )}
                disabled={view.status === "completed"}
                accessibilityState={{ disabled: view.status === "completed" }}
                onPress={act}
                style={[
                  s.primary,
                  view.status === "completed" && { opacity: 0.5 },
                ]}
              >
                <Text style={s.primaryText}>
                  {tt(
                    view.status === "ready"
                      ? "claim"
                      : view.status === "locked"
                        ? "questViewPrevious"
                        : view.status === "completed"
                          ? "complete"
                          : "questGoObjective",
                  )}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  character: {
    width: 66,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cozy.color.border,
    backgroundColor: "#fff8e9",
    alignItems: "center",
    justifyContent: "center",
  },
  characterName: { fontSize: 10, lineHeight: 11, color: cozy.color.ink },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cozy.color.border,
    backgroundColor: cozy.color.glass,
  },
  name: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "600",
    color: cozy.color.ink,
  },
  small: { fontSize: 11, lineHeight: 14, color: "#597253" },
  track: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#dce4d3",
    overflow: "hidden",
  },
  scrim: {
    flex: 1,
    padding: 8,
    backgroundColor: cozy.color.scrim,
    alignItems: "center",
    justifyContent: "center",
  },
  dialog: {
    width: "98%",
    height: "94%",
    maxWidth: 1000,
    padding: 12,
    gap: 8,
    borderRadius: 22,
    backgroundColor: cozy.color.paper,
  },
  header: { height: 44, flexDirection: "row", alignItems: "center", gap: 8 },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: "serif",
    color: cozy.color.ink,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#eeecd9",
  },
  info: { fontSize: 12, lineHeight: 17, color: "#45654c" },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 5,
    borderRadius: 10,
    backgroundColor: "#fff4d6",
  },
  objective: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f0f0df",
    borderWidth: 1,
    borderColor: "#d7dec9",
  },
  primary: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: cozy.color.wood,
  },
  primaryText: { fontSize: 14, fontWeight: "600", color: "#fff8e9" },
});
