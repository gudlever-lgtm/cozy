import test from "node:test";
import assert from "node:assert/strict";
import {
  boardMetrics,
  dropDestination,
  fitSolitaireBoard,
} from "../src/presentation/board";
import { swipeNeighbour } from "../src/presentation/matchGesture";
import { newGame } from "../src/engine/solitaire";
test("landscape board fits phone/tablet widths and leaves stable readable overlaps", () => {
  for (const [w, h] of [
    [568, 320],
    [740, 360],
    [844, 390],
    [1024, 768],
    [1366, 1024],
  ]) {
    const m = boardMetrics(w, h);
    assert.ok(m.cardWidth * 7 + 48 <= w - m.rail - 16);
    assert.ok(m.step >= 18);
    assert.ok(m.cardWidth >= 30);
  }
});
test("swipes choose one orthogonal neighbour with threshold and no row wrapping", () => {
  assert.equal(swipeNeighbour(7, 2, 3, 50), null);
  assert.equal(swipeNeighbour(7, 30, 4, 50), 8);
  assert.equal(swipeNeighbour(7, -30, 4, 50), 6);
  assert.equal(swipeNeighbour(7, 2, -30, 50), 1);
  assert.equal(swipeNeighbour(7, 2, 30, 50), 13);
  assert.equal(swipeNeighbour(5, 40, 0, 50), null);
  assert.equal(swipeNeighbour(0, 0, -40, 50), null);
  assert.equal(swipeNeighbour(35, 0, 40, 50), null);
});
test("drop chooses one legal foundation with forgiving margin and rejects illegal cards", () => {
  const g = newGame("drop");
  g.waste = [{ id: "ace", rank: 1, suit: "♥", up: true }];
  g.foundations = [[], [], [], []];
  const regions = g.foundations.map((_, pile) => ({
    place: { kind: "foundations" as const, pile },
    x: 100 + pile * 65,
    y: 20,
    width: 55,
    height: 80,
  }));
  assert.deepEqual(dropDestination(g, { kind: "waste" }, 95, 40, regions), {
    kind: "foundations",
    pile: 0,
  });
  assert.deepEqual(dropDestination(g, { kind: "waste" }, 163, 40, regions), {
    kind: "foundations",
    pile: 1,
  });
  g.waste[0].rank = 2;
  assert.equal(
    dropDestination(g, { kind: "waste" }, 120, 40, regions),
    undefined,
  );
  assert.equal(
    dropDestination(g, { kind: "waste" }, 120, 300, regions),
    undefined,
  );
});

const faceUp = (count: number) =>
  Array.from({ length: count }, () => ({ up: true }));
test("full initial and long legal columns fit measured phone board viewports without scrolling", () => {
  for (const [width, height] of [
    [414, 190],
    [440, 222],
    [600, 262],
    [680, 292],
    [880, 630],
  ]) {
    for (const piles of [
      Array.from({ length: 7 }, (_, i) => [
        ...Array.from({ length: i }, () => ({ up: false })),
        { up: true },
      ]),
      [
        ...Array.from({ length: 6 }, () => []),
        [...Array.from({ length: 6 }, () => ({ up: false })), ...faceUp(13)],
      ],
      Array.from({ length: 7 }, () => faceUp(13)),
    ]) {
      const layout = fitSolitaireBoard(width, height, piles);
      assert.ok(
        layout.usedHeight <= height + 1e-8,
        `board height ${layout.usedHeight} exceeds ${height}`,
      );
      assert.ok(layout.cardWidth * 7 + 24 + layout.padding * 2 <= width);
      layout.columns.forEach((column, i) => {
        assert.ok(column.height <= layout.tableauHeight + 1e-8);
        assert.equal(column.offsets.length, piles[i].length);
        column.visibleIndices.forEach((index, j) => {
          const y = column.offsets[index];
          assert.ok(y >= 0);
          assert.ok(y + layout.cardHeight <= layout.tableauHeight + 1e-8);
          if (j) assert.ok(y > column.offsets[column.visibleIndices[j - 1]]);
        });
      });
    }
  }
});
test("extending one column leaves all unrelated cards and columns stationary", () => {
  const piles = Array.from({ length: 7 }, () => faceUp(4));
  const a = fitSolitaireBoard(440, 222, piles);
  const b = fitSolitaireBoard(440, 222, [faceUp(13), ...piles.slice(1)]);
  assert.equal(a.cardWidth, b.cardWidth);
  assert.equal(a.cardHeight, b.cardHeight);
  assert.deepEqual(a.columns.slice(1), b.columns.slice(1));
  assert.ok(fitSolitaireBoard(440, 300, piles).cardWidth > a.cardWidth);
});

