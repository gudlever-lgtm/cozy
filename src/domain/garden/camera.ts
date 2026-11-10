import type { CameraBounds, CameraState, Point } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** The minimum zoom that still covers the viewport with scene content (no empty
 * space outside the background art). */
export function minCoverZoom(bounds: Pick<CameraBounds, "viewport" | "scene">): number {
  return Math.max(bounds.viewport.width / bounds.scene.width, bounds.viewport.height / bounds.scene.height);
}

function clampPan(camera: CameraState, bounds: CameraBounds): CameraState {
  const maxOffsetX = Math.max(0, bounds.scene.width - bounds.viewport.width / camera.zoom);
  const maxOffsetY = Math.max(0, bounds.scene.height - bounds.viewport.height / camera.zoom);
  return {
    zoom: camera.zoom,
    offsetX: clamp(camera.offsetX, 0, maxOffsetX),
    offsetY: clamp(camera.offsetY, 0, maxOffsetY),
  };
}

export function fitCamera(bounds: CameraBounds): CameraState {
  const zoom = clamp(minCoverZoom(bounds), bounds.minZoom, bounds.maxZoom);
  return clampPan({ zoom, offsetX: 0, offsetY: 0 }, { ...bounds, minZoom: zoom, maxZoom: zoom });
}

/** Pans by a screen-space delta (e.g. a drag gesture), bounded so the viewport never
 * shows outside the scene. */
export function pan(camera: CameraState, deltaScreen: Point, bounds: CameraBounds): CameraState {
  const moved: CameraState = {
    zoom: camera.zoom,
    offsetX: camera.offsetX - deltaScreen.x / camera.zoom,
    offsetY: camera.offsetY - deltaScreen.y / camera.zoom,
  };
  return clampPan(moved, bounds);
}

/** Zooms by scaleFactor around a screen-space focal point (pinch gesture), keeping the
 * scene point under that focal point fixed on screen before applying pan bounds. */
export function pinchZoom(camera: CameraState, focalScreen: Point, scaleFactor: number, bounds: CameraBounds): CameraState {
  const newZoom = clamp(camera.zoom * scaleFactor, bounds.minZoom, bounds.maxZoom);
  const sceneFocal: Point = {
    x: camera.offsetX + focalScreen.x / camera.zoom,
    y: camera.offsetY + focalScreen.y / camera.zoom,
  };
  const zoomed: CameraState = {
    zoom: newZoom,
    offsetX: sceneFocal.x - focalScreen.x / newZoom,
    offsetY: sceneFocal.y - focalScreen.y / newZoom,
  };
  return clampPan(zoomed, bounds);
}
