import { test, expect } from "@playwright/test";
import { newTea, pour, teaWon, type Tea } from "../../src/engine/minigames";
function solveTea() {
  const queue: { g: Tea; moves: number[][] }[] = [{ g: newTea(), moves: [] }],
    seen = new Set<string>();
  while (queue.length) {
    const { g, moves } = queue.shift()!;
    if (teaWon(g)) return moves;
    for (let a = 0; a < 5; a++)
      for (let b = 0; b < 5; b++) {
        const next = pour(g, a, b),
          key = JSON.stringify(next);
        if (!seen.has(key)) {
          seen.add(key);
          queue.push({ g: next, moves: [...moves, [a, b]] });
        }
      }
  }
  throw Error("unsolvable");
}
async function onboard(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("textbox", { name: "Player name" }).fill("Åse Haven");
  await page
    .getByRole("button", { name: "Confirm player name", exact: true })
    .click();
  await expect(
    page.getByText("Welcome to Cozy Solitaire, Åse Haven!"),
  ).toBeVisible();
}
test("profile, active solitaire, language switching, rename and offline restart", async ({
  page,
  context,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await onboard(page);
  await page
    .getByRole("button", { name: /Play Solitaire/ })
    .first()
    .click();
  await page.getByRole("button", { name: "Draw cards", exact: true }).click();
  await expect(page.getByText("1 move", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByText("0 moves", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Draw cards", exact: true }).click();
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem("cozy.save")!).game,
  );
  await page.getByRole("button", { name: /Settings/ }).click();
  await page.getByRole("button", { name: "Dansk", exact: true }).click();
  await expect(page.getByText("Spillerprofil", { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Spillernavn" }).fill("Øster Haven");
  await page
    .getByRole("button", { name: "Gem spillernavn", exact: true })
    .click();
  await page
    .getByRole("button", { name: /Spil kabale/ })
    .first()
    .click();
  await expect(page.getByText("1 træk", { exact: true })).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("cozy.save")!).profile.username,
      ),
    )
    .toBe("Øster Haven");
  const after = await page.evaluate(
    () => JSON.parse(localStorage.getItem("cozy.save")!).game,
  );
  expect(after).toEqual(before);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByText("Velkommen til Cozy Solitaire, Øster Haven!"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Spil kabale/ })
    .first()
    .click();
  await expect(page.getByText("1 træk", { exact: true })).toBeVisible();
  await page.screenshot({
    path: `test-results/${info.project.name}-solitaire.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("hidden treasures, tea sorting, rewards, quest claim and garden upgrade", async ({
  page,
}, info) => {
  await onboard(page);
  await page
    .getByRole("button", { name: /Mini-games/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Continue", exact: true })
    .nth(1)
    .click();
  for (const name of ["Key", "Acorn", "Ribbon", "Spoon", "Button"])
    await page.getByRole("button", { name, exact: true }).click();
  await expect(page.getByText("Beautifully done! +20 Glimmers")).toBeVisible();
  await expect(page.getByText("✦ 20 Glimmers", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page
    .getByRole("button", { name: "Continue", exact: true })
    .nth(2)
    .click();
  for (const [a, b] of solveTea()) {
    await page
      .getByRole("button", { name: `Tray ${a + 1}`, exact: true })
      .click();
    await page
      .getByRole("button", { name: `Tray ${b + 1}`, exact: true })
      .click();
  }
  await expect(page.getByText("Beautifully done! +20 Glimmers")).toBeVisible();
  await page.getByRole("button", { name: /Quest Journal/ }).click();
  await page
    .getByRole("button", { name: "Collect reward", exact: true })
    .nth(1)
    .click();
  await expect(page.getByText("✦ 65 Glimmers", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Decorations/ }).click();
  await page
    .getByRole("button", { name: "Unlock · 20 Glimmers + 0 wood", exact: true })
    .first()
    .click();
  await expect(page.getByText("✦ 45 Glimmers", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /My Garden/ }).click();
  await page.screenshot({
    path: `test-results/${info.project.name}-garden.png`,
    fullPage: true,
  });
});
test("tap and drag moves, safe finish and single victory reward", async ({
  page,
}) => {
  const { fresh, setProfile } = await import("../../src/engine/save");
  const { suits, snapshot } = await import("../../src/engine/solitaire");
  let s = setProfile(fresh("ending", "en"), "Card Gardener", "player");
  const card = (rank: number, suit: (typeof suits)[number]) => ({
    id: suit + rank,
    rank,
    suit,
    up: true,
  });
  s.game.stock = [];
  s.game.waste = [];
  s.game.foundations = suits.map((suit) =>
    Array.from({ length: 12 }, (_, i) => card(i + 1, suit)),
  );
  s.game.tableau = [...suits.map((suit) => [card(13, suit)]), [], [], []];
  s.game.initial = snapshot(s.game);
  await page.goto("/");
  await page.evaluate(
    (save) => localStorage.setItem("cozy.save", JSON.stringify(save)),
    s,
  );
  await page.reload();
  await page
    .getByRole("button", { name: /Play Solitaire/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: "King of spades", exact: true })
    .click();
  await page.getByRole("button", { name: "Tableau 5", exact: true }).click();
  await expect(page.getByText("1 move", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  const from = await page
      .getByRole("button", { name: "King of spades", exact: true })
      .boundingBox(),
    to = await page
      .getByRole("button", { name: "Tableau 5", exact: true })
      .boundingBox();
  expect(from).toBeTruthy();
  expect(to).toBeTruthy();
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  await page.mouse.down();
  await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, {
    steps: 12,
  });
  await page.mouse.up();
  await expect(page.getByText("1 move", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Safe finish", exact: true }).click();
  await expect(page.getByText("A lovely win!", { exact: true })).toBeVisible();
  await expect(page.getByText("✦ 60 Glimmers", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Safe finish", exact: true }).click();
  await expect(page.getByText("✦ 60 Glimmers", { exact: true })).toBeVisible();
});

test("Garden Match reaches its goal with valid adjacent swaps", async ({
  page,
}) => {
  await onboard(page);
  await page
    .getByRole("button", { name: /Mini-games/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Continue", exact: true })
    .nth(0)
    .click();
  const { matches } = await import("../../src/engine/minigames");
  const glyphs = ["🌸", "🌿", "🫐", "🌼", "🌷"];
  const cells = page.getByRole("button", { name: /^(🌸|🌿|🫐|🌼|🌷) /u });
  for (let turn = 0; turn < 18; turn++) {
    if (await page.getByText("Beautifully done! +20 Glimmers").count()) break;
    const values = (await cells.allTextContents()).map((v) =>
      glyphs.indexOf(v),
    );
    let best: number[] | null = null,
      bestScore = 0;
    for (let a = 0; a < 36; a++)
      for (const b of [a + 1, a + 6]) {
        if (b >= 36 || (b === a + 1 && a % 6 === 5)) continue;
        const copy = [...values];
        [copy[a], copy[b]] = [copy[b], copy[a]];
        const score = matches(copy).length;
        if (score > bestScore) {
          best = [a, b];
          bestScore = score;
        }
      }
    if (!best) {
      await page
        .getByRole("button", { name: "Refresh flowers", exact: true })
        .click();
      turn--;
      continue;
    }
    await cells.nth(best[0]).click();
    await cells.nth(best[1]).click();
  }
  await expect(page.getByText("Beautifully done! +20 Glimmers")).toBeVisible();
  await expect(page.getByText("✦ 20 Glimmers", { exact: true })).toBeVisible();
});
