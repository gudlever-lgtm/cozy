import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_PREFERENCES, loadPreferences, savePreferences, type Preferences } from "../../application/preferencesStore";

interface PreferencesContextValue {
  preferences: Preferences;
  setPreferences: (update: Partial<Preferences>) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/**
 * Card face/back theme, draw mode and motion preference, persisted locally.
 * Changing these NEVER touches an in-progress Solitaire GameState — they are a pure
 * rendering/config concern read by the screen, never written into domain state.
 */
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    loadPreferences().then(setPreferencesState);
  }, []);

  const setPreferences = (update: Partial<Preferences>) => {
    setPreferencesState((prev) => {
      const next = { ...prev, ...update };
      savePreferences(next);
      return next;
    });
  };

  const value = useMemo(() => ({ preferences, setPreferences }), [preferences]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within a PreferencesProvider");
  return ctx;
}
