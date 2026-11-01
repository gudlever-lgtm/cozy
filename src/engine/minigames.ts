export type Match = {
  cells: number[];
  score: number;
  turns: number;
  target: number;
};
export function matches(cells: number[]): number[] {
  const hit = new Set<number>();
  for (let y = 0; y < 6; y++)
    for (let x = 0; x < 6; x++)
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
      ]) {
        const line: number[] = [];
        let xx = x,
          yy = y;
        while (xx < 6 && yy < 6 && cells[yy * 6 + xx] === cells[y * 6 + x]) {
          line.push(yy * 6 + xx);
          xx += dx;
          yy += dy;
        }
        if (line.length >= 3) line.forEach((i) => hit.add(i));
      }
  return [...hit];
}
export function hasMatchMove(cells: number[]): boolean {
  for (let a = 0; a < 36; a++)
    for (const b of [a % 6 < 5 ? a + 1 : -1, a < 30 ? a + 6 : -1]) {
      if (b < 0) continue;
      const next = [...cells];
      [next[a], next[b]] = [next[b], next[a]];
      if (matches(next).length) return true;
    }
  return false;
}
export function newMatch(random = Math.random): Match {
  const cells: number[] = [];
  for (let i = 0; i < 36; i++) {
    let v = Math.floor(random() * 5);
    while (
      (i % 6 >= 2 && cells[i - 1] === v && cells[i - 2] === v) ||
      (i >= 12 && cells[i - 6] === v && cells[i - 12] === v)
    )
      v = (v + 1) % 5;
    cells.push(v);
  }
  if (!hasMatchMove(cells)) {
    for (let i = 0; i < 36; i++) cells[i] = ((i % 6) + Math.floor(i / 6)) % 5;
    cells[0] = 0;
    cells[1] = 1;
    cells[2] = 0;
    cells[7] = 0;
  }
  return { cells, score: 0, turns: 18, target: 30 };
}
export type MatchFall = {
  from: number | null;
  to: number;
  value: number;
  spawnRow?: number;
};
export type MatchCascade = {
  before: number[];
  after: number[];
  removed: number[];
  falls: MatchFall[];
};
export type MatchSwapPlan = {
  next: Match;
  swapped: number[];
  cascades: MatchCascade[];
};
/** A move is resolved once; the renderer follows these local clear/gravity/refill stages. */
export function planMatchSwap(
  g: Match,
  a: number,
  b: number,
  random = Math.random,
): MatchSwapPlan {
  const invalid = { next: g, swapped: g.cells, cascades: [] };
  if (
    g.turns <= 0 ||
    g.score >= g.target ||
    a < 0 ||
    b < 0 ||
    a >= 36 ||
    b >= 36 ||
    Math.abs((a % 6) - (b % 6)) +
      Math.abs(Math.floor(a / 6) - Math.floor(b / 6)) !==
      1
  )
    return invalid;
  let cells = [...g.cells];
  [cells[a], cells[b]] = [cells[b], cells[a]];
  const swapped = [...cells];
  let hit = matches(cells);
  if (!hit.length) return { ...invalid, swapped };
  let score = g.score;
  const cascades: MatchCascade[] = [];
  for (let n = 0; hit.length && n < 20; n++) {
    const before = [...cells],
      removed = [...hit],
      gone = new Set(hit),
      falls: MatchFall[] = [];
    score += hit.length;
    for (let x = 0; x < 6; x++) {
      const survivors = Array.from({ length: 6 }, (_, y) => y * 6 + x).filter(
        (i) => !gone.has(i),
      );
      const holes = 6 - survivors.length;
      for (let y = holes - 1; y >= 0; y--) {
        const value = Math.floor(random() * 5),
          to = y * 6 + x;
        cells[to] = value;
        falls.push({ from: null, to, value, spawnRow: y - holes });
      }
      survivors.forEach((from, j) => {
        const to = (holes + j) * 6 + x;
        cells[to] = before[from];
        falls.push({ from, to, value: before[from] });
      });
    }
    cascades.push({ before, after: [...cells], removed, falls });
    hit = matches(cells);
  }
  return {
    next: { ...g, cells, score, turns: g.turns - 1 },
    swapped,
    cascades,
  };
}
export function swapMatch(
  g: Match,
  a: number,
  b: number,
  random = Math.random,
): Match {
  return planMatchSwap(g, a, b, random).next;
}
export type Tea = number[][];
export const newTea = (): Tea => [[0, 1, 2], [1, 2, 0], [2, 0, 1], [], []];
export const teaWon = (cups: Tea) =>
  cups.every(
    (c) => !c.length || (c.length === 3 && c.every((v) => v === c[0])),
  );
export function pour(cups: Tea, a: number, b: number): Tea {
  if (a === b || !cups[a]?.length || !cups[b] || cups[b].length >= 3)
    return cups;
  const color = cups[a].at(-1)!;
  if (cups[b].length && cups[b].at(-1) !== color) return cups;
  const next = cups.map((c) => [...c]);
  while (next[a].at(-1) === color && next[b].length < 3)
    next[b].push(next[a].pop()!);
  return next;
}
export const treasures = [
  { id: "key", x: 17, y: 68 },
  { id: "acorn", x: 78, y: 74 },
  { id: "ribbon", x: 42, y: 34 },
  { id: "spoon", x: 66, y: 54 },
  { id: "button", x: 28, y: 46 },
] as const;
export const hiddenWon = (found: string[]) =>
  treasures.every((t) => found.includes(t.id));
