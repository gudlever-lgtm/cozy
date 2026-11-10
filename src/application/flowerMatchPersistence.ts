import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FlowerMatchState } from "../domain/minigames/flowerMatch";

const STORAGE_KEY = "cozy.minigame.flowerMatch.v1";

export interface SavedFlowerMatch {
  readonly state: FlowerMatchState;
  readonly sessionId: string;
}

export async function loadSavedFlowerMatch(): Promise<SavedFlowerMatch | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedFlowerMatch) : null;
  } catch {
    return null;
  }
}

export async function saveFlowerMatch(saved: SavedFlowerMatch): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // ponytail: best-effort local save, same tradeoff as the other persistence modules.
  }
}

export async function clearSavedFlowerMatch(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
