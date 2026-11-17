import "server-only";
import type { Locale } from "@/lib/i18n";
import en from "@/dictionaries/en.json";

export type Dict = typeof en;

// bn and hi must have exactly the same keys as en, or this file fails to type-check.
const loaders: Record<Locale, () => Promise<Dict>> = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  bn: () => import("@/dictionaries/bn.json").then((m) => m.default),
  hi: () => import("@/dictionaries/hi.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => loaders[locale]();
