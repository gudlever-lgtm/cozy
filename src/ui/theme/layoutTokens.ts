// Single source of truth: the owner-approved implementation baseline at
// docs/ui-layout-tokens.v3.json. Never hardcode a duplicate of these numbers elsewhere.
import tokens from "../../../docs/ui-layout-tokens.v3.json";

export const layoutTokens = tokens;

export const breakpoints = tokens.breakpoints;
export const minTouchSize = tokens.minTouchSize;
export const buttonTokens = tokens.buttons;
export const bottomTabTokens = tokens.bottomTab;
export const dialogTokens = tokens.dialog;
export const hudChipTokens = tokens.hudChip;
export const cardTokens = tokens.card;
export const gardenTokens = tokens.garden;
