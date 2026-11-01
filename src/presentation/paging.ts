export function pageGeometry(width: number, height: number, headerHeight = 30) {
  const columns = width >= 480 ? 2 : 1;
  const gridHeight = Math.max(1, height - 16 - headerHeight - 44 - 16);
  const rows = Math.max(1, Math.min(2, Math.floor((gridHeight + 8) / 72)));
  return {
    columns,
    rows,
    perPage: columns * rows,
    gridHeight,
    cardHeight: (gridHeight - (rows - 1) * 8) / rows,
  };
}
