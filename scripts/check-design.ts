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
async function assertWholeGarden(page: Page) {
  const viewport = (await page.getByTestId("garden-viewport").boundingBox())!;
  const scene = (await page.getByTestId("garden-scene").boundingBox())!;
  const dimensions = await page
    .getByTestId("garden-background-image")
    .locator("img")
    .first()
    .evaluate((image) => ({
      width: (image as HTMLImageElement).naturalWidth,
      height: (image as HTMLImageElement).naturalHeight,
    }));
  // Landscape seasonal artwork is intentionally cropped within the portrait
  // camera plane. The camera itself must still fit the viewport at 100%.
  const screen = page.viewportSize();
  const plane =
    screen && screen.height > screen.width
      ? { width: 941, height: 1672 }
      : dimensions;
  const fit = Math.min(
    viewport.width / plane.width,
    viewport.height / plane.height,
  );
  assert.ok(
    Math.abs(scene.width - plane.width * fit) < 1 &&
      Math.abs(scene.height - plane.height * fit) < 1,
    "100% must fit the garden camera plane",
  );
  assert.ok(
    scene.x >= viewport.x - 1 &&
      scene.y >= viewport.y - 1 &&
      scene.x + scene.width <= viewport.x + viewport.width + 1 &&
      scene.y + scene.height <= viewport.y + viewport.height + 1,
    "All four camera plane edges must be visible",
  );
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
      await assertWholeGarden(page);
      // Regression: character portraits must remain inside their top-bar
      // buttons. The previously unbounded image covered most of the garden.
      for (const character of ["millie", "marmalade"] as const) {
        const image = (await page
          .getByTestId(`living-character-${character}`)
          .boundingBox())!;
        const button = (await page
          .getByRole("button", { name: character === "millie" ? /Millie/ : /Marmalade/ })
          .boundingBox())!;
        assert.ok(image && button, `${name}: missing ${character} portrait`);
        assert.ok(
          image.width <= 44 && image.height <= 44 &&
            image.x >= button.x - 1 && image.y >= button.y - 1 &&
            image.x + image.width <= button.x + button.width + 1 &&
            image.y + image.height <= button.y + button.height + 1,
          `${name}: ${character} portrait escapes the top-bar button`,
        );
      }
      const screenRect = { x: 0, y: 0, width, height };
      const insideScreen = (box: typeof screenRect) =>
        box.x >= -1 &&
        box.y >= -1 &&
        box.x + box.width <= width + 1 &&
        box.y + box.height <= height + 1;
      for (const id of [
        "garden-friends",
        "garden-resources",
        "garden-edit-toggle",
        "garden-play-button",
        "active-mini-pair",
        "main-tabs",
      ]) {
        const rect = (await page.getByTestId(id).boundingBox())!;
        assert.ok(rect && insideScreen(rect), `${name}: ${id} is off-screen`);
      }
      const miniRect = (await page.getByTestId("garden-mini-actions").boundingBox())!;
      const buildRect = (await page.getByTestId("garden-edit-toggle").boundingBox())!;
      const playRect = (await page.getByTestId("garden-play-button").boundingBox())!;
      const dockRect = (await page.getByTestId("main-tabs").boundingBox())!;
      assert.ok(!overlap(miniRect, buildRect), `${name}: mini buttons cover build button`);
      assert.ok(!overlap(playRect, dockRect), `${name}: play button covers bottom navigation`);
      const fullImage = (await page.getByTestId("garden-scene").boundingBox())!;
      await page.getByTestId("garden-zoom-out").click();
      assert.equal(
        await page.getByTestId("garden-zoom-level").textContent(),
        "75%",
      );
      assert.ok(
        (await page.getByTestId("garden-scene").boundingBox())!.width <
          fullImage.width,
      );
      await page.getByTestId("garden-reset-view").click();
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
      // The illustrated button image and its label must share the same
      // horizontal centre, regardless of an icon at the leading edge.
      const buildButton = (await page
        .getByTestId("garden-edit-toggle")
        .boundingBox())!;
      const buildLabel = (await page
        .getByTestId("garden-edit-toggle-label")
        .boundingBox())!;
      assert.ok(buildButton && buildLabel, `${name}: missing build button text`);
      assert.ok(
        Math.abs(
          buildLabel.x + buildLabel.width / 2 -
            (buildButton.x + buildButton.width / 2),
        ) <= 2,
        `${name}: build button label is not horizontally centred`,
      );
      assert.ok(
        buildLabel.y >= buildButton.y - 1 &&
          buildLabel.y + buildLabel.height <= buildButton.y + buildButton.height + 1,
        `${name}: build button text escapes artwork`,
      );
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
      await menu(page, "world");
      await capture(page, `${name}-world`);
      for (const area of [
        "cottage",
        "forest",
        "river",
        "village",
        "winterland",
      ]) {
        const row = (await page
          .getByTestId(`world-area-${area}`)
          .boundingBox())!;
        assert.ok(row.height <= 150, "World destinations must stay compact");
        assert.ok(
          (await page.getByTestId(`world-area-image-${area}`).boundingBox())!
            .width > 0,
        );
      }
      await page.getByTestId("world-area-winterland").scrollIntoViewIfNeeded();
      await menu(page, "quests");
      await capture(page, `${name}-quests`);
      assert.ok(
        (await page.getByTestId("quest-card-millie1").boundingBox())!.width >
          250,
        "Quest cards must use readable full-width rows",
      );
      await page.getByTestId("quest-card-millie6").scrollIntoViewIfNeeded();
      await page.getByRole("tab", { name: /Marmalade/ }).click();
      await page.getByTestId("quest-card-marmalade6").scrollIntoViewIfNeeded();

      await menu(page, "inventory");
      await capture(page, `${name}-inventory`);
      await menu(page, "decorations");
      await page.getByTestId("garden-build-screen").waitFor();
      await capture(page, `${name}-build`);
      await assertWholeGarden(page);
      for (const id of [
        "garden-zoom-in",
        "garden-zoom-out",
        "build-catalog-toggle",
      ]) {
        const box = (await page.getByTestId(id).boundingBox())!;
        assert.ok(
          box.x >= 0 &&
            box.y >= 0 &&
            box.x + box.width <= width + 1 &&
            box.y + box.height <= height + 1,
          `${name}: ${id} must stay on screen`,
        );
      }
      await page.getByTestId("build-catalog-toggle").click();
      assert.equal(await page.getByTestId("build-catalog").count(), 0);
      await page.getByTestId("garden-zoom-in").click();
      assert.equal(
        await page.getByTestId("garden-zoom-level").textContent(),
        "125%",
      );
      await page.getByTestId("garden-zoom-out").click();
      assert.equal(
        await page.getByTestId("garden-zoom-level").textContent(),
        "100%",
      );
      await capture(page, `${name}-build-fullscreen`);
      await page.getByTestId("garden-zoom-out").click();
      assert.equal(
        await page.getByTestId("garden-zoom-level").textContent(),
        "75%",
      );
      await page.getByTestId("garden-reset-view").click();
      await assertWholeGarden(page);

      assert.equal(await page.getByTestId("main-tabs").count(), 0);
      await page.getByRole("button", { name: "Færdig", exact: true }).click();
      await page.getByTestId("active-mini-match").click();
      await capture(page, `${name}-match`);
      await page.close();
    }
    // Screen-space drags must be converted back to garden coordinates at 200% zoom.
    const buildPage = await browser.newPage({
      viewport: { width: 844, height: 390 },
      hasTouch: true,
    });
    await seed(buildPage, {
      ...sample,
      economy: { ...sample.economy, inventory: ["flowers"] },
      placements: [{ id: "flowers", x: 50, y: 65 }],
    });
    await buildPage.getByTestId("garden-edit-toggle").click();
    await buildPage.getByTestId("build-catalog-toggle").click();
    for (let i = 0; i < 4; i++)
      await buildPage.getByTestId("garden-zoom-in").click();
    const zoomedScene = (await buildPage
      .getByTestId("garden-scene")
      .boundingBox())!;
    const flower = (await buildPage
      .getByTestId("garden-edit-flowers")
      .boundingBox())!;
    // The browser preview must not turn a native pinch into page magnification.
    await buildPage.getByTestId("garden-viewport").evaluate((element) => {
      element.style.touchAction = "none";
    });
    const touch = await buildPage.context().newCDPSession(buildPage);
    const center = {
      x: flower.x + flower.width / 2,
      y: flower.y + flower.height / 2,
    };
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [center],
    });
    for (let i = 1; i <= 10; i++) {
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: center.x + 8 * i, y: center.y }],
      });
      await buildPage.waitForTimeout(20);
    }
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await buildPage.waitForFunction(
      () => JSON.parse(localStorage.getItem("cozy.save")!).placements[0].x > 50,
    );
    const placement = await buildPage.evaluate(
      () => JSON.parse(localStorage.getItem("cozy.save")!).placements[0],
    );
    assert.ok(
      Math.abs(placement.x - (50 + (80 / zoomedScene.width) * 100)) < 0.2,
      "Zoomed drag must save garden coordinates",
    );
    assert.equal(placement.y, 65);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: 200, y: 180 },
        { x: 300, y: 180 },
      ],
    });
    for (let i = 1; i <= 5; i++) {
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          { x: 200 - 5 * i, y: 180 },
          { x: 300 + 5 * i, y: 180 },
        ],
      });
      await buildPage.waitForTimeout(20);
    }
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    const pinchZoom = Number(
      (await buildPage.getByTestId("garden-zoom-level").textContent())!.replace(
        "%",
        "",
      ),
    );
    assert.ok(
      pinchZoom > 200 && pinchZoom <= 280,
      "Two-finger pinch must increase the camera zoom within its bounds",
    );
    await buildPage.getByTestId("garden-reset-view").click();
    await capture(buildPage, "landscape-built-garden");
    await buildPage
      .getByRole("button", { name: "Færdig", exact: true })
      .click();
    await buildPage.getByTestId("garden-decoration-flowers").waitFor();
    await buildPage.reload({ waitUntil: "networkidle" });
    assert.deepEqual(
      await buildPage.evaluate(
        () => JSON.parse(localStorage.getItem("cozy.save")!).placements[0],
      ),
      placement,
    );
    await buildPage.close();
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
          screenshots: 59,
          drag: true,
          undo: true,
          saveReload: true,
          buildFullscreen: true,
          wholeOriginalImage: true,
          zoomBelow100: true,
          compactWorldRows: true,
          expandedQuestList: true,
          buildZoomDrag: true,
          buildPinch: true,
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
