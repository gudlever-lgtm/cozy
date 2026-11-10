import { fitCamera } from "./camera";
import type {
  CameraBounds,
  CharacterId,
  CharacterState,
  Decoration,
  DecorationSize,
  GardenState,
  PlacementResult,
  Season,
  SeasonMode,
} from "./types";

const DEFAULT_CHARACTERS: readonly CharacterState[] = [
  { id: "millie", x: 0.3, y: 0.7, visible: true },
  { id: "marmalade", x: 0.6, y: 0.75, visible: true },
];

export function createGarden(bounds: CameraBounds): GardenState {
  return {
    camera: fitCamera(bounds),
    decorations: [],
    seasonMode: "automatic",
    manualSeason: "spring",
    characters: DEFAULT_CHARACTERS,
    reducedMotion: false,
  };
}

function withinUnitSquare(x: number, y: number, size: DecorationSize): boolean {
  const halfW = size.width / 2;
  const halfH = size.height / 2;
  return x - halfW >= 0 && x + halfW <= 1 && y - halfH >= 0 && y + halfH <= 1;
}

export function placeDecoration(state: GardenState, decoration: Decoration, size: DecorationSize): PlacementResult {
  if (state.decorations.some((d) => d.id === decoration.id)) {
    return { state, ok: false, reason: "duplicate-id" };
  }
  if (!withinUnitSquare(decoration.x, decoration.y, size)) {
    return { state, ok: false, reason: "out-of-bounds" };
  }
  const normalized: Decoration = { ...decoration, rotation: normalizeDegrees(decoration.rotation) };
  return { state: { ...state, decorations: [...state.decorations, normalized] }, ok: true };
}

export function moveDecoration(state: GardenState, id: string, x: number, y: number, size: DecorationSize): PlacementResult {
  const existing = state.decorations.find((d) => d.id === id);
  if (!existing) return { state, ok: false, reason: "not-found" };
  if (!withinUnitSquare(x, y, size)) return { state, ok: false, reason: "out-of-bounds" };
  const decorations = state.decorations.map((d) => (d.id === id ? { ...d, x, y } : d));
  return { state: { ...state, decorations }, ok: true };
}

function normalizeDegrees(degrees: number): number {
  const mod = degrees % 360;
  return mod < 0 ? mod + 360 : mod;
}

export function rotateDecoration(state: GardenState, id: string, degrees: number): PlacementResult {
  const existing = state.decorations.find((d) => d.id === id);
  if (!existing) return { state, ok: false, reason: "not-found" };
  const decorations = state.decorations.map((d) => (d.id === id ? { ...d, rotation: normalizeDegrees(degrees) } : d));
  return { state: { ...state, decorations }, ok: true };
}

export function removeDecoration(state: GardenState, id: string): PlacementResult {
  if (!state.decorations.some((d) => d.id === id)) return { state, ok: false, reason: "not-found" };
  return { state: { ...state, decorations: state.decorations.filter((d) => d.id !== id) }, ok: true };
}

export function setSeasonManual(state: GardenState, season: Season): GardenState {
  return { ...state, seasonMode: "manual", manualSeason: season };
}

export function setSeasonAutomatic(state: GardenState): GardenState {
  return { ...state, seasonMode: "automatic" };
}

function automaticSeasonFor(now: Date): Season {
  const month = now.getUTCMonth(); // 0 = January
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

/** Deterministic given (state, now): never reads the system clock itself, so the same
 * inputs always resolve to the same season. */
export function currentSeason(state: GardenState, now: Date): Season {
  return state.seasonMode === "manual" ? state.manualSeason : automaticSeasonFor(now);
}

export function setReducedMotion(state: GardenState, reducedMotion: boolean): GardenState {
  return { ...state, reducedMotion };
}

export function characterAnimation(state: GardenState, characterId: CharacterId): "idle" | "none" {
  if (state.reducedMotion) return "none";
  return state.characters.some((c) => c.id === characterId && c.visible) ? "idle" : "none";
}

export function gardenSnapshot(state: GardenState): string {
  return JSON.stringify(state);
}

export function loadGardenSnapshot(json: string): GardenState {
  return JSON.parse(json) as GardenState;
}
