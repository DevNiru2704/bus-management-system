"use client";

import { createContext, useContext, useMemo } from "react";
import { makeT, type Locale } from "@/lib/i18n";

type Ctx = { lang: Locale; t: ReturnType<typeof makeT> };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ lang, dict, children }: { lang: Locale; dict: unknown; children: React.ReactNode }) {
  const value = useMemo(() => ({ lang, t: makeT(dict) }), [lang, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
