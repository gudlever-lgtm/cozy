/** Automated visual/layout and touch checks against `npm run preview:design -- --port 8083`. */
import { chromium, type Page } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fresh, setProfile, reward } from "../src/engine/save";
import { newGame, hints, cardsAt } from "../src/engine/solitaire";
import { seededRandom } from "../src/engine/random";
import { miniPair } from "../src/engine/miniProgress";

const url = process.env.COZY_PREVIEW_URL ?? "http://127.0.0.1:8083";
const output = path.resolve("work/design-checks");
fs.mkdirSync(output, { recursive: true });
let sample = reward(
  setProfile(fresh("design-check", "da"), "Haveven", "design-player"),
  "solitaire",
  "design-win",
);
sample = {
  ...sample,
  game: newGame("design-cards", 3, seededRandom(2026)),
  preferences: {
    ...sample.preferences,
    season: "summer",
    animations: false,
    reducedMotion: true,
  },
  economy: {
    ...sample.economy,
    wallet: { ...sample.economy.wallet, glimmers: 120, wood: 12 },
  },
};
const executablePath =
  process.env.CHROMIUM_PATH ??
  ["/usr/bin/chromium", "/usr/bin/google-chrome"].find((p) => fs.existsSync(p));
if (!executablePath)
  throw Error("Set CHROMIUM_PATH to an installed Chromium browser.");
const errors: string[] = [];
const overlap = (
  a: { x: number; y: number; width: number; height: number },
  b: typeof a,
) =>
  Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 1 &&
  Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 1;
