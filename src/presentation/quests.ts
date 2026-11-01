import { quests, questProgress } from "../engine/world";
import type { Save } from "../engine/save";
export type Quest = (typeof quests)[number];
export type QuestObjective = Quest["objectives"][number];
export function questView(save: Save, quest: Quest) {
  const progress = questProgress(
    quest.id,
    save.counters,
    save.economy.inventory,
  );
  const missing = quest.requires.filter((id) => !save.completed.includes(id));
  const status: "completed" | "locked" | "ready" | "active" =
    save.completed.includes(quest.id)
      ? "completed"
      : missing.length
        ? "locked"
        : progress.done === progress.total
          ? "ready"
          : "active";
  const objectives = quest.objectives.map((objective) => ({
    objective,
    done:
      objective.type === "upgrade"
        ? Number(save.economy.inventory.includes(objective.item))
        : Math.min(objective.count, save.counters[objective.type]),
    total: objective.count,
  }));
  return {
    quest,
    progress,
    status,
    missing,
    objectives,
    next: objectives.find((row) => row.done < row.total),
  };
}
export function recommendedQuest(save: Save, npc?: Quest["npc"]) {
  const candidates = quests
    .filter((q) => !npc || q.npc === npc)
    .map((q) => questView(save, q));
  return (
    candidates.find((q) => q.status === "ready") ??
    candidates.find((q) => q.status === "active")
  );
}
