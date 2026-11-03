import {
  matchForLevel,
  teaForLevel,
  type MiniSession,
  type MiniKind,
} from "./session";
export type MiniSlot = { session: MiniSession; moves: number; done: boolean };
export type MiniProgress = {
  round: number;
  slots: MiniSlot[];
  fireflies: number;
  keys: string[];
  undo: number;
  deals: number;
};
export function miniPair(round = 0): MiniSlot[] {
  const kinds: MiniKind[] = ["match", "hidden", "tea"];
  return [0, 1].map((i) => ({
    session: {
      id: `pair:${round}:${i}`,
      kind: kinds[(round * 2 + i) % 3],
      level: 1,
      match: matchForLevel(1),
      tea: teaForLevel(1),
      found: [],
    },
    moves: 0,
    done: false,
  }));
}
export function newMiniProgress(): MiniProgress {
  return {
    round: 0,
    slots: miniPair(),
    fireflies: 0,
    keys: [],
    undo: 3,
    deals: 2,
  };
}
export function validMiniProgress(p: MiniProgress): boolean {
  return (
    !!p &&
    Array.isArray(p.keys) &&
    p.keys.every((k) => ["open", "whitehead"].includes(k)) &&
    [p.round, p.fireflies, p.undo, p.deals].every(
      (n) => Number.isSafeInteger(n) && n >= 0,
    ) &&
    Array.isArray(p.slots) &&
    p.slots.length === 2 &&
    p.slots.every(
      (s, i) =>
        s.session.id === `pair:${p.round}:${i}` &&
        s.session.kind ===
          (["match", "hidden", "tea"] as const)[(p.round * 2 + i) % 3] &&
        Number.isSafeInteger(s.moves) &&
        s.moves >= 0 &&
        typeof s.done === "boolean",
    )
  );
}
export function finishMini(p: MiniProgress, id: string): MiniProgress {
  const slot = p.slots.find((s) => s.session.id === id);
  if (!slot || slot.done) return p;
  const slots = p.slots.map((s) => (s === slot ? { ...s, done: true } : s));
  const round = slots.every((s) => s.done) ? p.round + 1 : p.round;
  return { ...p, round, slots: round === p.round ? slots : miniPair(round) };
}
