import { flowerMatchDefinition } from "./flowerMatch";
import type { MinigameDefinition } from "./types";

export const minigameRegistry: Readonly<Record<string, MinigameDefinition<any, any>>> = {
  [flowerMatchDefinition.id]: flowerMatchDefinition,
};

export function getMinigame(id: string): MinigameDefinition<unknown, unknown> | undefined {
  return minigameRegistry[id];
}