test("collapsed runs show the first exposed card and outermost card while keeping intermediate indices", () => {
  const pile = [{ up: false }, { up: false }, ...faceUp(8)];
  const column = fitSolitaireBoard(440, 222, [pile]).columns[0];
  assert.deepEqual(column.visibleIndices, [0, 1, 2, 9]);
  assert.deepEqual(column.hiddenIndices, [3, 4, 5, 6, 7, 8]);
  const pair = fitSolitaireBoard(440, 222, [faceUp(2)]).columns[0];
  assert.deepEqual(pair.visibleIndices, [0, 1]);
  assert.deepEqual(pair.hiddenIndices, []);
});

test("a legal foundation drop accepts card overlap when the final finger is outside the slot", () => {
  const g = newGame("overlap");
  g.waste = [{ id: "ace", rank: 1, suit: "♥", up: true }];
  g.foundations = [[], [], [], []];
  const regions = [
    {
      place: { kind: "foundations" as const, pile: 0 },
      x: 100,
      y: 10,
      width: 50,
      height: 70,
    },
    {
      place: { kind: "foundations" as const, pile: 1 },
      x: 170,
      y: 10,
      width: 50,
      height: 70,
    },
  ];
  assert.deepEqual(
    dropDestination(g, { kind: "waste" }, 60, 100, regions, {
      x: 95,
      y: 15,
      width: 50,
      height: 70,
    }),
    { kind: "foundations", pile: 0 },
  );
  assert.deepEqual(
    dropDestination(g, { kind: "waste" }, 155, 20, regions, {
      x: 168,
      y: 15,
      width: 50,
      height: 70,
    }),
    { kind: "foundations", pile: 1 },
  );
  g.waste[0].rank = 2;
  assert.equal(
    dropDestination(g, { kind: "waste" }, 60, 100, regions, {
      x: 95,
      y: 15,
      width: 50,
      height: 70,
    }),
    undefined,
  );
});

test("fresh Garden Match boards always start with a legal swipe and no free match", async () => {
  const { newMatch, hasMatchMove, matches } =
    await import("../src/engine/minigames");
  for (let seed = 0; seed < 100; seed++) {
    let state = seed + 1;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
    const board = newMatch(random);
    assert.deepEqual(matches(board.cells), []);
    assert.equal(hasMatchMove(board.cells), true);
  }
});

test("match motion plan preserves every survivor and refills only holes in the same column", async () => {
  const { newMatch, planMatchSwap, swapMatch, matches } =
    await import("../src/engine/minigames");
  const cells = Array.from(
    { length: 36 },
    (_, i) => ((i % 6) + Math.floor(i / 6)) % 5,
  );
  cells[0] = 0;
  cells[1] = 1;
  cells[2] = 0;
  cells[7] = 0;
  const game = { ...newMatch(), cells };
  const snapshot = JSON.stringify(game);
  const plan = planMatchSwap(game, 1, 7, () => 0.17);
  assert.ok(plan.cascades.length > 0);
  assert.equal(JSON.stringify(game), snapshot);
  assert.deepEqual(
    plan.next,
    swapMatch(game, 1, 7, () => 0.17),
  );
  let score = 0,
    previous = plan.swapped;
  for (const stage of plan.cascades) {
    assert.deepEqual(stage.before, previous);
    assert.deepEqual(new Set(stage.removed), new Set(matches(stage.before)));
    score += stage.removed.length;
    assert.equal(stage.falls.length, 36);
    assert.equal(new Set(stage.falls.map((f) => f.to)).size, 36);
    for (const fall of stage.falls) {
      assert.equal(stage.after[fall.to], fall.value);
      if (fall.from !== null) {
        assert.ok(!stage.removed.includes(fall.from));
        assert.equal(fall.from % 6, fall.to % 6);
        assert.ok(fall.to >= fall.from);
        assert.equal(stage.before[fall.from], fall.value);
      } else assert.ok(fall.spawnRow! < 0);
    }
    for (let x = 0; x < 6; x++) {
      const survivors = Array.from({ length: 6 }, (_, y) => y * 6 + x).filter(
        (i) => !stage.removed.includes(i),
      );
      assert.deepEqual(
        stage.falls
          .filter((f) => f.from !== null && f.to % 6 === x)
          .map((f) => f.from),
        survivors,
      );
    }
    previous = stage.after;
  }
  assert.equal(plan.next.score, game.score + score);
  assert.equal(plan.next.turns, game.turns - 1);
  assert.deepEqual(plan.next.cells, previous);
});

