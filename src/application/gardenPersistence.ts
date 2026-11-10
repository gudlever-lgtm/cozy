import AsyncStorage from "@react-native-async-storage/async-storage";
import { gardenSnapshot, loadGardenSnapshot } from "../domain/garden/garden";
import type { GardenState } from "../domain/garden/types";

const GARDEN_SAVE_KEY = "cozy.garden.v1";

export async function loadSavedGarden(): Promise<GardenState | null> {
  try {
    const raw = await AsyncStorage.getItem(GARDEN_SAVE_KEY);
    return raw ? loadGardenSnapshot(raw) : null;
  } catch {
    return null;
  }
}

export async function saveGarden(state: GardenState): Promise<void> {
  try {
    await AsyncStorage.setItem(GARDEN_SAVE_KEY, gardenSnapshot(state));
  } catch {
    // ponytail: best-effort local save; a failed write just means next session replays
    // from the last successful snapshot instead of crashing the garden screen.
  }
}
