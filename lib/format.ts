import type { Locale } from "./i18n";
import type { EtaBand } from "./sim/eta.ts";
import { ROUTES, type Stop } from "./sim/data.ts";

type T = (path: string, params?: Record<string, string | number>) => string;

/** Stop names stay as officially recorded; Bengali readers also get the Bengali spelling where one exists. */
export const stopName = (s: Stop, lang: Locale) => (lang === "bn" && s.bn ? s.bn : s.name);

/** "about 8 min", "12-18 min", "over 30 min", "Arriving now". */
export function etaText(band: EtaBand, t: T): string {
  switch (band.kind) {
    case "now":
      return t("common.arrivingNow");
    case "about":
      return t("common.about", { n: band.n });
    case "range":
      return t("common.range", { a: band.a, b: band.b });
    case "over":
      return t("common.over30");
  }
}

/** The big digits on the destination board and the unit beside them. */
export function boardEta(band: EtaBand | null, t: T): { value: string; unit: string } {
  if (!band) return { value: "--", unit: "" };
  const unit = t("board.min");
  switch (band.kind) {
    case "now":
      return { value: t("board.now"), unit: "" };
    case "about":
      return { value: String(band.n), unit };
    case "range":
      return { value: `${band.a}-${band.b}`, unit };
    case "over":
      return { value: "30+", unit };
  }
}

export const clock = (ts: number) => new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
export const clockSec = (ts: number) => new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
export const minutesBetween = (a: number, b: number) => Math.max(0, Math.round((b - a) / 60000));

/** A place name saved in English, shown in the reader's language where we have the spelling. */
export function placeName(routeId: string, name: string, lang: Locale): string {
  const stop = ROUTES[routeId]?.stops.find((s) => s.name === name);
  return stop ? stopName(stop, lang) : name;
}