test("fixed decoration/statistic pages fit their viewport without overflow", async () => {
  const { pageGeometry } = await import("../src/presentation/paging");
  for (const [w, h] of [
    [414, 190],
    [480, 220],
    [568, 262],
    [740, 302],
    [1000, 600],
  ]) {
    const g = pageGeometry(w, h);
    assert.ok(16 + 30 + 44 + 16 + g.gridHeight <= h);
    assert.ok(g.cardHeight >= 64);
    assert.ok(g.perPage >= 1 && g.perPage <= 4);
  }
});

test("stack picker reserves full card faces and measured paging controls", async () => {
  const { stackPickerGeometry } =
    await import("../src/presentation/stackPicker");
  for (const [w, h] of [
    [400, 190],
    [568, 280],
    [740, 320],
    [900, 650],
  ]) {
    const g = stackPickerGeometry(w, h);
    assert.ok(g.cardHeight >= 60);
    assert.ok(g.cardHeight <= g.areaHeight);
    assert.ok(
      g.perPage * g.cardWidth + (g.perPage - 1) * g.gap <= w - 2 * g.padding,
    );
    assert.ok(
      g.padding * 2 + g.header + g.footer + g.gap * 2 + g.areaHeight <= h,
    );
  }
});

test("quest guidance separates locked, active, ready and collected rewards", async () => {
  const { fresh } = await import("../src/engine/save");
  const { quests, claimQuest } = await import("../src/engine/world");
  const { questView, recommendedQuest } =
    await import("../src/presentation/quests");
  let save = fresh("quests", "en");
  const first = quests.find((q) => q.id === "millie1")!,
    second = quests.find((q) => q.id === "millie2")!;
  save.economy.inventory = ["flowers"];
  assert.equal(questView(save, first).status, "active");
  assert.equal(questView(save, second).status, "locked");
  save.counters.match = 1;
  assert.equal(questView(save, first).status, "ready");
  assert.equal(recommendedQuest(save)?.quest.id, "millie1");
  const result = claimQuest(
    save.economy,
    save.completed,
    first.id,
    save.counters,
  );
  save = { ...save, ...result };
  assert.equal(questView(save, first).status, "completed");
  assert.equal(questView(save, second).status, "ready");
  const pip = questView(
    save,
    quests.find((q) => q.id === "pip1")!,
  );
  assert.equal(pip.next?.objective.type, "hidden");
  assert.equal(pip.progress.total, 3);
});

