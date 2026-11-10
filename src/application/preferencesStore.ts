import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DrawMode } from "../domain/solitaire/types";
import type { Season } from "../domain/garden/types";
import type { AvatarKey } from "../ui/theme/avatarKeys";

export type CardFaceStyle = "blank" | "botanical" | "woodland";
export type CardBackStyle = "botanical" | "stars" | "woodland";
export type SeasonOverride = "automatic" | Season;

export interface Preferences {
  readonly faceStyle: CardFaceStyle;
  readonly backStyle: CardBackStyle;
  readonly drawMode: DrawMode;
  readonly reducedMotion: boolean;
  readonly playerName: string;
  readonly avatarKey: AvatarKey;
  readonly seasonOverride: SeasonOverride;
}

export const DEFAULT_PREFERENCES: Preferences = {
  faceStyle: "botanical",
  backStyle: "botanical",
  drawMode: 1,
  reducedMotion: false,
  playerName: "",
  avatarKey: "cat",
  seasonOverride: "automatic",
};

const STORAGE_KEY = "cozy.preferences.v1";

export async function loadPreferences(): Promise<Preferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(preferences: Preferences): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // ponytail: best-effort local save, same tradeoff as the other persistence modules.
  }
}