async function capture(page: Page, name: string) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(output, name + ".png") });
}
async function seed(page: Page, save = sample) {
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript((value) => {
    try {
      if (!localStorage.getItem("cozy.save"))
        localStorage.setItem("cozy.save", value);
    } catch {}
  }, JSON.stringify(save));
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await page.getByTestId("garden-fullscreen").waitFor();
}
async function menu(page: Page, id: string) {
  await page.getByRole("button", { name: "Hovedmenu", exact: true }).click();
  await page.getByTestId(`menu-${id}`).click();
}
async function main() {
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    for (const [name, width, height] of [
      ["small-portrait", 320, 568],
      ["small-landscape", 568, 320],
      ["portrait", 390, 844],
      ["landscape", 844, 390],
      ["tablet", 1024, 768],
    ] as const) {
      const page = await browser.newPage({
        viewport: { width, height },
        deviceScaleFactor: 1,
      });
      await seed(page);
      await capture(page, `${name}-garden`);
      const controls = await Promise.all([
        page.getByTestId("active-mini-pair").boundingBox(),
        page.getByTestId("garden-edit-toggle").boundingBox(),
        page
          .getByRole("button", { name: "Spil kabale", exact: true })
          .boundingBox(),
        page.getByTestId("garden-zoom-in").boundingBox(),
        page.getByTestId("main-tabs").boundingBox(),
      ]);
      for (let i = 0; i < controls.length; i++)
        for (let j = i + 1; j < controls.length; j++) {
          assert(controls[i] && controls[j]);
          assert(
            !overlap(controls[i]!, controls[j]!),
            `${name}: garden control overlap ${i}/${j}`,
          );
        }
      await page
        .getByRole("button", { name: "♠ Spil kabale", exact: true })
        .click();
      await capture(page, `${name}-solitaire`);
      const board = await page.getByTestId("solitaire-board").boundingBox(),
        toolbar = await page.getByTestId("solitaire-toolbar").boundingBox(),
        nav = await page.getByTestId("main-tabs").boundingBox();
      assert(board && toolbar && nav);
      assert(!overlap(board, toolbar), `${name}: toolbar covers board`);
      assert(!overlap(toolbar, nav), `${name}: navigation covers actions`);
      assert(
        await page
          .getByRole("button", { name: "Nyt spil", exact: true })
          .isEnabled(),
      );
      await page.getByRole("button", { name: "Nyt spil", exact: true }).click();
      await capture(page, `${name}-dialog`);
      await page
        .getByRole("button", { name: "Spil videre", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Hovedmenu", exact: true })
        .click();
      await capture(page, `${name}-menu`);
      await page.getByTestId("menu-settings").click();
      await capture(page, `${name}-settings`);
      await menu(page, "quests");
      await capture(page, `${name}-quests`);
      await menu(page, "inventory");
      await capture(page, `${name}-inventory`);
      await menu(page, "decorations");
      await page.getByTestId("garden-build-screen").waitFor();
      await capture(page, `${name}-build`);
      assert.equal(await page.getByTestId("main-tabs").count(), 0);
      await page.getByRole("button", { name: "Færdig", exact: true }).click();
      await page.getByTestId("active-mini-match").click();
      await capture(page, `${name}-match`);
      await page.close();
    }
    const teaPage = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await seed(teaPage, {
      ...sample,
      miniProgress: {
        ...sample.miniProgress,
        round: 1,
        slots: miniPair(1).map((slot) => ({ ...slot, moves: 10 })),
      },
    });
    await teaPage.getByTestId("active-mini-tea").click();
    await capture(teaPage, "portrait-tea");
    await teaPage.close();
    const hiddenPage = await browser.newPage({
      viewport: { width: 568, height: 320 },
    });
    await seed(hiddenPage);
    await hiddenPage.getByTestId("active-mini-hidden").click();
    await capture(hiddenPage, "small-landscape-hidden");
    await hiddenPage.close();
    const page = await browser.newPage({
      viewport: { width: 844, height: 390 },
      hasTouch: true,
    });
    await seed(page);
    await page
      .getByRole("button", { name: "♠ Spil kabale", exact: true })
      .click();
    // Native apps do not have browser swipe-back. Suppress it for this touch simulation.
    await page.addStyleTag({
      content: "html,body{overscroll-behavior:none;touch-action:none}",
    });
    const move = hints(sample.game)[0];
    assert(move);
    const source = page.getByTestId(
      "playing-card-" + cardsAt(sample.game, move.from)[0].id,
    );
    const target = page.getByRole("button", {
      name:
        (move.to.kind === "foundations" ? "Grundbunke " : "Kolonne ") +
        (move.to.kind === "waste" ? 0 : move.to.pile + 1),
      exact: true,
    });
    const a = await source.boundingBox(),
      z = await target.boundingBox();
    assert(a && z);
    const client = await page.context().newCDPSession(page);
    const x = a.x + a.width / 2,
      y = a.y + a.height / 2,
      tx = z.x + z.width / 2,
      ty = z.y + z.height / 2;
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let i = 1; i <= 12; i++) {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          { x: x + ((tx - x) * i) / 12, y: y + ((ty - y) * i) / 12 },
        ],
      });
      await page.waitForTimeout(20);
    }
    await page.screenshot({ path: path.join(output, "drag-active.png") });
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("cozy.save")!).game.moves === 1,
      null,
      { timeout: 10000 },
    );
    const moved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("cozy.save")!),
    );
    assert.deepEqual(moved.economy.wallet, sample.economy.wallet);
    await page.getByRole("button", { name: "Fortryd", exact: true }).click();
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("cozy.save")!).game.moves === 0,
    );
    await page.reload({ waitUntil: "networkidle" });
    const restored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("cozy.save")!),
    );
    assert.deepEqual(restored.game, sample.game);
    assert.equal(restored.miniProgress.undo, sample.miniProgress.undo - 1);
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(output, "result.json"),
      JSON.stringify(
        {
          viewports: 5,
          screenshots: 48,
          drag: true,
          undo: true,
          saveReload: true,
          errors,
        },
        null,
        2,
      ),
    );
    console.log(
      "PASS: five viewports, all screens, no control overlaps, touch drag, undo and save/reload.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
