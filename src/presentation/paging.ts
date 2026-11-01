export function pageGeometry(width: number, height: number) {
  const columns = width >= 480 ? 2 : 1;
  const gridHeight = Math.max(1, height - 16 - 30 - 44 - 16);
  const rows = Math.max(1, Math.min(2, Math.floor((gridHeight + 8) / 80)));
  return {
    columns,
    rows,
    perPage: columns * rows,
    gridHeight,
    cardHeight: (gridHeight - (rows - 1) * 8) / rows,
  };
}
