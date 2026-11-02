import { imagePoint } from "../living/model";
import type { DecorationId } from "../assets/decorations";
/** Art-directed ground anchors in the original cottage image, not player placement coordinates. */
export const DECORATION_ANCHORS = {
  forest: { x: 0.35, y: 0.76, width: 0.17, aspect: 1374 / 1145 },
  lantern: { x: 0.39, y: 0.8, width: 0.055, aspect: 1024 / 1536 },
  flowers: { x: 0.83, y: 0.88, width: 0.1, aspect: 1312 / 1199 },
  bench: { x: 0.72, y: 0.94, width: 0.16, aspect: 1.5 },
  bridge: { x: 0.5, y: 0.98, width: 0.15, aspect: 1.5 },
  birdhouse: { x: 0.61, y: 0.69, width: 0.105, aspect: 1 },
  teaTable: { x: 0.57, y: 0.84, width: 0.15, aspect: 1 },
} as const;
export function decorationLayout(
  id: DecorationId,
  width: number,
  height: number,
) {
  const a = DECORATION_ANCHORS[id];
  const scale = Math.max(width / 836, height / 470);
  const w = Math.min(a.width * 836 * scale, height * 0.32 * a.aspect);
  const h = w / a.aspect;
  const p = imagePoint(a, width, height);
  const x = Math.max(w / 2 + 2, Math.min(width - w / 2 - 2, p.x));
  const bottom = Math.max(h + 2, Math.min(height - 3, p.y));
  return { left: x - w / 2, top: bottom - h, width: w, height: h };
}
