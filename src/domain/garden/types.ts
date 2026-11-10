export type Season = "spring" | "summer" | "autumn" | "winter";
export type SeasonMode = "manual" | "automatic";
export type CharacterId = "millie" | "marmalade";

export interface Viewport {
  readonly width: number;
  readonly height: number;
}

export interface SceneSize {
  readonly width: number;
  readonly height: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** zoom = screen pixels per scene unit. offsetX/offsetY = scene-space coordinate shown
 * at the viewport's top-left corner. Independent of actual screen resolution. */
export interface CameraState {
  readonly zoom: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

export interface CameraBounds {
  readonly viewport: Viewport;
  readonly scene: SceneSize;
  readonly minZoom: number;
  readonly maxZoom: number;
}

export interface DecorationSize {
  readonly width: number;
  readonly height: number;
}

/** x/y are normalized scene coordinates (0..1), independent of screen resolution. */
export interface Decoration {
  readonly id: string;
  readonly kind: string;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
}

export interface CharacterState {
  readonly id: CharacterId;
  readonly x: number;
  readonly y: number;
  readonly visible: boolean;
}

export interface GardenState {
  readonly camera: CameraState;
  readonly decorations: readonly Decoration[];
  readonly seasonMode: SeasonMode;
  readonly manualSeason: Season;
  readonly characters: readonly CharacterState[];
  readonly reducedMotion: boolean;
}

export interface PlacementResult {
  readonly state: GardenState;
  readonly ok: boolean;
  readonly reason?: string;
}
