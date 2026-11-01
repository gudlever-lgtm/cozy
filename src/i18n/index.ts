import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { da } from "./da";
import { en } from "./en";
export type Key = keyof typeof da;
export const resources = { da: { translation: da }, en: { translation: en } };
void i18next.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "da",
  interpolation: { escapeValue: false },
  initAsync: false,
  showSupportNotice: false,
});
export const number = (value: number, language: string) =>
  new Intl.NumberFormat(language).format(value);
export const date = (value: string, language: string) =>
  new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(
    new Date(value),
  );
export default i18next;
