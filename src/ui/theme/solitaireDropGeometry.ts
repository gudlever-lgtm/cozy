/** Board coordinates; a release outside the cards must never snap to an edge column. */
export function tableauColumnAt(x: number, firstX: number, cardWidth: number, gap: number, columns = 7): number | null {
  for (let col = 0; col < columns; col++) {
    const left = firstX + col * (cardWidth + gap);
    // A small gap tolerance makes narrow cards easier to drop without allowing
    // releases far away from the board to trigger unexpected moves.
    if (x >= left - gap / 2 && x <= left + cardWidth + gap / 2) return col;
  }
  return null;
}
