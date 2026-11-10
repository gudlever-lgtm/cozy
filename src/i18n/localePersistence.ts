import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Locale } from "./strings";

const STORAGE_KEY = "cozy.locale.v1";

export async function loadSavedLocale(): Promise<Locale | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw === "da" || raw === "en" ? raw : null;
  } catch {
    return null;
  }
}

export async function saveLocale(locale: Locale): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ponytail: best-effort local save, same tradeoff as the other persistence modules.
  }
}
