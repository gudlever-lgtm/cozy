/**
 * Shared design tokens for the cottage-garden redesign.
 * Colors are consolidated from the app's existing palette (warm cream,
 * forest green, honey/wood) plus the muted blue + floral accents from
 * cozy-redesign-reference.png.
 */
import { Platform } from "react-native";

export const colors = {
  // forest greens (primary brand / text on cream)
  forest: "#254b3a",
  forestDeep: "#18392f",
  leaf: "#345b49",
  leafSoft: "#3f6850",
  sage: "#7a8e72",

  // warm cream / paper (panels, dialogs, menus)
  cream: "#f6f2e8",
  creamPanel: "#fff8eaf8",
  creamPanelSolid: "#faf7ec",
  creamTile: "#fff9ee",
  paper: "#fcfaf2",

  // honey / wood (borders, wood-sign accents, buttons)
  wood: "#8a5a2b",
  woodDark: "#6b4420",
  honey: "#e8b85c",
  honeyDeep: "#d4bc86",
  tan: "#d2c295",

  // muted blue (sky / secondary accent, from reference)
  skyMuted: "#9db8c9",

  // bloom accents (small flower-color highlights)
  bloomPink: "#e39fb0",
  bloomLilac: "#b79fd6",

  // status
  success: "#4f8a5b",
  warning: "#c97a3a",
  danger: "#b35454",

  // scrims / overlays
  scrim: "#18392f88",
  overlay: "#1b342a88",

  ink: "#2c4e3b",
  inkMuted: "#69745e",
  inkFaint: "#8a946e",
  onPrimary: "#fffbed",
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const shadow = {
  soft: {
    shadowColor: colors.forestDeep,
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  lifted: {
    shadowColor: colors.forestDeep,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
} as const;

export const typography = {
  display: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: colors.ink,
  },
} as const;