test("journey progress reflects real objectives, claims, areas, stories and upgrades without mutating saves", async () => {
  const { fresh } = await import("../src/engine/save"),
    { quests, upgrades } = await import("../src/engine/world"),
    { areas, stories, buildings } = await import("../src/engine/progression"),
    { journeyProgress } = await import("../src/presentation/journey");
  const save = fresh("journey", "en");
  assert.equal(journeyProgress(save).percent, 0);
  save.counters.gather = 1;
  assert.ok(journeyProgress(save).done > 0);
  save.counters = {
    solitaire: 100,
    match: 100,
    hidden: 100,
    tea: 100,
    gather: 100,
  };
  save.completed = quests.map((q) => q.id);
  save.economy.inventory = upgrades.map((u) => u.id);
  save.world.areas = areas.map((a) => a.id);
  save.world.stories = stories.map((s) => s.id);
  save.world.buildings = Object.fromEntries(buildings.map((b) => [b.id, 3]));
  const original = JSON.stringify(save),
    progress = journeyProgress(save);
  assert.equal(progress.done, progress.total);
  assert.equal(progress.percent, 100);
  assert.equal(JSON.stringify(save), original);
});

import {
  solitaireIdleHint,
  matchIdleHint,
  teaIdleHint,
} from "../src/presentation/idleHints";
import { canMove } from "../src/engine/solitaire";
import { newMatch, pour, teaWon, planMatchSwap } from "../src/engine/minigames";
import { teaForLevel } from "../src/engine/session";
test("idle suggestions are legal and never mutate Solitaire or match boards", () => {
  for (let seed = 0; seed < 15; seed++) {
    const game = newGame("idle-" + seed),
      copy = structuredClone(game);
    const move = solitaireIdleHint(game);
    if (move) assert.ok(canMove(game, move.from, move.to));
    assert.deepEqual(game, copy);
  }
  const match = newMatch(),
    before = structuredClone(match),
    swap = matchIdleHint(match)!;
  assert.ok(swap);
  assert.notEqual(planMatchSwap(match, ...swap).next, match);
  assert.deepEqual(match, before);
  assert.equal(matchIdleHint({ ...match, turns: 0 }), null);
  assert.equal(matchIdleHint({ ...match, score: match.target }), null);
});
test("Tea Time idle suggestions lead to a solution at every difficulty and respect selected sources", () => {
  for (const level of [1, 2, 3] as const) {
    let game = teaForLevel(level);
    const original = structuredClone(game);
    const first = teaIdleHint(game)!;
    assert.ok(first);
    assert.deepEqual(game, original);
    const selected = teaIdleHint(game, first[0])!;
    assert.equal(selected[0], first[0]);
    for (let step = 0; step < 40 && !teaWon(game); step++) {
      const move = teaIdleHint(game);
      assert.ok(move);
      const next = pour(game, ...move);
      assert.notEqual(next, game);
      game = next;
    }
    assert.ok(teaWon(game));
    assert.equal(teaIdleHint(game), null);
  }
});

import {
  DECORATION_ANCHORS,
  decorationLayout,
} from "../src/presentation/decorations";
test("authored decorations stay grounded and inside wide/narrow native scene bounds", () => {
  for (const [width, height] of [
    [360, 220],
    [600, 250],
    [950, 320],
    [1024, 680],
  ]) {
    for (const id of Object.keys(
      DECORATION_ANCHORS,
    ) as (keyof typeof DECORATION_ANCHORS)[]) {
      const box = decorationLayout(id, width, height);
      assert.ok(box.left >= 0 && box.top >= 0);
      assert.ok(box.left + box.width <= width);
      assert.ok(box.top + box.height <= height);
      assert.ok(box.height <= height * 0.32 + 0.01);
    }
  }
});

test("new decoration and forest artwork is bundled PNG with verified provenance and transparent decoration edges", async () => {
  const { readFile } = await import("node:fs/promises");
  const { createHash } = await import("node:crypto");
  const provenance = JSON.parse(
    await readFile("assets/illustration-provenance.json", "utf8"),
  );
  assert.equal(provenance.assets.length, 17);
  for (const asset of provenance.assets) {
    const data = await readFile(asset.native_path);
    assert.equal(data.subarray(1, 4).toString(), "PNG");
    assert.equal(createHash("sha256").update(data).digest("hex"), asset.sha256);
    assert.deepEqual(
      [data.readUInt32BE(16), data.readUInt32BE(20)],
      asset.dimensions,
    );
    if (asset.kind === "decoration" || asset.kind === "forest_structure") {
      assert.equal(data[25], 6);
      assert.ok(
        asset.fully_transparent_pixels >
          asset.dimensions[0] * asset.dimensions[1] * 0.1,
      );
    }
    const catalog = await readFile(
      asset.kind === "decoration"
        ? "src/assets/decorations.ts"
        : asset.kind === "cottage_background"
          ? "src/assets/images.ts"
          : asset.kind === "area_background"
            ? "src/assets/areas.ts"
            : "src/assets/forest.ts",
      "utf8",
    );
    assert.ok(catalog.includes(`require("../../${asset.native_path}")`));
  }
});

