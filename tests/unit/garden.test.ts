import assert from "node:assert/strict";
import test from "node:test";
import { fitCamera, minCoverZoom, pan, pinchZoom } from "../../src/domain/garden/camera";
import {
  characterAnimation,
  createGarden,
  currentSeason,
  gardenSnapshot,
  loadGardenSnapshot,
  moveDecoration,
  placeDecoration,
  removeDecoration,
  rotateDecoration,
  setReducedMotion,
  setSeasonAutomatic,
  setSeasonManual,
} from "../../src/domain/garden/garden";
import type { CameraBounds } from "../../src/domain/garden/types";

const BOUNDS: CameraBounds = {
  viewport: { width: 360, height: 800 },
  scene: { width: 720, height: 1280 },
  minZoom: 0.3,
  maxZoom: 3,
};

test("camera fits the viewport to cover the scene with no empty space", () => {
  const camera = fitCamera(BOUNDS);
  assert.equal(camera.zoom, minCoverZoom(BOUNDS));
  assert.ok(camera.offsetX >= 0 && camera.offsetY >= 0);
});

test("pan is bounded so the viewport never shows outside the scene", () => {
  const camera = fitCamera(BOUNDS);
  const panned = pan(camera, { x: -1_000_000, y: -1_000_000 }, BOUNDS);
  const maxOffsetX = BOUNDS.scene.width - BOUNDS.viewport.width / panned.zoom;
  const maxOffsetY = BOUNDS.scene.height - BOUNDS.viewport.height / panned.zoom;
  assert.ok(panned.offsetX <= maxOffsetX + 1e-9 && panned.offsetX >= -1e-9);
  assert.ok(panned.offsetY <= maxOffsetY + 1e-9 && panned.offsetY >= -1e-9);
});

test("pinch zoom keeps the scene point under the focal point fixed on screen", () => {
  const bounds: CameraBounds = { viewport: { width: 360, height: 800 }, scene: { width: 2000, height: 3000 }, minZoom: 0.1, maxZoom: 5 };
  const camera = { zoom: 1, offsetX: 500, offsetY: 500 };
  const focal = { x: 100, y: 200 };

  const sceneFocalBefore = { x: camera.offsetX + focal.x / camera.zoom, y: camera.offsetY + focal.y / camera.zoom };
  const zoomed = pinchZoom(camera, focal, 2, bounds);
  const sceneFocalAfter = { x: zoomed.offsetX + focal.x / zoomed.zoom, y: zoomed.offsetY + focal.y / zoomed.zoom };

  assert.ok(Math.abs(sceneFocalAfter.x - sceneFocalBefore.x) < 1e-9);
  assert.ok(Math.abs(sceneFocalAfter.y - sceneFocalBefore.y) < 1e-9);
  assert.equal(zoomed.zoom, 2);
});

test("zoom is clamped to [minZoom, maxZoom]", () => {
  const bounds: CameraBounds = { viewport: { width: 100, height: 100 }, scene: { width: 1000, height: 1000 }, minZoom: 0.5, maxZoom: 2 };
  const camera = { zoom: 1, offsetX: 0, offsetY: 0 };
  const zoomedOut = pinchZoom(camera, { x: 0, y: 0 }, 0.01, bounds);
  assert.equal(zoomedOut.zoom, 0.5);
  const zoomedIn = pinchZoom(camera, { x: 0, y: 0 }, 100, bounds);
  assert.equal(zoomedIn.zoom, 2);
});

const SIZE = { width: 0.1, height: 0.1 };

test("decorations place, move, rotate and remove with normalized coordinates", () => {
  let garden = createGarden(BOUNDS);

  const placed = placeDecoration(garden, { id: "bench-1", kind: "bench", x: 0.5, y: 0.5, rotation: 0 }, SIZE);
  assert.equal(placed.ok, true);
  garden = placed.state;
  assert.equal(garden.decorations.length, 1);

  const moved = moveDecoration(garden, "bench-1", 0.2, 0.2, SIZE);
  assert.equal(moved.ok, true);
  garden = moved.state;
  assert.equal(garden.decorations[0].x, 0.2);

  const rotated = rotateDecoration(garden, "bench-1", 450); // normalizes to 90
  assert.equal(rotated.ok, true);
  garden = rotated.state;
  assert.equal(garden.decorations[0].rotation, 90);

  const removed = removeDecoration(garden, "bench-1");
  assert.equal(removed.ok, true);
  assert.equal(removed.state.decorations.length, 0);
});

test("placement is rejected when the hitbox would fall outside the scene", () => {
  const garden = createGarden(BOUNDS);
  const result = placeDecoration(garden, { id: "lantern-1", kind: "lantern", x: 0.02, y: 0.5, rotation: 0 }, SIZE);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "out-of-bounds");
  assert.equal(result.state.decorations.length, 0);
});

test("placing a duplicate id is rejected without mutating state", () => {
  let garden = createGarden(BOUNDS);
  garden = placeDecoration(garden, { id: "pot-1", kind: "flower-pot", x: 0.5, y: 0.5, rotation: 0 }, SIZE).state;
  const before = garden;
  const again = placeDecoration(garden, { id: "pot-1", kind: "flower-pot", x: 0.3, y: 0.3, rotation: 0 }, SIZE);
  assert.equal(again.ok, false);
  assert.equal(again.state, before);
});

test("moving or rotating an unknown decoration fails without mutating state", () => {
  const garden = createGarden(BOUNDS);
  const moveResult = moveDecoration(garden, "missing", 0.5, 0.5, SIZE);
  assert.equal(moveResult.ok, false);
  assert.equal(moveResult.state, garden);

  const rotateResult = rotateDecoration(garden, "missing", 10);
  assert.equal(rotateResult.ok, false);
  assert.equal(rotateResult.state, garden);
});

test("season resolves deterministically from an injected date, not the system clock", () => {
  const garden = createGarden(BOUNDS);
  assert.equal(currentSeason(garden, new Date("2026-01-15T00:00:00Z")), "winter");
  assert.equal(currentSeason(garden, new Date("2026-04-15T00:00:00Z")), "spring");
  assert.equal(currentSeason(garden, new Date("2026-07-15T00:00:00Z")), "summer");
  assert.equal(currentSeason(garden, new Date("2026-10-15T00:00:00Z")), "autumn");
});

test("manual season override ignores the date until automatic mode is restored", () => {
  let garden = createGarden(BOUNDS);
  garden = setSeasonManual(garden, "winter");
  assert.equal(currentSeason(garden, new Date("2026-07-01T00:00:00Z")), "winter");
  garden = setSeasonAutomatic(garden);
  assert.equal(currentSeason(garden, new Date("2026-07-01T00:00:00Z")), "summer");
});

test("Millie and Marmalade are visible by default; reduced motion disables ambient animation", () => {
  let garden = createGarden(BOUNDS);
  assert.equal(characterAnimation(garden, "millie"), "idle");
  assert.equal(characterAnimation(garden, "marmalade"), "idle");

  garden = setReducedMotion(garden, true);
  assert.equal(characterAnimation(garden, "millie"), "none");
  assert.equal(characterAnimation(garden, "marmalade"), "none");
});

test("garden save/load round-trips to an equal state (offline save, no hidden loss)", () => {
  let garden = createGarden(BOUNDS);
  garden = placeDecoration(garden, { id: "bench-1", kind: "bench", x: 0.5, y: 0.5, rotation: 45 }, SIZE).state;
  garden = setSeasonManual(garden, "autumn");
  const restored = loadGardenSnapshot(gardenSnapshot(garden));
  assert.deepEqual(restored, garden);
});
