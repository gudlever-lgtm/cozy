/** Keep the illustrated corners intact even when a content-sized panel is short. */
export function nineSliceScale(width: number, intrinsicWidth: number, height: number, topInset: number, bottomInset: number): number {
  if (width <= 0 || intrinsicWidth <= 0 || height <= 0) return 0;
  const byWidth = width / intrinsicWidth;
  const verticalInsets = topInset + bottomInset;
  return verticalInsets > 0 ? Math.min(byWidth, height / verticalInsets) : byWidth;
}
