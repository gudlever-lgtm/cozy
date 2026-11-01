/** Shared historical challenge LCG. Changing these constants invalidates verified seeds. */
export function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
export function seedFromString(value: string) {
  let seed = 2166136261;
  for (let i = 0; i < value.length; i++)
    seed = Math.imul(seed ^ value.charCodeAt(i), 16777619) >>> 0;
  return seed;
}