import { transact, resourceGains } from "../src/engine/world";
import { fresh, migrate } from "../src/engine/save";
test("resource discoveries record only actual positive gains once, preserve spending and cap history", () => {
  let economy = fresh("resource-history", "en").economy;
  economy = transact(economy, "gather:first", { wood: 2, stone: 1 });
  assert.deepEqual(economy.gains, [
    { id: "gather:first", amounts: { wood: 2, stone: 1 } },
  ]);
  assert.equal(
    transact(economy, "gather:first", { wood: 2, stone: 1 }),
    economy,
  );
  economy = transact(economy, "spend", { wood: -1 });
  assert.equal(economy.gains!.length, 1);
  assert.equal(economy.wallet.wood, 1);
  for (let i = 0; i < 20; i++)
    economy = transact(economy, "new:" + i, { seeds: 1 });
  assert.equal(economy.gains!.length, 12);
  assert.equal(economy.gains![0].id, "new:19");
  assert.equal(economy.wallet.seeds, 20);
});
test("legacy and malformed optional discovery metadata cannot erase balances or invent historical gains", () => {
  const save = fresh("old-materials", "en");
  save.economy.wallet.wood = 9;
  delete save.economy.gains;
  const restored = migrate(JSON.stringify(save), "restore", "en");
  assert.deepEqual(restored.economy.gains, []);
  assert.equal(restored.economy.wallet.wood, 9);
  const invalid = {
    ...save,
    economy: {
      ...save.economy,
      gains: [
        { id: "bad", amounts: { wood: -3 } },
        { id: "unsafe", amounts: { stone: 1.2 } },
      ],
    },
  };
  const recovered = migrate(JSON.stringify(invalid), "restore", "en");
  assert.deepEqual(recovered.economy.gains, []);
  assert.deepEqual(recovered.game, save.game);
  assert.equal(recovered.economy.wallet.wood, 9);
  assert.deepEqual(
    resourceGains([
      { id: "one", amounts: { wood: 1 } },
      { id: "one", amounts: { wood: 2 } },
    ]),
    [{ id: "one", amounts: { wood: 1 } }],
  );
});

import { gameReward } from "../src/engine/world";
import { reward as grantWin } from "../src/engine/save";
test("won mini-games scale every material by actual difficulty, retain currency and pay only once", () => {
  for (const kind of ["hidden", "match", "tea"] as const) {
    const base = gameReward(kind, 1);
    for (const level of [1, 2, 3] as const) {
      const save = fresh("scaled-" + kind, "en"),
        paid = grantWin(save, kind, "round", level);
      for (const resource of ["wood", "stone", "flowers", "seeds"] as const)
        assert.equal(paid.economy.wallet[resource], base[resource]! * level);
      assert.equal(paid.economy.wallet.glimmers, 20);
      assert.equal(paid.counters.gather, save.counters.gather + 1);
      assert.equal(grantWin(paid, kind, "round", level), paid);
    }
  }
});
test("Solitaire materials use the saved deal's draw mode, not a future selection or caller override", () => {
  const easy = fresh("one", "en");
  easy.game.draw = 1;
  const hard = fresh("three", "en");
  hard.game.draw = 3;
  const a = grantWin(easy, "solitaire", "one", 3),
    b = grantWin(hard, "solitaire", "three", 1);
  assert.equal(a.economy.wallet.wood, 2);
  assert.equal(b.economy.wallet.wood, 4);
  assert.equal(a.economy.wallet.glimmers, 60);
  assert.equal(b.economy.wallet.glimmers, 60);
});
