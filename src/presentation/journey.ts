import type { Save } from "../engine/save";
import { quests, questProgress } from "../engine/world";
import { areas, areaOwned, stories, buildings } from "../engine/progression";
import { recommendedQuest } from "./quests";
/** Real finite milestones; no fabricated XP, rewards or timers. */
export function journeyProgress(save: Save) {
  const objectiveTotal = quests.reduce(
    (sum, q) =>
      sum + questProgress(q.id, save.counters, save.economy.inventory).total,
    0,
  );
  const objectives = quests.reduce(
    (sum, q) =>
      sum + questProgress(q.id, save.counters, save.economy.inventory).done,
    0,
  );
  const claims = quests.filter((q) => save.completed.includes(q.id)).length;
  const unlocked = areas.filter(
    (a) => a.id !== "cottage" && areaOwned(save, a.id),
  ).length;
  const chapters = stories.filter((s) =>
    save.world.stories.includes(s.id),
  ).length;
  const improvements = buildings.reduce(
    (sum, b) => sum + Math.max(0, Math.min(3, save.world.buildings[b.id] ?? 0)),
    0,
  );
  const total =
      objectiveTotal +
      quests.length +
      areas.length -
      1 +
      stories.length +
      buildings.length * 3,
    done = objectives + claims + unlocked + chapters + improvements;
  return {
    done,
    total,
    percent: Math.floor((done / total) * 100),
    next: recommendedQuest(save)?.quest,
  };
}
