import { seededRandom } from "./random";
import { newGame } from "./solitaire";
export const challenges = [
  { id: "blossoms", seed: 17017, draw: 1 },
  { id: "river", seed: 23111, draw: 3 },
  { id: "lantern", seed: 98173, draw: 1 },
] as const;
export type ChallengeId = (typeof challenges)[number]["id"];
export function challengeGame(id: string, challenge: ChallengeId) {
  const c = challenges.find((c) => c.id === challenge)!;
  return { ...newGame(id, c.draw, seededRandom(c.seed)), challenge };
}
