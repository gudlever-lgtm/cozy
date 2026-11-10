import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadSnapshot, snapshot } from "../domain/solitaire/engine";
import type { GameState } from "../domain/solitaire/types";

const SOLITAIRE_SAVE_KEY = "cozy.solitaire.v1";

export async function loadSavedGame(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(SOLITAIRE_SAVE_KEY);
    return raw ? loadSnapshot(raw) : null;
  } catch {
    return null;
  }
}

export async function saveGame(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(SOLITAIRE_SAVE_KEY, snapshot(state));
  } catch {
    // ponytail: best-effort local save, same tradeoff as gardenPersistence.
  }
}

export async function clearSavedGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SOLITAIRE_SAVE_KEY);
  } catch {
    // no-op
  }
}
