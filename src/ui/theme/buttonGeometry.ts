/**
 * The approved button SVGs have a 440×110 viewBox. React Native SVG keeps the
 * viewBox aspect ratio (xMidYMid meet), so a wide, short Pressable can contain
 * transparent horizontal gutters. Label bounds must follow the *painted SVG*,
 * not the Pressable's full width.
 */
export function buttonLabelBounds(
  width: number,
  height: number,
  safeFractions: { readonly left: number; readonly right: number },
): { left: number; right: number } {
  const renderedWidth = Math.min(width, height * 4);
  const offset = (width - renderedWidth) / 2;
  return {
    left: offset + renderedWidth * safeFractions.left,
    right: offset + renderedWidth * safeFractions.right,
  };
}
