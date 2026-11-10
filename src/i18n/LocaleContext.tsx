import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { strings, type Locale, type StringKey } from "./strings";
import { loadSavedLocale, saveLocale } from "./localePersistence";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: StringKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children, initialLocale = "da" as Locale }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    loadSavedLocale().then((saved) => {
      if (saved) setLocaleState(saved);
    });
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    saveLocale(next);
  };

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: (key) => strings[locale][key] }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
