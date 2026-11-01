/** One orthogonal neighbour per deliberate swipe; never wrap across an edge. */
export function swipeNeighbour(
  index: number,
  dx: number,
  dy: number,
  size: number,
): number | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < Math.max(12, size * 0.24))
    return null;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const x = (index % 6) + (horizontal ? Math.sign(dx) : 0);
  const y = Math.floor(index / 6) + (horizontal ? 0 : Math.sign(dy));
  return x < 0 || x > 5 || y < 0 || y > 5 ? null : y * 6 + x;
}
