/**
 * Geometry measured directly from the approved SVG source files (their own rect/path
 * coordinates), not invented and not asked of the owner — this is purely "where are the
 * corner ornaments so the 9-slice cut doesn't clip them", not a design decision.
 * Re-measure if the source files are ever replaced.
 */
export const panelGeometry = {
  intrinsicWidth: 720,
  intrinsicHeight: 900,
  // Flower ornaments sit within ~0-108px of each edge; 140 gives them margin.
  inset: 140,
};

export const panelWideGeometry = {
  intrinsicWidth: 820,
  intrinsicHeight: 360,
  inset: 100,
};

export const tabBackgroundGeometry = {
  intrinsicWidth: 600,
  intrinsicHeight: 106,
  // Flower ornaments sit within ~0-40px of the left/right edges; 90 gives them margin.
  inset: 90,
};
