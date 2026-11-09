/** Camera coordinates are screen pixels; placements remain on the original image plane. */
export function gardenCameraFit(
  viewport: { width: number; height: number },
  image: { width: number; height: number },
) {
  return viewport.width > 0 && viewport.height > 0
    ? Math.min(viewport.width / image.width, viewport.height / image.height)
    : 0;
}
export function gardenPanLimits(
  viewport: { width: number; height: number },
  image: { width: number; height: number },
  zoom: number,
) {
  const scale = gardenCameraFit(viewport, image) * zoom;
  return {
    x: Math.max(0, (image.width * scale - viewport.width) / 2),
    y: Math.max(0, (image.height * scale - viewport.height) / 2),
  };
}

/** Keep the zoomed garden inside the viewport while following a finger drag. */
export function gardenPanBy(
  viewport: { width: number; height: number },
  image: { width: number; height: number },
  zoom: number,
  x: number,
  y: number,
  deltaX: number,
  deltaY: number,
) {
  const limits = gardenPanLimits(viewport, image, zoom);
  const clamp = (value: number, limit: number) =>
    Math.max(-limit, Math.min(limit, value));
  return {
    x: clamp(x + deltaX, limits.x),
    y: clamp(y + deltaY, limits.y),
  };
}
