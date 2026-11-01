/** Full card faces fit the measured dialog; no scrollable list can collapse between text blocks. */
export function stackPickerGeometry(width: number, height: number) {
  const padding = 13,
    gap = 8,
    header = 44,
    footer = 44;
  const areaHeight = Math.max(
    1,
    height - padding * 2 - header - footer - gap * 2,
  );
  const cardHeight = Math.min(180, areaHeight),
    cardWidth = cardHeight / 1.44;
  const columns = Math.max(
    1,
    Math.floor((width - padding * 2 + gap) / (cardWidth + gap)),
  );
  return {
    padding,
    gap,
    header,
    footer,
    areaHeight,
    cardHeight,
    cardWidth,
    perPage: columns,
  };
}
